import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  searchSubscriptions,
  clearSuccess,
  clearError
} from '../../../redux/admin/adminSlice';
import { CreditCard, Plus, Edit, Trash2, X, Save, Search } from 'lucide-react';
import { message, Modal } from 'antd';

const SubscriptionsManagement = () => {
  const dispatch = useDispatch();
  const { subscriptions, loading, successMessage, error } = useSelector((state) => state.admin);
  
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    planName: '',
    planType: 'BASIC',
    price: 0,
    validityDays: '30',
    description: '',
    isDefault: false,
    discountRate: 0
  });

  useEffect(() => {
    dispatch(fetchSubscriptions());
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

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query) {
      dispatch(searchSubscriptions({ q: query }));
    } else {
      dispatch(fetchSubscriptions());
    }
  };

  const handleOpenModal = (subscription = null) => {
    if (subscription) {
      setEditMode(true);
      setFormData({
        id: subscription.id,
        planName: subscription.planName || '',
        planType: subscription.planType || 'BASIC',
        price: subscription.price || 0,
        validityDays: subscription.validityDays || '30',
        description: subscription.description || '',
        isDefault: subscription.isDefault || false,
        discountRate: subscription.discountRate || 0
      });
    } else {
      setEditMode(false);
      setFormData({
        planName: '',
        planType: 'BASIC',
        price: 0,
        validityDays: '30',
        description: '',
        isDefault: false,
        discountRate: 0
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.planName.trim()) {
      message.error('Plan name is required');
      return;
    }
    
    if (formData.price < 0) {
      message.error('Price must be greater than or equal to 0');
      return;
    }
    
    if (formData.discountRate < 0 || formData.discountRate > 100) {
      message.error('Discount rate must be between 0-100%');
      return;
    }
    
    if (!formData.validityDays.trim()) {
      message.error('Validity days is required');
      return;
    }
    
    if (!formData.description.trim()) {
      message.error('Benefits description is required');
      return;
    }
    
    // Build request matching SubscriptionPlanRequest.java
    const submitData = {
      planName: formData.planName.trim(),
      planType: formData.planType,
      price: parseFloat(formData.price) || 0,
      validityDays: formData.validityDays.toString().trim(),
      description: formData.description.trim(),
      isDefault: formData.isDefault || false,
      discountRate: parseFloat(formData.discountRate) || 0
    };

    if (editMode) {
      dispatch(updateSubscription({ id: formData.id, data: submitData }));
    } else {
      dispatch(createSubscription(submitData));
    }
  };

  const handleDelete = (id, name) => {
    Modal.confirm({
      title: 'Delete Subscription',
      content: `Are you sure you want to delete "${name}"?`,
      okText: 'Delete',
      okType: 'danger',
      onOk: () => {
        dispatch(deleteSubscription(id));
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Subscriptions Management</h1>
          <p className="text-gray-600">Manage subscription plans</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md"
        >
          <Plus size={20} />
          <span>Add Subscription</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 shadow-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search subscriptions..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptions.map((sub) => (
            <div key={sub.id} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CreditCard className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{sub.planName}</h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                      {sub.planType}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="text-2xl font-bold text-green-600">
                  {parseFloat(sub.price || 0).toLocaleString('vi-VN')} VNĐ
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 font-medium">
                    {sub.planType}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                    {sub.validityDays} ngày
                  </span>
                  {sub.discountRate > 0 && (
                    <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700 font-medium">
                      -{sub.discountRate}% giảm giá
                    </span>
                  )}
                  {sub.isDefault && (
                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                      ⭐ Mặc định
                    </span>
                  )}
                </div>
                {sub.totalRegistrations !== undefined && (
                  <div className="text-xs">
                    <span className="font-medium text-gray-700">Đã đăng ký:</span> {sub.totalRegistrations} người
                  </div>
                )}
                {sub.description && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-600 whitespace-pre-line line-clamp-3">
                      {sub.description}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleOpenModal(sub)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Edit size={16} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(sub.id, sub.planName)}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
              <h2 className="text-xl font-bold text-gray-800">
                {editMode ? 'Edit Subscription' : 'Create New Subscription'}
              </h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Row 1: Package Name - Full width */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Package Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.planName}
                    onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="E.g., Premium Package"
                    required
                  />
                </div>

                {/* Row 2: Plan Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plan Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.planType}
                    onChange={(e) => setFormData({ ...formData, planType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                    required
                  >
                    <option value="BASIC">Basic</option>
                    <option value="STANDARD">Standard</option>
                    <option value="PREMIUM">Premium</option>
                    <option value="ENTERPRISE">Enterprise</option>
                  </select>
                </div>

                {/* Row 2: Set as Default */}
                <div className="flex items-end pb-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-700">Set as Default Plan</span>
                  </label>
                </div>

                {/* Row 3: Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      setFormData({ ...formData, price: value >= 0 ? value : 0 });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    min="0"
                    step="1000"
                    placeholder="E.g., 500000"
                    required
                  />
                </div>

                {/* Row 3: Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (days) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.validityDays}
                    onChange={(e) => setFormData({ ...formData, validityDays: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="E.g., 30"
                    required
                  />
                </div>

                {/* Row 4: Discount Rate */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Rate (%)
                  </label>
                  <input
                    type="number"
                    value={formData.discountRate}
                    onChange={(e) => {
                      let value = parseFloat(e.target.value) || 0;
                      if (value < 0) value = 0;
                      if (value > 100) value = 100;
                      setFormData({ ...formData, discountRate: value });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="E.g., 10, 15, 20 (0-100%)"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter discount percentage for this plan (0-100%)</p>
                </div>

                {/* Row 5: Benefits - Full width */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Benefits <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                    rows="6"
                    placeholder="Describe package benefits...
E.g.:
• 10% discount on charging fees
• 5 free reservations per month
• Priority customer support
• Unlimited charging sessions"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Describe all benefits and features of this package. Use bullet points (•, -, *) or numbers for better formatting.
                  </p>
                </div>
              </div>

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
                  className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      <span>{editMode ? 'Update' : 'Create'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionsManagement;
