import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchChargingPoints,
  fetchStations,
  createChargingPoint,
  updateChargingPoint,
  deleteChargingPoint,
  clearSuccess,
  clearError
} from '../../../redux/admin/adminSlice';
import { Zap, Plus, Edit, Trash2, X, Save } from 'lucide-react';
import { message, Modal, Switch } from 'antd';
import api from '../../../configs/config-axios';

const ChargingPointsManagement = () => {
  const dispatch = useDispatch();
  const { chargingPoints, stations, loading, successMessage, error } = useSelector((state) => state.admin);
  
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    pointName: '',
    pricePerKwh: '',
    station: null
  });

  useEffect(() => {
    dispatch(fetchChargingPoints());
    dispatch(fetchStations());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      message.success(successMessage);
      dispatch(clearSuccess());
      setShowModal(false);
      setEditMode(false);
    }
    if (error) {
      message.error(error);
      dispatch(clearError());
    }
  }, [successMessage, error, dispatch]);

  const handleOpenModal = (point = null) => {
    if (point) {
      setEditMode(true);
      setFormData({
        id: point.id,
        pointName: point.pointName || '',
        pricePerKwh: point.pricePerKwh || '',
        station: point.stationId || null
      });
    } else {
      setEditMode(false);
      setFormData({
        pointName: '',
        pricePerKwh: '',
        station: null
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
    
    // Validate required fields
    if (!formData.pointName || !formData.pricePerKwh || !formData.station) {
      message.error('Please fill in all required fields');
      return;
    }

    // Build request matching ChargingPointRequest.java
    const submitData = {
      pointName: formData.pointName,
      pricePerKwh: parseFloat(formData.pricePerKwh),  // Convert to BigDecimal
      stationId: formData.station  // ✅ Flat stationId, not nested object
    };

    if (editMode) {
      dispatch(updateChargingPoint({ id: formData.id, data: submitData }));
    } else {
      dispatch(createChargingPoint(submitData));
    }
  };

  const handleDelete = (id, name) => {
    Modal.confirm({
      title: 'Delete Charging Point',
      content: `Are you sure you want to delete "${name}"?`,
      okText: 'Delete',
      okType: 'danger',
      onOk: () => {
        dispatch(deleteChargingPoint(id));
      }
    });
  };

  const handleToggleStatus = async (pointId, currentStatus) => {
    // Point can only be toggled between ACTIVE/INACTIVE by admin
    // BE uses: ACTIVE, INACTIVE, USING
    if (currentStatus === 'USING') {
      message.error('Cannot change status while charging point is in use');
      return;
    }
    
    // Toggle between ACTIVE and INACTIVE
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    
    try {
      await api.post(`/status/point/${pointId}`, { status: newStatus });
      message.success(`Charging point status updated to ${newStatus}`);
      dispatch(fetchChargingPoints({}));
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Failed to update charging point status';
      message.error(errorMsg);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'ACTIVE': 'bg-green-100 text-green-700',
      'INACTIVE': 'bg-gray-100 text-gray-700',
      'USING': 'bg-blue-100 text-blue-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Charging Points Management</h1>
          <p className="text-gray-600">Manage charging points and connectors</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md"
        >
          <Plus size={20} />
          <span>Add Charging Point</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chargingPoints.map((point) => (
            <div 
              key={point.id} 
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow select-none"
              onClick={(e) => {
                // Prevent any parent handlers from triggering
                e.stopPropagation();
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Zap className="text-yellow-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{point.pointName}</h3>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(point.status)}`}>
                  {point.status === 'ACTIVE' ? '● Active' : 
                   point.status === 'INACTIVE' ? '● Inactive' :
                   point.status === 'USING' ? '● Using' :
                   point.status}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div><span className="font-medium">Price:</span> {point.pricePerKwh} VNĐ/kWh</div>
                <div><span className="font-medium">Station:</span> {point.stationName || 'N/A'}</div>
                <div><span className="font-medium">Chargers:</span> {point.chargers?.length || 0} units</div>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Status</span>
                  <div onClick={(e) => e.stopPropagation()}>
                    <Switch
                      checked={point.status === 'ACTIVE'}
                      onChange={() => handleToggleStatus(point.id, point.status)}
                      checkedChildren="Active"
                      unCheckedChildren="Inactive"
                      disabled={point.status === 'USING'}
                    />
                  </div>
                </div>
                {point.status === 'USING' && (
                  <p className="text-xs text-blue-600">⚠ Point is currently in use - cannot change status</p>
                )}
                <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleOpenModal(point)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Edit size={16} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(point.id, point.pointName)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0  bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                {editMode ? 'Edit Charging Point' : 'Create New Charging Point'}
              </h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Point Name *</label>
                  <input
                    type="text"
                    value={formData.pointName}
                    onChange={(e) => setFormData({ ...formData, pointName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price per kWh (VNĐ) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.pricePerKwh}
                    onChange={(e) => setFormData({ ...formData, pricePerKwh: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., 3500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Station *</label>
                  <select
                    value={formData.station || ''}
                    onChange={(e) => setFormData({ ...formData, station: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">Select Station</option>
                    {stations.map((station) => (
                      <option key={station.id} value={station.id}>
                        {station.stationName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 shadow-md disabled:opacity-50"
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

export default ChargingPointsManagement;
