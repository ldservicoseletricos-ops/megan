import React, { useMemo } from 'react';

function buildMapUrl(position) {
  const lat = position?.coords?.latitude ?? -23.55052;
  const lng = position?.coords?.longitude ?? -46.633308;
  const delta = 0.008;
  const bbox = [lng - delta, lat - delta, lng + delta, lat + delta].join('%2C');
  const marker = `${lat}%2C${lng}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`;
}

function buildTrackPath(track = [], routePath = []) {
  if (Array.isArray(routePath) && routePath.length) {
    return routePath.map((point) => `${point.x},${point.y}`).join(' ');
  }
  if (!track.length) return '';
  return track.map((item, index) => `${12 + index * 10},${84 - Math.min(60, index * 7)}`).join(' ');
}

export default function MapCard({ position, routeSummary, fullscreen = false }) {
  const mapUrl = useMemo(() => buildMapUrl(position), [position]);
  const trackPath = useMemo(() => buildTrackPath(routeSummary?.track || [], routeSummary?.routePath || []), [routeSummary?.track, routeSummary?.routePath]);
  const hudMetrics = routeSummary?.hudMetrics || [];

  return (
    <div className={`map-card ${fullscreen ? 'map-card-fullscreen' : ''}`}>
      <div className="live-map-shell live-map-shell-v26">
        <iframe className="live-map-frame" title="Mapa ao vivo" src={mapUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        <div className="map-overlay-gradient" />
        <div className="map-overlay-top">
          <div className="speed-chip">{routeSummary?.speedText || '—'}</div>
          <div className="eta-chip">{routeSummary?.etaText || '—'}</div>
        </div>
        <div className="map-overlay-bottom">
          <span className="provider-chip">OSM ao vivo</span>
          <span className="provider-chip">GPS {routeSummary?.accuracyLabel || 'bom'}</span>
          <span className="provider-chip provider-chip-accent">{routeSummary?.maneuverBadge || 'ROTA PRO'}</span>
        </div>
        <div className="map-hud-ribbon">
          <span>{routeSummary?.roadShield || 'SP-046'}</span>
          <strong>{routeSummary?.routeModeLabel || 'HUD DIREÇÃO PRO'}</strong>
          <span>{routeSummary?.laneFocusText || 'Faixa ideal ativa'}</span>
        </div>
        <svg className="map-track-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <polyline className="route-shadow" points={trackPath || '18,80 38,64 57,48 78,30'} />
          <polyline className="route-main" points={trackPath || '18,80 38,64 57,48 78,30'} />
          <polyline className="route-glow" points={trackPath || '18,80 38,64 57,48 78,30'} />
        </svg>
        <div className="mini-hud-grid">
          {hudMetrics.map((metric) => (
            <div key={metric.id} className="mini-hud-card">
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </div>
          ))}
        </div>
      </div>
      <div className="map-meta">
        <strong>{routeSummary?.nextInstruction || 'Aguardando rota'}</strong>
        <span>{routeSummary?.distanceText || '—'} • {routeSummary?.etaText || '—'} • {routeSummary?.destination || 'Destino ativo'}</span>
        <small>GPS: {position ? `${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}` : 'aguardando'} • precisão {routeSummary?.accuracyLabel || 'bom'}</small>
      </div>
    </div>
  );
}
