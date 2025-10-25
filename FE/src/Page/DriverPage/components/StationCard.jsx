import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Star, Zap } from 'lucide-react';
import { calculateRoadDistance, getRouteDuration, formatDistance, formatDuration } from '../../../utils/routingService';

const StationCard = ({ station, isSelected, onSelect, onBook, userLocation }) => {
  // State for OSRM routing data
  const [routeDistance, setRouteDistance] = useState(null);
  const [routeDuration, setRouteDuration] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  
  // Fetch real road distance when userLocation or station changes
  useEffect(() => {
    const fetchRoadRoute = async () => {
      if (!userLocation || !station.latitude || !station.longitude) {
        setRouteDistance(null);
        setRouteDuration(null);
        return;
      }
      
      setLoadingRoute(true);
      
      try {
        const origin = { lat: userLocation.lat, lng: userLocation.lng };
        const destination = { lat: station.latitude, lng: station.longitude };
        
        console.log('🚗 [StationCard] Fetching road route for:', station.stationName);
        
        // Fetch both distance and duration from OSRM
        const [distKm, durationMin] = await Promise.all([
          calculateRoadDistance(origin, destination),
          getRouteDuration(origin, destination)
        ]);
        
        setRouteDistance(distKm);
        setRouteDuration(durationMin);
        
        console.log('✅ [StationCard] Road route:', {
          station: station.stationName,
          distance: formatDistance(distKm),
          duration: formatDuration(durationMin)
        });
        
      } catch (error) {
        console.error('❌ [StationCard] Error fetching route:', error);
        // Keep null values, will show N/A or fallback
      } finally {
        setLoadingRoute(false);
      }
    };
    
    fetchRoadRoute();
  }, [userLocation, station.latitude, station.longitude, station.stationName]);
  
  // Debug logging
  React.useEffect(() => {
    console.log('🎴 [StationCard] === RENDER DEBUG ===');
    console.log('📍 Station:', station?.stationName || station?.name);
    console.log('👤 UserLocation:', userLocation);
    console.log('🗺️ Station Coords:', { lat: station?.latitude, lng: station?.longitude });
    console.log('🏢 Facility:', station?.facility);
    console.log('⚡ ChargingPoints:', station?.chargingPoints);
    console.log('🚗 Road Distance:', routeDistance ? `${routeDistance.toFixed(2)} km` : 'Loading...');
    console.log('⏱️ Road Duration:', routeDuration ? `${routeDuration.toFixed(1)} min` : 'Loading...');
    console.log('=====================================');
  }, [station, userLocation, routeDistance, routeDuration]);

  // Calculate display values using OSRM routing data
  const getDistance = () => {
    if (loadingRoute) {
      return 'Đang tính...';
    }
    
    if (routeDistance === null) {
      return 'N/A';
    }
    
    return formatDistance(routeDistance);
  };

  const getEstimatedTime = () => {
    if (loadingRoute) {
      return 'Đang tính...';
    }
    
    if (routeDuration === null) {
      return 'N/A';
    }
    
    return formatDuration(routeDuration);
  };

  const getSlots = () => {
    if (!station.chargingPoints || !Array.isArray(station.chargingPoints)) {
      console.log('⚠️ [getSlots] No chargingPoints array:', station.chargingPoints);
      return { available: 0, total: 0 };
    }
    
    console.log('🔍 [getSlots] ChargingPoints:', station.chargingPoints.map(cp => ({
      id: cp.id,
      name: cp.pointName,
      status: cp.status
    })));
    
    // Check multiple status formats (Backend uses lowercase)
    const available = station.chargingPoints.filter(cp => {
      const status = (cp.status || '').toLowerCase();
      return status === 'active' ;
    }).length;
    
    console.log('✅ [getSlots] Result:', { available, total: station.chargingPoints.length });
    return { available, total: station.chargingPoints.length };
  };

  const getPrice = () => {
    if (!station.chargingPoints || station.chargingPoints.length === 0) {
      return 'N/A';
    }
    const prices = station.chargingPoints
      .map(cp => cp.pricePerKwh)
      .filter(price => price != null && price > 0);
    if (prices.length === 0) return 'N/A';
    const minPrice = Math.min(...prices);
    return `${minPrice.toLocaleString('vi-VN')} VNĐ/kWh`;
  };

  const hasFastCharging = () => {
    if (!station.chargingPoints) return false;
    return station.chargingPoints.some(cp => {
      const power = parseFloat(cp.maxPower || cp.powerOutput || 0);
      return power >= 50;
    });
  };

  const getAddress = () => {
    const facility = station.facility;
    if (!facility) return station.address || 'N/A';
    
    const parts = [
      facility.streetAddress || facility.street_address,
      facility.ward,
      facility.district,
      facility.city
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(', ') : (facility.address || 'N/A');
  };

  const distance = getDistance();
  const estimatedTime = getEstimatedTime();
  const slots = getSlots();
  const price = getPrice();
  const fastCharging = hasFastCharging();
  const address = getAddress();
  const rating = station.rating || 4.5;

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
            <h3 className="font-semibold text-gray-900">{station.stationName || station.name}</h3>
            {fastCharging && (
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Nhanh
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-600 mb-2">{address}</p>
          
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{distance}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{estimatedTime}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-gray-600">{rating}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                slots.available > 0 ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm text-gray-600">
                {slots.available}/{slots.total} trống
              </span>
            </div>
            
            <span className="text-sm font-semibold text-green-600">
              {price}
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
            disabled={slots.available === 0}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              slots.available > 0
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {slots.available > 0 ? 'Đặt trạm ngay' : 'Hết chỗ'}
          </button>
        </div>
      )}
    </div>
  );
};

export default StationCard;
