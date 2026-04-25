import React, { useEffect, useState } from 'react';
import { coreApi } from '../lib/coreApi';
function Metric({ item }) { return <article className="core40-metric"><span>{item.label}</span><strong>{item.value}</strong><em>{item.trend}</em></article>; }
export default function CoreDashboardPage() {
  const [data, setData] = useState(null); const [error, setError] = useState('');
  useEffect(() => { let mounted = true; Promise.all([coreApi.dashboard(), coreApi.priorities(), coreApi.context()]).then(([dashboard, priorities, context]) => { if (mounted) setData({ dashboard, priorities, context }); }).catch((err) => { if (mounted) setError(err.message || 'Falha ao carregar Core 4.0'); }); return () => { mounted = false; }; }, []);
  if (error) return <div className="core40-page"><div className="core40-alert">{error}</div></div>;
  if (!data) return <div className="core40-page"><div className="core40-alert">Carregando Megan OS 4.0...</div></div>;
  const { dashboard, priorities, context } = data;
  return <div className="core40-page">
    <section className="core40-hero"><div><span>MEGAN OS 4.0</span><h1>Sistema Operacional Cognitivo</h1><p>Central unificada para vida pessoal, negócios, equipes, CRM, autonomia, memória e decisões operacionais.</p></div><button onClick={() => coreApi.execute({ action: 'summarize_next_step' })}>Executar próximo passo</button></section>
    <section className="core40-metrics">{(dashboard.topMetrics || []).map((item) => <Metric key={item.label} item={item} />)}</section>
    <section className="core40-grid">
      <article className="core40-card"><h3>Prioridades do sistema</h3>{(priorities.priorities || []).map((p) => <div className="core40-row" key={p.id}><strong>{p.title}</strong><span>{p.area} · score {p.score}</span></div>)}</article>
      <article className="core40-card"><h3>Recomendações</h3>{(dashboard.recommendations || []).map((r) => <div className="core40-row" key={r.title}><strong>{r.title}</strong><span>{r.action}</span></div>)}</article>
      <article className="core40-card"><h3>Áreas operacionais</h3>{Object.entries(dashboard.sections || {}).map(([key, value]) => <div className="core40-row" key={key}><strong>{key}</strong><span>{value.focus}</span></div>)}</article>
      <article className="core40-card"><h3>Contexto vivo</h3>{(context.context?.detectedPatterns || []).map((item) => <div className="core40-row" key={item}><strong>padrão detectado</strong><span>{item}</span></div>)}</article>
    </section>
  </div>;
}
