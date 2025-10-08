import { Row, Col, Card, Typography, Tag, Button } from "antd";
import { CrownIcon } from "lucide-react";

const { Title, Paragraph, Text } = Typography;

export default function PricingPlans() {
  const plans = [
    {
      title: "Basic",
      price: "$9",
      description: "Ideal for individual EV drivers with essential features.",
      features: ["✔ 24/7 Station Access", "✔ Mobile App", "✔ Basic Support"],
      cta: "Get Started",
    },
    {
      title: "Pro",
      price: "$29",
      description: "Perfect for small fleets that need analytics and insights.",
      features: [
        "✔ Smart Scheduling",
        "✔ Usage Analytics",
        "✔ Priority Support",
      ],
      cta: "Upgrade",
    },
    {
      title: "Enterprise",
      price: "$99",
      description:
        "Advanced tools and custom integrations for large organizations.",
      features: [
        "✔ Dedicated Account Manager",
        "✔ API Access",
        "✔ Custom Integrations",
      ],
      cta: "Contact Sales",
    },
  ];

  const features = [
    "Mobile & Web Access",
    "Secure Payments",
    "Real-time Updates",
    "Data Security",
  ];

  return (
    <section style={{ padding: "80px 192px", background: "#fff" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 64 }}>
        <Tag className="custom-tag">
          <CrownIcon></CrownIcon>Pricing Plans
        </Tag>

        <Title level={1} style={{ marginTop: 16 }}>
          Choose Your Perfect Plan
        </Title>

        <Paragraph
          style={{
            fontSize: 18,
            color: "#4B5563",
            maxWidth: 640,
            margin: "16px auto 0",
            marginBottom: 0,
          }}
        >
          Flexible pricing options to fit every need, from individual drivers to
          large fleet operations.
        </Paragraph>
      </div>

      {/* Pricing Cards */}
      <Row gutter={[32, 32]} justify="center">
        {plans.map((plan, idx) => (
          <Col xs={24} md={8} key={idx}>
            <Card className="custom-card">
              <Title level={3} className="text-center">
                {plan.title}
              </Title>
              <Title
                level={2}
                style={{
                  color: "#10B981",
                  margin: "8px 0",
                  textAlign: "center",
                }}
              >
                {plan.price}
                <Text style={{ fontSize: 16, color: "#6B7280" }}>/month</Text>
              </Title>
              <Paragraph style={{ color: "#4B5563" }}>
                {plan.description}
              </Paragraph>
              <ul style={{ margin: "16px 0", paddingLeft: 20 }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{ marginBottom: 8 }}>
                    {f}
                  </li>
                ))}
              </ul>
              <Button type="primary" block className="custom-btn">
                {plan.cta}
              </Button>
            </Card>
          </Col>
        ))}
      </Row>
      <Card className="custom-card">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-2">
            <CrownIcon style={{ fontSize: 24, color: "#059669" }} />
            <span className="text-gray-900 font-semibold text-base">
              All Plans Include
            </span>
          </div>
          <Paragraph className="custom-paragraph">
            Core features available across all subscription tiers
          </Paragraph>
        </div>
        <div className="flex flex-wrap justify-center gap-8 mt-6">
          {features.map((feature, i) => (
            <div key={i} className="flex items-center gap-2 text-gray-700">
              <span style={{ color: "#10B981" }}>✔</span>
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
