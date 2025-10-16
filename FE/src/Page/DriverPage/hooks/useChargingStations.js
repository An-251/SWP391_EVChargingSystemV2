import { useState, useEffect } from 'react';

// Calculate distance between two points (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
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

// Calculate estimated time based on distance (assuming 40 km/h average speed in city)
const calculateEstimatedTime = (distanceKm) => {
  const avgSpeedKmh = 40;
  const hours = distanceKm / avgSpeedKmh;
  const minutes = Math.round(hours * 60);
  return minutes < 60 ? `${minutes} phút` : `${Math.round(hours * 10) / 10} giờ`;
};

export const useChargingStations = (rawStations, userLocation) => {
  const [chargingStations, setChargingStations] = useState([]);

  useEffect(() => {
    if (!rawStations || rawStations.length === 0) {
      setChargingStations([]);
      return;
    }

    const transformed = rawStations
      .filter(station => station.latitude && station.longitude) // Only stations with coordinates
      .map(station => {
        let distance = null;
        let distanceValue = 999999;

        // Calculate distance if user location is available
        if (userLocation) {
          distance = calculateDistance(
            userLocation.lat || userLocation[0],
            userLocation.lng || userLocation[1],
            station.latitude,
            station.longitude
          );
          distanceValue = distance;
        }

        // Count available slots from charging points
        const totalSlots = station.chargingPoints?.length || 0;
        const availableSlots = station.chargingPoints?.filter(
          point => point.status === 'AVAILABLE' || point.status === 'available'
        ).length || 0;

        return {
          id: station.id,
          name: station.stationName || `Trạm sạc ${station.id}`,
          address: station.facility?.address || 'Chưa có địa chỉ',
          distance: distance ? `${distance.toFixed(1)} km` : 'N/A',
          distanceValue: distanceValue,
          availableSlots: availableSlots,
          totalSlots: totalSlots,
          price: '5,000 VNĐ/kWh', // Default price
          rating: 4.5, // Default rating
          estimatedTime: distance ? calculateEstimatedTime(distance) : 'N/A',
          fastCharging: true,
          status: station.status,
          coordinates: { lat: station.latitude, lng: station.longitude }
        };
      })
      .sort((a, b) => a.distanceValue - b.distanceValue); // Sort by distance

    setChargingStations(transformed);
  }, [rawStations, userLocation]);

  return chargingStations;
};

export default useChargingStations;
