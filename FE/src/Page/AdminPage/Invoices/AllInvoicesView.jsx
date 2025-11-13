import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Input, Select, Button, DatePicker, message, Space, Tooltip } from 'antd';
import { Search, Eye, RefreshCw, Calendar, User, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import * as apiInvoice from '../../../services/apiInvoice';
import { INVOICE_STATUS } from '../../../constants/paymentStatus';

const { RangePicker } = DatePicker;
const { Option } = Select;

/**
 * AllInvoicesView - View all generated invoices with filters
 */
const AllInvoicesView = () => {
  const navigate = useNavigate();
  
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'ALL',
    searchTerm: '',
    dateRange: null,
  });

  useEffect(() => {
    fetchAllInvoices();
  }, []);

  const fetchAllInvoices = async () => {
    try {
      setLoading(true);
      const data = await apiInvoice.getAllInvoices();
      setInvoices(data);
    } catch (error) {
      message.error('Không thể tải danh sách hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const filteredInvoices = invoices.filter(invoice => {
    // Status filter - backend trả về field "status" không phải "paymentStatus"
    const invoiceStatus = invoice.status || invoice.paymentStatus;
    if (filters.status !== 'ALL' && invoiceStatus !== filters.status) {
      return false;
    }

    // Search filter (by driverId or invoice id) - backend trả về "invoiceId"
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchId = (invoice.invoiceId || invoice.id)?.toString().includes(searchLower);
      const matchDriverId = invoice.driverId?.toString().includes(searchLower);
      if (!matchId && !matchDriverId) return false;
    }

    // Date range filter (by issueDate)
    if (filters.dateRange && filters.dateRange.length === 2) {
      const issueDate = moment(invoice.issueDate);
      const [start, end] = filters.dateRange;
      if (!issueDate.isBetween(start, end, 'day', '[]')) {
        return false;
      }
    }

    return true;
  });

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return moment(dateString).format('DD/MM/YYYY');
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      PAID: { color: 'green', text: 'Đã thanh toán' },
      UNPAID: { color: 'blue', text: 'Chưa thanh toán' },
      OVERDUE: { color: 'orange', text: 'Quá hạn' },
      CANCELLED: { color: 'red', text: 'Đã hủy' },
    };
    
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // Calculate urgency
  const getUrgency = (invoice) => {
    const invoiceStatus = invoice.status || invoice.paymentStatus;
    if (invoiceStatus === 'PAID' || invoiceStatus === 'CANCELLED') {
      return null;
    }

    const dueDate = moment(invoice.dueDate);
    const now = moment();
    const daysUntilDue = dueDate.diff(now, 'days');

    if (daysUntilDue < 0) {
      return { level: 'critical', text: `Trễ ${Math.abs(daysUntilDue)} ngày`, color: 'red' };
    } else if (daysUntilDue <= 3) {
      return { level: 'warning', text: `Còn ${daysUntilDue} ngày`, color: 'orange' };
    } else {
      return { level: 'safe', text: `Còn ${daysUntilDue} ngày`, color: 'green' };
    }
  };

  // View invoice detail - Fix: use invoiceId from backend response
  const handleViewDetail = (invoiceId) => {
    navigate(`/admin/invoices/${invoiceId}`);
  };

  // Table columns
  const columns = [
    {
      title: 'Invoice ID',
      dataIndex: 'invoiceId',
      key: 'invoiceId',
      width: 100,
      render: (invoiceId, record) => invoiceId || record.id,
      sorter: (a, b) => (a.invoiceId || a.id) - (b.invoiceId || b.id),
    },
    {
      title: 'Driver ID',
      dataIndex: 'driverId',
      key: 'driverId',
      width: 100,
    },
    {
      title: 'Ngày xuất',
      dataIndex: 'issueDate',
      key: 'issueDate',
      render: (date) => formatDate(date),
      sorter: (a, b) => moment(a.issueDate).unix() - moment(b.issueDate).unix(),
    },
    {
      title: 'Hạn thanh toán',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => formatDate(date),
      sorter: (a, b) => moment(a.dueDate).unix() - moment(b.dueDate).unix(),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalCost',
      key: 'totalCost',
      align: 'right',
      render: (amount) => (
        <span className="font-semibold text-blue-600">{formatCurrency(amount)}</span>
      ),
      sorter: (a, b) => a.totalCost - b.totalCost,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status, record) => getStatusBadge(status || record.paymentStatus),
      filters: [
        { text: 'Đã thanh toán', value: 'PAID' },
        { text: 'Chưa thanh toán', value: 'UNPAID' },
        { text: 'Quá hạn', value: 'OVERDUE' },
        { text: 'Đã hủy', value: 'CANCELLED' },
      ],
      onFilter: (value, record) => (record.status || record.paymentStatus) === value,
    },
    {
      title: 'Độ khẩn',
      key: 'urgency',
      align: 'center',
      render: (_, invoice) => {
        const urgency = getUrgency(invoice);
        if (!urgency) return <span className="text-gray-400">-</span>;
        return (
          <Tag color={urgency.color}>
            {urgency.text}
          </Tag>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      fixed: 'right',
      render: (_, invoice) => (
        <Tooltip title="Xem chi tiết">
          <Button
            type="link"
            size="small"
            icon={<Eye size={16} />}
            onClick={() => handleViewDetail(invoice.invoiceId || invoice.id)}
          >
            Chi tiết
          </Button>
        </Tooltip>
      ),
    },
  ];

  // Statistics - Fix: use "status" field from backend
  const stats = {
    total: filteredInvoices.length,
    paid: filteredInvoices.filter(i => (i.status || i.paymentStatus)?.toLowerCase() === INVOICE_STATUS.PAID).length,
    unpaid: filteredInvoices.filter(i => (i.status || i.paymentStatus)?.toLowerCase() === INVOICE_STATUS.UNPAID).length,
    overdue: filteredInvoices.filter(i => (i.status || i.paymentStatus)?.toLowerCase() === INVOICE_STATUS.OVERDUE).length,
    totalAmount: filteredInvoices.reduce((sum, i) => sum + (i.totalCost || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="shadow-md">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Tổng hóa đơn</div>
          </div>
        </Card>
        <Card className="shadow-md">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
            <div className="text-sm text-gray-600">Đã thanh toán</div>
          </div>
        </Card>
        <Card className="shadow-md">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.unpaid}</div>
            <div className="text-sm text-gray-600">Chưa thanh toán</div>
          </div>
        </Card>
        <Card className="shadow-md">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.overdue}</div>
            <div className="text-sm text-gray-600">Quá hạn</div>
          </div>
        </Card>
        <Card className="shadow-md bg-blue-50">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {formatCurrency(stats.totalAmount)}
            </div>
            <div className="text-sm text-gray-600">Tổng giá trị</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-lg">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              <FileText className="inline mr-2" size={20} />
              Lọc hóa đơn
            </h2>
            <Button
              type="default"
              icon={<RefreshCw size={16} />}
              onClick={fetchAllInvoices}
              loading={loading}
            >
              Làm mới
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              placeholder="Tìm theo Invoice ID hoặc Driver ID"
              prefix={<Search size={16} />}
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              allowClear
            />

            <Select
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              style={{ width: '100%' }}
            >
              <Option value="ALL">Tất cả trạng thái</Option>
              <Option value="PAID">Đã thanh toán</Option>
              <Option value="UNPAID">Chưa thanh toán</Option>
              <Option value="OVERDUE">Quá hạn</Option>
              <Option value="CANCELLED">Đã hủy</Option>
            </Select>

            <RangePicker
              format="DD/MM/YYYY"
              placeholder={['Từ ngày', 'Đến ngày']}
              value={filters.dateRange}
              onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
              style={{ width: '100%' }}
            />
          </div>
        </Space>
      </Card>

      {/* Table */}
      <Card className="shadow-lg">
        <Table
          columns={columns}
          dataSource={filteredInvoices}
          rowKey={(record) => record.invoiceId || record.id}
          loading={loading}
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} hóa đơn`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export default AllInvoicesView;
