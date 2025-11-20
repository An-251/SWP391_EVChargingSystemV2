import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Card, Button, Slider, message, Modal, Select, Space, Tag, Alert } from 'antd';
import { Battery, Zap, Clock, DollarSign, ArrowLeft, Play, Car, Calendar, AlertTriangle } from 'lucide-react';
import api from '../../../configs/config-axios';
import {
  calculateChargingEstimate,
  formatCurrency,
  formatDuration,
  formatKwh,
  getSubscriptionDiscountRate,
} from '../../../utils/chargingCalculations';

const { Option } = Select;

const StartCharging = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { currentSubscription } = useSelector((state) => state.subscription);
  
  // ⭐ SIMPLIFIED: Only support reservation mode
  const { reservation } = location.state || {};
  
  const [targetBattery, setTargetBattery] = useState(80);
  const [starting, setStarting] = useState(false);
  const [reservedVehicle, setReservedVehicle] = useState(null);
  const [loadingVehicle, setLoadingVehicle] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState(reservation?.reservationId || reservation?.id || null);
  const [activeReservations, setActiveReservations] = useState(reservation ? [reservation] : []);
  const [loadingReservations, setLoadingReservations] = useState(false);

  // Fetch the vehicle that was selected during reservation
  useEffect(() => {
    const fetchReservedVehicle = async () => {
      if (!reservation?.vehicleId) {
        console.warn('⚠️ [StartCharging] No vehicleId in reservation');
        setLoadingVehicle(false);
        return;
      }

      try {
        setLoadingVehicle(true);
        const response = await api.get('/vehicles/my-vehicles');
        
        // Backend returns: { success: true, message: '...', data: { vehicles: [...] } }
        const vehiclesData = response.data?.data?.vehicles || response.data?.vehicles || [];
        
        // Find the vehicle that was reserved
        const foundVehicle = vehiclesData.find(v => 
          (v.vehicleId || v.id) === reservation.vehicleId
        );
        
        if (foundVehicle) {
          setReservedVehicle(foundVehicle);
        } else {
          console.error('❌ [StartCharging] Reserved vehicle not found');
          message.error('Không tìm thấy thông tin xe đã đặt');
        }
      } catch (error) {
        console.error('❌ [StartCharging] Error fetching vehicle:', error);
        message.error('Không thể tải thông tin xe');
      } finally {
        setLoadingVehicle(false);
      }
    };

    fetchReservedVehicle();
  }, [reservation]);

  // ⭐ SIMPLIFIED: Only validate reservation mode
  if (!reservation) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <Card className="shadow-lg max-w-md">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Không có đặt chỗ
            </h2>
            <p className="text-gray-600 mb-4">
              Vui lòng đặt chỗ trước khi bắt đầu sạc
            </p>
            <Button
              type="primary"
              onClick={() => navigate('/driver/reservations')}
              className="bg-green-500 hover:bg-green-600"
            >
              Quay lại đặt chỗ
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ⭐ SIMPLIFIED: Get data from reservation only
  const currentBattery = reservation?.vehicle?.currentBattery || 20;
  const batteryCapacity = reservedVehicle?.batteryCapacity || 60;
  const chargingPower = reservation?.charger?.maxPower || 50;
  const pricePerKwh = reservation?.chargingPoint?.pricePerKwh || 3000;
  
  // ⭐ FIX: Get discount rate from Redux subscription state
  const discountRate = getSubscriptionDiscountRate(currentSubscription);
  
  // ⭐ Use unified calculation utility (matches BE formula)
  let estimation = null;
  try {
    estimation = calculateChargingEstimate({
      startPercentage: currentBattery,
      endPercentage: targetBattery,
      batteryCapacity: batteryCapacity,
      pricePerKwh: pricePerKwh,
      chargingPower: chargingPower,
      discountRate: discountRate,
    });
  } catch (error) {
    console.error('❌ [StartCharging] Calculation error:', error);
    // Fallback to safe defaults
    estimation = {
      kwhNeeded: 0,
      estimatedTimeMinutes: 0,
      baseCost: 0,
      discount: 0,
      finalCost: 0,
      percentageDiff: 0,
    };
  }
  
  const { kwhNeeded, estimatedTimeMinutes, baseCost, discount, finalCost } = estimation;
  
  // ⭐ FIX: Match Backend formula - Discount CHỈ áp dụng cho điện năng
  const START_FEE = 5000; // VND - Must match Backend constant
  const energyCostBeforeDiscount = baseCost; // Chi phí điện năng trước giảm giá
  const discountAmount = (energyCostBeforeDiscount * discountRate) / 100; // Số tiền giảm
  const energyCostAfterDiscount = energyCostBeforeDiscount - discountAmount; // Điện năng sau giảm giá
  const totalFinalCost = START_FEE + energyCostAfterDiscount; // Start fee + điện năng sau giảm giá

  // ⭐ Calculate display time (100x faster for demo)
  const displayTimeMinutes = estimatedTimeMinutes / 100;
  
  // Handle start charging
  const handleStartCharging = async () => {
    Modal.confirm({
      title: 'Xác nhận bắt đầu sạc',
      content: (
        <div>
          <p>Bạn muốn sạc từ <strong>{currentBattery}%</strong> đến <strong>{targetBattery}%</strong>?</p>
          <p className="mt-2">Năng lượng: <strong>{formatKwh(kwhNeeded)}</strong></p>
          <p>Thời gian dự kiến: <strong>{formatDuration(displayTimeMinutes)}</strong></p>
          <p className="text-xs text-gray-500">(Demo: tăng tốc 100x - Thực tế: {formatDuration(estimatedTimeMinutes)})</p>
          <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            {/* Start Fee */}
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-700">Phí khởi động:</p>
              <p className="text-sm font-semibold text-gray-800">{formatCurrency(START_FEE)}</p>
            </div>
            
            {/* Energy Cost (before discount) */}
            <div className="flex justify-between items-center mb-2 pt-2 border-t border-blue-200">
              <p className="text-sm text-gray-700">Chi phí điện năng:</p>
              <p className="text-sm font-semibold text-gray-800">{formatCurrency(energyCostBeforeDiscount)}</p>
            </div>
            
            {/* Discount */}
            {discountRate > 0 ? (
              <div className="flex justify-between items-center bg-green-50 px-2 py-1 rounded mt-2">
                <p className="text-sm text-green-700">
                  🎉 Giảm giá {discountRate}%
                  {currentSubscription?.plan?.planName && (
                    <span className="text-xs ml-1">({currentSubscription.plan.planName})</span>
                  )}
                </p>
                <p className="text-sm font-semibold text-green-600">-{formatCurrency(discountAmount)}</p>
              </div>
            ) : (
              <div className="flex justify-between items-center bg-yellow-50 px-2 py-1 rounded mt-2">
                <p className="text-xs text-gray-600">💡 Không có gói subscription (giảm giá 0%)</p>
                <p className="text-xs text-gray-600">0 đ</p>
              </div>
            )}
          </div>
          
          {/* Total Cost */}
          <div className="mt-3 p-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
            <div className="flex justify-between items-center">
              <p className="text-base font-semibold text-gray-800">
                Tổng chi phí {discountRate > 0 && <span className="text-green-600">(Đã giảm giá)</span>}
              </p>
              <p className="text-2xl font-bold text-blue-700">{formatCurrency(totalFinalCost)}</p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Công thức: Phí khởi động ({formatCurrency(START_FEE)}) + Điện năng sau giảm giá ({formatCurrency(energyCostAfterDiscount)})
            </p>
          </div>
          
          <p className="text-xs text-yellow-600 mt-3 text-center bg-yellow-50 p-2 rounded">
            ⚠️ Chi phí thực tế tính theo % pin đã sạc. Dừng sớm = trả ít hơn!
          </p>
        </div>
      ),
      okText: 'Bắt đầu sạc',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setStarting(true);
          
          // Validate vehicle
          if (!reservedVehicle) {
            message.warning('Không tìm thấy thông tin xe!');
            return;
          }

          // ⭐ SIMPLIFIED: Get chargerId from reservation only
          const finalChargerId = reservation?.charger?.id || reservation?.chargerId;

          if (!finalChargerId) {
            message.error('Không tìm thấy thông tin charger. Vui lòng thử lại.');
            return;
          }

          const requestPayload = {
            driverId: user.driverId,
            reservationId: selectedReservation,
            chargerId: finalChargerId,
            vehicleId: reservedVehicle.vehicleId || reservedVehicle.id,
            startPercentage: currentBattery,
            targetPercentage: targetBattery,
          };
          
          console.log('🚀 [START_CHARGING] Endpoint: /charging-sessions/start');
          console.log('🚀 [START_CHARGING] Request payload:', requestPayload);
          
          // Call API to start charging session
          const response = await api.post('/charging-sessions/start', requestPayload);
          
          // Extract session data from ApiResponse wrapper
          const sessionData = response.data?.data || response.data;
          
          message.success('Đã bắt đầu phiên sạc! 🎉');
          
          // Navigate to active session page with estimated time and cost
          navigate('/driver/session', {
            state: { 
              session: sessionData,
              estimatedTimeMinutes: estimatedTimeMinutes,
              estimatedCost: totalFinalCost,
              startBattery: currentBattery,
              targetBattery: targetBattery,
              reservationId: selectedReservation,
            }
          });
          
        } catch (error) {
          console.error('Error starting session:', error);
          message.error(error.response?.data?.message || 'Không thể bắt đầu phiên sạc');
        } finally {
          setStarting(false);
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            type="link"
            icon={<ArrowLeft size={16} />}
            onClick={() => navigate('/driver/reservations')}
            className="mb-4"
          >
            Quay lại đặt chỗ
          </Button>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🔋 Chọn mức pin mong muốn
          </h1>
          <p className="text-gray-600">
            Chọn % pin bạn muốn sạc đến
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Battery Selection */}
          <Card className="shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Chọn mức pin
            </h2>

            {/* ⭐ SIMPLIFIED: Only show reservation selector */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Calendar className="inline mr-2" size={16} />
                Chọn đặt chỗ
              </label>
              
              {activeReservations.length > 0 ? (
                <Select
                  placeholder="Chọn đặt chỗ"
                  value={selectedReservation}
                  onChange={setSelectedReservation}
                  style={{ width: '100%' }}
                  disabled={loadingReservations}
                >
                  {activeReservations.map(r => (
                    <Option key={r.reservationId || r.id} value={r.reservationId || r.id}>
                      <div>
                        <strong>{r.stationName}</strong> - {r.chargingPointName}
                        <br />
                        <small className="text-gray-500">
                          {new Date(r.startTime).toLocaleString('vi-VN')} → {new Date(r.endTime).toLocaleString('vi-VN')}
                        </small>
                      </div>
                    </Option>
                  ))}
                </Select>
              ) : (
                <div className="text-gray-500 text-sm">
                  Không có đặt chỗ nào. Vui lòng đặt chỗ trước khi sạc.
                </div>
              )}
            </div>

            {/* Reserved Vehicle Info (Read-only) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Car className="inline mr-2" size={16} />
                Xe đã chọn
              </label>
              {loadingVehicle ? (
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-gray-500">Đang tải thông tin xe...</p>
                </div>
              ) : reservedVehicle ? (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border-2 border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-bold text-lg text-gray-800">
                        {reservedVehicle.brand} {reservedVehicle.model}
                      </p>
                      {reservedVehicle.licensePlate && (
                        <p className="text-sm text-gray-600">
                          Biển số: <strong>{reservedVehicle.licensePlate}</strong>
                        </p>
                      )}
                    </div>
                    <Car className="text-blue-600" size={32} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-blue-200">
                    <div>
                      <p className="text-xs text-gray-500">Connector</p>
                      <p className="text-sm font-semibold text-gray-700">
                        {reservedVehicle.chargingPort || reservedVehicle.connectorType || 'Chưa rõ'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Battery Capacity</p>
                      <p className="text-sm font-semibold text-gray-700">
                        {reservedVehicle.batteryCapacity || 'Chưa rõ'} kWh
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-blue-700 bg-blue-100 rounded p-2">
                    ℹ️ Xe đã được chọn khi đặt chỗ và không thể thay đổi
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-red-700 text-sm">
                    ⚠️ Không tìm thấy thông tin xe. Vui lòng đặt chỗ lại.
                  </p>
                </div>
              )}
            </div>

            {/* Current Battery */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Pin hiện tại:</span>
                <div className="flex items-center">
                  <Battery size={20} className="text-blue-600 mr-2" />
                  <span className="text-2xl font-bold text-blue-600">
                    {currentBattery}%
                  </span>
                </div>
              </div>
            </div>

            {/* Target Battery Slider */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-600">Pin mục tiêu:</span>
                <span className="text-3xl font-bold text-green-600">
                  {targetBattery}%
                </span>
              </div>
              
              <Slider
                min={currentBattery + 1}
                max={100}
                value={targetBattery}
                onChange={setTargetBattery}
                marks={{
                  [currentBattery + 1]: `${currentBattery + 1}%`,
                  50: '50%',
                  80: '80%',
                  100: '100%',
                }}
                tooltip={{
                  formatter: (value) => `${value}%`,  
                }}
                className="mb-2"
              />
              
            </div>
          </Card>




          {/* Charging Info */}
          <Card className="shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Thông tin sạc
            </h2>

            {/* Station Info */}
            <div className="mb-4 pb-4 border-b border-gray-200">
              <div className="font-semibold text-gray-800 mb-1">
                {reservation.stationName}
              </div>
              <div className="text-sm text-gray-600">
                {reservation.chargingPointName || `CP-${reservation.chargingPointId}`}
              </div>
            </div>

            {/* Estimates - Simplified: Only show essential charging info */}
            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600">
                    <Zap size={20} className="mr-2 text-purple-600" />
                    <span>Điện năng cần:</span>
                  </div>
                  <span className="text-lg font-bold text-purple-600">
                    {formatKwh(kwhNeeded)}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600">
                    <Clock size={20} className="mr-2 text-blue-600" />
                    <span>Thời gian dự kiến:</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">
                      ~{formatDuration(displayTimeMinutes)}
                    </div>
                    <div className="text-xs text-gray-500">
                      (Demo tăng tốc 100x)
                    </div>
                  </div>
                </div>
              </div>

</div>
            {/* Start Button */}
            <Button
              type="primary"
              size="large"
              icon={<Play size={20} />}
              onClick={handleStartCharging}
              loading={starting}
              disabled={!reservedVehicle || loadingVehicle}
              className="w-full mt-6 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 h-12 text-lg font-semibold"
            >
              Bắt đầu sạc
            </Button>
            {!reservedVehicle && !loadingVehicle && (
              <p className="text-xs text-red-600 text-center mt-2">
                Không tìm thấy thông tin xe. Vui lòng đặt chỗ lại.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StartCharging;
