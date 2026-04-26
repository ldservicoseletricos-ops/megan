import React, { useState } from 'react';
import { cancelSubscription, changePlan, createPortalSession } from '../lib/billingApi';

export default function MeuPlanoPage({ user, subscription, plans = [], onUpdated }) {
  const [info, setInfo] = useState('');

  async function cancelar() {
    try {
      await cancelSubscription(subscription.id);
      setInfo('Assinatura cancelada.');
      onUpdated?.();
    } catch (error) {
      setInfo(error.message);
    }
  }

  async function trocar(planId) {
    try {
      await changePlan(subscription.id, planId);
      setInfo('Plano alterado com sucesso.');
      onUpdated?.();
    } catch (error) {
      setInfo(error.message);
    }
  }

  async function abrirPortal() {
    try {
      const result = await createPortalSession();
      setInfo(`Portal do cliente: ${result.session.url}`);
    } catch (error) {
      setInfo(error.message);
    }
  }

  return (
    <div className="panel-card">
      <h2>Meu Plano</h2>
      <p><strong>Plano atual:</strong> {user?.planId || 'sem plano'}</p>
      <p><strong>Módulos:</strong> {(user?.modules || []).join(', ') || 'nenhum'}</p>
      <p><strong>Status da assinatura:</strong> {subscription?.status || 'sem assinatura ativa'}</p>
      <p><strong>Renovação:</strong> {subscription?.renewalAt || '—'}</p>

      {subscription ? (
        <>
          <div className="actions-row">
            <button onClick={abrirPortal}>Abrir portal do cliente</button>
            <button className="danger" onClick={cancelar}>Cancelar assinatura</button>
          </div>
          <div className="plans-grid">
            {plans.filter((p) => p.id !== subscription.planId).map((plan) => (
              <div key={plan.id} className="plan-card compact">
                <strong>{plan.name}</strong>
                <span>R$ {plan.price}/mês</span>
                <button onClick={() => trocar(plan.id)}>Trocar para este plano</button>
              </div>
            ))}
          </div>
        </>
      ) : null}
      {info ? <div className="hint">{info}</div> : null}
    </div>
  );
}
