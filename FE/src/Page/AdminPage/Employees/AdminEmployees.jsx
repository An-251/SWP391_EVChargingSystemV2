import React, { useState, useEffect } from 'react';
import { message, Modal, Form, Input, Select } from 'antd';
import { Users, UserPlus, Trash2, Edit } from 'lucide-react';
import AdminTable from '../../../Components/Admin/AdminTable';
import AdminCard from '../../../Components/Admin/AdminCard';
import AdminSearchBar from '../../../Components/Admin/AdminSearchBar';
import AdminModal from '../../../Components/Admin/AdminModal';
import api from '../../../configs/config-axios';

const { Option } = Select;

const AdminEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm] = Form.useForm();

  useEffect(() => {
    fetchEmployees();
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      const response = await api.get('/facilities/profile');
      // Backend returns ApiResponse.success with data property
      const facilitiesArray = response.data?.data || [];
      setFacilities(Array.isArray(facilitiesArray) ? facilitiesArray : []);
      
      if (facilitiesArray.length === 0) {
        message.warning('Chưa có cơ sở nào. Vui lòng tạo cơ sở trước khi thêm nhân viên.');
      }
    } catch (error) {
      console.error('Error fetching facilities:', error);
      message.error('Không thể tải danh sách cơ sở: ' + (error.response?.data?.message || error.message));
      setFacilities([]);
    }
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await api.get('/station-employees');
      // Ensure data is always an array
      const data = response.data?.content || response.data?.data || response.data || [];
      const employeesArray = Array.isArray(data) ? data : [];
      setEmployees(employeesArray);
    } catch (error) {
      console.error('Error fetching employees:', error);
      message.error('Không thể tải danh sách nhân viên');
      setEmployees([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async (values) => {
    setLoading(true);
    try {
      // Call Admin endpoint to create Employee (creates both Account + StationEmployee)
      const payload = {
        username: values.username,
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        phone: values.phone,
        position: values.position,
        facilityId: values.facilityId
      };

      console.log('📤 Creating employee with payload:', payload);
      const response = await api.post('/admin/accounts/employees', payload);
      console.log('✅ Employee created successfully:', response.data);
      
      message.success('Tạo nhân viên thành công!');
      setShowCreateModal(false);
      createForm.resetFields();
      fetchEmployees();
    } catch (error) {
      console.error('❌ Error creating employee:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Không thể tạo nhân viên';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc muốn xóa nhân viên này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        try {
          await api.delete(`/station-employees/${employeeId}`);
          message.success('Xóa nhân viên thành công');
          fetchEmployees();
        } catch (error) {
          message.error('Không thể xóa nhân viên');
        }
      }
    });
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'employeeId',
      key: 'employeeId',
      width: 80,
    },
    {
      title: 'Họ tên',
      key: 'fullName',
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.fullName}</div>
          <div className="text-xs text-gray-500">@{record.username}</div>
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số điện thoại',
      key: 'phone',
      render: (_, record) => record.phone || 'N/A',
    },
    {
      title: 'Vị trí',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: 'Cơ sở',
      dataIndex: 'facilityName',
      key: 'facilityName',
      render: (name) => name || 'N/A',
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => {
        const isActive = record.status?.toLowerCase() === 'active';
        return (
          <span className={`px-2 py-1 rounded text-xs ${
            isActive
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-700'
          }`}>
            {isActive ? 'Hoạt động' : 'Không hoạt động'}
          </span>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleDeleteEmployee(record.employeeId)}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={18} className="text-red-600" />
          </button>
        </div>
      ),
    },
  ];

  const filteredEmployees = employees.filter(emp => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      emp.fullName?.toLowerCase().includes(searchLower) ||
      emp.username?.toLowerCase().includes(searchLower) ||
      emp.email?.toLowerCase().includes(searchLower) ||
      emp.position?.toLowerCase().includes(searchLower) ||
      emp.facilityName?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Users className="text-blue-600" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý Nhân viên</h1>
            <p className="text-gray-500">Quản lý tài khoản nhân viên trạm sạc</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus size={20} />
          <span>Tạo nhân viên mới</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AdminCard
          title="Tổng nhân viên"
          value={employees.length}
          icon={<Users className="text-blue-600" size={24} />}
          trend={{ value: 0, isPositive: true }}
        />
        <AdminCard
          title="Đang hoạt động"
          value={employees.filter(e => e.status?.toLowerCase() === 'active').length}
          icon={<Users className="text-green-600" size={24} />}
          trend={{ value: 0, isPositive: true }}
        />
        <AdminCard
          title="Không hoạt động"
          value={employees.filter(e => e.status?.toLowerCase() !== 'active').length}
          icon={<Users className="text-gray-600" size={24} />}
          trend={{ value: 0, isPositive: false }}
        />
      </div>

      {/* Search */}
      <AdminSearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Tìm theo tên, username, email, vị trí..."
      />

      {/* Table */}
      <AdminTable
        columns={columns}
        data={filteredEmployees}
        loading={loading}
        rowKey="employeeId"
      />

      {/* Create Modal */}
      <AdminModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          createForm.resetFields();
        }}
        title="Tạo nhân viên mới"
        size="md"
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateEmployee}
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập username' }]}
          >
            <Input placeholder="Nhập username" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: 'Vui lòng nhập password' },
              { min: 6, message: 'Password phải có ít nhất 6 ký tự' }
            ]}
          >
            <Input.Password placeholder="Nhập password" />
          </Form.Item>

          <Form.Item
            label="Họ tên"
            name="fullName"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input placeholder="Nhập họ tên" />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phone"
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            label="Vị trí"
            name="position"
            rules={[{ required: true, message: 'Vui lòng chọn vị trí' }]}
          >
            <Select placeholder="Chọn vị trí">
              <Option value="Charging Station Operator">Vận hành trạm sạc</Option>
              <Option value="Maintenance Technician">Kỹ thuật viên</Option>
              <Option value="Customer Service">Dịch vụ khách hàng</Option>
              <Option value="Supervisor">Giám sát viên</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Cơ sở"
            name="facilityId"
            rules={[{ required: true, message: 'Vui lòng chọn cơ sở' }]}
          >
            <Select 
              placeholder="Chọn cơ sở" 
              loading={facilities.length === 0}
              showSearch
              optionFilterProp="children"
            >
              {facilities.map(facility => (
                <Option key={facility.id} value={facility.id}>
                  {facility.name} - {facility.city}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                createForm.resetFields();
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Tạo nhân viên
            </button>
          </div>
        </Form>
      </AdminModal>
    </div>
  );
};

export default AdminEmployees;
