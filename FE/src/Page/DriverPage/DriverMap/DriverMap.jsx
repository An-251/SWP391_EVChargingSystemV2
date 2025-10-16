import { useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import MapController from './components/MapController';
import RoutePolyline from './components/RoutePolyline';
import StationMarker from './components/StationMarker';
import { 
  createCustomIcon, 
  userLocationIcon, 
  DEFAULT_CENTER, 
  normalizeLocation 
} from './mapUtils';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function DriverMap({ stations = [], selectedStation, userLocation, onStationSelect }) {
  const mapRef = useRef(null);
  const [activeMarker, setActiveMarker] = useState(null);

  // Map center based on user location or default
  const center = normalizeLocation(userLocation) || DEFAULT_CENTER;

  // Handle marker click
  const handleMarkerClick = (station) => {
    setActiveMarker(station.id);
    if (onStationSelect) {
      onStationSelect(station);
    }
  };

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={center}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        ref={mapRef}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController center={center} selectedStation={selectedStation} />

        {/* User location marker */}
        {userLocation && (
          <Marker
            position={normalizeLocation(userLocation)}
            icon={userLocationIcon}
          >
            <Popup>
              <div className="text-sm font-semibold">Vị trí của bạn</div>
            </Popup>
          </Marker>
        )}

        {/* Charging station markers */}
        {stations.map((station) => (
          <StationMarker
            key={station.id}
            station={station}
            isActive={activeMarker === station.id}
            onMarkerClick={handleMarkerClick}
            icon={createCustomIcon('#10B981', station.availableSlots > 0)}
          />
        ))}

        {/* Route polyline */}
        {selectedStation && userLocation && (
          <RoutePolyline
            userLocation={userLocation}
            destination={selectedStation.coordinates}
          />
        )}
      </MapContainer>
    </div>
  );
}

export default DriverMap;
