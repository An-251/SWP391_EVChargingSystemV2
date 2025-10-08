import { Layout, Row, Col, Typography, Space } from "antd";
import {
  FacebookOutlined,
  TwitterOutlined,
  LinkedinOutlined,
} from "@ant-design/icons";

const { Footer } = Layout;
const { Text, Title } = Typography;

export default function AppFooter() {
  return (
    <Footer
      style={{
        backgroundColor: "#001529",
        padding: "40px 80px",
        color: "white",
      }}
    >
      <Row gutter={[32, 32]}>
        {/* Logo + Description */}
        <Col xs={24} sm={12} md={8}>
          <Title
            level={4}
            style={{ color: "white", marginBottom: 12, fontWeight: "bold" }}
          >
            ChargePro
          </Title>
          <Text style={{ color: "rgba(255,255,255,0.65)" }}>
            Revolutionizing EV charging with smart technology, real-time data,
            and seamless user experiences for a sustainable future.
          </Text>
        </Col>

        {/* Links */}
        <Col xs={24} sm={12} md={8}>
          <Title level={5} style={{ color: "white" }}>
            Quick Links
          </Title>
          <Space direction="vertical">
            <a href="/" style={{ color: "rgba(255,255,255,0.65)" }}>
              Home
            </a>
            <a href="/about" style={{ color: "rgba(255,255,255,0.65)" }}>
              About
            </a>
            <a href="/services" style={{ color: "rgba(255,255,255,0.65)" }}>
              Services
            </a>
          </Space>
        </Col>

        {/* Social Media */}
        <Col xs={24} sm={24} md={8}>
          <Title level={5} style={{ color: "white" }}>
            Follow Us
          </Title>
          <Space size="large">
            <FacebookOutlined style={{ fontSize: 20, color: "white" }} />
            <TwitterOutlined style={{ fontSize: 20, color: "white" }} />
            <LinkedinOutlined style={{ fontSize: 20, color: "white" }} />
          </Space>
        </Col>
      </Row>

      <div
        style={{
          textAlign: "center",
          marginTop: 32,
          borderTop: "1px solid rgba(255,255,255,0.2)",
          paddingTop: 16,
        }}
      >
        <Text style={{ color: "rgba(255,255,255,0.65)" }}>
          © {new Date().getFullYear()} ChargePro. All rights reserved.
        </Text>
      </div>
    </Footer>
  );
}
