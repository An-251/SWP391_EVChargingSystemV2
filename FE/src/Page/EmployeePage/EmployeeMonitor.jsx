import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Badge, Tabs, Statistic, Row, Col } from 'antd';
import { 
  Zap, 
  Battery, 
  Clock,
  CheckCircle,
  AlertCircle,
  Eye
} from 'lucide-react';
import { useSelector } from 'react-redux';
import api from '../../configs/config-axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const EmployeeMonitor = () => {
  const [loading, setLoading] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [completedToday, setCompletedToday] = useState([]);
  const [error, setError] = useState(null);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    console.log('🔍 EmployeeMonitor - Component mounted');
    console.log('👤 User:', user);
    fetchData();
    
    // Auto refresh every 15 seconds
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📡 Fetching data...');
      await Promise.all([
        fetchReservations(),
        fetchActiveSessions(),
        fetchCompletedSessions()
      ]);
      console.log('✅ Data fetched successfully');
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    try {
      // Use facility-specific endpoint if user has facilityId
      const endpoint = user?.facilityId 
        ? `/reservations/facility/${user.facilityId}`
        : '/reservations';
      
      console.log('📡 Fetching reservations from:', endpoint);
      const response = await api.get(endpoint);
      const allReservations = response.data?.data || response.data || [];
      
      console.log('✅ Reservations fetched:', allReservations.length);
      setReservations(allReservations);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setReservations([]); // Set empty array on error
    }
  };

  const fetchActiveSessions = async () => {
    try {
      // Use facility-specific endpoint if user has facilityId
      const endpoint = user?.facilityId 
        ? `/charging-sessions/facility/${user.facilityId}?status=charging`
        : '/charging-sessions/active';
      
      console.log('📡 Fetching active sessions from:', endpoint);
      const response = await api.get(endpoint);
      
      const allSessions = Array.isArray(response.data?.data) 
        ? response.data.data 
        : Array.isArray(response.data) 
        ? response.data 
        : [];
      
      console.log('✅ Active sessions fetched:', allSessions.length);
      setActiveSessions(allSessions.filter(s => s.status === 'charging'));
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setActiveSessions([]); // Set empty array on error
    }
  };

  const fetchCompletedSessions = async () => {
    try {
      // Use facility-specific endpoint if user has facilityId
      const endpoint = user?.facilityId 
        ? `/charging-sessions/facility/${user.facilityId}?status=completed`
        : '/charging-sessions?status=completed';
      
      console.log('📡 Fetching completed sessions from:', endpoint);
      const response = await api.get(endpoint);
      
      const allSessions = Array.isArray(response.data?.data) 
        ? response.data.data 
        : Array.isArray(response.data) 
        ? response.data 
        : [];
      
      const today = dayjs().startOf('day');
      const completed = allSessions.filter(s => 
        s.status === 'completed' && 
        s.endTime &&
        dayjs(s.endTime).isAfter(today)
      );
      
      console.log('✅ Completed sessions today:', completed.length);
      setCompletedToday(completed);
    } catch (error) {
      console.error('Error fetching completed sessions:', error);
      setCompletedToday([]); // Set empty array on error
    }
  };

  const reservationColumns = [
    {
      title: 'Mã',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id) => <span className="font-mono">#{id}</span>,
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.driver?.fullName || 'N/A'}</div>
          <div className="text-xs text-gray-500">{record.vehicle?.licensePlate}</div>
        </div>
      ),
    },
    {
      title: 'Điểm sạc',
      dataIndex: ['chargingPoint', 'pointName'],
      key: 'chargingPoint',
    },
    {
      title: 'Trạm',
      dataIndex: ['station', 'stationName'],
      key: 'station',
    },
    {
      title: 'Thời gian',
      key: 'time',
      render: (_, record) => (
        <div className="text-sm">
          <div>{dayjs(record.startTime).format('DD/MM/YYYY')}</div>
          <div className="text-gray-500">
            {dayjs(record.startTime).format('HH:mm')} - {dayjs(record.endTime).format('HH:mm')}
          </div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => {
        const statusMap = {
          'pending': { color: 'orange', text: 'Chờ xác nhận', icon: <Clock size={14} /> },
          'confirmed': { color: 'blue', text: 'Đã xác nhận', icon: <CheckCircle size={14} /> },
          'in-progress': { color: 'green', text: 'Đang sử dụng', icon: <Zap size={14} /> },
          'completed': { color: 'gray', text: 'Hoàn thành', icon: <CheckCircle size={14} /> },
          'cancelled': { color: 'red', text: 'Đã hủy', icon: <AlertCircle size={14} /> }
        };
        const status = statusMap[record.status] || { color: 'default', text: record.status };
        return (
          <Tag color={status.color} icon={status.icon}>
            {status.text}
          </Tag>
        );
      },
    },
  ];

  const sessionColumns = [
    {
      title: 'ID Phiên',
      dataIndex: 'sessionId',
      key: 'sessionId',
      width: 80,
      render: (id) => <span className="font-mono">{id}</span>,
    },
    {
      title: 'Xe',
      key: 'vehicle',
      width: 140,
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.vehicleModel}</div>
          <div className="text-xs text-gray-500">{record.licensePlate}</div>
        </div>
      ),
    },
    {
      title: 'Cơ sở',
      dataIndex: 'facilityName',
      key: 'facility',
      width: 120,
      render: (name) => name || 'N/A',
    },
    {
      title: 'Trạm sạc',
      dataIndex: 'stationName',
      key: 'station',
      width: 140,
      render: (name) => name || 'N/A',
    },
    {
      title: 'Điểm sạc',
      dataIndex: 'chargingPointName',
      key: 'chargingPoint',
      width: 120,
    },
    {
      title: 'Pin',
      key: 'battery',
      width: 140,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Battery size={16} className="text-green-600" />
          <span className="font-medium">{record.startPercentage}%</span>
          <span className="text-gray-400">→</span>
          <span className="font-medium text-blue-600">{record.endPercentage || '?'}%</span>
        </div>
      ),
    },
    {
      title: 'Thời gian bắt đầu',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 130,
      render: (time) => (
        <div className="text-sm">
          <div>{dayjs(time).format('HH:mm:ss')}</div>
          <div className="text-xs text-gray-500">{dayjs(time).fromNow()}</div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 120,
      render: () => (
        <Tag color="green" icon={<Zap size={14} />}>
          Đang sạc
        </Tag>
      ),
    },
  ];

  const completedColumns = [
    {
      title: 'ID',
      dataIndex: 'sessionId',
      width: 70,
      render: (id) => <span className="font-mono text-xs">{id}</span>,
    },
    {
      title: 'Xe',
      dataIndex: 'licensePlate',
      key: 'vehicle',
      width: 100,
    },
    {
      title: 'Cơ sở',
      dataIndex: 'facilityName',
      key: 'facility',
      width: 120,
      render: (name) => name || 'N/A',
    },
    {
      title: 'Trạm sạc',
      dataIndex: 'stationName',
      key: 'station',
      width: 140,
      render: (name) => name || 'N/A',
    },
    {
      title: 'Điểm sạc',
      dataIndex: 'chargingPointName',
      key: 'point',
      width: 120,
    },
    {
      title: 'Năng lượng',
      key: 'energy',
      width: 100,
      render: (_, record) => {
        const energy = record.kwhUsed || 0;
        return <span className="font-medium">{energy.toFixed(2)} kWh</span>;
      },
    },
    {
      title: 'Thời gian',
      key: 'duration',
      width: 90,
      render: (_, record) => {
        const duration = record.durationMinutes || 0;
        return <span>{duration} phút</span>;
      },
    },
    {
      title: 'Hoàn thành',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 120,
      render: (time) => dayjs(time).format('HH:mm DD/MM'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Theo dõi Hoạt động</h1>
          <p className="text-gray-500 mt-1">
            Cơ sở: <span className="font-medium">{user?.facilityName || 'Tất cả'}</span>
          </p>
        </div>
        <Badge status="processing" text="Tự động cập nhật mỗi 15s" />
      </div>

      {/* Error Message */}
      {error && (
        <Card className="bg-red-50 border-red-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-600" size={20} />
            <div>
              <p className="font-medium text-red-900">{error}</p>
              <button 
                onClick={fetchData}
                className="text-sm text-red-700 underline mt-1"
              >
                Thử lại
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm">
            <Statistic
              title="Đặt chỗ chờ xác nhận"
              value={reservations.filter(r => r.status === 'pending' || r.status === 'confirmed').length}
              prefix={<Clock className="text-orange-500" size={20} />}
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm">
            <Statistic
              title="Đang sạc"
              value={activeSessions.length}
              prefix={<Zap className="text-green-500" size={20} />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm">
            <Statistic
              title="Hoàn thành hôm nay"
              value={completedToday.length}
              prefix={<CheckCircle className="text-blue-500" size={20} />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Card className="shadow-sm">
        <Tabs
          defaultActiveKey="reservations"
          items={[
            {
              key: 'reservations',
              label: (
                <span className="flex items-center gap-2">
                  <Eye size={16} />
                  Đặt chỗ ({reservations.length})
                </span>
              ),
              children: (
                <Table
                  columns={reservationColumns}
                  dataSource={reservations}
                  rowKey={(record) => record.id || `reservation-${Math.random()}`}
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                  size="small"
                />
              ),
            },
            {
              key: 'active',
              label: (
                <span className="flex items-center gap-2">
                  <Zap size={16} />
                  Đang sạc ({activeSessions.length})
                </span>
              ),
              children: (
                <Table
                  columns={sessionColumns}
                  dataSource={activeSessions}
                  rowKey={(record) => record.sessionId || `session-${Math.random()}`}
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                  size="small"
                />
              ),
            },
            {
              key: 'completed',
              label: (
                <span className="flex items-center gap-2">
                  <CheckCircle size={16} />
                  Hoàn thành hôm nay ({completedToday.length})
                </span>
              ),
              children: (
                <Table
                  columns={completedColumns}
                  dataSource={completedToday}
                  rowKey={(record) => record.sessionId || `completed-${Math.random()}`}
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                  size="small"
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Info Note */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-blue-600 mt-1" size={20} />
          <div>
            <p className="font-medium text-blue-900">Chế độ xem</p>
            <p className="text-sm text-blue-700 mt-1">
              Bạn đang ở chế độ theo dõi. Các đặt chỗ và phiên sạc được quản lý tự động bởi hệ thống. 
              Driver tự xác nhận và bắt đầu sạc thông qua app của họ.
            </p>
            {(reservations.length === 0 && activeSessions.length === 0 && completedToday.length === 0) && (
              <p className="text-sm text-blue-600 mt-2 font-medium">
                ℹ️ Chưa có dữ liệu. API endpoints có thể chưa được triển khai.
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EmployeeMonitor;
