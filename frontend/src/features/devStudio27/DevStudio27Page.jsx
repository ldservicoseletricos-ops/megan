import React, { useEffect, useState } from 'react';
import { generateDevStudio27Plan, getDevStudio27Status } from './devStudio27Api';

export default function DevStudio27Page() {
  const [data, setData] = useState(null);
  const [objective, setObjective] = useState('Criar uma área de desenvolvimento e criação integrada à Megan OS');
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      setData(await getDevStudio27Status());
    } catch (err) {
      setError(err.message || 'Falha ao carregar Dev Studio 27.0.');
    } finally {
      setLoading(false);
    }
  }

  async function createPlan() {
    setWorking(true);
    setError('');
    try {
      setPlan(await generateDevStudio27Plan(objective));
    } catch (err) {
      setError(err.message || 'Falha ao gerar plano.');
    } finally {
      setWorking(false);
    }
  }

  useEffect(() => { load(); }, []);

  const studios = data?.studios || [];
  const phaseMap = data?.phaseMap || [];

  return (
    <div className="osm22-page devstudio27-page">
      <section className="osm22-hero">
        <div>
          <span className="omega-kicker">MEGAN OS 27.0</span>
          <h1>Dev Studio Real Completo</h1>
          <p>Área de desenvolvimento e criação conectada ao projeto inteiro, mantendo todos os módulos de fase que já existiam.</p>
        </div>
        <div className="osm22-score">
          <strong>{loading ? '...' : '27.0'}</strong>
          <span>{data?.status || 'carregando'}</span>
        </div>
      </section>

      {error && <div className="osm22-proposal"><strong>Erro</strong><p>{error}</p><button onClick={load}>Tentar novamente</button></div>}

      <section className="osm22-metrics">
        <article><span>Studios</span><strong>{studios.length}</strong><p>criação e desenvolvimento</p></article>
        <article><span>Fases preservadas</span><strong>{phaseMap.length}</strong><p>mapa completo ativo</p></article>
        <article><span>Backend</span><strong>{data?.status || 'offline'}</strong><p>/api/dev-studio/status</p></article>
        <article><span>Projeto</span><strong>Unificado</strong><p>sem apagar módulos antigos</p></article>
      </section>

      <section className="osm22-layout">
        <div className="osm22-chat">
          <section className="osm22-side devstudio27-command">
            <h3>Criar ou evoluir projeto</h3>
            <textarea value={objective} onChange={(event) => setObjective(event.target.value)} rows={4} />
            <div className="osm22-actions"><button onClick={createPlan} disabled={working}>{working ? 'Gerando...' : 'Gerar plano de criação'}</button><button onClick={load}>Atualizar painel</button></div>
          </section>

          {plan && <section className="osm22-side"><h3>Plano gerado</h3>{plan.plan?.map((item) => <div className="osm22-task" key={item}><strong>{item}</strong><span>{plan.module}</span></div>)}<p>{plan.nextAction}</p></section>}

          <section className="osm22-side"><h3>Studios disponíveis</h3>{studios.map((studio) => <div className="osm22-task" key={studio.id}><strong>{studio.title}</strong><span>{studio.output}</span><em className="omega-top-pill">{studio.status}</em></div>)}</section>
        </div>

        <aside className="osm22-side">
          <section><h3>Mapa completo preservado</h3>{phaseMap.map((phase) => <div className="osm22-task" key={phase}><strong>{phase}</strong><span>módulo de fase mantido</span></div>)}</section>
        </aside>
      </section>
    </div>
  );
}
