import { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { message } from 'antd';

import MapController from './components/MapController';
import RoutePolyline from './components/RoutePolyline';
import StationMarker from './components/StationMarker';
import StationFilters from './components/StationFilters';
import StationPopup from './components/StationPopup';
import { 
  createCustomIcon, 
  userLocationIcon, 
  DEFAULT_CENTER, 
  normalizeLocation 
} from './mapUtils';
import { 
  fetchStations, 
  setSelectedStation, 
  clearSelectedStation 
} from '../../../redux/station/stationSlice';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function DriverMap() {
  const dispatch = useDispatch();
  const mapRef = useRef(null);
  const [activeMarker, setActiveMarker] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favoriteStations');
    return saved ? JSON.parse(saved) : [];
  });

  // Get data from Redux
  const { stations, selectedStation, loading, error, filters } = useSelector(
    (state) => state.station
  );

  // Ensure stations is always an array
  const stationsList = Array.isArray(stations) ? stations : [];

  // Fetch stations on mount
  useEffect(() => {
    console.log('🗺️ [DriverMap] Fetching stations...');
    dispatch(fetchStations());
  }, [dispatch]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          console.log('📍 [DriverMap] User location:', position.coords);
        },
        (error) => {
          console.warn('⚠️ [DriverMap] Location error:', error);
          message.warning('Không thể lấy vị trí của bạn. Sử dụng vị trí mặc định.');
        }
      );
    }
  }, []);

  // Show error if any
  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  // Filter stations based on filters
  const filteredStations = stationsList.filter((station) => {
    // Filter by connector type
    if (filters.connectorType) {
      const hasConnector = station.chargingPoints?.some(
        (cp) => cp.connectorType === filters.connectorType
      );
      if (!hasConnector) return false;
    }

    // Filter by power level
    if (filters.powerLevel) {
      const hasRequiredPower = station.chargingPoints?.some(
        (cp) => cp.powerOutput >= filters.powerLevel
      );
      if (!hasRequiredPower) return false;
    }

    // Filter by availability
    if (filters.availability === 'available') {
      const hasAvailable = station.chargingPoints?.some(
        (cp) => cp.status === 'AVAILABLE'
      );
      if (!hasAvailable) return false;
    } else if (filters.availability === 'busy') {
      const allBusy = station.chargingPoints?.every(
        (cp) => cp.status !== 'AVAILABLE'
      );
      if (!allBusy) return false;
    }

    // Filter by distance (if user location available)
    if (filters.maxDistance && userLocation) {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        station.latitude,
        station.longitude
      );
      if (distance > filters.maxDistance) return false;
    }

    // Filter by rating
    if (filters.minRating > 0) {
      const rating = station.rating || 0;
      if (rating < filters.minRating) return false;
    }

    return true;
  });

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Map center based on user location or default
  const center = normalizeLocation(userLocation) || DEFAULT_CENTER;

  // Handle marker click
  const handleMarkerClick = (station) => {
    setActiveMarker(station.id);
    dispatch(setSelectedStation(station));
  };

  // Handle booking
  const handleBook = (station) => {
    console.log('📅 [DriverMap] Booking station:', station);
    message.info('Booking feature coming soon!');
    // TODO: Open booking modal
  };

  // Handle get directions
  const handleGetDirections = (station) => {
    if (station.latitude && station.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`;
      window.open(url, '_blank');
    } else {
      message.warning('Không có tọa độ trạm sạc');
    }
  };

  // Handle toggle favorite
  const handleToggleFavorite = (stationId) => {
    setFavorites((prev) => {
      const newFavorites = prev.includes(stationId)
        ? prev.filter((id) => id !== stationId)
        : [...prev, stationId];
      
      localStorage.setItem('favoriteStations', JSON.stringify(newFavorites));
      message.success(
        prev.includes(stationId)
          ? 'Removed from favorites'
          : 'Added to favorites'
      );
      return newFavorites;
    });
  };

  if (loading && stationsList.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading charging stations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {/* Filter Panel */}
      <StationFilters />

      {/* Station Count Badge */}
      <div className="absolute top-4 right-4 z-[1000] bg-white px-4 py-2 rounded-lg shadow-lg">
        <span className="text-sm font-medium text-gray-600">
          Showing{' '}
          <span className="text-green-600 font-bold">{filteredStations.length}</span>{' '}
          of {stationsList.length} stations
        </span>
      </div>

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
        {filteredStations.map((station) => {
          const availableCount = station.chargingPoints?.filter(
            (cp) => cp.status === 'AVAILABLE'
          ).length || 0;

          return (
            <Marker
              key={station.id}
              position={[station.latitude, station.longitude]}
              icon={createCustomIcon('#10B981', availableCount > 0)}
              eventHandlers={{
                click: () => handleMarkerClick(station),
              }}
            >
              <Popup maxWidth={320} className="station-popup">
                <StationPopup
                  station={station}
                  onBook={() => handleBook(station)}
                  onGetDirections={() => handleGetDirections(station)}
                  onToggleFavorite={() => handleToggleFavorite(station.id)}
                  isFavorite={favorites.includes(station.id)}
                />
              </Popup>
            </Marker>
          );
        })}

        {/* Route polyline */}
        {selectedStation && userLocation && selectedStation.latitude && selectedStation.longitude && (
          <RoutePolyline
            userLocation={userLocation}
            destination={{ lat: selectedStation.latitude, lng: selectedStation.longitude }}
          />
        )}
      </MapContainer>

      {/* No Results Message */}
      {filteredStations.length === 0 && stationsList.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white px-6 py-4 rounded-lg shadow-xl pointer-events-auto">
            <p className="text-gray-600 text-center">
              No stations match your filters.
              <br />
              <button
                onClick={() => dispatch({ type: 'station/resetFilters' })}
                className="text-green-600 hover:underline font-medium mt-2"
              >
                Reset filters
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default DriverMap;
