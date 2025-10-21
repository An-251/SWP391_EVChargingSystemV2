/**
 * Revenue Chart Component
 * Biểu đồ doanh thu theo thời gian (placeholder - cần install recharts)
 */

import React from 'react';

export default function RevenueChart() {
  // Mock data - Sẽ thay bằng real data từ Redux khi có API
  const mockData = [
    { date: '12/10', revenue: 15000000 },
    { date: '13/10', revenue: 18000000 },
    { date: '14/10', revenue: 22000000 },
    { date: '15/10', revenue: 19000000 },
    { date: '16/10', revenue: 25000000 },
    { date: '17/10', revenue: 28000000 },
    { date: '18/10', revenue: 32000000 },
  ];

  const maxRevenue = Math.max(...mockData.map(d => d.revenue));

  return (
    <div className="space-y-4">
      {/* Chart Area - Simple Bar Chart */}
      <div className="h-64 flex items-end justify-between gap-2">
        {mockData.map((item, index) => {
          const height = (item.revenue / maxRevenue) * 100;
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              {/* Bar */}
              <div className="w-full flex flex-col justify-end items-center" style={{ height: '200px' }}>
                <div
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg hover:from-blue-600 hover:to-blue-500 transition-all cursor-pointer group relative"
                  style={{ height: `${height}%` }}
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {item.revenue.toLocaleString('vi-VN')} VNĐ
                  </div>
                </div>
              </div>
              {/* Date Label */}
              <span className="text-xs text-gray-600 font-medium">{item.date}</span>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-sm text-gray-600">Tổng 7 ngày</p>
          <p className="text-lg font-bold text-gray-900">
            {mockData.reduce((sum, d) => sum + d.revenue, 0).toLocaleString('vi-VN')} VNĐ
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Trung bình/ngày</p>
          <p className="text-lg font-bold text-gray-900">
            {(mockData.reduce((sum, d) => sum + d.revenue, 0) / mockData.length).toLocaleString('vi-VN')} VNĐ
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Cao nhất</p>
          <p className="text-lg font-bold text-green-600">
            {maxRevenue.toLocaleString('vi-VN')} VNĐ
          </p>
        </div>
      </div>

      {/* Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-700">
          💡 <strong>Note:</strong> Để sử dụng chart thực, cần install <code className="bg-blue-100 px-1 rounded">recharts</code> hoặc <code className="bg-blue-100 px-1 rounded">chart.js</code>
        </p>
      </div>
    </div>
  );
}
