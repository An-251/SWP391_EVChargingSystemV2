import { Button, Card, Select, Tag, Progress } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

const chargingPoints = [
  {
    id: "CP-01",
    type: "CCS",
    power: "150 kW",
    status: "Available",
    color: "green",
  },
  {
    id: "CP-02",
    type: "CHAdeMO",
    power: "50 kW",
    status: "Charging",
    vehicle: "Tesla Model 3",
    progress: 65,
    start: "10:15 AM",
    end: "11:30 AM",
    color: "blue",
  },
  {
    id: "CP-03",
    type: "Type 2",
    power: "22 kW",
    status: "Available",
    color: "green",
  },
  {
    id: "CP-04",
    type: "CCS",
    power: "150 kW",
    status: "Charging",
    vehicle: "Audi e-tron",
    progress: 65,
    start: "09:45 AM",
    end: "10:45 AM",
    color: "blue",
  },
  {
    id: "CP-05",
    type: "Type 2",
    power: "22 kW",
    status: "Error",
    error: "Communication failure",
    color: "red",
  },
  {
    id: "CP-06",
    type: "CCS",
    power: "150 kW",
    status: "Available",
    color: "green",
  },
];

export default function LiveMonitoring() {
  return (
    <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-sky-700">Live Monitoring</h2>
          <p className="text-gray-500 text-sm">
            Real-time status of all charging points
          </p>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-medium">Station</span>
          <Select
            placeholder="Select station"
            style={{ width: 200 }}
            options={[
              { label: "Station A", value: "A" },
              { label: "Station B", value: "B" },
            ]}
          />
          <Button icon={<ReloadOutlined />} type="text">
            Refresh
          </Button>
        </div>
      </div>

      {/* Grid hiển thị các cổng sạc */}
      <div className="grid grid-cols-3 gap-4">
        {chargingPoints.map((cp) => (
          <Card
            key={cp.id}
            title={cp.id}
            bordered
            className="rounded-xl border-gray-200"
            headStyle={{ borderBottom: "none" }}
            extra={<Tag color={cp.color}>{cp.status}</Tag>}
          >
            <p className="text-gray-600 text-sm">
              {cp.type} • {cp.power}
            </p>

            {cp.status === "Charging" && (
              <div className="mt-3 space-y-2">
                <p className="text-sm text-gray-600">
                  Vehicle: <strong>{cp.vehicle}</strong>
                </p>
                <Progress
                  percent={cp.progress}
                  showInfo={false}
                  strokeColor={cp.color}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Started: {cp.start}</span>
                  <span>Est. End: {cp.end}</span>
                </div>
              </div>
            )}

            {cp.status === "Error" && (
              <p className="mt-3 text-red-600 text-sm">{cp.error}</p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
