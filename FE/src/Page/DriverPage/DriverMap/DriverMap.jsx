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
import BookingModal from './components/BookingModal';
import NavigationPanel from './components/NavigationPanel';
import { CHARGING_POINT_STATUS } from '../../../constants/statusConstants';
import { 
  createCustomIcon, 
  userLocationIcon, 
  DEFAULT_CENTER, 
  normalizeLocation,
  getSimpleRoute 
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
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedStationForBooking, setSelectedStationForBooking] = useState(null);
  const [routePolyline, setRoutePolyline] = useState(null);
  const [navigationMode, setNavigationMode] = useState(false);
  const [navigationInfo, setNavigationInfo] = useState(null);
  const [navigationDestination, setNavigationDestination] = useState(null);
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
    dispatch(fetchStations());
  }, [dispatch]);

  // Debug: Log stations data structure
  useEffect(() => {
    if (stationsList.length > 0) {
      console.log('🏢 Total stations loaded:', stationsList.length);
      const firstPoint = stationsList[0]?.chargingPoints?.[0];
      console.log('🔌 First charging point:', firstPoint);
      console.log('🔌 Chargers in point:', firstPoint?.chargers);
    }
  }, [stationsList]);

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
    // Filter by connector type - check inside chargers array
    if (filters.connectorType) {
      if (!station.chargingPoints || station.chargingPoints.length === 0) {
        return false;
      }
      
      const hasConnector = station.chargingPoints.some((cp) => {
        // Check if charging point has chargers array
        if (!cp.chargers || cp.chargers.length === 0) {
          return false;
        }
        
        // Check if any charger has matching connector type
        return cp.chargers.some((charger) => {
          const chargerType = (charger.connectorType || '').trim();
          const filterType = filters.connectorType.trim();
          return chargerType.toLowerCase() === filterType.toLowerCase();
        });
      });
      
      if (!hasConnector) return false;
    }

    // Filter by power level
    if (filters.powerLevel) {
      const hasRequiredPower = station.chargingPoints?.some(
        (cp) => cp.powerOutput >= filters.powerLevel
      );
      if (!hasRequiredPower) return false;
    }

    // Filter by availability (Backend uses lowercase status)
    if (filters.availability === 'available') {
      const hasAvailable = station.chargingPoints?.some(
        (cp) => (cp.status || '').toLowerCase() === CHARGING_POINT_STATUS.ACTIVE
      );
      if (!hasAvailable) return false;
    } else if (filters.availability === 'busy') {
      const allBusy = station.chargingPoints?.every(
        (cp) => (cp.status || '').toLowerCase() !== CHARGING_POINT_STATUS.ACTIVE
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

  // Handle booking (reservation)
  const handleBook = (station) => {
    const stationName = station.stationName || station.name || 'Trạm sạc';
    console.log('📅 [DriverMap] Opening booking modal for:', stationName);
    setSelectedStationForBooking(station);
    setBookingModalVisible(true);
    
    // Calculate and display route if user location is available
    if (userLocation && station.latitude && station.longitude) {
      const routeData = getSimpleRoute(
        userLocation,
        { lat: station.latitude, lng: station.longitude }
      );
      setRoutePolyline(routeData.route);
      console.log('🗺️ [DriverMap] Route calculated:', routeData);
    }
  };

  // Handle get directions - NOW WORKS IN-APP!
  const handleGetDirections = (station) => {
    if (!userLocation) {
      message.warning('Không thể lấy vị trí của bạn. Vui lòng bật GPS.');
      return;
    }
    
    const stationName = station.stationName || station.name || 'Trạm sạc';
    
    if (station.latitude && station.longitude) {
      console.log('🧭 [DriverMap] Starting navigation to:', stationName);
      
      // Enable navigation mode
      setNavigationMode(true);
      setNavigationDestination({
        lat: station.latitude,
        lng: station.longitude,
        name: stationName
      });
      
      // Select the station to show route on map
      dispatch(setSelectedStation(station));
      
      message.success(`Đang chỉ đường đến ${stationName}`);
    } else {
      message.warning('Không có tọa độ trạm sạc');
    }
  };

  // Handle route info update from RoutePolyline
  const handleRouteInfoUpdate = (info) => {
    setNavigationInfo(info);
  };

  // Close navigation
  const handleCloseNavigation = () => {
    setNavigationMode(false);
    setNavigationInfo(null);
    setNavigationDestination(null);
    dispatch(clearSelectedStation());
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
            (cp) => (cp.status || '').toLowerCase() === CHARGING_POINT_STATUS.ACTIVE
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

        {/* Route polyline - Show only in navigation mode */}
        {navigationMode && navigationDestination && userLocation && (
          <RoutePolyline
            userLocation={userLocation}
            destination={navigationDestination}
            showInstructions={true}
            onRouteInfoUpdate={handleRouteInfoUpdate}
          />
        )}

        {/* Selected station route (when not in navigation mode) */}
        {!navigationMode && selectedStation && userLocation && selectedStation.latitude && selectedStation.longitude && (
          <RoutePolyline
            userLocation={userLocation}
            destination={{ lat: selectedStation.latitude, lng: selectedStation.longitude }}
            showInstructions={false}
          />
        )}

        {/* Booking route polyline */}
        {routePolyline && !navigationMode && (
          <RoutePolyline
            userLocation={{ lat: routePolyline[0][0], lng: routePolyline[0][1] }}
            destination={{ lat: routePolyline[1][0], lng: routePolyline[1][1] }}
            showInstructions={false}
          />
        )}
      </MapContainer>

      {/* Navigation Panel - Shows route instructions */}
      {navigationMode && navigationInfo && (
        <NavigationPanel
          routeInfo={navigationInfo}
          stationName={navigationDestination?.name}
          onClose={handleCloseNavigation}
        />
      )}

      {/* Booking Modal */}
      <BookingModal
        visible={bookingModalVisible}
        onClose={() => {
          setBookingModalVisible(false);
          setSelectedStationForBooking(null);
          setRoutePolyline(null);
        }}
        station={selectedStationForBooking}
        userLocation={userLocation}
      />

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
