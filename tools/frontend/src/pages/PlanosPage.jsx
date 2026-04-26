import React, { useState } from 'react';
import { createSubscription } from '../lib/billingApi';

export default function PlanosPage({ plans = [], onUpdated }) {
  const [busyId, setBusyId] = useState('');
  const [info, setInfo] = useState('');

  async function assinar(planId) {
    try {
      setBusyId(planId);
      await createSubscription(planId);
      setInfo('Assinatura criada com sucesso.');
      onUpdated?.();
    } catch (error) {
      setInfo(error.message);
    } finally {
      setBusyId('');
    }
  }

  return (
    <div className="panel-card">
      <h2>Planos</h2>
      <div className="plans-grid">
        {plans.map((plan) => (
          <div className="plan-card" key={plan.id}>
            <strong>{plan.name}</strong>
            <span>R$ {plan.price}/mês</span>
            <small>{plan.modules.join(' + ')}</small>
            <button onClick={() => assinar(plan.id)} disabled={busyId === plan.id}>
              {busyId === plan.id ? 'Processando...' : 'Assinar'}
            </button>
          </div>
        ))}
      </div>
      {info ? <div className="hint">{info}</div> : null}
    </div>
  );
}
