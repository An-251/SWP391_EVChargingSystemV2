import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Result, Spin, message, Row, Col, Typography, Divider, Descriptions } from 'antd';
import { DollarSign, CheckCircle, FileText, Clock, MapPin, Car, Battery, Zap } from 'lucide-react';
import api from '../../../configs/config-axios';

const { Title, Text } = Typography;

const InvoicePayment = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  // Fetch invoice details
  useEffect(() => {
    fetchInvoice();
  }, [invoiceId]);

  const fetchInvoice = async () => {
    try {
      console.log('📄 [INVOICE] Fetching invoice ID:', invoiceId);
      const response = await api.get(`/invoices/${invoiceId}`);
      console.log('📄 [INVOICE] Response:', response.data);
      
      // Backend returns Invoice entity directly (not wrapped in {data: ...})
      const invoiceData = response.data;
      setInvoice(invoiceData);
      
      console.log('✅ [INVOICE] Invoice loaded:', invoiceData);
      message.success('Hóa đơn đã được tạo thành công!');
    } catch (error) {
      console.error('❌ [INVOICE] Error fetching invoice:', error);
      message.error('Không thể tải thông tin hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveInvoice = () => {
    console.log('💾 [INVOICE] Saving invoice to system...');
    message.success('Hóa đơn đã được lưu vào hệ thống! 📝');
    setSaved(true);
    
    // Automatically redirect after 2 seconds
    setTimeout(() => {
      console.log('🚀 [NAVIGATE] Redirecting to driver home...');
      navigate('/driver');
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" tip="Đang tải thông tin hóa đơn..." />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Result
          status="404"
          title="Không tìm thấy hóa đơn"
          subTitle="Hóa đơn không tồn tại hoặc đã bị xóa"
          extra={
            <Button type="primary" onClick={() => navigate('/driver/history')}>
              Quay lại lịch sử
            </Button>
          }
        />
      </div>
    );
  }

  // Success state after saving
  if (saved) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full shadow-2xl rounded-2xl">
          <Result
            status="success"
            title="Hóa đơn đã được lưu thành công!"
            subTitle={`Hóa đơn #${invoice.id} đã được lưu vào hệ thống. Cảm ơn bạn đã sử dụng dịch vụ!`}
            extra={[
              <Button
                key="home"
                type="primary"
                size="large"
                icon={<CheckCircle size={20} />}
                onClick={() => navigate('/driver')}
                className="bg-gradient-to-r from-green-500 to-blue-600"
              >
                Về trang chủ
              </Button>,
              <Button
                key="history"
                size="large"
                onClick={() => navigate('/driver/history')}
              >
                Xem lịch sử sạc
              </Button>,
            ]}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-5xl mx-auto">
        <Card className="shadow-2xl rounded-2xl">
          <div className="text-center mb-8">
            <FileText size={64} className="mx-auto mb-4 text-blue-600" />
            <Title level={2} className="mb-2">
              📄 Hóa Đơn Sạc Xe Điện
            </Title>
            <Text type="secondary" className="text-lg">
              Thông tin chi tiết phiên sạc của bạn
            </Text>
          </div>

          <Divider />

          {/* Invoice Header */}
          <div className="mb-6">
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 h-full">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText size={24} className="text-blue-600" />
                    <Text strong className="text-lg">Mã hóa đơn</Text>
                  </div>
                  <Title level={3} className="m-0">#{invoice.id}</Title>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card className="bg-gradient-to-r from-purple-50 to-pink-50 h-full">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock size={24} className="text-purple-600" />
                    <Text strong className="text-lg">Ngày tạo</Text>
                  </div>
                  <Title level={4} className="m-0">
                    {new Date(invoice.issueDate).toLocaleString('vi-VN')}
                  </Title>
                </Card>
              </Col>
            </Row>
          </div>

          {/* Charging Session Details */}
          <Card className="mb-6 bg-gradient-to-r from-green-50 to-teal-50">
            <Title level={4} className="mb-4 flex items-center gap-2">
              <Zap size={24} className="text-green-600" />
              Thông tin phiên sạc
            </Title>
            <Descriptions bordered column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label={
                <span className="flex items-center gap-2">
                  <MapPin size={16} />
                  <strong>Trạm sạc</strong>
                </span>
              }>
                {invoice.session?.chargingPoint?.station?.stationName || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label={
                <span className="flex items-center gap-2">
                  <Zap size={16} />
                  <strong>Cổng sạc</strong>
                </span>
              }>
                {invoice.session?.chargingPoint?.pointName || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label={<strong>Loại cổng</strong>}>
                {invoice.session?.chargingPoint?.connectorType || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label={<strong>Địa chỉ</strong>} span={2}>
                {invoice.session?.chargingPoint?.station?.facility?.fullAddress || 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Vehicle Details */}
          <Card className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50">
            <Title level={4} className="mb-4 flex items-center gap-2">
              <Car size={24} className="text-orange-600" />
              Thông tin xe
            </Title>
            <Descriptions bordered column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label={<strong>Mẫu xe</strong>}>
                {invoice.session?.vehicle?.model || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label={<strong>Biển số</strong>}>
                {invoice.session?.vehicle?.licensePlate || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label={
                <span className="flex items-center gap-2">
                  <Battery size={16} />
                  <strong>Pin lúc bắt đầu</strong>
                </span>
              }>
                {invoice.session?.startPercentage || 0}%
              </Descriptions.Item>
              <Descriptions.Item label={
                <span className="flex items-center gap-2">
                  <Battery size={16} />
                  <strong>Pin lúc kết thúc</strong>
                </span>
              }>
                {invoice.session?.endPercentage || 0}%
              </Descriptions.Item>
              <Descriptions.Item label={<strong>Số kWh đã sử dụng</strong>}>
                {invoice.session?.kwhUsed || 0} kWh
              </Descriptions.Item>
              <Descriptions.Item label={<strong>Trạng thái</strong>}>
                <span className="text-green-600 font-semibold">
                  {invoice.status === 'PAID' ? '✅ Đã thanh toán' : '📝 Mới tạo'}
                </span>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Total Cost */}
          <Card className="mb-6 bg-gradient-to-r from-green-100 to-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DollarSign size={32} className="text-green-600" />
                <div>
                  <Text className="text-lg">Tổng chi phí</Text>
                  <Title level={4} className="m-0">Chi phí sạc xe</Title>
                </div>
              </div>
              <Title level={1} className="text-green-600 m-0">
                {invoice.totalCost?.toLocaleString('vi-VN')} VNĐ
              </Title>
            </div>
          </Card>

          <Divider />

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <Button
              size="large"
              onClick={() => navigate('/driver/history')}
            >
              Xem lịch sử
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<CheckCircle size={20} />}
              onClick={handleSaveInvoice}
              className="bg-gradient-to-r from-green-500 to-blue-600 px-8"
            >
              Lưu hóa đơn & Hoàn tất
            </Button>
          </div>

          <div className="text-center mt-6">
            <Text type="secondary">
              💡 Hóa đơn sẽ được lưu vào hệ thống và bạn có thể xem lại trong lịch sử sạc
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InvoicePayment;
