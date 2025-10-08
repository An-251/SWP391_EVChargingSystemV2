import { Layout, Menu } from "antd";
import {
  HomeOutlined,
  UserOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";

const iconStyle = { fontSize: 25, marginTop: 20 };

export default function StaffSidebar() {
  const { Sider } = Layout;
  const location = useLocation();

  // ✅ Tự động xác định key đang active từ URL
  const currentPath = location.pathname.replace("/staff", "");
  const selectedKey = currentPath.split("/")[1] || "dashboard"; // ví dụ: /staff/sessions → sessions

  const menuItems = [
    {
      key: "dashboard",
      label: "Home",
      icon: <HomeOutlined style={iconStyle} />,
      path: "/dashboard",
    },
    {
      key: "sessions",
      label: "Sessions",
      icon: <ClockCircleOutlined style={iconStyle} />,
      path: "/sessions",
    },
    {
      key: "reports",
      label: "Reports",
      icon: <BarChartOutlined style={iconStyle} />,
      path: "/reports",
    },
    {
      key: "stations",
      label: "Stations",
      icon: <ThunderboltOutlined style={iconStyle} />,
      path: "/stations",
    },
    {
      key: "users",
      label: "Users",
      icon: <UserOutlined style={iconStyle} />,
      path: "/users",
    },
    {
      key: "payments",
      label: "Payments",
      icon: <CreditCardOutlined style={iconStyle} />,
      path: "/payments",
    },
    {
      key: "settings",
      label: "Settings",
      icon: <SettingOutlined style={iconStyle} />,
      path: "/settings",
    },
  ];

  return (
    <>
      <Sider
        width={125}
        style={{
          background: "#fff",
          borderRight: "1px solid #f0f0f0",
          boxShadow: "1px 0 2px rgba(0,0,0,0.05)",
          position: "fixed",
          height: "100vh",
          left: 0,
          top: 0,
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid #f0f0f0",
            fontWeight: 600,
            fontSize: 18,
            textAlign: "center",
          }}
        >
          ⚡ EV Staff
        </div>

        {/* Menu Sidebar */}
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]} // ✅ tự động active đúng route
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderRight: "none",
          }}
        >
          {menuItems.map((item) => (
            <Menu.Item
              key={item.key}
              icon={item.icon}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: 80,
                padding: 0,
                margin: "4px 8px",
                borderRadius: 8,
              }}
            >
              <Link
                to={`/staff${item.path}`}
                style={{ color: "inherit", textAlign: "center" }}
              >
                {item.label}
              </Link>
            </Menu.Item>
          ))}
        </Menu>
      </Sider>

      {/* Custom Style */}
      <style>
        {`
          .ant-menu {
            display: flex;
            flex-direction: column;
            align-items: center;
            border-right: none;
          }

          .ant-menu-item:hover {
            background: #f0f5ff !important;
          }

          .ant-menu-item-selected {
            background: #20B2AA !important;
            box-shadow: inset 0 0 0 2px #1677ff !important;
            border-radius: 8px !important;
            color: #fff !important;
          }

          .ant-menu-title-content {
            font-size: 12px;
            margin-right: 10px;
          }
        `}
      </style>
    </>
  );
}
