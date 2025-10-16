import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchFacilities,
  createFacility,
  updateFacility,
  deleteFacility,
  clearSuccess,
  clearError
} from '../../../redux/admin/adminSlice';
import { Building2, Plus, Edit, Trash2, X, Save, MapPin } from 'lucide-react';
import { message, Modal } from 'antd';

const FacilitiesManagement = () => {
  const dispatch = useDispatch();
  const { facilities, loading, successMessage, error } = useSelector((state) => state.admin);
  
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    address: '',
    description: ''
  });
  const [currentFacilityId, setCurrentFacilityId] = useState(null);

  // Fetch facilities on mount
  useEffect(() => {
    dispatch(fetchFacilities());
  }, [dispatch]);

  // Show success/error messages
  useEffect(() => {
    if (successMessage) {
      message.success(successMessage);
      dispatch(clearSuccess());
    }
    if (error) {
      message.error(error);
      dispatch(clearError());
    }
  }, [successMessage, error, dispatch]);

  const handleOpenModal = (facility = null) => {
    if (facility) {
      setEditMode(true);
      setCurrentFacilityId(facility.id);
      setFormData({
        address: facility.address || '',
        description: facility.description || ''
      });
    } else {
      setEditMode(false);
      setCurrentFacilityId(null);
      setFormData({
        address: '',
        description: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentFacilityId(null);
    setFormData({
      address: '',
      description: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.address.trim()) {
      message.error('Please enter facility address');
      return;
    }

    const facilityData = {
      address: formData.address.trim(),
      description: formData.description.trim()
    };

    if (editMode && currentFacilityId) {
      await dispatch(updateFacility({ id: currentFacilityId, data: facilityData }));
    } else {
      await dispatch(createFacility(facilityData));
    }

    handleCloseModal();
    dispatch(fetchFacilities());
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete Facility',
      content: 'Are you sure you want to delete this facility? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        await dispatch(deleteFacility(id));
        dispatch(fetchFacilities());
      }
    });
  };

  // Ensure facilities is array
  const facilitiesList = Array.isArray(facilities) ? facilities : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Facilities Management</h1>
          <p className="text-gray-600">Manage facilities that can be associated with charging stations</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
        >
          <Plus size={20} />
          <span>Add Facility</span>
        </button>
      </div>

      {/* Facilities Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilitiesList.map((facility) => (
            <div
              key={facility.id}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="text-blue-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">Facility #{facility.id}</h3>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <MapPin size={12} className="mr-1" />
                      <span>Location</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <span className="text-xs font-medium text-gray-500">Address:</span>
                  <p className="text-sm text-gray-700 mt-1">{facility.address || 'N/A'}</p>
                </div>
                
                {facility.description && (
                  <div>
                    <span className="text-xs font-medium text-gray-500">Description:</span>
                    <p className="text-sm text-gray-600 mt-1">{facility.description}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleOpenModal(facility)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Edit size={16} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(facility.id)}
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

      {facilitiesList.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <Building2 className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No facilities yet</h3>
          <p className="text-gray-500 mb-4">Create your first facility to associate with charging stations</p>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus size={20} />
            <span>Add First Facility</span>
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                {editMode ? 'Edit Facility' : 'Create New Facility'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Address Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Enter facility address..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Full address of the facility location
                </p>
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                  placeholder="Enter facility description, amenities, parking info, etc..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Additional information about the facility
                </p>
              </div>

              {/* Actions */}
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
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md disabled:opacity-50"
                >
                  <Save size={18} />
                  <span>{editMode ? 'Update' : 'Create'} Facility</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilitiesManagement;
