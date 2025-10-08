import { Card, Tabs, Button, Space, Typography, Row, Col } from "antd";
import {
  CarOutlined,
  ClockCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const reservations = [
  {
    id: 1,
    name: "Emma Thompson",
    vehicle: "Tesla Model Y",
    time: "11:30 AM - 12:30 PM",
    charger: "CP-03",
  },
  {
    id: 2,
    name: "Michael Chen",
    vehicle: "Hyundai Ioniq 5",
    time: "12:00 PM - 1:00 PM",
    charger: "CP-09",
  },
  {
    id: 3,
    name: "Sarah Johnson",
    vehicle: "BMW i4",
    time: "1:15 PM - 2:15 PM",
    charger: "CP-06",
  },
];

export default function UpcomingReservations() {
  return (
    <Card
      className="rounded-xl shadow-sm border border-gray-200"
      bodyStyle={{ padding: 20 }}
    >
      {/* Tabs Header */}
      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: "1",
            label: (
              <span className="text-cyan-600 font-medium">
                Upcoming Reservations
              </span>
            ),
            children: (
              <Space direction="vertical" size={16} className="w-full">
                {reservations.map((r) => (
                  <Card
                    key={r.id}
                    size="small"
                    className="rounded-lg border-gray-200 hover:shadow transition-all"
                    bodyStyle={{ padding: "12px 16px" }}
                  >
                    <Row justify="space-between" align="middle">
                      {/* Left Info */}
                      <Col>
                        <Space align="start" size={12}>
                          <div
                            className="p-2 rounded-lg flex items-center justify-center"
                            style={{ background: "#E0F7FA" }}
                          >
                            <CarOutlined
                              style={{ color: "#0097A7", fontSize: 16 }}
                            />
                          </div>
                          <Space direction="vertical" size={2}>
                            <Text strong style={{ color: "#0D47A1" }}>
                              {r.name}
                            </Text>
                            <Space size={6}>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {r.vehicle}
                              </Text>
                            </Space>
                            <Space size={6}>
                              <ClockCircleOutlined
                                style={{ color: "#9E9E9E", fontSize: 12 }}
                              />
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {r.time}
                              </Text>
                            </Space>
                          </Space>
                        </Space>
                      </Col>

                      {/* Right Actions */}
                      <Col className="text-right">
                        <Text
                          style={{
                            color: "#0D47A1",
                            fontSize: 12,
                            fontWeight: 500,
                          }}
                        >
                          {r.charger}
                        </Text>
                        <div className="flex justify-end gap-2 mt-2">
                          <Button
                            size="small"
                            type="text"
                            icon={<EditOutlined />}
                            style={{
                              background: "#E0F7FA",
                              color: "#0097A7",
                              borderRadius: 6,
                              fontSize: 12,
                              padding: "0 8px",
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            type="text"
                            style={{
                              background: "#F5F5F5",
                              color: "#607D8B",
                              borderRadius: 6,
                              fontSize: 12,
                              padding: "0 8px",
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </Space>
            ),
          },
          {
            key: "2",
            label: (
              <span className="text-gray-500 font-medium">Active Sessions</span>
            ),
            children: (
              <div className="text-gray-400 text-center p-4">
                No active sessions
              </div>
            ),
          },
        ]}
      />
    </Card>
  );
}
