"use client";

import { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Button,
  Input,
  Modal,
  Form,
  Select,
  DatePicker,
  Card,
  Row,
  Col,
  Statistic,
  Space,
  Divider,
  Badge,
  Typography,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

export default function StaffIncidentReportPage() {
  const [incidents, setIncidents] = useState([
    {
      id: "INC-001",
      staff: "Nguyễn Văn A",
      station: "Trạm Quận 1",
      type: "Lỗi sạc",
      severity: "High",
      time: "2025-01-08T10:30:00",
      status: "Đang xử lý",
      description: "Trạm sạc không hoạt động, cần kiểm tra ngay",
    },
    {
      id: "INC-002",
      staff: "Trần Thị B",
      station: "Trạm Quận 3",
      type: "Bảo trì",
      severity: "Medium",
      time: "2025-01-07T14:20:00",
      status: "Hoàn thành",
      description: "Bảo trì định kỳ đã hoàn tất",
    },
    {
      id: "INC-003",
      staff: "Lê Văn C",
      station: "Trạm Quận 7",
      type: "Khách hàng",
      severity: "Low",
      time: "2025-01-09T09:15:00",
      status: "Đang chờ",
      description: "Khách hàng phàn nàn về tốc độ sạc",
    },
  ]);
  const [filtered, setFiltered] = useState(incidents);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    setFiltered(incidents);
  }, [incidents]);

  const handleFilter = (values) => {
    const { status, severity, dateRange, search } = values;
    let data = [...incidents];
    if (status) data = data.filter((item) => item.status === status);
    if (severity) data = data.filter((item) => item.severity === severity);
    if (dateRange && dateRange.length === 2) {
      const [start, end] = dateRange;
      data = data.filter((item) =>
        dayjs(item.time).isBetween(start, end, "day", "[]")
      );
    }
    if (search)
      data = data.filter(
        (item) =>
          item.staff.toLowerCase().includes(search.toLowerCase()) ||
          item.station.toLowerCase().includes(search.toLowerCase()) ||
          item.id.toLowerCase().includes(search.toLowerCase())
      );
    setFiltered(data);
  };

  const handleViewDetail = (record) => {
    setSelectedIncident(record);
    setOpenModal(true);
  };

  const totalIncidents = incidents.length;
  const completedIncidents = incidents.filter(
    (i) => i.status === "Hoàn thành"
  ).length;
  const inProgressIncidents = incidents.filter(
    (i) => i.status === "Đang xử lý"
  ).length;
  const pendingIncidents = incidents.filter(
    (i) => i.status === "Đang chờ"
  ).length;
  const highSeverityIncidents = incidents.filter(
    (i) => i.severity === "High"
  ).length;

  const columns = [
    {
      title: "Mã sự cố",
      dataIndex: "id",
      key: "id",
      render: (text) => (
        <Text strong className="font-mono">
          {text}
        </Text>
      ),
    },
    {
      title: "Nhân viên",
      dataIndex: "staff",
      key: "staff",
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: "Trạm sạc",
      dataIndex: "station",
      key: "station",
      render: (text) => <Text className="text-muted-foreground">{text}</Text>,
    },
    {
      title: "Loại sự cố",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Mức độ",
      dataIndex: "severity",
      key: "severity",
      render: (sev) => {
        const config = {
          High: { color: "red", icon: <WarningOutlined /> },
          Medium: { color: "orange", icon: <AlertOutlined /> },
          Low: { color: "green", icon: <CheckCircleOutlined /> },
        };
        return (
          <Tag color={config[sev].color} icon={config[sev].icon}>
            {sev}
          </Tag>
        );
      },
    },
    {
      title: "Thời gian",
      dataIndex: "time",
      key: "time",
      render: (t) => (
        <Text className="text-muted-foreground">
          {dayjs(t).format("DD/MM/YYYY HH:mm")}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (s) => {
        const config = {
          "Hoàn thành": { color: "success", icon: <CheckCircleOutlined /> },
          "Đang xử lý": { color: "processing", icon: <ClockCircleOutlined /> },
          "Đang chờ": { color: "warning", icon: <ClockCircleOutlined /> },
        };
        return (
          <Badge
            status={config[s].color}
            text={
              <span className="ml-2">
                {config[s].icon} {s}
              </span>
            }
          />
        );
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          type="link"
          onClick={() => handleViewDetail(record)}
          className="text-primary"
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Title level={2} className="!mb-2 !text-foreground">
              Báo cáo sự cố nhân viên
            </Title>
            <Text className="text-muted-foreground">
              Quản lý và theo dõi các sự cố tại trạm sạc
            </Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            className="shadow-lg"
          >
            Tạo báo cáo mới
          </Button>
        </div>

        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="shadow-sm">
              <Statistic
                title="Tổng sự cố"
                value={totalIncidents}
                prefix={<AlertOutlined className="text-primary" />}
                valueStyle={{ color: "hsl(var(--color-foreground))" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="shadow-sm">
              <Statistic
                title="Đang xử lý"
                value={inProgressIncidents}
                prefix={<ClockCircleOutlined className="text-blue-500" />}
                valueStyle={{ color: "hsl(217 91% 60%)" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="shadow-sm">
              <Statistic
                title="Hoàn thành"
                value={completedIncidents}
                prefix={<CheckCircleOutlined className="text-green-500" />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="shadow-sm">
              <Statistic
                title="Mức độ cao"
                value={highSeverityIncidents}
                prefix={<WarningOutlined className="text-red-500" />}
                valueStyle={{ color: "#ff4d4f" }}
              />
            </Card>
          </Col>
        </Row>

        <Card bordered={false} className="shadow-lg">
          <div className="mb-6">
            <Text strong className="text-base mb-4 block">
              Bộ lọc
            </Text>
            <Form form={form} onFinish={handleFilter} layout="vertical">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                  <Form.Item name="search" className="!mb-0">
                    <Input
                      placeholder="Tìm kiếm ID, nhân viên, trạm..."
                      prefix={<SearchOutlined />}
                      size="large"
                      allowClear
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} lg={5}>
                  <Form.Item name="severity" className="!mb-0">
                    <Select
                      placeholder="Mức độ"
                      size="large"
                      allowClear
                      suffixIcon={<AlertOutlined />}
                    >
                      <Option value="Low">Low</Option>
                      <Option value="Medium">Medium</Option>
                      <Option value="High">High</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} lg={5}>
                  <Form.Item name="status" className="!mb-0">
                    <Select
                      placeholder="Trạng thái"
                      size="large"
                      allowClear
                      suffixIcon={<ClockCircleOutlined />}
                    >
                      <Option value="Đang chờ">Đang chờ</Option>
                      <Option value="Đang xử lý">Đang xử lý</Option>
                      <Option value="Hoàn thành">Hoàn thành</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Form.Item name="dateRange" className="!mb-0">
                    <RangePicker size="large" className="w-full" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} lg={2}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    block
                    icon={<SearchOutlined />}
                  >
                    Lọc
                  </Button>
                </Col>
              </Row>
            </Form>
          </div>

          <Divider className="!my-6" />

          <Table
            columns={columns}
            dataSource={filtered}
            loading={loading}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} sự cố`,
            }}
            className="modern-table"
          />
        </Card>

        <Modal
          open={openModal}
          onCancel={() => setOpenModal(false)}
          title={
            <Space>
              <AlertOutlined className="text-primary" />
              <span>Chi tiết sự cố {selectedIncident?.id || ""}</span>
            </Space>
          }
          footer={[
            <Button key="close" onClick={() => setOpenModal(false)}>
              Đóng
            </Button>,
            <Button key="edit" type="primary">
              Chỉnh sửa
            </Button>,
          ]}
          width={600}
        >
          {selectedIncident && (
            <div className="space-y-4 pt-4">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div>
                    <Text className="text-muted-foreground text-sm">
                      Nhân viên
                    </Text>
                    <div className="mt-1">
                      <Text strong className="text-base">
                        {selectedIncident.staff}
                      </Text>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <Text className="text-muted-foreground text-sm">
                      Trạm sạc
                    </Text>
                    <div className="mt-1">
                      <Text strong className="text-base">
                        {selectedIncident.station}
                      </Text>
                    </div>
                  </div>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div>
                    <Text className="text-muted-foreground text-sm">
                      Loại sự cố
                    </Text>
                    <div className="mt-1">
                      <Text strong className="text-base">
                        {selectedIncident.type}
                      </Text>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <Text className="text-muted-foreground text-sm">
                      Mức độ
                    </Text>
                    <div className="mt-1">
                      <Tag
                        color={
                          selectedIncident.severity === "High"
                            ? "red"
                            : selectedIncident.severity === "Medium"
                            ? "orange"
                            : "green"
                        }
                      >
                        {selectedIncident.severity}
                      </Tag>
                    </div>
                  </div>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div>
                    <Text className="text-muted-foreground text-sm">
                      Thời gian
                    </Text>
                    <div className="mt-1">
                      <Text strong className="text-base">
                        {dayjs(selectedIncident.time).format(
                          "DD/MM/YYYY HH:mm"
                        )}
                      </Text>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <Text className="text-muted-foreground text-sm">
                      Trạng thái
                    </Text>
                    <div className="mt-1">
                      <Badge
                        status={
                          selectedIncident.status === "Hoàn thành"
                            ? "success"
                            : selectedIncident.status === "Đang xử lý"
                            ? "processing"
                            : "warning"
                        }
                        text={selectedIncident.status}
                      />
                    </div>
                  </div>
                </Col>
              </Row>

              <Divider className="!my-4" />

              <div>
                <Text className="text-muted-foreground text-sm">Mô tả</Text>
                <div className="mt-2 p-4 bg-secondary rounded-lg">
                  <Text>
                    {selectedIncident.description || "Không có mô tả"}
                  </Text>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
