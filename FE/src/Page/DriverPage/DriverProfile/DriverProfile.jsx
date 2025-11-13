import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, AlertTriangle, CreditCard, Award } from 'lucide-react';
import { Form, Button, message, Modal, Tag } from 'antd';
import { 
  getCurrentProfile, 
  updateDriverProfile, 
  deleteDriverProfile 
} from '../../../redux/auth/authSlice';
import dayjs from 'dayjs';

import ProfileHeader from './components/ProfileHeader';
import ProfileForm from './components/ProfileForm';
import DriverQRCode from '../components/DriverQRCode';

const DriverProfile = () => {
  const { user, loading } = useSelector((state) => state.auth);
  const currentSubscription = useSelector((state) => state.subscription.currentSubscription);
  const hasActiveSubscription = useSelector((state) => state.subscription.hasActiveSubscription);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);

  // ✅ Fetch current profile ONCE on mount - NO subscription check here
  // SubscriptionGuard handles subscription checking
  useEffect(() => {
    dispatch(getCurrentProfile());
  }, [dispatch]);

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        idNumber: user.idNumber,
        gender: user.gender,
        dob: user.dob ? dayjs(user.dob) : null,
      });
    }
  }, [user, form]);

  const handleSubmit = async (values) => {
    try {
      const profileData = {
        ...values,
        dob: values.dob ? values.dob.format('YYYY-MM-DD') : null,
      };
      
      await dispatch(updateDriverProfile(profileData)).unwrap();
      message.success('Cập nhật thông tin thành công!');
      setIsEditing(false);
    } catch (error) {
      message.error(error || 'Cập nhật thông tin thất bại!');
    }
  };

  const handleDeleteAccount = () => {
    Modal.confirm({
      title: 'Xóa tài khoản',
      icon: <AlertTriangle className="text-red-500" />,
      content: (
        <div>
          <p className="mb-2">Bạn có chắc chắn muốn xóa tài khoản này?</p>
          <p className="text-red-600 font-semibold">
            Hành động này không thể hoàn tác và tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn!
          </p>
        </div>
      ),
      okText: 'Xóa tài khoản',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await dispatch(deleteDriverProfile()).unwrap();
          message.success('Tài khoản đã được xóa thành công!');
          navigate('/auth/login');
        } catch (error) {
          message.error(error || 'Xóa tài khoản thất bại!');
        }
      }
    });
  };

  const handleAvatarChange = (info) => {
    if (info.file.status === 'uploading') {
      return;
    }
    if (info.file.status === 'done') {
      setAvatarUrl(info.file.response?.url);
    }
  };

  const handleEdit = () => setIsEditing(true);
  
  const handleCancel = () => {
    setIsEditing(false);
    form.resetFields();
  };

  const handleBack = () => navigate('/driver');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Content */}
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <ProfileHeader
            user={user}
            avatarUrl={avatarUrl}
            isEditing={isEditing}
            onAvatarChange={handleAvatarChange}
            onBackClick={handleBack}
          />

          <ProfileForm
            form={form}
            isEditing={isEditing}
            loading={loading}
            onSubmit={handleSubmit}
            onEdit={handleEdit}
            onCancel={handleCancel}
            onDelete={handleDeleteAccount}
          />
        </div>

        {/* QR Code & Subscription Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Driver QR Code */}
          {user?.driverId && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <DriverQRCode 
                driverId={user.driverId}
                driverName={user.fullName || user.username}
                size={200}
                showDownload={true}
              />
            </div>
          )}

          {/* Subscription Info Card */}
          {hasActiveSubscription && currentSubscription && (
            <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl shadow-sm border-2 border-green-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">
                      {currentSubscription.plan?.planName || currentSubscription.planName || 'N/A'}
                    </h4>
                    <p className="text-sm text-gray-600">Gói đăng ký hiện tại</p>
                  </div>
                </div>
                <Tag color="green" className="text-sm">
                  {currentSubscription.status?.toLowerCase() === 'active' ? 'Đang hoạt động' : currentSubscription.status}
                </Tag>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Ngày bắt đầu</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {currentSubscription.startDate || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Ngày hết hạn</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {currentSubscription.endDate || 'N/A'}
                  </p>
                </div>
              </div>

              <Button 
                type="link" 
                icon={<CreditCard className="w-4 h-4" />}
                className="text-green-600 p-0 mt-4"
                onClick={() => navigate('/driver/my-subscription')}
              >
                Xem chi tiết gói đăng ký →
              </Button>
            </div>
          )}

          {/* No Subscription - Show in same row with QR */}
          {!hasActiveSubscription && (
            <div className="bg-amber-50 p-6 rounded-xl shadow-sm border-2 border-amber-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Chưa có gói đăng ký</h4>
                  <p className="text-sm text-gray-600">Đăng ký gói để nhận ưu đãi</p>
                </div>
              </div>
              <Button 
                type="primary" 
                className="bg-green-500 hover:bg-green-600 mt-2 w-full"
                onClick={() => navigate('/driver/select-subscription')}
              >
                Chọn gói đăng ký →
              </Button>
            </div>
          )}
        </div>

        {/* Additional Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Xe của tôi</h4>
                <p className="text-sm text-gray-500">Quản lý thông tin xe</p>
              </div>
            </div>
            <Button 
              type="link" 
              className="text-blue-600 p-0"
              onClick={() => navigate('/driver/vehicles')}
            >
              Xem chi tiết →
            </Button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Lịch sử sạc</h4>
                <p className="text-sm text-gray-500">Xem lịch sử các lần sạc</p>
              </div>
            </div>
            <Button 
              type="link" 
              className="text-green-600 p-0"
              onClick={() => navigate('/driver/history')}
            >
              Xem lịch sử →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;
