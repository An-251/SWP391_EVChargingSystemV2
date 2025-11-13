/**
 * Subscription Form Component
 */

import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createSubscription, updateSubscription } from '../../../redux/admin/adminSlice';

export default function SubscriptionForm({ subscription, onSuccess, onCancel }) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    planName: '',
    planType: 'BASIC',
    targetUserType: 'Driver', // ⭐ THÊM
    price: '',
    validityDays: '',
    description: '',
    isDefault: false,
    discountRate: 0,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (subscription) {
      setFormData({
        planName: subscription.planName || '',
        planType: subscription.planType || 'BASIC',
        targetUserType: subscription.targetUserType || 'Driver', // ⭐ THÊM
        price: subscription.price || '',
        validityDays: subscription.validityDays || '',
        description: subscription.description || '',
        isDefault: subscription.isDefault || false,
        discountRate: subscription.discountRate || 0,
      });
    }
  }, [subscription]);

  const validate = () => {
    const newErrors = {};
    if (!formData.planName.trim()) newErrors.planName = 'Package name is required';
    if (!formData.price || formData.price < 0) newErrors.price = 'Price must be 0 or greater';
    if (!formData.validityDays || formData.validityDays <= 0) newErrors.validityDays = 'Duration must be greater than 0';
    if (!formData.description.trim()) newErrors.description = 'Benefits are required';
    if (formData.discountRate < 0 || formData.discountRate > 100) newErrors.discountRate = 'Discount must be between 0-100%';
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
        planName: formData.planName.trim(),
        planType: formData.planType,
        targetUserType: formData.targetUserType, // ⭐ THÊM
        price: parseFloat(formData.price) || 0,
        validityDays: formData.validityDays.toString(),
        description: formData.description.trim(),
        isDefault: formData.isDefault,
        discountRate: parseFloat(formData.discountRate) || 0,
      };

      if (subscription) {
        await dispatch(updateSubscription({ id: subscription.id, data: submitData })).unwrap();
      } else {
        await dispatch(createSubscription(submitData)).unwrap();
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
      {/* Row 1: Package Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Package Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="planName"
          value={formData.planName}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg ${errors.planName ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="E.g.: Premium Package"
        />
        {errors.planName && <p className="text-red-500 text-sm mt-1">{errors.planName}</p>}
        <p className="text-xs text-gray-500 mt-1">Enter a clear and descriptive package name</p>
      </div>

      {/* Row 2: Plan Type + Target User Type */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Plan Type <span className="text-red-500">*</span>
          </label>
          <select
            name="planType"
            value={formData.planType}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="BASIC">Basic</option>
            <option value="STANDARD">Standard</option>
            <option value="PREMIUM">Premium</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Select the subscription tier</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target User Type <span className="text-red-500">*</span>
          </label>
          <select
            name="targetUserType"
            value={formData.targetUserType}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="Driver">Driver</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Who can use this plan</p>
        </div>
      </div>

      {/* Row 3: Set as Default */}
      <div className="flex items-center">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            name="isDefault"
            checked={formData.isDefault}
            onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">
            Set as Default Plan (Basic) for {formData.targetUserType}
          </span>
        </label>
      </div>

      {/* Row 4: Price + Duration */}
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
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              setFormData(prev => ({ ...prev, price: value >= 0 ? value : 0 }));
              if (errors.price) setErrors(prev => ({ ...prev, price: null }));
            }}
            className={`w-full px-4 py-2 border rounded-lg ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="E.g.: 500000"
          />
          {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
          <p className="text-xs text-gray-500 mt-1">Price must be 0 or greater (auto-corrected)</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration (days) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="validityDays"
            value={formData.validityDays}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg ${errors.validityDays ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="E.g.: 30"
          />
          {errors.validityDays && <p className="text-red-500 text-sm mt-1">{errors.validityDays}</p>}
          <p className="text-xs text-gray-500 mt-1">Number of days the plan is valid</p>
        </div>
      </div>

      {/* Row 4: Discount Rate */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Discount Rate (%)
        </label>
        <input
          type="number"
          step="0.1"
          name="discountRate"
          value={formData.discountRate}
          onChange={(e) => {
            let value = parseFloat(e.target.value);
            if (value < 0) value = 0;
            if (value > 100) value = 100;
            setFormData(prev => ({ ...prev, discountRate: value }));
            if (errors.discountRate) setErrors(prev => ({ ...prev, discountRate: null }));
          }}
          className={`w-full px-4 py-2 border rounded-lg ${errors.discountRate ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="E.g.: 10"
        />
        {errors.discountRate && <p className="text-red-500 text-sm mt-1">{errors.discountRate}</p>}
        <p className="text-xs text-gray-500 mt-1">Discount percentage (0-100, auto-corrected)</p>
      </div>

      {/* Row 5: Benefits */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Benefits <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={6}
          className={`w-full px-4 py-2 border rounded-lg ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Enter each benefit on a new line:&#10;• Unlimited charging sessions&#10;• Priority customer support&#10;• Access to all charging stations&#10;• Mobile app access"
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        <p className="text-xs text-gray-500 mt-1">Enter benefits line by line (use •, -, *, or numbers)</p>
      </div>

      {/* Submit Buttons */}
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
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
        >
          {submitting && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
          {submitting ? 'Saving...' : (subscription ? 'Update' : 'Create')}
        </button>
      </div>
    </form>
  );
}
