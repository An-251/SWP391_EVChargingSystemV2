/**
 * Subscription Form Component
 */

import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createSubscription, updateSubscription } from '../../../redux/admin/adminSlice';

export default function SubscriptionForm({ subscription, onSuccess, onCancel }) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: '',
    benefits: '',
    status: 'ACTIVE',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (subscription) {
      setFormData({
        name: subscription.name || '',
        price: subscription.price || '',
        duration: subscription.duration || '',
        benefits: subscription.benefits || '',
        status: subscription.status || 'ACTIVE',
      });
    }
  }, [subscription]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Package name is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (!formData.duration || formData.duration <= 0) newErrors.duration = 'Duration must be greater than 0';
    if (!formData.benefits.trim()) newErrors.benefits = 'Benefits are required';
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
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
      };

      if (subscription) {
        await dispatch(updateSubscription({ subscriptionId: subscription.id, subscriptionData: submitData })).unwrap();
      } else {
        await dispatch(createSubscription(submitData)).unwrap();
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Package Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="E.g.: Premium Package"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price (VND) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="1000"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="E.g.: 500000"
          />
          {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration (days) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg ${errors.duration ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="E.g.: 30"
          />
          {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Benefits <span className="text-red-500">*</span>
        </label>
        <textarea
          name="benefits"
          value={formData.benefits}
          onChange={handleChange}
          rows={5}
          className={`w-full px-4 py-2 border rounded-lg ${errors.benefits ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Describe package benefits..."
        />
        {errors.benefits && <p className="text-red-500 text-sm mt-1">{errors.benefits}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          {submitting && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
          {subscription ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}
