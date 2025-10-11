import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Save, 
  ArrowLeft,
  Edit3,
  Camera
} from 'lucide-react';
import { Form, Input, Button, DatePicker, Select, Upload, message } from 'antd';
import { updateDriverProfile } from '../../redux/auth/authSlice';
import dayjs from 'dayjs';

const { Option } = Select;

const DriverProfile = () => {
  const { user, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        dob: user.dob ? dayjs(user.dob) : null,
        idNumber: user.idNumber,
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

  const handleAvatarChange = (info) => {
    if (info.file.status === 'uploading') {
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      setAvatarUrl(info.file.response?.url);
    }
  };

  const uploadButton = (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <Camera className="w-8 h-8 text-gray-400 mb-2" />
      <div className="text-sm text-gray-500">Tải ảnh lên</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/driver')}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Thông tin cá nhân</h1>
              <p className="text-sm text-gray-500">Cập nhật thông tin tài khoản của bạn</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-8">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                {isEditing && (
                  <Upload
                    name="avatar"
                    listType="picture"
                    className="absolute -bottom-2 -right-2"
                    showUploadList={false}
                    onChange={handleAvatarChange}
                  >
                    <Button
                      size="small"
                      type="primary"
                      shape="circle"
                      icon={<Camera className="w-4 h-4" />}
                    />
                  </Upload>
                )}
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold">{user?.fullName || user?.username}</h2>
                <p className="text-green-100">{user?.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="bg-green-400 px-3 py-1 rounded-full">
                    <span className="text-sm font-medium">Driver</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Thông tin chi tiết</h3>
              {!isEditing ? (
                <Button
                  type="primary"
                  icon={<Edit3 className="w-4 h-4" />}
                  onClick={() => setIsEditing(true)}
                  className="bg-green-500 hover:bg-green-600"
                >
                  Chỉnh sửa
                </Button>
              ) : (
                <div className="space-x-3">
                  <Button onClick={() => {
                    setIsEditing(false);
                    form.resetFields();
                  }}>
                    Hủy
                  </Button>
                </div>
              )}
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              disabled={!isEditing}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Form.Item
                  label={
                    <span className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Tên đăng nhập</span>
                    </span>
                  }
                  name="username"
                >
                  <Input disabled className="h-12" />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Họ và tên</span>
                    </span>
                  }
                  name="fullName"
                  rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                >
                  <Input placeholder="Nhập họ và tên" className="h-12" />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>Email</span>
                    </span>
                  }
                  name="email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email!' },
                    { type: 'email', message: 'Email không hợp lệ!' }
                  ]}
                >
                  <Input placeholder="Nhập email" className="h-12" />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>Số điện thoại</span>
                    </span>
                  }
                  name="phone"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số điện thoại!' },
                    { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
                  ]}
                >
                  <Input placeholder="Nhập số điện thoại" className="h-12" />
                </Form.Item>

                <Form.Item
                  label="Giới tính"
                  name="gender"
                  rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
                >
                  <Select placeholder="Chọn giới tính" className="h-12">
                    <Option value="Nam">Nam</Option>
                    <Option value="Nữ">Nữ</Option>
                    <Option value="Khác">Khác</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label={
                    <span className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Ngày sinh</span>
                    </span>
                  }
                  name="dob"
                  rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}
                >
                  <DatePicker 
                    placeholder="Chọn ngày sinh" 
                    className="h-12 w-full"
                    format="DD/MM/YYYY"
                  />
                </Form.Item>

                <Form.Item
                  label="Số CCCD/CMND"
                  name="idNumber"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số CCCD/CMND!' },
                    { pattern: /^[0-9]{9,12}$/, message: 'Số CCCD/CMND không hợp lệ!' }
                  ]}
                  className="md:col-span-2"
                >
                  <Input placeholder="Nhập số CCCD/CMND" className="h-12" />
                </Form.Item>
              </div>

              {isEditing && (
                <div className="flex justify-end mt-8">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<Save className="w-4 h-4" />}
                    size="large"
                    className="bg-green-500 hover:bg-green-600 px-8"
                  >
                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </Button>
                </div>
              )}
            </Form>
          </div>
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