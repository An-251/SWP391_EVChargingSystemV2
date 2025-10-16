import React from 'react';
import { Car, Edit, Trash2, Check } from 'lucide-react';
import { Button } from 'antd';

const VehicleCard = ({ vehicle, onEdit, onDelete, onSetDefault, isDefault }) => {
  return (
    <div className={`p-6 border-2 rounded-xl shadow-sm hover:shadow-md transition-all ${
      isDefault 
        ? 'border-green-500 bg-gradient-to-br from-green-50 to-white' 
        : 'border-gray-200 bg-white hover:border-blue-300'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-lg ${isDefault ? 'bg-green-100' : 'bg-blue-100'}`}>
            <Car className={`w-8 h-8 ${isDefault ? 'text-green-600' : 'text-blue-600'}`} />
          </div>
          <div>
            <h3 className="font-bold text-xl text-gray-800">{vehicle.model}</h3>
            <p className="text-gray-600 font-medium">{vehicle.licensePlate}</p>
            <div className="flex flex-wrap gap-3 mt-3 text-sm">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                🔋 {vehicle.batteryCapacity} kWh
              </span>
              <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full font-medium">
                🔌 {vehicle.connectorType}
              </span>
              {vehicle.color && (
                <span className="px-3 py-1 bg-gray-50 text-gray-700 rounded-full font-medium">
                  🎨 {vehicle.color}
                </span>
              )}
              {vehicle.year && (
                <span className="px-3 py-1 bg-gray-50 text-gray-700 rounded-full font-medium">
                  📅 {vehicle.year}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col space-y-2">
          {!isDefault && (
            <Button 
              type="default" 
              size="small"
              onClick={() => onSetDefault(vehicle.id)}
              className="flex items-center gap-1"
            >
              <Check className="w-4 h-4" />
              Set Default
            </Button>
          )}
          <Button 
            type="default" 
            size="small"
            onClick={() => onEdit(vehicle)}
            className="flex items-center gap-1"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Button>
          <Button 
            danger 
            size="small"
            onClick={() => onDelete(vehicle.id)}
            className="flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>
      </div>
      
      {isDefault && (
        <div className="mt-4 flex items-center gap-2 text-green-600 font-semibold">
          <Check className="w-5 h-5" />
          <span>Default Vehicle for Charging</span>
        </div>
      )}
    </div>
  );
};

export default VehicleCard;
