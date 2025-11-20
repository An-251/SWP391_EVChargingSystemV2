import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Zap,
  User,
  LogOut,
  Menu as MenuIcon,
  Bell,
  DollarSign,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/auth/authSlice';
import { APP_SHORT_NAME, LOGO_CONFIG, PORTAL_TITLES } from '../../constants/branding';
import NotificationBell from '../../Components/Common/NotificationBell'; // ⭐ NEW

const { Header, Sider, Content } = Layout;

export default function EmployeeLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  console.log('🏢 EmployeeLayout - Rendering');
  console.log('👤 User:', user);
  console.log('📍 Location:', location.pathname);

  const menuItems = [
    {
      key: '/employee/monitor',
      icon: <Zap size={20} />,
      label: 'Theo dõi Hoạt động',
    },
    {
      key: '/employee/cash-payments',
      icon: <DollarSign size={20} />,
      label: 'Thanh toán Tiền mặt',
    },
    {
      key: '/employee/incidents',
      icon: <AlertTriangle size={20} />,
      label: 'Báo cáo Sự cố',
    },
    {
      key: '/employee/profile',
      icon: <User size={20} />,
      label: 'Hồ sơ',
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <User size={16} />,
      label: 'Hồ sơ của tôi',
      onClick: () => navigate('/employee/profile'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogOut size={16} />,
      label: 'Đăng xuất',
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <Layout className="min-h-screen">
      {/* Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={260}
        className={`bg-gradient-to-b ${LOGO_CONFIG.employee.sidebarBg} shadow-lg`}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center p-4 bg-slate-950">
          {!collapsed ? (
            <div className="flex items-center space-x-2">
              <div className={`p-2 bg-gradient-to-r ${LOGO_CONFIG.employee.bgGradient} rounded-lg`}>
                <Zap className={LOGO_CONFIG.employee.iconColor} size={LOGO_CONFIG.employee.iconSize} />
              </div>
              <div>
                <h1 className={`text-lg font-bold ${LOGO_CONFIG.employee.textColor}`}>{APP_SHORT_NAME}</h1>
                <p className="text-xs text-gray-400">{PORTAL_TITLES.employee}</p>
              </div>
            </div>
          ) : (
            <div className={`p-2 bg-gradient-to-r ${LOGO_CONFIG.employee.bgGradient} rounded-lg`}>
              <Zap className={LOGO_CONFIG.employee.iconColor} size={LOGO_CONFIG.employee.iconSize} />
            </div>
          )}
        </div>

        {/* Menu */}
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={handleMenuClick}
          className="bg-transparent border-none mt-4"
          items={menuItems.map((item) => ({
            ...item,
            className: 'text-gray-300 hover:bg-slate-700 hover:text-white mx-2 rounded-lg',
          }))}
          theme="dark"
        />
      </Sider>

      {/* Main Content Area */}
      <Layout style={{ marginLeft: collapsed ? 80 : 260, transition: 'margin-left 0.2s' }}>
        {/* Top Header */}
        <Header className="bg-white shadow-sm px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MenuIcon size={20} className="text-gray-600" />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {menuItems.find((item) => item.key === location.pathname)?.label || 'Dashboard'}
              </h2>
              <p className="text-xs text-gray-500">
                Cơ sở: {user?.facilityName || 'Chưa có thông tin'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications - Emergency Stop Alerts */}
            <NotificationBell />

            {/* User Menu */}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
                <Avatar
                  size={40}
                  className="bg-gradient-to-br from-blue-500 to-blue-600"
                  icon={<User size={20} />}
                >
                  {user?.fullName?.charAt(0)?.toUpperCase()}
                </Avatar>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-800">{user?.fullName || 'Employee'}</p>
                  <p className="text-xs text-gray-500">{user?.position || 'Staff'}</p>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* Page Content */}
        <Content className="bg-gray-50 min-h-screen">
          <div className="p-6">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}