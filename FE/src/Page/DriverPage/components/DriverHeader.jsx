import React from 'react';
import { 
  Zap, 
  Battery, 
  RefreshCw, 
  User, 
  LogOut,
  Car 
} from 'lucide-react';

const DriverHeader = ({ 
  user, 
  stationLoading, 
  authLoading,
  showProfileMenu,
  setShowProfileMenu,
  onRefreshStations, 
  onNavigateToProfile,
  onNavigateToVehicles,
  onLogout 
}) => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">EV Charge</h1>
              <p className="text-sm text-gray-500">Xin chào, {user?.fullName || 'Driver'}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onRefreshStations}
              disabled={stationLoading}
              className="flex items-center space-x-1 bg-gray-100 px-3 py-2 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-gray-600 ${stationLoading ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium text-gray-700">Cập nhật</span>
            </button>
            
            <div className="flex items-center space-x-1 bg-green-100 px-3 py-1 rounded-full">
              <Battery className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">85%</span>
            </div>
            
            {/* Profile Menu */}
            <div className="relative profile-menu">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <User className="w-5 h-5 text-gray-600" />
              </button>
              
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{user?.fullName || user?.username}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <p className="text-xs text-green-600 font-medium">{user?.role}</p>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={onNavigateToProfile}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>Thông tin cá nhân</span>
                    </button>
                    <button
                      onClick={onNavigateToVehicles}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      <Car className="w-4 h-4" />
                      <span>Phương tiện của tôi</span>
                    </button>
                    <button
                      onClick={onLogout}
                      disabled={authLoading}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{authLoading ? 'Đang đăng xuất...' : 'Đăng xuất'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverHeader;
