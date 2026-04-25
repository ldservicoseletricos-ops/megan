import React, { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../lib/api';

const fallbackDashboard = {
  title: 'Megan OS 5.2 — MEGAN BUSINESS CLOUD',
  focus: 'Dashboard executivo, times, CRM, financeiro, metas e BI para empresas.',
  readiness: { score: 0, status: 'preview', risk: 'supervisionado' },
  executive: { activeCompanies: 0, activeUsers: 0, activeTeams: 0, activeAgents: 0, mrr: 0, pipelineValue: 0, cashBalance: 0, goalCompletion: 0, healthScore: 0, priority: 'Carregando operação.' },
  teams: [], crm: { leads: [] }, finance: { revenue: 0, expenses: 0, profit: 0, receivables: 0, overdue: 0, entries: [] }, goals: [], bi: { insights: [] }, alerts: [], activity: []
};

function money(value) { return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
function Metric({ label, value, caption }) { return <article className="autoempresa-metric-card"><span>{label}</span><strong>{value}</strong><p>{caption}</p></article>; }
function Card({ title, tag, text, footer, value }) { return <article className="autoempresa-lead-card"><div><strong>{title}</strong><span>{tag}</span></div><p>{text}</p><footer><em>{footer}</em><b>{value}</b></footer></article>; }

export default function BusinessCloudPage() {
  const [dashboard, setDashboard] = useState(fallbackDashboard);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');

  async function loadDashboard() {
    try { setError(''); setDashboard(await apiGet('/api/business-cloud/dashboard')); }
    catch (err) { setError(err.message || 'Não foi possível carregar o Business Cloud.'); setDashboard(fallbackDashboard); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadDashboard(); }, []);

  async function action(path, payload) {
    setWorking(true);
    try { await apiPost(path, payload); await loadDashboard(); }
    catch (err) { setError(err.message || 'Falha ao executar ação.'); }
    finally { setWorking(false); }
  }

  const executive = dashboard.executive || fallbackDashboard.executive;
  const finance = dashboard.finance || fallbackDashboard.finance;
  const crm = dashboard.crm || fallbackDashboard.crm;
  const display = dashboard.display || {};

  return (
    <div className="autoempresa-page">
      <section className="autoempresa-hero">
        <div>
          <span className="omega-kicker">FASE 5.2</span>
          <h1>{dashboard.title}</h1>
          <p>{dashboard.focus}</p>
          <div className="autoempresa-actions">
            <button onClick={loadDashboard} disabled={loading}>{loading ? 'Carregando...' : 'Atualizar Business Cloud'}</button>
            <button className="ghost" disabled={working} onClick={() => action('/api/business-cloud/crm/lead', { company: 'Empresa Prospect Cloud', value: 7200 })}>Novo lead</button>
            <button className="ghost" disabled={working} onClick={() => action('/api/business-cloud/finance/entry', { type: 'receita', label: 'Nova assinatura Business Cloud', amount: 1490 })}>Nova receita</button>
            <button className="ghost" disabled={working} onClick={() => action('/api/business-cloud/bi/insight', { title: 'Nova recomendação executiva', detail: 'Priorizar leads de maior ticket.', impact: 'receita' })}>Gerar BI</button>
          </div>
          {error ? <small className="autoempresa-error">{error}</small> : null}
        </div>
        <aside><strong>Saúde empresarial</strong><b>{executive.healthScore}%</b><span>{dashboard.readiness?.status} • {dashboard.readiness?.risk}</span></aside>
      </section>

      <section className="autoempresa-grid-metrics">
        <Metric label="MRR" value={display.mrr || money(executive.mrr)} caption="receita mensal recorrente" />
        <Metric label="Pipeline" value={display.pipelineValue || money(executive.pipelineValue)} caption="oportunidades abertas" />
        <Metric label="Caixa" value={display.cashBalance || money(executive.cashBalance)} caption="saldo operacional" />
        <Metric label="Empresas" value={executive.activeCompanies} caption="contas ativas" />
        <Metric label="Usuários" value={executive.activeUsers} caption="usuários empresariais" />
        <Metric label="Times" value={executive.activeTeams} caption="equipes conectadas" />
        <Metric label="Agentes" value={executive.activeAgents} caption="agentes em operação" />
        <Metric label="Metas" value={`${executive.goalCompletion}%`} caption="conclusão média" />
        <Metric label="Lucro" value={display.profit || money(finance.profit)} caption="resultado operacional" />
      </section>

      <section className="autoempresa-panel"><div className="autoempresa-panel-title"><span>Prioridade executiva</span><strong>{executive.priority}</strong></div></section>

      <section className="autoempresa-two-columns">
        <div className="autoempresa-panel"><div className="autoempresa-panel-title"><span>Times</span><strong>Operação empresarial</strong></div><div className="autoempresa-leads-list">{(dashboard.teams || []).map((team) => <Card key={team.id} title={team.name} tag={team.status} text={team.target} footer={`${team.owner} • ${team.members} membros`} value={`${team.productivity}%`} />)}</div></div>
        <div className="autoempresa-panel"><div className="autoempresa-panel-title"><span>CRM</span><strong>Pipeline vivo</strong></div><div className="autoempresa-leads-list">{(crm.leads || []).map((lead) => <Card key={lead.id} title={lead.company} tag={lead.stage} text={lead.nextAction} footer={`${lead.contact} • ${lead.channel}`} value={`${money(lead.value)} • ${lead.probability}%`} />)}</div></div>
      </section>

      <section className="autoempresa-two-columns">
        <div className="autoempresa-panel"><div className="autoempresa-panel-title"><span>Financeiro</span><strong>Receitas, despesas e caixa</strong></div><div className="autoempresa-grid-metrics compact-business-metrics"><Metric label="Receita" value={display.revenue || money(finance.revenue)} caption="entradas" /><Metric label="Despesas" value={display.expenses || money(finance.expenses)} caption="saídas" /><Metric label="Recebíveis" value={display.receivables || money(finance.receivables)} caption="a receber" /><Metric label="Vencido" value={display.overdue || money(finance.overdue)} caption="cobrança" /></div><div className="autoempresa-leads-list">{(finance.entries || []).map((entry) => <Card key={entry.id} title={entry.label} tag={entry.type} text={`Status: ${entry.status}`} footer={`Vencimento ${entry.dueDate}`} value={money(entry.amount)} />)}</div></div>
        <div className="autoempresa-panel"><div className="autoempresa-panel-title"><span>Metas</span><strong>Execução por objetivo</strong></div><div className="autoempresa-leads-list">{(dashboard.goals || []).map((goal) => <Card key={goal.id} title={goal.title} tag={goal.area} text={`Atual: ${goal.current} de ${goal.target} • prazo ${goal.deadline}`} footer="Progresso" value={`${goal.progress}%`} />)}</div></div>
      </section>

      <section className="autoempresa-two-columns">
        <div className="autoempresa-panel"><div className="autoempresa-panel-title"><span>BI</span><strong>Insights executivos</strong></div><div className="autoempresa-leads-list">{(dashboard.bi?.insights || []).map((item) => <Card key={item.id} title={item.title} tag={item.severity} text={item.detail} footer="Impacto" value={item.impact} />)}</div></div>
        <div className="autoempresa-panel"><div className="autoempresa-panel-title"><span>Alertas</span><strong>Riscos e oportunidades</strong></div><div className="autoempresa-leads-list">{(dashboard.alerts || []).map((item) => <Card key={item.id} title={item.title} tag={item.level} text={item.action} footer={item.id} value="alerta" />)}</div></div>
      </section>

      <section className="autoempresa-panel"><div className="autoempresa-panel-title"><span>Atividade</span><strong>Logs auditáveis Business Cloud</strong></div><div className="autoempresa-leads-list autoempresa-grid-list">{(dashboard.activity || []).slice(0, 10).map((item) => <Card key={item.id} title={item.title} tag={item.type} text={item.detail} footer={item.createdAt ? new Date(item.createdAt).toLocaleString('pt-BR') : 'agora'} value="log" />)}</div></section>
    </div>
  );
}
