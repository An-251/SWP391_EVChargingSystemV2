/**
 * Subscription List Page - Manage subscription packages
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSubscriptions, deleteSubscription, clearNotification } from '../../../redux/admin/adminSlice';
import { AdminTable, AdminModal, AdminLoader } from '../../../Components/Admin';
import SubscriptionForm from './SubscriptionForm';

export default function SubscriptionList() {
  const dispatch = useDispatch();
  const { list, loading, pagination } = useSelector((state) => state.admin.subscriptions);
  const notification = useSelector((state) => state.admin.notification);

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    dispatch(fetchSubscriptions({ page: currentPage - 1, size: 10 }));
  }, [dispatch, currentPage]);

  useEffect(() => {
    if (notification.message) setTimeout(() => dispatch(clearNotification()), 3000);
  }, [notification, dispatch]);

  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Package Name', sortable: true },
    {
      key: 'price',
      label: 'Price',
      render: (value) => <span className="font-bold text-green-600">{value?.toLocaleString('vi-VN')} VND</span>,
    },
    {
      key: 'duration',
      label: 'Duration',
      render: (value) => `${value} days`,
    },
    {
      key: 'benefits',
      label: 'Benefits',
      render: (value) => (
        <div className="text-sm">
          {value?.slice(0, 50)}{value?.length > 50 ? '...' : ''}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const statusLower = (value || '').toLowerCase();
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusLower === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
            {statusLower === 'active' ? 'Active' : 'Inactive'}
          </span>
        );
      },
    },
  ];

  if (loading && list.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <AdminLoader size="lg" text="Loading subscription packages..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {notification.message && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {notification.message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
          <p className="text-gray-600 mt-1">Manage subscription packages</p>
        </div>
        <button onClick={() => { setEditingItem(null); setShowModal(true); }} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2">
          <span className="text-xl">+</span> Create New Package
        </button>
      </div>

      <AdminTable
        columns={columns}
        data={list}
        loading={loading}
        onRowClick={(row) => { setEditingItem(row); setShowModal(true); }}
        pagination={{ currentPage, totalPages: pagination.totalPages, totalItems: pagination.totalElements, pageSize: pagination.size }}
        onPageChange={setCurrentPage}
        actions={(row) => (
          <>
            <button onClick={() => { setEditingItem(row); setShowModal(true); }} className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
            <button onClick={() => { setDeletingId(row.id); setShowDeleteConfirm(true); }} className="text-red-600 hover:text-red-800 font-medium">Delete</button>
          </>
        )}
      />

      <AdminModal isOpen={showModal} onClose={() => setShowModal(false)} title={editingItem ? 'Edit Package' : 'Create New Package'} size="lg">
        <SubscriptionForm subscription={editingItem} onSuccess={() => { setShowModal(false); dispatch(fetchSubscriptions({ page: currentPage - 1, size: 10 })); }} onCancel={() => setShowModal(false)} />
      </AdminModal>

      <AdminModal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Confirm Delete" size="sm" footer={<><button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">Cancel</button><button onClick={async () => { await dispatch(deleteSubscription(deletingId)); setShowDeleteConfirm(false); dispatch(fetchSubscriptions({ page: currentPage - 1, size: 10 })); }} className="px-4 py-2 bg-red-600 text-white rounded-lg">Delete</button></>}>
        <p>Are you sure you want to delete this subscription package?</p>
      </AdminModal>
    </div>
  );
}
