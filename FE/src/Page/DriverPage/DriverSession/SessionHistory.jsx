import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Table, Card, Statistic, Button, Select, Tag, Empty } from 'antd';
import { Clock, Zap, DollarSign, MapPin, Battery } from 'lucide-react';
import { fetchAllSessions, fetchTotalCost } from '../../../redux/session/sessionSlice';

const { Option } = Select;

const SessionHistory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user } = useSelector((state) => state.auth);
  const { sessions, totalCost, loading } = useSelector((state) => state.session);

  const [statusFilter, setStatusFilter] = useState('ALL');

  // Fetch data on mount
  useEffect(() => {
    if (user?.driverId) {
      dispatch(fetchAllSessions(user.driverId));
      dispatch(fetchTotalCost(user.driverId));
    }
  }, [user, dispatch]);

  // Filter sessions by status
  const filteredSessions = statusFilter === 'ALL'
    ? sessions
    : sessions.filter((s) => s.status === statusFilter);

  // Calculate statistics
  const completedSessions = sessions.filter((s) => s.status === 'COMPLETED');
  const totalEnergy = completedSessions.reduce((sum, s) => sum + (parseFloat(s.kwhUsed) || 0), 0);

  // Table columns
  const columns = [
    {
      title: 'Ngày',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (date) => new Date(date).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    },
    {
      title: 'Trạm sạc',
      dataIndex: 'stationName',
      key: 'stationName',
      render: (name) => name || 'N/A',
    },
    {
      title: 'Xe',
      key: 'vehicle',
      render: (record) => {
        const vehicleName = record.vehicleName || record.vehicleModel || 'N/A';
        const licensePlate = record.licensePlate || 'N/A';
        
        return (
          <div>
            <div className="font-medium">{vehicleName}</div>
            <div className="text-xs text-gray-500">{licensePlate}</div>
          </div>
        );
      },
    },
    {
      title: 'Pin',
      key: 'battery',
      render: (record) => (
        <span className="text-sm">
          {record.startPercentage}% → {record.endPercentage || '?'}%
        </span>
      ),
    },
    {
      title: 'Thời gian',
      dataIndex: 'durationMinutes',
      key: 'duration',
      render: (minutes) => {
        if (!minutes) return 'N/A';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
      },
    },
    {
      title: 'Chi phí',
      dataIndex: 'cost',
      key: 'cost',
      render: (cost) => (
        <span className="font-semibold text-green-600">
          {cost ? `${parseFloat(cost).toLocaleString()} VNĐ` : 'N/A'}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          COMPLETED: 'green',
          ACTIVE: 'blue',
          CANCELLED: 'red',
        };
        const labels = {
          COMPLETED: 'Hoàn thành',
          ACTIVE: 'Đang sạc',
          CANCELLED: 'Đã hủy',
        };
        return <Tag color={colors[status] || 'default'}>{labels[status] || status}</Tag>;
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            📊 Lịch sử sạc điện
          </h1>
          <p className="text-gray-600">Xem lại các phiên sạc đã hoàn thành</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="shadow-lg">
            <Statistic
              title={<span className="flex items-center"><Zap className="mr-2" size={16} />Tổng phiên sạc</span>}
              value={sessions.length}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>

          <Card className="shadow-lg">
            <Statistic
              title={<span className="flex items-center"><CheckCircle className="mr-2" size={16} />Hoàn thành</span>}
              value={completedSessions.length}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>

          <Card className="shadow-lg">
            <Statistic
              title={<span className="flex items-center"><Battery className="mr-2" size={16} />Tổng điện năng</span>}
              value={totalEnergy.toFixed(2)}
              suffix="kWh"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>

          <Card className="shadow-lg bg-gradient-to-br from-green-50 to-blue-50">
            <Statistic
              title={<span className="flex items-center"><DollarSign className="mr-2" size={16} />Tổng chi phí</span>}
              value={totalCost}
              suffix="VNĐ"
              valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
            />
          </Card>
        </div>

        {/* Filter and Table */}
        <Card className="shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Danh sách phiên sạc
            </h2>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 200 }}
            >
              <Option value="ALL">Tất cả</Option>
              <Option value="COMPLETED">Hoàn thành</Option>
              <Option value="CANCELLED">Đã hủy</Option>
              <Option value="ACTIVE">Đang sạc</Option>
            </Select>
          </div>

          <Table
            columns={columns}
            dataSource={filteredSessions}
            rowKey={(record) => record.sessionId || record.id}
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} phiên sạc`,
            }}
            locale={{
              emptyText: (
                <Empty
                  description="Chưa có lịch sử sạc"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  <Button
                    type="primary"
                    onClick={() => navigate('/driver/map')}
                    icon={<MapPin size={16} />}
                  >
                    Tìm trạm sạc
                  </Button>
                </Empty>
              ),
            }}
          />
        </Card>
      </div>
    </div>
  );
};

// Add missing import
const CheckCircle = ({ size, className }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default SessionHistory;
