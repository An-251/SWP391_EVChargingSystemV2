import React, { useState, useEffect } from 'react';
import { message, Select, DatePicker, Tag, Tooltip, Space, Button as AntButton, Popconfirm, Dropdown } from 'antd';
import { 
  AlertCircle, 
  Filter, 
  RefreshCw, 
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  MoreVertical
} from 'lucide-react';
import dayjs from 'dayjs';
import AdminTable from '../../../Components/Admin/AdminTable';
import AdminModal from '../../../Components/Admin/AdminModal';
import AdminSearchBar from '../../../Components/Admin/AdminSearchBar';
import api from '../../../configs/config-axios';

const { RangePicker } = DatePicker;
const { Option } = Select;

const AdminIncidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filters
  const [filters, setFilters] = useState({
    status: null,
    severity: null,
    reportType: null,
    stationId: null,
    dateRange: null,
  });

  // Fetch incidents
  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.severity) params.append('severity', filters.severity);
      if (filters.reportType) params.append('reportType', filters.reportType);
      if (filters.stationId) params.append('stationId', filters.stationId);
      if (filters.dateRange && filters.dateRange.length === 2) {
        params.append('startDate', filters.dateRange[0].toISOString());
        params.append('endDate', filters.dateRange[1].toISOString());
      }

      const response = await api.get(`/incident-reports/filter?${params.toString()}`);
      console.log('Incidents response:', response.data); // ⭐ Debug
      
      // Backend trả về direct array, không wrap trong object
      const incidentsData = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.data || []);
      
      console.log('Incidents data:', incidentsData); // ⭐ Debug
      setIncidents(incidentsData);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      message.error('Không thể tải danh sách báo cáo');
      setIncidents([]); // ⭐ Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [filters]);

  // Update status
  const handleUpdateStatus = async (reportId, newStatus) => {
    try {
      await api.put(`/incident-reports/${reportId}/status?status=${newStatus}`);
      message.success('Cập nhật trạng thái thành công');
      await fetchIncidents(); // ⭐ Wait for refresh
    } catch (error) {
      console.error('Error updating status:', error);
      message.error('Không thể cập nhật trạng thái');
    }
  };

  // Close report
  const handleCloseReport = async (reportId, resolutionNotes) => {
    try {
      await api.put(`/incident-reports/${reportId}/close`, { resolutionNotes });
      message.success('Đóng báo cáo thành công! Thiết bị đã được khôi phục về trạng thái active.');
      setShowDetailModal(false);
      setSelectedIncident(null); // ⭐ Clear selected incident
      await fetchIncidents(); // ⭐ Refresh list
    } catch (error) {
      console.error('Error closing report:', error);
      message.error('Không thể đóng báo cáo');
    }
  };

  // Delete report
  const handleDeleteReport = async (reportId) => {
    try {
      await api.delete(`/incident-reports/${reportId}`);
      message.success('Xóa báo cáo thành công');
      setShowDetailModal(false);
      setSelectedIncident(null); // ⭐ Clear selected
      await fetchIncidents(); // ⭐ Wait for refresh
    } catch (error) {
      console.error('Error deleting report:', error);
      message.error('Không thể xóa báo cáo');
    }
  };

  // Status badge
  const getStatusBadge = (status) => {
    const normalizedStatus = status?.toLowerCase();
    const statusConfig = {
      pending: { color: 'orange', icon: <Clock size={14} />, text: 'Chờ xử lý' },
      in_progress: { color: 'blue', icon: <RefreshCw size={14} />, text: 'Đang xử lý' },
      resolved: { color: 'green', icon: <CheckCircle size={14} />, text: 'Đã giải quyết' },
      closed: { color: 'gray', icon: <XCircle size={14} />, text: 'Đã đóng' },
      rejected: { color: 'red', icon: <XCircle size={14} />, text: 'Từ chối' },
    };

    const config = statusConfig[normalizedStatus] || statusConfig.pending;
    
    return (
      <Tag color={config.color} className="flex items-center gap-1">
        {config.icon}
        <span>{config.text}</span>
      </Tag>
    );
  };

  // Severity badge
  const getSeverityBadge = (severity) => {
    const normalizedSeverity = severity?.toUpperCase();
    const severityConfig = {
      LOW: { color: 'green', text: 'Thấp' },
      MEDIUM: { color: 'orange', text: 'Trung bình' },
      HIGH: { color: 'red', text: 'Cao' },
      CRITICAL: { color: 'purple', text: 'Nghiêm trọng' },
    };

    const config = severityConfig[normalizedSeverity] || severityConfig.MEDIUM;
    
    return (
      <Tag color={config.color}>
        {config.text}
      </Tag>
    );
  };

  // Report type badge
  const getReportTypeBadge = (type) => {
    const typeConfig = {
      USER_REPORTED: { color: 'blue', text: 'User báo cáo' },
      SYSTEM_DETECTED: { color: 'red', text: 'Hệ thống phát hiện' },
      EMPLOYEE_REPORTED: { color: 'cyan', text: 'Employee ghi nhận' },
    };

    const config = typeConfig[type] || typeConfig.USER_REPORTED;
    
    return (
      <Tag color={config.color}>
        {config.text}
      </Tag>
    );
  };

  // Table columns
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <div className="font-medium">{text || 'Không có tiêu đề'}</div>
          <div className="text-xs text-gray-500 truncate max-w-xs">{record.description}</div>
        </div>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'reportType',
      key: 'reportType',
      width: 180,
      render: (type) => getReportTypeBadge(type),
    },
    {
      title: 'Mức độ',
      dataIndex: 'severity',
      key: 'severity',
      width: 130,
      render: (severity) => getSeverityBadge(severity),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status) => getStatusBadge(status),
    },
    {
      title: 'Người báo cáo',
      key: 'reporter',
      width: 180,
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.reporterName || 'N/A'}</div>
          <div className="text-xs text-gray-500">{record.reporterEmail}</div>
        </div>
      ),
    },
    {
      title: 'Ngày báo cáo',
      dataIndex: 'reportDate',
      key: 'reportDate',
      width: 130,
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 220,
      fixed: 'right',
      render: (_, record) => {
        const isClosed = record.status?.toLowerCase() === 'closed'; // ⭐ Check lowercase
        
        const menuItems = [
          {
            key: 'view',
            label: 'Xem chi tiết',
            icon: <Eye size={14} />,
            onClick: () => {
              setSelectedIncident(record);
              setShowDetailModal(true);
            }
          },
          ...(!isClosed ? [
            {
              key: 'in_progress',
              label: 'Đánh dấu đang xử lý',
              icon: <RefreshCw size={14} />,
              onClick: () => handleUpdateStatus(record.id, 'in_progress') // ⭐ lowercase
            },
            {
              key: 'resolved',
              label: 'Đánh dấu đã giải quyết',
              icon: <CheckCircle size={14} />,
              onClick: () => handleUpdateStatus(record.id, 'resolved') // ⭐ lowercase
            }
          ] : [])
        ];

        return (
          <Space size="small">
            <Tooltip title="Xem chi tiết">
              <AntButton
                type="link"
                icon={<Eye size={16} />}
                onClick={() => {
                  setSelectedIncident(record);
                  setShowDetailModal(true);
                }}
              />
            </Tooltip>
            
            {!isClosed && (
              <>
                <Popconfirm
                  title="Đóng báo cáo"
                  description="Xác nhận đóng báo cáo này? Status của thiết bị sẽ được khôi phục về active."
                  onConfirm={() => handleCloseReport(record.id, 'Resolved by admin')}
                  okText="Đóng báo cáo"
                  cancelText="Hủy"
                >
                  <AntButton
                    type="primary"
                    size="small"
                  >
                    Đóng
                  </AntButton>
                </Popconfirm>
                
                <Dropdown
                  menu={{ items: menuItems }}
                  trigger={['click']}
                >
                  <AntButton
                    size="small"
                    icon={<MoreVertical size={14} />}
                  />
                </Dropdown>
              </>
            )}
            
            <Popconfirm
              title="Xóa báo cáo"
              description="Bạn có chắc muốn xóa báo cáo này?"
              onConfirm={() => handleDeleteReport(record.id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <AntButton
                danger
                size="small"
                icon={<XCircle size={14} />}
              />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  // Filtered incidents for search
  const filteredIncidents = Array.isArray(incidents) 
    ? incidents.filter(incident => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
          incident.title?.toLowerCase().includes(searchLower) ||
          incident.description?.toLowerCase().includes(searchLower) ||
          incident.reporterName?.toLowerCase().includes(searchLower) ||
          incident.reporterEmail?.toLowerCase().includes(searchLower)
        );
      })
    : []; // ⭐ Fallback to empty array if incidents is not an array

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-orange-100 rounded-xl">
            <AlertCircle className="text-orange-600" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý Báo cáo Sự cố</h1>
            <p className="text-gray-500">Xem và xử lý các báo cáo sự cố</p>
          </div>
        </div>
        <AntButton
          icon={<RefreshCw size={16} />}
          onClick={fetchIncidents}
          loading={loading}
        >
          Làm mới
        </AntButton>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={18} className="text-gray-600" />
          <h3 className="font-semibold text-gray-700">Bộ lọc</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <Select
              placeholder="Chọn trạng thái"
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              allowClear
              className="w-full"
            >
              <Option value="pending">Chờ xử lý</Option>
              <Option value="in_progress">Đang xử lý</Option>
              <Option value="resolved">Đã giải quyết</Option>
              <Option value="closed">Đã đóng</Option>
              <Option value="rejected">Từ chối</Option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mức độ</label>
            <Select
              placeholder="Chọn mức độ"
              value={filters.severity}
              onChange={(value) => setFilters({ ...filters, severity: value })}
              allowClear
              className="w-full"
            >
              <Option value="LOW">Thấp</Option>
              <Option value="MEDIUM">Trung bình</Option>
              <Option value="HIGH">Cao</Option>
              <Option value="CRITICAL">Nghiêm trọng</Option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại báo cáo</label>
            <Select
              placeholder="Chọn loại"
              value={filters.reportType}
              onChange={(value) => setFilters({ ...filters, reportType: value })}
              allowClear
              className="w-full"
            >
              <Option value="USER_REPORTED">User báo cáo</Option>
              <Option value="SYSTEM_DETECTED">Hệ thống phát hiện</Option>
              <Option value="EMPLOYEE_REPORTED">Employee ghi nhận</Option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Khoảng thời gian</label>
            <RangePicker
              value={filters.dateRange}
              onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
              format="DD/MM/YYYY"
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <AdminSearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Tìm kiếm theo tiêu đề, mô tả, người báo cáo..."
      />

      {/* Table */}
      <AdminTable
        columns={columns}
        data={filteredIncidents}
        loading={loading}
        rowKey="id"
      />

      {/* Detail Modal */}
      {selectedIncident && (
        <AdminModal
          open={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Chi tiết báo cáo sự cố"
          width={800}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">ID</label>
                <p className="text-gray-900">#{selectedIncident.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Loại báo cáo</label>
                <div>{getReportTypeBadge(selectedIncident.reportType)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Mức độ</label>
                <div>{getSeverityBadge(selectedIncident.severity)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                <div>{getStatusBadge(selectedIncident.status)}</div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Tiêu đề</label>
              <p className="text-gray-900 font-medium">{selectedIncident.title || 'Không có tiêu đề'}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Mô tả</label>
              <p className="text-gray-900 whitespace-pre-wrap">{selectedIncident.description}</p>
            </div>

            {/* Equipment Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Thông tin thiết bị</label>
              <div className="grid grid-cols-2 gap-4">
                {selectedIncident.station && (
                  <div>
                    <p className="text-xs text-gray-500">Trạm sạc</p>
                    <p className="text-sm font-medium">{selectedIncident.station.stationName}</p>
                  </div>
                )}
                {selectedIncident.point && (
                  <div>
                    <p className="text-xs text-gray-500">Charging Point</p>
                    <p className="text-sm font-medium">{selectedIncident.point.pointName}</p>
                    <Tag color={selectedIncident.point.status?.toLowerCase() === 'maintenance' ? 'red' : 'green'}>
                      {selectedIncident.point.status?.toUpperCase()}
                    </Tag>
                  </div>
                )}
                {selectedIncident.charger && (
                  <div>
                    <p className="text-xs text-gray-500">Charger</p>
                    <p className="text-sm font-medium">#{selectedIncident.charger.id}</p>
                    <Tag color={selectedIncident.charger.status?.toLowerCase() === 'maintenance' ? 'red' : 'green'}>
                      {selectedIncident.charger.status?.toUpperCase()}
                    </Tag>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Người báo cáo</label>
                <p className="text-gray-900">{selectedIncident.reporterName || 'N/A'}</p>
                <p className="text-sm text-gray-500">{selectedIncident.reporterEmail}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Ngày báo cáo</label>
                <p className="text-gray-900">{dayjs(selectedIncident.reportDate).format('DD/MM/YYYY HH:mm')}</p>
              </div>
            </div>

            {selectedIncident.status?.toLowerCase() !== 'closed' && (
              <div className="border-t pt-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Cập nhật trạng thái</label>
                <div className="flex gap-2">
                  <Select
                    defaultValue={selectedIncident.status}
                    onChange={(value) => handleUpdateStatus(selectedIncident.id, value)}
                    className="w-full"
                  >
                    <Option value="pending">Chờ xử lý</Option>
                    <Option value="in_progress">Đang xử lý</Option>
                    <Option value="resolved">Đã giải quyết</Option>
                    <Option value="rejected">Từ chối</Option>
                  </Select>
                </div>
              </div>
            )}

            {selectedIncident.status?.toLowerCase() !== 'closed' && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>⚠️ Lưu ý:</strong> Khi đóng báo cáo, trạng thái của thiết bị sẽ được tự động khôi phục về <strong>active</strong> để có thể hoạt động trở lại.
                </p>
              </div>
            )}

            <div className="flex gap-2 justify-end border-t pt-4">
              {selectedIncident.status?.toLowerCase() !== 'closed' && (
                <Popconfirm
                  title="Đóng báo cáo sự cố"
                  description={
                    <div className="max-w-xs">
                      <p>Xác nhận đóng báo cáo này?</p>
                      <p className="mt-2 text-orange-600 font-medium">
                        ⚠️ Thiết bị sẽ được khôi phục về trạng thái active
                      </p>
                    </div>
                  }
                  onConfirm={() => handleCloseReport(selectedIncident.id, 'Resolved by admin')}
                  okText="Đóng báo cáo"
                  cancelText="Hủy"
                  okButtonProps={{ type: 'primary' }}
                >
                  <AntButton
                    type="primary"
                    icon={<CheckCircle size={16} />}
                  >
                    Đóng báo cáo & Khôi phục thiết bị
                  </AntButton>
                </Popconfirm>
              )}
              <Popconfirm
                title="Xóa báo cáo"
                description="Bạn có chắc muốn xóa báo cáo này?"
                onConfirm={() => handleDeleteReport(selectedIncident.id)}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <AntButton danger icon={<XCircle size={16} />}>
                  Xóa báo cáo
                </AntButton>
              </Popconfirm>
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
};

export default AdminIncidents;
