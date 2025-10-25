/**
 * Station Form Component
 * Form for creating/editing stations
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createStation, updateStation, fetchFacilities } from '../../../redux/admin/adminSlice';
import MapPicker from './MapPicker';

export default function StationForm({ station, onSuccess, onCancel }) {
  const dispatch = useDispatch();
  const facilities = useSelector((state) => state.admin.facilities.list);

  const [formData, setFormData] = useState({
    stationName: '',
    facilityId: '',
    latitude: '',
    longitude: '',
    status: 'active',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchFacilities({ page: 0, size: 100 }));
  }, [dispatch]);

  useEffect(() => {
    if (station) {
      setFormData({
        stationName: station.stationName || station.name || '',
        facilityId: station.facilityId || station.facility?.id || '',
        latitude: station.latitude || '',
        longitude: station.longitude || '',
        status: station.status || 'active',
      });
    }
  }, [station]);

  const validate = () => {
    const newErrors = {};
    if (!formData.stationName.trim()) newErrors.stationName = 'Station name is required';
    if (!formData.facilityId) newErrors.facilityId = 'Facility is required';
    if (formData.latitude && isNaN(formData.latitude)) newErrors.latitude = 'Latitude must be a number';
    if (formData.longitude && isNaN(formData.longitude)) newErrors.longitude = 'Longitude must be a number';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleMapPositionChange = ({ latitude, longitude }) => {
    setFormData((prev) => ({
      ...prev,
      latitude: latitude.toString(),
      longitude: longitude.toString(),
    }));
    // Clear any existing coordinate errors
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.latitude;
      delete newErrors.longitude;
      return newErrors;
    });
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
      const submitData = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      };

      if (station) {
        // Update station info (without status)
        const { status, ...stationDataWithoutStatus } = submitData;
        await dispatch(updateStation({ stationId: station.id, stationData: stationDataWithoutStatus })).unwrap();
        
        // Update status separately if changed
        if (status && status !== station.status) {
          try {
            const api = (await import('../../../configs/config-axios')).default;
            await api.post(`/status/station/${station.id}`, { status });
          } catch (statusError) {
            // Extract error message from backend response
            const errorMessage = statusError.response?.data?.message || 
                                statusError.response?.data?.error || 
                                'Cannot update status. The station or its charging points may be in use.';
            
            // Show error notification
            alert(`❌ Status Update Failed\n\n${errorMessage}`);
            throw statusError; // Re-throw to prevent onSuccess
          }
        }
      } else {
        await dispatch(createStation(submitData)).unwrap();
      }
      onSuccess();
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Station Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="stationName"
          value={formData.stationName}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.stationName ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="E.g.: Vincom Charging Station 01"
        />
        {errors.stationName && <p className="text-red-500 text-sm mt-1">{errors.stationName}</p>}
      </div>

      {/* Facility */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Facility <span className="text-red-500">*</span>
        </label>
        <select
          name="facilityId"
          value={formData.facilityId}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.facilityId ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">-- Select facility --</option>
          {facilities.map((facility) => (
            <option key={facility.id} value={facility.id}>
              {facility.name} ({facility.city})
            </option>
          ))}
        </select>
        {errors.facilityId && <p className="text-red-500 text-sm mt-1">{errors.facilityId}</p>}
      </div>

      {/* Map Picker for Coordinates */}
      <div>
        <MapPicker
          latitude={formData.latitude ? parseFloat(formData.latitude) : null}
          longitude={formData.longitude ? parseFloat(formData.longitude) : null}
          onChange={handleMapPositionChange}
        />
      </div>

      {/* Manual Coordinates (Read-only display) */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
          <input
            type="text"
            name="latitude"
            value={formData.latitude}
            readOnly
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
            placeholder="Select on map"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
          <input
            type="text"
            name="longitude"
            value={formData.longitude}
            readOnly
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
            placeholder="Select on map"
          />
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status <span className="text-red-500">*</span>
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="active">Active</option>
          <option value="using">Using</option>
          <option value="inactive">Inactive</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Note: Station auto-updates to "Using" when all points are in use
        </p>
      </div>

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
          {station ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}
