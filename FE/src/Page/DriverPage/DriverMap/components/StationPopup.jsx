import React from 'react';
import { MapPin, Zap, Star, Clock, Navigation, Heart, Calendar } from 'lucide-react';
import { CHARGING_POINT_STATUS } from '../../../../constants/statusConstants';

const StationPopup = ({ station, onBook, onGetDirections, onToggleFavorite, isFavorite }) => {
  // Calculate rating display
  const rating = station.rating || 4.5;
  const reviewCount = station.reviewCount || 0;
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'text-green-600 bg-green-100'; 
      case 'inactive':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-green-600 bg-green-100';
    }
  };

  // Get available slots count (Backend uses lowercase status)
  const availableSlots = station.chargingPoints?.filter(
    point => (point.status || '').toLowerCase() === CHARGING_POINT_STATUS.ACTIVE
  ).length || 0;
  
  const totalSlots = station.chargingPoints?.length || 0;

  return (
    <div className="w-80 max-w-full">
      {/* Header with Image */}
      <div className="relative h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-t-lg overflow-hidden">
        {station.imageUrl ? (
          <img 
            src={station.imageUrl} 
            alt={station.stationName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Zap size={48} className="text-white opacity-50" />
          </div>
        )}
        
        {/* Favorite Button */}
        <button
          onClick={onToggleFavorite}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          <Heart
            size={20}
            className={isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400'}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Station Name & Status */}
        <div>
          <div className="flex items-start justify-between mb-1">
            <h3 className="text-lg font-bold text-gray-800 flex-1 pr-2">
              {station.stationName}
            </h3>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(station.status)}`}>
              {station.status || 'ACTIVE'}
            </span>
          </div>
          
          {/* Rating */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Star size={16} className="text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-semibold text-gray-700">
                {rating.toFixed(1)}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              ({reviewCount} reviews)
            </span>
          </div>
        </div>

        {/* Address */}
        {station.facility?.address && (
          <div className="flex items-start space-x-2 text-sm text-gray-600">
            <MapPin size={16} className="mt-0.5 flex-shrink-0 text-gray-400" />
            <span>{station.facility.address}</span>
          </div>
        )}

        {/* Availability */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Zap size={18} className={availableSlots > 0 ? 'text-green-500' : 'text-gray-400'} />
            <span className="text-sm font-medium text-gray-700">
              Available Chargers
            </span>
          </div>
          <span className={`text-sm font-bold ${availableSlots > 0 ? 'text-green-600' : 'text-gray-500'}`}>
            {availableSlots} / {totalSlots}
          </span>
        </div>

        {/* Charging Points Info */}
        {station.chargingPoints && station.chargingPoints.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-600 uppercase">
              Connector Types
            </div>
            <div className="flex flex-wrap gap-2">
              {[...new Set(station.chargingPoints.map(cp => cp.connectorType))].map((type) => (
                <span
                  key={type}
                  className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium"
                >
                  {type}
                </span>
              ))}
            </div>
            
            {/* Max Power */}
            {station.chargingPoints.some(cp => cp.powerOutput) && (
              <div className="flex items-center space-x-2 text-sm">
                <Zap size={14} className="text-yellow-500" />
                <span className="text-gray-600">
                  Up to{' '}
                  <span className="font-semibold text-gray-800">
                    {Math.max(...station.chargingPoints.map(cp => cp.powerOutput || 0))} kW
                  </span>
                </span>
              </div>
            )}
          </div>
        )}

        {/* Pricing */}
        {station.pricePerKwh && (
          <div className="flex items-center justify-between text-sm p-2 bg-green-50 rounded-lg">
            <span className="text-gray-600">Price per kWh</span>
            <span className="font-bold text-green-600">
              {station.pricePerKwh.toFixed(2)} VND
            </span>
          </div>
        )}

        {/* Operating Hours */}
        {station.operatingHours && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock size={16} className="text-gray-400" />
            <span>{station.operatingHours}</span>
          </div>
        )}

        {/* Amenities */}
        {station.amenities && station.amenities.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-600 uppercase">
              Amenities
            </div>
            <div className="flex flex-wrap gap-1">
              {station.amenities.map((amenity, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}

          
          {/* Reservation Button - Secondary Action */}
          <button
            onClick={onBook}
            disabled={availableSlots === 0}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-semibold transition-all ${
              availableSlots > 0
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Calendar size={18} />
            <span className="text-sm">
              {availableSlots > 0 ? '📅 Đặt trạm ngay' : 'Fully Booked'}
            </span>
          </button>
          
          {/* Directions Button */}
          <button
            onClick={onGetDirections}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Navigation size={16} />
            <span className="text-sm font-medium">Chỉ đường</span>
          </button>
        </div>
      </div>
  );
};

export default StationPopup;
