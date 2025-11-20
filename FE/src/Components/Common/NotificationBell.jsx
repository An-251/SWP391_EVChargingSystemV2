import React, { useEffect, useState } from 'react';
import { Badge, Dropdown, List, notification, Spin, Typography, Button } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import api from '../../configs/config-axios';
import moment from 'moment';

const { Text } = Typography;

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch unread notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/employee/notifications/unread');
      setNotifications(response.data);
      setUnreadCount(response.data.length);
    } catch (error) {
      console.error('❌ [NotificationBell] Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/employee/notifications/${notificationId}/read`);
      // Refresh notifications
      fetchNotifications();
    } catch (error) {
      console.error('❌ [NotificationBell] Error marking as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await api.put('/employee/notifications/read-all');
      setNotifications([]);
      setUnreadCount(0);
      notification.success({ message: 'Đã đánh dấu tất cả đã đọc' });
    } catch (error) {
      console.error('❌ [NotificationBell] Error marking all as read:', error);
      notification.error({ message: 'Không thể đánh dấu đã đọc' });
    }
  };

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Show browser notification for emergency stops
  useEffect(() => {
    if (notifications.length > 0) {
      const emergencyNotifications = notifications.filter(n => n.type === 'emergency_stop' && !n.isRead);
      
      emergencyNotifications.forEach(notif => {
        notification.error({
          message: '🚨 Emergency Stop Alert',
          description: `Session ID: ${notif.relatedSessionId} - ${notif.message.split('\n')[0]}`,
          duration: 0, // Don't auto-close
          key: `notif-${notif.id}`,
          onClick: () => {
            markAsRead(notif.id);
            notification.close(`notif-${notif.id}`);
          }
        });
      });
    }
  }, [notifications]);

  const menuItems = (
    <div style={{ width: 400, maxHeight: 500, overflow: 'auto', backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text strong>Thông báo ({unreadCount})</Text>
        {unreadCount > 0 && (
          <Button type="link" size="small" onClick={markAllAsRead}>
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Spin />
        </div>
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 24, color: '#999' }}>
          Không có thông báo mới
        </div>
      ) : (
        <List
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item
              key={item.id}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                backgroundColor: item.isRead ? '#fff' : '#f6ffed',
                borderBottom: '1px solid #f0f0f0'
              }}
              onClick={() => markAsRead(item.id)}
              extra={
                !item.isRead && (
                  <CheckOutlined style={{ color: '#52c41a' }} />
                )
              }
            >
              <List.Item.Meta
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {item.type === 'emergency_stop' && <span>🚨</span>}
                    <Text strong={!item.isRead}>{item.title}</Text>
                  </div>
                }
                description={
                  <div>
                    <div style={{ whiteSpace: 'pre-wrap', fontSize: 12, marginBottom: 4 }}>
                      {item.message.split('\n').slice(0, 3).join('\n')}...
                    </div>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {moment(item.createdAt).fromNow()}
                    </Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );

  return (
    <Dropdown
      overlay={menuItems}
      trigger={['click']}
      open={dropdownOpen}
      onOpenChange={setDropdownOpen}
      placement="bottomRight"
    >
      <div style={{ cursor: 'pointer', padding: '0 12px', display: 'flex', alignItems: 'center' }}>
        <Badge count={unreadCount} offset={[5, 0]}>
          <BellOutlined style={{ fontSize: 20, color: unreadCount > 0 ? '#ff4d4f' : '#666' }} />
        </Badge>
      </div>
    </Dropdown>
  );
};

export default NotificationBell;
