import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Modal, Select, Slider, Button, message, Spin } from 'antd';
import { X, MapPin, Zap, Clock, Navigation, Car } from 'lucide-react';
import { fetchRoute, formatDistance, formatDuration } from '../../../../utils/routingService';
import { CHARGING_POINT_STATUS } from '../../../../constants/statusConstants';
import api from '../../../../configs/config-axios';

const { Option } = Select;

const BookingModal = ({ visible, onClose, station, userLocation }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user } = useSelector((state) => state.auth);

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [selectedCharger, setSelectedCharger] = useState(null); // ⭐ CHANGED: charger instead of charging point
  const [chargers, setChargers] = useState([]); // ⭐ NEW: store chargers list
  const [loadingChargers, setLoadingChargers] = useState(false); // ⭐ NEW: loading state
  const [routeInfo, setRouteInfo] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch user vehicles when modal opens
  useEffect(() => {
    const fetchVehicles = async () => {
      if (!visible || !user) return;
      
      try {
        setLoadingVehicles(true);
        const response = await api.get('/vehicles/my-vehicles');
        
        // Backend returns: { success: true, message: '...', data: { vehicles: [...] } }
        const vehiclesData = response.data?.data?.vehicles || response.data?.vehicles || [];
        setVehicles(vehiclesData);
        
        console.log('🚗 [BookingModal] Vehicles loaded:', vehiclesData.length);
        
        // Auto-select if only one vehicle
        if (vehiclesData.length === 1) {
          setSelectedVehicle(vehiclesData[0]);
        }
      } catch (error) {
        console.error('❌ [BookingModal] Error fetching vehicles:', error);
        message.error('Không thể tải danh sách xe');
      } finally {
        setLoadingVehicles(false);
      }
    };

    fetchVehicles();
  }, [visible, user]);

  // ⭐ NEW: Fetch chargers for all charging points in station
  useEffect(() => {
    const fetchChargers = async () => {
      if (!visible || !station || !station.chargingPoints) return;
      
      try {
        setLoadingChargers(true);
        const allChargers = [];
        
        // Fetch chargers for each charging point
        for (const point of station.chargingPoints) {
          try {
            const response = await api.get(`/charging-points/${point.id}/chargers`);
            const pointChargers = response.data || [];
            // ⭐ IMPORTANT: Add chargingPointId to each charger for reservation API
            const chargersWithPointId = pointChargers.map(charger => ({
              ...charger,
              chargingPointId: point.id // Store parent charging point ID
            }));
            allChargers.push(...chargersWithPointId);
          } catch (error) {
            console.error(`❌ [BookingModal] Error fetching chargers for point ${point.id}:`, error);
          }
        }
        
        setChargers(allChargers);
        console.log('⚡ [BookingModal] Chargers loaded:', allChargers.length);
      } catch (error) {
        console.error('❌ [BookingModal] Error fetching chargers:', error);
        message.error('Không thể tải danh sách charger');
      } finally {
        setLoadingChargers(false);
      }
    };

    fetchChargers();
  }, [visible, station]);

  // Reset selections when modal closes
  useEffect(() => {
    if (!visible) {
      setSelectedVehicle(null);
      setSelectedCharger(null);
      setVehicles([]);
      setChargers([]);
    }
  }, [visible]);

  // Calculate route using OSRM when station or user location changes
  useEffect(() => {
    const fetchRealRoute = async () => {
      if (!station || !userLocation) {
        setRouteInfo(null);
        return;
      }

      setLoadingRoute(true);

      try {
        const origin = { 
          lat: userLocation.lat || userLocation.latitude, 
          lng: userLocation.lng || userLocation.longitude 
        };
        const destination = { 
          lat: parseFloat(station.latitude), 
          lng: parseFloat(station.longitude) 
        };

        console.log('🚗 [BookingModal] Fetching OSRM route:', { origin, destination });

        const route = await fetchRoute(origin, destination);

        if (route.success) {
          setRouteInfo({
            distance: route.distance, // meters
            duration: route.duration, // seconds
            distanceKm: route.distance / 1000,
            durationMin: route.duration / 60,
            geometry: route.geometry
          });

          console.log('✅ [BookingModal] Route fetched:', {
            distance: formatDistance(route.distance / 1000),
            duration: formatDuration(route.duration / 60)
          });
        } else {
          console.warn('⚠️ [BookingModal] OSRM failed, route info unavailable');
          setRouteInfo(null);
        }
      } catch (error) {
        console.error('❌ [BookingModal] Error fetching route:', error);
        setRouteInfo(null);
      } finally {
        setLoadingRoute(false);
      }
    };

    fetchRealRoute();
  }, [station, userLocation]);

  const handleCreateReservation = async () => {
    if (!selectedVehicle) {
      message.warning('Vui lòng chọn xe!');
      return;
    }
    
    if (!selectedCharger) {
      message.warning('Vui lòng chọn charger!');
      return;
    }

    // ⭐ NOTE: Backend Reservation entity still uses chargingPointId (not chargerId yet)
    // We pass chargingPointId for now - full charger support requires BE migration
    const selectedChargerObj = chargers.find(c => c.id === selectedCharger);
    const requestData = {
      chargingPointId: selectedChargerObj?.chargingPointId || selectedChargerObj?.chargingPoint?.id,
      vehicleId: selectedVehicle.vehicleId || selectedVehicle.id,
      durationMinutes: 60, // Default 1 hour reservation
    };

    console.log('🚀 [RESERVATION] Creating reservation:', requestData);
    console.log('🚀 [RESERVATION] Driver ID:', user?.driverId);
    console.log('🚗 [RESERVATION] Vehicle:', selectedVehicle);

    try {
      setSubmitting(true);
      
      // Call API: POST /api/drivers/{driverId}/reservations
      // This will change charging point status: ACTIVE → BOOKED
      const response = await api.post(`/drivers/${user?.driverId}/reservations`, requestData);
      
      console.log('✅ [RESERVATION] Success:', response.data);
      
      message.success('Đặt chỗ thành công! Reservation sẽ hết hạn sau 1 giờ. 🎉');
      onClose();
      
      // Navigate to reservations page to see the new reservation
      navigate('/driver/reservations');
      
    } catch (error) {
      console.error('❌ [RESERVATION] Error:', error);
      const errorMessage = typeof error.response?.data === 'string' 
        ? error.response.data 
        : error.response?.data?.message || 'Không thể đặt chỗ!';
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Get station display information
  const getStationAddress = () => {
    if (!station) return 'N/A';
    
    // Try to build full address from facility data
    const facility = station.facility;
    if (facility) {
      const parts = [
        facility.streetAddress || facility.street_address,
        facility.ward,
        facility.district,
        facility.city
      ].filter(Boolean);
      
      if (parts.length > 0) return parts.join(', ');
    }
    
    // Fallback to station address or facility address
    return station.address || facility?.address || facility?.fullAddress || 'Chưa có địa chỉ';
  };

  // ⭐ CHANGED: Get available chargers (only ACTIVE status and compatible with selected vehicle)
  const availableChargers = chargers.filter((charger) => {
    const isActive = (charger.status || '').toLowerCase() === 'active';
    
    // If no vehicle selected, show all active chargers
    if (!selectedVehicle) return isActive;
    
    // Get connector types - Backend uses 'chargingPort' for vehicle, 'connectorType' for charger
    const vehicleConnector = (selectedVehicle.chargingPort || selectedVehicle.connectorType || '').toUpperCase().trim();
    const chargerConnector = (charger.connectorType || '').toUpperCase().trim();
    
    // If vehicle has no connector type specified, show all active chargers
    if (!vehicleConnector || vehicleConnector === 'N/A') {
      console.warn('⚠️ [BookingModal] Vehicle has no connector type, showing all active chargers');
      return isActive;
    }
    
    // Check if connectors are compatible
    const isCompatible = vehicleConnector === chargerConnector || 
                         chargerConnector === 'UNIVERSAL' || 
                         vehicleConnector === 'UNIVERSAL';
    
    console.log(`🔌 [BookingModal] Checking compatibility: Vehicle ${vehicleConnector} vs Charger ${chargerConnector} = ${isCompatible}`);
    
    return isActive && isCompatible;
  }) || [];

  if (!station) return null;

  const stationAddress = getStationAddress();

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      closeIcon={<X size={20} />}
      title={
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Zap className="text-green-600" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Đặt trạm sạc</h2>
            <p className="text-sm text-gray-500">{station.stationName || station.name}</p>
          </div>
        </div>
      }
    >
      <div className="space-y-6 py-4">
        {/* Station Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <MapPin className="text-blue-600 mt-1" size={20} />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 mb-1">Địa chỉ</h3>
              <p className="text-sm text-gray-600">
                {stationAddress}
              </p>
            </div>
          </div>

          {/* Route Info */}
          {loadingRoute ? (
            <div className="mt-3 pt-3 border-t border-gray-200 text-center">
              <Spin size="small" />
              <span className="ml-2 text-sm text-gray-500">Đang tính toán đường đi...</span>
            </div>
          ) : routeInfo ? (
            <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Navigation className="text-gray-500" size={16} />
                <div>
                  <p className="text-xs text-gray-500">Khoảng cách</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {formatDistance(routeInfo.distanceKm)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="text-gray-500" size={16} />
                <div>
                  <p className="text-xs text-gray-500">Thời gian (ước tính)</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {formatDuration(routeInfo.durationMin)}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Select Vehicle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Car className="inline mr-2" size={16} />
            Chọn xe cần sạc *
          </label>
          {loadingVehicles ? (
            <div className="text-center py-4">
              <Spin size="small" />
              <span className="ml-2 text-sm text-gray-500">Đang tải danh sách xe...</span>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-yellow-800 mb-2">Bạn chưa có xe nào!</p>
              <Button 
                type="link" 
                onClick={() => {
                  onClose();
                  navigate('/driver/vehicles');
                }}
              >
                Thêm xe ngay →
              </Button>
            </div>
          ) : (
            <Select
              placeholder="Chọn xe..."
              className="w-full"
              size="large"
              value={selectedVehicle?.vehicleId || selectedVehicle?.id}
              onChange={(value) => {
                const vehicle = vehicles.find(v => (v.vehicleId || v.id) === value);
                setSelectedVehicle(vehicle);
                // ⭐ CHANGED: Reset charger selection when vehicle changes
                setSelectedCharger(null);
                console.log('🚗 [BookingModal] Vehicle selected:', vehicle);
              }}
            >
              {vehicles.map((vehicle) => (
                <Option key={vehicle.vehicleId || vehicle.id} value={vehicle.vehicleId || vehicle.id}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {vehicle.brand} {vehicle.model}
                    </span>
                    <div className="text-gray-500 text-sm">
                      {vehicle.licensePlate && (
                        <span className="mr-2">• {vehicle.licensePlate}</span>
                      )}
                      <span>• {vehicle.chargingPort || vehicle.connectorType || 'Chưa rõ'}</span>
                      {vehicle.batteryCapacity && (
                        <span className="ml-2">• {vehicle.batteryCapacity}kWh</span>
                      )}
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
          )}
          {selectedVehicle && (
            <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
              ℹ️ Connector: <strong>{selectedVehicle.chargingPort || selectedVehicle.connectorType || 'Chưa rõ'}</strong> • 
              Battery: <strong>{selectedVehicle.batteryCapacity || 'Chưa rõ'}kWh</strong>
            </div>
          )}
        </div>

        {/* ⭐ CHANGED: Select Charger */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Zap className="inline mr-2" size={16} />
            Chọn charger *
          </label>
          {!selectedVehicle ? (
            <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-600">Vui lòng chọn xe trước</p>
            </div>
          ) : loadingChargers ? (
            <div className="text-center py-4">
              <Spin size="small" />
              <span className="ml-2 text-sm text-gray-500">Đang tải danh sách charger...</span>
            </div>
          ) : availableChargers.length === 0 ? (
            <div className="text-center py-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-red-700">
                Không có charger tương thích với connector <strong>{selectedVehicle.chargingPort || selectedVehicle.connectorType || 'Chưa rõ'}</strong>!
              </p>
            </div>
          ) : (
            <Select
              placeholder="Chọn charger..."
              className="w-full"
              size="large"
              value={selectedCharger}
              onChange={setSelectedCharger}
            >
              {availableChargers.map((charger) => (
                <Option key={charger.id} value={charger.id}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{charger.chargerCode || `Charger ${charger.id}`}</span>
                    <span className="text-gray-500 text-sm">
                      {charger.connectorType} • {charger.maxPower || 'N/A'}kW
                    </span>
                  </div>
                </Option>
              ))}
            </Select>
          )}
        </div>
          
          {/* Reservation Button - Book and reserve charger */}
          <Button
            type="default"
            size="large"
            block
            onClick={handleCreateReservation}
            loading={submitting}
            disabled={!selectedVehicle || !selectedCharger || vehicles.length === 0}
            className="border-2 border-green-500 text-green-600 hover:bg-green-50 h-12"
          >
            <Zap className="inline mr-2" size={20} />
            <span className="font-semibold">📅 Đặt chỗ trước (1 giờ)</span>
          </Button>

          {/* Cancel Button */}
          <Button size="large" block onClick={onClose} className="h-12">
            Hủy
          </Button>
        </div>
    </Modal>
  );
};

export default BookingModal;
