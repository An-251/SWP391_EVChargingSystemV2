import React from 'react';
import { Card, Table, Tag, Button, Space } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';

const EmployeeList = () => {
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text) => (
        <Space>
          <UserOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text) => (
        <Space>
          <MailOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'Điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: (text) => (
        <Space>
          <PhoneOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'Facility',
      dataIndex: 'facility',
      key: 'facility',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small">Xem</Button>
          <Button type="link" size="small">Sửa</Button>
        </Space>
      ),
    },
  ];

  const data = [];

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title="Danh sách nhân viên"
        extra={<Button type="primary">Thêm nhân viên</Button>}
      >
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Tổng ${total} nhân viên`,
          }}
          locale={{
            emptyText: 'Chưa có dữ liệu nhân viên',
          }}
        />
      </Card>
    </div>
  );
};

export default EmployeeList;
