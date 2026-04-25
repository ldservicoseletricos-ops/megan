
import React from 'react';
import { MapContainer, Marker, Polyline, TileLayer, Popup } from 'react-leaflet';
import L from 'leaflet';

const startIcon = new L.DivIcon({
  className: 'custom-pin',
  html: '<div class="pin pin-start"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const endIcon = new L.DivIcon({
  className: 'custom-pin',
  html: '<div class="pin pin-end"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export default function LiveMap({ center, destinationPoint, routeLine = [] }) {
  const hasRoute = Array.isArray(routeLine) && routeLine.length > 1;
  return (
    <div className="live-map-shell">
      <MapContainer center={center} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center} icon={startIcon}>
          <Popup>Sua posição</Popup>
        </Marker>
        {destinationPoint ? (
          <Marker position={destinationPoint} icon={endIcon}>
            <Popup>Destino</Popup>
          </Marker>
        ) : null}
        {hasRoute ? <Polyline positions={routeLine} pathOptions={{ color: '#5fb3ff', weight: 6 }} /> : null}
      </MapContainer>
    </div>
  );
}
