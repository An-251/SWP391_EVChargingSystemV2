import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Star, Clock, Zap } from 'lucide-react'

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const defaultCenter = [10.7769, 106.7009] // Ho Chi Minh City

// Custom marker icons
const createCustomIcon = (color, isAvailable) => {
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
  })
}

const userLocationIcon = L.divIcon({
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
})

// Component to handle map center and zoom
function MapController({ center, selectedStation }) {
  const map = useMap()

  useEffect(() => {
    if (selectedStation && selectedStation.coordinates) {
      map.setView(selectedStation.coordinates, 15, {
        animate: true,
        duration: 1
      })
    } else if (center) {
      map.setView(center, 13)
    }
  }, [selectedStation, center, map])

  return null
}

// Component to calculate and display route
function RoutePolyline({ userLocation, destination }) {
  const [routeCoordinates, setRouteCoordinates] = useState([])

  useEffect(() => {
    if (userLocation && destination) {
      // Simple straight line for now - you can integrate OSRM API for actual routing
      setRouteCoordinates([
        [userLocation.lat || userLocation[0], userLocation.lng || userLocation[1]],
        [destination.lat || destination[0], destination.lng || destination[1]]
      ])
    } else {
      setRouteCoordinates([])
    }
  }, [userLocation, destination])

  if (routeCoordinates.length === 0) return null

  return (
    <Polyline
      positions={routeCoordinates}
      color="#10B981"
      weight={4}
      opacity={0.8}
    />
  )
}

function DriverMap({ stations = [], selectedStation, userLocation, onStationSelect }) {
  const mapRef = useRef(null)
  const [activeMarker, setActiveMarker] = useState(null)

  // Map center based on user location or default
  const center = userLocation 
    ? (userLocation.lat ? [userLocation.lat, userLocation.lng] : userLocation)
    : defaultCenter

  // Handle marker click
  const handleMarkerClick = (station) => {
    setActiveMarker(station.id)
    if (onStationSelect) {
      onStationSelect(station)
    }
  }

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={center}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        ref={mapRef}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController center={center} selectedStation={selectedStation} />

        {/* User location marker */}
        {userLocation && (
          <Marker
            position={userLocation.lat ? [userLocation.lat, userLocation.lng] : userLocation}
            icon={userLocationIcon}
          >
            <Popup>
              <div className="text-sm font-semibold">Vị trí của bạn</div>
            </Popup>
          </Marker>
        )}

        {/* Charging station markers */}
        {stations.map((station) => {
          const position = station.coordinates?.lat 
            ? [station.coordinates.lat, station.coordinates.lng]
            : station.coordinates

          return (
            <Marker
              key={station.id}
              position={position}
              icon={createCustomIcon('#10B981', station.availableSlots > 0)}
              eventHandlers={{
                click: () => handleMarkerClick(station)
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
                    onClick={() => {
                      if (onStationSelect) {
                        onStationSelect(station)
                      }
                    }}
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
          )
        })}

        {/* Route polyline */}
        {selectedStation && userLocation && (
          <RoutePolyline
            userLocation={userLocation}
            destination={selectedStation.coordinates}
          />
        )}
      </MapContainer>
    </div>
  )
}

export default DriverMap