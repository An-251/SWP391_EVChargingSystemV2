/**
 * Charging Point List Page
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChargingPoints, deleteChargingPoint, fetchStations, clearNotification } from '../../../redux/admin/adminSlice';
import { AdminTable, AdminModal, AdminSearchBar, AdminLoader } from '../../../Components/Admin';
import ChargingPointForm from './ChargingPointForm';
import { CHARGING_POINT_STATUS } from '../../../constants/statusConstants';

export default function ChargingPointList() {
  const dispatch = useDispatch();
  const { list, loading, pagination } = useSelector((state) => state.admin.chargingPoints);
  const stations = useSelector((state) => state.admin.stations.list);
  const notification = useSelector((state) => state.admin.notification);

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [stationFilter, setStationFilter] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    dispatch(fetchStations({ page: 0, size: 100 }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchChargingPoints({ page: currentPage - 1, size: 10, search: searchTerm, stationId: stationFilter || null }));
  }, [dispatch, currentPage, searchTerm, stationFilter]);

  useEffect(() => {
    if (notification.message) setTimeout(() => dispatch(clearNotification()), 3000);
  }, [notification, dispatch]);

  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'pointName', label: 'Charging Point Name', sortable: true },
    {
      key: 'stationName',
      label: 'Station',
      sortable: true
    },
    {
      key: 'pricePerKwh',
      label: 'Price/kWh',
      render: (value) => `${value?.toLocaleString('vi-VN')} VND`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const statusLower = (value || '').toLowerCase();
        const statusMap = {
          [CHARGING_POINT_STATUS.ACTIVE]: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' },
          [CHARGING_POINT_STATUS.USING]: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Using' },
          [CHARGING_POINT_STATUS.BOOKED]: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Booked' },
          [CHARGING_POINT_STATUS.INACTIVE]: { bg: 'bg-red-100', text: 'text-red-700', label: 'Inactive' },
          [CHARGING_POINT_STATUS.MAINTENANCE]: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Maintenance' },
        };
        const config = statusMap[statusLower] || { bg: 'bg-gray-100', text: 'text-gray-700', label: statusLower };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
            {config.label}
          </span>
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
          <h1 className="text-3xl font-bold text-gray-900">Charging Point Management</h1>
          <p className="text-gray-600 mt-1">Manage charging points at stations</p>
        </div>
        <button onClick={() => { setEditingItem(null); setShowModal(true); }} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2">
          <span className="text-xl">+</span> Create New Charging Point
        </button>
      </div>

      <AdminSearchBar
        value={searchTerm}
        onChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
        placeholder="Search charging points..."
        filters={[{ key: 'station', placeholder: 'All stations', value: stationFilter, options: stations.map((s) => ({ value: s.id, label: s.name })) }]}
        onFilterChange={(key, val) => { setStationFilter(val); setCurrentPage(1); }}
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

      <AdminModal isOpen={showModal} onClose={() => setShowModal(false)} title={editingItem ? 'Edit Charging Point' : 'Create New Charging Point'} size="lg">
        <ChargingPointForm chargingPoint={editingItem} onSuccess={() => { setShowModal(false); dispatch(fetchChargingPoints({ page: currentPage - 1, size: 10 })); }} onCancel={() => setShowModal(false)} />
      </AdminModal>

      <AdminModal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Confirm Delete" size="sm" footer={<><button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">Cancel</button><button onClick={async () => { await dispatch(deleteChargingPoint(deletingId)); setShowDeleteConfirm(false); dispatch(fetchChargingPoints({ page: currentPage - 1, size: 10 })); }} className="px-4 py-2 bg-red-600 text-white rounded-lg">Delete</button></>}>
        <p>Are you sure you want to delete this charging point?</p>
      </AdminModal>
    </div>
  );
}
