import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, AlertTriangle } from 'lucide-react';
import { Form, Button, message, Modal } from 'antd';
import { 
  getCurrentProfile, 
  updateDriverProfile, 
  deleteDriverProfile 
} from '../../../redux/auth/authSlice';
import dayjs from 'dayjs';

import ProfileHeader from './components/ProfileHeader';
import ProfileForm from './components/ProfileForm';

const DriverProfile = () => {
  const { user, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);

  // Fetch current profile on mount
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
            <Button type="link" className="text-blue-600 p-0">
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
            <Button type="link" className="text-green-600 p-0">
              Xem lịch sử →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;
