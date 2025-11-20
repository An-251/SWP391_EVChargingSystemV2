import React, { useState, useEffect } from 'react';
import { message, Card, InputNumber, Button, Table, Tag, Modal, Badge, Tabs } from 'antd';
import { 
  Zap, 
  Battery, 
  Play,
  Square,
  CheckCircle,
  AlertCircle,
  Bell,
  XCircle
} from 'lucide-react';
import { useSelector } from 'react-redux';
import api from '../../configs/config-axios';
import dayjs from 'dayjs';

const EmployeeChargingControl = () => {
  const [loading, setLoading] = useState(false);
  const [pendingReservations, setPendingReservations] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const user = useSelector((state) => state.auth.user);
  
  // Form states
  const [startPercentage, setStartPercentage] = useState(20);
  const [endPercentage, setEndPercentage] = useState(80);

  // Modals
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [stopModalVisible, setStopModalVisible] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    fetchPendingReservations();
    fetchActiveSessions();
    
    const interval = setInterval(() => {
      fetchPendingReservations();
      fetchActiveSessions();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchPendingReservations = async () => {
    try {
      const response = await api.get('/reservations');
      const reservations = response.data?.data || response.data || [];
      
      // Filter by employee's facility
      const facilityReservations = user?.facilityId 
        ? reservations.filter(r => r.station?.facility?.id === user.facilityId)
        : reservations;
      
      // Show all confirmed reservations for Employee to manage
      const pending = facilityReservations.filter(r => r.status === 'confirmed');
      setPendingReservations(pending);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  const fetchActiveSessions = async () => {
    try {
      const response = await api.get('/charging-sessions/active');
      const sessions = response.data?.data || response.data || [];
      
      // Filter by employee's facility
      const facilitySessions = user?.facilityId
        ? sessions.filter(s => s.facility?.id === user.facilityId)
        : sessions;
      
      const charging = facilitySessions.filter(s => s.status === 'charging');
      setActiveSessions(charging);
    } catch (error) {
      console.error('Error fetching active sessions:', error);
    }
  };

  const handleApproveReservation = async () => {
    if (!selectedReservation || !startPercentage) {
      message.warning('Vui lòng nhập % pin hiện tại');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        vehicleId: selectedReservation.vehicle?.id,
        chargerId: selectedReservation.charger?.id || selectedReservation.chargingPoint?.chargers?.[0]?.id,
        startBatteryPercentage: startPercentage,
        reservationId: selectedReservation.id
      };

      await api.post('/charging-sessions/start', payload);
      await api.put(`/reservations/${selectedReservation.id}/status`, null, {
        params: { status: 'in_progress' }
      });

      message.success('Đã chấp nhận và bắt đầu sạc!');
      setApproveModalVisible(false);
      setSelectedReservation(null);
      setStartPercentage(20);
      fetchPendingReservations();
      fetchActiveSessions();
    } catch (error) {
      console.error('Error approving reservation:', error);
      message.error(error.response?.data?.message || 'Không thể bắt đầu sạc');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectReservation = async (reservationId) => {
    Modal.confirm({
      title: 'Xác nhận từ chối',
      content: 'Bạn có chắc muốn từ chối đặt chỗ này?',
      okText: 'Từ chối',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        try {
          await api.put(`/reservations/${reservationId}/status`, null, {
            params: { status: 'cancelled' }
          });
          message.success('Đã từ chối đặt chỗ');
          fetchPendingReservations();
        } catch (error) {
          message.error('Không thể từ chối đặt chỗ');
        }
      }
    });
  };

  const handleStopCharging = async () => {
    if (!selectedSession || !endPercentage) {
      message.warning('Vui lòng nhập % pin kết thúc');
      return;
    }

    if (endPercentage < selectedSession.startBatteryPercentage) {
      message.error('% pin kết thúc phải lớn hơn % pin bắt đầu');
      return;
    }

    setLoading(true);
    try {
      const payload = { 
        endBatteryPercentage: endPercentage 
      };
      // Use standard charging session stop API
      await api.post(`/charging-sessions/${selectedSession.id}/stop`, payload);
      
      if (selectedSession.reservationId) {
        await api.put(`/reservations/${selectedSession.reservationId}/status`, null, {
          params: { status: 'completed' }
        });
      }

      message.success('Dừng sạc thành công!');
      setStopModalVisible(false);
      setSelectedSession(null);
      setEndPercentage(80);
      fetchActiveSessions();
    } catch (error) {
      console.error('Error stopping charging:', error);
      message.error(error.response?.data?.message || 'Không thể dừng sạc');
    } finally {
      setLoading(false);
    }
  };

  const openApproveModal = (reservation) => {
    setSelectedReservation(reservation);
    setStartPercentage(20);
    setApproveModalVisible(true);
  };

  const openStopModal = (session) => {
    setSelectedSession(session);
    setEndPercentage(80);
    setStopModalVisible(true);
  };

  const getReservationType = (reservation) => {
    // Standard driver reservation
    if (reservation.driver) {
      return { 
        type: 'driver', 
        name: reservation.driver.fullName || 'Driver',
        contactPerson: reservation.driver.email || 'N/A'
      };
    }
    return { type: 'driver', name: 'Unknown Customer' };
  };

  const reservationColumns = [
    {
      title: 'Mã',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id) => `#${id}`,
    },
    {
      title: 'Loại',
      key: 'type',
      width: 120,
      render: () => (
        <Tag color="green">Khách hàng</Tag>
      ),
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_, record) => {
        const { name, contactPerson } = getReservationType(record);
        return (
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-xs text-gray-500">Liên hệ: {contactPerson}</div>
            <div className="text-xs text-gray-500">{record.vehicle?.licensePlate}</div>
          </div>
        );
      },
    },
    {
      title: 'Xe',
      key: 'vehicle',
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.vehicle?.model}</div>
          <div className="text-xs text-gray-500">{record.vehicle?.batteryCapacity} kWh</div>
        </div>
      ),
    },
    {
      title: 'Điểm sạc',
      key: 'chargingPoint',
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.chargingPoint?.pointName}</div>
          <div className="text-xs text-gray-500">{record.charger?.chargerCode}</div>
        </div>
      ),
    },
    {
      title: 'Thời gian',
      key: 'time',
      render: (_, record) => (
        <div>
          <div className="text-sm">{dayjs(record.startTime).format('DD/MM/YYYY')}</div>
          <div className="text-xs text-gray-500">
            {dayjs(record.startTime).format('HH:mm')} - {dayjs(record.endTime).format('HH:mm')}
          </div>
        </div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            type="primary"
            size="small"
            icon={<CheckCircle size={14} />}
            onClick={() => openApproveModal(record)}
          >
            Chấp nhận
          </Button>
          <Button
            danger
            size="small"
            icon={<XCircle size={14} />}
            onClick={() => handleRejectReservation(record.id)}
          >
            Từ chối
          </Button>
        </div>
      ),
    },
  ];

  const sessionColumns = [
    {
      title: 'ID',
      dataIndex: 'sessionId',
      key: 'sessionId',
      width: 80,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'driverName',
      key: 'customer',
      render: (name) => <span className="font-medium">{name}</span>,
    },
    {
      title: 'Xe',
      key: 'vehicle',
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.vehicleModel}</div>
          <div className="text-xs text-gray-500">{record.licensePlate}</div>
        </div>
      ),
    },
    {
      title: 'Điểm sạc',
      dataIndex: 'chargingPointName',
      key: 'chargingPoint',
    },
    {
      title: 'Pin bắt đầu',
      dataIndex: 'startBatteryPercentage',
      key: 'startBatteryPercentage',
      render: (pct) => (
        <div className="flex items-center gap-1">
          <Battery size={16} className="text-green-600" />
          <span>{pct}%</span>
        </div>
      ),
    },
    {
      title: 'Bắt đầu lúc',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (time) => dayjs(time).format('DD/MM HH:mm'),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="primary"
          danger
          icon={<Square size={16} />}
          onClick={() => openStopModal(record)}
        >
          Dừng sạc
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Zap className="text-blue-600" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý Sạc</h1>
            <p className="text-gray-500">Xác nhận đặt chỗ và điều khiển sạc</p>
          </div>
        </div>
        <Button
          icon={<AlertCircle size={16} />}
          onClick={() => {
            fetchPendingReservations();
            fetchActiveSessions();
          }}
        >
          Làm mới
        </Button>
      </div>

      <Tabs
        defaultActiveKey="pending"
        items={[
          {
            key: 'pending',
            label: (
              <span className="flex items-center gap-2">
                <Bell size={18} />
                Chờ xác nhận
                <Badge count={pendingReservations.length} />
              </span>
            ),
            children: (
              <Card className="shadow-sm">
                <Table
                  columns={reservationColumns}
                  dataSource={pendingReservations}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  loading={loading}
                  locale={{ emptyText: 'Không có đặt chỗ nào đang chờ' }}
                />
              </Card>
            ),
          },
          {
            key: 'active',
            label: (
              <span className="flex items-center gap-2">
                <Zap size={18} className="text-green-600" />
                Đang sạc
                <Badge count={activeSessions.length} showZero />
              </span>
            ),
            children: (
              <Card className="shadow-sm">
                <Table
                  columns={sessionColumns}
                  dataSource={activeSessions}
                  rowKey="sessionId"
                  pagination={{ pageSize: 10 }}
                  loading={loading}
                  locale={{ emptyText: 'Không có phiên sạc nào' }}
                />
              </Card>
            ),
          },
        ]}
      />

      <Modal
        title={
          <span className="flex items-center gap-2">
            <CheckCircle size={20} className="text-green-600" />
            Chấp nhận và bắt đầu sạc
          </span>
        }
        open={approveModalVisible}
        onCancel={() => {
          setApproveModalVisible(false);
          setSelectedReservation(null);
        }}
        footer={[
          <Button key="cancel" onClick={() => setApproveModalVisible(false)}>
            Hủy
          </Button>,
          <Button
            key="approve"
            type="primary"
            icon={<Play size={16} />}
            loading={loading}
            onClick={handleApproveReservation}
          >
            Bắt đầu sạc
          </Button>,
        ]}
      >
        {selectedReservation && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Mã đặt chỗ</label>
                  <p className="font-medium">#{selectedReservation.id}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Khách hàng</label>
                  <p className="font-medium">{getReservationType(selectedReservation).name}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Xe</label>
                  <p className="font-medium">{selectedReservation.vehicle?.licensePlate}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Điểm sạc</label>
                  <p className="font-medium">{selectedReservation.chargingPoint?.pointName}</p>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Battery size={16} className="inline mr-1" />
                % Pin hiện tại của xe
              </label>
              <InputNumber
                min={0}
                max={100}
                value={startPercentage}
                onChange={setStartPercentage}
                className="w-full"
                size="large"
                addonAfter="%"
              />
            </div>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Lưu ý:</strong> Sau khi chấp nhận, phiên sạc sẽ bắt đầu ngay lập tức.
              </p>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title={
          <span className="flex items-center gap-2">
            <Square size={20} className="text-red-600" />
            Dừng sạc
          </span>
        }
        open={stopModalVisible}
        onCancel={() => {
          setStopModalVisible(false);
          setSelectedSession(null);
        }}
        footer={[
          <Button key="cancel" onClick={() => setStopModalVisible(false)}>
            Hủy
          </Button>,
          <Button
            key="stop"
            type="primary"
            danger
            icon={<Square size={16} />}
            loading={loading}
            onClick={handleStopCharging}
          >
            Dừng sạc
          </Button>,
        ]}
      >
        {selectedSession && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Session ID</label>
                  <p className="font-medium">#{selectedSession.sessionId}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Xe</label>
                  <p className="font-medium">{selectedSession.licensePlate}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Khách hàng</label>
                  <p className="font-medium">{selectedSession.driverName}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Pin bắt đầu</label>
                  <p className="font-medium">{selectedSession.startBatteryPercentage}%</p>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Battery size={16} className="inline mr-1" />
                % Pin kết thúc
              </label>
              <InputNumber
                min={selectedSession.startBatteryPercentage}
                max={100}
                value={endPercentage}
                onChange={setEndPercentage}
                className="w-full"
                size="large"
                addonAfter="%"
              />
              <p className="text-xs text-gray-500 mt-1">
                Sạc được: {endPercentage - selectedSession.startBatteryPercentage}%
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EmployeeChargingControl;
