import React, { useEffect, useState } from 'react';
import { Card, Button, message, Modal, Table, Tag, Statistic, Row, Col, DatePicker, Input } from 'antd';
import { 
  FileText, 
  Plus, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  DollarSign,
  Users,
  Send,
  Ban
} from 'lucide-react';
import moment from 'moment';
import * as apiInvoice from '../../../services/apiInvoice';

const { RangePicker } = DatePicker;

/**
 * AdminInvoiceManagement - Admin page for postpaid invoice generation
 * 
 * Features:
 * 1. Show drivers ready for billing (30+ days with unbilled sessions)
 * 2. Generate consolidated invoice for selected driver
 * 3. Bulk generate for all ready drivers
 * 4. View all invoices with status
 * 5. Manual operations: check overdue, send reminders, check suspensions
 */
const AdminInvoiceManagement = () => {
  // State
  const [driversReady, setDriversReady] = useState([]);
  const [allInvoices, setAllInvoices] = useState([]);
  const [loading, setLoading] = useState({
    driversReady: false,
    invoices: false,
    generating: false,
    bulkGenerating: false,
    operations: false,
  });
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [customDateRange, setCustomDateRange] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchDriversReady();
  }, []);

  // Fetch drivers ready for invoice generation
  const fetchDriversReady = async () => {
    try {
      setLoading(prev => ({ ...prev, driversReady: true }));
      const data = await apiInvoice.getDriversReadyForBilling();
      
      setDriversReady(data);
      
      if (!data || data.length === 0) {
        message.warning('Không có driver nào sẵn sàng tạo hóa đơn');
      }
    } catch (error) {
      message.error(`Không thể tải danh sách drivers: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, driversReady: false }));
    }
  };

  // Open generate modal for specific driver
  const handleOpenGenerateModal = (driver) => {
    setSelectedDriver(driver);
    setShowGenerateModal(true);
  };

  // Generate invoice for selected driver
  const handleGenerateInvoice = async () => {
    if (!selectedDriver) return;

    try {
      setLoading(prev => ({ ...prev, generating: true }));

      const params = {
        driverId: selectedDriver.driverId,
        startDate: selectedDriver.billingStartDate,
        endDate: selectedDriver.billingEndDate,
      };

      // If custom date range selected, use it
      if (customDateRange && customDateRange.length === 2) {
        params.startDate = customDateRange[0].format('YYYY-MM-DD');
        params.endDate = customDateRange[1].format('YYYY-MM-DD');
      }

      const invoice = await apiInvoice.generateConsolidatedInvoice(params);

      message.success(
        `✅ Đã tạo hóa đơn thành công! 
        ID: ${invoice.id || 'N/A'}
        Số tiền: ${formatCurrency(invoice.totalCost || 0)}
        Phiên sạc: ${selectedDriver.unbilledSessionCount}`
      );

      // Refresh data
      setShowGenerateModal(false);
      setSelectedDriver(null);
      setCustomDateRange(null);
      fetchDriversReady();

    } catch (error) {
      message.error(error.message || 'Không thể tạo hóa đơn');
    } finally {
      setLoading(prev => ({ ...prev, generating: false }));
    }
  };

  // Generate invoices for ALL ready drivers
  const handleBulkGenerate = async () => {
    Modal.confirm({
      title: 'Xác nhận tạo hóa đơn hàng loạt',
      content: (
        <div>
          <p className="mb-2">
            Bạn có chắc chắn muốn tạo hóa đơn cho <strong>{driversReady.length} drivers</strong>?
          </p>
          <p className="text-sm text-gray-600">
            Hệ thống sẽ tự động tạo hóa đơn tổng hợp cho tất cả drivers có 30+ ngày và có phiên sạc chưa thanh toán.
          </p>
        </div>
      ),
      okText: 'Xác nhận tạo',
      cancelText: 'Hủy',
      okType: 'primary',
      onOk: async () => {
        try {
          setLoading(prev => ({ ...prev, bulkGenerating: true }));
          
          const result = await apiInvoice.generateAllInvoices();
          
          message.success(
            `✅ Đã tạo hóa đơn hàng loạt thành công! 
            Tổng số hóa đơn: ${Array.isArray(result) ? result.length : 'N/A'}`
          );
          
          fetchDriversReady();
          
        } catch (error) {
          message.error('Không thể tạo hóa đơn hàng loạt');
        } finally {
          setLoading(prev => ({ ...prev, bulkGenerating: false }));
        }
      },
    });
  };

  // Check overdue invoices (admin trigger)
  const handleCheckOverdue = async () => {
    try {
      setLoading(prev => ({ ...prev, operations: true }));
      const result = await apiInvoice.checkOverdueInvoices();
      message.success('✅ Đã kiểm tra và cập nhật hóa đơn quá hạn');
    } catch (error) {
      message.error('Không thể kiểm tra hóa đơn quá hạn');
    } finally {
      setLoading(prev => ({ ...prev, operations: false }));
    }
  };

  // Send payment reminders
  const handleSendReminders = async () => {
    Modal.confirm({
      title: 'Gửi thông báo nhắc nhở thanh toán',
      content: 'Gửi email/notification cho drivers có hóa đơn sắp đến hạn (3 ngày trước)?',
      okText: 'Gửi',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setLoading(prev => ({ ...prev, operations: true }));
          await apiInvoice.sendPaymentReminders();
          message.success('✅ Đã gửi thông báo nhắc nhở');
        } catch (error) {
          message.error('Không thể gửi thông báo');
        } finally {
          setLoading(prev => ({ ...prev, operations: false }));
        }
      },
    });
  };

  // Check suspensions
  const handleCheckSuspensions = async () => {
    Modal.confirm({
      title: '⚠️ Kiểm tra và khóa tài khoản',
      content: (
        <div>
          <p className="mb-2">Khóa tài khoản của drivers có hóa đơn quá hạn sau grace period (7 ngày)?</p>
          <p className="text-sm text-red-600 font-semibold">
            Hành động này sẽ đình chỉ quyền sử dụng của drivers chưa thanh toán!
          </p>
        </div>
      ),
      okText: 'Xác nhận khóa',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        try {
          setLoading(prev => ({ ...prev, operations: true }));
          await apiInvoice.checkSuspensions();
          message.warning('⚠️ Đã khóa tài khoản quá hạn');
        } catch (error) {
          message.error('Không thể kiểm tra suspensions');
        } finally {
          setLoading(prev => ({ ...prev, operations: false }));
        }
      },
    });
  };

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

  // Table columns for drivers ready
  const columnsDriversReady = [
    {
      title: 'Driver ID',
      dataIndex: 'driverId',
      key: 'driverId',
      width: 100,
    },
    {
      title: 'Tên Driver',
      dataIndex: 'driverName',
      key: 'driverName',
      render: (name) => name || 'N/A',
    },
    {
      title: 'Kỳ thanh toán',
      key: 'billingPeriod',
      render: (_, record) => (
        <div>
          <div className="text-xs text-gray-500">Từ:</div>
          <div className="font-medium">{formatDate(record.billingStartDate)}</div>
          <div className="text-xs text-gray-500 mt-1">Đến:</div>
          <div className="font-medium">{formatDate(record.billingEndDate)}</div>
        </div>
      ),
    },
    {
      title: 'Số ngày',
      dataIndex: 'daysSinceBillingStart',
      key: 'daysSinceBillingStart',
      align: 'center',
      render: (days) => (
        <Tag color={days >= 60 ? 'red' : days >= 45 ? 'orange' : 'blue'}>
          {days} ngày
        </Tag>
      ),
      sorter: (a, b) => a.daysSinceBillingStart - b.daysSinceBillingStart,
    },
    {
      title: 'Phiên sạc',
      dataIndex: 'unbilledSessionCount',
      key: 'unbilledSessionCount',
      align: 'center',
      render: (count) => (
        <span className="font-semibold text-blue-600">{count}</span>
      ),
      sorter: (a, b) => a.unbilledSessionCount - b.unbilledSessionCount,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isReady',
      key: 'isReady',
      align: 'center',
      render: (isReady) => (
        <Tag color={isReady ? 'green' : 'default'} icon={isReady ? <CheckCircle size={14} /> : <Clock size={14} />}>
          {isReady ? 'Sẵn sàng' : 'Chưa đủ'}
        </Tag>
      ),
      filters: [
        { text: 'Sẵn sàng', value: true },
        { text: 'Chưa đủ', value: false },
      ],
      onFilter: (value, record) => record.isReady === value,
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<Plus size={14} />}
          onClick={() => handleOpenGenerateModal(record)}
          disabled={!record.isReady}
        >
          Tạo hóa đơn
        </Button>
      ),
    },
  ];

  // Calculate statistics
  const stats = {
    readyDrivers: driversReady.filter(d => d.isReady).length,
    totalDrivers: driversReady.length,
    totalUnbilledSessions: driversReady.reduce((sum, d) => sum + (d.unbilledSessionCount || 0), 0),
    avgDays: driversReady.length > 0 
      ? Math.round(driversReady.reduce((sum, d) => sum + d.daysSinceBillingStart, 0) / driversReady.length)
      : 0,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Hóa đơn (Postpaid)</h1>
          <p className="text-gray-600 mt-1">
            Tạo hóa đơn tổng hợp cho drivers theo chu kỳ 30 ngày
          </p>
        </div>
        <Button
          type="default"
          icon={<RefreshCw size={16} />}
          onClick={fetchDriversReady}
          loading={loading.driversReady}
        >
          Làm mới
        </Button>
      </div>

      {/* Statistics */}
      <Row gutter={16}>
        <Col span={6}>
          <Card className="shadow-md">
            <Statistic
              title={
                <span className="flex items-center">
                  <Users className="mr-2" size={16} />
                  Drivers sẵn sàng
                </span>
              }
              value={stats.readyDrivers}
              suffix={`/ ${stats.totalDrivers}`}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="shadow-md">
            <Statistic
              title={
                <span className="flex items-center">
                  <FileText className="mr-2" size={16} />
                  Phiên sạc chưa bill
                </span>
              }
              value={stats.totalUnbilledSessions}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="shadow-md">
            <Statistic
              title="Số ngày trung bình"
              value={stats.avgDays}
              suffix="ngày"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="shadow-md bg-blue-50">
            <Statistic
              title={
                <span className="flex items-center">
                  <Clock className="mr-2" size={16} />
                  Chu kỳ thanh toán
                </span>
              }
              value={30}
              suffix="ngày"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Bulk Operations */}
      <Card className="shadow-lg border-2 border-blue-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          ⚡ Thao tác hàng loạt
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button
            type="primary"
            size="large"
            icon={<FileText size={18} />}
            onClick={handleBulkGenerate}
            loading={loading.bulkGenerating}
            disabled={stats.readyDrivers === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Tạo hóa đơn cho tất cả ({stats.readyDrivers})
          </Button>

          <Button
            type="default"
            size="large"
            icon={<AlertCircle size={18} />}
            onClick={handleCheckOverdue}
            loading={loading.operations}
            className="border-orange-400 text-orange-600 hover:bg-orange-50"
          >
            Kiểm tra Overdue
          </Button>

          <Button
            type="default"
            size="large"
            icon={<Send size={18} />}
            onClick={handleSendReminders}
            loading={loading.operations}
            className="border-yellow-400 text-yellow-600 hover:bg-yellow-50"
          >
            Gửi nhắc nhở
          </Button>

          <Button
            type="default"
            size="large"
            danger
            icon={<Ban size={18} />}
            onClick={handleCheckSuspensions}
            loading={loading.operations}
          >
            Kiểm tra Suspensions
          </Button>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>💡 Lưu ý:</strong> Hệ thống postpaid billing tự động chạy scheduled jobs hàng ngày:
          </p>
          <ul className="text-sm text-blue-700 mt-2 ml-4 list-disc">
            <li>01:00 AM - Kiểm tra và mark hóa đơn OVERDUE</li>
            <li>02:00 AM - Suspend accounts quá grace period</li>
            <li>09:00 AM - Gửi payment reminders (3 ngày trước due date)</li>
          </ul>
        </div>
      </Card>

      {/* Drivers Ready Table */}
      <Card className="shadow-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          📋 Drivers sẵn sàng tạo hóa đơn (30+ ngày)
        </h2>
        <Table
          columns={columnsDriversReady}
          dataSource={driversReady}
          rowKey="driverId"
          loading={loading.driversReady}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} drivers`,
          }}
          locale={{
            emptyText: (
              <div className="py-8 text-gray-500">
                <AlertCircle className="mx-auto mb-2" size={48} />
                <p className="text-lg font-medium">Không có driver nào sẵn sàng</p>
                <p className="text-sm mt-1">Xem hướng dẫn phía trên để kiểm tra database</p>
              </div>
            ),
          }}
        />
      </Card>

      {/* Generate Invoice Modal */}
      <Modal
        title="Tạo hóa đơn tổng hợp"
        open={showGenerateModal}
        onCancel={() => {
          setShowGenerateModal(false);
          setSelectedDriver(null);
          setCustomDateRange(null);
        }}
        onOk={handleGenerateInvoice}
        okText="Tạo hóa đơn"
        cancelText="Hủy"
        confirmLoading={loading.generating}
        width={600}
      >
        {selectedDriver && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Thông tin Driver</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Driver ID:</span>
                  <span className="ml-2 font-medium">{selectedDriver.driverId}</span>
                </div>
                <div>
                  <span className="text-gray-600">Tên:</span>
                  <span className="ml-2 font-medium">{selectedDriver.driverName || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Phiên sạc:</span>
                  <span className="ml-2 font-medium text-blue-600">{selectedDriver.unbilledSessionCount}</span>
                </div>
                <div>
                  <span className="text-gray-600">Số ngày:</span>
                  <span className="ml-2 font-medium">{selectedDriver.daysSinceBillingStart} ngày</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Kỳ thanh toán mặc định</h3>
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-sm">
                  <span className="text-gray-600">Từ:</span>
                  <span className="ml-2 font-medium">{formatDate(selectedDriver.billingStartDate)}</span>
                </div>
                <div className="text-sm mt-1">
                  <span className="text-gray-600">Đến:</span>
                  <span className="ml-2 font-medium">{formatDate(selectedDriver.billingEndDate)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Tùy chỉnh kỳ thanh toán (không bắt buộc)
              </h3>
              <RangePicker
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                placeholder={['Từ ngày', 'Đến ngày']}
                value={customDateRange}
                onChange={setCustomDateRange}
              />
              <p className="text-xs text-gray-500 mt-1">
                Để trống sẽ sử dụng kỳ thanh toán mặc định (30 ngày từ lần billing cuối)
              </p>
            </div>

            <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Lưu ý:</strong> Hóa đơn sẽ tổng hợp TẤT CẢ phiên sạc chưa thanh toán trong kỳ này.
                Due date sẽ được set = Issue date + 7 ngày.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminInvoiceManagement;
