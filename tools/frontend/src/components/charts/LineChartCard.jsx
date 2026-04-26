import React from 'react';

export default function LineChartCard({ title, values = [] }) {
  const width = 560;
  const height = 180;
  const max = Math.max(...values, 100);
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * (width - 24) + 12;
      const y = height - (value / max) * (height - 24) - 12;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <section className="module-card chart-card">
      <h3>{title}</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="line-chart" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#62d6ff" />
            <stop offset="100%" stopColor="#8a7bff" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((row) => (
          <line
            key={row}
            x1="0"
            y1={row * 45 + 20}
            x2={width}
            y2={row * 45 + 20}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
        ))}
        <polyline
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    </section>
  );
}
