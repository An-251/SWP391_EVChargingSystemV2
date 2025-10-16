import React from 'react';
import { MapPin, Clock, Star } from 'lucide-react';

const StationCard = ({ station, isSelected, onSelect, onBook }) => {
  return (
    <div
      onClick={() => onSelect(station)}
      className={`p-4 border border-gray-200 rounded-xl cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'border-green-500 bg-green-50' : 'hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-gray-900">{station.name}</h3>
            {station.fastCharging && (
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                Nhanh
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-600 mb-2">{station.address}</p>
          
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{station.distance}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{station.estimatedTime}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-gray-600">{station.rating}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                station.availableSlots > 0 ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm text-gray-600">
                {station.availableSlots}/{station.totalSlots} trống
              </span>
            </div>
            
            <span className="text-sm font-semibold text-green-600">
              {station.price}
            </span>
          </div>
        </div>
      </div>
      
      {isSelected && (
        <div className="mt-3 pt-3 border-t border-green-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBook(station);
            }}
            disabled={station.availableSlots === 0}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              station.availableSlots > 0
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {station.availableSlots > 0 ? 'Đặt trạm ngay' : 'Hết chỗ'}
          </button>
        </div>
      )}
    </div>
  );
};

export default StationCard;
