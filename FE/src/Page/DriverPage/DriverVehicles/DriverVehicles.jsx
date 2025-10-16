import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Modal, message, Empty, Spin } from 'antd';
import { Plus, Car as CarIcon } from 'lucide-react';
import VehicleCard from './components/VehicleCard';
import VehicleForm from './components/VehicleForm';
import {
  fetchDriverVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle,
  setCurrentVehicle,
} from '../../../redux/vehicle/vehicleSlice';

const DriverVehicles = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { vehicles, currentVehicle, loading, error } = useSelector((state) => state.vehicle);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  useEffect(() => {
    dispatch(fetchDriverVehicles());
    
    // Load default vehicle from localStorage
    const savedDefault = localStorage.getItem('defaultVehicle');
    if (savedDefault) {
      try {
        const vehicle = JSON.parse(savedDefault);
        dispatch(setCurrentVehicle(vehicle));
      } catch (e) {
        console.error('Failed to parse default vehicle:', e);
      }
    }
  }, [dispatch]);

  const handleAdd = () => {
    setEditingVehicle(null);
    setIsModalOpen(true);
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete Vehicle',
      content: 'Are you sure you want to delete this vehicle? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await dispatch(deleteVehicle(id)).unwrap();
          message.success('Vehicle deleted successfully');
          
          // If deleted vehicle was default, clear default
          if (currentVehicle?.id === id) {
            dispatch(setCurrentVehicle(null));
            localStorage.removeItem('defaultVehicle');
          }
        } catch (error) {
          message.error(error || 'Failed to delete vehicle');
        }
      },
    });
  };

  const handleSetDefault = (id) => {
    const vehicle = vehicles.find(v => v.id === id);
    if (vehicle) {
      dispatch(setCurrentVehicle(vehicle));
      localStorage.setItem('defaultVehicle', JSON.stringify(vehicle));
      message.success('Default vehicle updated successfully');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingVehicle) {
        await dispatch(updateVehicle({ id: editingVehicle.id, data: values })).unwrap();
        message.success('Vehicle updated successfully');
        
        // Update default vehicle if it was edited
        if (currentVehicle?.id === editingVehicle.id) {
          const updatedVehicle = { ...editingVehicle, ...values };
          dispatch(setCurrentVehicle(updatedVehicle));
          localStorage.setItem('defaultVehicle', JSON.stringify(updatedVehicle));
        }
      } else {
        // Backend gets driverId from JWT token, no need to pass it
        const newVehicle = await dispatch(addVehicle(values)).unwrap();
        message.success('Vehicle added successfully');
        
        // Set as default if it's the first vehicle
        if (vehicles.length === 0) {
          dispatch(setCurrentVehicle(newVehicle));
          localStorage.setItem('defaultVehicle', JSON.stringify(newVehicle));
          message.info('This vehicle has been set as your default');
        }
      }
      setIsModalOpen(false);
      setEditingVehicle(null);
    } catch (error) {
      message.error(error || 'Operation failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <CarIcon className="w-8 h-8 text-blue-600" />
              My Vehicles
            </h1>
            <p className="text-gray-600 mt-2">Manage your electric vehicles for charging</p>
          </div>
          <Button 
            type="primary" 
            icon={<Plus className="w-5 h-5" />} 
            onClick={handleAdd}
            size="large"
            className="flex items-center gap-2"
          >
            Add Vehicle
          </Button>
        </div>

        {/* Content */}
        {loading && vehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Spin size="large" />
            <p className="mt-4 text-gray-600">Loading your vehicles...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div className="text-center">
                  <p className="text-xl font-semibold text-gray-800 mb-2">No vehicles yet</p>
                  <p className="text-gray-600">Add your first electric vehicle to start charging</p>
                </div>
              }
            >
              <Button 
                type="primary" 
                size="large"
                icon={<Plus className="w-5 h-5" />}
                onClick={handleAdd}
                className="flex items-center gap-2 mx-auto mt-4"
              >
                Add Your First Vehicle
              </Button>
            </Empty>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {vehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                isDefault={currentVehicle?.id === vehicle.id}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSetDefault={handleSetDefault}
              />
            ))}
          </div>
        )}

        {/* Info Card */}
        {vehicles.length > 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Tip: Default Vehicle</h3>
            <p className="text-blue-800 text-sm">
              Your default vehicle will be automatically selected when starting a charging session. 
              You can change it anytime by clicking "Set Default" on another vehicle.
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        title={
          <span className="text-xl font-bold">
            {editingVehicle ? '✏️ Edit Vehicle' : '➕ Add New Vehicle'}
          </span>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingVehicle(null);
        }}
        footer={null}
        width={600}
      >
        <VehicleForm
          initialValues={editingVehicle}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingVehicle(null);
          }}
          loading={loading}
        />
      </Modal>
    </div>
  );
};

export default DriverVehicles;
