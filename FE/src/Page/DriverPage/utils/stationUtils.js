/**
 * Utility functions for station data processing
 */

// Calculate distance between two points (Haversine formula)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Returns distance in km
};

// Format distance for display
export const formatDistance = (km) => {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
};

// Estimate travel time (assuming average speed of 40 km/h in city)
export const estimateTravelTime = (distanceKm) => {
  const hours = distanceKm / 40; // Average city speed: 40 km/h
  const minutes = Math.round(hours * 60);
  
  if (minutes < 60) {
    return `${minutes} phút`;
  }
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
};

// Build full address from facility data
export const buildFullAddress = (facility) => {
  if (!facility) return 'N/A';
  
  const parts = [
    facility.streetAddress || facility.street_address,
    facility.ward,
    facility.district,
    facility.city
  ].filter(Boolean);
  
  return parts.length > 0 ? parts.join(', ') : (facility.address || 'N/A');
};

// Calculate available and total charging slots
export const calculateSlots = (chargingPoints) => {
  if (!chargingPoints || !Array.isArray(chargingPoints)) {
    return { available: 0, total: 0 };
  }
  
  const available = chargingPoints.filter(
    (cp) => cp.status === 'AVAILABLE'
  ).length;
  
  return {
    available,
    total: chargingPoints.length
  };
};

// Get minimum price from charging points
export const getMinPrice = (chargingPoints) => {
  if (!chargingPoints || chargingPoints.length === 0) {
    return 'N/A';
  }
  
  const prices = chargingPoints
    .map((cp) => cp.pricePerKwh)
    .filter((price) => price != null && price > 0);
  
  if (prices.length === 0) return 'N/A';
  
  const minPrice = Math.min(...prices);
  return `${minPrice.toLocaleString('vi-VN')} VNĐ/kWh`;
};

// Check if station has fast charging (>50kW)
export const hasFastCharging = (chargingPoints) => {
  if (!chargingPoints || chargingPoints.length === 0) return false;
  
  return chargingPoints.some((cp) => {
    const power = parseFloat(cp.maxPower || cp.powerOutput || 0);
    return power >= 50;
  });
};

// Get average rating (placeholder - will integrate with backend later)
export const getStationRating = (station) => {
  // TODO: Integrate with real rating system from backend
  return station.rating || 4.5; // Default rating
};

// Calculate station data for display
export const processStationData = (station, userLocation) => {
  const slots = calculateSlots(station.chargingPoints);
  const price = getMinPrice(station.chargingPoints);
  const fastCharging = hasFastCharging(station.chargingPoints);
  const address = buildFullAddress(station.facility);
  
  let distance = null;
  let estimatedTime = null;
  
  // Calculate distance and time if user location is available
  if (userLocation && station.latitude && station.longitude) {
    const distKm = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      parseFloat(station.latitude),
      parseFloat(station.longitude)
    );
    distance = formatDistance(distKm);
    estimatedTime = estimateTravelTime(distKm);
  }
  
  return {
    ...station,
    address,
    distance: distance || 'N/A',
    estimatedTime: estimatedTime || 'N/A',
    availableSlots: slots.available,
    totalSlots: slots.total,
    price,
    fastCharging,
    rating: getStationRating(station)
  };
};
