import React from 'react';

export default function SparkBars({ items = [] }) {
  return (
    <div className="spark-list">
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} className="spark-row">
          <div className="spark-meta">
            <span>{item.label}</span>
            <strong>{item.value}%</strong>
          </div>
          <div className="spark-track">
            <div className="spark-fill" style={{ width: `${item.value}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
