/**
 * Account Form Component
 */

import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createAccount, updateAccount } from '../../../redux/admin/adminSlice';

export default function AccountForm({ account, onSuccess, onCancel }) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    role: 'DRIVER',
    status: 'active',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (account) {
      setFormData({
        username: account.username || '',
        email: account.email || '',
        phone: account.phone || '',
        password: '', // Don't populate password for security
        role: account.role || 'DRIVER',
        status: account.status || 'active',
      });
    }
  }, [account]);

  const validate = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!account && !formData.password) newErrors.password = 'Password is required for new accounts';
    if (formData.password && formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
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
      const submitData = { ...formData };
      if (!submitData.password) delete submitData.password; // Remove empty password on update

      if (account) {
        await dispatch(updateAccount({ accountId: account.id, accountData: submitData })).unwrap();
      } else {
        await dispatch(createAccount(submitData)).unwrap();
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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Username <span className="text-red-500">*</span></label>
        <input type="text" name="username" value={formData.username} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg ${errors.username ? 'border-red-500' : 'border-gray-300'}`} placeholder="username" />
        {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-300'}`} placeholder="email@example.com" />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="0901234567" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password {!account && <span className="text-red-500">*</span>}
          {account && <span className="text-gray-500 text-xs">(Leave empty to keep unchanged)</span>}
        </label>
        <input type="password" name="password" value={formData.password} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg ${errors.password ? 'border-red-500' : 'border-gray-300'}`} placeholder="••••••" />
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <option value="DRIVER">Driver</option>
            <option value="STAFF">Staff</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <option value="active">Active</option>
            <option value="inactive">Locked</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <button type="button" onClick={onCancel} disabled={submitting} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancel</button>
        <button type="submit" disabled={submitting} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
          {account ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}
