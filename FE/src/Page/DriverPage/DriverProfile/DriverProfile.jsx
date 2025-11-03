import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, AlertTriangle } from 'lucide-react';
// 1. Import thêm Modal
import { Form, Button, message, Modal } from 'antd'; 
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
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  // 2. Đổi tên state cho rõ nghĩa
  const [isModalVisible, setIsModalVisible] = useState(false);
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
      // 3. Đóng Modal sau khi submit thành công
      setIsModalVisible(false);
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
          // Có thể đóng modal trước khi chuyển trang (mặc dù không bắt buộc)
          setIsModalVisible(false); 
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

  // 3. Hàm này giờ sẽ MỞ MODAL
  const handleEdit = () => setIsModalVisible(true);
  
  // 3. Hàm này giờ sẽ ĐÓNG MODAL
  const handleCancel = () => {
    setIsModalVisible(false);
    // Reset fields về giá trị ban đầu (từ user data)
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
            // Không cần truyền isEditing vào Header nữa (trừ khi bạn dùng nó để làm gì khác)
            // isEditing={isModalVisible} 
            onAvatarChange={handleAvatarChange}
            onBackClick={handleBack}
          />

          {/* 4. Form Hiển Thị (Luôn ở chế độ disabled) */}
          <ProfileForm
            form={form}
            isEditing={false} // Luôn luôn false
            loading={loading}
            onEdit={handleEdit} // Nút "Edit" của form này sẽ mở Modal
            // Các prop còn lại không cần thiết vì isEditing={false}
            // onSubmit, onCancel, onDelete sẽ không bao giờ được gọi
          />
        </div>

        {/* QR Code Section */}
        {user?.driverId && (
          <div className="mt-6">
            <DriverQRCode
              driverId={user.driverId}
              driverName={user.fullName || user.username}
              size={200}
              showDownload={true}
            />
          </div>
        )}
      </div>

      {/* 4. Modal chứa Form Chỉnh Sửa */}
      <Modal
        title="Chỉnh sửa thông tin chi tiết"
        visible={isModalVisible}
        onCancel={handleCancel} // Bấm ra ngoài hoặc nút X sẽ gọi hàm Cancel
        footer={null} // Tắt footer mặc định vì ProfileForm đã có footer riêng
        destroyOnClose // Reset form khi đóng
      >
        <ProfileForm
            form={form}
            isEditing={true} // Form này LUÔN ở chế độ edit
            loading={loading}
            onSubmit={handleSubmit}
            onEdit={() => {}} // Sẽ không hiển thị vì isEditing={true}
            onCancel={handleCancel} // Nút "Hủy" của form sẽ gọi hàm Cancel
            onDelete={handleDeleteAccount}
          />
      </Modal>

    </div>
  );
};

export default DriverProfile;