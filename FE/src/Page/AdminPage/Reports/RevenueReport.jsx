/**
 * Revenue Report Component
 * Revenue report with date range picker and chart
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRevenueReport } from '../../../redux/admin/adminSlice';
import { AdminLoader } from '../../../Components/Admin';

export default function RevenueReport() {
  const dispatch = useDispatch();
  const { revenueData, loading, error } = useSelector((state) => state.admin.reports);

  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [groupBy, setGroupBy] = useState('day');

  useEffect(() => {
    handleFetchReport();
  }, []);

  const handleFetchReport = () => {
    dispatch(fetchRevenueReport({ ...dateRange, groupBy }));
  };

  // Mock data for visualization (replace when API is ready)
  const mockData = [
    { date: '2024-10-01', revenue: 5000000, sessions: 45 },
    { date: '2024-10-02', revenue: 6200000, sessions: 52 },
    { date: '2024-10-03', revenue: 4800000, sessions: 41 },
    { date: '2024-10-04', revenue: 7100000, sessions: 63 },
    { date: '2024-10-05', revenue: 8500000, sessions: 71 },
    { date: '2024-10-06', revenue: 9200000, sessions: 78 },
    { date: '2024-10-07', revenue: 7800000, sessions: 66 },
  ];

  const totalRevenue = mockData.reduce((sum, item) => sum + item.revenue, 0);
  const totalSessions = mockData.reduce((sum, item) => sum + item.sessions, 0);
  const avgRevenue = totalRevenue / mockData.length;

  if (loading) {
    return <AdminLoader size="lg" text="Loading report..." />;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Group By</label>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="day">By Day</option>
            <option value="week">By Week</option>
            <option value="month">By Month</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={handleFetchReport}
            className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            View Report
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Total Revenue</p>
              <h3 className="text-2xl font-bold text-green-900 mt-1">
                {totalRevenue.toLocaleString('vi-VN')} VND
              </h3>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl">
              💰
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Sessions</p>
              <h3 className="text-2xl font-bold text-blue-900 mt-1">{totalSessions}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl">
              ⚡
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Average/Day</p>
              <h3 className="text-2xl font-bold text-purple-900 mt-1">
                {avgRevenue.toLocaleString('vi-VN')} VND
              </h3>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white text-2xl">
              📊
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Chart</h3>
        <div className="h-64 flex items-end justify-between gap-2">
          {mockData.map((item, index) => {
            const maxRevenue = Math.max(...mockData.map((d) => d.revenue));
            const height = (item.revenue / maxRevenue) * 100;

            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col justify-end" style={{ height: '200px' }}>
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg hover:from-blue-600 hover:to-blue-500 transition-all cursor-pointer group relative"
                    style={{ height: `${height}%` }}
                  >
                    <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      <div className="font-bold">{item.revenue.toLocaleString('vi-VN')} VND</div>
                      <div className="text-gray-300">{item.sessions} sessions</div>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-600 font-medium">
                  {new Date(item.date).getDate()}/{new Date(item.date).getMonth() + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Sessions</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Avg/Session</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(item.date).toLocaleDateString('en-US')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600">
                  {item.revenue.toLocaleString('vi-VN')} VND
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {item.sessions}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                  {(item.revenue / item.sessions).toLocaleString('vi-VN')} VND
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr className="font-bold">
              <td className="px-6 py-4 text-sm text-gray-900">Total</td>
              <td className="px-6 py-4 text-sm text-right text-green-600">
                {totalRevenue.toLocaleString('vi-VN')} VND
              </td>
              <td className="px-6 py-4 text-sm text-right text-gray-900">{totalSessions}</td>
              <td className="px-6 py-4 text-sm text-right text-gray-600">
                {(totalRevenue / totalSessions).toLocaleString('vi-VN')} VND
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2">
          <span>📥</span>
          Export to Excel
        </button>
      </div>

      {/* Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          💡 <strong>Note:</strong> Current data is mock data. Need to connect with API{' '}
          <code className="bg-yellow-100 px-2 py-1 rounded">/api/admin/reports/revenue</code> for real data.
        </p>
      </div>
    </div>
  );
}
