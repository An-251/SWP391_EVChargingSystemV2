import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from '../../configs/config-axios';

const EmployeeIncidentReports = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('ALL'); // ALL, PENDING, IN_PROGRESS, RESOLVED, CLOSED
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'MEDIUM',
    incidentType: 'EQUIPMENT_FAILURE',
    reportTarget: 'CHARGING_POINT', // ⭐ NEW: 'CHARGING_POINT' or 'CHARGER'
    chargingPointId: '',
    chargerId: '',
    stationId: '',
    reporterName: '',
    reporterEmail: '',
    reporterPhone: '',
    employeeNotes: ''
  });

  const employeeData = useSelector((state) => state.auth.user);
  const facilityId = employeeData?.facilityId;
  const employeeId = employeeData?.employeeId;

  const [stations, setStations] = useState([]);
  const [chargingPoints, setChargingPoints] = useState([]);
  const [chargers, setChargers] = useState([]);

  useEffect(() => {
    if (facilityId) {
      fetchStations();
      fetchIncidents();
    }
  }, [facilityId, filter]);

  const fetchStations = async () => {
    try {
      const response = await axios.get(`/stations/facility/${facilityId}`);
      setStations(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching stations:', error);
    }
  };

  const fetchChargingPoints = async (stationId) => {
    try {
      console.log('Fetching charging points for station:', stationId);
      const response = await axios.get(`/charging-points/station/${stationId}`);
      const points = response.data.data || response.data || [];
      console.log('Charging points received:', points);
      setChargingPoints(points);
    } catch (error) {
      console.error('Error fetching charging points:', error);
      console.error('Error details:', error.response?.data);
      setChargingPoints([]); // Clear on error
    }
  };

  const fetchChargers = async (chargingPointId) => {
    try {
      console.log('Fetching chargers for charging point:', chargingPointId);
      const response = await axios.get(`/chargers/charging-point/${chargingPointId}`);
      const chargersList = response.data.data || response.data || [];
      console.log('Chargers received:', chargersList);
      setChargers(chargersList);
    } catch (error) {
      console.error('Error fetching chargers:', error);
      console.error('Error details:', error.response?.data);
      setChargers([]); // Clear on error
    }
  };

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      // Fetch by employee or by station - adjust endpoint as needed
      const response = await axios.get(`/incident-reports/employee/${employeeId}`);
      
      // ⭐ FIX: Handle response properly - ensure it's always an array
      let data = response.data?.data || response.data || [];
      
      // Ensure data is an array
      if (!Array.isArray(data)) {
        console.error('Response is not an array:', data);
        data = [];
      }
      
      // Filter by status if needed
      if (filter !== 'ALL') {
        data = data.filter(incident => 
          incident.status?.toLowerCase() === filter.toLowerCase()
        );
      }
      
      console.log('Fetched incidents:', data);
      setIncidents(data);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      setIncidents([]); // ⭐ Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Cascade loading for station -> charging points -> chargers
    if (name === 'stationId') {
      setFormData(prev => ({ ...prev, [name]: value, chargingPointId: '', chargerId: '' }));
      setChargingPoints([]); // Clear old charging points
      setChargers([]); // Clear old chargers
      if (value) {
        fetchChargingPoints(value);
      }
    } else if (name === 'chargingPointId') {
      setFormData(prev => ({ ...prev, [name]: value, chargerId: '' }));
      setChargers([]); // Clear old chargers
      if (value) {
        fetchChargers(value);
      }
    } else {
      // For other fields, just update normally
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.chargingPointId || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate: Nếu reportTarget là CHARGER thì phải chọn charger
    if (formData.reportTarget === 'CHARGER' && !formData.chargerId) {
      alert('Please select a charger when reporting a charger issue');
      return;
    }

    try {
      const payload = {
        pointId: parseInt(formData.chargingPointId),
        chargerId: formData.chargerId ? parseInt(formData.chargerId) : null, // ⭐ NEW
        reportTarget: formData.reportTarget, // ⭐ NEW: 'CHARGING_POINT' or 'CHARGER'
        description: formData.description,
        severity: formData.severity,
        employeeId: employeeId,
        // Optional: reporter information if employee is recording on behalf of someone
        reporterName: formData.reporterName || null,
        reporterEmail: formData.reporterEmail || null,
        reporterPhone: formData.reporterPhone || null,
        employeeNotes: formData.employeeNotes || `Station: ${formData.stationId}, Charger: ${formData.chargerId || 'N/A'}`
      };

      console.log('Creating incident report with payload:', payload);

      const response = await axios.post('/incident-reports/employee-report', payload);
      
      if (response.status === 201) {
        alert('Incident report created successfully!');
        setShowCreateModal(false);
        setFormData({
          title: '',
          description: '',
          severity: 'MEDIUM',
          incidentType: 'EQUIPMENT_FAILURE',
          reportTarget: 'CHARGING_POINT',
          chargingPointId: '',
          chargerId: '',
          stationId: '',
          reporterName: '',
          reporterEmail: '',
          reporterPhone: '',
          employeeNotes: ''
        });
        fetchIncidents();
      }
    } catch (error) {
      console.error('Error creating incident report:', error);
      console.error('Error response:', error.response?.data);
      alert(`Failed to create incident report: ${error.response?.data?.message || error.message}`);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-300';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">🚨 Incident Reports</h1>
          <p className="text-gray-600">Report and track facility incidents</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Create New Report
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {[
          { key: 'ALL', label: 'Tất cả' },
          { key: 'pending', label: 'Chờ xử lý' },
          { key: 'in_progress', label: 'Đang xử lý' },
          { key: 'resolved', label: 'Đã giải quyết' },
          { key: 'closed', label: 'Đã đóng' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 font-medium transition-colors ${
              filter === tab.key
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Incidents List */}
      {incidents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No incidents found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {incidents.map((incident) => (
            <div
              key={incident.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4"
              style={{ borderLeftColor: getSeverityColor(incident.severity).includes('red') ? '#ef4444' : 
                getSeverityColor(incident.severity).includes('orange') ? '#f97316' :
                getSeverityColor(incident.severity).includes('yellow') ? '#eab308' : '#22c55e' }}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getSeverityColor(incident.severity)}`}>
                    {incident.severity}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(incident.status)}`}>
                    {incident.status}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(incident.reportDate || incident.createdAt).toLocaleString()}
                </span>
              </div>

              <h3 className="text-xl font-semibold mb-2">{incident.title}</h3>
              <p className="text-gray-700 mb-4">{incident.description}</p>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <p><strong>Report Type:</strong> {incident.reportType}</p>
                  <p><strong>Point ID:</strong> #{incident.point?.id || 'N/A'}</p>
                </div>
                <div>
                  <p><strong>Station:</strong> {incident.station?.stationName || 'N/A'}</p>
                  {incident.charger && <p><strong>Charger:</strong> #{incident.charger.id}</p>}
                </div>
              </div>

              {incident.resolutionNotes && (
                <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
                  <p className="text-sm font-medium text-green-800">Resolution:</p>
                  <p className="text-sm text-gray-700">{incident.resolutionNotes}</p>
                  {incident.resolvedDate && (
                    <p className="text-xs text-gray-500 mt-1">
                      Resolved: {new Date(incident.resolvedDate).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Incident Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Create Incident Report</h2>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Report Target - NEW */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report Issue For <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="reportTarget"
                        value="CHARGING_POINT"
                        checked={formData.reportTarget === 'CHARGING_POINT'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm">Charging Point (toàn bộ trạm)</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="reportTarget"
                        value="CHARGER"
                        checked={formData.reportTarget === 'CHARGER'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm">Specific Charger (một sạc cụ thể)</span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.reportTarget === 'CHARGING_POINT' 
                      ? '⚠️ Sẽ tạm ngưng toàn bộ Charging Point và tất cả Chargers' 
                      : '✅ Chỉ tạm ngưng Charger được chọn, các Charger khác vẫn hoạt động'}
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Severity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Severity <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="severity"
                    value={formData.severity}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>

                {/* Station */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Station <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="stationId"
                    value={formData.stationId}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a station</option>
                    {stations.map((station) => (
                      <option key={station.id} value={station.id}>
                        {station.stationName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Charging Point */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Charging Point <span className="text-red-500">*</span>
                    {chargingPoints.length > 0 && (
                      <span className="ml-2 text-xs text-green-600">
                        ({chargingPoints.length} available)
                      </span>
                    )}
                  </label>
                  <select
                    name="chargingPointId"
                    value={formData.chargingPointId}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={!formData.stationId}
                    required
                  >
                    <option value="">
                      {!formData.stationId 
                        ? 'Please select a station first' 
                        : chargingPoints.length === 0 
                          ? 'No charging points available'
                          : 'Select a charging point'}
                    </option>
                    {chargingPoints.map((point) => (
                      <option key={point.id} value={point.id}>
                        {point.pointName || `Point #${point.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Charger (Conditional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Charger {formData.reportTarget === 'CHARGER' && <span className="text-red-500">*</span>}
                    {chargers.length > 0 && (
                      <span className="ml-2 text-xs text-green-600">
                        ({chargers.length} available)
                      </span>
                    )}
                  </label>
                  <select
                    name="chargerId"
                    value={formData.chargerId}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={!formData.chargingPointId || formData.reportTarget === 'CHARGING_POINT'}
                    required={formData.reportTarget === 'CHARGER'}
                  >
                    <option value="">
                      {formData.reportTarget === 'CHARGING_POINT' 
                        ? 'Not required for Charging Point issues' 
                        : !formData.chargingPointId
                          ? 'Please select a charging point first'
                          : chargers.length === 0
                            ? 'No chargers available'
                            : 'Select a charger'}
                    </option>
                    {chargers.map((charger) => (
                      <option key={charger.id} value={charger.id}>
                        Charger #{charger.chargerCode || charger.id} - {charger.status}
                      </option>
                    ))}
                  </select>
                  {formData.reportTarget === 'CHARGING_POINT' && (
                    <p className="text-xs text-gray-500 mt-1">
                      ℹ️ Charging Point issues affect all chargers automatically
                    </p>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Create Report
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeIncidentReports;
