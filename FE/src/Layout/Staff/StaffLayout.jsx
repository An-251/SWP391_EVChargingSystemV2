import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "antd";
import StaffSidebar from "./Sidebar";

const { Content } = Layout;

export default function StaffLayout() {
  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar (fixed) */}
      <StaffSidebar />

      {/* Main layout dịch sang phải bằng chiều rộng Sidebar */}
      <Layout
        style={{
          marginLeft: 125, // 👈 tránh layout đè lên Sidebar
          minHeight: "100vh",
          background: "#fff",
          width: "100%",
        }}
      >
        {/* <Header
          style={{
            background: "#fff",
            padding: "0 16px",
            height: 64,
            lineHeight: "64px",
            borderBottom: "1px solid #f0f0f0",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <StationDashboardHeader />
        </Header> */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          style={{ minHeight: "100vh" }}
        >
          <Content
            style={{
              margin: 0,
              padding: "16px",
              background: "linear-gradient(90deg, #e3f2fd 0%, #e0f7fa 100%)",
              boxShadow: "inset 0 0 10px rgba(0,0,0,0.05)",
              minHeight: "calc(100vh - 64px)",
              borderRadius: "8px 0 0 0",
            }}
          >
            <Outlet />
          </Content>
        </motion.div>
      </Layout>

      {/* Override CSS Ant Design */}
      <style>
        {`
          .ant-layout-header {
            padding: 0 !important;
          }
        `}
      </style>
    </div>
  );
}
