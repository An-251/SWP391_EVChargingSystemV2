import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Table, Card, Button, Select, Tag, Empty } from 'antd';
import { MapPin, Calendar } from 'lucide-react';
import moment from 'moment';
import api from '../../../configs/config-axios';
import { RESERVATION_STATUS } from '../../../constants/statusConstants';
import PageHeader from '../../../Components/Common/PageHeader';

const { Option } = Select;

const ReservationHistory = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Fetch all reservations
  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/drivers/${user.driverId}/reservations`);
      
      // BE returns { reservations: [...] }
      let reservationData = response.data.reservations || response.data;
      
      // Handle both single object and array response
      if (!Array.isArray(reservationData)) {
        reservationData = reservationData ? [reservationData] : [];
      }
      
      setReservations(reservationData);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.driverId) {
      fetchReservations();
    }
  }, [user]);

  // Get reservation status
  const getStatus = (reservation) => {
    return (reservation.status || '').toLowerCase();
  };

  // Filter reservations
  const filteredReservations = statusFilter === 'ALL'
    ? reservations
    : reservations.filter((r) => getStatus(r) === statusFilter);

  // Table columns
  const columns = [
    {
      title: 'Thời gian đặt',
      dataIndex: 'reservationTime',
      key: 'reservationTime',
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => moment(a.reservationTime).unix() - moment(b.reservationTime).unix(),
    },
    {
      title: 'Trạm sạc',
      dataIndex: 'stationName',
      key: 'stationName',
      render: (name, record) => (
        <div>
          <div className="font-medium">{name || 'N/A'}</div>
          <div className="text-xs text-gray-500">
            {record.chargingPointName || `CP-${record.chargingPointId}`}
          </div>
        </div>
      ),
    },
    {
      title: 'Xe',
      key: 'vehicle',
      render: (record) => (
        <div>
          <div className="font-medium">{record.vehicleName || 'N/A'}</div>
          {record.licensePlate && (
            <div className="text-xs text-gray-500">{record.licensePlate}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Thời gian hết hạn',
      dataIndex: 'expiryTime',
      key: 'expiryTime',
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => {
        const status = getStatus(record);
        const statusConfig = {
          [RESERVATION_STATUS.ACTIVE]: { color: 'green', label: 'Đang hoạt động' },
          [RESERVATION_STATUS.CANCELLED]: { color: 'red', label: 'Đã hủy' },
          [RESERVATION_STATUS.EXPIRED]: { color: 'orange', label: 'Hết hạn' },
          [RESERVATION_STATUS.FULFILLED]: { color: 'blue', label: 'Đã hoàn thành' },
        };
        const config = statusConfig[status] || { color: 'default', label: status };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
      filters: [
        { text: 'Đang hoạt động', value: RESERVATION_STATUS.ACTIVE },
        { text: 'Đã hủy', value: RESERVATION_STATUS.CANCELLED },
        { text: 'Hết hạn', value: RESERVATION_STATUS.EXPIRED },
        { text: 'Đã hoàn thành', value: RESERVATION_STATUS.FULFILLED },
      ],
      onFilter: (value, record) => getStatus(record) === value,
    },
  ];

  // Statistics
  const stats = {
    total: reservations.length,
    active: reservations.filter(r => getStatus(r) === RESERVATION_STATUS.ACTIVE).length,
    fulfilled: reservations.filter(r => getStatus(r) === RESERVATION_STATUS.FULFILLED).length,
    cancelled: reservations.filter(r => getStatus(r) === RESERVATION_STATUS.CANCELLED).length,
    expired: reservations.filter(r => getStatus(r) === RESERVATION_STATUS.EXPIRED).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Lịch sử đặt chỗ"
        subtitle="Xem lại tất cả các lần đặt chỗ của bạn"
        showBackButton
        onBack="/driver/reservations"
        icon={Calendar}
        iconBgColor="bg-indigo-100"
        iconColor="text-indigo-600"
        breadcrumbs={[
          { label: 'Trang chủ', path: '/driver' },
          { label: 'Đặt chỗ', path: '/driver/reservations' },
          { label: 'Lịch sử' }
        ]}
      />
      
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="shadow-md">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Tổng số</div>
            </div>
          </Card>
          <Card className="shadow-md">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-gray-600">Đang hoạt động</div>
            </div>
          </Card>
          <Card className="shadow-md">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.fulfilled}</div>
              <div className="text-sm text-gray-600">Hoàn thành</div>
            </div>
          </Card>
          <Card className="shadow-md">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
              <div className="text-sm text-gray-600">Đã hủy</div>
            </div>
          </Card>
          <Card className="shadow-md">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.expired}</div>
              <div className="text-sm text-gray-600">Hết hạn</div>
            </div>
          </Card>
        </div>

        {/* Table */}
        <Card className="shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Danh sách đặt chỗ
            </h2>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 200 }}
            >
              <Option value="ALL">Tất cả</Option>
              <Option value={RESERVATION_STATUS.ACTIVE}>Đang hoạt động</Option>
              <Option value={RESERVATION_STATUS.FULFILLED}>Đã hoàn thành</Option>
              <Option value={RESERVATION_STATUS.CANCELLED}>Đã hủy</Option>
              <Option value={RESERVATION_STATUS.EXPIRED}>Hết hạn</Option>
            </Select>
          </div>

          <Table
            columns={columns}
            dataSource={filteredReservations}
            rowKey={(record) => record.id}
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} đặt chỗ`,
            }}
            locale={{
              emptyText: (
                <Empty
                  description="Chưa có lịch sử đặt chỗ"
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
              ),
            }}
          />
        </Card>
      </div>
    </div>
  );
};

export default ReservationHistory;
