// frontend/src/hooks/useCheckpointArrival.js
import { useEffect, useState } from 'react';
import { useGeolocation } from './useGeolocation';

function getDistance(lat1, lon1, lat2, lon2) {
  // Haversine formula
  const R = 6371e3;
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(Δφ/2)*Math.sin(Δφ/2) +
            Math.cos(φ1)*Math.cos(φ2)*
            Math.sin(Δλ/2)*Math.sin(Δλ/2);
  const c = 2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function useCheckpointArrival(checkpoints, demoMode) {
  const { coords } = useGeolocation();
  const [arrived, setArrived] = useState(null);

  useEffect(() => {
    if (demoMode) return; // simulate via button
    if (!coords || !checkpoints.length) return;

    for (const cp of checkpoints) {
      const dist = getDistance(coords.lat, coords.lng, cp.lat, cp.lng);
      if (dist < cp.radius_m) {
        setArrived(cp);
        break;
      }
    }
  }, [coords, checkpoints, demoMode]);

  return arrived;
}