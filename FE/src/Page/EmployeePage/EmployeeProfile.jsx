import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Spin, Descriptions, Tag, Avatar } from 'antd';
import { User, Mail, Phone, Briefcase, MapPin, Building2, Save } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../../configs/config-axios';
import { setUser } from '../../redux/auth/authSlice';

const EmployeeProfile = () => {
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        fullName: user.fullName,
        phone: user.phone,
      });
    }
  }, [user, form]);

  const handleUpdate = async (values) => {
    try {
      setLoading(true);
      
      // Update profile via API
      const response = await api.put('/station-employees/profile', {
        fullName: values.fullName,
        phone: values.phone,
      });

      // Update Redux store
      dispatch(setUser({
        ...user,
        fullName: values.fullName,
        phone: values.phone,
      }));

      message.success('Cập nhật thông tin thành công!');
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error(error.response?.data?.message || 'Không thể cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card className="shadow-sm">
        <div className="flex items-center space-x-6">
          <Avatar
            size={100}
            className="bg-gradient-to-br from-blue-500 to-blue-700"
            icon={<User size={40} />}
          >
            {user?.fullName?.charAt(0)?.toUpperCase()}
          </Avatar>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800">{user?.fullName || 'Employee'}</h2>
            <p className="text-gray-500 mb-2">{user?.position || 'Staff'}</p>
            <div className="flex items-center gap-2">
              <Tag color="blue">{user?.role || 'STATION_EMPLOYEE'}</Tag>
              <Tag color="green">
                <Building2 size={12} className="inline mr-1" />
                {user?.facilityName || 'Chưa có cơ sở'}
              </Tag>
            </div>
          </div>
          {!editMode && (
            <Button
              type="primary"
              icon={<User size={16} />}
              onClick={() => setEditMode(true)}
            >
              Chỉnh sửa
            </Button>
          )}
        </div>
      </Card>

      {/* Profile Information */}
      <Card title="Thông tin cá nhân" className="shadow-sm">
        {!editMode ? (
          <Descriptions column={1} bordered>
            <Descriptions.Item 
              label={
                <span className="flex items-center gap-2">
                  <User size={16} />
                  Họ và tên
                </span>
              }
            >
              {user?.fullName || 'N/A'}
            </Descriptions.Item>
            
            <Descriptions.Item 
              label={
                <span className="flex items-center gap-2">
                  <Mail size={16} />
                  Email
                </span>
              }
            >
              {user?.email || 'N/A'}
            </Descriptions.Item>
            
            <Descriptions.Item 
              label={
                <span className="flex items-center gap-2">
                  <Phone size={16} />
                  Số điện thoại
                </span>
              }
            >
              {user?.phone || 'Chưa cập nhật'}
            </Descriptions.Item>
            
            <Descriptions.Item 
              label={
                <span className="flex items-center gap-2">
                  <Briefcase size={16} />
                  Vị trí
                </span>
              }
            >
              {user?.position || 'Staff'}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleUpdate}
            className="max-w-2xl"
          >
            <Form.Item
              label={
                <span className="flex items-center gap-2">
                  <User size={16} />
                  Họ và tên
                </span>
              }
              name="fullName"
              rules={[
                { required: true, message: 'Vui lòng nhập họ tên' },
                { min: 2, message: 'Họ tên phải có ít nhất 2 ký tự' },
              ]}
            >
              <Input size="large" placeholder="Nhập họ và tên" />
            </Form.Item>

            <Form.Item
              label={
                <span className="flex items-center gap-2">
                  <Phone size={16} />
                  Số điện thoại
                </span>
              }
              name="phone"
              rules={[
                { pattern: /^[0-9]{10}$/, message: 'Số điện thoại phải có 10 chữ số' },
              ]}
            >
              <Input size="large" placeholder="Nhập số điện thoại" />
            </Form.Item>

            <div className="flex gap-3">
              <Button
                type="primary"
                htmlType="submit"
                icon={<Save size={16} />}
                loading={loading}
                size="large"
              >
                Lưu thay đổi
              </Button>
              <Button
                size="large"
                onClick={() => {
                  setEditMode(false);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
            </div>
          </Form>
        )}
      </Card>

      {/* Facility Information */}
      <Card title="Thông tin cơ sở" className="shadow-sm">
        <Descriptions column={1} bordered>
          <Descriptions.Item 
            label={
              <span className="flex items-center gap-2">
                <Building2 size={16} />
                Tên cơ sở
              </span>
            }
          >
            {user?.facilityName || 'Chưa được gán cơ sở'}
          </Descriptions.Item>
          
          <Descriptions.Item 
            label={
              <span className="flex items-center gap-2">
                <MapPin size={16} />
                Địa chỉ
              </span>
            }
          >
            {user?.facilityAddress || 'N/A'}
          </Descriptions.Item>
          
          <Descriptions.Item 
            label={
              <span className="flex items-center gap-2">
                <MapPin size={16} />
                Thành phố
              </span>
            }
          >
            {user?.facilityCity || 'N/A'}
          </Descriptions.Item>
        </Descriptions>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
          <p className="text-sm text-blue-800">
            <strong>Lưu ý:</strong> Bạn chỉ có thể quản lý các đặt chỗ và phiên sạc tại cơ sở này.
            Liên hệ quản trị viên nếu cần thay đổi cơ sở làm việc.
          </p>
        </div>
      </Card>

      {/* Account Information */}
      <Card title="Thông tin tài khoản" className="shadow-sm">
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Username">
            {user?.username || 'N/A'}
          </Descriptions.Item>
          
          <Descriptions.Item label="ID nhân viên">
            #{user?.employeeId || 'N/A'}
          </Descriptions.Item>
          
          <Descriptions.Item label="Trạng thái">
            <Tag color={user?.status === 'active' ? 'green' : 'red'}>
              {user?.status === 'active' ? 'Hoạt động' : 'Ngưng hoạt động'}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default EmployeeProfile;
