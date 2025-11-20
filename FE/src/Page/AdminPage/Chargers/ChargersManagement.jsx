import React, { useEffect, useState } from 'react';
import { Plug, Plus, Edit, Trash2, X, Save, Power, Activity } from 'lucide-react';
import { message, Modal, Switch, Tag, Tooltip } from 'antd';
import api from '../../../configs/config-axios';
import { CONNECTOR_TYPE_OPTIONS } from '../../../constants/connectorTypes';

const ChargersManagement = () => {
  const [chargers, setChargers] = useState([]);
  const [chargingPoints, setChargingPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    chargerCode: '',
    maxPower: '',
    connectorType: 'CCS2',
    status: 'ACTIVE',
    chargingPointId: null
  });

  useEffect(() => {
    fetchChargers();
    fetchChargingPoints();
  }, []);

  const fetchChargers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/chargers');
      // Handle different response structures
      const data = response.data?.content || response.data?.data || response.data || [];
      // Ensure data is always an array
      const chargersArray = Array.isArray(data) ? data : [];
      setChargers(chargersArray);
    } catch (error) {
      console.error('Error fetching chargers:', error);
      message.error('Failed to fetch chargers');
      setChargers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchChargingPoints = async () => {
    try {
      const response = await api.get('/charging-points');
      const data = response.data?.content || response.data?.data || response.data || [];
      const pointsArray = Array.isArray(data) ? data : [];
      setChargingPoints(pointsArray);
    } catch (error) {
      console.error('Error fetching charging points:', error);
      message.error('Failed to fetch charging points');
      setChargingPoints([]); // Set empty array on error
    }
  };

  const handleOpenModal = (charger = null) => {
    if (charger) {
      setEditMode(true);
      setFormData({
        id: charger.id,
        chargerCode: charger.chargerCode || '',
        maxPower: charger.maxPower || '',
        connectorType: charger.connectorType || 'CCS2',
        status: charger.status || 'ACTIVE',
        chargingPointId: charger.chargingPointId || null
      });
    } else {
      setEditMode(false);
      setFormData({
        chargerCode: '',
        maxPower: '',
        connectorType: 'CCS2',
        status: 'ACTIVE',
        chargingPointId: null
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.chargerCode || !formData.maxPower || !formData.connectorType || !formData.chargingPointId) {
      message.error('Please fill in all required fields');
      return;
    }

    const submitData = {
      chargerCode: formData.chargerCode,
      maxPower: parseFloat(formData.maxPower),
      connectorType: formData.connectorType,
      status: formData.status,
      chargingPointId: parseInt(formData.chargingPointId)
    };

    try {
      if (editMode) {
        await api.put(`/chargers/${formData.id}`, submitData);
        message.success('Charger updated successfully');
      } else {
        await api.post('/chargers', submitData);
        message.success('Charger created successfully');
      }
      handleCloseModal();
      fetchChargers();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Operation failed';
      message.error(errorMsg);
    }
  };

  const handleDelete = (id, code) => {
    Modal.confirm({
      title: 'Delete Charger',
      content: `Are you sure you want to delete charger "${code}"?`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await api.delete(`/chargers/${id}`);
          message.success('Charger deleted successfully');
          fetchChargers();
        } catch (error) {
          const errorMsg = error.response?.data?.message || 'Failed to delete charger';
          message.error(errorMsg);
        }
      }
    });
  };

  const handleToggleStatus = async (chargerId, currentStatus) => {
    if (currentStatus === 'USING') {
      message.error('Cannot change status while charger is in use');
      return;
    }
    
    const newStatus = currentStatus === 'ACTIVE' ? 'MAINTENANCE' : 'ACTIVE';
    
    try {
      await api.patch(`/chargers/${chargerId}/status`, { status: newStatus });
      message.success(`Charger status updated to ${newStatus}`);
      fetchChargers();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Failed to update status';
      message.error(errorMsg);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      'ACTIVE': { color: 'success', icon: '✓', text: 'Active', bgClass: 'bg-green-100 text-green-700' },
      'USING': { color: 'processing', icon: '⚡', text: 'In Use', bgClass: 'bg-blue-100 text-blue-700' },
      'MAINTENANCE': { color: 'warning', icon: '🔧', text: 'Maintenance', bgClass: 'bg-yellow-100 text-yellow-700' },
      'INACTIVE': { color: 'default', icon: '○', text: 'Inactive', bgClass: 'bg-gray-100 text-gray-700' }
    };
    return configs[status] || configs['INACTIVE'];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Chargers Management</h1>
          <p className="text-gray-600">Manage individual charging units and their status</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
        >
          <Plus size={20} />
          <span>Add Charger</span>
        </button>
      </div>

      {/* Chargers Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : chargers.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-md">
          <Plug className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Chargers Yet</h3>
          <p className="text-gray-500 mb-4">Start by adding your first charger</p>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus size={20} />
            <span>Add Charger</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chargers.map((charger) => {
            const statusConfig = getStatusConfig(charger.status);
            return (
              <div key={charger.id} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Plug className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{charger.chargerCode}</h3>
                      <p className="text-xs text-gray-500">ID: {charger.id}</p>
                    </div>
                  </div>
                  <Tag color={statusConfig.color} className="font-medium">
                    {statusConfig.icon} {statusConfig.text}
                  </Tag>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Connector:</span>
                    <span className="text-gray-800">{charger.chargingPoint?.connectorType || charger.connectorType || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Max Power:</span>
                    <span className="text-gray-800 font-semibold">{charger.maxPower} kW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Charging Point:</span>
                    <Tooltip title={`Point ID: ${charger.chargingPointId}`}>
                      <span className="text-blue-600 cursor-help truncate max-w-[150px]">
                        {charger.chargingPointName || charger.chargingPoint?.pointName || `Point #${charger.chargingPointId}`}
                      </span>
                    </Tooltip>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenModal(charger)}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Edit size={16} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(charger.id, charger.chargerCode)}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      disabled={charger.status === 'USING'}
                    >
                      <Trash2 size={16} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
<div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h2 className="text-xl font-bold">
                {editMode ? 'Edit Charger' : 'Create New Charger'}
              </h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-blue-700 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Charger Code * <span className="text-gray-500 text-xs">(Unique identifier)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.chargerCode}
                    onChange={(e) => setFormData({ ...formData, chargerCode: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., CHG-A1-001"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Power (kW) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.maxPower}
                    onChange={(e) => setFormData({ ...formData, maxPower: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Connector Type *</label>
                  <select
                    value={formData.connectorType}
                    onChange={(e) => setFormData({ ...formData, connectorType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {CONNECTOR_TYPE_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Charging Point *</label>
                  <select
                    value={formData.chargingPointId || ''}
                    onChange={(e) => setFormData({ ...formData, chargingPointId: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Charging Point</option>
                    {chargingPoints.map((point) => (
                      <option key={point.id} value={point.id}>
                        {point.pointName || `Point #${point.id}`} - {point.station?.stationName}
                      </option>
                    ))}
                  </select>
                </div>

                {editMode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="MAINTENANCE">Maintenance</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-md"
                >
                  <Save size={20} />
                  <span>{editMode ? 'Update' : 'Create'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChargersManagement;
