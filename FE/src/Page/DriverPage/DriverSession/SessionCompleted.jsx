import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import api from '../../../configs/config-axios';

const SessionCompleted = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // ⭐ Get estimated cost from navigation (from ActiveSession)
  const sessionDataFromNav = location.state?.sessionData;
  
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ⭐ Use navigation state if available, otherwise fetch from API
    if (sessionDataFromNav) {
      setSession(sessionDataFromNav);
      setLoading(false);
    } else {
      fetchSessionDetails();
    }
  }, [sessionId, sessionDataFromNav]);

  const fetchSessionDetails = async () => {
    try {
      const response = await api.get(`/charging-sessions/${sessionId}`);
      
      // Backend returns complete session with subscription info
      const sessionData = response.data?.data || response.data;
      setSession(sessionData);
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

  // ⭐ FIXED: Calculate duration in seconds for demo (100x faster)
  const calculateDuration = () => {
    if (!session?.startTime || !session?.endTime) return 'N/A';
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);
    const durationMs = end - start;
    const totalSeconds = Math.floor(durationMs / 1000);
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    // Display in seconds for demo
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };
  
  // ⭐ Calculate actual time (100x slower)
  const calculateActualDuration = () => {
    if (!session?.startTime || !session?.endTime) return 'N/A';
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);
    const durationMs = end - start;
    const totalSeconds = Math.floor(durationMs / 1000);
    const actualSeconds = totalSeconds * 100; // 100x slower
    
    const hours = Math.floor(actualSeconds / 3600);
    const minutes = Math.floor((actualSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
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

          {/* ⭐ NEW: Charging Mode Badge (Walk-in / Reservation) */}
          <div className="flex justify-center items-center space-x-2 mb-6">
            <Tag 
              color={session.reservation ? 'green' : 'blue'} 
              className="text-sm px-4 py-1"
            >
              {session.reservation ? (
                <>
                  <Calendar size={14} className="inline mr-1" />
                  Sạc qua đặt chỗ (Reservation)
                </>
              ) : (
                <>
                  <Zap size={14} className="inline mr-1" />
                  Sạc trực tiếp (Walk-in)
                </>
              )}
            </Tag>
            
            {session.reservation && (
              <Tag color="purple">
                Reservation ID: {session.reservation.id || session.reservation}
              </Tag>
            )}
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
                    <p className="text-sm text-gray-600 mb-1">Charger</p>
                    <p className="text-base font-medium text-gray-900">{session.charger?.chargerCode || session.chargingPointName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Công suất</p>
                    <p className="text-base font-medium text-gray-900">{session.charger?.maxPower || 'N/A'} kW</p>
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
                  <span className="text-sm text-gray-600">Thời gian sạc</span>
                </div>
                <p className="text-lg font-bold text-purple-900">{calculateDuration()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  (Demo 100x - Thực tế: {calculateActualDuration()})
                </p>
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
                {/* Start Fee */}
                {(() => {
                  const startFee = parseFloat(session.startFee || 5000);
                  
                  return (
                    <div className="flex items-start justify-between p-3 bg-white rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Zap className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Phí khởi động</p>
                          <p className="text-xs text-gray-500">Phí cố định mỗi phiên sạc</p>
                        </div>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(startFee)} đ
                      </p>
                    </div>
                  );
                })()}
                
                {/* Energy Cost */}
                {(() => {
                  const kwhUsed = parseFloat(session.kwhUsed || 0);
                  
                  // ⭐ FIX: Get pricePerKwh from session response (BE đã lấy từ chargingPoint.pricePerKwh)
                  const pricePerKwh = parseFloat(session.pricePerKwh || 3000);
                  
                  // ⭐ Calculate energy cost (kWh * price)
                  const energyCost = kwhUsed * pricePerKwh;
                  
                  return (
                    <div className="flex items-start justify-between p-3 bg-white rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Zap className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Điện năng</p>
                          <p className="text-xs text-gray-500">
                            {kwhUsed.toFixed(2)} kWh × {pricePerKwh.toLocaleString('vi-VN')} đ/kWh
                          </p>
                        </div>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(energyCost)} đ
                      </p>
                    </div>
                  );
                })()}

                {/* ⭐ NEW: Overuse Penalty (if exists) */}
                {session.overusedTime && parseFloat(session.overusedTime) > 0 && (
                  <div className="flex items-start justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-red-900">Phí phạt quá giờ</p>
                        <p className="text-xs text-red-600">
                          {parseFloat(session.overusedTime).toFixed(0)} phút overtime
                          {parseFloat(session.overusedTime) > 5 && (
                            <span> (sau grace period 5 phút)</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          💡 Pin đã đầy 100% nhưng không dừng sạc ngay
                        </p>
                      </div>
                    </div>
                    <p className="text-lg font-semibold text-red-700">
                      +{formatCurrency(session.overusePenalty || 0)} đ
                    </p>
                  </div>
                )}

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

                {/* ⭐ SIMPLIFIED: Use data from BE response directly */}
                {(() => {
                  const finalCost = parseFloat(session.cost || 0);
                  const startFee = parseFloat(session.startFee || 5000);
                  const overusePenalty = parseFloat(session.overusePenalty || 0);
                  const pricePerKwh = parseFloat(session.pricePerKwh || 3000);
                  
                  // ⭐ NEW: Get cost breakdown from BE
                  const energyCostBeforeDiscount = parseFloat(session.energyCostBeforeDiscount || 0);
                  const energyCostAfterDiscount = parseFloat(session.energyCostAfterDiscount || 0);
                  const discountRate = parseFloat(session.discountRate || 0);
                  const subscriptionPlanName = session.subscriptionPlanName;
                  
                  const hasDiscount = discountRate > 0 && subscriptionPlanName;
                  const discountAmount = energyCostBeforeDiscount - energyCostAfterDiscount;
                  
                  return (
                    <>
                      {/* Start Fee */}
                      <div className="flex justify-between items-center px-3 pt-2">
                        <p className="text-sm font-medium text-gray-600">Phí khởi động</p>
                        <p className="text-base font-semibold text-gray-700">
                          {formatCurrency(startFee)} đ
                        </p>
                      </div>
                      
                      {/* Energy Cost (before discount) */}
                      <div className="flex justify-between items-center px-3 pt-2 border-t border-gray-200">
                        <p className="text-sm font-medium text-gray-600">
                          Chi phí điện năng
                          <span className="text-xs text-gray-500 ml-1">
                            ({pricePerKwh.toLocaleString('vi-VN')} đ/kWh)
                          </span>
                        </p>
                        <p className="text-base font-semibold text-gray-700">
                          {formatCurrency(energyCostBeforeDiscount)} đ
                        </p>
                      </div>
                      
                      {/* Discount (if has subscription) */}
                      {hasDiscount && (
                        <div className="flex justify-between items-center px-3 bg-green-50 py-2 rounded mt-2">
                          <div className="flex items-center space-x-2">
                            <CreditCard className="w-4 h-4 text-green-600" />
                            <p className="text-sm text-green-700 font-medium">
                              Giảm giá {discountRate}% ({subscriptionPlanName})
                            </p>
                          </div>
                          <p className="text-base font-semibold text-green-600">
                            -{formatCurrency(discountAmount)} đ
                          </p>
                        </div>
                      )}
                      
                      {/* Show when NO subscription */}
                      {!hasDiscount && (
                        <div className="flex justify-between items-center px-3 py-2 bg-yellow-50 rounded mt-2">
                          <p className="text-sm text-gray-600">
                            💡 Không có gói subscription (giảm giá 0%)
                          </p>
                          <p className="text-sm text-gray-600">0 đ</p>
                        </div>
                      )}

                      {/* Overuse Penalty */}
                      {overusePenalty > 0 && (
                        <div className="flex justify-between items-center px-3 pt-2 border-t border-gray-200 mt-2">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="w-4 h-4 text-orange-600" />
                            <p className="text-sm font-medium text-orange-700">Phí phạt quá thời gian</p>
                          </div>
                          <p className="text-base font-semibold text-orange-600">
                            +{formatCurrency(overusePenalty)} đ
                          </p>
                        </div>
                      )}

                      <Divider className="my-3" />

                      {/* Total Cost */}
                      <div className="bg-gradient-to-r from-green-100 to-blue-100 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                          <p className="text-lg font-semibold text-gray-800">
                            Tổng chi phí {hasDiscount && <span className="text-green-600">(Đã giảm giá)</span>}
                          </p>
                          <p className="text-3xl font-bold text-blue-700">
                            {formatCurrency(finalCost)} đ
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          💡 Công thức: Phí khởi động ({formatCurrency(startFee)}) + Điện năng sau giảm giá ({formatCurrency(energyCostAfterDiscount)}) {overusePenalty > 0 && `+ Phí phạt (${formatCurrency(overusePenalty)})`}
                        </p>
                      </div>
                    </>
                  );
                })()}
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
                  {session?.subscriptionPlanName ? (
                    <p className="text-sm text-green-700 mt-2">
                      ✅ Bạn đang sử dụng gói <span className="font-semibold">{session.subscriptionPlanName}</span> với giảm giá {session.discountRate}%
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600 mt-2">
                      💡 Bạn chưa có gói subscription. <a href="/driver/select-subscription" className="text-blue-600 underline">Đăng ký ngay</a> để được giảm giá!
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ⭐ UPDATED: Overuse Warning (if penalty applied) */}
            {session.overusePenalty && parseFloat(session.overusePenalty) > 0 && (
              <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg mt-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-orange-800 mb-1">
                      ⚠️ Phí phạt quá thời gian
                    </p>
                    <p className="text-sm text-orange-700">
                      Bạn đã để xe sạc quá <strong>{parseFloat(session.overusedTime || 0).toFixed(0)} phút</strong> sau khi đạt mức pin mục tiêu ({session.endPercentage}%). 
                      Phí phạt: <strong className="text-orange-800">{formatCurrency(session.overusePenalty || 0)} đ</strong>
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      💡 <strong>Mẹo:</strong> Khi pin đạt mức mục tiêu, bạn có <strong>5 phút ân hạn</strong> để dừng session miễn phí. 
                      Sau đó sẽ tính <strong>2,000 đ/phút</strong> phí chiếm chỗ.
                    </p>
                    <p className="text-sm text-blue-600 mt-2">
                      ✅ <strong>Khuyến nghị:</strong> Dừng ngay khi pin đạt mục tiêu để tránh phí phạt và giải phóng trạm cho người khác.
                    </p>
                  </div>
                </div>
              </div>
            )}

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
