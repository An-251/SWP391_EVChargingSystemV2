import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Tag, Empty, Divider, Typography } from 'antd';
import {
  CrownOutlined,
  CalendarOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  GiftOutlined,
} from '@ant-design/icons';
import { CreditCard } from 'lucide-react';
import PageHeader from '../../../Components/Common/PageHeader';
import { 
  SUBSCRIPTION_STATUS, 
  getSubscriptionStatusText, 
  getSubscriptionStatusColor 
} from '../../../constants/paymentStatus';

const { Title, Text } = Typography;

const MySubscription = () => {
  const navigate = useNavigate();
  const { currentSubscription, hasActiveSubscription } = useSelector((state) => state.subscription);

  if (!hasActiveSubscription || !currentSubscription) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        <PageHeader
          title="Gói đăng ký của tôi"
          subtitle="Quản lý gói subscription hiện tại"
          showBackButton
          onBack="/driver"
          icon={CreditCard}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
        
        <div style={{ maxWidth: '800px', margin: '24px auto', padding: '0 24px' }}>
          <Card>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description='Bạn chưa có gói đăng ký nào'
            >
              <Button type='primary' onClick={() => navigate('/driver/select-subscription')}>
                Chọn gói đăng ký
              </Button>
            </Empty>
          </Card>
        </div>
      </div>
    );
  }

  const planName = currentSubscription.planName || currentSubscription.plan?.planName || 'N/A';
  const planType = currentSubscription.planType || currentSubscription.plan?.planType || 'STANDARD';
  const discountRate = currentSubscription.discountRate || currentSubscription.plan?.discountRate || 0;
  const status = currentSubscription.status || 'ACTIVE';
  const startDate = currentSubscription.startDate || 'N/A';
  const endDate = currentSubscription.endDate || 'N/A';
  const description = currentSubscription.description || currentSubscription.plan?.description || '';

  const getPlanIcon = () => {
    const type = planType.toLowerCase();
    if (type.includes('premium') || type.includes('vip')) {
      return <CrownOutlined style={{ fontSize: '48px', color: '#faad14' }} />;
    } else if (type.includes('basic') || type.includes('free')) {
      return <GiftOutlined style={{ fontSize: '48px', color: '#52c41a' }} />;
    }
    return <CrownOutlined style={{ fontSize: '48px', color: '#1890ff' }} />;
  };

  const getStatusTag = () => {
    const color = getSubscriptionStatusColor(status);
    const text = getSubscriptionStatusText(status);
    
    return <Tag color={color} style={{ fontSize: '14px', padding: '4px 12px' }}>{text}</Tag>;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <PageHeader
        title="Gói đăng ký của tôi"
        subtitle="Quản lý gói subscription hiện tại"
        showBackButton
        onBack="/driver"
        icon={CreditCard}
        iconBgColor="bg-purple-100"
        iconColor="text-purple-600"
        breadcrumbs={[
          { label: 'Trang chủ', path: '/driver' },
          { label: 'Subscription' }
        ]}
      />

      <div style={{ maxWidth: '800px', margin: '24px auto', padding: '0 24px' }}>
        <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            {getPlanIcon()}
            <Title level={2} style={{ marginTop: '16px', marginBottom: '8px' }}>
              {planName}
            </Title>
            {getStatusTag()}
          </div>

          <Divider />

          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <Text type='secondary' style={{ display: 'block', marginBottom: '4px' }}>
                  <CalendarOutlined /> Ngày bắt đầu
                </Text>
                <Text strong style={{ fontSize: '16px' }}>{startDate}</Text>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Text type='secondary' style={{ display: 'block', marginBottom: '4px' }}>
                  <CalendarOutlined /> Ngày hết hạn
                </Text>
                <Text strong style={{ fontSize: '16px' }}>{endDate}</Text>
              </div>
            </div>

            {discountRate > 0 && (
              <div style={{ marginTop: '16px' }}>
                <Text type='secondary' style={{ display: 'block', marginBottom: '4px' }}>
                  <DollarOutlined /> Giảm giá
                </Text>
                <Text strong style={{ fontSize: '16px', color: '#52c41a' }}>{discountRate}%</Text>
              </div>
            )}
          </div>

          <Divider />

          <div>
            <Title level={4} style={{ marginBottom: '16px' }}>
              <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
              Quyền lợi của gói
            </Title>
            {description ? (
              <div>
                {description.split('\n').map((line, index) => {
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
                    <div key={index} style={{ marginBottom: '12px', display: 'flex', alignItems: 'flex-start' }}>
                      <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px', marginTop: '4px' }} />
                      <Text>{cleanLine}</Text>
                    </div>
                  );
                }).filter(Boolean)}
              </div>
            ) : (
              <Text type='secondary'>Không có mô tả chi tiết</Text>
            )}
          </div>

          <Divider />

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Button 
              type='default' 
              size='large'
              onClick={() => navigate('/driver/select-subscription')}
              style={{ marginRight: '12px' }}
            >
              Thay đổi gói
            </Button>
            <Button 
              type='primary' 
              size='large'
              onClick={() => navigate('/driver')}
            >
              Về trang chủ
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MySubscription;
