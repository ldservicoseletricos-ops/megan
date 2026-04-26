
import React from 'react';

export default function BottomNav({ current, onChange }) {
  const items = [
    ['home', 'Início'],
    ['route', 'Rota'],
    ['alerts', 'Alertas'],
    ['profile', 'Perfil'],
  ];
  return (
    <nav className="bottom-nav">
      {items.map(([id, label]) => (
        <button key={id} className={current === id ? 'active' : ''} onClick={() => onChange(id)}>
          {label}
        </button>
      ))}
    </nav>
  );
}
