/**
 * Routing Service - OpenStreetMap OSRM API
 * Calculates real driving distance and time using road network
 */

// OSRM Public API endpoint
const OSRM_API = 'https://router.project-osrm.org/route/v1/driving';

// Cache để tránh gọi API lặp lại
const routeCache = new Map();

// Generate cache key from coordinates
const getCacheKey = (origin, destination) => {
  return `${origin.lng.toFixed(4)},${origin.lat.toFixed(4)}-${destination.lng.toFixed(4)},${destination.lat.toFixed(4)}`;
};

/**
 * Fetch route from OSRM API
 * @param {Object} origin - {lat, lng}
 * @param {Object} destination - {lat, lng}
 * @returns {Promise<Object>} Route data with distance (meters) and duration (seconds)
 */
export const fetchRoute = async (origin, destination) => {
  // Check cache first
  const cacheKey = getCacheKey(origin, destination);
  if (routeCache.has(cacheKey)) {
    console.log('🗺️ [OSRM] Using cached route:', cacheKey);
    return routeCache.get(cacheKey);
  }

  try {
    // OSRM expects coordinates as: lng,lat
    const originCoords = `${origin.lng},${origin.lat}`;
    const destCoords = `${destination.lng},${destination.lat}`;
    
    // Call OSRM API
    const url = `${OSRM_API}/${originCoords};${destCoords}?overview=full&geometries=geojson`;
    
    console.log('🚗 [OSRM] Fetching route:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('No route found');
    }
    
    const route = data.routes[0];
    
    const routeData = {
      distance: route.distance, // meters
      duration: route.duration, // seconds
      geometry: route.geometry, // GeoJSON LineString
      legs: route.legs,
      success: true
    };
    
    // Cache the result
    routeCache.set(cacheKey, routeData);
    
    console.log('✅ [OSRM] Route fetched:', {
      distanceKm: (routeData.distance / 1000).toFixed(2),
      durationMin: (routeData.duration / 60).toFixed(1)
    });
    
    return routeData;
    
  } catch (error) {
    console.error('❌ [OSRM] API error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Calculate road distance (uses OSRM for real road network)
 * Falls back to Haversine if OSRM fails
 * @param {Object} origin - {lat, lng}
 * @param {Object} destination - {lat, lng}
 * @returns {Promise<number>} Distance in kilometers
 */
export const calculateRoadDistance = async (origin, destination) => {
  const route = await fetchRoute(origin, destination);
  
  if (route.success) {
    // Convert meters to kilometers
    return route.distance / 1000;
  } else {
    // Fallback to Haversine (straight line distance)
    console.warn('⚠️ [OSRM] Falling back to Haversine calculation');
    return calculateHaversineDistance(origin, destination);
  }
};

/**
 * Get route duration in minutes
 * @param {Object} origin - {lat, lng}
 * @param {Object} destination - {lat, lng}
 * @returns {Promise<number>} Duration in minutes
 */
export const getRouteDuration = async (origin, destination) => {
  const route = await fetchRoute(origin, destination);
  
  if (route.success) {
    // Convert seconds to minutes
    return route.duration / 60;
  } else {
    // Fallback to estimated time based on Haversine distance
    const distKm = calculateHaversineDistance(origin, destination);
    return (distKm / 40) * 60; // 40 km/h average
  }
};

/**
 * Haversine formula - Calculate straight line distance
 * (Fallback when OSRM API fails)
 */
const calculateHaversineDistance = (origin, destination) => {
  const R = 6371; // Earth's radius in km
  const dLat = (destination.lat - origin.lat) * Math.PI / 180;
  const dLon = (destination.lng - origin.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(origin.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Format distance for display
 * @param {number} distanceKm - Distance in kilometers
 * @returns {string} Formatted distance (e.g., "5.6 km" or "850 m")
 */
export const formatDistance = (distanceKm) => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
};

/**
 * Format duration for display
 * @param {number} durationMin - Duration in minutes
 * @returns {string} Formatted duration (e.g., "8 phút" or "1h 15m")
 */
export const formatDuration = (durationMin) => {
  if (durationMin < 60) {
    return `${Math.round(durationMin)} phút`;
  }
  const hours = Math.floor(durationMin / 60);
  const minutes = Math.round(durationMin % 60);
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
};

/**
 * Clear route cache (useful when user location changes significantly)
 */
export const clearRouteCache = () => {
  routeCache.clear();
  console.log('🗑️ [OSRM] Route cache cleared');
};

/**
 * Batch fetch routes for multiple stations
 * (Optimized to avoid hammering OSRM API)
 * @param {Object} origin - User location {lat, lng}
 * @param {Array} stations - Array of stations with latitude/longitude
 * @returns {Promise<Map>} Map of stationId -> route data
 */
export const fetchRoutesForStations = async (origin, stations) => {
  const results = new Map();
  
  // Limit concurrent requests to avoid rate limiting
  const BATCH_SIZE = 3;
  const DELAY_MS = 500;
  
  for (let i = 0; i < stations.length; i += BATCH_SIZE) {
    const batch = stations.slice(i, i + BATCH_SIZE);
    
    const promises = batch.map(async (station) => {
      const destination = { lat: station.latitude, lng: station.longitude };
      const route = await fetchRoute(origin, destination);
      return { stationId: station.id, route };
    });
    
    const batchResults = await Promise.all(promises);
    
    batchResults.forEach(({ stationId, route }) => {
      results.set(stationId, route);
    });
    
    // Delay between batches to respect API rate limits
    if (i + BATCH_SIZE < stations.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }
  
  console.log(`✅ [OSRM] Fetched routes for ${results.size} stations`);
  
  return results;
};

export default {
  fetchRoute,
  calculateRoadDistance,
  getRouteDuration,
  formatDistance,
  formatDuration,
  clearRouteCache,
  fetchRoutesForStations
};
