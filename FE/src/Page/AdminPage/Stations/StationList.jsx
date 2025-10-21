/**
 * Station List Page
 * Manage charging stations with CRUD operations
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStations, deleteStation, fetchFacilities, clearNotification } from '../../../redux/admin/adminSlice';
import { AdminTable, AdminModal, AdminSearchBar, AdminLoader } from '../../../Components/Admin';
import StationForm from './StationForm';

export default function StationList() {
  const dispatch = useDispatch();
  const { list, loading, pagination, error } = useSelector((state) => state.admin.stations);
  const facilities = useSelector((state) => state.admin.facilities.list);
  const notification = useSelector((state) => state.admin.notification);

  const [showModal, setShowModal] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [facilityFilter, setFacilityFilter] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    dispatch(fetchFacilities({ page: 0, size: 100 })); // Load all facilities for filter
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchStations({
        page: currentPage - 1,
        size: 10,
        search: searchTerm,
        facilityId: facilityFilter || null,
      })
    );
  }, [dispatch, currentPage, searchTerm, facilityFilter]);

  useEffect(() => {
    if (notification.message) {
      setTimeout(() => dispatch(clearNotification()), 3000);
    }
  }, [notification, dispatch]);

  const handleCreate = () => {
    setEditingStation(null);
    setShowModal(true);
  };

  const handleEdit = (station) => {
    setEditingStation(station);
    setShowModal(true);
  };

  const handleDeleteClick = (station) => {
    setDeletingId(station.id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    await dispatch(deleteStation(deletingId));
    setShowDeleteConfirm(false);
    setDeletingId(null);
    dispatch(fetchStations({ page: currentPage - 1, size: 10, search: searchTerm }));
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingStation(null);
  };

  const handleFormSuccess = () => {
    setShowModal(false);
    setEditingStation(null);
    dispatch(fetchStations({ page: currentPage - 1, size: 10, search: searchTerm }));
  };

  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
    },
    {
      key: 'name',
      label: 'Station Name',
      sortable: true,
    },
    {
      key: 'facilityName',
      label: 'Facility',
      render: (value, row) => row.facility?.name || 'N/A',
    },
    {
      key: 'address',
      label: 'Address',
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === 'ONLINE'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {value === 'ONLINE' ? 'Online' : 'Offline'}
        </span>
      ),
    },
    {
      key: 'chargingPointCount',
      label: 'Charging Points',
      render: (value) => <span className="font-medium text-blue-600">{value || 0}</span>,
    },
  ];

  const filters = [
    {
      key: 'facility',
      placeholder: 'All facilities',
      value: facilityFilter,
      options: facilities.map((f) => ({ value: f.id, label: f.name })),
    },
  ];

  if (loading && list.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <AdminLoader size="lg" text="Loading stations..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification.message && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          } animate-fade-in`}
        >
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Station Management</h1>
          <p className="text-gray-600 mt-1">Manage EV charging stations</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Create New Station
        </button>
      </div>

      {/* Search & Filter */}
      <AdminSearchBar
        value={searchTerm}
        onChange={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
        placeholder="Search by name, address..."
        filters={filters}
        onFilterChange={(key, val) => {
          setFacilityFilter(val);
          setCurrentPage(1);
        }}
        onClear={() => setSearchTerm('')}
      />

      {/* Error */}
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
          currentPage,
          totalPages: pagination.totalPages,
          totalItems: pagination.totalElements,
          pageSize: pagination.size,
        }}
        onPageChange={setCurrentPage}
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
        title={editingStation ? 'Edit Station' : 'Create New Station'}
        size="lg"
      >
        <StationForm station={editingStation} onSuccess={handleFormSuccess} onCancel={handleModalClose} />
      </AdminModal>

      {/* Delete Confirmation */}
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
        <p className="text-gray-700">Are you sure you want to delete this station?</p>
      </AdminModal>
    </div>
  );
}
