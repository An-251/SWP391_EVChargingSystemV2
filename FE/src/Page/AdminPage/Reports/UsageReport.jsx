/**
 * Usage Report Component
 * Usage statistics report by station
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsageReport, fetchStations } from '../../../redux/admin/adminSlice';
import { AdminLoader } from '../../../Components/Admin';

export default function UsageReport() {
  const dispatch = useDispatch();
  const { usageData, loading } = useSelector((state) => state.admin.reports);
  const stations = useSelector((state) => state.admin.stations.list);

  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    stationId: '',
  });

  useEffect(() => {
    dispatch(fetchStations({ page: 0, size: 100 }));
    handleFetchReport();
  }, []);

  const handleFetchReport = () => {
    dispatch(fetchUsageReport(filters));
  };

  // Mock data
  const mockData = [
    {
      stationId: 1,
      stationName: 'Vincom Dong Khoi Station',
      totalSessions: 156,
      totalEnergy: 2845.5,
      totalRevenue: 9958925,
      avgSessionDuration: 45,
      utilizationRate: 78,
    },
    {
      stationId: 2,
      stationName: 'Landmark 81 Station',
      totalSessions: 189,
      totalEnergy: 3421.2,
      totalRevenue: 11974200,
      avgSessionDuration: 52,
      utilizationRate: 85,
    },
    {
      stationId: 3,
      stationName: 'Aeon Mall Station',
      totalSessions: 134,
      totalEnergy: 2156.8,
      totalRevenue: 7548800,
      avgSessionDuration: 38,
      utilizationRate: 65,
    },
    {
      stationId: 4,
      stationName: 'Crescent Mall Station',
      totalSessions: 98,
      totalEnergy: 1678.3,
      totalRevenue: 5874050,
      avgSessionDuration: 41,
      utilizationRate: 52,
    },
  ];

  const totalSessions = mockData.reduce((sum, item) => sum + item.totalSessions, 0);
  const totalEnergy = mockData.reduce((sum, item) => sum + item.totalEnergy, 0);
  const totalRevenue = mockData.reduce((sum, item) => sum + item.totalRevenue, 0);

  if (loading) {
    return <AdminLoader size="lg" text="Loading usage report..." />;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Station</label>
          <select
            value={filters.stationId}
            onChange={(e) => setFilters({ ...filters, stationId: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All stations</option>
            {stations.map((station) => (
              <option key={station.id} value={station.id}>
                {station.name}
              </option>
            ))}
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Total Energy</p>
              <h3 className="text-2xl font-bold text-orange-900 mt-1">{totalEnergy.toFixed(1)} kWh</h3>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white text-2xl">
              🔋
            </div>
          </div>
        </div>

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
      </div>

      {/* Utilization Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Utilization Rate by Station</h3>
        <div className="space-y-4">
          {mockData.map((station) => (
            <div key={station.stationId}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{station.stationName}</span>
                <span className="text-sm font-bold text-blue-600">{station.utilizationRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-400 h-3 rounded-full transition-all"
                  style={{ width: `${station.utilizationRate}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Details Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Station</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Sessions</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Energy (kWh)</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Avg Time (min)</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Util. Rate (%)</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockData.map((station) => (
              <tr key={station.stationId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {station.stationName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {station.totalSessions}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {station.totalEnergy.toFixed(1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600">
                  {station.totalRevenue.toLocaleString('vi-VN')} VND
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {station.avgSessionDuration}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      station.utilizationRate >= 80
                        ? 'bg-green-100 text-green-700'
                        : station.utilizationRate >= 60
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {station.utilizationRate}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr className="font-bold">
              <td className="px-6 py-4 text-sm text-gray-900">Total</td>
              <td className="px-6 py-4 text-sm text-right text-gray-900">{totalSessions}</td>
              <td className="px-6 py-4 text-sm text-right text-gray-900">{totalEnergy.toFixed(1)}</td>
              <td className="px-6 py-4 text-sm text-right text-green-600">
                {totalRevenue.toLocaleString('vi-VN')} VND
              </td>
              <td className="px-6 py-4 text-sm text-right text-gray-900">-</td>
              <td className="px-6 py-4 text-sm text-right text-gray-900">-</td>
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
          <code className="bg-yellow-100 px-2 py-1 rounded">/api/admin/reports/usage</code> for real data.
        </p>
      </div>
    </div>
  );
}
