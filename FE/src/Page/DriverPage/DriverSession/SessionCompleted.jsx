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
import { formatVND, formatKWh, formatTime } from '../../../utils/formatNumber';

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
                <p className="text-sm text-green-100 mb-1">EV Charge</p>
                <p className="text-xs text-green-200">Eco-friendly charging solutions</p>
              </div>
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
                      {session.connectorType || 'DC Fast Charger'}
                    </Tag>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Charger</p>
                    <p className="text-base font-medium text-gray-900">{ session.chargingPointName || 'N/A'}</p>
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
                  <span className="text-sm text-gray-600">Chi tiết thời gian</span>
                </div>
                {/* Show breakdown if available */}
                {session.actualChargingMinutes && parseFloat(session.actualChargingMinutes) > 0 ? (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">⚡ Sạc:</span>
                      <span className="font-semibold text-green-700">{formatTime(session.actualChargingMinutes)} phút</span>
                    </div>
                    {session.idleMinutes && parseFloat(session.idleMinutes) > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">🅿️ Đậu xe:</span>
                        <span className="font-semibold text-orange-600">{formatTime(session.idleMinutes)} phút</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm border-t pt-1 mt-1">
                      <span className="text-purple-600 font-medium">Tổng:</span>
                      <span className="font-bold text-purple-900">{calculateDuration()}</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-lg font-bold text-purple-900">{calculateDuration()}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      (Demo 100x - Thực tế: {calculateActualDuration()})
                    </p>
                  </>
                )}
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
                        {formatVND(startFee)} đ
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
                            {formatKWh(kwhUsed)} kWh × {formatVND(pricePerKwh)} đ/kWh
                          </p>
                        </div>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatVND(energyCost)} đ
                      </p>
                    </div>
                  );
                })()}

                {/* ⭐ NEW: Overuse Penalty với breakdown chi tiết */}
                {session.overusePenalty && parseFloat(session.overusePenalty) > 0 && (
                  <div className="flex items-start justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-orange-900">Phí phạt đậu xe quá giờ</p>
                        <p className="text-xs text-orange-600">
                          {session.idleMinutes && parseFloat(session.idleMinutes) > 0 ? (
                            <>
                              Đậu xe: <strong>{formatTime(session.idleMinutes)} phút</strong>
                              {session.penaltyMinutes && parseFloat(session.penaltyMinutes) > 0 && (
                                <> → Tính phí: <strong>{formatTime(session.penaltyMinutes)} phút</strong> (trừ 1 phút free)</>
                              )}
                            </>
                          ) : (
                            <>
                              {formatTime(session.overusedTime || 0)} phút idle
                              {parseFloat(session.overusedTime || 0) > 1 && (
                                <span> (sau grace period 1 phút)</span>
                              )}
                            </>
                          )}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {session.reservation ? (
                            <>⚠️ Vượt thời gian đặt chỗ (Reservation)</>
                          ) : (
                            <>💡 Pin đã đầy nhưng không rời trạm</>
                          )}
                        </p>
                      </div>
                    </div>
                    <p className="text-lg font-semibold text-orange-700">
                      +{formatVND(session.overusePenalty || 0)} đ
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
                      {formatVND(session.idleFee)} đ
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
                          {formatVND(startFee)} đ
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
                          {formatVND(energyCostBeforeDiscount)} đ
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
                            -{formatVND(discountAmount)} đ
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
                            +{formatVND(overusePenalty)} đ
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
                            {formatVND(finalCost)} đ
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          💡 Công thức: Phí khởi động ({formatVND(startFee)}) + Điện năng sau giảm giá ({formatVND(energyCostAfterDiscount)}) {overusePenalty > 0 && `+ Phí phạt (${formatVND(overusePenalty)})`}
                        </p>
                      </div>
                    </>
                  );
                })()}
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
