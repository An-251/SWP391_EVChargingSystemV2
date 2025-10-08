import { Card, Row, Col, Typography, Tag, Avatar, Rate, Badge } from "antd";
import { Star, StarIcon } from "lucide-react";

const { Title, Paragraph, Text } = Typography;

export default function CustomerStories() {
  const stories = [
    {
      name: "Alice Johnson",
      img: "https://i.pinimg.com/736x/96/53/f7/9653f749c03eb888c0dde626b925437b.jpg",
      role: "EV Driver - California",
      text: " ChargePro has completely changed how I charge my EV. It’s fast, reliable, and the mobile app makes everything so simple.",
      badge: <StarIcon />,
    },
    {
      name: "Mark Stevens",
      img: "https://i.pinimg.com/736x/96/53/f7/9653f749c03eb888c0dde626b925437b.jpg",
      role: "Fleet Manager - New York",
      text: " Managing multiple EVs used to be a headache. Now with ChargePro’s analytics and smart scheduling, it’s effortless.",
      badge: <StarIcon className="font-size-12px" />,
    },
    {
      name: "Sophia Nguyen",
      img: "https://i.pinimg.com/1200x/21/8c/8e/218c8e96f37146c2811850430d504cf4.jpg",
      role: "EV Enthusiast - Texas",
      text: " I love how easy it is to find and reserve stations. It saves me so much time and gives me peace of mind.",
      badge: <StarIcon />,
    },
  ];

  return (
    <section style={{ padding: "80px 192px", background: "#fff" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 64 }}>
        <Tag className="custom-tag">
          <Star /> Customer Stories
        </Tag>

        <Title level={2} style={{ marginTop: 16, fontFamily: "Poppins" }}>
          Loved by EV Drivers Everywhere
        </Title>

        <Paragraph
          style={{
            fontSize: 18,
            color: "#4B5563",
            maxWidth: 640,
            margin: "16px auto 0",
            fontFamily: "Poppins",
          }}
        >
          See how ChargePro is making EV charging simpler and more reliable for
          drivers and fleet managers worldwide.
        </Paragraph>
      </div>

      {/* Cards */}
      <Row gutter={[32, 32]} justify="center">
        {stories.map((story, index) => (
          <Col xs={24} md={8} key={index}>
            <Card
              bordered
              hoverable
              style={{
                borderRadius: 16,
                minHeight: 260,
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                fontFamily: "Poppins",
                position: "relative",
              }}
              bodyStyle={{ padding: 24 }}
            >
              {/* Quote text */}
              <Paragraph
                style={{
                  fontSize: 16,
                  color: "#374151",
                  lineHeight: "1.7",
                  fontFamily: "Poppins",
                  fontStyle: "italic", // chữ nghiêng như mẫu
                  marginTop: 30,
                }}
              >
                “{story.text}”
              </Paragraph>

              {/* Avatar + Name + Role */}
              <div
                style={{
                  marginTop: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <Avatar src={story.img} size={60} />
                <div>
                  <Text strong style={{ fontSize: 16, color: "#111827" }}>
                    {story.name}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    {story.role}
                  </Text>
                </div>
              </div>

              {/* Rating stars */}
              <div
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                }}
              >
                <Rate disabled defaultValue={5} />
              </div>

              <Badge
                count={<StarIcon size={14} color="white" />}
                style={{
                  backgroundColor: "#10B981",
                  borderRadius: "50%", // tròn hẳn
                  minWidth: "28px",
                  height: "28px",
                  lineHeight: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "8px",
                }}
                offset={[30, -30]} // dịch sang trái và xuống dưới
              ></Badge>
            </Card>
          </Col>
        ))}
      </Row>
    </section>
  );
}
