import React, { useEffect, useState } from 'react';
import { getSystemHealth25Status } from './systemHealth25Api';

function Badge({ ok }) {
  return <span className={`omega-top-pill ${ok ? '' : 'danger'}`}>{ok ? 'OK' : 'Atenção'}</span>;
}

export default function SystemHealth25Page() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    setError('');
    try { setData(await getSystemHealth25Status()); }
    catch (err) { setError(err.message || 'Falha ao carregar diagnóstico.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { refresh(); }, []);

  const required = data?.requiredFiles || [];
  const env = data?.envSafety || [];
  const deps = data?.packages?.backend?.dependencies || [];
  const actions = data?.nextActions || [];

  return <div className="osm22-page">
    <section className="osm22-hero">
      <div><span className="omega-kicker">MEGAN OS 25.0</span><h1>System Health Center</h1><p>Diagnóstico de estrutura, ambiente, módulos, dependências e prontidão de deploy.</p></div>
      <div className="osm22-score"><strong>{data?.score ?? 0}%</strong><span>{loading ? 'analisando' : data?.status || 'offline'}</span></div>
    </section>

    {error && <div className="osm22-proposal"><strong>Erro</strong><p>{error}</p><button onClick={refresh}>Tentar novamente</button></div>}

    <section className="osm22-metrics">
      <article><span>Arquivos base</span><strong>{required.filter((i) => i.exists).length}/{required.length}</strong><p>essenciais</p></article>
      <article><span>Ambiente</span><strong>{env.filter((i) => i.safe).length}/{env.length}</strong><p>segurança</p></article>
      <article><span>Módulos</span><strong>{data?.modules?.withRoutes || 0}</strong><p>rotas detectadas</p></article>
      <article><span>Versão</span><strong>{data?.version || '25.0.0'}</strong><p>stability center</p></article>
    </section>

    <section className="osm22-layout">
      <div className="osm22-chat">
        <div className="osm22-actions"><button onClick={refresh} disabled={loading}>{loading ? 'Atualizando...' : 'Atualizar diagnóstico'}</button></div>
        <section className="osm22-side"><h3>Arquivos essenciais</h3>{required.map((file) => <div className="osm22-task" key={file.relative}><strong>{file.relative}</strong><span>{file.exists ? `${file.size} bytes` : 'ausente'}</span><Badge ok={file.exists} /></div>)}</section>
        <section className="osm22-side"><h3>Segurança de ambiente</h3>{env.map((item) => <div className="osm22-task" key={item.relative}><strong>{item.relative}</strong><span>{item.exists ? (item.warnings?.join(' | ') || 'sem alerta') : 'não existe'}</span><Badge ok={item.safe} /></div>)}</section>
      </div>
      <aside className="osm22-side">
        <section><h3>Dependências backend</h3>{deps.map((dep) => <div className="osm22-task" key={dep}><strong>{dep}</strong><span>backend/package.json</span></div>)}</section>
        <section><h3>Próximas ações</h3>{actions.map((item) => <div className="osm22-task" key={item}><strong>{item}</strong><span>recomendado</span></div>)}</section>
      </aside>
    </section>
  </div>;
}
