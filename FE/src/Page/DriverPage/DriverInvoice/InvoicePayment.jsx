import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Steps, Result, Spin, message, Statistic, Row, Col, Typography, QRCode as AntQRCode } from 'antd';
import { DollarSign, Clock, CheckCircle, XCircle, CreditCard } from 'lucide-react';
import api from '../../../configs/config-axios';

const { Title, Text } = Typography;
const { Countdown } = Statistic;

const InvoicePayment = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [paymentData, setPaymentData] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Fetch invoice details
  useEffect(() => {
    fetchInvoice();
  }, [invoiceId]);

  // Auto-check payment status every 5 seconds when QR code is displayed
  useEffect(() => {
    if (currentStep === 1 && paymentData) {
      const interval = setInterval(() => {
        checkPaymentStatus();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [currentStep, paymentData]);

  const fetchInvoice = async () => {
    try {
      const response = await api.get(`/invoices/${invoiceId}`);
      const invoiceData = response.data?.data || response.data;
      setInvoice(invoiceData);
      
      // If already paid, go to success step
      if (invoiceData.status === 'PAID') {
        setCurrentStep(2);
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
      message.error('Không thể tải thông tin hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  const handleMoMoPayment = async () => {
    try {
      setPaymentLoading(true);
      const response = await api.post(`/invoices/${invoiceId}/pay/momo`);
      const data = response.data?.data;
      
      setPaymentData(data);
      setCurrentStep(1);
      message.success('Đã tạo yêu cầu thanh toán MoMo!');
    } catch (error) {
      console.error('Error creating MoMo payment:', error);
      message.error('Không thể tạo thanh toán MoMo');
    } finally {
      setPaymentLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (checkingStatus) return;
    
    try {
      setCheckingStatus(true);
      const response = await api.get(`/invoices/${invoiceId}/payment-status`);
      const status = response.data?.data;
      
      if (status.isPaid) {
        setCurrentStep(2);
        setInvoice(prev => ({ ...prev, status: 'PAID' }));
        message.success('Thanh toán thành công! 🎉');
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const steps = [
    {
      title: 'Xác nhận',
      icon: <DollarSign size={24} />,
    },
    {
      title: 'Thanh toán',
      icon: <CreditCard size={24} />,
    },
    {
      title: 'Hoàn tất',
      icon: <CheckCircle size={24} />,
    },
  ];

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
            <Button type="primary" onClick={() => navigate('/driver/session')}>
              Quay lại lịch sử
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl rounded-2xl">
          <Title level={2} className="text-center mb-6">
            💳 Thanh toán hóa đơn
          </Title>

          <Steps current={currentStep} items={steps} className="mb-8" />

          {/* Step 0: Invoice Details & Confirm */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Text strong>Hóa đơn #</Text>
                    <Title level={3}>{invoice.id}</Title>
                  </Col>
                  <Col xs={24} md={12}>
                    <Text strong>Ngày tạo</Text>
                    <Title level={4}>
                      {new Date(invoice.issueDate).toLocaleString('vi-VN')}
                    </Title>
                  </Col>
                  <Col xs={24} md={12}>
                    <Text strong>Trạm sạc</Text>
                    <Title level={4}>
                      {invoice.session?.chargingPoint?.chargingStation?.name || 'N/A'}
                    </Title>
                  </Col>
                  <Col xs={24} md={12}>
                    <Text strong>Xe</Text>
                    <Title level={4}>
                      {invoice.session?.vehicle?.model || 'N/A'}
                    </Title>
                  </Col>
                  <Col xs={24}>
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                      <Text strong className="text-lg">Tổng tiền:</Text>
                      <Title level={2} className="text-green-600 m-0">
                        {invoice.totalCost?.toLocaleString('vi-VN')} VNĐ
                      </Title>
                    </div>
                  </Col>
                </Row>
              </Card>

              <div className="flex justify-center gap-4">
                <Button
                  size="large"
                  onClick={() => navigate('/driver/session')}
                >
                  Hủy
                </Button>
                <Button
                  type="primary"
                  size="large"
                  icon={<CreditCard size={20} />}
                  onClick={handleMoMoPayment}
                  loading={paymentLoading}
                  className="bg-gradient-to-r from-pink-500 to-purple-600"
                >
                  Thanh toán bằng MoMo
                </Button>
              </div>
            </div>
          )}

          {/* Step 1: QR Code Payment */}
          {currentStep === 1 && paymentData && (
            <div className="space-y-6">
              <Card className="bg-gradient-to-r from-pink-50 to-purple-50">
                <div className="text-center space-y-4">
                  <Title level={3}>Quét mã QR để thanh toán</Title>
                  <div className="flex justify-center">
                    <AntQRCode
                      value={paymentData.payment.qrCodeUrl || paymentData.payment.deeplink}
                      size={300}
                      status={checkingStatus ? 'loading' : 'active'}
                    />
                  </div>
                  
                  <div className="flex flex-col items-center gap-2">
                    <Text type="secondary">Mở ứng dụng MoMo và quét mã QR</Text>
                    <Text strong className="text-2xl text-green-600">
                      {invoice.totalCost?.toLocaleString('vi-VN')} VNĐ
                    </Text>
                  </div>

                  <Countdown
                    title="Thời gian còn lại"
                    value={Date.now() + 10 * 60 * 1000}
                    format="mm:ss"
                    className="mt-4"
                  />

                  {paymentData.payment.deeplink && (
                    <Button
                      type="primary"
                      size="large"
                      href={paymentData.payment.deeplink}
                      target="_blank"
                      className="bg-gradient-to-r from-pink-500 to-purple-600"
                    >
                      Mở ứng dụng MoMo
                    </Button>
                  )}

                  <Button
                    onClick={checkPaymentStatus}
                    loading={checkingStatus}
                  >
                    Kiểm tra trạng thái thanh toán
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Step 2: Success */}
          {currentStep === 2 && (
            <Result
              status="success"
              title="Thanh toán thành công!"
              subTitle={`Hóa đơn #${invoice.id} đã được thanh toán. Cảm ơn bạn đã sử dụng dịch vụ!`}
              extra={[
                <Button
                  key="home"
                  type="primary"
                  size="large"
                  onClick={() => navigate('/driver')}
                  className="bg-gradient-to-r from-green-500 to-teal-600"
                >
                  Về trang chủ
                </Button>,
                <Button
                  key="history"
                  size="large"
                  onClick={() => navigate('/driver/session')}
                >
                  Xem lịch sử
                </Button>,
              ]}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default InvoicePayment;
