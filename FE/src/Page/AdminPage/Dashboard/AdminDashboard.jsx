import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDashboard } from '../../../redux/admin/adminSlice';
import { Users, MapPin, Zap, CreditCard, TrendingUp, Activity } from 'lucide-react';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { dashboardData, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  const stats = [
    {
      icon: Users,
      label: 'Total Accounts',
      value: dashboardData?.accountCount || 0,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      icon: MapPin,
      label: 'Total Stations',
      value: dashboardData?.stationCount || 0,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      icon: Zap,
      label: 'Charging Points',
      value: dashboardData?.chargingPointCount || 0,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    },
    {
      icon: CreditCard,
      label: 'Subscriptions',
      value: dashboardData?.subscriptionCount || 0,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome to Admin Dashboard</h1>
        <p className="text-green-50">Manage your EV charging system efficiently</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={stat.iconColor} size={24} />
                </div>
                <TrendingUp className="text-green-500" size={20} />
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.label}</h3>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="text-blue-500" size={24} />
            <h2 className="text-xl font-semibold text-gray-800">System Status</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Active Stations</span>
              <span className="font-semibold text-green-600">Online</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">API Status</span>
              <span className="font-semibold text-green-600">Operational</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Database</span>
              <span className="font-semibold text-green-600">Connected</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full p-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-medium">
              Add New Station
            </button>
            <button className="w-full p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-medium">
              Create Charging Point
            </button>
            <button className="w-full p-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all font-medium">
              Manage Accounts
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Message */}
      {dashboardData?.message && (
        <div className="bg-white rounded-xl p-6 shadow-md">
          <p className="text-gray-700">{dashboardData.message}</p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
