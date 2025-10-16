import { Marker, Popup } from 'react-leaflet';
import { MapPin, Clock, Star } from 'lucide-react';

function StationMarker({ station, isActive, onMarkerClick, icon }) {
  const position = station.coordinates?.lat 
    ? [station.coordinates.lat, station.coordinates.lng]
    : station.coordinates;

  return (
    <Marker
      position={position}
      icon={icon}
      eventHandlers={{
        click: () => onMarkerClick(station)
      }}
    >
      <Popup>
        <div className="p-2 min-w-[200px]">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-semibold text-gray-900 text-sm">{station.name}</h3>
            {station.fastCharging && (
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                Nhanh
              </span>
            )}
          </div>
          
          {station.address && (
            <p className="text-xs text-gray-600 mb-2">{station.address}</p>
          )}
          
          <div className="space-y-1 text-xs">
            {station.distance && (
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-gray-400" />
                <span className="text-gray-600">{station.distance}</span>
              </div>
            )}
            
            {station.estimatedTime && (
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-gray-600">{station.estimatedTime}</span>
              </div>
            )}
            
            {station.rating && (
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-gray-600">{station.rating}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${
                  station.availableSlots > 0 ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="text-gray-600">
                  {station.availableSlots}/{station.totalSlots} trống
                </span>
              </div>
              
              {station.price && (
                <span className="font-semibold text-green-600">
                  {station.price}
                </span>
              )}
            </div>
          </div>
          
          <button
            onClick={() => onMarkerClick(station)}
            disabled={station.availableSlots === 0}
            className={`w-full mt-2 py-1 px-3 rounded text-xs font-medium transition-colors ${
              station.availableSlots > 0
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {station.availableSlots > 0 ? 'Chọn trạm' : 'Hết chỗ'}
          </button>
        </div>
      </Popup>
    </Marker>
  );
}

export default StationMarker;
