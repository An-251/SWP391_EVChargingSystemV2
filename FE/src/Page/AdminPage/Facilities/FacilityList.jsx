/**
 * Facility List Page
 * Manage facilities with CRUD operations
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFacilities, deleteFacility, clearNotification } from '../../../redux/admin/adminSlice';
import { AdminTable, AdminModal, AdminSearchBar, AdminLoader } from '../../../Components/Admin';
import FacilityForm from './FacilityForm';

export default function FacilityList() {
  const dispatch = useDispatch();
  const { list, loading, pagination, error } = useSelector((state) => state.admin.facilities);
  const notification = useSelector((state) => state.admin.notification);

  const [showModal, setShowModal] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    dispatch(fetchFacilities({ page: currentPage - 1, size: 10, search: searchTerm }));
  }, [dispatch, currentPage, searchTerm]);

  useEffect(() => {
    if (notification.message) {
      setTimeout(() => dispatch(clearNotification()), 3000);
    }
  }, [notification, dispatch]);

  const handleCreate = () => {
    setEditingFacility(null);
    setShowModal(true);
  };

  const handleEdit = (facility) => {
    setEditingFacility(facility);
    setShowModal(true);
  };

  const handleDeleteClick = (facility) => {
    setDeletingId(facility.id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    await dispatch(deleteFacility(deletingId));
    setShowDeleteConfirm(false);
    setDeletingId(null);
    dispatch(fetchFacilities({ page: currentPage - 1, size: 10, search: searchTerm }));
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingFacility(null);
  };

  const handleFormSuccess = () => {
    setShowModal(false);
    setEditingFacility(null);
    dispatch(fetchFacilities({ page: currentPage - 1, size: 10, search: searchTerm }));
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
    },
    {
      key: 'name',
      label: 'Facility Name',
      sortable: true,
    },
    {
      key: 'city',
      label: 'City',
      sortable: true,
    },
    {
      key: 'address',
      label: 'Address',
      render: (value, row) => {
        const parts = [
          row.streetAddress || row.street_address,
          row.ward,
          row.district,
          row.city
        ].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : value || 'N/A';
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === 'ACTIVE'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {value === 'ACTIVE' ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'stationCount',
      label: 'Stations',
      render: (value) => (
        <span className="font-medium text-blue-600">{value || 0}</span>
      ),
    },
  ];

  if (loading && list.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <AdminLoader size="lg" text="Loading facilities..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification.message && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
            notification.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          } animate-fade-in`}
        >
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Facility Management</h1>
          <p className="text-gray-600 mt-1">
            Manage EV charging facilities
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Create New Facility
        </button>
      </div>

      {/* Search Bar */}
      <AdminSearchBar
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Search by name, address, city..."
        onClear={() => setSearchTerm('')}
      />

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 font-medium">❌ Error: {error}</p>
        </div>
      )}

      {/* Table */}
      <AdminTable
        columns={columns}
        data={list}
        loading={loading}
        onRowClick={handleEdit}
        pagination={{
          currentPage: currentPage,
          totalPages: pagination.totalPages,
          totalItems: pagination.totalElements,
          pageSize: pagination.size,
        }}
        onPageChange={handlePageChange}
        actions={(row) => (
          <>
            <button
              onClick={() => handleEdit(row)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteClick(row)}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Delete
            </button>
          </>
        )}
      />

      {/* Create/Edit Modal */}
      <AdminModal
        isOpen={showModal}
        onClose={handleModalClose}
        title={editingFacility ? 'Edit Facility' : 'Create New Facility'}
        size="lg"
      >
        <FacilityForm
          facility={editingFacility}
          onSuccess={handleFormSuccess}
          onCancel={handleModalClose}
        />
      </AdminModal>

      {/* Delete Confirmation Modal */}
      <AdminModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Confirm Delete"
        size="sm"
        footer={
          <>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Delete
            </button>
          </>
        }
      >
        <p className="text-gray-700">
          Are you sure you want to delete this facility? This action cannot be undone.
        </p>
      </AdminModal>
    </div>
  );
}
