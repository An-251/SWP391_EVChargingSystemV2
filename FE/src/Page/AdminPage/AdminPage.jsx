import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../redux/auth/authSlice';
import { message } from 'antd';
import { LogOut, Shield, Users, BarChart3, Settings } from 'lucide-react';

const AdminPage = () => {
  const { user, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      message.success('Đăng xuất thành công!');
      navigate('/auth/login');
    } catch (error) {
      message.warning('Đăng xuất thành công!');
      navigate('/auth/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Xin chào, {user?.fullName || user?.username}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              <span>{loading ? 'Đang đăng xuất...' : 'Đăng xuất'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-8 h-8 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900">Quản lý người dùng</h3>
            </div>
            <p className="text-gray-600">Quản lý tài khoản và quyền hạn người dùng</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <BarChart3 className="w-8 h-8 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900">Báo cáo hệ thống</h3>
            </div>
            <p className="text-gray-600">Xem báo cáo và thống kê tổng quan</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <Settings className="w-8 h-8 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-900">Cài đặt hệ thống</h3>
            </div>
            <p className="text-gray-600">Cấu hình và quản lý hệ thống</p>
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Admin Dashboard</h2>
          <p className="text-gray-600">
            Đây là trang quản trị viên. Tính năng này đang được phát triển.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;