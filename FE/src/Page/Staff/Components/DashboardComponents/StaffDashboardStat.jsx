import { Card, Row, Col } from "antd";
import {
  ThunderboltOutlined,
  CheckCircleOutlined,
  PauseCircleOutlined,
  PoweroffOutlined,
  WarningOutlined,
} from "@ant-design/icons";

// 🎨 Style cho icon
const iconStyles = {
  thunder: { color: "#0D47A1", fontSize: 22 },
  available: { color: "#2E7D32", fontSize: 22 },
  inUse: { color: "#F57C00", fontSize: 22 },
  offline: { color: "#C62828", fontSize: 22 },
  session: { color: "#0288D1", fontSize: 22 },
  warning: { color: "#EF6C00", fontSize: 22 },
};

// 🌈 Màu nền cho từng card
const cardColors = {
  thunder: "#ffff",
  available: "#ffff",
  inUse: "#ffff",
  offline: "#ffff",
  session: "#ffff",
  warning: "#ffff",
};

export default function StationDashboardStats() {
  const stats = [
    {
      title: "Total Charging Points",
      value: 24,
      icon: <ThunderboltOutlined style={iconStyles.thunder} />,
      color: cardColors.thunder,
    },
    {
      title: "Available",
      value: 14,
      percent: 58,
      icon: <CheckCircleOutlined style={iconStyles.available} />,
      color: cardColors.available,
    },
    {
      title: "In-Use",
      value: 8,
      percent: 33,
      icon: <PauseCircleOutlined style={iconStyles.inUse} />,
      color: cardColors.inUse,
    },
    {
      title: "Offline",
      value: 2,
      percent: 8,
      icon: <PoweroffOutlined style={iconStyles.offline} />,
      color: cardColors.offline,
    },
    {
      title: "Today's Sessions",
      value: 42,
      icon: <ThunderboltOutlined style={iconStyles.session} />,
      color: cardColors.session,
    },

    {
      title: "Incident Reports",
      value: 3,
      icon: <WarningOutlined style={iconStyles.warning} />,
      color: cardColors.warning,
    },
  ];

  return (
    <>
      <div className="flex justify-between items-center w-full px-6 py-3">
        {/* Left section - title */}
      </div>{" "}
      <Row gutter={[16, 16]} className="p-4">
        {stats.map((item, index) => (
          <Col key={index} xs={28} sm={12} md={8} lg={4} xl={4}>
            <Card
              hoverable
              className="rounded-xl shadow-sm transition-transform duration-200 hover:scale-105"
              style={{
                background: item.color,
                border: "1px solid #f0f0f0",
                height: 150,
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm mb-1 font-medium">
                    {item.title}
                  </p>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {item.value}
                  </h2>
                  {item.percent && (
                    <p className="text-gray-600 text-sm">{item.percent}%</p>
                  )}
                </div>
                <div className="p-2 bg-white rounded-lg shadow-sm flex items-center justify-center">
                  {item.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
}
