import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

function MapController({ center, selectedStation }) {
  const map = useMap();

  useEffect(() => {
    if (selectedStation && selectedStation.coordinates) {
      map.setView(selectedStation.coordinates, 15, {
        animate: true,
        duration: 1
      });
    } else if (center) {
      map.setView(center, 13);
    }
  }, [selectedStation, center, map]);

  return null;
}

export default MapController;
