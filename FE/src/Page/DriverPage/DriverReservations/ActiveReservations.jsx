import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, Empty, Button, Tag, Modal, message } from 'antd';
import { MapPin, Clock, Zap, QrCode, XCircle, Calendar } from 'lucide-react';
import moment from 'moment';
import api from '../../../configs/config-axios';
import { RESERVATION_STATUS } from '../../../constants/statusConstants';
import QRScanner from '../components/QRScanner';

const ActiveReservations = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [scanningReservation, setScanningReservation] = useState(null);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);

  // Fetch active reservations
  const fetchActiveReservations = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/drivers/${user.driverId}/reservations`);
      
      console.log('🔍 [ActiveReservations] Raw response:', response.data);
      
      // BE returns { reservations: [...] }
      let reservationData = response.data.reservations || response.data;
      
      // Handle both single object and array response
      if (!Array.isArray(reservationData)) {
        reservationData = reservationData ? [reservationData] : [];
      }
      
      console.log('🔍 [ActiveReservations] Reservation data:', reservationData);
      console.log('🔍 [ActiveReservations] All available statuses:', 
        reservationData.map(r => r.status));
      
      // ⭐ FIX: BE returns lowercase "active", not uppercase
      // Filter ACTIVE reservations (case-insensitive)
      const activeReservations = reservationData.filter(r => {
        const status = (r.status || '').toLowerCase();
        // BE uses "active" for active reservations
        const isActive = status === 'active';
        
        console.log('🔍 [ActiveReservations] Checking reservation:', { 
          id: r.reservationId || r.id, 
          status: r.status, 
          statusLower: status,
          isActive: isActive
        });
        
        return isActive;
      });
      
      console.log('✅ [ActiveReservations] Filtered active reservations:', activeReservations);
      
      setReservations(activeReservations);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      message.error('Không thể tải danh sách đặt chỗ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.driverId) {
      fetchActiveReservations();
      
      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchActiveReservations, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Handle cancel reservation
  const handleCancel = async (reservationId) => {
    Modal.confirm({
      title: 'Xác nhận hủy đặt chỗ',
      content: 'Bạn có chắc chắn muốn hủy đặt chỗ này?',
      okText: 'Hủy đặt chỗ',
      cancelText: 'Không',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setCancellingId(reservationId);
          // ⭐ BE requires driverId as @RequestParam for validation
          await api.delete(`/drivers/reservations/${reservationId}?driverId=${user.driverId}`);
          message.success('Đã hủy đặt chỗ thành công');
          fetchActiveReservations();
        } catch (error) {
          console.error('Error cancelling reservation:', error);
          const errorMessage = typeof error.response?.data === 'string' 
            ? error.response.data 
            : error.response?.data?.message || 'Không thể hủy đặt chỗ';
          message.error(errorMessage);
        } finally {
          setCancellingId(null);
        }
      },
    });
  };

  // Handle scan QR code
  const handleScanQR = async (reservation) => {
    setScanningReservation(reservation);
    setQrScannerOpen(true);
  };

  // Handle QR scan success
  const handleQRScanSuccess = (qrData) => {
    console.log('✅ [QR] Scan successful:', qrData);
    
    // Close scanner
    setQrScannerOpen(false);
    
    if (!scanningReservation) {
      message.error('Không tìm thấy thông tin đặt chỗ');
      return;
    }
    
    // Navigate to battery selection page with QR data
    const enrichedQrData = {
      chargingPointId: scanningReservation.chargingPointId,
      chargerId: scanningReservation.chargerId, // ⭐ Add chargerId from reservation
      stationId: scanningReservation.stationId,
      currentBattery: 20, // TODO: Get from vehicle telemetry
      vehicleBatteryCapacity: 60, // TODO: Get from selected vehicle
      driverId: qrData.driverId,
      qrCode: qrData.qrCode,
      timestamp: qrData.timestamp,
    };
    
    navigate('/driver/start-charging', { 
      state: { 
        reservation: scanningReservation, 
        qrData: enrichedQrData 
      } 
    });
    
    // Reset state
    setScanningReservation(null);
  };

  // Handle QR scanner close
  const handleQRScannerClose = () => {
    setQrScannerOpen(false);
    setScanningReservation(null);
  };

  // Check if reservation is expiring soon (within 15 minutes)
  const isExpiringSoon = (reservation) => {
    const expiryTime = moment(reservation.endTime); // BE uses endTime
    const now = moment();
    const minutesLeft = expiryTime.diff(now, 'minutes');
    return minutesLeft <= 15 && minutesLeft > 0;
  };

  // Check if reservation is expired
  const isExpired = (reservation) => {
    return moment(reservation.endTime).isBefore(moment()); // BE uses endTime
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              🎫 Đặt chỗ hiện tại
            </h1>
            <p className="text-gray-600">Xác thực QR code để bắt đầu sạc</p>
          </div>
          <Button
            type="default"
            icon={<Calendar size={18} />}
            onClick={() => navigate('/driver/reservations/history')}
          >
            Lịch sử đặt chỗ
          </Button>
        </div>

        {/* Active Reservations */}
        {reservations.length === 0 ? (
          <Card className="shadow-lg">
            <Empty
              description="Bạn chưa có đặt chỗ nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button
                type="primary"
                onClick={() => navigate('/driver/map')}
                icon={<MapPin size={16} />}
                className="bg-green-500 hover:bg-green-600"
              >
                Tìm trạm sạc
              </Button>
            </Empty>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reservations.map((reservation) => {
              const expired = isExpired(reservation);
              const expiringSoon = isExpiringSoon(reservation);
              
              return (
                <Card
                  key={reservation.id}
                  className={`shadow-lg ${
                    expired ? 'border-2 border-red-300' :
                    expiringSoon ? 'border-2 border-yellow-300' :
                    'border-2 border-green-300'
                  }`}
                >
                  {/* Status Tag */}
                  <div className="mb-4">
                    {expired ? (
                      <Tag color="red" className="text-sm">
                        ⏰ Đã hết hạn
                      </Tag>
                    ) : expiringSoon ? (
                      <Tag color="orange" className="text-sm">
                        ⚠️ Sắp hết hạn
                      </Tag>
                    ) : (
                      <Tag color="green" className="text-sm">
                        ✅ Đang hoạt động
                      </Tag>
                    )}
                  </div>

                  {/* Station Info */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {reservation.stationName || 'N/A'}
                    </h3>
                  </div>

                  {/* Charging Point Info */}
                  <div className="bg-blue-50 p-3 rounded-lg mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Điểm sạc:</span>
                      <span className="font-semibold text-blue-700">
                        {reservation.chargingPointName || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Loại:</span>
                      <span className="font-medium text-gray-700">
                        {reservation.connectorType || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Time Info */}
                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Đặt lúc:</span>
                      <span className="text-sm font-medium">
                        {moment(reservation.startTime).format('DD/MM/YYYY HH:mm')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Hết hạn:</span>
                      <span className={`text-sm font-semibold ${
                        expired ? 'text-red-600' :
                        expiringSoon ? 'text-orange-600' :
                        'text-green-600'
                      }`}>
                        {moment(reservation.endTime).format('DD/MM/YYYY HH:mm')}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      type="primary"
                      size="large"
                      icon={<QrCode size={18} />}
                      onClick={() => handleScanQR(reservation)}
                      disabled={expired}
                      className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300"
                    >
                      Quét QR Code
                    </Button>
                    <Button
                      danger
                      size="large"
                      icon={<XCircle size={18} />}
                      onClick={() => handleCancel(reservation.id)}
                      loading={cancellingId === reservation.id}
                      disabled={expired}
                    >
                      Hủy
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={qrScannerOpen}
        onClose={handleQRScannerClose}
        onScanSuccess={handleQRScanSuccess}
        expectedDriverId={user?.driverId}
      />
    </div>
  );
};

export default ActiveReservations;
