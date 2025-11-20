/**
 * Enhanced Admin Dashboard
 * Hiển thị các metrics chi tiết về doanh thu, người dùng, phiên sạc, và gói dịch vụ
 */

import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Spin, Alert, Tabs } from 'antd';
import { 
  DollarSign, 
  Users, 
  Zap, 
  TrendingUp, 
  TrendingDown,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import api from '../../../configs/config-axios';

const { TabPane } = Tabs;

export default function DashboardNew() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    revenue: {
      total: 0,
    },
    users: {
      new: 0,
      monthly: 0,
    },
    sessions: {
      total: 0,
      totalChargingHours: 0,
      byStation: [],
      chargingTimeByStation: [],
      overtime: 0,
    },
    subscriptions: {
      mostActive: [],
      mostCancelled: [],
    },
    incidents: {
      total: 0,
      pending: 0,
    },
    infrastructure: {
      facilities: 0,
      stations: 0,
      chargingPoints: 0,
      chargers: 0,
    },
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 [Dashboard] Starting to fetch stats...');

      // Fetch all data in parallel
      const [
        sessionsRes,
        invoicesRes,
        accountsRes,
        mostActiveRes,
        mostCancelledRes,
        incidentsRes,
        facilitiesRes,
        stationsRes,
        chargingPointsRes,
      ] = await Promise.all([
        api.get('/charging-sessions').catch((err) => { 
          console.error('❌ Sessions API error:', err.response?.data || err.message);
          return { data: [] };
        }),
        api.get('/invoices').catch((err) => { 
          console.error('❌ Invoices API error:', err.response?.data || err.message);
          return { data: [] };
        }),
        api.get('/admin/accounts').catch((err) => { 
          console.error('❌ Accounts API error:', err.response?.data || err.message);
          return { data: [] };
        }),
        api.get('/admin/subscriptions/stats/most-active').catch((err) => { 
          console.error('❌ Most active API error:', err.response?.data || err.message);
          return { data: [] };
        }),
        api.get('/admin/subscriptions/stats/most-cancelled').catch((err) => { 
          console.error('❌ Most cancelled API error:', err.response?.data || err.message);
          return { data: [] };
        }),
        api.get('/incident-reports').catch((err) => { 
          console.error('❌ Incidents API error:', err.response?.data || err.message);
          return { data: [] };
        }),
        api.get('/facilities/profile').catch((err) => { 
          console.error('❌ Facilities API error:', err.response?.data || err.message);
          return { data: [] };
        }),
        api.get('/charging-stations').catch((err) => { 
          console.error('❌ Stations API error:', err.response?.data || err.message);
          return { data: [] };
        }),
        api.get('/charging-points').catch((err) => { 
          console.error('❌ Charging points API error:', err.response?.data || err.message);
          return { data: [] };
        }),
      ]);

      console.log('✅ [Dashboard] All API calls completed');
      console.log('📊 Sessions response:', sessionsRes.data);
      console.log('📊 Invoices response:', invoicesRes.data);

      // Extract data - BE returns {success, message, data: {...}}
      // Sessions: {data: {sessions: [...], totalSessions}}
      const sessionsData = sessionsRes.data?.data || {};
      const sessions = sessionsData.sessions || [];
      
      // Invoices: {data: [...]}
      const invoices = invoicesRes.data?.data || [];
      
      const accounts = accountsRes.data?.data || accountsRes.data || [];
      const mostActive = mostActiveRes.data || [];
      const mostCancelled = mostCancelledRes.data || [];
      const incidents = incidentsRes.data?.data || incidentsRes.data || [];
      const facilities = facilitiesRes.data?.content || facilitiesRes.data?.data || facilitiesRes.data || [];
      const stations = stationsRes.data?.content || stationsRes.data?.data || stationsRes.data || [];
      const chargingPoints = chargingPointsRes.data?.content || chargingPointsRes.data?.data || chargingPointsRes.data || [];

      console.log('📊 Extracted sessions:', sessions.length);
      console.log('📊 Extracted invoices:', invoices.length);
      console.log('📊 Sample invoice:', invoices[0]);

      // Calculate revenue (only from invoices)
      // BE returns 'totalCost' field (BigDecimal)
      const totalRevenue = Array.isArray(invoices)
        ? invoices.reduce((sum, inv) => {
            const amount = inv.totalCost || 0;
            console.log('💰 Invoice amount:', amount);
            return sum + Number(amount);
          }, 0)
        : 0;

      console.log('💰 Total revenue calculated:', totalRevenue);

      // Calculate user stats (last 7 days for new users)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const newUsers = Array.isArray(accounts)
        ? accounts.filter(a => {
            const createdDate = new Date(a.createdAt || a.createdDate);
            return createdDate >= sevenDaysAgo;
          }).length
        : 0;

      const monthlyActiveUsers = Array.isArray(accounts)
        ? accounts.filter(a => a.status?.toLowerCase() === 'active').length
        : 0;

      // Calculate session metrics
      const totalSessions = Array.isArray(sessions) ? sessions.length : 0;
      
      // Calculate total charging time (in hours)
      const totalChargingMinutes = Array.isArray(sessions)
        ? sessions.reduce((sum, s) => {
            if (s.startTime && s.endTime) {
              const start = new Date(s.startTime);
              const end = new Date(s.endTime);
              const minutes = (end - start) / (1000 * 60);
              return sum + (minutes > 0 ? minutes : 0);
            }
            return sum;
          }, 0)
        : 0;
      const totalChargingHours = Math.round(totalChargingMinutes / 60);

      // Calculate sessions by station
      const sessionsByStation = {};
      const chargingTimeByStation = {};
      if (Array.isArray(sessions)) {
        sessions.forEach(s => {
          const stationName = s.stationName || 'Unknown';
          sessionsByStation[stationName] = (sessionsByStation[stationName] || 0) + 1;
          
          // Calculate charging time for this station
          if (s.startTime && s.endTime) {
            const start = new Date(s.startTime);
            const end = new Date(s.endTime);
            const minutes = (end - start) / (1000 * 60);
            if (minutes > 0) {
              chargingTimeByStation[stationName] = (chargingTimeByStation[stationName] || 0) + minutes;
            }
          }
        });
      }

      const topStations = Object.entries(sessionsByStation)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));
      
      const stationChargingTimes = Object.entries(chargingTimeByStation)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, minutes]) => ({ 
          name, 
          hours: Math.round(minutes / 60 * 10) / 10 // Round to 1 decimal
        }));

      // Calculate overtime hours
      const overtimeHours = Array.isArray(sessions)
        ? sessions
            .filter(s => s.overusedTime && s.overusedTime > 0)
            .reduce((sum, s) => sum + (s.overusedTime || 0), 0) / 60 // Convert minutes to hours
        : 0;

      // Count chargers from charging points
      const totalChargers = Array.isArray(chargingPoints)
        ? chargingPoints.reduce((sum, cp) => sum + (cp.chargers?.length || 0), 0)
        : 0;

      // Incidents
      const totalIncidents = Array.isArray(incidents) ? incidents.length : 0;
      const pendingIncidents = Array.isArray(incidents)
        ? incidents.filter(i => i.status?.toLowerCase() === 'pending').length
        : 0;

      setStats({
        revenue: {
          total: totalRevenue,
        },
        users: {
          new: newUsers,
          monthly: monthlyActiveUsers,
        },
        sessions: {
          total: totalSessions,
          totalChargingHours: totalChargingHours,
          byStation: topStations,
          chargingTimeByStation: stationChargingTimes,
          overtime: Math.round(overtimeHours),
        },
        subscriptions: {
          mostActive: Array.isArray(mostActive) ? mostActive : [],
          mostCancelled: Array.isArray(mostCancelled) ? mostCancelled : [],
        },
        incidents: {
          total: totalIncidents,
          pending: pendingIncidents,
        },
        infrastructure: {
          facilities: Array.isArray(facilities) ? facilities.length : 0,
          stations: Array.isArray(stations) ? stations.length : 0,
          chargingPoints: Array.isArray(chargingPoints) ? chargingPoints.length : 0,
          chargers: totalChargers,
        },
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError(error.message || 'Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spin size="large" tip="Đang tải dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Lỗi"
        description={error}
        type="error"
        showIcon
        action={
          <button
            onClick={fetchDashboardStats}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Thử lại
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">📊 Dashboard Tổng Quan</h1>
        <p className="text-gray-600 mt-1">Thống kê chi tiết hệ thống EV Charging</p>
      </div>

      <Tabs defaultActiveKey="revenue" size="large">
        {/* Tab 1: Doanh Thu */}
        <TabPane tab="💰 Doanh Thu" key="revenue">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={24} lg={12}>
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <Statistic
                  title="Tổng Doanh Thu (từ hóa đơn)"
                  value={stats.revenue.total}
                  suffix="VNĐ"
                  precision={0}
                  valueStyle={{ color: '#10b981', fontSize: '32px' }}
                />
                <p className="text-gray-500 mt-2 text-sm">
                  Tính từ tất cả hóa đơn đã thanh toán
                </p>
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* Tab 2: Người Dùng */}
        <TabPane tab="👥 Người Dùng" key="users">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <Statistic
                  title="Người dùng mới (7 ngày)"
                  value={stats.users.new}
                  prefix={<TrendingUp className="text-green-500" />}
                  valueStyle={{ color: '#10b981' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <Statistic
                  title="Người dùng hoạt động"
                  value={stats.users.monthly}
                  prefix={<Users className="text-blue-500" />}
                  valueStyle={{ color: '#3b82f6' }}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* Tab 3: Phiên Sạc */}
        <TabPane tab="⚡ Phiên Sạc" key="sessions">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={8}>
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <Statistic
                  title="Tổng số phiên sạc"
                  value={stats.sessions.total}
                  prefix={<Zap className="text-yellow-500" />}
                  valueStyle={{ color: '#f59e0b' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <Statistic
                  title="Tổng thời gian sạc"
                  value={stats.sessions.totalChargingHours}
                  prefix={<Clock className="text-blue-500" />}
                  suffix="giờ"
                  valueStyle={{ color: '#3b82f6' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <Statistic
                  title="Thời gian quá hạn"
                  value={stats.sessions.overtime}
                  prefix={<AlertTriangle className="text-red-500" />}
                  suffix="giờ"
                  valueStyle={{ color: '#ef4444' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Top 5 trạm theo số phiên */}
          <Card className="mt-4 shadow-lg" title="Top 5 Trạm Theo Số Phiên Sạc">
            <div className="space-y-3">
              {stats.sessions.byStation.map((station, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">
                    {index + 1}. {station.name}
                  </span>
                  <span className="text-blue-600 font-bold">{station.count} phiên</span>
                </div>
              ))}
              {stats.sessions.byStation.length === 0 && (
                <p className="text-gray-400 text-center py-4">Chưa có dữ liệu</p>
              )}
            </div>
          </Card>

          {/* Thời gian sạc theo trạm */}
          <Card className="mt-4 shadow-lg" title="Thời Gian Sạc Theo Trạm">
            <div className="space-y-3">
              {stats.sessions.chargingTimeByStation.map((station, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">
                    {index + 1}. {station.name}
                  </span>
                  <span className="text-green-600 font-bold">{station.hours} giờ</span>
                </div>
              ))}
              {stats.sessions.chargingTimeByStation.length === 0 && (
                <p className="text-gray-400 text-center py-4">Chưa có dữ liệu</p>
              )}
            </div>
          </Card>
        </TabPane>

        {/* Tab 4: Gói Dịch Vụ */}
        <TabPane tab="📦 Gói Dịch Vụ" key="subscriptions">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="Các gói được đăng ký nhiều nhất" className="shadow-lg">
                <div className="space-y-3">
                  {stats.subscriptions.mostActive.map((plan, index) => (
                    <div key={plan.planId} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <div>
                        <span className="font-medium">
                          {index + 1}. {plan.planName}
                        </span>
                        <p className="text-sm text-gray-500">{plan.percentage}% tổng số</p>
                      </div>
                      <span className="text-green-600 font-bold">{plan.count} gói</span>
                    </div>
                  ))}
                  {stats.subscriptions.mostActive.length === 0 && (
                    <p className="text-gray-400 text-center py-4">Chưa có dữ liệu</p>
                  )}
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Các gói bị hủy nhiều nhất" className="shadow-lg">
                <div className="space-y-3">
                  {stats.subscriptions.mostCancelled.map((plan, index) => (
                    <div key={plan.planId} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <div>
                        <span className="font-medium">
                          {index + 1}. {plan.planName}
                        </span>
                        <p className="text-sm text-gray-500">{plan.percentage}% tổng số</p>
                      </div>
                      <span className="text-red-600 font-bold">{plan.count} gói</span>
                    </div>
                  ))}
                  {stats.subscriptions.mostCancelled.length === 0 && (
                    <p className="text-gray-400 text-center py-4">Chưa có dữ liệu</p>
                  )}
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* Tab 5: Report Lỗi */}
        <TabPane tab="🚨 Report Lỗi" key="incidents">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={8}>
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <Statistic
                  title="Tổng số báo cáo"
                  value={stats.incidents.total}
                  prefix={<AlertTriangle className="text-orange-500" />}
                  valueStyle={{ color: '#f97316' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <Statistic
                  title="Đang chờ xử lý"
                  value={stats.incidents.pending}
                  prefix={<Clock className="text-red-500" />}
                  valueStyle={{ color: '#ef4444' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <Statistic
                  title="Đã giải quyết"
                  value={stats.incidents.total - stats.incidents.pending}
                  prefix={<CheckCircle className="text-green-500" />}
                  valueStyle={{ color: '#10b981' }}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* Tab 6: Cơ Sở Hạ Tầng */}
        <TabPane tab="🏢 Cơ Sở Hạ Tầng" key="infrastructure">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-lg hover:shadow-xl transition-shadow border-t-4 border-blue-500">
                <Statistic
                  title="Tổng số Facilities"
                  value={stats.infrastructure.facilities}
                  valueStyle={{ color: '#3b82f6', fontSize: '32px' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-lg hover:shadow-xl transition-shadow border-t-4 border-green-500">
                <Statistic
                  title="Tổng số Stations"
                  value={stats.infrastructure.stations}
                  valueStyle={{ color: '#10b981', fontSize: '32px' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-lg hover:shadow-xl transition-shadow border-t-4 border-purple-500">
                <Statistic
                  title="Tổng số Charging Points"
                  value={stats.infrastructure.chargingPoints}
                  valueStyle={{ color: '#8b5cf6', fontSize: '32px' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-lg hover:shadow-xl transition-shadow border-t-4 border-orange-500">
                <Statistic
                  title="Tổng số Chargers"
                  value={stats.infrastructure.chargers}
                  valueStyle={{ color: '#f97316', fontSize: '32px' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Infrastructure Details */}
          <Card className="shadow-lg mt-6" title="Chi tiết cơ sở hạ tầng">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Facilities</p>
                  <p className="text-xs text-gray-500">Các cơ sở quản lý trạm sạc</p>
                </div>
                <p className="text-3xl font-bold text-blue-600">{stats.infrastructure.facilities}</p>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Charging Stations</p>
                  <p className="text-xs text-gray-500">Các trạm sạc điện</p>
                </div>
                <p className="text-3xl font-bold text-green-600">{stats.infrastructure.stations}</p>
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Charging Points</p>
                  <p className="text-xs text-gray-500">Các điểm sạc (vị trí vật lý)</p>
                </div>
                <p className="text-3xl font-bold text-purple-600">{stats.infrastructure.chargingPoints}</p>
              </div>
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Chargers</p>
                  <p className="text-xs text-gray-500">Các bộ sạc (thiết bị sạc)</p>
                </div>
                <p className="text-3xl font-bold text-orange-600">{stats.infrastructure.chargers}</p>
              </div>
            </div>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
}
