/**
 * Admin Dashboard Page
 * Displays overview statistics, revenue chart, and active sessions
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats } from '../../../redux/admin/adminSlice';
import { AdminCard, AdminLoader } from '../../../Components/Admin';
import RevenueChart from './RevenueChart';
import ActiveSessionsList from './ActiveSessionsList';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { dashboardStats } = useSelector((state) => state.admin);
  const { totalRevenue, totalFacilities, totalStations, totalChargingPoints, totalUsers, activeSessions, loading, error } = dashboardStats;

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <AdminLoader size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 font-medium">❌ Error: {error}</p>
        <button
          onClick={() => dispatch(fetchDashboardStats())}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">EV Charging System Overview</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AdminCard
          title="Total Revenue"
          value={`${(totalRevenue || 0).toLocaleString('vi-VN')} VND`}
          icon="💰"
          color="green"
          trend="up"
          trendValue={12.5}
        />
        <AdminCard
          title="Facilities"
          value={totalFacilities || 0}
          icon="🏢"
          color="blue"
        />
        <AdminCard
          title="Charging Stations"
          value={totalStations || 0}
          icon="⚡"
          color="purple"
        />
        <AdminCard
          title="Charging Points"
          value={totalChargingPoints || 0}
          icon="🔌"
          color="orange"
        />
        <AdminCard
          title="Users"
          value={totalUsers || 0}
          icon="👥"
          color="cyan"
          trend="up"
          trendValue={8.2}
        />
        <AdminCard
          title="Active Sessions"
          value={activeSessions || 0}
          icon="🔋"
          color="green"
        />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Revenue - Last 7 Days</h2>
        <RevenueChart />
      </div>

      {/* Active Sessions List */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Charging Sessions</h2>
        <ActiveSessionsList />
      </div>
    </div>
  );
}
