import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  InfoWindow,
  DirectionsRenderer,
} from '@react-google-maps/api'
import { useState, useCallback, useEffect } from 'react'
import { MapPin, Zap, Star, Clock, Battery } from 'lucide-react'

const defaultCenter = { lat: 10.7769, lng: 106.7009 } // Ho Chi Minh City

function DriverMap({ stations = [], selectedStation, userLocation, onStationSelect }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  })

  const [map, setMap] = useState(null)
  const [directionsResponse, setDirectionsResponse] = useState(null)
  const [activeMarker, setActiveMarker] = useState(null)

  // Map center based on user location or default
  const center = userLocation || defaultCenter

  const onLoad = useCallback((map) => {
    setMap(map)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  // Calculate route to selected station
  useEffect(() => {
    if (selectedStation && userLocation && window.google) {
      const directionsService = new window.google.maps.DirectionsService()
      
      directionsService.route({
        origin: userLocation,
        destination: selectedStation.coordinates,
        travelMode: window.google.maps.TravelMode.DRIVING,
      })
      .then((result) => {
        setDirectionsResponse(result)
      })
      .catch((error) => {
        console.error('Error calculating route:', error)
        setDirectionsResponse(null)
      })
    } else {
      setDirectionsResponse(null)
    }
  }, [selectedStation, userLocation])

  // Handle marker click
  const handleMarkerClick = (station) => {
    setActiveMarker(station.id)
    if (onStationSelect) {
      onStationSelect(station)
    }
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải bản đồ...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={13}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        }}
      >
        {/* User location marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="white" stroke-width="3"/>
                  <circle cx="12" cy="12" r="3" fill="white"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(24, 24),
            }}
            title="Vị trí của bạn"
          />
        )}

        {/* Charging station markers */}
        {stations.map((station) => (
          <Marker
            key={station.id}
            position={station.coordinates}
            onClick={() => handleMarkerClick(station)}
            icon={{
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="15" fill="${station.availableSlots > 0 ? '#10B981' : '#EF4444'}" stroke="white" stroke-width="2"/>
                  <path d="M12 10h8v12h-8V10z" fill="white"/>
                  <path d="M14 12h4v8h-4v-8z" fill="${station.availableSlots > 0 ? '#10B981' : '#EF4444'}"/>
                  <circle cx="16" cy="16" r="2" fill="white"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(32, 32),
            }}
            title={station.name}
          />
        ))}

        {/* Info window for active marker */}
        {activeMarker && (
          <InfoWindow
            position={stations.find(s => s.id === activeMarker)?.coordinates}
            onCloseClick={() => setActiveMarker(null)}
          >
            <div className="p-2 max-w-xs">
              {(() => {
                const station = stations.find(s => s.id === activeMarker)
                return (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm">{station.name}</h3>
                      {station.fastCharging && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                          Nhanh
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-2">{station.address}</p>
                    
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600">{station.distance}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600">{station.estimatedTime}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-gray-600">{station.rating}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${
                            station.availableSlots > 0 ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <span className="text-gray-600">
                            {station.availableSlots}/{station.totalSlots} trống
                          </span>
                        </div>
                        
                        <span className="font-semibold text-green-600">
                          {station.price}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        if (onStationSelect) {
                          onStationSelect(station)
                        }
                        setActiveMarker(null)
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
                )
              })()}
            </div>
          </InfoWindow>
        )}

        {/* Directions renderer */}
        {directionsResponse && (
          <DirectionsRenderer
            directions={directionsResponse}
            options={{
              polylineOptions: {
                strokeColor: '#10B981',
                strokeWeight: 4,
                strokeOpacity: 0.8,
              },
              suppressMarkers: true,
            }}
          />
        )}
      </GoogleMap>
    </div>
  )
}

export default DriverMap