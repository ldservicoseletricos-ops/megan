import React, { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../lib/api';

const fallbackDashboard = {
  title: 'Megan OS 5.3 — MEGAN PERSONAL LIFE OS',
  focus: 'Rotina, metas, saúde, dinheiro, foco e produtividade em um painel pessoal.',
  readiness: { status: 'preview', safety: 'supervisionado' },
  daily: { lifeScore: 0, energy: 0, focusScore: 0, productivityScore: 0, financialScore: 0, healthScore: 0, priority: 'Carregando vida pessoal.', nextBestAction: 'Carregando próxima ação.' },
  routine: [],
  goals: [],
  health: { checkins: [], habits: [] },
  money: { income: 0, expenses: 0, balance: 0, entries: [] },
  focusCenter: { sessions: [], minutesToday: 0 },
  productivity: { actions: [], completed: 0 },
  decisions: [],
  alerts: [],
  activity: []
};

function money(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function Metric({ label, value, caption }) {
  return <article className="autoempresa-metric-card"><span>{label}</span><strong>{value}</strong><p>{caption}</p></article>;
}

function Card({ title, tag, text, footer, value }) {
  return <article className="autoempresa-lead-card"><div><strong>{title}</strong><span>{tag}</span></div><p>{text}</p><footer><em>{footer}</em><b>{value}</b></footer></article>;
}

export default function PersonalLifePage() {
  const [dashboard, setDashboard] = useState(fallbackDashboard);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');

  async function loadDashboard() {
    try { setError(''); setDashboard(await apiGet('/api/personal-life/dashboard')); }
    catch (err) { setError(err.message || 'Não foi possível carregar o Personal Life OS.'); setDashboard(fallbackDashboard); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadDashboard(); }, []);

  async function action(path, payload) {
    setWorking(true);
    try { await apiPost(path, payload); await loadDashboard(); }
    catch (err) { setError(err.message || 'Falha ao executar ação.'); }
    finally { setWorking(false); }
  }

  const daily = dashboard.daily || fallbackDashboard.daily;
  const moneyState = dashboard.money || fallbackDashboard.money;
  const focus = dashboard.focusCenter || fallbackDashboard.focusCenter;
  const productivity = dashboard.productivity || fallbackDashboard.productivity;
  const display = dashboard.display || {};
  const averageGoals = Math.round((dashboard.goals || []).reduce((sum, goal) => sum + Number(goal.progress || 0), 0) / Math.max(1, (dashboard.goals || []).length));

  return (
    <div className="autoempresa-page">
      <section className="autoempresa-hero">
        <div>
          <span className="omega-kicker">FASE 5.3</span>
          <h1>{dashboard.title}</h1>
          <p>{dashboard.focus}</p>
          <div className="autoempresa-actions">
            <button onClick={loadDashboard} disabled={loading}>{loading ? 'Carregando...' : 'Atualizar Personal Life'}</button>
            <button className="ghost" disabled={working} onClick={() => action('/api/personal-life/routine/task', { title: 'Novo bloco de rotina', area: 'organização', time: '10:00' })}>Adicionar rotina</button>
            <button className="ghost" disabled={working} onClick={() => action('/api/personal-life/focus/session', { title: 'Bloco foco Megan OS', minutes: 50 })}>Criar foco</button>
            <button className="ghost" disabled={working} onClick={() => action('/api/personal-life/health/checkin', { energy: 86, mood: 'produtivo', sleepHours: 7 })}>Check-in saúde</button>
            <button className="ghost" disabled={working} onClick={() => action('/api/personal-life/money/entry', { type: 'entrada', label: 'Receita extra', amount: 350 })}>Entrada dinheiro</button>
          </div>
          {error ? <small className="autoempresa-error">{error}</small> : null}
        </div>
        <aside><strong>Life Score</strong><b>{daily.lifeScore}%</b><span>{dashboard.readiness?.status} • {dashboard.readiness?.safety}</span></aside>
      </section>

      <section className="autoempresa-grid-metrics">
        <Metric label="Rotina" value={dashboard.routine?.length || 0} caption="tarefas do dia" />
        <Metric label="Metas" value={`${averageGoals}%`} caption="progresso médio" />
        <Metric label="Saúde" value={display.healthScore || `${daily.healthScore}%`} caption="energia e hábitos" />
        <Metric label="Dinheiro" value={display.balance || money(moneyState.balance)} caption="saldo pessoal" />
        <Metric label="Foco" value={display.focusScore || `${daily.focusScore}%`} caption={`${focus.minutesToday || 0} min hoje`} />
        <Metric label="Produtividade" value={display.productivityScore || `${daily.productivityScore}%`} caption={`${productivity.completed || 0} concluídas`} />
        <Metric label="Energia" value={`${daily.energy}%`} caption="estado atual" />
        <Metric label="Receitas" value={display.income || money(moneyState.income)} caption="entradas" />
        <Metric label="Gastos" value={display.expenses || money(moneyState.expenses)} caption="saídas" />
      </section>

      <section className="autoempresa-panel"><div className="autoempresa-panel-title"><span>Prioridade do dia</span><strong>{daily.priority}</strong></div><p>{daily.nextBestAction}</p></section>

      <section className="autoempresa-two-columns">
        <div className="autoempresa-panel"><div className="autoempresa-panel-title"><span>Rotina</span><strong>Agenda pessoal inteligente</strong></div><div className="autoempresa-leads-list">{(dashboard.routine || []).map((item) => <Card key={item.id} title={item.title} tag={item.status} text={`Área: ${item.area} • impacto ${item.impact}`} footer={`Horário ${item.time}`} value="rotina" />)}</div></div>
        <div className="autoempresa-panel"><div className="autoempresa-panel-title"><span>Metas</span><strong>Objetivos com próximo passo</strong></div><div className="autoempresa-leads-list">{(dashboard.goals || []).map((goal) => <Card key={goal.id} title={goal.title} tag={goal.area} text={goal.nextStep} footer={`Prazo ${goal.deadline}`} value={`${goal.progress}%`} />)}</div></div>
      </section>

      <section className="autoempresa-two-columns">
        <div className="autoempresa-panel"><div className="autoempresa-panel-title"><span>Saúde</span><strong>Check-ins e hábitos</strong></div><div className="autoempresa-leads-list">{(dashboard.health?.checkins || []).map((item) => <Card key={item.id} title={`Energia ${item.energy}%`} tag={item.mood} text={`Sono ${item.sleepHours}h • água ${item.water} • movimento ${item.movement}`} footer={item.date} value="saúde" />)}{(dashboard.health?.habits || []).map((habit) => <Card key={habit.id} title={habit.title} tag={habit.status} text={`Sequência atual: ${habit.streak} dias`} footer="hábito" value={`${habit.streak}d`} />)}</div></div>
        <div className="autoempresa-panel"><div className="autoempresa-panel-title"><span>Dinheiro</span><strong>Finanças pessoais</strong></div><div className="autoempresa-grid-metrics compact-business-metrics"><Metric label="Entradas" value={display.income || money(moneyState.income)} caption="receitas" /><Metric label="Saídas" value={display.expenses || money(moneyState.expenses)} caption="gastos" /><Metric label="Saldo" value={display.balance || money(moneyState.balance)} caption="resultado" /><Metric label="Reserva" value={display.savings || money(moneyState.savingsCurrent)} caption="meta" /></div><div className="autoempresa-leads-list">{(moneyState.entries || []).map((entry) => <Card key={entry.id} title={entry.label} tag={entry.type} text={`Categoria: ${entry.category}`} footer={entry.date} value={money(entry.amount)} />)}</div></div>
      </section>

      <section className="autoempresa-two-columns">
        <div className="autoempresa-panel"><div className="autoempresa-panel-title"><span>Foco</span><strong>Sessões profundas</strong></div><div className="autoempresa-leads-list">{(focus.sessions || []).map((session) => <Card key={session.id} title={session.title} tag={session.status} text={`${session.minutes} minutos de foco protegido`} footer={session.startedAt || 'planejado'} value="foco" />)}</div></div>
        <div className="autoempresa-panel"><div className="autoempresa-panel-title"><span>Produtividade</span><strong>Ações recomendadas</strong></div><div className="autoempresa-leads-list">{(productivity.actions || []).map((item) => <Card key={item.id} title={item.title} tag={item.status} text={`Impacto: ${item.impact}`} footer="Megan recomenda" value={item.impact} />)}</div></div>
      </section>

      <section className="autoempresa-two-columns">
        <div className="autoempresa-panel"><div className="autoempresa-panel-title"><span>Decisões assistidas</span><strong>Recomendações da Megan</strong></div><div className="autoempresa-leads-list">{(dashboard.decisions || []).map((item) => <Card key={item.id} title={item.title} tag={`${item.confidence}%`} text={item.recommendation} footer="confiança" value={`${item.confidence}%`} />)}</div></div>
        <div className="autoempresa-panel"><div className="autoempresa-panel-title"><span>Alertas</span><strong>Riscos e oportunidades pessoais</strong></div><div className="autoempresa-leads-list">{(dashboard.alerts || []).map((item) => <Card key={item.id} title={item.title} tag={item.level} text={item.action} footer={item.id} value="alerta" />)}</div></div>
      </section>

      <section className="autoempresa-panel"><div className="autoempresa-panel-title"><span>Atividade</span><strong>Logs auditáveis Personal Life</strong></div><div className="autoempresa-leads-list autoempresa-grid-list">{(dashboard.activity || []).slice(0, 10).map((item) => <Card key={item.id} title={item.title} tag={item.type} text={item.detail} footer={item.createdAt ? new Date(item.createdAt).toLocaleString('pt-BR') : 'agora'} value="log" />)}</div></section>
    </div>
  );
}
