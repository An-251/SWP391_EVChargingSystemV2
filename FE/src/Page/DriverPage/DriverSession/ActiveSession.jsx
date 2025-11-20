import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Slider, Button, Statistic, Progress, message, Modal, Spin, Alert } from 'antd';
import { 
  Zap, 
  MapPin, 
  Car, 
  Battery, 
  Clock, 
  DollarSign,
  XCircle,
  CheckCircle,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import { 
  fetchActiveSession, 
  stopSession, 
  cancelSession 
} from '../../../redux/session/sessionSlice';
import api from '../../../configs/config-axios';
import { getSubscriptionDiscountRate } from '../../../utils/chargingCalculations'; // ⭐ FIX: Import discount helper
import { formatTime } from '../../../utils/formatNumber'; // Format time without decimals

const { confirm } = Modal;

const ActiveSession = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { user } = useSelector((state) => state.auth);
  const { currentSubscription } = useSelector((state) => state.subscription); // ⭐ FIX: Get subscription from Redux
  const { activeSession, hasActiveSession, loading, error } = useSelector(
    (state) => state.session
  );

  const [currentBatteryPercent, setCurrentBatteryPercent] = useState(0); // Simulate charging progress
  const [elapsedTime, setElapsedTime] = useState(0);
  const [realTimeCost, setRealTimeCost] = useState(0); // ⭐ Real-time cost state
  
  // ⭐ NEW: Overuse penalty tracking
  const [isFullyCharged, setIsFullyCharged] = useState(false);
  const [fullChargeTime, setFullChargeTime] = useState(null);
  const [overtimeMinutes, setOvertimeMinutes] = useState(0);
  const [overusePenalty, setOverusePenalty] = useState(0);
  
  const START_FEE = 5000;
  const OVERUSE_PENALTY_PER_MINUTE = 2000;
  const GRACE_PERIOD_MINUTES = 1; // ⭐ FIXED: Đồng bộ với BE (ChargingSessionService.java line 47)
  
  // Get session from navigation state (if just started)
  const sessionFromNav = location.state?.session;
  const estimatedTimeMinutes = location.state?.estimatedTimeMinutes; // ⭐ Get estimated time from navigation
  const estimatedCostFromNav = location.state?.estimatedCost; // ⭐ Get estimated cost from navigation
  
  // Use session from navigation or Redux
  const currentSession = sessionFromNav || activeSession;
  const hasSession = !!sessionFromNav || hasActiveSession;
  
  // Target battery from backend or navigation
  const targetBattery = location.state?.targetBattery || currentSession?.endPercentage || currentSession?.targetPercentage || 80;
  const startBattery = location.state?.startBattery || currentSession?.startPercentage || 20;
  
  // ⭐ Calculate charging duration in SECONDS (from estimated minutes or default)
  // ⭐ SPEED UP 100x for testing: Divide by 100
  const chargingDurationSeconds = estimatedTimeMinutes 
    ? (estimatedTimeMinutes * 60) / 100 // Convert minutes to seconds, then 100x faster
    : 6; // Default 6 seconds (10 minutes / 100)

  // Fetch active session on mount (only if no session from navigation)
  useEffect(() => {
    if (!sessionFromNav && user?.driverId) {
      dispatch(fetchActiveSession(user.driverId));
    }
  }, [sessionFromNav, user, dispatch]);

  // Calculate elapsed time AND simulate battery charging progress
  useEffect(() => {
    if (currentSession?.startTime) {
      const interval = setInterval(() => {
        const start = new Date(currentSession.startTime);
        const now = new Date();
        const elapsed = Math.floor((now - start) / 1000); // in seconds
        setElapsedTime(elapsed);
        
        // ⭐ FIXED: Use REAL estimated time from StartCharging calculation
        // Calculate progress based on actual estimated duration
        const batteryRange = targetBattery - startBattery;
        const progressPercent = Math.min((elapsed / chargingDurationSeconds) * 100, 100);
        const currentBattery = startBattery + (batteryRange * progressPercent / 100);
        
        const newBatteryPercent = Math.min(Math.round(currentBattery), targetBattery);
        setCurrentBatteryPercent(newBatteryPercent);
        
        // ⭐ Log progress with real-time cost calculation
        if (elapsed % 5 === 0) { // Log every 5 seconds
          const percentCharged = newBatteryPercent - startBattery;
          const batteryCapacity = currentSession.vehicle?.batteryCapacity || 60;
          // ⭐ CHANGED: charger.chargingPoint.pricePerKwh (charger has FK to chargingPoint)
          const pricePerKwh = currentSession.charger?.chargingPoint?.pricePerKwh || currentSession.pricePerKwh || 5000;
          const kwhUsed = (percentCharged / 100) * batteryCapacity;
          const currentCost = Math.round(kwhUsed * pricePerKwh);
          
          console.log(`⚡ [ActiveSession] Progress: ${elapsed}s/${chargingDurationSeconds}s (${Math.round(progressPercent)}%) - Battery: ${newBatteryPercent}% - Cost: ${currentCost} đ`);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [currentSession, startBattery, targetBattery, chargingDurationSeconds]);

  // Auto-refresh active session every 30 seconds (skip if using nav session)
  useEffect(() => {
    if (!sessionFromNav && hasActiveSession && user?.driverId) {
      const interval = setInterval(() => {
        console.log('🔄 [ActiveSession] Auto-refreshing session...');
        dispatch(fetchActiveSession(user.driverId));
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [sessionFromNav, hasActiveSession, user, dispatch]);

  // Set initial battery percentage
  useEffect(() => {
    if (currentSession?.startPercentage) {
      setCurrentBatteryPercent(currentSession.startPercentage);
    }
  }, [currentSession]);

  // ⭐ FIXED: Track when battery reaches TARGET percentage (not just 100%)
  useEffect(() => {
    if (currentBatteryPercent >= targetBattery && !isFullyCharged) {
      setIsFullyCharged(true);
      setFullChargeTime(Date.now());
      message.warning({
        content: `⚠️ Pin đã đạt mục tiêu ${targetBattery}%! Bạn có ${GRACE_PERIOD_MINUTES} phút miễn phí để dừng session.`,
        duration: 5,
      });
    }
  }, [currentBatteryPercent, isFullyCharged, targetBattery]);

  // ⭐ FIXED: Overuse timer (starts after reaching TARGET percentage)
  useEffect(() => {
    if (!isFullyCharged || !fullChargeTime) return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedMs = now - fullChargeTime;
      const elapsedMinutes = Math.floor(elapsedMs / 60000);
      
      setOvertimeMinutes(elapsedMinutes);
      
      // Calculate penalty (after grace period)
      if (elapsedMinutes > GRACE_PERIOD_MINUTES) {
        const penaltyMinutes = elapsedMinutes - GRACE_PERIOD_MINUTES;
        const penalty = penaltyMinutes * OVERUSE_PENALTY_PER_MINUTE;
        setOverusePenalty(penalty);
        
        // Show warning every minute after grace period
        if (penaltyMinutes % 1 === 0 && penaltyMinutes > 0) {
          message.error({
            content: `🚨 Phí phạt đậu quá giờ: +${penalty} đ (${penaltyMinutes} phút quá ${GRACE_PERIOD_MINUTES} phút miễn phí)`,
            duration: 3,
          });
        }
      }
    }, 1000); // Update every second
    
    return () => clearInterval(interval);
  }, [isFullyCharged, fullChargeTime, targetBattery]);

  const handleCompleteCharging = () => {
    // BE uses 'sessionId' not 'id'
    const sessionId = currentSession?.sessionId || currentSession?.id;
    
    if (!sessionId) {
      console.error('❌ [STOP SESSION] No session ID found in:', currentSession);
      message.error('Không tìm thấy ID phiên sạc! Vui lòng refresh trang.');
      return;
    }

    // Check if charging is complete (reached target or close enough)
    const isChargingComplete = currentBatteryPercent >= targetBattery - 1;
    
    if (!isChargingComplete) {
      Modal.warning({
        title: 'Chưa sạc đầy',
        content: `Pin hiện tại: ${currentBatteryPercent}%. Mục tiêu: ${targetBattery}%. Vui lòng đợi đến khi sạc đầy!`,
        okText: 'Đã hiểu',
      });
      return;
    }

    confirm({
      title: 'Hoàn thành phiên sạc?',
      icon: <CheckCircle className="text-green-500" />,
      content: `Pin đã đạt ${currentBatteryPercent}%. Xác nhận hoàn thành phiên sạc?`,
      okText: 'Hoàn thành',
      cancelText: 'Hủy',
      okButtonProps: { className: 'bg-green-500 hover:bg-green-600' },
      onOk: async () => {
        try {
          console.log('🔄 Stopping session:', { sessionId, endPercentage: currentBatteryPercent });
          const result = await dispatch(
            stopSession({
              sessionId: sessionId,
              endPercentage: currentBatteryPercent,
            })
          ).unwrap();
          console.log('✅ Session stopped successfully:', result);
          
          // Navigate to session completed page (không cần fetch invoice vì dùng mô hình trả sau)
          message.success('Phiên sạc hoàn tất! 🎉', 2);
          
          setTimeout(() => {
            console.log('🚀 [NAVIGATE] Redirecting to session completed page');
            navigate(`/driver/session/${sessionId}/completed`, {
              state: { sessionData: result }
            });
          }, 1500);
        } catch (error) {
          console.error('❌ Failed to stop session:', error);
          const errorMsg = error?.message || error?.error || (typeof error === 'string' ? error : 'Không thể dừng phiên sạc!');
          message.error(errorMsg);
        }
      },
    });
  };

  // Handle cancel (emergency)
  const handleCancelSession = () => {
    // BE uses 'sessionId' not 'id'
    const sessionId = currentSession?.sessionId || currentSession?.id;
    
    if (!sessionId) {
      console.error('❌ [EMERGENCY STOP] No session ID found in:', currentSession);
      message.error('Không tìm thấy ID phiên sạc! Vui lòng refresh trang.');
      return;
    }

    confirm({
      title: '🚨 Hủy phiên sạc khẩn cấp?',
      icon: <AlertCircle className="text-red-500" />,
      content: (
        <div className="space-y-2">
          <p>Thao tác này sẽ:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Dừng phiên sạc ngay lập tức</li>
            <li>Tính tiền dựa trên % pin đã sạc ({currentBatteryPercent}%)</li>
            <li>Gửi thông báo sự cố đến nhân viên trạm sạc</li>
          </ul>
          <p className="text-red-600 font-semibold mt-2">
            ⚠️ Chỉ sử dụng trong trường hợp khẩn cấp!
          </p>
        </div>
      ),
      okText: 'Xác nhận dừng khẩn cấp',
      cancelText: 'Quay lại',
      okButtonProps: { danger: true },
      width: 500,
      onOk: async () => {
        try {
          console.log('🚨 [EMERGENCY STOP] Stopping session:', { 
            sessionId, 
            endPercentage: currentBatteryPercent 
          });
          
          // ⭐ Gọi endpoint mới: emergency-stop (tính tiền + gửi incident)
          const response = await api.post(
            `/charging-sessions/${sessionId}/emergency-stop`,
            { endPercentage: currentBatteryPercent }
          );
          
          console.log('✅ [EMERGENCY STOP] Success:', response.data);
          
          message.success({
            content: '⚠️ Đã dừng khẩn cấp! Thông báo đã được gửi đến nhân viên.',
            duration: 3,
          });
          
          // Navigate to completed page với session data
          setTimeout(() => {
            navigate(`/driver/session/${sessionId}/completed`, {
              state: { sessionData: response.data.data }
            });
          }, 1500);
        } catch (error) {
          console.error('❌ [EMERGENCY STOP] Failed:', error);
          const errorMsg = error?.response?.data?.message || 
                          error?.message || 
                          'Không thể dừng khẩn cấp phiên sạc!';
          message.error(errorMsg);
        }
      },
    });
  };

  // Format elapsed time
  const formatElapsedTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // ⭐ FIXED: Calculate REAL-TIME cost - Discount CHỈ áp dụng cho điện năng
  useEffect(() => {
    if (!currentSession) {
      setRealTimeCost(estimatedCostFromNav || 0);
      return;
    }
    
    // Get real data - FIXED: prioritize nested charger object
    const batteryCapacity = currentSession.vehicle?.batteryCapacity || currentSession.batteryCapacity || 60;
    // ⭐ FIX: Get pricePerKwh from charger.chargingPoint.pricePerKwh (from DB)
    const pricePerKwh = currentSession.charger?.chargingPoint?.pricePerKwh || 3000;
    const startPercent = startBattery;
    const currentPercent = currentBatteryPercent;
    
    // Calculate kWh used so far
    const percentCharged = currentPercent - startPercent;
    const kwhUsed = (percentCharged / 100) * batteryCapacity;
    
    // ⭐ FIX: Match Backend formula - Discount CHỈ cho điện năng, KHÔNG cho start fee và overuse penalty
    const energyCost = kwhUsed * pricePerKwh;
    const discountRate = getSubscriptionDiscountRate(currentSubscription);
    const energyCostAfterDiscount = energyCost - ((energyCost * discountRate) / 100);
    const totalCost = START_FEE + energyCostAfterDiscount + overusePenalty;
    
    setRealTimeCost(Math.round(totalCost));
  }, [currentBatteryPercent, currentSession, startBattery, estimatedCostFromNav, overusePenalty, currentSubscription]);

  // Loading state (only show if no nav session and loading from API)
  if (!sessionFromNav && loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" tip="Đang tải phiên sạc..." />
      </div>
    );
  }

  // No active session
  if (!hasSession || !currentSession) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Card className="w-96 text-center shadow-xl">
          <div className="mb-4">
            <Battery size={64} className="mx-auto text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Không có phiên sạc
          </h2>
          <p className="text-gray-600 mb-6">
            Bạn chưa bắt đầu phiên sạc nào. Hãy tìm trạm sạc trên bản đồ!
          </p>
          <Button
            type="primary"
            size="large"
            onClick={() => navigate('/driver')}
            icon={<MapPin size={18} />}
            className="bg-gradient-to-r from-green-500 to-blue-500"
          >
            Xem bản đồ
          </Button>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Alert
          message="Lỗi"
          description={typeof error === 'string' ? error : 'Không thể tải phiên sạc'}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={() => dispatch(fetchActiveSession(user.driverId))}>
              Thử lại
            </Button>
          }
        />
      </div>
    );
  }

  // Calculate charging progress percentage
  const chargingProgress = startBattery 
    ? ((currentBatteryPercent - startBattery) / (targetBattery - startBattery)) * 100
    : 0;
  
  // Check if charging is complete
  const isChargingComplete = currentBatteryPercent >= targetBattery - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            ⚡ Phiên sạc đang hoạt động
          </h1>
          <p className="text-gray-600">
            {currentSession.stationName || 'Trạm sạc'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Card - Battery Progress */}
          <Card className="lg:col-span-2 shadow-xl">
            <div className="text-center mb-8">
              <Progress
                type="circle"
                percent={currentBatteryPercent}
                size={200}
                strokeColor={
                  isChargingComplete
                    ? { '0%': '#52c41a', '100%': '#52c41a' } // Green when complete
                    : { '0%': '#1890ff', '100%': '#52c41a' } // Blue to green gradient
                }
                format={() => (
                  <div>
                    <div className="text-4xl font-bold text-gray-800">
                      {currentBatteryPercent}%
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                      {isChargingComplete ? '✅ Đã đầy' : '🔋 Đang sạc'}
                    </div>
                  </div>
                )}
              />
            </div>

            {/* Charging Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Tiến trình sạc
                </span>
                <span className="text-sm font-bold text-blue-600">
                  {Math.round(chargingProgress)}%
                </span>
              </div>
              <Progress 
                percent={Math.round(chargingProgress)} 
                status={isChargingComplete ? 'success' : 'active'}
                strokeColor={{
                  '0%': '#1890ff',
                  '100%': '#52c41a',
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Bắt đầu: {startBattery}%</span>
                <span>Mục tiêu: {targetBattery}%</span>
              </div>
            </div>

            {/* Completion Status */}
            {isChargingComplete && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                <CheckCircle className="inline mr-2 text-green-600" size={20} />
                <span className="text-green-700 font-semibold">
                  Sạc hoàn tất! Bạn có thể nhấn "Hoàn thành" để kết thúc phiên sạc.
                </span>
              </div>
            )}

            {/* ⭐ NEW: Overuse Warning */}
            {isFullyCharged && (
              <div className={`mb-4 p-4 rounded-lg border-2 ${
                overtimeMinutes > GRACE_PERIOD_MINUTES 
                  ? 'bg-red-100 border-red-300 animate-pulse' 
                  : 'bg-yellow-100 border-yellow-300'
              }`}>
                <div className="flex items-start space-x-3">
                  <AlertTriangle 
                    className={`${
                      overtimeMinutes > GRACE_PERIOD_MINUTES ? 'text-red-600' : 'text-yellow-600'
                    } flex-shrink-0`} 
                    size={24} 
                  />
                  <div className="flex-1">
                    <p className={`font-semibold text-sm mb-1 ${
                      overtimeMinutes > GRACE_PERIOD_MINUTES ? 'text-red-800' : 'text-yellow-800'
                    }`}>
                      {overtimeMinutes <= GRACE_PERIOD_MINUTES 
                        ? '⏰ Đã Hoàn Thành - Trong thời gian miễn phí!' 
                        : '🚨 Đang tính phí phạt quá giờ!'}
                    </p>
                    {overusePenalty > 0 && (
                      <p className="text-sm font-bold text-red-700 bg-white px-3 py-1 rounded">
                        Phí phạt: +{overusePenalty} đ
                      </p>
                    )}
                    {overtimeMinutes <= GRACE_PERIOD_MINUTES && (
                      <p className="text-xs text-blue-600 mt-2">
                        💡 Hãy hoàn thành ngay để tránh phí phạt!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <Button
                type="primary"
                danger={isFullyCharged && overtimeMinutes > GRACE_PERIOD_MINUTES}
                size="large"
                icon={<CheckCircle size={20} />}
                onClick={handleCompleteCharging}
                disabled={!isChargingComplete}
                className={`h-14 ${
                  isFullyCharged && overtimeMinutes > GRACE_PERIOD_MINUTES
                    ? 'animate-pulse bg-red-600 hover:bg-red-700'
                    : isChargingComplete
                    ? 'bg-gradient-to-r from-green-500 to-blue-500'
                    : 'bg-gray-300'
                }`}
              >
                {isFullyCharged && overtimeMinutes > GRACE_PERIOD_MINUTES 
                  ? '🚨 Dừng ngay để tránh phí phạt!'
                  : isChargingComplete 
                  ? 'Hoàn thành' 
                  : 'Đang sạc...'}
              </Button>
              <Button
                danger
                size="large"
                icon={<XCircle size={20} />}
                onClick={handleCancelSession}
                className="h-14"
              >
                Hủy khẩn cấp
              </Button>
            </div>
          </Card>

          {/* Side Stats */}
          <div className="space-y-6">
            {/* Time Stats */}
            <Card className="shadow-lg">
              <div className="space-y-4">
                <Statistic
                  title={<span className="flex items-center"><Clock className="mr-2" size={16} />Thời gian đã sạc</span>}
                  value={formatElapsedTime(elapsedTime)}
                  valueStyle={{ color: '#1890ff' }}
                />
                
                {/* ⭐ NEW: Show remaining time */}
                {estimatedTimeMinutes && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500 mb-1">Thời gian còn lại (dự kiến)</div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatElapsedTime(Math.round(Math.max(0, chargingDurationSeconds - elapsedTime)))}
                    </div>
                    <div className="text-xs text-blue-500 mt-1">
                      ⚡ Thực tế: {formatTime(estimatedTimeMinutes)} phút
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Vehicle Info */}
            <Card className="shadow-lg">
              <h3 className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                <Car className="mr-2" size={16} />
                Thông tin xe
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tên xe:</span>
                  <span className="font-medium">{currentSession.vehicleModel || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Biển số:</span>
                  <span className="font-medium">{currentSession.licensePlate || 'N/A'}</span>
                </div>
              </div>
            </Card>

            {/* Station Info */}
            <Card className="shadow-lg">
              <h3 className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                <MapPin className="mr-2" size={16} />
                Trạm sạc
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Trạm sạc:</span>
                  <span className="font-medium">{currentSession.stationName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Charger:</span>
                  <span className="font-medium">{currentSession.charger?.chargerCode || currentSession.chargingPointName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Loại cổng:</span>
                  <span className="font-medium">{currentSession.charger?.connectorType || currentSession.connectorType || 'N/A'}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveSession;

