/**
 * Charging Point Form Component
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createChargingPoint, updateChargingPoint, fetchStations } from '../../../redux/admin/adminSlice';

export default function ChargingPointForm({ chargingPoint, onSuccess, onCancel }) {
  const dispatch = useDispatch();
  const stations = useSelector((state) => state.admin.stations.list);
  const stationsLoading = useSelector((state) => state.admin.stations.loading);

  const [formData, setFormData] = useState({
    pointName: '',
    stationId: '',
    connectorType: 'CCS',
    maxPower: '',
    pricePerKwh: '',
    status: 'active',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchStations({ page: 0, size: 100 }));
  }, [dispatch]);

  useEffect(() => {
    if (chargingPoint) {
      setFormData({
        pointName: chargingPoint.pointName || chargingPoint.name || '',
        stationId: chargingPoint.stationId || chargingPoint.station?.id || '',
        connectorType: chargingPoint.connectorType || 'CCS',
        maxPower: chargingPoint.maxPower || chargingPoint.power || '',
        pricePerKwh: chargingPoint.pricePerKwh || '',
        status: chargingPoint.status || 'active',
      });
    }
  }, [chargingPoint]);

  const validate = () => {
    const newErrors = {};
    if (!formData.pointName.trim()) newErrors.pointName = 'Charging point name is required';
    if (!formData.stationId) newErrors.stationId = 'Station is required';
    if (!formData.maxPower || formData.maxPower <= 0) newErrors.maxPower = 'Max power must be greater than 0';
    if (!formData.pricePerKwh || formData.pricePerKwh <= 0) newErrors.pricePerKwh = 'Price must be greater than 0';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
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
        maxPower: parseFloat(formData.maxPower), 
        pricePerKwh: parseFloat(formData.pricePerKwh) 
      };
      if (chargingPoint) {
        // Update charging point info (without status)
        const { status, ...pointDataWithoutStatus } = submitData;
        await dispatch(updateChargingPoint({ chargingPointId: chargingPoint.id, chargingPointData: pointDataWithoutStatus })).unwrap();
        
        // Update status separately if changed
        if (status && status !== chargingPoint.status) {
          try {
            const api = (await import('../../../configs/config-axios')).default;
            await api.post(`/status/point/${chargingPoint.id}`, { status });
          } catch (statusError) {
            // Extract error message from backend response
            const errorMessage = statusError.response?.data?.message || 
                                statusError.response?.data?.error || 
                                'Cannot update status. This charging point may currently be in use.';
            
            // Show error notification
            alert(`❌ Status Update Failed\n\n${errorMessage}`);
            throw statusError; // Re-throw to prevent onSuccess
          }
        }
      } else {
        await dispatch(createChargingPoint(submitData)).unwrap();
      }
      onSuccess();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Charging Point Name <span className="text-red-500">*</span></label>
        <input type="text" name="pointName" value={formData.pointName} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg ${errors.pointName ? 'border-red-500' : 'border-gray-300'}`} placeholder="E.g.: CP-001" />
        {errors.pointName && <p className="text-red-500 text-sm mt-1">{errors.pointName}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Station <span className="text-red-500">*</span></label>
        <select name="stationId" value={formData.stationId} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg ${errors.stationId ? 'border-red-500' : 'border-gray-300'}`} disabled={stationsLoading}>
          <option value="">
            {stationsLoading ? 'Loading stations...' : '-- Select station --'}
          </option>
          {Array.isArray(stations) && stations.map((station) => (
            <option key={station.stationId || station.id} value={station.stationId || station.id}>
              {station.stationName || station.name}
            </option>
          ))}
        </select>
        {errors.stationId && <p className="text-red-500 text-sm mt-1">{errors.stationId}</p>}
        {!stationsLoading && (!Array.isArray(stations) || stations.length === 0) && (
          <p className="text-amber-600 text-sm mt-1">No stations available. Please create a station first.</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Connector Type</label>
        <select name="connectorType" value={formData.connectorType} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
          <option value="CCS">CCS (Combined Charging System)</option>
          <option value="CHAdeMO">CHAdeMO</option>
          <option value="AC">AC (Type 2)</option>
          <option value="Tesla">Tesla Supercharger</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Power (kW) <span className="text-red-500">*</span></label>
          <input type="number" step="0.1" name="maxPower" value={formData.maxPower} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg ${errors.maxPower ? 'border-red-500' : 'border-gray-300'}`} placeholder="E.g.: 50" />
          {errors.maxPower && <p className="text-red-500 text-sm mt-1">{errors.maxPower}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price/kWh (VND) <span className="text-red-500">*</span></label>
          <input type="number" step="100" name="pricePerKwh" value={formData.pricePerKwh} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg ${errors.pricePerKwh ? 'border-red-500' : 'border-gray-300'}`} placeholder="E.g.: 3500" />
          {errors.pricePerKwh && <p className="text-red-500 text-sm mt-1">{errors.pricePerKwh}</p>}
        </div>
      </div>

      {/* Status (only for Edit mode) */}
      {chargingPoint && (
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
            Note: Point auto-updates to "Using" when a session starts
          </p>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <button type="button" onClick={onCancel} disabled={submitting} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancel</button>
        <button type="submit" disabled={submitting} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
          {chargingPoint ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}
