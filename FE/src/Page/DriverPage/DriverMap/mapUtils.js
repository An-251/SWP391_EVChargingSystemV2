import L from 'leaflet';

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
  return R * c;
};

// Custom marker icon for charging stations
export const createCustomIcon = (color, isAvailable) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="position: relative; width: 32px; height: 32px;">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="15" fill="${isAvailable ? '#10B981' : '#EF4444'}" stroke="white" stroke-width="2"/>
          <path d="M12 10h8v12h-8V10z" fill="white"/>
          <path d="M14 12h4v8h-4v-8z" fill="${isAvailable ? '#10B981' : '#EF4444'}"/>
          <circle cx="16" cy="16" r="2" fill="white"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

// User location marker icon
export const userLocationIcon = L.divIcon({
  className: 'user-location-marker',
  html: `
    <div style="position: relative; width: 24px; height: 24px;">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="white" stroke-width="3"/>
        <circle cx="12" cy="12" r="3" fill="white"/>
      </svg>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Default map center (Ho Chi Minh City)
export const DEFAULT_CENTER = [10.7769, 106.7009];

// Convert location object to array format for Leaflet
export const normalizeLocation = (location) => {
  if (!location) return null;
  return location.lat ? [location.lat, location.lng] : location;
};

// Format duration in seconds to readable string
const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} phút`;
};

// Get simple straight-line route between two points
export const getSimpleRoute = (origin, destination) => {
  // Calculate distance using Haversine formula
  const distance = calculateDistance(
    origin.lat,
    origin.lng,
    destination.lat,
    destination.lng
  );

  // Create simple straight-line route
  const route = [
    [origin.lat, origin.lng],
    [destination.lat, destination.lng]
  ];

  // Estimate duration (assuming average speed of 40 km/h)
  const durationMinutes = Math.round((distance / 40) * 60);
  const durationSeconds = durationMinutes * 60;

  return {
    route,
    distance: `${distance.toFixed(1)} km`,
    duration: formatDuration(durationSeconds),
    distanceValue: distance * 1000, // meters
    durationValue: durationSeconds
  };
};
