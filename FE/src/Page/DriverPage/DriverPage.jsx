import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
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
  Route
} from 'lucide-react';
import DriverMap from './DriverMap';

const DriverPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [selectedStation, setSelectedStation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  // Mock data for charging stations
  const [chargingStations] = useState([
    {
      id: 1,
      name: 'VinFast Station Thủ Đức',
      address: '123 Võ Văn Ngân, Thủ Đức, TP.HCM',
      distance: '0.5 km',
      availableSlots: 3,
      totalSlots: 6,
      price: '5,000 VNĐ/kWh',
      rating: 4.5,
      estimatedTime: '5 phút',
      fastCharging: true,
      coordinates: { lat: 10.8505, lng: 106.7717 }
    },
    {
      id: 2,
      name: 'Green Station Quận 1',
      address: '456 Nguyễn Huệ, Quận 1, TP.HCM',
      distance: '2.1 km',
      availableSlots: 1,
      totalSlots: 4,
      price: '6,000 VNĐ/kWh',
      rating: 4.8,
      estimatedTime: '12 phút',
      fastCharging: true,
      coordinates: { lat: 10.7769, lng: 106.7009 }
    },
    {
      id: 3,
      name: 'EV Power Bình Thạnh',
      address: '789 Điện Biên Phủ, Bình Thạnh, TP.HCM',
      distance: '1.8 km',
      availableSlots: 0,
      totalSlots: 8,
      price: '4,500 VNĐ/kWh',
      rating: 4.2,
      estimatedTime: '8 phút',
      fastCharging: false,
      coordinates: { lat: 10.8014, lng: 106.7105 }
    }
  ]);

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

  const filteredStations = chargingStations.filter(station =>
    station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStationSelect = (station) => {
    setSelectedStation(station);
  };

  const handleBookStation = (station) => {
    // Handle booking logic here
    alert(`Đang đặt trạm ${station.name}...`);
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
                <p className="text-sm text-gray-500">Xin chào, {user?.username || 'Driver'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 bg-green-100 px-3 py-1 rounded-full">
                <Battery className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">85%</span>
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
              <h2 className="text-lg font-semibold mb-4 text-gray-900">
                Trạm sạc gần bạn ({filteredStations.length})
              </h2>
              
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