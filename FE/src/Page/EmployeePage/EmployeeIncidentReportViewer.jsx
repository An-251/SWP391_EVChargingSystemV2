import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, Table, Tag, Badge, Tabs, Button, Modal, Select, Input } from 'antd';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Eye,
  FileText,
  Wrench,
  Zap
} from 'lucide-react';
import axios from '../../configs/config-axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { TextArea } = Input;

const EmployeeIncidentReportViewer = () => {
  const [loading, setLoading] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');
  
  const user = useSelector((state) => state.auth.user);
  const facilityId = user?.facilityId;

  useEffect(() => {
    if (facilityId) {
      fetchIncidents();
    }
  }, [facilityId, activeTab]);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      let endpoint = '';
      
      // Fetch based on active tab
      if (activeTab === 'ALL') {
        endpoint = `/incident-reports/employee/${user.employeeId}`;
      } else {
        endpoint = `/incident-reports/employee/${user.employeeId}`;
      }
      
      const response = await axios.get(endpoint);
      let data = response.data || [];
      
      // Filter by status if not ALL
      if (activeTab !== 'ALL') {
        data = data.filter(incident => incident.status === activeTab);
      }
      
      setIncidents(data);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (incident) => {
    setSelectedIncident(incident);
    setDetailModalVisible(true);
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'LOW': 'blue',
      'MEDIUM': 'orange',
      'HIGH': 'red',
      'CRITICAL': 'red'
    };
    return colors[severity] || 'default';
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'orange',
      'IN_PROGRESS': 'blue',
      'RESOLVED': 'green',
      'CLOSED': 'gray'
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock size={14} />;
      case 'IN_PROGRESS':
        return <Wrench size={14} />;
      case 'RESOLVED':
        return <CheckCircle size={14} />;
      case 'CLOSED':
        return <FileText size={14} />;
      default:
        return <AlertTriangle size={14} />;
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id) => <span className="font-mono">#{id}</span>,
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: 'Trạm',
      key: 'station',
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.station?.stationName || 'N/A'}</div>
          <div className="text-xs text-gray-500">{record.chargingPoint?.pointName || ''}</div>
        </div>
      ),
    },
    {
      title: 'Mức độ',
      dataIndex: 'severity',
      key: 'severity',
      width: 120,
      render: (severity) => (
        <Tag color={getSeverityColor(severity)}>
          <AlertTriangle size={12} style={{ marginRight: 4, display: 'inline' }} />
          {severity}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date) => (
        <div className="text-sm">
          <div>{dayjs(date).format('DD/MM/YYYY')}</div>
          <div className="text-xs text-gray-500">{dayjs(date).format('HH:mm')}</div>
        </div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Button
          type="link"
          icon={<Eye size={16} />}
          onClick={() => handleViewDetail(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'ALL',
      label: (
        <span className="flex items-center gap-2">
          <FileText size={16} />
          Tất cả ({incidents.length})
        </span>
      ),
    },
    {
      key: 'PENDING',
      label: (
        <span className="flex items-center gap-2">
          <Clock size={16} />
          Chờ xử lý ({incidents.filter(i => i.status === 'PENDING').length})
        </span>
      ),
    },
    {
      key: 'IN_PROGRESS',
      label: (
        <span className="flex items-center gap-2">
          <Wrench size={16} />
          Đang xử lý ({incidents.filter(i => i.status === 'IN_PROGRESS').length})
        </span>
      ),
    },
    {
      key: 'RESOLVED',
      label: (
        <span className="flex items-center gap-2">
          <CheckCircle size={16} />
          Đã giải quyết ({incidents.filter(i => i.status === 'RESOLVED').length})
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Báo cáo Sự cố</h1>
          <p className="text-gray-500 mt-1">
            Cơ sở: <span className="font-medium">{user?.facilityName || 'Tất cả'}</span>
          </p>
        </div>
        <Badge status="processing" text={`${incidents.length} báo cáo`} />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tổng số</p>
              <p className="text-2xl font-bold">{incidents.length}</p>
            </div>
            <FileText size={32} className="text-blue-500" />
          </div>
        </Card>
        
        <Card className="shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Chờ xử lý</p>
              <p className="text-2xl font-bold text-orange-600">
                {incidents.filter(i => i.status === 'PENDING').length}
              </p>
            </div>
            <Clock size={32} className="text-orange-500" />
          </div>
        </Card>
        
        <Card className="shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Đang xử lý</p>
              <p className="text-2xl font-bold text-blue-600">
                {incidents.filter(i => i.status === 'IN_PROGRESS').length}
              </p>
            </div>
            <Wrench size={32} className="text-blue-500" />
          </div>
        </Card>
        
        <Card className="shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Đã giải quyết</p>
              <p className="text-2xl font-bold text-green-600">
                {incidents.filter(i => i.status === 'RESOLVED').length}
              </p>
            </div>
            <CheckCircle size={32} className="text-green-500" />
          </div>
        </Card>
      </div>

      {/* Tabs & Table */}
      <Card className="shadow-sm">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems.map(item => ({
            ...item,
            children: (
              <Table
                columns={columns}
                dataSource={activeTab === 'ALL' ? incidents : incidents.filter(i => i.status === activeTab)}
                rowKey={(record) => record.id || `incident-${Math.random()}`}
                loading={loading}
                pagination={{ pageSize: 10 }}
                size="small"
              />
            ),
          }))}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} className="text-orange-500" />
            <span>Chi tiết Báo cáo Sự cố #{selectedIncident?.id}</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        {selectedIncident && (
          <div className="space-y-4">
            {/* Status & Severity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Trạng thái</p>
                <Tag color={getStatusColor(selectedIncident.status)} icon={getStatusIcon(selectedIncident.status)} className="mt-1">
                  {selectedIncident.status}
                </Tag>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mức độ</p>
                <Tag color={getSeverityColor(selectedIncident.severity)} className="mt-1">
                  <AlertTriangle size={12} style={{ marginRight: 4, display: 'inline' }} />
                  {selectedIncident.severity}
                </Tag>
              </div>
            </div>

            {/* Title */}
            <div>
              <p className="text-sm text-gray-500">Tiêu đề</p>
              <p className="text-lg font-medium">{selectedIncident.title}</p>
            </div>

            {/* Description */}
            <div>
              <p className="text-sm text-gray-500">Mô tả</p>
              <div className="mt-1 p-3 bg-gray-50 rounded border">
                {selectedIncident.description}
              </div>
            </div>

            {/* Location Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Trạm sạc</p>
                <p className="font-medium">{selectedIncident.station?.stationName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Điểm sạc</p>
                <p className="font-medium">{selectedIncident.chargingPoint?.pointName || 'N/A'}</p>
              </div>
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Ngày tạo</p>
                <p>{dayjs(selectedIncident.createdAt).format('DD/MM/YYYY HH:mm')}</p>
              </div>
              {selectedIncident.resolvedAt && (
                <div>
                  <p className="text-sm text-gray-500">Ngày giải quyết</p>
                  <p>{dayjs(selectedIncident.resolvedAt).format('DD/MM/YYYY HH:mm')}</p>
                </div>
              )}
            </div>

            {/* Resolution Notes */}
            {selectedIncident.resolutionNotes && (
              <div>
                <p className="text-sm text-gray-500">Ghi chú giải quyết</p>
                <div className="mt-1 p-3 bg-green-50 rounded border border-green-200">
                  {selectedIncident.resolutionNotes}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EmployeeIncidentReportViewer;
