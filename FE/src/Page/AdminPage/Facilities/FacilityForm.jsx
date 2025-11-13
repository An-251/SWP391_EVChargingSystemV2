/**
 * Facility Form Component
 * Form for create/edit facility
 */

import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createFacility, updateFacility } from '../../../redux/admin/adminSlice';

export default function FacilityForm({ facility, onSuccess, onCancel }) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    streetAddress: '',
    ward: '',
    district: '',
    city: '',
    status: 'active',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (facility) {
      setFormData({
        name: facility.name || '',
        streetAddress: facility.streetAddress || facility.street_address || '',
        ward: facility.ward || '',
        district: facility.district || '',
        city: facility.city || '',
        status: facility.status || 'active',
      });
    }
  }, [facility]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Facility name is required';
    if (!formData.streetAddress.trim()) newErrors.streetAddress = 'Street address is required';
    if (!formData.ward.trim()) newErrors.ward = 'Ward is required';
    if (!formData.district.trim()) newErrors.district = 'District is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      if (facility) {
        // Update facility info (without status)
        const { status, ...facilityDataWithoutStatus } = formData;
        await dispatch(updateFacility({ facilityId: facility.id, facilityData: facilityDataWithoutStatus })).unwrap();
        
        // Update status separately if changed
        if (status && status !== facility.status) {
          try {
            const api = (await import('../../../configs/config-axios')).default;
            await api.post(`/status/facility/${facility.id}`, { status });
          } catch (statusError) {
            // Extract error message from backend response
            const errorMessage = statusError.response?.data?.message || 
                                statusError.response?.data?.error || 
                                'Cannot update status. Please check if facility has active stations.';
            
            // Show error notification
            alert(`❌ Status Update Failed\n\n${errorMessage}`);
            throw statusError; // Re-throw to prevent onSuccess
          }
        }
      } else {
        await dispatch(createFacility(formData)).unwrap();
      }
      onSuccess();
    } catch (error) {
      // Error handled by Redux
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Facility Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="E.g.: Vincom Dong Khoi Charging Station"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>

      {/* City */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          City <span className="text-red-500">*</span>
        </label>
        <select
          name="city"
          value={formData.city}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.city ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">-- Select city --</option>
          <option value="Ho Chi Minh">Ho Chi Minh</option>
          <option value="Ha Noi">Ha Noi</option>
          <option value="Da Nang">Da Nang</option>
          <option value="Can Tho">Can Tho</option>
          <option value="Hai Phong">Hai Phong</option>
          <option value="Nha Trang">Nha Trang</option>
          <option value="Vung Tau">Vung Tau</option>
          <option value="Da Lat">Da Lat</option>
        </select>
        {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
      </div>

          {/* Street Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Street Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="streetAddress"
              value={formData.streetAddress}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.streetAddress ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter street address"
            />
            {errors.streetAddress && (
              <p className="mt-1 text-sm text-red-600">{errors.streetAddress}</p>
            )}
          </div>

          {/* Ward */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ward <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="ward"
              value={formData.ward}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.ward ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter ward"
            />
            {errors.ward && (
              <p className="mt-1 text-sm text-red-600">{errors.ward}</p>
            )}
          </div>

          {/* District */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              District <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.district ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter district"
            />
            {errors.district && (
              <p className="mt-1 text-sm text-red-600">{errors.district}</p>
            )}
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.city ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter city"
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city}</p>
            )}
          </div>      

      {/* Status (only for Edit mode) */}
      {facility && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      )}

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {submitting && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
          {facility ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}
