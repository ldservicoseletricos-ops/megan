import React, { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

export default function SelfEvolution19Page() {
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('validar sistema');
  const [reply, setReply] = useState('');

  async function loadStatus() {
    try {
      const response = await fetch(`${API_URL}/api/self-evolution-19/status`);
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      setStatus({ ok: false, status: 'offline', score: 0, error: error.message });
    }
  }

  async function askMegan(event) {
    event?.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/self-evolution-19/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      const data = await response.json();
      setReply(data.answer || 'Sem resposta do motor 19.0.');
      if (data.audit) setStatus(data.audit);
    } catch (error) {
      setReply(`Erro ao consultar Self Evolution 19.0: ${error.message}`);
    }
  }

  useEffect(() => { loadStatus(); }, []);

  return (
    <section className="page-shell">
      <div className="hero-card">
        <p className="eyebrow">Megan OS 19.0</p>
        <h1>Self Evolution Engine</h1>
        <p>Auditoria segura do próprio sistema, plano de evolução e delegação supervisionada.</p>
      </div>
      <div className="grid-3">
        <div className="metric-card"><span>Saúde</span><strong>{status?.score ?? '--'}%</strong><small>{status?.status || 'carregando'}</small></div>
        <div className="metric-card"><span>Backend</span><strong>{status?.files?.backend ?? '--'}</strong><small>arquivos analisados</small></div>
        <div className="metric-card"><span>Frontend</span><strong>{status?.files?.frontend ?? '--'}</strong><small>arquivos analisados</small></div>
      </div>
      <form className="command-card" onSubmit={askMegan}>
        <label>Delegar ou validar pelo chat</label>
        <textarea value={message} onChange={(event) => setMessage(event.target.value)} />
        <button type="submit">Enviar para Megan 19.0</button>
      </form>
      {reply && <div className="response-card">{reply}</div>}
      <div className="panel-card">
        <h2>Prioridades detectadas</h2>
        {(status?.priorities || []).map((item) => <p key={item}>• {item}</p>)}
      </div>
    </section>
  );
}
