import React, { useEffect, useMemo, useState } from 'react';
import { getAutonomousRepair26Logs, getAutonomousRepair26Status, runAutonomousRepair26Diagnosis, runAutonomousRepair26Heal } from './autonomousRepair26Api';

function MetricCard({ title, value, caption }) {
  return <article className="omega-overview-card repair26-card"><span>{title}</span><strong>{value}</strong><p>{caption}</p></article>;
}

function IssueList({ title, items }) {
  return <div className="repair26-box"><h3>{title}</h3>{items?.length ? <ul>{items.slice(0, 8).map((item, index) => <li key={`${title}-${index}`}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>)}</ul> : <p>Nenhum alerta crítico encontrado.</p>}</div>;
}

export default function AutonomousRepair26Page() {
  const [status, setStatus] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('Pronto para diagnóstico autônomo.');

  async function refresh() {
    setLoading(true);
    try {
      const [statusData, logsData] = await Promise.all([getAutonomousRepair26Status(), getAutonomousRepair26Logs()]);
      setStatus(statusData);
      setLogs(logsData.logs || []);
      setMessage('Diagnóstico atualizado.');
    } catch (error) {
      setMessage(error.message || 'Falha ao carregar Autonomous Repair 26.0.');
    } finally {
      setLoading(false);
    }
  }

  async function diagnose() {
    setLoading(true);
    try {
      const data = await runAutonomousRepair26Diagnosis();
      setStatus(data);
      setMessage('Diagnóstico profundo executado.');
    } catch (error) {
      setMessage(error.message || 'Falha no diagnóstico.');
    } finally {
      setLoading(false);
    }
  }

  async function heal() {
    setLoading(true);
    try {
      const result = await runAutonomousRepair26Heal();
      setMessage(`Correção executada: ${result.actions?.length || 0} ação(ões).`);
      await refresh();
    } catch (error) {
      setMessage(error.message || 'Falha ao corrigir automaticamente.');
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  const envAlerts = useMemo(() => (status?.envIssues || []).filter((item) => item.issues?.length).map((item) => `${item.file}: ${item.issues.join(', ')}`), [status]);

  return (
    <div className="repair26-page">
      <section className="repair26-hero">
        <div><span className="omega-kicker">MEGAN OS 26.0</span><h1>Autonomous Repair Engine</h1><p>Centro consolidado para diagnosticar, corrigir e preparar deploy sem quebrar o restante do sistema.</p></div>
        <div className="repair26-actions"><button onClick={diagnose} disabled={loading}>Diagnóstico profundo</button><button className="repair26-primary" onClick={heal} disabled={loading}>Corrigir tudo agora</button></div>
      </section>
      <p className="repair26-message">{loading ? 'Executando...' : message}</p>
      <div className="omega-overview-rail repair26-grid">
        <MetricCard title="Score técnico" value={status?.score ?? '--'} caption={status?.status || 'aguardando'} />
        <MetricCard title="Imports quebrados" value={status?.brokenImports?.length ?? '--'} caption="varredura backend/frontend" />
        <MetricCard title="Alertas de ambiente" value={envAlerts.length} caption="segredos/env duplicados" />
        <MetricCard title="Checks" value={status?.checks?.filter((item) => item.ok).length ?? '--'} caption="checagens locais OK" />
      </div>
      <div className="repair26-columns"><IssueList title="Críticos atuais" items={status?.critical || []} /><IssueList title="Ambiente" items={envAlerts} /><IssueList title="Imports quebrados" items={status?.brokenImports || []} /></div>
      <div className="repair26-box"><h3>Histórico de reparos</h3>{logs.length ? logs.slice(0, 5).map((log, index) => <div className="repair26-log" key={`${log.executedAt}-${index}`}><strong>{log.executedAt}</strong><span>Score: {log.beforeScore} → {log.afterScore}</span><p>{log.actions?.join(' • ') || 'Sem mudanças aplicadas.'}</p></div>) : <p>Nenhum reparo executado ainda.</p>}</div>
    </div>
  );
}
