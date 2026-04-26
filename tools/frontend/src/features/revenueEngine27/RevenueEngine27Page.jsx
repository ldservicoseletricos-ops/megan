import React, { useEffect, useState } from 'react';
import { revenueEngine27Api } from './revenueEngine27Api';

const fallback = {
  totals: { revenueToday: 24780.5, revenueMonth: 589347.82, activeClients: 1428, newLeads: 3215, averageTicket: 342.18, conversionRate: 18.7 },
  pipeline: [
    { stage: 'Leads', count: 3215 }, { stage: 'Qualificados', count: 1823 }, { stage: 'Propostas', count: 847 }, { stage: 'Negociação', count: 423 }, { stage: 'Fechados', count: 172 }
  ],
  automations: [
    { name: 'Follow-up automático de leads', status: 'active' }, { name: 'Recuperação de carrinho', status: 'active' }, { name: 'Upsell automático', status: 'active' }, { name: 'Propostas comerciais por IA', status: 'active' }
  ],
  alerts: [
    { level: 'warning', message: '7 pagamentos precisam de revisão' }, { level: 'info', message: '3 leads aguardam contato humano' }, { level: 'success', message: 'Revenue Engine operacional' }
  ]
};

function money(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

export default function RevenueEngine27Page() {
  const [data, setData] = useState(fallback);
  const [offer, setOffer] = useState(null);
  const [status, setStatus] = useState('sincronizando');

  useEffect(() => {
    let active = true;
    revenueEngine27Api.dashboard()
      .then((res) => { if (active && res?.data) { setData(res.data); setStatus('online'); } })
      .catch(() => setStatus('modo local seguro'));
    return () => { active = false; };
  }, []);

  async function handleCreateOffer() {
    try {
      const res = await revenueEngine27Api.createOffer({ product: 'Megan OS Business', audience: 'empresas locais', price: 'R$ 297,00/mês' });
      setOffer(res.offer);
    } catch (error) {
      setOffer({ title: 'Megan OS Business — automação e crescimento com IA', price: 'R$ 297,00/mês', promise: 'organizar operação, vender mais e executar tarefas com IA', funnelSteps: ['Landing page', 'Checkout', 'Follow-up', 'Upsell', 'Relatório CEO'] });
    }
  }

  return (
    <div className="revenue27-page">
      <div className="revenue27-hero">
        <span>MEGAN OS 27.0</span>
        <h1>Revenue Engine Consolidation</h1>
        <p>Central comercial para financeiro, CRM, funil, ofertas IA, automações e visão CEO em tempo real.</p>
        <button onClick={handleCreateOffer}>Criar oferta IA agora</button>
        <em>Status: {status}</em>
      </div>

      <div className="revenue27-grid">
        <article><span>Receita hoje</span><strong>{money(data.totals.revenueToday)}</strong><small>+28.4% vs ontem</small></article>
        <article><span>Receita do mês</span><strong>{money(data.totals.revenueMonth)}</strong><small>+35.7% vs mês passado</small></article>
        <article><span>Clientes ativos</span><strong>{data.totals.activeClients}</strong><small>base consolidada</small></article>
        <article><span>Novos leads</span><strong>{data.totals.newLeads}</strong><small>entrada comercial</small></article>
        <article><span>Ticket médio</span><strong>{money(data.totals.averageTicket)}</strong><small>por venda</small></article>
        <article><span>Conversão</span><strong>{data.totals.conversionRate}%</strong><small>funil ativo</small></article>
      </div>

      <div className="revenue27-panels">
        <section>
          <h2>Funil de vendas</h2>
          {data.pipeline.map((item) => <div className="revenue27-row" key={item.stage}><span>{item.stage}</span><strong>{item.count}</strong></div>)}
        </section>
        <section>
          <h2>Automações comerciais</h2>
          {data.automations.map((item) => <div className="revenue27-row" key={item.name}><span>{item.name}</span><strong>{item.status === 'active' ? 'Ativo' : item.status}</strong></div>)}
        </section>
        <section>
          <h2>Alertas CEO</h2>
          {data.alerts.map((item) => <div className="revenue27-row" key={item.message}><span>{item.message}</span><strong>{item.level}</strong></div>)}
        </section>
      </div>

      {offer && (
        <div className="revenue27-offer">
          <h2>{offer.title}</h2>
          <p>{offer.promise}</p>
          <strong>{offer.price}</strong>
          <div>{(offer.funnelSteps || []).map((step) => <span key={step}>{step}</span>)}</div>
        </div>
      )}
    </div>
  );
}
