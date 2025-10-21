import { useState, useEffect } from 'react';
import { Polyline, Popup, Marker } from 'react-leaflet';
import L from 'leaflet';
import { message } from 'antd';

// Simple marker for route start/end
const routeMarkerIcon = (color) => L.divIcon({
  className: 'route-marker',
  html: `<div style="background: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

function RoutePolyline({ userLocation, destination, showInstructions = true, onRouteInfoUpdate }) {
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userLocation && destination) {
      fetchRoute();
    } else {
      setRouteCoordinates([]);
      setRouteInfo(null);
    }
  }, [userLocation, destination]);

  const fetchRoute = async () => {
    try {
      setLoading(true);
      const start = `${userLocation.lng || userLocation[1]},${userLocation.lat || userLocation[0]}`;
      const end = `${destination.lng || destination[1]},${destination.lat || destination[0]}`;
      
      // Use OSRM API for actual routing
      const url = `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson&steps=true`;
      
      console.log('🗺️ [RoutePolyline] Fetching route from OSRM:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        
        // Convert GeoJSON coordinates to Leaflet format [lat, lng]
        const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        setRouteCoordinates(coordinates);
        
        // Extract route info
        const distanceKm = (route.distance / 1000).toFixed(1);
        const durationMin = Math.round(route.duration / 60);
        
        const info = {
          distance: `${distanceKm} km`,
          duration: durationMin > 60 ? `${Math.floor(durationMin / 60)}h ${durationMin % 60}m` : `${durationMin} phút`,
          steps: route.legs[0].steps.map(step => ({
            instruction: step.maneuver.modifier 
              ? `${getManeuverText(step.maneuver.type)} ${step.maneuver.modifier}` 
              : getManeuverText(step.maneuver.type),
            distance: `${(step.distance / 1000).toFixed(1)} km`,
            location: step.maneuver.location
          }))
        };
        
        setRouteInfo(info);
        
        // Call parent callback if provided
        if (onRouteInfoUpdate) {
          onRouteInfoUpdate(info);
        }
        
        console.log('✅ [RoutePolyline] Route fetched successfully:', {
          distance: distanceKm,
          duration: durationMin,
          points: coordinates.length
        });
      } else {
        console.warn('⚠️ [RoutePolyline] No route found, using straight line');
        useFallbackRoute();
      }
    } catch (error) {
      console.error('❌ [RoutePolyline] Error fetching route:', error);
      message.warning('Không thể tải đường đi, sử dụng đường thẳng');
      useFallbackRoute();
    } finally {
      setLoading(false);
    }
  };

  const useFallbackRoute = () => {
    // Fallback to straight line if OSRM fails
    setRouteCoordinates([
      [userLocation.lat || userLocation[0], userLocation.lng || userLocation[1]],
      [destination.lat || destination[0], destination.lng || destination[1]]
    ]);
    
    // Calculate simple distance
    const distance = calculateDistance(
      userLocation.lat || userLocation[0],
      userLocation.lng || userLocation[1],
      destination.lat || destination[0],
      destination.lng || destination[1]
    );
    
    const info = {
      distance: `${distance.toFixed(1)} km`,
      duration: `${Math.round((distance / 40) * 60)} phút`,
      steps: [{
        instruction: 'Đi thẳng đến đích',
        distance: `${distance.toFixed(1)} km`
      }]
    };
    
    setRouteInfo(info);
    
    // Call parent callback if provided
    if (onRouteInfoUpdate) {
      onRouteInfoUpdate(info);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getManeuverText = (type) => {
    const maneuvers = {
      'turn': 'Rẽ',
      'new name': 'Tiếp tục',
      'depart': 'Bắt đầu',
      'arrive': 'Đến đích',
      'merge': 'Nhập làn',
      'on ramp': 'Lên đường cao tốc',
      'off ramp': 'Xuống đường cao tốc',
      'fork': 'Chọn làn',
      'end of road': 'Cuối đường',
      'continue': 'Tiếp tục',
      'roundabout': 'Vào vòng xuyến',
      'rotary': 'Vào vòng xuyến',
      'roundabout turn': 'Rời vòng xuyến',
      'notification': 'Lưu ý',
      'exit roundabout': 'Rời vòng xuyến',
      'exit rotary': 'Rời vòng xuyến'
    };
    return maneuvers[type] || 'Tiếp tục';
  };

  if (routeCoordinates.length === 0) return null;

  return (
    <>
      {/* Route Polyline */}
      <Polyline
        positions={routeCoordinates}
        color="#10B981"
        weight={5}
        opacity={0.7}
        dashArray={loading ? "10, 10" : null}
      >
        {showInstructions && routeInfo && (
          <Popup maxWidth={280}>
            <div className="p-2">
              <h3 className="font-bold text-green-600 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Thông tin chỉ đường
              </h3>
              
              {/* Distance and Duration */}
              <div className="flex gap-4 mb-3 text-sm">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="font-semibold">{routeInfo.distance}</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold">{routeInfo.duration}</span>
                </div>
              </div>
              
              {/* Turn-by-turn instructions */}
              {routeInfo.steps && routeInfo.steps.length > 0 && (
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  <p className="text-xs font-semibold text-gray-600 mb-1">Hướng dẫn từng bước:</p>
                  {routeInfo.steps.slice(0, 8).map((step, index) => (
                    <div key={index} className="text-xs flex items-start gap-2 py-1 border-b border-gray-100 last:border-0">
                      <span className="bg-green-100 text-green-700 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-gray-800 font-medium">{step.instruction}</p>
                        <p className="text-gray-500 text-[10px]">{step.distance}</p>
                      </div>
                    </div>
                  ))}
                  {routeInfo.steps.length > 8 && (
                    <p className="text-xs text-gray-500 italic pt-1">
                      +{routeInfo.steps.length - 8} bước nữa...
                    </p>
                  )}
                </div>
              )}
            </div>
          </Popup>
        )}
      </Polyline>

      {/* Start marker */}
      <Marker
        position={[userLocation.lat || userLocation[0], userLocation.lng || userLocation[1]]}
        icon={routeMarkerIcon('#3B82F6')}
      >
        <Popup>
          <div className="text-sm font-semibold">Điểm xuất phát</div>
        </Popup>
      </Marker>

      {/* End marker */}
      <Marker
        position={[destination.lat || destination[0], destination.lng || destination[1]]}
        icon={routeMarkerIcon('#10B981')}
      >
        <Popup>
          <div className="text-sm font-semibold">Đích đến</div>
        </Popup>
      </Marker>
    </>
  );
}

export default RoutePolyline;
