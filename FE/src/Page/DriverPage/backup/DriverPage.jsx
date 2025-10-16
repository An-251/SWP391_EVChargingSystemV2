import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Navigation, 
  Battery, 
  MapPin, 
  Clock, 
  Zap, 
  Search,
  Filter,
  Star,
  ChevronDown,
  Locate,
  Route,
  LogOut,
  User,
  RefreshCw
} from 'lucide-react';
import { logoutUser } from '../../redux/auth/authSlice';
import { fetchStations, setSelectedStation as setReduxSelectedStation } from '../../redux/station/stationSlice';
import { message } from 'antd';
import DriverMap from './DriverMap';

const DriverPage = () => {
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const { stations: rawStations, loading: stationLoading } = useSelector((state) => state.station);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedStation, setSelectedStation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [chargingStations, setChargingStations] = useState([]);

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Calculate estimated time based on distance (assuming 40 km/h average speed in city)
  const calculateEstimatedTime = (distanceKm) => {
    const avgSpeedKmh = 40;
    const hours = distanceKm / avgSpeedKmh;
    const minutes = Math.round(hours * 60);
    return minutes < 60 ? `${minutes} phút` : `${Math.round(hours * 10) / 10} giờ`;
  };

  // Transform backend stations to frontend format
  useEffect(() => {
    if (rawStations && rawStations.length > 0 && userLocation) {
      const transformed = rawStations
        .filter(station => station.latitude && station.longitude) // Only stations with coordinates
        .map(station => {
          const distance = calculateDistance(
            userLocation.lat || userLocation[0],
            userLocation.lng || userLocation[1],
            station.latitude,
            station.longitude
          );

          // Count available slots from charging points
          const totalSlots = station.chargingPoints?.length || 0;
          const availableSlots = station.chargingPoints?.filter(
            point => point.status === 'AVAILABLE' || point.status === 'available'
          ).length || 0;

          return {
            id: station.id,
            name: station.stationName || `Trạm sạc ${station.id}`,
            address: station.facility?.address || 'Chưa có địa chỉ',
            distance: `${distance.toFixed(1)} km`,
            distanceValue: distance, // For sorting
            availableSlots: availableSlots,
            totalSlots: totalSlots,
            price: '5,000 VNĐ/kWh', // Default price, update if you have this in backend
            rating: 4.5, // Default rating, update if you have this in backend
            estimatedTime: calculateEstimatedTime(distance),
            fastCharging: true, // You can determine this from charging points
            status: station.status,
            coordinates: { lat: station.latitude, lng: station.longitude }
          };
        })
        .sort((a, b) => a.distanceValue - b.distanceValue); // Sort by distance

      setChargingStations(transformed);
    } else if (rawStations && rawStations.length > 0) {
      // If no user location, still show stations but without distance info
      const transformed = rawStations
        .filter(station => station.latitude && station.longitude)
        .map(station => {
          const totalSlots = station.chargingPoints?.length || 0;
          const availableSlots = station.chargingPoints?.filter(
            point => point.status === 'AVAILABLE' || point.status === 'available'
          ).length || 0;

          return {
            id: station.id,
            name: station.stationName || `Trạm sạc ${station.id}`,
            address: station.facility?.address || 'Chưa có địa chỉ',
            distance: 'N/A',
            distanceValue: 999999,
            availableSlots: availableSlots,
            totalSlots: totalSlots,
            price: '5,000 VNĐ/kWh',
            rating: 4.5,
            estimatedTime: 'N/A',
            fastCharging: true,
            status: station.status,
            coordinates: { lat: station.latitude, lng: station.longitude }
          };
        });

      setChargingStations(transformed);
    }
  }, [rawStations, userLocation]);

  // Fetch stations from API on mount
  useEffect(() => {
    dispatch(fetchStations());
  }, [dispatch]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Error getting location:', error);
          // Default to Ho Chi Minh City center
          setUserLocation({ lat: 10.7769, lng: 106.7009 });
        }
      );
    }
  }, []);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileMenu && !event.target.closest('.profile-menu')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  const filteredStations = chargingStations.filter(station =>
    station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStationSelect = (station) => {
    setSelectedStation(station);
    dispatch(setReduxSelectedStation(station));
  };

  const handleRefreshStations = () => {
    dispatch(fetchStations());
    message.success('Đang cập nhật danh sách trạm sạc...');
  };

  const handleBookStation = (station) => {
    // Handle booking logic here
    alert(`Đang đặt trạm ${station.name}...`);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      message.success('Đăng xuất thành công!');
      navigate('/auth/login');
    } catch (error) {
      message.warning('Đăng xuất thành công!');
      navigate('/auth/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">EV Charge</h1>
                <p className="text-sm text-gray-500">Xin chào, {user?.fullName || 'Driver'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefreshStations}
                disabled={stationLoading}
                className="flex items-center space-x-1 bg-gray-100 px-3 py-2 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 text-gray-600 ${stationLoading ? 'animate-spin' : ''}`} />
                <span className="text-sm font-medium text-gray-700">Cập nhật</span>
              </button>
              
              <div className="flex items-center space-x-1 bg-green-100 px-3 py-1 rounded-full">
                <Battery className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">85%</span>
              </div>
              
              {/* Profile Menu */}
              <div className="relative profile-menu">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <User className="w-5 h-5 text-gray-600" />
                </button>
                
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{user?.fullName || user?.username}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <p className="text-xs text-green-600 font-medium">{user?.role}</p>
                    </div>
                    <div className="p-1">
                      <button
                        onClick={() => {
                          navigate('/driver/profile');
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>Thông tin cá nhân</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        disabled={authLoading}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{authLoading ? 'Đang đăng xuất...' : 'Đăng xuất'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Panel - Station List */}
        <div className="w-96 bg-white shadow-lg border-r border-gray-200 flex flex-col">
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm trạm sạc gần đây..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center justify-between mt-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm">Bộ lọc</span>
                <ChevronDown className={`w-4 h-4 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              
              <button className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                <Locate className="w-4 h-4" />
                <span className="text-sm">Gần tôi</span>
              </button>
            </div>

            {showFilters && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Sạc nhanh</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Có sẵn ngay</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Giá rẻ</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Station List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Trạm sạc gần bạn ({filteredStations.length})
                </h2>
                {stationLoading && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
                )}
              </div>
              
              <div className="space-y-3">
                {filteredStations.map((station) => (
                  <div
                    key={station.id}
                    onClick={() => handleStationSelect(station)}
                    className={`p-4 border border-gray-200 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                      selectedStation?.id === station.id ? 'border-green-500 bg-green-50' : 'hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{station.name}</h3>
                          {station.fastCharging && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                              Nhanh
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{station.address}</p>
                        
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{station.distance}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{station.estimatedTime}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-gray-600">{station.rating}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${
                              station.availableSlots > 0 ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                            <span className="text-sm text-gray-600">
                              {station.availableSlots}/{station.totalSlots} trống
                            </span>
                          </div>
                          
                          <span className="text-sm font-semibold text-green-600">
                            {station.price}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {selectedStation?.id === station.id && (
                      <div className="mt-3 pt-3 border-t border-green-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookStation(station);
                          }}
                          disabled={station.availableSlots === 0}
                          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                            station.availableSlots > 0
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {station.availableSlots > 0 ? 'Đặt trạm ngay' : 'Hết chỗ'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Map */}
        <div className="flex-1 relative">
          <div className="absolute inset-0">
            <DriverMap 
              stations={chargingStations}
              selectedStation={selectedStation}
              userLocation={userLocation}
              onStationSelect={handleStationSelect}
            />
          </div>
          
          {/* Floating Action Button */}
          <div className="absolute bottom-6 right-6">
            <button className="w-14 h-14 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-colors flex items-center justify-center">
              <Route className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverPage;