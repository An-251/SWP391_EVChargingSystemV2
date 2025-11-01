import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  QrCode
} from 'lucide-react';
import { 
  fetchActiveSession, 
  stopSession, 
  cancelSession 
} from '../../../redux/session/sessionSlice';
import QRScanner from '../components/QRScanner';
import api from '../../../configs/config-axios';

const { confirm } = Modal;

const ActiveSession = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user } = useSelector((state) => state.auth);
  const { activeSession, hasActiveSession, loading, error } = useSelector(
    (state) => state.session
  );

  const [endPercentage, setEndPercentage] = useState(80);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Fetch active session on mount (only if not already in Redux store)
  useEffect(() => {
    if (user?.driverId) {
      // Check if we already have active session in Redux store
      if (hasActiveSession && activeSession) {
        console.log('✅ [ActiveSession] Using existing session from Redux store:', activeSession.sessionId);
        return; // Don't fetch if we already have one
      }
      
      console.log('🔍 [ActiveSession] Fetching active session for driver:', user.driverId);
      dispatch(fetchActiveSession(user.driverId));
    }
  }, [user?.driverId, dispatch]); // Remove activeSession and hasActiveSession from deps to avoid re-fetch

  // Log session data for debugging
  useEffect(() => {
    if (activeSession) {
      console.log('📊 [ActiveSession] Session data:', activeSession);
      console.log('🆔 [ActiveSession] Session ID:', activeSession.sessionId || activeSession.id);
    }
  }, [activeSession]);

  // Calculate elapsed time
  useEffect(() => {
    if (activeSession?.startTime) {
      const interval = setInterval(() => {
        const start = new Date(activeSession.startTime);
        const now = new Date();
        const elapsed = Math.floor((now - start) / 1000); // in seconds
        setElapsedTime(elapsed);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [activeSession]);

  // Auto-refresh active session every 30 seconds
  useEffect(() => {
    if (hasActiveSession && user?.driverId) {
      const interval = setInterval(() => {
        dispatch(fetchActiveSession(user.driverId));
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [hasActiveSession, user, dispatch]);

  // Set initial end percentage
  useEffect(() => {
    if (activeSession?.startPercentage) {
      setEndPercentage(Math.min(activeSession.startPercentage + 60, 100));
    }
  }, [activeSession]);

  const handleStopCharging = () => {
    // BE uses 'sessionId' not 'id'
    const sessionId = activeSession?.sessionId || activeSession?.id;
    
    if (!sessionId) {
      console.error('❌ [STOP SESSION] No session ID found in:', activeSession);
      message.error('Không tìm thấy ID phiên sạc! Vui lòng refresh trang.');
      return;
    }

    confirm({
      title: 'Dừng phiên sạc?',
      icon: <CheckCircle className="text-green-500" />,
      content: `Bạn có chắc muốn dừng phiên sạc? Pin hiện tại: ${endPercentage}%`,
      okText: 'Dừng sạc',
      cancelText: 'Hủy',
      okButtonProps: { className: 'bg-green-500 hover:bg-green-600' },
      onOk: async () => {
        try {
          console.log('🔄 Stopping session:', { sessionId, endPercentage });
          const result = await dispatch(
            stopSession({
              sessionId: sessionId,
              endPercentage: endPercentage,
            })
          ).unwrap();
          console.log('✅ Session stopped successfully:', result);
          
          // Navigate to session completed page (không cần fetch invoice vì dùng mô hình trả sau)
          message.success('Phiên sạc hoàn tất! 🎉', 2);
          
          setTimeout(() => {
            console.log('🚀 [NAVIGATE] Redirecting to session completed page');
            navigate(`/driver/session/${sessionId}/completed`);
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
    const sessionId = activeSession?.sessionId || activeSession?.id;
    
    if (!sessionId) {
      console.error('❌ [CANCEL SESSION] No session ID found in:', activeSession);
      message.error('Không tìm thấy ID phiên sạc! Vui lòng refresh trang.');
      return;
    }

    confirm({
      title: 'Hủy phiên sạc khẩn cấp?',
      icon: <AlertCircle className="text-red-500" />,
      content: 'Thao tác này chỉ dùng trong trường hợp khẩn cấp. Bạn có chắc chắn?',
      okText: 'Hủy phiên',
      cancelText: 'Quay lại',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await dispatch(cancelSession(sessionId)).unwrap();
          message.warning('Đã hủy phiên sạc');
          navigate('/driver');
        } catch (error) {
          const errorMsg = error?.message || error?.error || (typeof error === 'string' ? error : 'Không thể hủy phiên sạc!');
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

  // Calculate estimated cost (simplified - actual should come from BE)
  const estimatedCost = activeSession?.cost || 0;

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" tip="Đang tải phiên sạc..." />
      </div>
    );
  }

  // No active session
  if (!hasActiveSession || !activeSession) {
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

  const batteryProgress = activeSession.startPercentage 
    ? ((endPercentage - activeSession.startPercentage) / (100 - activeSession.startPercentage)) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            ⚡ Phiên sạc đang hoạt động
          </h1>
          <p className="text-gray-600">
            {activeSession.stationName || 'Trạm sạc'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Card - Battery Progress */}
          <Card className="lg:col-span-2 shadow-xl">
            <div className="text-center mb-8">
              <Progress
                type="circle"
                percent={endPercentage}
                size={200}
                strokeColor={{
                  '0%': '#52c41a',
                  '100%': '#1890ff',
                }}
                format={() => (
                  <div>
                    <div className="text-4xl font-bold text-gray-800">{endPercentage}%</div>
                    <div className="text-sm text-gray-500 mt-2">Pin hiện tại</div>
                  </div>
                )}
              />
            </div>

            {/* Battery Slider */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Điều chỉnh mức pin mong muốn
              </label>
              <Slider
                min={activeSession.startPercentage || 0}
                max={100}
                value={endPercentage}
                onChange={setEndPercentage}
                marks={{
                  [activeSession.startPercentage || 0]: `${activeSession.startPercentage}%`,
                  100: '100%',
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <Button
                type="primary"
                size="large"
                icon={<CheckCircle size={20} />}
                onClick={handleStopCharging}
                className="bg-gradient-to-r from-green-500 to-blue-500 h-14"
              >
                Dừng sạc
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
              <Statistic
                title={<span className="flex items-center"><Clock className="mr-2" size={16} />Thời gian đã sạc</span>}
                value={formatElapsedTime(elapsedTime)}
                valueStyle={{ color: '#1890ff' }}
              />
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
                  <span className="font-medium">{activeSession.vehicleModel || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Biển số:</span>
                  <span className="font-medium">{activeSession.licensePlate || 'N/A'}</span>
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
                  <span className="text-gray-600">Tên trạm:</span>
                  <span className="font-medium">{activeSession.stationName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cổng sạc:</span>
                  <span className="font-medium">{activeSession.chargingPointName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Loại cổng:</span>
                  <span className="font-medium">{activeSession.connectorType || 'N/A'}</span>
                </div>
              </div>
            </Card>

            {/* Cost Estimate */}
            <Card className="shadow-lg bg-gradient-to-br from-green-50 to-blue-50">
              <Statistic
                title={<span className="flex items-center"><DollarSign className="mr-2" size={16} />Chi phí ước tính</span>}
                value={estimatedCost}
                suffix="VNĐ"
                valueStyle={{ color: '#52c41a', fontSize: '24px' }}
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveSession;
