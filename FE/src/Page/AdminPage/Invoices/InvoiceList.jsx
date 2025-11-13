/**
 * Invoice Management Page for Admin
 * Chức năng chính:
 * 1. Xem danh sách invoices
 * 2. Generate invoices từ sessions chưa có invoiceId (postpaid model)
 */

import { INVOICE_STATUS } from '../../../constants/paymentStatus';
import { Table, Card, Button, message, Modal, Select, Tag, Statistic } from 'antd';
import { DollarSign, FileText, Plus, User, Calendar } from 'lucide-react';
import moment from 'moment';
import api from '../../../configs/config-axios';

const { Option } = Select;
const { confirm } = Modal;

export default function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [unpaidSessions, setUnpaidSessions] = useState({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  // Fetch data on mount
  useEffect(() => {
    fetchInvoices();
    fetchDrivers();
    fetchUnpaidSessions();
  }, []);

  // Fetch all invoices
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/invoices');
      setInvoices(response.data);
    } catch (error) {
      message.error('Không thể tải danh sách hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all drivers
  const fetchDrivers = async () => {
    try {
      const response = await api.get('/drivers');
      setDrivers(response.data);
    } catch (error) {
      message.error('Không thể tải danh sách drivers');
    }
  };

  // Fetch unpaid sessions grouped by driver
  const fetchUnpaidSessions = async () => {
    try {
      // API endpoint to get sessions with invoiceId = NULL, grouped by driverId
      const response = await api.get('/sessions/unpaid');
      
      // Response format: { driverId: { sessions: [...], totalCost: number } }
      setUnpaidSessions(response.data);
    } catch (error) {
      message.error('Không thể tải phiên sạc chưa thanh toán');
    }
  };

  // Handle generate invoice for a driver
  const handleGenerateInvoice = (driverId) => {
    const driverData = unpaidSessions[driverId];
    const driver = drivers.find(d => d.id === driverId);
    
    if (!driverData || !driverData.sessions || driverData.sessions.length === 0) {
      message.warning('Không có phiên sạc nào chưa thanh toán của driver này');
      return;
    }

    confirm({
      title: 'Xác nhận tạo hóa đơn',
      content: (
        <div>
          <p><strong>Driver:</strong> {driver?.fullName || driverId}</p>
          <p><strong>Số phiên sạc:</strong> {driverData.sessions.length}</p>
          <p><strong>Tổng tiền:</strong> {driverData.totalCost?.toLocaleString('vi-VN')} VNĐ</p>
          <p className="mt-2 text-gray-600">Tạo hóa đơn sẽ tổng hợp tất cả phiên sạc chưa thanh toán của driver này.</p>
        </div>
      ),
      okText: 'Tạo hóa đơn',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setGenerating(true);
          
          // API to generate invoice
          const response = await api.post('/invoices/generate', {
            driverId: driverId,
            sessionIds: driverData.sessions.map(s => s.id)
          });
          
          message.success(`Đã tạo hóa đơn thành công! ID: ${response.data.invoiceId}`);
          
          // Refresh data
          await fetchInvoices();
          await fetchUnpaidSessions();
          
        } catch (error) {
          message.error(error.response?.data?.message || 'Không thể tạo hóa đơn');
        } finally {
          setGenerating(false);
        }
      },
    });
  };

  // Handle bulk generate for selected driver
  const handleBulkGenerate = () => {
    if (!selectedDriver) {
      message.warning('Vui lòng chọn driver');
      return;
    }
    handleGenerateInvoice(selectedDriver);
  };

  // Table columns for invoices
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Driver',
      dataIndex: 'driverName',
      key: 'driverName',
      render: (text, record) => (
        <div>
          <div className="font-medium">{text || 'N/A'}</div>
          <div className="text-xs text-gray-500">ID: {record.driverId}</div>
        </div>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => moment(a.createdAt).unix() - moment(b.createdAt).unix(),
    },
    {
      title: 'Số phiên sạc',
      dataIndex: 'sessionCount',
      key: 'sessionCount',
      width: 120,
      align: 'center',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => (
        <span className="font-semibold text-green-600">
          {amount?.toLocaleString('vi-VN')} VNĐ
        </span>
      ),
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const config = {
          PAID: { color: 'green', label: 'Đã thanh toán' },
          UNPAID: { color: 'orange', label: 'Chưa thanh toán' },
          CANCELLED: { color: 'red', label: 'Đã hủy' },
        };
        const statusConfig = config[status] || { color: 'default', label: status };
        return <Tag color={statusConfig.color}>{statusConfig.label}</Tag>;
      },
      filters: [
        { text: 'Đã thanh toán', value: 'PAID' },
        { text: 'Chưa thanh toán', value: 'UNPAID' },
        { text: 'Đã hủy', value: 'CANCELLED' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => window.open(`/admin/invoice/${record.id}`, '_blank')}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  // Calculate statistics
  const stats = {
    totalInvoices: invoices.length,
    totalRevenue: invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0),
    paidInvoices: invoices.filter(inv => inv.status?.toLowerCase() === INVOICE_STATUS.PAID).length,
    unpaidDrivers: Object.keys(unpaidSessions).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Hóa đơn</h1>
          <p className="text-gray-600 mt-1">Tạo và quản lý hóa đơn từ các phiên sạc</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-md">
          <Statistic
            title={<span className="flex items-center"><FileText className="mr-2" size={16} />Tổng hóa đơn</span>}
            value={stats.totalInvoices}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
        <Card className="shadow-md">
          <Statistic
            title={<span className="flex items-center"><DollarSign className="mr-2" size={16} />Tổng doanh thu</span>}
            value={stats.totalRevenue}
            suffix="VNĐ"
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
        <Card className="shadow-md">
          <Statistic
            title="Đã thanh toán"
            value={stats.paidInvoices}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
        <Card className="shadow-md bg-orange-50">
          <Statistic
            title={<span className="flex items-center"><User className="mr-2" size={16} />Chưa tạo hóa đơn</span>}
            value={stats.unpaidDrivers}
            valueStyle={{ color: '#fa8c16' }}
            suffix="drivers"
          />
        </Card>
      </div>

      {/* Generate Invoice Section */}
      <Card className="shadow-lg border-2 border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Plus className="mr-2" size={20} />
              Tạo hóa đơn mới
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Tổng hợp các phiên sạc chưa có hóa đơn của driver
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Select
            showSearch
            style={{ width: 300 }}
            placeholder="Chọn driver"
            value={selectedDriver}
            onChange={setSelectedDriver}
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {Object.keys(unpaidSessions).map((driverId) => {
              const driver = drivers.find(d => d.id === parseInt(driverId));
              const data = unpaidSessions[driverId];
              return (
                <Option key={driverId} value={parseInt(driverId)}>
                  {driver?.fullName || `Driver ${driverId}`} ({data.sessions?.length || 0} sessions - {data.totalCost?.toLocaleString('vi-VN')} VNĐ)
                </Option>
              );
            })}
          </Select>

          <Button
            type="primary"
            icon={<FileText size={16} />}
            onClick={handleBulkGenerate}
            loading={generating}
            disabled={!selectedDriver}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Tạo hóa đơn
          </Button>

          <Button
            type="default"
            icon={<Calendar size={16} />}
            onClick={fetchUnpaidSessions}
          >
            Làm mới danh sách
          </Button>
        </div>

        {/* Unpaid sessions summary */}
        {Object.keys(unpaidSessions).length > 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm font-semibold text-yellow-800 mb-2">
              📋 Danh sách drivers có phiên sạc chưa thanh toán:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {Object.entries(unpaidSessions).map(([driverId, data]) => {
                const driver = drivers.find(d => d.id === parseInt(driverId));
                return (
                  <div key={driverId} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div>
                      <div className="font-medium text-sm">{driver?.fullName || `Driver ${driverId}`}</div>
                      <div className="text-xs text-gray-500">{data.sessions?.length || 0} phiên - {data.totalCost?.toLocaleString('vi-VN')} VNĐ</div>
                    </div>
                    <Button
                      type="link"
                      size="small"
                      onClick={() => handleGenerateInvoice(parseInt(driverId))}
                    >
                      Tạo
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Invoices Table */}
      <Card className="shadow-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Danh sách hóa đơn
        </h2>
        <Table
          columns={columns}
          dataSource={invoices}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} hóa đơn`,
          }}
        />
      </Card>
    </div>
  );
}
