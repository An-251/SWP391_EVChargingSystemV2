import { useState, useEffect } from 'react';

const DEFAULT_LOCATION = { lat: 10.7769, lng: 106.7009 }; // Ho Chi Minh City

export const useUserLocation = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLoadingLocation(false);
        },
        (error) => {
          console.log('Error getting location:', error);
          setLocationError(error.message);
          // Default to Ho Chi Minh City center
          setUserLocation(DEFAULT_LOCATION);
          setIsLoadingLocation(false);
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
      setUserLocation(DEFAULT_LOCATION);
      setIsLoadingLocation(false);
    }
  }, []);

  return { userLocation, locationError, isLoadingLocation };
};

export default useUserLocation;
