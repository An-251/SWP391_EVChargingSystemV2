/**
 * Map Picker Component
 * Interactive map for selecting latitude and longitude coordinates
 */

import React, { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Crosshair } from 'lucide-react';

// Fix for default marker icon in Leaflet with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Component to handle map clicks
function LocationMarker({ position, onPositionChange }) {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function MapPicker({ latitude, longitude, onChange }) {
  const defaultCenter = { lat: 10.8231, lng: 106.6297 }; // Ho Chi Minh City center
  const [position, setPosition] = useState(
    latitude && longitude ? { lat: latitude, lng: longitude } : defaultCenter
  );

  const handlePositionChange = useCallback((newPosition) => {
    setPosition(newPosition);
    onChange({
      latitude: newPosition.lat,
      longitude: newPosition.lng,
    });
  }, [onChange]);

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (location) => {
          const newPosition = {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
          };
          setPosition(newPosition);
          onChange({
            latitude: newPosition.lat,
            longitude: newPosition.lng,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your current location. Please ensure location access is enabled.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <MapPin className="w-4 h-4" />
          Select Location on Map
        </label>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Crosshair className="w-4 h-4" />
          Use Current Location
        </button>
      </div>
      
      <div className="relative rounded-lg overflow-hidden border-2 border-gray-300 shadow-sm">
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={13}
          style={{ height: '300px', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} onPositionChange={handlePositionChange} />
        </MapContainer>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded">
        <MapPin className="w-3 h-3" />
        <span>
          Click on the map to select coordinates: <strong>Lat: {position.lat.toFixed(6)}</strong>, <strong>Lng: {position.lng.toFixed(6)}</strong>
        </span>
      </div>
    </div>
  );
}
