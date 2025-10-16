import { useState, useEffect } from 'react';
import { Polyline } from 'react-leaflet';

function RoutePolyline({ userLocation, destination }) {
  const [routeCoordinates, setRouteCoordinates] = useState([]);

  useEffect(() => {
    if (userLocation && destination) {
      // Simple straight line for now - you can integrate OSRM API for actual routing
      setRouteCoordinates([
        [userLocation.lat || userLocation[0], userLocation.lng || userLocation[1]],
        [destination.lat || destination[0], destination.lng || destination[1]]
      ]);
    } else {
      setRouteCoordinates([]);
    }
  }, [userLocation, destination]);

  if (routeCoordinates.length === 0) return null;

  return (
    <Polyline
      positions={routeCoordinates}
      color="#10B981"
      weight={4}
      opacity={0.8}
    />
  );
}

export default RoutePolyline;
