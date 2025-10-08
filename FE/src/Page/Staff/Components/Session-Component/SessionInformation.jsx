import { Card, Descriptions, Tag, Divider } from "antd";
import {
  ThunderboltOutlined,
  DollarOutlined,
  CarOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

export default function SessionInformation() {
  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <EnvironmentOutlined className="text-blue-500" />
          <span>Session Information</span>
        </div>
      }
      className="shadow-md rounded-xl"
    >
      <Descriptions column={2} bordered={false}>
        <Descriptions.Item label="Station Name">
          Downtown Charging Hub
        </Descriptions.Item>
        <Descriptions.Item label="Session ID">SES-2023-05789</Descriptions.Item>
        <Descriptions.Item label="Charging Point">CP-01</Descriptions.Item>
        <Descriptions.Item label="Connector Type">CCS</Descriptions.Item>
        <Descriptions.Item label="Vehicle">
          <CarOutlined className="text-blue-500 mr-1" />
          Tesla Model 3 (ABC-1234)
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color="green">Completed</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Start Time">
          <CalendarOutlined className="text-gray-500 mr-1" />
          May 15, 2023 - 09:45 AM
        </Descriptions.Item>
        <Descriptions.Item label="End Time">
          <CalendarOutlined className="text-gray-500 mr-1" />
          May 15, 2023 - 11:15 AM
        </Descriptions.Item>
        <Descriptions.Item label="Duration" span={2}>
          1 hour 30 minutes
        </Descriptions.Item>
      </Descriptions>

      <Divider />

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <Card className="bg-green-50 border-none">
          <p className="text-gray-500 text-sm flex justify-center items-center gap-1">
            <ThunderboltOutlined /> Energy
          </p>
          <p className="font-semibold text-lg">35.7 kWh</p>
        </Card>
        <Card className="bg-blue-50 border-none">
          <p className="text-gray-500 text-sm flex justify-center items-center gap-1">
            <DollarOutlined /> Energy Fee
          </p>
          <p className="font-semibold text-lg">$42.84</p>
        </Card>
        <Card className="bg-blue-50 border-none">
          <p className="text-gray-500 text-sm flex justify-center items-center gap-1">
            <DollarOutlined /> Service Fee
          </p>
          <p className="font-semibold text-lg">$2.50</p>
        </Card>
        <Card className="bg-green-50 border-none">
          <p className="text-gray-500 text-sm flex justify-center items-center gap-1">
            <DollarOutlined /> Total
          </p>
          <p className="font-semibold text-lg">$49.87</p>
        </Card>
      </div>
    </Card>
  );
}
