import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Row, Col, Typography, Badge, message, Spin, Divider, Tag, Modal, Radio } from 'antd';
import {
  CheckCircleOutlined,
  ThunderboltOutlined,
  CalendarOutlined,
  DollarOutlined,
  StarOutlined,
  RocketOutlined,
  CrownOutlined,
  GiftOutlined,
  WalletOutlined,
  CreditCardOutlined,
} from '@ant-design/icons';
import { CreditCard } from 'lucide-react';
import PageHeader from '../../../Components/Common/PageHeader';
import {
  fetchAvailablePlans,
  registerForPlan,
  clearSubscriptionError,
  checkSubscriptionStatus,
} from '../../../redux/subscription/subscriptionSlice';
import api from '../../../configs/config-axios';
import './SubscriptionSelectionPage.css';

const { Title, Text, Paragraph } = Typography;

const SubscriptionSelectionPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { availablePlans, loading, error, currentSubscription } = useSelector((state) => state.subscription);
  const { user } = useSelector((state) => state.auth);
  
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    // ⭐ Fetch current subscription to filter out
    if (user?.driverId) {
      dispatch(checkSubscriptionStatus(user.driverId));
    }
    
    // ⭐ Pass user role to fetch appropriate plans
    const userRole = user?.role || 'Driver';
    dispatch(fetchAvailablePlans(userRole));
    return () => {
      dispatch(clearSubscriptionError());
    };
  }, [dispatch, user?.role, user?.driverId]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const handleSelectPlan = async (plan) => {
    if (!user?.driverId) {
      message.error('Không tìm thấy thông tin tài xế. Vui lòng đăng nhập lại.');
      return;
    }

    // If plan is free (price = 0), register directly
    if (!plan.price || plan.price === 0) {
      setSelectedPlanId(plan.id);
      setRegistering(true);

      try {
        const result = await dispatch(
          registerForPlan({
            planId: plan.id,
            driverId: user.driverId,
          })
        ).unwrap();

        message.success(result.message || 'Đăng ký gói miễn phí thành công!');
        navigate('/driver', { replace: true });
      } catch (error) {
        message.error(error || 'Đăng ký gói thất bại. Vui lòng thử lại.');
        setRegistering(false);
        setSelectedPlanId(null);
      }
      return;
    }

    // For paid plans, show payment method selection
    setSelectedPlan(plan);
    setSelectedPlanId(plan.id);
    setPaymentMethod('CASH');
    setPaymentModalVisible(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPlan || !user?.driverId) {
      message.error('Thông tin không hợp lệ');
      return;
    }

    setRegistering(true);
    setPaymentModalVisible(false);

    try {
      if (paymentMethod === 'CASH') {
        // Create cash payment request for employee approval
        console.log('💰 Creating cash payment request for subscription...');
        
        // Backend expects @RequestParam, so use query parameters
        const response = await api.post('/subscriptions/purchase/cash', null, {
          params: {
            driverId: user.driverId,
            subscriptionPlanId: selectedPlan.id,
            facilityId: 1 // Default facility
          }
        });

        message.success('Yêu cầu thanh toán đã được gửi! Vui lòng chờ nhân viên duyệt.');
        console.log('✅ Cash payment request created:', response.data);
        
        // Navigate back to driver home
        setTimeout(() => {
          navigate('/driver', { replace: true });
        }, 2000);

      } else if (paymentMethod === 'VNPAY') {
        // Create VNPAY payment URL
        console.log('💳 Creating VNPAY payment for subscription...');
        const response = await api.post('/vnpay/subscription/create-payment', {
          referenceId: selectedPlan.id, // Backend expects referenceId, not planId
          driverId: user.driverId,
          amount: selectedPlan.price,
          returnUrl: `${window.location.origin}/payment/vnpay/callback`
        });

        const paymentUrl = response.data?.data?.paymentUrl || response.data?.paymentUrl;
        
        if (paymentUrl) {
          message.success('Đang chuyển đến cổng thanh toán VNPay...');
          console.log('🌐 Redirecting to VNPay:', paymentUrl);
          
          // Redirect to VNPay payment gateway
          window.location.href = paymentUrl;
        } else {
          throw new Error('Không nhận được URL thanh toán');
        }
      }
    } catch (error) {
      console.error('❌ Payment error:', error);
      message.error(error.response?.data?.message || 'Thanh toán thất bại. Vui lòng thử lại.');
      setRegistering(false);
      setSelectedPlanId(null);
    }
  };

  const handleCancelPayment = () => {
    setPaymentModalVisible(false);
    setSelectedPlanId(null);
    setSelectedPlan(null);
    setRegistering(false);
  };

  const getPlanIcon = (planType) => {
    const type = planType?.toLowerCase() || '';
    if (type.includes('basic') || type.includes('free')) {
      return <GiftOutlined style={{ fontSize: '32px', color: '#52c41a' }} />;
    } else if (type.includes('premium') || type.includes('vip')) {
      return <CrownOutlined style={{ fontSize: '32px', color: '#faad14' }} />;
    } else if (type.includes('standard')) {
      return <StarOutlined style={{ fontSize: '32px', color: '#1890ff' }} />;
    }
    return <RocketOutlined style={{ fontSize: '32px', color: '#722ed1' }} />;
  };

  const formatPrice = (price) => {
    if (!price || price === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const isRecommended = (plan) => {
    if (plan.isDefault) return true;
    const planName = plan.planName?.toLowerCase() || '';
    return planName.includes('standard') || planName.includes('basic');
  };

  // ⭐ Filter out current active subscription plan
  const filteredPlans = availablePlans.filter(plan => {
    // If no current subscription, show all plans
    if (!currentSubscription || !currentSubscription.plan) {
      return true;
    }
    
    // Hide the plan that driver currently has
    return plan.id !== currentSubscription.plan.id;
  });

  if (loading && availablePlans.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        <PageHeader
          title="Chọn gói đăng ký"
          subtitle="Đang tải danh sách gói subscription"
          showBackButton
          onBack="/driver"
          icon={CreditCard}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
        <div className='flex justify-center items-center py-20'>
          <Spin size='large' tip='Đang tải danh sách gói đăng ký...' />
        </div>
      </div>
    );
  }

  return (
    <div className='subscription-selection-page' style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <PageHeader
        title="Chọn gói đăng ký"
        subtitle="Chọn gói phù hợp để nhận ưu đãi khi sạc xe"
        showBackButton
        onBack="/driver"
        icon={CreditCard}
        iconBgColor="bg-purple-100"
        iconColor="text-purple-600"
        breadcrumbs={[
          { label: 'Trang chủ', path: '/driver' },
          { label: 'Chọn gói' }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Info alert về gói hiện tại */}
        {currentSubscription && currentSubscription.plan && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700">
              <CheckCircleOutlined />
              <span className="font-medium">
                Bạn đang sử dụng gói <strong>{currentSubscription.plan.planName}</strong>
              </span>
            </div>
            <p className="text-sm text-blue-600 mt-1 ml-6">
              Các gói khác phù hợp để nâng cấp hoặc thay đổi sẽ hiển thị bên dưới
            </p>
          </div>
        )}

        <Row gutter={[24, 24]} justify='center'>
        {filteredPlans.map((plan) => (
          <Col xs={24} sm={24} md={12} lg={8} key={plan.id}>
            <Badge.Ribbon
              text='Khuyến nghị'
              color='red'
              style={{ display: isRecommended(plan) ? 'block' : 'none' }}
            >
              <Card
                className={'subscription-plan-card ' + (selectedPlanId === plan.id ? 'selected' : '') + ' ' + (isRecommended(plan) ? 'recommended' : '')}
                hoverable
                bordered
              >
                <div className='plan-icon-container'>
                  {getPlanIcon(plan.planType)}
                </div>

                <Title level={3} className='plan-name'>
                  {plan.planName}
                </Title>

                <div className='plan-price'>
                  <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                    {formatPrice(plan.price)}
                  </Title>
                  <Text type='secondary'>/ {plan.validityDays} ngày</Text>
                </div>

                <Divider />

                <div className='plan-description'>
                  <Text strong style={{ fontSize: '16px', marginBottom: '12px', display: 'block' }}>
                    Quyền lợi:
                  </Text>
                  {plan.description ? (
                    <div className='benefits-list'>
                      {plan.description.split('\n').map((line, index) => {
                        const trimmedLine = line.trim();
                        if (!trimmedLine) return null;
                        
                        const isBullet = trimmedLine.startsWith('') || 
                                       trimmedLine.startsWith('-') || 
                                       trimmedLine.startsWith('*') ||
                                       /^\d+\./.test(trimmedLine);
                        
                        const cleanLine = isBullet 
                          ? trimmedLine.replace(/^[\-*]\s*/, '').replace(/^\d+\.\s*/, '')
                          : trimmedLine;
                        
                        return (
                          <div key={index} className='benefit-item' style={{ marginBottom: '8px' }}>
                            <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                            <Text>{cleanLine}</Text>
                          </div>
                        );
                      }).filter(Boolean)}
                    </div>
                  ) : (
                    <Text type='secondary'>Liên hệ admin để biết thêm chi tiết quyền lợi</Text>
                  )}
                </div>

                <Divider />

                <div className='plan-stats'>
                  <Tag color='blue'>
                    <CalendarOutlined /> {plan.validityDays} ngày
                  </Tag>
                  {plan.discountRate > 0 && (
                    <Tag color='orange'>
                      <DollarOutlined /> Giảm {plan.discountRate}%
                    </Tag>
                  )}
                  {plan.totalRegistrations !== undefined && (
                    <Tag color='green'>
                      <StarOutlined /> {plan.totalRegistrations} người đã đăng ký
                    </Tag>
                  )}
                  {plan.isDefault && (
                    <Tag color='gold'>
                       Khuyến nghị
                    </Tag>
                  )}
                </div>

                <Button
                  type='primary'
                  size='large'
                  block
                  loading={registering && selectedPlanId === plan.id}
                  disabled={registering}
                  onClick={() => handleSelectPlan(plan)}
                  className='select-plan-button'
                  icon={<CheckCircleOutlined />}
                >
                  {registering && selectedPlanId === plan.id ? 'Đang xử lý...' : 'Chọn gói này'}
                </Button>
              </Card>
            </Badge.Ribbon>
          </Col>
        ))}
      </Row>

      {filteredPlans.length === 0 && !loading && (
        <div className='no-plans-container'>
          <Text type='secondary' style={{ fontSize: '16px' }}>
            {currentSubscription && currentSubscription.plan 
              ? `Bạn đang sử dụng gói ${currentSubscription.plan.planName}. Hiện không có gói khác phù hợp để thay đổi.`
              : 'Hiện chưa có gói đăng ký nào. Vui lòng liên hệ quản trị viên.'
            }
          </Text>
        </div>
      )}

      {/* Payment Method Selection Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <WalletOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            <span>Chọn phương thức thanh toán</span>
          </div>
        }
        open={paymentModalVisible}
        onOk={handleConfirmPayment}
        onCancel={handleCancelPayment}
        okText="Xác nhận thanh toán"
        cancelText="Hủy"
        okButtonProps={{ size: 'large', loading: registering }}
        cancelButtonProps={{ size: 'large', disabled: registering }}
        width={600}
      >
        {selectedPlan && (
          <div>
            <Card className="mb-4" style={{ backgroundColor: '#f0f5ff', border: '1px solid #d6e4ff' }}>
              <div style={{ textAlign: 'center' }}>
                <Title level={4} style={{ marginBottom: '8px' }}>
                  {selectedPlan.planName}
                </Title>
                <Title level={2} style={{ color: '#1890ff', margin: 0 }}>
                  {formatPrice(selectedPlan.price)}
                </Title>
                <Text type="secondary">/ {selectedPlan.validityDays} ngày</Text>
              </div>
            </Card>

            <Divider>Chọn phương thức thanh toán</Divider>

            <Radio.Group 
              value={paymentMethod} 
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{ width: '100%' }}
              size="large"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Card 
                  hoverable
                  className={paymentMethod === 'CASH' ? 'selected-payment' : ''}
                  onClick={() => setPaymentMethod('CASH')}
                  style={{ 
                    cursor: 'pointer',
                    border: paymentMethod === 'CASH' ? '2px solid #1890ff' : '1px solid #d9d9d9'
                  }}
                >
                  <Radio value="CASH" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginLeft: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <DollarOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                            Tiền mặt
                          </div>
                          <div style={{ fontSize: '13px', color: '#666' }}>
                            Thanh toán tại cơ sở - Cần nhân viên duyệt
                          </div>
                        </div>
                      </div>
                      <Tag color="orange">Chờ duyệt</Tag>
                    </div>
                  </Radio>
                </Card>

                <Card 
                  hoverable
                  className={paymentMethod === 'VNPAY' ? 'selected-payment' : ''}
                  onClick={() => setPaymentMethod('VNPAY')}
                  style={{ 
                    cursor: 'pointer',
                    border: paymentMethod === 'VNPAY' ? '2px solid #1890ff' : '1px solid #d9d9d9'
                  }}
                >
                  <Radio value="VNPAY" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginLeft: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <CreditCardOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                            VNPay
                          </div>
                          <div style={{ fontSize: '13px', color: '#666' }}>
                            Thanh toán online - Kích hoạt tự động
                          </div>
                        </div>
                      </div>
                      <Tag color="blue">Nhanh chóng</Tag>
                    </div>
                  </Radio>
                </Card>
              </div>
            </Radio.Group>

            <Divider />

            <div style={{ backgroundColor: '#fffbe6', padding: '12px', borderRadius: '8px', border: '1px solid #ffe58f' }}>
              <Text style={{ fontSize: '13px' }}>
                <strong>💡 Lưu ý:</strong>
                <ul style={{ marginTop: '8px', marginBottom: '0', paddingLeft: '20px' }}>
                  <li><strong>Tiền mặt:</strong> Yêu cầu sẽ được gửi đến nhân viên để duyệt. Gói đăng ký sẽ được kích hoạt sau khi nhân viên xác nhận.</li>
                  <li><strong>VNPay:</strong> Thanh toán ngay qua cổng thanh toán điện tử. Gói đăng ký sẽ được kích hoạt tự động sau khi thanh toán thành công.</li>
                </ul>
              </Text>
            </div>
          </div>
        )}
      </Modal>
      </div>
    </div>
  );
};

export default SubscriptionSelectionPage;
