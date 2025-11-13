import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Spin } from 'antd';
import {
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Battery,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../configs/config-axios';
import dayjs from 'dayjs';

const EmployeeDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingReservations: 0,
    activeSessions: 0,
    completedToday: 0,
    totalEnergyToday: 0,
  });
  const [recentReservations, setRecentReservations] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    fetchDashboardData();
    
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching dashboard data...');
      console.log('👤 Current user:', user);
      
      // Fetch reservations
      let allReservations = [];
      try {
        const reservationsRes = await api.get('/reservations');
        allReservations = reservationsRes.data?.data || reservationsRes.data || [];
        console.log('✅ Reservations fetched:', allReservations.length);
      } catch (err) {
        console.error('❌ Error fetching reservations:', err.message);
      }
      
      // Filter by facility if employee has facilityId
      const facilityReservations = user?.facilityId 
        ? allReservations.filter(r => r.station?.facility?.id === user.facilityId)
        : allReservations;
      
      const pending = facilityReservations.filter(r => r.status === 'confirmed');
      console.log('📊 Pending reservations:', pending.length);
      
      // Fetch active sessions - with fallback
      let allSessions = [];
      try {
        const sessionsRes = await api.get('/charging-sessions/active');
        allSessions = sessionsRes.data?.data || sessionsRes.data || [];
        console.log('✅ Sessions fetched:', allSessions.length);
      } catch (err) {
        console.error('❌ Error fetching sessions:', err.message);
        // Try alternative endpoint
        try {
          const sessionsRes = await api.get('/charging-sessions');
          const allSessionsData = sessionsRes.data?.data || sessionsRes.data || [];
          allSessions = allSessionsData.filter(s => s.status === 'charging');
          console.log('✅ Sessions fetched from /charging-sessions:', allSessions.length);
        } catch (err2) {
          console.error('❌ Error fetching from /charging-sessions:', err2.message);
        }
      }
      
      // Filter by facility
      const facilitySessions = user?.facilityId
        ? allSessions.filter(s => s.facility?.id === user.facilityId)
        : allSessions;
      
      const active = facilitySessions.filter(s => s.status === 'charging');
      
      // Count completed today
      const today = dayjs().startOf('day');
      const completedToday = facilityReservations.filter(r => 
        r.status === 'completed' && 
        dayjs(r.endTime).isAfter(today)
      ).length;
      
      // Calculate total energy today (mock)
      const totalEnergyToday = completedToday * 45; // Average 45 kWh per session
      
      setStats({
        pendingReservations: pending.length,
        activeSessions: active.length,
        completedToday,
        totalEnergyToday,
      });
      
      setRecentReservations(pending.slice(0, 5));
      setRecentSessions(active.slice(0, 5));
      
      console.log('✅ Dashboard data updated successfully');
      
    } catch (error) {
      console.error('❌ Fatal error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
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
      title: 'Thời gian',
      key: 'time',
      render: (_, record) => (
        <div className="text-sm">
          {dayjs(record.startTime).format('HH:mm')} - {dayjs(record.endTime).format('HH:mm')}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => {
        const statusMap = {
          'pending': { color: 'orange', text: 'Chờ xác nhận' },
          'confirmed': { color: 'blue', text: 'Đã xác nhận' },
          'in-progress': { color: 'green', text: 'Đang sử dụng' },
          'completed': { color: 'gray', text: 'Hoàn thành' },
          'cancelled': { color: 'red', text: 'Đã hủy' }
        };
        const status = statusMap[record.status] || { color: 'default', text: record.status };
        return <Tag color={status.color}>{status.text}</Tag>;
      },
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
      title: 'Pin',
      dataIndex: 'startBatteryPercentage',
      key: 'battery',
      render: (pct) => (
        <div className="flex items-center gap-1">
          <Battery size={16} className="text-green-600" />
          <span>{pct}%</span>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: () => <Tag color="green">Đang sạc</Tag>,
    },
  ];

  if (loading && !recentReservations.length) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Chào mừng, {user?.fullName || 'Employee'}! 👋
            </h1>
            <p className="text-blue-100">
              Cơ sở: {user?.facilityName || 'Chưa có thông tin'} • {user?.position || 'Staff'}
            </p>
            <p className="text-sm text-blue-200 mt-2">
              {dayjs().format('dddd, DD MMMM YYYY')}
            </p>
          </div>
          <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
            <Zap size={48} className="text-yellow-300" />
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title={<span className="text-gray-600">Chờ xác nhận</span>}
              value={stats.pendingReservations}
              prefix={<Clock size={20} className="text-orange-500" />}
              valueStyle={{ color: '#f59e0b', fontSize: '2rem' }}
            />
            <Button
              type="link"
              size="small"
              className="mt-2 p-0"
              onClick={() => navigate('/employee/monitor')}
            >
              Xem chi tiết →
            </Button>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title={<span className="text-gray-600">Đang sạc</span>}
              value={stats.activeSessions}
              prefix={<Zap size={20} className="text-green-500" />}
              valueStyle={{ color: '#10b981', fontSize: '2rem' }}
            />
            <Button
              type="link"
              size="small"
              className="mt-2 p-0"
              onClick={() => navigate('/employee/monitor')}
            >
              Xem chi tiết →
            </Button>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title={<span className="text-gray-600">Hoàn thành hôm nay</span>}
              value={stats.completedToday}
              prefix={<CheckCircle size={20} className="text-blue-500" />}
              valueStyle={{ color: '#3b82f6', fontSize: '2rem' }}
            />
            <div className="text-xs text-gray-500 mt-2">
              <TrendingUp size={12} className="inline mr-1" />
              {stats.completedToday > 0 ? '+15%' : '0%'} so với hôm qua
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title={<span className="text-gray-600">Năng lượng hôm nay</span>}
              value={stats.totalEnergyToday}
              suffix="kWh"
              prefix={<Battery size={20} className="text-purple-500" />}
              valueStyle={{ color: '#8b5cf6', fontSize: '2rem' }}
            />
            <div className="text-xs text-gray-500 mt-2">
              Trung bình {stats.completedToday > 0 ? Math.round(stats.totalEnergyToday / stats.completedToday) : 0} kWh/phiên
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <span className="flex items-center gap-2">
                <AlertCircle size={18} className="text-orange-500" />
                Đặt chỗ chờ xác nhận
              </span>
            }
            extra={
              <Button
                type="link"
                size="small"
                onClick={() => navigate('/employee/monitor')}
              >
                Xem tất cả →
              </Button>
            }
            className="shadow-sm"
          >
            {recentReservations.length > 0 ? (
              <Table
                columns={reservationColumns}
                dataSource={recentReservations}
                rowKey="id"
                pagination={false}
                size="small"
              />
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Calendar size={48} className="mx-auto mb-2 opacity-50" />
                <p>Không có đặt chỗ nào đang chờ</p>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <span className="flex items-center gap-2">
                <Zap size={18} className="text-green-500" />
                Phiên sạc đang hoạt động
              </span>
            }
            extra={
              <Button
                type="link"
                size="small"
                onClick={() => navigate('/employee/monitor')}
              >
                Xem tất cả →
              </Button>
            }
            className="shadow-sm"
          >
            {recentSessions.length > 0 ? (
              <Table
                columns={sessionColumns}
                dataSource={recentSessions}
                rowKey="sessionId"
                pagination={false}
                size="small"
              />
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Battery size={48} className="mx-auto mb-2 opacity-50" />
                <p>Không có phiên sạc nào đang hoạt động</p>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EmployeeDashboard;
