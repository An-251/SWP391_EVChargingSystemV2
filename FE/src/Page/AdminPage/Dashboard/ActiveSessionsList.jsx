/**
 * Active Sessions List Component
 * Hiển thị danh sách các phiên sạc đang hoạt động
 */

import React, { useEffect, useState } from 'react';
import api from '../../../configs/config-axios';
import { AdminLoader } from '../../../Components/Admin';

export default function ActiveSessionsList() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveSessions();
  }, []);

  const fetchActiveSessions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/charging-sessions/active');
      const data = response.data?.data || response.data || [];
      setSessions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching active sessions:', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (startTime) => {
    if (!startTime) return 'N/A';
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now - start;
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins} phút`;
  };

  const formatTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    return new Date(dateTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <AdminLoader size="md" text="Đang tải phiên sạc..." />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-5xl mb-3">🔋</div>
        <p className="text-gray-500">Không có phiên sạc nào đang hoạt động</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.slice(0, 5).map((session) => (
        <div
          key={session.id || session.sessionId}
          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            {/* Session Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="font-semibold text-gray-900">
                  {session.driver?.account?.fullName || session.driverName || 'N/A'}
                </h4>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Đang sạc
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-600">
                  <span className="font-medium">Trạm:</span> {session.stationName || session.charger?.chargingPoint?.station?.stationName || 'N/A'}
                </div>
                <div className="text-gray-600">
                  <span className="font-medium">Charger:</span> {session.charger?.chargerCode || session.chargingPointName || 'N/A'}
                </div>
                <div className="text-gray-600">
                  <span className="font-medium">Bắt đầu:</span> {formatTime(session.startTime)}
                </div>
                <div className="text-gray-600">
                  <span className="font-medium">Thời gian:</span> {formatDuration(session.startTime)}
                </div>
              </div>
            </div>

            {/* Energy Display */}
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {session.kwhUsed ? `${formatKWh(session.kwhUsed)} kWh` : 'Đang sạc...'}
              </div>
              <div className="text-xs text-gray-500">Năng lượng</div>
            </div>
          </div>
        </div>
      ))}

      {sessions.length > 5 && (
        <div className="text-center text-sm text-gray-500 pt-2">
          Còn {sessions.length - 5} phiên sạc khác...
        </div>
      )}

      {/* View All Button */}
      <div className="pt-2">
        <button 
          onClick={() => window.location.href = '/admin/sessions'}
          className="w-full py-2 text-blue-600 hover:text-blue-700 font-medium text-sm hover:bg-blue-50 rounded-lg transition-colors"
        >
          Xem tất cả phiên sạc →
        </button>
      </div>
    </div>
  );
}
