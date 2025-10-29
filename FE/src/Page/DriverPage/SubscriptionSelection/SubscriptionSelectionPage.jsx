import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Row, Col, Typography, Badge, message, Spin, Divider, Tag } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ThunderboltOutlined,
  CalendarOutlined,
  DollarOutlined,
  StarOutlined,
  RocketOutlined,
  CrownOutlined,
  GiftOutlined,
} from '@ant-design/icons';
import {
  fetchAvailablePlans,
  registerForPlan,
  clearSubscriptionError,
} from '../../../redux/subscription/subscriptionSlice';
import './SubscriptionSelectionPage.css';

const { Title, Text, Paragraph } = Typography;

const SubscriptionSelectionPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { availablePlans, loading, error } = useSelector((state) => state.subscription);
  const { user } = useSelector((state) => state.auth);
  
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    console.log("📋 [SUBSCRIPTION_PAGE] Loading subscription plans...");
    dispatch(fetchAvailablePlans());
    
    return () => {
      dispatch(clearSubscriptionError());
    };
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const handleSelectPlan = async (planId) => {
    if (!user?.driverId) {
      message.error('Không tìm thấy thông tin tài xế. Vui lòng đăng nhập lại.');
      return;
    }

    setSelectedPlanId(planId);
    setRegistering(true);

    console.log("🎯 [SUBSCRIPTION_PAGE] Registering for plan:", planId);

    try {
      const result = await dispatch(
        registerForPlan({
          planId: planId,
          driverId: user.driverId,
          paymentMethod: 'VNPAY',
        })
      ).unwrap();

      console.log("✅ [SUBSCRIPTION_PAGE] Registration successful:", result);

      message.success({
        content: result.message || 'Đăng ký gói thành công!',
        duration: 3,
      });

      // If there's a payment URL, redirect to payment gateway
      if (result.paymentUrl) {
        console.log("💳 [SUBSCRIPTION_PAGE] Redirecting to payment:", result.paymentUrl);
        window.location.href = result.paymentUrl;
      } else {
        // Otherwise, navigate to driver dashboard after a short delay
        setTimeout(() => {
          navigate('/driver');
        }, 1500);
      }
    } catch (error) {
      console.error("❌ [SUBSCRIPTION_PAGE] Registration failed:", error);
      message.error(error || 'Đăng ký gói thất bại. Vui lòng thử lại.');
      setRegistering(false);
      setSelectedPlanId(null);
    }
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
    // Ưu tiên plan có isDefault = true
    if (plan.isDefault) return true;
    
    // Fallback: Mark the middle-tier plan as recommended
    const planName = plan.planName?.toLowerCase() || '';
    return planName.includes('standard') || planName.includes('basic');
  };

  if (loading && availablePlans.length === 0) {
    return (
      <div className="subscription-loading-container">
        <Spin size="large" tip="Đang tải danh sách gói đăng ký..." />
      </div>
    );
  }

  return (
    <div className="subscription-selection-page">
      <div className="subscription-header">
        <Title level={2}>
          <ThunderboltOutlined /> Chọn Gói Đăng Ký
        </Title>
        <Paragraph className="subscription-subtitle">
          Để sử dụng hệ thống sạc xe điện, vui lòng chọn một gói đăng ký phù hợp với nhu cầu của bạn.
          <br />
          Bạn có thể nâng cấp hoặc thay đổi gói bất kỳ lúc nào.
        </Paragraph>
      </div>

      <Divider />

      <Row gutter={[24, 24]} justify="center">
        {availablePlans.map((plan) => (
          <Col xs={24} sm={24} md={12} lg={8} key={plan.id}>
            <Badge.Ribbon
              text="Khuyến nghị"
              color="red"
              style={{ display: isRecommended(plan) ? 'block' : 'none' }}
            >
              <Card
                className={`subscription-plan-card ${
                  selectedPlanId === plan.id ? 'selected' : ''
                } ${isRecommended(plan) ? 'recommended' : ''}`}
                hoverable
                bordered
              >
                <div className="plan-icon-container">
                  {getPlanIcon(plan.planType)}
                </div>

                <Title level={3} className="plan-name">
                  {plan.planName}
                </Title>

                <div className="plan-price">
                  <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                    {formatPrice(plan.price)}
                  </Title>
                  <Text type="secondary">/ {plan.validityDays} ngày</Text>
                </div>

                <Divider />

                <div className="plan-description">
                  <Text strong style={{ fontSize: '16px', marginBottom: '12px', display: 'block' }}>
                    Quyền lợi:
                  </Text>
                  {plan.description ? (
                    <div className="benefits-list">
                      {plan.description.split('\n').map((line, index) => {
                        const trimmedLine = line.trim();
                        if (!trimmedLine) return null;
                        
                        // Check if line starts with bullet point or number
                        const isBullet = trimmedLine.startsWith('•') || 
                                       trimmedLine.startsWith('-') || 
                                       trimmedLine.startsWith('*') ||
                                       /^\d+\./.test(trimmedLine);
                        
                        const cleanLine = isBullet 
                          ? trimmedLine.replace(/^[•\-*]\s*/, '').replace(/^\d+\.\s*/, '')
                          : trimmedLine;
                        
                        return (
                          <div key={index} className="benefit-item" style={{ marginBottom: '8px' }}>
                            <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                            <Text>{cleanLine}</Text>
                          </div>
                        );
                      }).filter(Boolean)}
                    </div>
                  ) : (
                    <Text type="secondary">Liên hệ admin để biết thêm chi tiết quyền lợi</Text>
                  )}
                </div>

                <Divider />

                <div className="plan-stats">
                  <Tag color="blue">
                    <CalendarOutlined /> {plan.validityDays} ngày
                  </Tag>
                  {plan.discountRate > 0 && (
                    <Tag color="orange">
                      <DollarOutlined /> Giảm {plan.discountRate}%
                    </Tag>
                  )}
                  {plan.totalRegistrations !== undefined && (
                    <Tag color="green">
                      <StarOutlined /> {plan.totalRegistrations} người đã đăng ký
                    </Tag>
                  )}
                  {plan.isDefault && (
                    <Tag color="gold">
                      ⭐ Khuyến nghị
                    </Tag>
                  )}
                </div>

                <Button
                  type="primary"
                  size="large"
                  block
                  loading={registering && selectedPlanId === plan.id}
                  disabled={registering}
                  onClick={() => handleSelectPlan(plan.id)}
                  className="select-plan-button"
                  icon={<CheckCircleOutlined />}
                >
                  {registering && selectedPlanId === plan.id ? 'Đang xử lý...' : 'Chọn gói này'}
                </Button>
              </Card>
            </Badge.Ribbon>
          </Col>
        ))}
      </Row>

      {availablePlans.length === 0 && !loading && (
        <div className="no-plans-container">
          <Text type="secondary" style={{ fontSize: '16px' }}>
            Hiện chưa có gói đăng ký nào. Vui lòng liên hệ quản trị viên.
          </Text>
        </div>
      )}
    </div>
  );
};

export default SubscriptionSelectionPage;
