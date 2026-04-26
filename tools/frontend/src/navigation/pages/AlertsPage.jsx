
import React from 'react';

export default function AlertsPage({ alerts = [] }) {
  return (
    <div className="page-stack">
      <div className="section-card">
        <h2>Alertas</h2>
        <div className="recent-list">
          {alerts.map((item, index) => <div key={index}>{item}</div>)}
        </div>
      </div>
    </div>
  );
}
