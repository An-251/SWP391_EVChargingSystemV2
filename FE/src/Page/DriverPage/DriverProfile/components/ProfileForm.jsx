import { Form, Input, DatePicker, Select, Button } from 'antd';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Save, 
  Edit3,
  Trash2
} from 'lucide-react';

const { Option } = Select;

const ProfileForm = ({ 
  form, 
  isEditing, 
  loading,
  onSubmit, 
  onEdit, 
  onCancel,
  onDelete
}) => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Thông tin chi tiết</h3>
        {!isEditing ? (
          <Button
            type="primary"
            icon={<Edit3 className="w-4 h-4" />}
            onClick={onEdit}
            className="bg-green-500 hover:bg-green-600"
          >
            Chỉnh sửa
          </Button>
        ) : (
          <div className="space-x-3">
            <Button onClick={onCancel}>
              Hủy
            </Button>
          </div>
        )}
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
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
        </div>

        {isEditing && (
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <Button
              type="text"
              danger
              icon={<Trash2 className="w-4 h-4" />}
              onClick={onDelete}
              size="large"
            >
              Xóa tài khoản
            </Button>
            
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
  );
};

export default ProfileForm;
