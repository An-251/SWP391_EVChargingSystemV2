import {
  Bell,
  WifiOff,
  CreditCard,
  Wrench,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

export default function NotificationsPanel() {
  const notifications = [
    {
      id: 1,
      title: "CP-05 Communication Error",
      message:
        "Charging point lost connection to network. Technician has been notified.",
      time: "10:25 AM",
      color: "border-red-500 bg-red-50",
      icon: <WifiOff className="text-red-500 w-4 h-4" />,
    },
    {
      id: 2,
      title: "Payment Terminal Issue",
      message:
        "Card reader at kiosk is not accepting payments. Please check connection.",
      time: "09:15 AM",
      color: "border-orange-400 bg-orange-50",
      icon: <CreditCard className="text-orange-500 w-4 h-4" />,
    },
    {
      id: 3,
      title: "Maintenance Scheduled",
      message:
        "Routine maintenance scheduled for tomorrow 2-4 AM. Some charging points offline.",
      time: "Yesterday, 5:30 PM",
      color: "border-blue-400 bg-blue-50",
      icon: <Wrench className="text-blue-500 w-4 h-4" />,
    },
    {
      id: 4,
      title: "CP-12 Back Online",
      message: "Charging point CP-12 is now back online and available for use.",
      time: "Yesterday, 3:45 PM",
      color: "border-green-500 bg-green-50",
      icon: <CheckCircle className="text-green-500 w-4 h-4" />,
    },
    {
      id: 5,
      title: "High Demand Period",
      message:
        "Station is experiencing high demand. 80% of charging points in use.",
      time: "Yesterday, 12:10 PM",
      color: "border-yellow-500 bg-yellow-50",
      icon: <AlertTriangle className="text-yellow-500 w-4 h-4" />,
    },
  ];

  return (
    <div className="w-96 bg-white rounded-xl shadow-md border border-gray-200 p-5 h-100vh mt-16 h-185">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Bell className="text-cyan-500 w-5 h-5" />
          <h2 className="text-xl font-semibold text-sky-700">Notifications</h2>
        </div>
        <span className="bg-cyan-500 text-white text-xs font-medium px-3 py-1 rounded-full">
          2 New
        </span>
      </div>

      {/* Notifications list */}
      <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1 h-[100vh]">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`border-l-4 ${n.color} rounded-lg p-4 flex gap-3 transition hover:shadow-sm bg-white`}
          >
            <div className="flex-shrink-0 mt-1">{n.icon}</div>
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold text-sky-800">{n.title}</h3>
              <p className="text-xs text-sky-600 leading-snug">{n.message}</p>
              <span className="text-xs text-gray-500 mt-1">{n.time}</span>
              <button className="text-xs text-cyan-600 font-medium mt-1 hover:underline">
                Mark as read
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 border-t border-gray-200 pt-3 text-center">
        <button className="text-cyan-600 text-sm font-medium hover:underline">
          View All Notifications
        </button>
      </div>
    </div>
  );
}
