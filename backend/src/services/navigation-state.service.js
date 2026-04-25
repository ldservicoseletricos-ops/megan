function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function normalizeDeviceLocation(deviceLocation = null) {
  if (!deviceLocation || typeof deviceLocation !== 'object') return null;
  const lat = toNumber(deviceLocation.lat ?? deviceLocation.latitude);
  const lng = toNumber(deviceLocation.lng ?? deviceLocation.lon ?? deviceLocation.longitude);
  if (lat === null || lng === null) return null;
  return {
    lat,
    lng,
    heading: toNumber(deviceLocation.heading),
    speed: toNumber(deviceLocation.speed),
    updatedAt: new Date().toISOString(),
  };
}

export function buildNavigationState({ destination = '', route = null, location = null } = {}) {
  const safeDestination = String(destination || '').trim();
  const hasLocation = Boolean(location && typeof location.lat === 'number' && typeof location.lng === 'number');
  const status = route?.summary === 'route_executed'
    ? 'navigating'
    : hasLocation && safeDestination
      ? 'calculating'
      : safeDestination
        ? 'waiting_location'
        : 'idle';

  return {
    status,
    hasLocation,
    destination: safeDestination,
    isNavigating: status === 'navigating',
    location,
    startedAt: new Date().toISOString(),
  };
}
