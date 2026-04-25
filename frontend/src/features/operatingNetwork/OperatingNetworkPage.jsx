import React, { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

const fallback = {
  version: '6.5.0',
  name: 'Megan Operating Network',
  mission: 'Unificar todos os módulos da Megan OS em uma rede operacional para pessoas, empresas, agentes, lojas, voz e comunidade.',
  onlineModules: 17,
  totalModules: 17,
  pillars: ['dashboard executivo', 'times', 'CRM', 'financeiro', 'metas', 'BI', 'rotina', 'saúde', 'produtividade', 'voz', 'marketplace', 'comunidade', 'jobs executados'],
  layers: [
    { name: 'Pessoa', modules: ['Personal Life OS', 'Copiloto Pessoal', 'Saúde', 'Rotina', 'Foco'] },
    { name: 'Empresa', modules: ['Business Cloud', 'CRM', 'Financeiro', 'Times', 'BI'] },
    { name: 'IA', modules: ['Agentes', 'Autonomia', 'Aprendizado Contínuo', 'Execução de Jobs'] },
    { name: 'Rede', modules: ['Megan Nation', 'Marketplace Humano + IA', 'App Store', 'Comunidade'] },
    { name: 'Presença', modules: ['Megan Voice', 'Celular', 'Carro', 'Casa', 'Escritório'] },
  ],
  phases: []
};

export default function OperatingNetworkPage() {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch(`${API_URL}/api/operating-network/overview`)
      .then((response) => response.ok ? response.json() : fallback)
      .then((payload) => {
        if (alive) setData({ ...fallback, ...payload });
      })
      .catch(() => {
        if (alive) setData(fallback);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, []);

  return (
    <div className="feature-page operating-network-page">
      <section className="feature-hero operating-network-hero">
        <div>
          <span className="omega-kicker">MEGAN OS {data.version}</span>
          <h1>{data.name}</h1>
          <p>{data.mission}</p>
        </div>
        <div className="feature-hero-metric">
          <strong>{data.onlineModules}/{data.totalModules}</strong>
          <span>{loading ? 'sincronizando módulos' : 'módulos unificados'}</span>
        </div>
      </section>

      <section className="feature-grid three">
        <article className="feature-card glow-card">
          <span>Rede operacional</span>
          <strong>Empresas + pessoas + IA</strong>
          <p>Cada empresa, usuário, agente, app, voz e comunidade roda em cima da mesma base Megan.</p>
        </article>
        <article className="feature-card glow-card">
          <span>Execução</span>
          <strong>Jobs humanos + IA</strong>
          <p>Central para tarefas, agentes, marketplace, times formados por IA e operação contínua.</p>
        </article>
        <article className="feature-card glow-card">
          <span>Controle</span>
          <strong>Camadas integradas</strong>
          <p>Vida pessoal, Business Cloud, CRM, financeiro, BI, voz, app store e Nation conectados.</p>
        </article>
      </section>

      <section className="network-layer-grid">
        {data.layers.map((layer) => (
          <article key={layer.name} className="network-layer-card">
            <span>{layer.name}</span>
            <div>
              {layer.modules.map((item) => <em key={item}>{item}</em>)}
            </div>
          </article>
        ))}
      </section>

      <section className="network-pillars">
        {data.pillars.map((pillar) => <span key={pillar}>{pillar}</span>)}
      </section>

      <section className="network-timeline">
        {(data.phases.length ? data.phases : fallback.phases).map((phase) => (
          <article key={phase.id}>
            <strong>{phase.id}</strong>
            <div>
              <h3>{phase.name}</h3>
              <p>{phase.area} • {phase.status}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
