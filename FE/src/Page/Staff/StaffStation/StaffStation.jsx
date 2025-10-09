import React, { useEffect, useState } from "react";
import {
  Card,
  Tag,
  Descriptions,
  Row,
  Col,
  Table,
  Space,
  Button,
  Progress,
  message,
} from "antd";
import {
  EnvironmentOutlined,
  ThunderboltOutlined,
  WifiOutlined,
  ToolOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

// ✅ Dữ liệu mẫu (mock)
const mockStationData = {
  id: 1,
  name: "Trạm Sạc EV Quy Nhơn",
  station_code: "ST-001",
  address: "Số 12 Nguyễn Huệ, TP Quy Nhơn, Bình Định",
  is_online: true,
  start_date: "2023-05-15",
  overall_status: 92,
  chargers: [
    {
      charger_id: "C-101",
      type: "CCS2",
      power: 150,
      status: "Sẵn sàng",
      current_user: null,
      updated_at: "2025-10-09T09:20:00",
    },
    {
      charger_id: "C-102",
      type: "Type 2",
      power: 50,
      status: "Đang sạc",
      current_user: "Nguyễn Văn A",
      updated_at: "2025-10-09T09:35:00",
    },
    {
      charger_id: "C-103",
      type: "CHAdeMO",
      power: 100,
      status: "Bảo trì",
      current_user: null,
      updated_at: "2025-10-08T17:00:00",
    },
    {
      charger_id: "C-104",
      type: "CCS1",
      power: 120,
      status: "Lỗi",
      current_user: null,
      updated_at: "2025-10-08T14:40:00",
    },
  ],
};

export default function StationDetailPage() {
  const [station, setStation] = useState(null);
  const [chargers, setChargers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    // 🔹 Giả lập fetch dữ liệu
    setTimeout(() => {
      setStation(mockStationData);
      setChargers(mockStationData.chargers);
      setLoading(false);
    }, 1000);
  }, []);

  const chargerColumns = [
    {
      title: "Mã cổng sạc",
      dataIndex: "charger_id",
      key: "charger_id",
    },
    {
      title: "Loại đầu sạc",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Công suất",
      dataIndex: "power",
      key: "power",
      render: (val) => `${val} kW`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color =
          status === "Sẵn sàng"
            ? "green"
            : status === "Đang sạc"
            ? "blue"
            : status === "Bảo trì"
            ? "orange"
            : "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Người dùng hiện tại",
      dataIndex: "current_user",
      key: "current_user",
      render: (u) => (u ? u : <i>Không có</i>),
    },
    {
      title: "Thời gian cập nhật",
      dataIndex: "updated_at",
      key: "updated_at",
      render: (t) => dayjs(t).format("DD/MM/YYYY HH:mm"),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[16, 16]}>
        {/* Thông tin trạm */}
        <Col xs={24} md={14}>
          <Card
            title={
              <Space>
                <ThunderboltOutlined style={{ color: "#1890ff" }} />
                Thông tin trạm sạc
              </Space>
            }
            loading={loading}
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              width: "1350px",
            }}
          >
            {station && (
              <Descriptions column={1} bordered size="middle">
                <Descriptions.Item label="Tên trạm">
                  {station.name}
                </Descriptions.Item>
                <Descriptions.Item label="Mã trạm">
                  {station.station_code}
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ">
                  <EnvironmentOutlined /> {station.address}
                </Descriptions.Item>
                <Descriptions.Item label="Kết nối mạng">
                  {station.is_online ? (
                    <Tag color="green">
                      <WifiOutlined /> Online
                    </Tag>
                  ) : (
                    <Tag color="red">
                      <WifiOutlined /> Offline
                    </Tag>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Số cổng sạc">
                  <Tag color="blue">{chargers.length}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày hoạt động">
                  {dayjs(station.start_date).format("DD/MM/YYYY")}
                </Descriptions.Item>
                <Descriptions.Item label="Tình trạng tổng thể">
                  <Progress
                    percent={station.overall_status}
                    status={
                      station.overall_status > 80 ? "success" : "exception"
                    }
                    strokeColor={
                      station.overall_status > 80 ? "#52c41a" : "#ff4d4f"
                    }
                  />
                </Descriptions.Item>
              </Descriptions>
            )}
          </Card>
        </Col>

        {/* Danh sách cổng sạc */}
        <Col span={24}>
          <Card
            title={
              <Space>
                <ToolOutlined /> Danh sách cổng sạc
              </Space>
            }
            extra={
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  message.success("Đã tải lại danh sách!");
                  setChargers([...mockStationData.chargers]);
                }}
              >
                Làm mới
              </Button>
            }
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <Table
              columns={chargerColumns}
              dataSource={chargers}
              loading={loading}
              rowKey="charger_id"
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
