import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, InputNumber, message, Empty, Tag, Spin, Timeline } from 'antd';
import { Calendar, Clock, MapPin, Zap, Trash2, CheckCircle, XCircle } from 'lucide-react';
import api from '../../../configs/config-axios'; // FIXED: Use api instance instead of axios
import moment from 'moment';

const DriverReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [form] = Form.useForm();

  // FIXED: Use 'currentUser' key to match authSlice
  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      // FIXED: Use api instance (token auto-added by interceptor)
      const response = await api.get(`/drivers/${user.driverId}/reservations`);

      if (response.data) {
        setReservations(response.data.reservations || []);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReservation = (station, chargingPoint) => {
    setSelectedStation({ ...station, chargingPoint });
    setModalVisible(true);
  };

  const handleSubmitReservation = async (values) => {
    try {
      setLoading(true);
      // FIXED: Use api instance (no need for manual token)

      const requestData = {
        chargingPointId: selectedStation.chargingPoint.id,
        durationMinutes: values.durationMinutes
      };

      await api.post(`/drivers/${user.driverId}/reservations`, requestData);

      message.success('Đặt chỗ thành công!');
      setModalVisible(false);
      form.resetFields();
      fetchReservations();
    } catch (error) {
      message.error(error.response?.data || 'Không thể đặt chỗ');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = (reservationId) => {
    Modal.confirm({
      title: 'Hủy đặt chỗ',
      content: 'Bạn có chắc chắn muốn hủy đặt chỗ này?',
      okText: 'Hủy đặt chỗ',
      okType: 'danger',
      cancelText: 'Quay lại',
      onOk: async () => {
        try {
          // FIXED: Use api instance (no need for manual token)
          await api.delete(`/drivers/reservations/${reservationId}`);
          message.success('Đã hủy đặt chỗ');
          fetchReservations();
        } catch (error) {
          message.error('Không thể hủy đặt chỗ');
        }
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'using':
        return 'green';
      case 'inactive':
        return 'blue';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
      case 'using':
        return <Clock size={16} />;
      case 'inactive':
        return <CheckCircle size={16} />;
      default:
        return null;
    }
  };

  const formatDateTime = (dateTime) => {
    return moment(dateTime).format('DD/MM/YYYY HH:mm');
  };

  const calculateDuration = (start, end) => {
    const duration = moment(end).diff(moment(start), 'minutes');
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const activeReservations = reservations.filter(r => r.status === 'active');
  const pastReservations = reservations.filter(r => r.status !== 'active');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">📅 Đặt Chỗ Của Tôi</h1>
          <p className="text-gray-600">Quản lý các lần đặt chỗ tại trạm sạc</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Spin size="large" tip="Đang tải..." />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active Reservations */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Clock className="mr-2 text-green-500" size={24} />
                Đặt Chỗ Đang Hoạt Động ({activeReservations.length})
              </h2>
              
              {activeReservations.length === 0 ? (
                <Card className="shadow-lg">
                  <Empty
                    description="Không có đặt chỗ nào đang hoạt động"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeReservations.map((reservation) => (
                    <Card
                      key={reservation.reservationId}
                      className="shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-lg text-gray-800">
                              {reservation.stationName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {reservation.chargingPointName}
                            </p>
                          </div>
                          <Tag
                            color={getStatusColor(reservation.status)}
                            icon={getStatusIcon(reservation.status)}
                          >
                            {reservation.status}
                          </Tag>
                        </div>

                        {/* Details */}
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <Calendar className="mr-2 text-blue-500" size={16} />
                            <span className="text-gray-600">Bắt đầu:</span>
                            <span className="ml-auto font-medium">
                              {formatDateTime(reservation.startTime)}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Clock className="mr-2 text-green-500" size={16} />
                            <span className="text-gray-600">Kết thúc:</span>
                            <span className="ml-auto font-medium">
                              {formatDateTime(reservation.endTime)}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Zap className="mr-2 text-yellow-500" size={16} />
                            <span className="text-gray-600">Thời gian:</span>
                            <span className="ml-auto font-medium">
                              {calculateDuration(reservation.startTime, reservation.endTime)}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Zap className="mr-2 text-purple-500" size={16} />
                            <span className="text-gray-600">Loại cổng:</span>
                            <Tag color="blue" className="ml-auto">
                              {reservation.connectorType}
                            </Tag>
                          </div>
                        </div>

                        {/* Actions */}
                        <Button
                          danger
                          block
                          icon={<Trash2 size={18} />}
                          onClick={() => handleCancelReservation(reservation.reservationId)}
                        >
                          Hủy Đặt Chỗ
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Past Reservations */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Calendar className="mr-2 text-gray-500" size={24} />
                Lịch Sử Đặt Chỗ ({pastReservations.length})
              </h2>
              
              {pastReservations.length === 0 ? (
                <Card className="shadow-lg">
                  <Empty
                    description="Chưa có lịch sử đặt chỗ"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </Card>
              ) : (
                <Card className="shadow-lg">
                  <Timeline>
                    {pastReservations.map((reservation) => (
                      <Timeline.Item
                        key={reservation.reservationId}
                        color={getStatusColor(reservation.status)}
                        dot={getStatusIcon(reservation.status)}
                      >
                        <div className="pb-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-800">
                                {reservation.stationName}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {reservation.chargingPointName} - {reservation.connectorType}
                              </p>
                            </div>
                            <Tag color={getStatusColor(reservation.status)}>
                              {reservation.status}
                            </Tag>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>
                              <Clock size={14} className="inline mr-1" />
                              {formatDateTime(reservation.startTime)} → {formatDateTime(reservation.endTime)}
                            </div>
                            <div>
                              <Zap size={14} className="inline mr-1" />
                              Thời gian: {calculateDuration(reservation.startTime, reservation.endTime)}
                            </div>
                          </div>
                        </div>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Reservation Modal */}
        <Modal
          title={
            <div className="flex items-center space-x-2">
              <Calendar size={24} />
              <span>Đặt Chỗ Trạm Sạc</span>
            </div>
          }
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
          }}
          footer={null}
          width={500}
        >
          {selectedStation && (
            <div className="mb-6">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center">
                  <MapPin className="mr-2 text-blue-500" size={18} />
                  <span className="font-semibold">{selectedStation.stationName}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Zap className="mr-2 text-green-500" size={16} />
                  <span>{selectedStation.chargingPoint.pointName}</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-gray-600">Loại cổng:</span>
                  <Tag color="blue" className="ml-2">
                    {selectedStation.chargingPoint.connectorType}
                  </Tag>
                </div>
              </div>
            </div>
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmitReservation}
            initialValues={{ durationMinutes: 60 }}
          >
            <Form.Item
              label="Thời gian đặt chỗ (phút)"
              name="durationMinutes"
              rules={[
                { required: true, message: 'Vui lòng nhập thời gian!' },
                { type: 'number', min: 15, max: 180, message: 'Thời gian từ 15-180 phút!' }
              ]}
            >
              <InputNumber
                size="large"
                className="w-full"
                min={15}
                max={180}
                step={15}
                addonAfter="phút"
              />
            </Form.Item>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Lưu ý:</strong> Thời gian đặt chỗ sẽ bắt đầu ngay khi bạn xác nhận.
                Vui lòng đến trạm sạc đúng giờ để tránh mất chỗ.
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                size="large"
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={loading}
                className="bg-gradient-to-r from-green-500 to-blue-500"
              >
                Xác Nhận Đặt Chỗ
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default DriverReservations;
