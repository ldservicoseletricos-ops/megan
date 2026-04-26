import React, { useEffect, useState } from 'react';
import { listLeads, listSubscriptions, listPayments } from '../lib/billingApi';

export default function CrmPage() {
  const [leads, setLeads] = useState([]);
  const [subs, setSubs] = useState([]);
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([listLeads(), listSubscriptions(), listPayments()])
      .then(([leadResult, subResult, payResult]) => {
        setLeads(leadResult.items || []);
        setSubs(subResult.items || []);
        setPayments(payResult.items || []);
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="panel-card">
      <h2>CRM + Billing</h2>
      {error ? <div className="error">{error}</div> : null}
      <div className="split-grid">
        <div>
          <h3>Leads</h3>
          <div className="leads-list">
            {leads.map((lead) => (
              <div className="lead-item" key={lead.id}>
                <strong>{lead.name}</strong>
                <span>{lead.email}</span>
                <small>{lead.planId} • {lead.status}</small>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3>Assinaturas</h3>
          <div className="leads-list">
            {subs.map((item) => (
              <div className="lead-item" key={item.id}>
                <strong>{item.planId}</strong>
                <span>{item.email}</span>
                <small>{item.status} • renova em {item.renewalAt}</small>
              </div>
            ))}
          </div>
          <h3>Pagamentos</h3>
          <div className="leads-list">
            {payments.map((item) => (
              <div className="lead-item" key={item.id}>
                <strong>{item.planId}</strong>
                <span>{item.email}</span>
                <small>R$ {item.amount} • {item.status}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
