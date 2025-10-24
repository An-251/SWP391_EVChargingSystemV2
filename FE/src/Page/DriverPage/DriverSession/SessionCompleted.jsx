import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Spin, message, Descriptions, Divider, Tag, Result } from 'antd';
import { 
  CheckCircle, 
  Zap, 
  Clock, 
  MapPin, 
  Car, 
  Battery, 
  Calendar,
  CreditCard,
  DollarSign
} from 'lucide-react';
import api from '../../../configs/config-axios';

const SessionCompleted = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessionDetails();
  }, [sessionId]);

  const fetchSessionDetails = async () => {
    try {
      console.log('📊 [SESSION COMPLETED] Fetching session ID:', sessionId);
      const response = await api.get(`/charging-sessions/${sessionId}`);
      console.log('📊 [SESSION COMPLETED] Response:', response.data);
      
      // Backend có thể trả về wrapped hoặc direct entity
      const sessionData = response.data?.data || response.data;
      setSession(sessionData);
      
      console.log('✅ [SESSION COMPLETED] Session loaded:', sessionData);
    } catch (error) {
      console.error('❌ [SESSION COMPLETED] Error:', error);
      message.error('Không thể tải thông tin phiên sạc');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0';
    return parseFloat(amount).toLocaleString('vi-VN');
  };

  const calculateDuration = () => {
    if (!session?.startTime || !session?.endTime) return 'N/A';
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);
    const durationMs = end - start;
    const minutes = Math.floor(durationMs / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" tip="Đang tải thông tin phiên sạc..." />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Result
          status="404"
          title="Không tìm thấy phiên sạc"
          subTitle="Phiên sạc không tồn tại hoặc đã bị xóa"
          extra={
            <Button type="primary" onClick={() => navigate('/driver/history')}>
              Về lịch sử
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="shadow-2xl rounded-2xl overflow-hidden mb-6">
          {/* Green to Blue Gradient Header */}
          <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-6 -mx-6 -mt-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <Zap className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold mb-1">THÔNG TIN PHIÊN SẠC</h1>
                  <p className="text-green-100 text-sm">EV CHARGING SESSION</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-100 mb-1">EcoCharge</p>
                <p className="text-xs text-green-200">Eco-friendly charging solutions</p>
              </div>
            </div>
          </div>

          {/* Success Badge */}
          <div className="flex justify-center -mt-3 mb-6">
            <div className="bg-white px-6 py-3 rounded-full shadow-lg border-4 border-green-100 flex items-center space-x-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <span className="text-green-700 font-semibold text-lg">Sạc hoàn tất</span>
            </div>
          </div>

          {/* Session Information */}
          <div className="space-y-6">
            {/* Session ID & Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-600">Mã phiên sạc</span>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  INV-{new Date().getFullYear()}{String(new Date().getMonth() + 1).padStart(2, '0')}{String(new Date().getDate()).padStart(2, '0')}-{String(session.sessionId || session.id).padStart(4, '0')}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-600">Ngày hoàn thành</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {formatDate(session.endTime).split(' ')[0]}
                </p>
              </div>
            </div>

            <Divider />

            {/* Charging Station Details */}
            <div className="bg-blue-50 p-6 rounded-xl">
              <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-4">
                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                Thông tin trạm sạc
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tên trạm</p>
                  <p className="text-base font-semibold text-gray-900">{session.stationName || 'Green Power Station'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Địa chỉ</p>
                  <p className="text-base text-gray-800">{session.stationAddress || '123 Nguyen Hue, District 1, Ho Chi Minh City'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Loại sạc</p>
                    <Tag color="green" className="text-sm px-3 py-1">
                      {session.connectorType || 'DC Fast Charger'} ({session.powerOutput || '150'}kW)
                    </Tag>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Cổng sạc</p>
                    <p className="text-base font-medium text-gray-900">{session.chargingPointName || 'Point #1'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charging Time Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">Bắt đầu</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{formatDate(session.startTime)}</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-600">Kết thúc</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{formatDate(session.endTime)}</p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-gray-600">Thời gian</span>
                </div>
                <p className="text-lg font-bold text-purple-900">{calculateDuration()}</p>
              </div>
            </div>

            {/* Vehicle Info */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-4">
                <Car className="w-5 h-5 mr-2 text-gray-700" />
                Thông tin xe
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tên xe</p>
                  <p className="text-base font-semibold text-gray-900">{session.vehicleModel || session.vehicleName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Biển số</p>
                  <p className="text-base font-semibold text-gray-900">{session.licensePlate || 'N/A'}</p>
                </div>
              </div>
            </div>

            <Divider className="my-6" />

            {/* Cost Breakdown */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Chi phí phiên sạc</h3>
              
              <div className="space-y-3">
                {/* Energy Cost */}
                <div className="flex items-start justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Điện năng</p>
                      <p className="text-xs text-gray-500">
                        {parseFloat(session.kwhUsed || 0).toFixed(2)} kWh × {formatCurrency(4200)} đ/kWh
                      </p>
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(parseFloat(session.kwhUsed || 0) * 4200)} đ
                  </p>
                </div>

                {/* Idle Fee */}
                {session.idleFee && parseFloat(session.idleFee) > 0 && (
                  <div className="flex items-start justify-between p-3 bg-white rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Phí chờ</p>
                        <p className="text-xs text-gray-500">
                          10m × 1,000 đ/min
                        </p>
                      </div>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(session.idleFee)} đ
                    </p>
                  </div>
                )}

                <Divider className="my-3" />

                {/* Subtotal */}
                <div className="flex justify-between items-center px-3">
                  <p className="text-base text-gray-700">Tạm tính</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(session.cost || 0)} đ
                  </p>
                </div>

                {/* Discount (if subscription) */}
                <div className="flex justify-between items-center px-3">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-green-600" />
                    <p className="text-sm text-green-700">Giảm giá (Gói đăng ký)</p>
                  </div>
                  <p className="text-base font-semibold text-green-600">-25,000 đ</p>
                </div>

                {/* VAT */}
                <div className="flex justify-between items-center px-3">
                  <p className="text-sm text-gray-600">VAT (10%)</p>
                  <p className="text-base font-medium text-gray-700">
                    {formatCurrency((parseFloat(session.cost || 0) - 25000) * 0.1)} đ
                  </p>
                </div>

                <Divider className="my-3" />

                {/* Total */}
                <div className="bg-gradient-to-r from-green-100 to-blue-100 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-semibold text-gray-800">Tổng chi phí</p>
                    <p className="text-3xl font-bold text-blue-700">
                      {formatCurrency((parseFloat(session.cost || 0) - 25000) * 1.1)} đ
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Notice */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
              <div className="flex items-start space-x-3">
                <DollarSign className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-yellow-800 mb-1">
                    Thanh toán trả sau
                  </p>
                  <p className="text-sm text-yellow-700">
                    Chi phí phiên sạc này sẽ được tổng hợp vào <span className="font-semibold">hóa đơn cuối tháng</span>. 
                    Hóa đơn sẽ được gửi vào ngày 1 hàng tháng và bạn có <span className="font-semibold">7 ngày</span> để thanh toán.
                  </p>
                </div>
              </div>
            </div>

            {/* Battery Progress */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl">
              <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-4">
                <Battery className="w-5 h-5 mr-2 text-green-600" />
                Mức pin
              </h3>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Trước khi sạc</p>
                  <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center border-4 border-red-200">
                    <span className="text-2xl font-bold text-red-700">{session.startPercentage || 0}%</span>
                  </div>
                </div>

                <div className="flex-1 px-4">
                  <div className="relative">
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-gradient-to-r from-red-400 via-yellow-400 to-green-500 rounded-full transition-all duration-500"
                        style={{ width: `${((session.endPercentage || 0) - (session.startPercentage || 0))}%` }}
                      ></div>
                    </div>
                    <p className="text-center text-sm text-gray-600 mt-2">
                      +{(session.endPercentage || 0) - (session.startPercentage || 0)}%
                    </p>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Sau khi sạc</p>
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center border-4 border-green-200">
                    <span className="text-2xl font-bold text-green-700">{session.endPercentage || 0}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Divider />

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-6">
            <Button
              size="large"
              onClick={() => navigate('/driver/history')}
              className="px-8"
            >
              Xem lịch sử
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<CheckCircle size={20} />}
              onClick={() => navigate('/driver')}
              className="bg-gradient-to-r from-green-500 to-blue-600 px-8"
            >
              Hoàn tất
            </Button>
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              💡 Chi phí sẽ được tổng hợp vào hóa đơn cuối tháng
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SessionCompleted;
