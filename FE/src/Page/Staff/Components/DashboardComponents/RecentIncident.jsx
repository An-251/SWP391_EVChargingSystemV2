import { Card, Tag, Button, Space, Typography } from "antd";
import {
  WarningOutlined,
  CreditCardOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

const incidents = [
  {
    id: 1,
    title: "CP-05 Communication Error",
    description: "Charging point lost connection to network",
    time: "10:25 AM",
    priority: "High",
    priorityColor: "red",
    icon: <WarningOutlined style={{ color: "#EF6C00", fontSize: 18 }} />,
  },
  {
    id: 2,
    title: "Payment Terminal Malfunction",
    description: "Card reader not accepting payments at kiosk",
    time: "09:15 AM",
    priority: "Medium",
    priorityColor: "orange",
    icon: <CreditCardOutlined style={{ color: "#FB8C00", fontSize: 18 }} />,
  },
  {
    id: 3,
    title: "CP-08 Power Fluctuation",
    description: "Charging point reporting unstable power delivery",
    resolved: true,
    icon: <ThunderboltOutlined style={{ color: "#43A047", fontSize: 18 }} />,
  },
];

export default function IncidentReports() {
  return (
    <Card
      title={
        <div className="flex justify-between items-center">
          <div>
            <Title level={5} style={{ margin: 0, color: "#0D47A1" }}>
              Incident Reports
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Recent issues requiring attention
            </Text>
          </div>
          <Tag
            color="orange"
            style={{ borderRadius: "9999px", padding: "2px 10px" }}
          >
            2 Pending
          </Tag>
        </div>
      }
      className="rounded-xl shadow-sm border border-gray-200"
      bodyStyle={{ padding: 16 }}
    >
      <Space direction="vertical" size={16} className="w-full">
        {incidents.map((item) => (
          <Card
            key={item.id}
            size="small"
            className="border-gray-200 rounded-lg"
            style={{
              background: item.resolved ? "#F9FAFB" : "#fff",
              border:
                item.priority === "High"
                  ? "1px solid #FFCDD2"
                  : item.priority === "Medium"
                  ? "1px solid #FFE0B2"
                  : "1px solid #E0E0E0",
            }}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-3">
                <div
                  className="p-2 rounded-lg flex items-center justify-center"
                  style={{
                    background: item.resolved
                      ? "#E8F5E9"
                      : item.priority === "High"
                      ? "#FFEBEE"
                      : item.priority === "Medium"
                      ? "#FFF3E0"
                      : "#E3F2FD",
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <Text strong style={{ color: "#0D47A1" }}>
                    {item.title}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    {item.description}
                  </Text>
                  {!item.resolved && (
                    <div className="flex items-center gap-2 mt-2">
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {item.time}
                      </Text>
                      <Tag
                        color={
                          item.priority === "High"
                            ? "red"
                            : item.priority === "Medium"
                            ? "orange"
                            : "green"
                        }
                        style={{
                          borderRadius: "9999px",
                          fontSize: 12,
                          padding: "0 8px",
                        }}
                      >
                        {item.priority} Priority
                      </Tag>
                    </div>
                  )}
                </div>
              </div>
              {!item.resolved && (
                <Button
                  type="primary"
                  size="small"
                  style={{
                    background: "#00ACC1",
                    borderRadius: 8,
                  }}
                >
                  Mark Resolved
                </Button>
              )}
              {item.resolved && (
                <Tag
                  icon={<CheckCircleOutlined />}
                  color="green"
                  style={{ borderRadius: 8 }}
                >
                  Resolved
                </Tag>
              )}
            </div>
          </Card>
        ))}
      </Space>
    </Card>
  );
}
