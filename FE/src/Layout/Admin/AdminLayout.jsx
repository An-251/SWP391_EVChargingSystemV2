import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../redux/auth/authSlice';
import '../../styles/admin.css'; // Admin specific styles
import EVChargeIcon from '../../Components/EVChargeIcon';
import { 
  LayoutDashboard, 
  Users, 
  MapPin, 
  Plug,
  CreditCard,
  Building2,
  Menu as MenuIcon,
  X,
  LogOut,
  BarChart3,
  UserPlus,
  FileText,
  AlertCircle,
  UserCog
} from 'lucide-react';
// THAY ĐỔI: Chỉ import Dropdown và message, không cần Menu
import { message, Dropdown } from 'antd';
import { APP_SHORT_NAME, LOGO_CONFIG } from '../../constants/branding';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/facilities', icon: Building2, label: 'Facilities' },
    { path: '/admin/stations', icon: MapPin, label: 'Stations' },
    { path: '/admin/charging-points', icon: EVChargeIcon, label: 'Charging Points' },
    { path: '/admin/chargers', icon: Plug, label: 'Chargers' },
    { path: '/admin/accounts', icon: Users, label: 'Accounts' },
    { path: '/admin/employees', icon: UserCog, label: 'Employees' },
    { path: '/admin/subscriptions', icon: CreditCard, label: 'Subscriptions' },
    { path: '/admin/invoices', icon: FileText, label: 'Invoices' },
    { path: '/admin/incidents', icon: AlertCircle, label: 'Incidents' },
  ];

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      message.success('Logout successful!');
      navigate('/auth/login');
    } catch (error) {
      message.warning('Logout successful!');
      navigate('/auth/login');
    }
  };

  const isActive = (path) => location.pathname === path;

  // THAY ĐỔI: Tạo menu items cho Dropdown (dùng items array thay vì Menu component)
  const userMenuItems = [
    {
      key: 'info',
      disabled: true,
      label: (
        <div>
          <p className="font-semibold text-slate-800">{user?.fullName || user?.username}</p>
          <p className="text-xs text-slate-500">{user?.email}</p>
        </div>
      ),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      danger: true,
      label: (
        <div className="flex items-center space-x-2">
          <LogOut size={16} />
          <span>Logout</span>
        </div>
      ),
      onClick: handleLogout,
    },
  ];

  return (
    // THAY ĐỔI LỚN: Thêm `h-screen w-screen overflow-hidden` để fix lỗi bị cắt
    <div className="h-screen w-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } flex flex-col`}
      >
        {/* Logo & Toggle */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700">
          {sidebarOpen ? (
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full ${LOGO_CONFIG.admin.bgColor} flex items-center justify-center`}>
                <EVChargeIcon size={LOGO_CONFIG.admin.iconSize} className={LOGO_CONFIG.admin.iconColor} />
              </div>
              <h1 className={`text-xl font-bold ${LOGO_CONFIG.admin.textColor}`}>{APP_SHORT_NAME}</h1>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <div className={`w-8 h-8 rounded-full ${LOGO_CONFIG.admin.bgColor} flex items-center justify-center`}>
                <EVChargeIcon size={LOGO_CONFIG.admin.iconSize} className={LOGO_CONFIG.admin.iconColor} />
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
          >
            {/* Đã đổi tên Menu (lucide) thành MenuIcon */}
            {sidebarOpen ? <X size={20} /> : <MenuIcon size={20} />} 
          </button>
        </div>

        {/* Navigation */}
        {/* THAY ĐỔI: Thêm overflow-y-auto để menu tự cuộn khi quá dài */}
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <div key={item.path} className="relative group">
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors relative ${
                    active
                      ? 'bg-slate-700 text-white'
                      : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-r-full"></span>
                  )}
                  <Icon size={20} />
                  {sidebarOpen && (
                    <span className="flex-1 text-left font-medium">{item.label}</span>
                  )}
                </button>
                {!sidebarOpen && (
                  <span className="absolute left-full ml-3 w-max px-3 py-1.5 bg-slate-900 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                    {item.label}
                  </span>
                )}
              </div>
            );
          })}
        </nav>

        {/* THAY ĐỔI LỚN: Đã xóa toàn bộ phần User Info & Logout ở cuối sidebar */}
        
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white shadow-sm border-b border-slate-200 flex items-center justify-between px-6">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-slate-800">
              {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
            </h2>
          </div>
          
          {/* THAY ĐỔI LỚN: Chuyển User Info + Logout vào Dropdown */}
          <div className="flex items-center space-x-4">
            <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
              <button className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-bold cursor-pointer hover:opacity-90 transition-opacity">
                {user?.username?.charAt(0).toUpperCase()}
              </button>
            </Dropdown>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;