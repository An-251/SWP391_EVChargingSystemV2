import React from 'react';
import { 
  Zap, 
  Battery, 
  RefreshCw, 
  User, 
  LogOut,
  Car,
  History,
  Home,
  Calendar,
  CreditCard
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
  
  const handleNavigateToHistory = () => {
    window.location.href = '/driver/history';
  };
  
  const handleNavigateToReservations = () => {
    window.location.href = '/driver/reservations';
  };
  
  const handleNavigateToHome = () => {
    window.location.href = '/driver';
  };

  const handleNavigateToSubscription = () => {
    window.location.href = '/driver/select-subscription';
  };
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-[1000]">
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
          
          <div className="flex items-center space-x-2">
            {/* Home Icon */}
            <button
              onClick={handleNavigateToHome}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors group relative"
              title="Trang chủ"
            >
              <Home className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Trang chủ
              </span>
            </button>
            
            {/* Refresh Button */}
            <button
              onClick={onRefreshStations}
              disabled={stationLoading}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 group relative"
              title="Cập nhật trạm sạc"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 group-hover:text-gray-900 ${stationLoading ? 'animate-spin' : ''}`} />
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Cập nhật
              </span>
            </button>
            
            {/* History Icon */}
            <button
              onClick={handleNavigateToHistory}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors group relative"
              title="Lịch sử sạc"
            >
              <History className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Lịch sử
              </span>
            </button>
            
            {/* Reservations Icon */}
            <button
              onClick={handleNavigateToReservations}
              className="p-2 rounded-full bg-green-100 hover:bg-green-200 transition-colors group relative"
              title="Đặt chỗ của tôi"
            >
              <Calendar className="w-5 h-5 text-green-600 group-hover:text-green-900" />
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Đặt chỗ
              </span>
            </button>
            
            {/* Vehicles Icon */}
            <button
              onClick={onNavigateToVehicles}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors group relative"
              title="Phương tiện của tôi"
            >
              <Car className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Phương tiện
              </span>
            </button>

            {/* Subscription Icon */}
            <button
              onClick={handleNavigateToSubscription}
              className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors group relative"
              title="Gói dịch vụ của tôi"
            >
              <CreditCard className="w-5 h-5 text-blue-600 group-hover:text-blue-900" />
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Subscription
              </span>
            </button>
              
            
            {/* Profile Menu */}
            <div className="relative profile-menu ml-2">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors group relative"
                title="Tài khoản"
              >
                <User className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Tài khoản
                </span>
              </button>
              
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999]">
                  <div className="p-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{user?.fullName || user?.username}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <p className="text-xs text-green-600 font-medium mt-1">
                      <span className="inline-block px-2 py-0.5 bg-green-100 rounded">
                        {user?.role || 'DRIVER'}
                      </span>
                    </p>
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
