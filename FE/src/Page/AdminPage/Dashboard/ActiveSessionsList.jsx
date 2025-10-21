/**
 * Active Sessions List Component
 * Hiển thị danh sách các phiên sạc đang hoạt động
 */

import React from 'react';

export default function ActiveSessionsList() {
  // Mock data - Sẽ thay bằng real data từ Redux khi có API
  const mockSessions = [
    {
      id: 1,
      user: 'Nguyễn Văn A',
      station: 'Trạm Vincom Đồng Khởi',
      chargingPoint: 'CP-001',
      startTime: '14:30',
      duration: '25 phút',
      energy: '15.2 kWh',
      status: 'charging',
    },
    {
      id: 2,
      user: 'Trần Thị B',
      station: 'Trạm Landmark 81',
      chargingPoint: 'CP-015',
      startTime: '14:45',
      duration: '10 phút',
      energy: '8.5 kWh',
      status: 'charging',
    },
    {
      id: 3,
      user: 'Lê Văn C',
      station: 'Trạm Aeon Mall',
      chargingPoint: 'CP-023',
      startTime: '15:00',
      duration: '5 phút',
      energy: '3.1 kWh',
      status: 'charging',
    },
  ];

  if (mockSessions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-5xl mb-3">🔋</div>
        <p className="text-gray-500">Không có phiên sạc nào đang hoạt động</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {mockSessions.map((session) => (
        <div
          key={session.id}
          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            {/* Session Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="font-semibold text-gray-900">{session.user}</h4>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Đang sạc
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-600">
                  <span className="font-medium">Trạm:</span> {session.station}
                </div>
                <div className="text-gray-600">
                  <span className="font-medium">Điểm sạc:</span> {session.chargingPoint}
                </div>
                <div className="text-gray-600">
                  <span className="font-medium">Bắt đầu:</span> {session.startTime}
                </div>
                <div className="text-gray-600">
                  <span className="font-medium">Thời gian:</span> {session.duration}
                </div>
              </div>
            </div>

            {/* Energy Display */}
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{session.energy}</div>
              <div className="text-xs text-gray-500">Năng lượng</div>
            </div>
          </div>
        </div>
      ))}

      {/* View All Button */}
      <div className="pt-2">
        <button className="w-full py-2 text-blue-600 hover:text-blue-700 font-medium text-sm hover:bg-blue-50 rounded-lg transition-colors">
          Xem tất cả phiên sạc →
        </button>
      </div>

      {/* Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
        <p className="text-xs text-yellow-700">
          💡 <strong>Note:</strong> Dữ liệu mock - Cần tích hợp API <code className="bg-yellow-100 px-1 rounded">/api/admin/sessions/active</code>
        </p>
      </div>
    </div>
  );
}
