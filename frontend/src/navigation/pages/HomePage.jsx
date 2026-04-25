
import React from 'react';

export default function HomePage({ destination, setDestination, onVoice, onStart, favorites = [], recents = [] }) {
  return (
    <div className="page-stack">
      <div className="hero-card">
        <h1>Para onde vamos?</h1>
        <p>Fale ou digite o destino para a Megan iniciar a navegação.</p>
        <div className="search-row">
          <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Digite o endereço ou destino" />
          <button onClick={onVoice}>Voz</button>
        </div>
        <button className="primary" onClick={onStart}>Iniciar rota</button>
      </div>

      <div className="section-card">
        <h2>Favoritos</h2>
        <div className="pill-grid">{favorites.map((item) => <span key={item}>{item}</span>)}</div>
      </div>

      <div className="section-card">
        <h2>Recentes</h2>
        <div className="recent-list">{recents.map((item) => <div key={item}>{item}</div>)}</div>
      </div>
    </div>
  );
}
