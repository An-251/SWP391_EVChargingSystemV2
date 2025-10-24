import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchStations,
  fetchFacilities,
  createStation,
  updateStation,
  deleteStation,
  setSelectedStation,
  clearSuccess,
  clearError
} from '../../../redux/admin/adminSlice';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Plus, Edit, Trash2, X, Save, AlertCircle } from 'lucide-react';
import { message, Modal, Switch } from 'antd';
import api from '../../../configs/config-axios';

// Custom marker icon
const stationIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Component to handle map clicks
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng);
    },
  });
  return null;
}

const StationsManagement = () => {
  const dispatch = useDispatch();
  const { stations, facilities, loading, successMessage, error } = useSelector((state) => state.admin);
  
  // Ensure stations is always an array
  const stationsList = Array.isArray(stations) ? stations : [];
  
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    stationName: '',
    latitude: null,
    longitude: null,
    status: 'active',
    facility: null
  });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([10.7769, 106.7009]); // HCM City
  const [hasChargingPointUsing, setHasChargingPointUsing] = useState(false);

  useEffect(() => {
    dispatch(fetchStations());
    dispatch(fetchFacilities());
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

  const handleLocationSelect = (latlng) => {
    setSelectedLocation(latlng);
    setFormData(prev => ({
      ...prev,
      latitude: latlng.lat,
      longitude: latlng.lng
    }));
  };

  const handleOpenModal = (station = null) => {
    if (station) {
      setEditMode(true);
      setFormData({
        id: station.id,
        stationName: station.stationName || '',
        latitude: station.latitude,
        longitude: station.longitude,
        status: station.status || 'ACTIVE',
        facility: station.facility?.id || null
      });
      if (station.latitude && station.longitude) {
        setSelectedLocation({ lat: station.latitude, lng: station.longitude });
        setMapCenter([station.latitude, station.longitude]);
      }
      
      // Check if any charging point under this station is USING
      const hasUsing = checkIfStationHasChargingPointUsing(station);
      setHasChargingPointUsing(hasUsing);
    } else {
      setEditMode(false);
      setFormData({
        stationName: '',
        latitude: null,
        longitude: null,
        status: 'active',
        facility: null
      });
      setSelectedLocation(null);
      setMapCenter([10.7769, 106.7009]);
      setHasChargingPointUsing(false);
    }
    setShowModal(true);
  };

  const checkIfStationHasChargingPointUsing = (station) => {
    // Check if station has any charging point in using status (Backend uses lowercase)
    if (!station.chargingPoints || station.chargingPoints.length === 0) {
      return false;
    }
    
    return station.chargingPoints.some(point => 
      point.status && point.status.toLowerCase() === 'using'
    );
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setHasChargingPointUsing(false);
    setFormData({
      stationName: '',
      latitude: null,
      longitude: null,
      status: 'active',
      facility: null
    });
    setSelectedLocation(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.latitude || !formData.longitude) {
      message.error('Please select a location on the map');
      return;
    }

    // Build request matching ChargingStationRequest.java
    const submitData = {
      stationName: formData.stationName,
      latitude: formData.latitude,
      longitude: formData.longitude,
      status: formData.status,
      facilityId: formData.facility || null  // ✅ Flat facilityId, not nested object
    };

    if (editMode) {
      dispatch(updateStation({ id: formData.id, data: submitData }));
    } else {
      dispatch(createStation(submitData));
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete Station',
      content: 'Are you sure you want to delete this station?',
      okText: 'Delete',
      okType: 'danger',
      onOk: () => {
        dispatch(deleteStation(id));
      }
    });
  };

  const handleToggleStatus = async (stationId, currentStatus, station) => {
    // Station can only be toggled between ACTIVE/INACTIVE by admin
    // BE uses: ACTIVE, INACTIVE, USING
    if (currentStatus === 'USING') {
      message.warning('Cannot change status while station is in use');
      return;
    }
    
    // Check if any charging point is in use (USING status)
    const hasPointInUse = station.chargingPoints?.some(point => 
      point.status === 'USING'
    );
    if (hasPointInUse) {
      message.error('Cannot change station status while charging points are in use');
      return;
    }
    
    // Toggle between ACTIVE and INACTIVE
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    
    try {
      await api.post(`/status/station/${stationId}`, { status: newStatus });
      message.success(`Station status updated to ${newStatus}`);
      dispatch(fetchStations({}));
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Failed to update station status';
      message.error(errorMsg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Stations Management</h1>
          <p className="text-gray-600">Create and manage charging stations</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md"
        >
          <Plus size={20} />
          <span>Add Station</span>
        </button>
      </div>

      {/* Stations Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stationsList.map((station) => (
            <div
              key={station.id}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Battery className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{station.stationName}</h3>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  station.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 
                  station.status === 'USING' ? 'bg-blue-100 text-blue-700' : 
                  'bg-gray-100 text-gray-700'
                }`}>
                  {station.status === 'ACTIVE' ? '● Active' : 
                   station.status === 'USING' ? '● Using' : 
                   '● Inactive'}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div>
                  <span className="font-medium">Latitude:</span> {station.latitude?.toFixed(6)}
                </div>
                <div>
                  <span className="font-medium">Longitude:</span> {station.longitude?.toFixed(6)}
                </div>
                <div>
                  <span className="font-medium">Facility:</span> {station.facility?.address || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Charging Points:</span> {station.chargingPoints?.length || 0}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Status</span>
                  <Switch
                    checked={station.status === 'ACTIVE'}
                    onChange={() => handleToggleStatus(station.id, station.status, station)}
                    checkedChildren="Active"
                    unCheckedChildren="Inactive"
                    disabled={
                      station.status === 'USING' || 
                      station.chargingPoints?.some(point => point.status === 'USING')
                    }
                  />
                </div>
                {station.status === 'USING' && (
                  <p className="text-xs text-blue-600">● Station is currently in use</p>
                )}
                {station.chargingPoints?.some(point => point.status === 'IN_USE' || point.status === 'OCCUPIED') && station.status !== 'USING' && (
                  <p className="text-xs text-orange-600">⚠ Some charging points are in use - cannot change status</p>
                )}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenModal(station)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Edit size={16} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(station.id)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {stationsList.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <MapPin className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No stations yet</h3>
          <p className="text-gray-500">Click "Add Station" to create your first station</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                {editMode ? 'Edit Station' : 'Create New Station'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Station Name *
                  </label>
                  <input
                    type="text"
                    value={formData.stationName}
                    onChange={(e) => setFormData({ ...formData, stationName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    disabled={editMode && hasChargingPointUsing}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      editMode && hasChargingPointUsing ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
                    }`}
                  >
                    <option value="active">Active</option>
                    <option value="using">Using</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  {editMode && hasChargingPointUsing && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <AlertCircle size={14} />
                      Cannot change status while charging points are in use
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facility
                  </label>
                  <select
                    value={formData.facility || ''}
                    onChange={(e) => setFormData({ ...formData, facility: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select Facility</option>
                    {facilities.map((facility) => (
                      <option key={facility.id} value={facility.id}>
                        {facility.address || `Facility ${facility.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coordinates
                  </label>
                  <div className="text-sm text-gray-600">
                    {selectedLocation ? (
                      <>
                        <div>Lat: {selectedLocation.lat.toFixed(6)}</div>
                        <div>Lng: {selectedLocation.lng.toFixed(6)}</div>
                      </>
                    ) : (
                      <div className="flex items-center space-x-1 text-yellow-600">
                        <AlertCircle size={16} />
                        <span>Click on map to select location</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Map */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location on Map *
                </label>
                <div className="h-96 rounded-lg overflow-hidden border border-gray-300">
                  <MapContainer
                    center={mapCenter}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    <MapClickHandler onLocationSelect={handleLocationSelect} />
                    {selectedLocation && (
                      <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={stationIcon} />
                    )}
                  </MapContainer>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Click anywhere on the map to set the station location
                </p>
              </div>

              {/* Actions */}
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
                  className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md disabled:opacity-50"
                >
                  <Save size={20} />
                  <span>{editMode ? 'Update' : 'Create'} Station</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StationsManagement;
