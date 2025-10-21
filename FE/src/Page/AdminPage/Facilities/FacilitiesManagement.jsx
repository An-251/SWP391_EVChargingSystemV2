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
    name: '',
    city: '',
    district: '',
    ward: '',
    streetAddress: ''
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
        name: facility.name || '',
        city: facility.city || '',
        district: facility.district || '',
        ward: facility.ward || '',
        streetAddress: facility.streetAddress || ''
      });
    } else {
      setEditMode(false);
      setCurrentFacilityId(null);
      setFormData({
        name: '',
        city: '',
        district: '',
        ward: '',
        streetAddress: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentFacilityId(null);
    setFormData({
      name: '',
      city: '',
      district: '',
      ward: '',
      streetAddress: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Get adminId from localStorage (FIXED: use 'currentUser' key to match authSlice)
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      message.error('Admin information not found. Please login again.');
      return;
    }
    
    const user = JSON.parse(userStr);
    // Try multiple possible ID fields (accountId, adminId, id)
    const adminId = user.adminId || user.accountId || user.id;
    
    if (!adminId) {
      message.error('Admin ID not found. Please login again.');
      return;
    }

    // Validate all required fields
    if (!formData.name.trim() || !formData.city.trim() || !formData.district.trim() || 
        !formData.ward.trim() || !formData.streetAddress.trim()) {
      message.error('Please fill in all required fields');
      return;
    }

    // Build request matching FacilityRequest.java
    const facilityData = {
      name: formData.name.trim(),
      city: formData.city.trim(),
      district: formData.district.trim(),
      ward: formData.ward.trim(),
      streetAddress: formData.streetAddress.trim(),
      adminId: adminId
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
                  <span className="text-xs font-medium text-gray-500">Name:</span>
                  <p className="text-sm font-semibold text-gray-800 mt-1">{facility.name || 'N/A'}</p>
                </div>
                
                <div>
                  <span className="text-xs font-medium text-gray-500">Full Address:</span>
                  <p className="text-sm text-gray-700 mt-1">
                    {facility.streetAddress}, {facility.ward}, {facility.district}, {facility.city}
                  </p>
                </div>
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
              {/* Facility Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facility Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter facility name (e.g., Parkson Mall)"
                  required
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter city (e.g., Ho Chi Minh City)"
                  required
                />
              </div>

              {/* District */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  District *
                </label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter district (e.g., District 1)"
                  required
                />
              </div>

              {/* Ward */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ward *
                </label>
                <input
                  type="text"
                  value={formData.ward}
                  onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter ward (e.g., Ben Nghe Ward)"
                  required
                />
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={formData.streetAddress}
                  onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter street address (e.g., 35A Le Loi Street)"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Complete address format: Street, Ward, District, City
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
