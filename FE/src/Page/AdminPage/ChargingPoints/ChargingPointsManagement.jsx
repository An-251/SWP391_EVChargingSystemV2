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
import { message, Modal } from 'antd';

const ChargingPointsManagement = () => {
  const dispatch = useDispatch();
  const { chargingPoints, stations, loading, successMessage, error } = useSelector((state) => state.admin);
  
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    pointName: '',
    connectorType: 'Type 2',
    powerOutput: '',
    status: 'AVAILABLE',
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
      handleCloseModal();
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
        connectorType: point.connectorType || 'Type 2',
        powerOutput: point.powerOutput || '',
        status: point.status || 'AVAILABLE',
        station: point.station?.id || null
      });
    } else {
      setEditMode(false);
      setFormData({
        pointName: '',
        connectorType: 'Type 2',
        powerOutput: '',
        status: 'AVAILABLE',
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
    
    const submitData = {
      pointName: formData.pointName,
      connectorType: formData.connectorType,
      powerOutput: formData.powerOutput,
      status: formData.status,
      station: formData.station ? { id: formData.station } : null
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

  const getStatusColor = (status) => {
    const colors = {
      'AVAILABLE': 'bg-green-100 text-green-700',
      'OCCUPIED': 'bg-yellow-100 text-yellow-700',
      'MAINTENANCE': 'bg-red-100 text-red-700',
      'OFFLINE': 'bg-gray-100 text-gray-700'
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
            <div key={point.id} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Zap className="text-yellow-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{point.pointName}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(point.status)}`}>
                      {point.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div><span className="font-medium">Connector:</span> {point.connectorType}</div>
                <div><span className="font-medium">Power:</span> {point.powerOutput} kW</div>
                <div><span className="font-medium">Station:</span> {point.station?.stationName || 'N/A'}</div>
              </div>

              <div className="flex items-center space-x-2">
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
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Connector Type</label>
                  <select
                    value={formData.connectorType}
                    onChange={(e) => setFormData({ ...formData, connectorType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="Type 2">Type 2</option>
                    <option value="CCS">CCS</option>
                    <option value="CHAdeMO">CHAdeMO</option>
                    <option value="Tesla">Tesla</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Power Output (kW)</label>
                  <input
                    type="text"
                    value={formData.powerOutput}
                    onChange={(e) => setFormData({ ...formData, powerOutput: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="OCCUPIED">Occupied</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="OFFLINE">Offline</option>
                  </select>
                </div>

                <div className="md:col-span-2">
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
