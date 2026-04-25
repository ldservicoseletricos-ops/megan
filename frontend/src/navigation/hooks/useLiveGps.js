import { useEffect, useMemo, useState } from 'react';

export function useLiveGps({ storeTrack = false } = {}) {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState('');
  const [track, setTrack] = useState([]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocalização não suportada.');
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition(pos);
        if (storeTrack) {
          setTrack((prev) => {
            const nextPoint = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              speed: pos.coords.speed,
              ts: Date.now(),
            };
            return [...prev.slice(-11), nextPoint];
          });
        }
      },
      (err) => setError(err.message || 'Falha no GPS.'),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 12000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [storeTrack]);

  const accuracyLabel = useMemo(() => {
    const accuracy = position?.coords?.accuracy;
    if (typeof accuracy !== 'number') return 'bom';
    if (accuracy <= 12) return 'forte';
    if (accuracy <= 30) return 'bom';
    return 'fraco';
  }, [position]);

  return { position, error, track, accuracyLabel };
}
