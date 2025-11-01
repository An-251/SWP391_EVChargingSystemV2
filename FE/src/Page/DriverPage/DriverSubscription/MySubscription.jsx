import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, Spin, Button, Tag, Alert, Progress, Descriptions, Statistic, Row, Col } from 'antd';
import { 
  CreditCard, 
  Calendar, 
  Award, 
  TrendingUp, 
  Zap, 
  CheckCircle, 
  XCircle,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
// Giả định đường dẫn Redux của bạn là chính xác
// Sửa lỗi: Đã cập nhật đường dẫn import tương đối cho Redux slice
import { checkSubscriptionStatus } from '../../redux/subscription/subscriptionSlice';

const MySubscription = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user } = useSelector((state) => state.auth);
  const { currentSubscription, hasActiveSubscription, loading } = useSelector((state) => state.subscription);
  
  const [refreshing, setRefreshing] = useState(false);

  // Fetch subscription on mount
  useEffect(() => {
    if (user?.driverId) {
      dispatch(checkSubscriptionStatus(user.driverId));
    }
  }, [user, dispatch]);

  // Refresh subscription status
  const handleRefresh = async () => {
    if (!user?.driverId) return;
    
    setRefreshing(true);
    try {
      await dispatch(checkSubscriptionStatus(user.driverId)).unwrap();
    } catch (error) {
      console.error('Error refreshing subscription:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Calculate days remaining
  const getDaysRemaining = () => {
    if (!currentSubscription?.endDate) return 0;
    
    const endDate = new Date(currentSubscription.endDate);
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  // Calculate subscription progress
  const getSubscriptionProgress = () => {
    if (!currentSubscription?.startDate || !currentSubscription?.endDate) return 0;
    
    const startDate = new Date(currentSubscription.startDate);
    const endDate = new Date(currentSubscription.endDate);
    const today = new Date();
    
    const totalDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
    const usedDays = (today - startDate) / (1000 * 60 * 60 * 24);
    
    const progress = Math.min((usedDays / totalDays) * 100, 100);
    return Math.max(progress, 0);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Get plan type color
  const getPlanTypeColor = (type) => {
    const colors = {
      'MONTHLY': 'blue',
      'QUARTERLY': 'green',
      'YEARLY': 'gold',
      'LIFETIME': 'purple'
    };
    return colors[type] || 'default';
  };

  // Get plan type label
  const getPlanTypeLabel = (type) => {
    const labels = {
      'MONTHLY': 'Theo tháng',
      'QUARTERLY': 'Theo quý',
      'YEARLY': 'Theo năm',
      'LIFETIME': 'Trọn đời'
    };
    return labels[type] || type;
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'ACTIVE': 'green',
      'EXPIRED': 'red',
      'PENDING': 'orange',
      'CANCELLED': 'default'
    };
    return colors[status] || 'default';
  };

  const daysRemaining = getDaysRemaining();
  const progress = getSubscriptionProgress();
  const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 7;

  if (loading && !currentSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <Spin size="large" tip="Đang tải thông tin gói đăng ký..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                icon={<ArrowLeft className="w-4 h-4" />}
                onClick={() => navigate('/driver')}
                type="text"
              >
                Quay lại
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-green-500" />
                  Gói đăng ký của tôi
                </h1>
                <p className="text-sm text-gray-500">Quản lý và xem thông tin gói đăng ký</p>
              </div>
            </div>
            
            <Button
              icon={<RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />}
              onClick={handleRefresh}
              loading={refreshing}
            >
              Làm mới
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* No Subscription Alert */}
        {!hasActiveSubscription && (
          <Alert
            message="Đã có gói Basic miễn phí"
            description="Bạn đã được tự động đăng ký gói Basic khi đăng ký tài khoản. Vui lòng làm mới trang hoặc kiểm tra lại."
            type="info"
            showIcon
            icon={<CheckCircle className="w-5 h-5" />}
            action={
              <Button 
                type="primary" 
                onClick={handleRefresh}
              >
                Làm mới
              </Button>
            }
            className="mb-6"
          />
        )}

        {/* Expiring Soon Alert */}
        {hasActiveSubscription && isExpiringSoon && currentSubscription?.plan?.planName !== 'Basic' && (
          <Alert
            message="Gói sắp hết hạn!"
            description={`Gói đăng ký của bạn sẽ hết hạn sau ${daysRemaining} ngày. Vui lòng gia hạn để tiếp tục sử dụng dịch vụ.`}
            type="warning"
            showIcon
            icon={<Calendar className="w-5 h-5" />}
            action={
              <Button type="primary" onClick={() => navigate('/driver/subscription-upgrade')}>
                Gia hạn ngay
              </Button>
            }
            className="mb-6"
          />
        )}

        {hasActiveSubscription && currentSubscription && (
          <div className="space-y-6">
            {/* Current Plan Card */}
            <Card className="shadow-lg border-green-200">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {currentSubscription.plan?.planName || 'N/A'}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Tag color={getPlanTypeColor(currentSubscription.plan?.planType)}>
                        {getPlanTypeLabel(currentSubscription.plan?.planType)}
                      </Tag>
                      <Tag color={getStatusColor(currentSubscription.status)} icon={<CheckCircle className="w-3 h-3" />}>
                        {currentSubscription.status === 'ACTIVE' ? 'Đang hoạt động' : currentSubscription.status}
                      </Tag>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-gray-500">Còn lại</div>
                  <div className="text-3xl font-bold text-green-600">{daysRemaining}</div>
                  <div className="text-sm text-gray-500">ngày</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Tiến độ sử dụng</span>
                  <span className="text-sm font-medium text-gray-900">{progress.toFixed(0)}%</span>
                </div>
                <Progress 
                  percent={progress} 
                  strokeColor={{
                    '0%': '#10b981',
                    '100%': progress > 80 ? '#ef4444' : '#10b981',
                  }}
                  showInfo={false}
                />
              </div>

              {/* Plan Details */}
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Ngày bắt đầu" span={1}>
                  <Calendar className="w-4 h-4 inline mr-2 text-gray-400" />
                  {formatDate(currentSubscription.startDate)}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày hết hạn" span={1}>
                  <Calendar className="w-4 h-4 inline mr-2 text-gray-400" />
                  {formatDate(currentSubscription.endDate)}
                </Descriptions.Item>
                <Descriptions.Item label="Mô tả gói" span={2}>
                  {currentSubscription.plan?.description || 'Không có mô tả'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Statistics */}
            <Row gutter={16}>
              <Col span={8}>
                <Card className="shadow-md">
                  <Statistic
                    title="Loại gói"
                    value={currentSubscription.plan?.planName}
                    prefix={<TrendingUp className="w-5 h-5 text-blue-500" />}
                    valueStyle={{ fontSize: '20px' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card className="shadow-md">
                  <Statistic
                    title="Thời hạn"
                    value={getPlanTypeLabel(currentSubscription.plan?.planType)}
                    prefix={<Calendar className="w-5 h-5 text-green-500" />}
                    valueStyle={{ fontSize: '20px' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card className="shadow-md">
                  <Statistic
                    title="Trạng thái"
                    value={currentSubscription.status === 'ACTIVE' ? 'Hoạt động' : currentSubscription.status}
                    prefix={<Zap className="w-5 h-5 text-yellow-500" />}
                    valueStyle={{ 
                      fontSize: '20px',
                      color: currentSubscription.status === 'ACTIVE' ? '#10b981' : '#6b7280'
                    }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Actions */}
            <Card className="shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {currentSubscription?.plan?.planName === 'Basic' ? 'Muốn nâng cấp?' : 'Cần gia hạn hoặc nâng cấp?'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {currentSubscription?.plan?.planName === 'Basic' 
                      ? 'Nâng cấp lên gói Premium để nhận nhiều ưu đãi hơn'
                      : 'Khám phá các gói khác để nhận ưu đãi tốt hơn'
                    }
                  </p>
                </div>
                <Button 
                  type="primary" 
                  size="large"
                  onClick={() => navigate('/driver/subscription-upgrade')}
                >
                  {currentSubscription?.plan?.planName === 'Basic' ? 'Nâng cấp ngay' : 'Xem các gói khác'}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default MySubscription;

