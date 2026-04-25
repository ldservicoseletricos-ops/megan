function formatTime(value) {
  if (!value) return 'agora';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function TimelineBar({ items = [] }) {
  if (!items.length) {
    return <p className="empty-state">Nenhum evento de timeline registrado ainda.</p>;
  }

  return (
    <div className="timeline-stack v2-timeline">
      {items.map((item, index) => (
        <div key={item.id || `${item.title || 'item'}-${index}`} className="timeline-item">
          <div className="timeline-dot-wrap">
            <div className="timeline-dot" />
          </div>
          <div className="timeline-card">
            <div className="timeline-topline">
              <strong className="timeline-title">{item.title || item.area || item.type || 'Evento'}</strong>
              <span className="timeline-time">{formatTime(item.createdAt || item.timestamp || item.time)}</span>
            </div>
            <p className="timeline-description">{item.summary || item.description || item.status || 'Sem detalhe adicional.'}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
