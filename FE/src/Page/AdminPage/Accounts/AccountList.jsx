/**
 * Account List Page - Account Management with role filtering
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAccounts, deleteAccount, toggleAccountStatus, clearNotification } from '../../../redux/admin/adminSlice';
import { AdminTable, AdminModal, AdminSearchBar, AdminLoader } from '../../../Components/Admin';
import AccountForm from './AccountForm';

export default function AccountList() {
  const dispatch = useDispatch();
  const { list, loading, pagination } = useSelector((state) => state.admin.accounts);
  const notification = useSelector((state) => state.admin.notification);

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    dispatch(fetchAccounts({ page: currentPage - 1, size: 10, search: searchTerm, role: roleFilter || null }));
  }, [dispatch, currentPage, searchTerm, roleFilter]);

  useEffect(() => {
    if (notification.message) setTimeout(() => dispatch(clearNotification()), 3000);
  }, [notification, dispatch]);

  const handleToggleStatus = async (account) => {
    await dispatch(toggleAccountStatus(account.id));
    dispatch(fetchAccounts({ page: currentPage - 1, size: 10 }));
  };

  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'username', label: 'Username', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'phone', label: 'Phone Number' },
    {
      key: 'role',
      label: 'Role',
      render: (value) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${value === 'ADMIN' ? 'bg-purple-100 text-purple-700' : value === 'STAFF' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
          {value}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, row) => {
        const statusLower = (value || '').toLowerCase();
        return (
          <button
            onClick={(e) => { e.stopPropagation(); handleToggleStatus(row); }}
            className={`px-3 py-1 rounded-full text-xs font-medium ${statusLower === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
          >
            {statusLower === 'active' ? 'Active' : 'Locked'}
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {notification.message && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {notification.message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Account Management</h1>
          <p className="text-gray-600 mt-1">Manage and view system accounts</p>
        </div>
      </div>

      <AdminSearchBar
        value={searchTerm}
        onChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
        placeholder="Search by username, email, phone..."
        filters={[{
          key: 'role',
          placeholder: 'All roles',
          value: roleFilter,
          options: [
            { value: 'ADMIN', label: 'Admin' },
            { value: 'STAFF', label: 'Staff' },
            { value: 'DRIVER', label: 'Driver' },
          ],
        }]}
        onFilterChange={(key, val) => { setRoleFilter(val); setCurrentPage(1); }}
        onClear={() => setSearchTerm('')}
      />

      <AdminTable
        columns={columns}
        data={list}
        loading={loading}
        pagination={{ currentPage, totalPages: pagination.totalPages, totalItems: pagination.totalElements, pageSize: pagination.size }}
        onPageChange={setCurrentPage}
        actions={(row) => (
          <>
            <button onClick={() => { setEditingItem(row); setShowModal(true); }} className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
            <button onClick={() => { setDeletingId(row.id); setShowDeleteConfirm(true); }} className="text-red-600 hover:text-red-800 font-medium">Delete</button>
          </>
        )}
      />

      <AdminModal isOpen={showModal} onClose={() => setShowModal(false)} title={editingItem ? 'Edit Account' : 'Create New Account'} size="lg">
        <AccountForm account={editingItem} onSuccess={() => { setShowModal(false); dispatch(fetchAccounts({ page: currentPage - 1, size: 10 })); }} onCancel={() => setShowModal(false)} />
      </AdminModal>

      <AdminModal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Confirm Delete" size="sm" footer={<><button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">Cancel</button><button onClick={async () => { await dispatch(deleteAccount(deletingId)); setShowDeleteConfirm(false); dispatch(fetchAccounts({ page: currentPage - 1, size: 10 })); }} className="px-4 py-2 bg-red-600 text-white rounded-lg">Delete</button></>}>
        <p>Are you sure you want to delete this account?</p>
      </AdminModal>
    </div>
  );
}
