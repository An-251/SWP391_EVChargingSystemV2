import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Tag, Button, Table, Spin, Alert, Descriptions } from "antd";
import { ArrowLeft, Calendar, User, CreditCard, FileText } from "lucide-react";
import moment from "moment";
import * as apiInvoice from "../../../services/apiInvoice";
import { formatKWh } from '../../../utils/formatNumber';

/**
 * AdminInvoiceDetail - Admin view of invoice details
 * Read-only view with full invoice information
 */
const AdminInvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchInvoiceDetail();
    }
  }, [id]);

  const fetchInvoiceDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiInvoice.getInvoiceDetail(id);
      setInvoice(data);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải chi tiết hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "0 VNĐ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return moment(dateString).format("DD/MM/YYYY HH:mm");
  };

  // Format date short
  const formatDateShort = (dateString) => {
    if (!dateString) return "N/A";
    return moment(dateString).format("DD/MM/YYYY");
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      PAID: { color: "green", text: "Đã thanh toán" },
      UNPAID: { color: "blue", text: "Chưa thanh toán" },
      OVERDUE: { color: "red", text: "Quá hạn" },
      CANCELLED: { color: "default", text: "Đã hủy" },
    };
    
    const config = statusConfig[status] || { color: "default", text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // Sessions table columns
  const sessionColumns = [
    {
      title: "Session ID",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
    {
      title: "Trạm sạc",
      dataIndex: "stationName",
      key: "stationName",
      render: (text) => text || "N/A",
    },
    {
      title: "Điểm sạc",
      dataIndex: "chargingPointName",
      key: "chargingPointName",
      render: (text) => text || "N/A",
    },
    {
      title: "Thời gian bắt đầu",
      dataIndex: "startTime",
      key: "startTime",
      render: (date) => formatDate(date),
    },
    {
      title: "Thời lượng",
      dataIndex: "duration",
      key: "duration",
      render: (text) => text || "N/A",
    },
    {
      title: "Điện năng (kWh)",
      dataIndex: "energyConsumed",
      key: "energyConsumed",
      align: "right",
      render: (value) => formatKWh(value || 0),
    },
    {
      title: "Chi phí",
      dataIndex: "cost",
      key: "cost",
      align: "right",
      render: (amount) => formatCurrency(amount),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Đang tải chi tiết hóa đơn..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          action={
            <Button onClick={() => navigate("/admin/invoices")}>
              Quay lại danh sách
            </Button>
          }
        />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-6">
        <Alert
          message="Không tìm thấy hóa đơn"
          type="warning"
          showIcon
          action={
            <Button onClick={() => navigate("/admin/invoices")}>
              Quay lại danh sách
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeft size={16} />}
            onClick={() => navigate("/admin/invoices")}
          >
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">
            Chi tiết hóa đơn #{invoice.invoiceId || invoice.id}
          </h1>
          {getStatusBadge(invoice.status)}
        </div>
      </div>

      {/* Invoice Information */}
      <Card title={<span><FileText className="inline mr-2" size={18} />Thông tin hóa đơn</span>}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Invoice ID">
            {invoice.invoiceId || invoice.id}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            {getStatusBadge(invoice.status)}
          </Descriptions.Item>
          <Descriptions.Item label="Kỳ thanh toán">
            {formatDateShort(invoice.billingStartDate)} - {formatDateShort(invoice.billingEndDate)}
          </Descriptions.Item>
          <Descriptions.Item label="Tổng tiền">
            <span className="text-xl font-bold text-blue-600">
              {formatCurrency(invoice.totalCost)}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày phát hành">
            {formatDate(invoice.issueDate)}
          </Descriptions.Item>
          <Descriptions.Item label="Hạn thanh toán">
            <span className="text-orange-600 font-medium">
              {formatDate(invoice.dueDate)}
            </span>
          </Descriptions.Item>
          {invoice.paidDate && (
            <>
              <Descriptions.Item label="Ngày thanh toán">
                <span className="text-green-600 font-medium">
                  {formatDate(invoice.paidDate)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức thanh toán">
                {invoice.paymentMethod || "N/A"}
              </Descriptions.Item>
            </>
          )}
          {invoice.paymentReference && (
            <Descriptions.Item label="Mã giao dịch" span={2}>
              <code className="bg-gray-100 px-2 py-1 rounded">
                {invoice.paymentReference}
              </code>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Driver Information */}
      <Card title={<span><User className="inline mr-2" size={18} />Thông tin tài xế</span>}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Driver ID">
            {invoice.driverId}
          </Descriptions.Item>
          <Descriptions.Item label="Tên tài xế">
            {invoice.driverName || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {invoice.driverPhone || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {invoice.driverEmail || "N/A"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Plan Information */}
      {invoice.planId && (
        <Card title={<span><CreditCard className="inline mr-2" size={18} />Gói cước tại thời điểm thanh toán</span>}>
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Plan ID">
              {invoice.planId}
            </Descriptions.Item>
            <Descriptions.Item label="Tên gói">
              {invoice.planName || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Phí hàng tháng" span={2}>
              {formatCurrency(invoice.planMonthlyFee)}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {/* Charging Sessions */}
      <Card 
        title={
          <span>
            <Calendar className="inline mr-2" size={18} />
            Phiên sạc ({invoice.sessions?.length || 0} phiên)
          </span>
        }
      >
        {(!invoice.sessions || invoice.sessions.length === 0) ? (
          <div className="text-center py-8 text-gray-500">
            Không có phiên sạc nào
          </div>
        ) : (
          <>
            <Table
              columns={sessionColumns}
              dataSource={invoice.sessions}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} phiên`,
              }}
              scroll={{ x: 1000 }}
              summary={(pageData) => {
                let totalEnergy = 0;
                let totalCost = 0;
                
                pageData.forEach(({ energyConsumed, cost }) => {
                  totalEnergy += energyConsumed || 0;
                  totalCost += cost || 0;
                });

                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={5}>
                      <strong>Tổng cộng (trang này)</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <strong>{formatKWh(totalEnergy)} kWh</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2} align="right">
                      <strong className="text-blue-600">{formatCurrency(totalCost)}</strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
            
            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <span className="text-gray-700 font-medium">
                Tổng cộng toàn bộ hóa đơn ({invoice.sessions.length} phiên)
              </span>
              <span className="text-2xl font-bold text-blue-600">
                {formatCurrency(invoice.totalCost)}
              </span>
            </div>
          </>
        )}
      </Card>

      {/* Warning Messages */}
      {invoice.warningMessage && invoice.status !== 'PAID' && (
        <Alert
          message={invoice.warningMessage}
          type="warning"
          showIcon
        />
      )}
    </div>
  );
};

export default AdminInvoiceDetail;

