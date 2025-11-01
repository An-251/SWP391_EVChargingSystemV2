import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Modal, Select, Slider, Button, message, Spin } from 'antd';
import { X, MapPin, Zap, Battery, Clock, Navigation, Car, Calendar } from 'lucide-react';
import { fetchDriverVehicles } from '../../../../redux/vehicle/vehicleSlice';
import { fetchRoute, formatDistance, formatDuration } from '../../../../utils/routingService';
import api from '../../../../configs/config-axios';

const { Option } = Select;

const BookingModal = ({ visible, onClose, station, userLocation }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user } = useSelector((state) => state.auth);
  const { vehicles, loading: vehiclesLoading } = useSelector((state) => state.vehicle);

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedChargingPoint, setSelectedChargingPoint] = useState(null);
  const [startPercentage, setStartPercentage] = useState(20);
  const [routeInfo, setRouteInfo] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch vehicles when modal opens
  useEffect(() => {
    if (visible && user) {
      dispatch(fetchDriverVehicles());
    }
  }, [visible, user, dispatch]);

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

  // Handle create reservation (ĐẶT CHỖ - KHÔNG START SESSION)
  const handleCreateReservation = async () => {
    if (!selectedVehicle) {
      message.warning('Vui lòng chọn xe!');
      return;
    }
    if (!selectedChargingPoint) {
      message.warning('Vui lòng chọn cổng sạc!');
      return;
    }

    // Find the actual charging point object to get more details
    const selectedPointObject = availablePoints.find(
      p => (p.id || p.pointId) === selectedChargingPoint
    );
    
    console.log('🔍 [RESERVATION] Selected point object:', selectedPointObject);
    console.log('🔍 [RESERVATION] Selected point ID:', selectedChargingPoint);
    console.log('🔍 [RESERVATION] Point details:', {
      id: selectedPointObject?.id,
      pointId: selectedPointObject?.pointId,
      pointName: selectedPointObject?.pointName,
      status: selectedPointObject?.status
    });

    // Tạo reservation với thời gian mặc định 60 phút
    const requestData = {
      chargingPointId: selectedChargingPoint,
      durationMinutes: 60 // Default duration
    };

    console.log('📝 [RESERVATION] Creating reservation with data:', requestData);
    console.log('👤 [RESERVATION] Driver ID:', user?.driverId);
    console.log('📍 [RESERVATION] Full URL:', `/drivers/${user?.driverId}/reservations`);

    try {
      setSubmitting(true);
      
      // Call API to create reservation
      const response = await api.post(`/drivers/${user?.driverId}/reservations`, requestData);
      
      console.log('✅ [RESERVATION] Success! Full response:', response);
      console.log('✅ [RESERVATION] Response data:', response.data);
      
      // Save chargingPointId AND vehicleId mapping for later use when starting session
      if (response.data?.reservationId) {
        const mapping = JSON.parse(localStorage.getItem('reservationMapping') || '{}');
        mapping[response.data.reservationId] = {
          chargingPointId: selectedChargingPoint,
          vehicleId: selectedVehicle, // 🆕 Lưu vehicleId đã chọn
        };
        localStorage.setItem('reservationMapping', JSON.stringify(mapping));
        console.log('💾 [RESERVATION] Saved reservation data:', {
          reservationId: response.data.reservationId,
          chargingPointId: selectedChargingPoint,
          vehicleId: selectedVehicle,
        });
      }
      
      message.success('Đặt chỗ thành công! Vui lòng đến trạm và quét QR để bắt đầu sạc. 🎉');
      onClose();
      
      // Navigate to reservations page
      navigate('/driver/reservations');
    } catch (error) {
      console.error('❌ [RESERVATION] Error:', error);
      console.error('❌ [RESERVATION] Error response:', error.response);
      console.error('❌ [RESERVATION] Error data:', error.response?.data);
      console.error('❌ [RESERVATION] Error status:', error.response?.status);
      console.error('❌ [RESERVATION] Error message:', error.message);
      
      const errorMsg = error.response?.data?.message || error.response?.data || error.message || 'Không thể đặt chỗ!';
      message.error(errorMsg);
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

  // Get available charging points - MUST match BE validation (only "active")
  // BE defines 3 statuses: "active", "inactive", "using"
  // Only "active" points can be reserved
  const availablePoints = station?.chargingPoints?.filter(
    (point) => {
      const status = point.status?.toLowerCase();
      console.log('🔍 [BookingModal] Checking charging point:', {
        pointName: point.pointName,
        id: point.id,
        pointId: point.pointId,
        status: point.status,
        statusLower: status,
        willBeAcceptedByBE: status === 'active'
      });
      // CRITICAL: BE only accepts "active" status (not "inactive" or "using")
      return status === 'active';
    }
  ) || [];

  console.log('📍 [BookingModal] Total charging points:', station?.chargingPoints?.length);
  console.log('✅ [BookingModal] Available charging points:', availablePoints.length);
  console.log('📋 [BookingModal] Available points details:', availablePoints.map(p => ({
    name: p.pointName,
    id: p.id,
    pointId: p.pointId,
    status: p.status
  })));

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
            Chọn xe của bạn *
          </label>
          {vehiclesLoading ? (
            <Spin />
          ) : vehicles.length === 0 ? (
            <div className="text-center py-4 bg-yellow-50 rounded-lg">
              <p className="text-yellow-700">Bạn chưa có xe nào. Vui lòng thêm xe trước!</p>
              <Button 
                type="link" 
                onClick={() => {
                  onClose();
                  navigate('/driver/vehicles');
                }}
              >
                Thêm xe ngay
              </Button>
            </div>
          ) : (
            <Select
              placeholder="Chọn xe..."
              className="w-full"
              size="large"
              value={selectedVehicle}
              onChange={setSelectedVehicle}
            >
              {vehicles.map((vehicle) => (
                <Option key={vehicle.id} value={vehicle.id}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{vehicle.model}</span>
                    <span className="text-gray-500 text-sm">
                      {vehicle.licensePlate} • {vehicle.batteryCapacity}kWh
                    </span>
                  </div>
                </Option>
              ))}
            </Select>
          )}
        </div>

        {/* Select Charging Point */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Zap className="inline mr-2" size={16} />
            Chọn cổng sạc *
          </label>
          {availablePoints.length === 0 ? (
            <div className="text-center py-4 bg-red-50 rounded-lg">
              <p className="text-red-700">Không có cổng sạc khả dụng!</p>
            </div>
          ) : (
            <Select
              placeholder="Chọn cổng sạc..."
              className="w-full"
              size="large"
              value={selectedChargingPoint}
              onChange={(value) => {
                console.log('⚡ [BookingModal] Selected charging point ID:', value);
                setSelectedChargingPoint(value);
              }}
            >
              {availablePoints.map((point) => (
                <Option key={point.id || point.pointId} value={point.id || point.pointId}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{point.pointName || point.name || `Cổng ${point.id}`}</span>
                    <span className="text-gray-500 text-sm">
                      {point.connectorType} • {point.maxPower || point.powerOutput || 'N/A'}kW
                    </span>
                  </div>
                </Option>
              ))}
            </Select>
          )}
        </div>

        {/* Info Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <Calendar className="inline mr-2" size={16} />
            <strong>Lưu ý:</strong> Sau khi đặt chỗ, bạn cần đến trạm và quét mã QR để bắt đầu sạc.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button size="large" onClick={onClose}>
            Hủy
          </Button>
          <Button
            type="primary"
            size="large"
            onClick={handleCreateReservation}
            loading={submitting}
            disabled={!selectedVehicle || !selectedChargingPoint || vehicles.length === 0}
            className="bg-gradient-to-r from-green-500 to-blue-500"
          >
            <Calendar className="inline mr-2" size={18} />
            Đặt chỗ
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default BookingModal;
