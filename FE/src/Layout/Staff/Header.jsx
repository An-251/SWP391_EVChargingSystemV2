export default function StationDashboardHeader() {
  return (
    <div className="w-full px-6 flex justify-between items-center">
      <div className="mx-4">
        <h1 className="text-2xl font-bold text-sky-600">Station Dashboard</h1>
        <p className="text-gray-500 text-sm">Main Street Charging Hub</p>
      </div>

      {/* Right section - notification + user info */}
      <div className="flex items-center gap-4">
        {/* Notification icon */}
        <div className="relative p-2 bg-white rounded-full shadow hover:bg-gray-50 cursor-pointer transition">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>

          {/* Notification badge */}
          <div className="absolute top-1 right-1 bg-red-500 text-white text-xs font-semibold w-4 h-4 rounded-full flex justify-center items-center">
            3
          </div>
        </div>

        {/* User info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-100 rounded-full flex justify-center items-center">
            <span className="text-cyan-600 font-medium">JS</span>
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-gray-800">John Smith</p>
            <p className="text-xs text-gray-500">Station Manager</p>
          </div>
        </div>
      </div>
    </div>
  );
}
