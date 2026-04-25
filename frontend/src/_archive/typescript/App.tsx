import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts';

function metric(value) {
  return Number.isFinite(value) ? `${value}%` : '—';
}

function tone(value) {
  const v = String(value || '').toLowerCase();
  if (['operational', 'active', 'ok', 'success', 'high', 'connected'].includes(v)) return '#22c55e';
  if (['warning', 'attention', 'medium', 'info'].includes(v)) return '#f59e0b';
  if (['critical', 'error', 'low', 'disconnected'].includes(v)) return '#ef4444';
  return '#94a3b8';
}

const panelStyle = {
  background: '#0d1428',
  border: '1px solid #182236',
  borderRadius: 18,
  padding: 14,
  marginBottom: 14,
};

const inputStyle = {
  width: '100%',
  padding: 10,
  marginBottom: 10,
  borderRadius: 10,
  border: '1px solid #243041',
  background: '#08101f',
  color: '#fff',
};

function shellPanelStyle(extra = {}) {
  return {
    background: '#0d1428',
    border: '1px solid #182236',
    borderRadius: 18,
    ...extra,
  };
}

function buttonStyle(from, to) {
  return {
    width: '100%',
    marginTop: 10,
    padding: 13,
    border: 'none',
    borderRadius: 14,
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 700,
    background: `linear-gradient(90deg, ${from} 0%, ${to} 100%)`,
  };
}

function Card({ label, value, note }) {
  return (
    <div style={shellPanelStyle({ padding: 18 })}>
      <small style={{ color: '#94a3b8' }}>{label}</small>
      <h2 style={{ margin: '8px 0', fontSize: 30 }}>{value}</h2>
      <div style={{ color: '#cbd5e1', fontSize: 13 }}>{note}</div>
    </div>
  );
}

function Section({ title, subtitle, children, height = 'auto' }) {
  return (
    <div style={shellPanelStyle({ padding: 18, height })}>
      <div style={{ marginBottom: 14 }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        {subtitle ? <div style={{ color: '#94a3b8', marginTop: 6 }}>{subtitle}</div> : null}
      </div>
      {children}
    </div>
  );
}

function Item({ title, badge, text }) {
  return (
    <div
      style={{
        background: '#08101f',
        border: '1px solid #1b2842',
        borderRadius: 14,
        padding: 14,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
        <b>{title}</b>
        <span
          style={{
            border: `1px solid ${tone(badge)}`,
            color: tone(badge),
            borderRadius: 999,
            padding: '4px 10px',
            fontSize: 11,
            textTransform: 'uppercase',
          }}
        >
          {badge}
        </span>
      </div>
      <div style={{ marginTop: 8, color: '#cbd5e1', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{text}</div>
    </div>
  );
}

export default function App() {
  const [overview, setOverview] = useState(null);
  const [state, setState] = useState(null);
  const [issues, setIssues] = useState([]);
  const [hypotheses, setHypotheses] = useState([]);
  const [patches, setPatches] = useState([]);
  const [memory, setMemory] = useState([]);
  const [repoInfo, setRepoInfo] = useState(null);
  const [statusMessage, setStatusMessage] = useState('Painel premium iniciado.');
  const [repoPath, setRepoPath] = useState('C:/megan');
  const [busy, setBusy] = useState(false);

  async function loadJson(url) {
    const response = await fetch(url);
    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await response.json() : null;
    if (!response.ok || data?.ok === false) {
      throw new Error(data?.reason || `Falha em ${url}`);
    }
    return data;
  }

  async function refresh() {
    try {
      const [overviewData, stateData, issuesData, hypothesesData, patchesData, memoryData, repoData] =
        await Promise.all([
          loadJson('/api/master/overview'),
          loadJson('/api/master/state'),
          loadJson('/api/master/issues'),
          loadJson('/api/master/hypotheses'),
          loadJson('/api/master/patches'),
          loadJson('/api/master/memory'),
          loadJson('/api/master/repo'),
        ]);

      setOverview(overviewData?.state || null);
      setState(stateData?.state || null);
      setIssues(issuesData?.items || []);
      setHypotheses(hypothesesData?.items || []);
      setPatches(patchesData?.items || []);
      setMemory(memoryData?.items || []);
      setRepoInfo(repoData || null);
      setStatusMessage('Painel sincronizado com o backend.');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Falha ao sincronizar painel.');
    }
  }

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 5000);
    return () => clearInterval(timer);
  }, []);

  async function connectRepo() {
    setBusy(true);
    try {
      const response = await fetch('/api/master/connect-repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoPath }),
      });
      const data = await response.json();
      if (!response.ok || data?.ok === false) {
        throw new Error(data?.reason || 'Falha ao conectar repositório.');
      }
      setStatusMessage(`Repositório conectado: ${data.repo?.repoPath || repoPath}`);
      await refresh();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Falha ao conectar repositório.');
    } finally {
      setBusy(false);
    }
  }

  async function runCycle() {
    setBusy(true);
    try {
      const response = await fetch('/api/master/run-cycle', { method: 'POST' });
      const data = await response.json();
      if (!response.ok || data?.ok === false) {
        throw new Error(data?.reason || 'Falha ao rodar ciclo mestre.');
      }
      const summary = data?.result?.summary || {};
      setStatusMessage(
        `Ciclo executado. Readiness ${summary?.readiness ?? '—'}% · Patches aprovados ${summary?.approvedPatches ?? 0}.`
      );
      await refresh();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Falha ao rodar ciclo mestre.');
    } finally {
      setBusy(false);
    }
  }

  const chartsTimeline = useMemo(() => {
    const readiness = Number(state?.readiness || 0);
    const memoryVal = Number(state?.memoryConsistency || 0);
    const critic = Number(state?.criticStability || 0);
    const regression = Number(state?.regressionCoverage || 0);
    const patchReadiness = Number(state?.realPatchReadiness || 0);
    return Array.from({ length: 10 }).map((_, i) => ({
      step: `C${i + 1}`,
      readiness: Math.max(5, readiness - (9 - i) * 2),
      memory: Math.max(5, memoryVal - (9 - i) * 2),
      critic: Math.max(5, critic - (9 - i) * 2),
      regression: Math.max(5, regression - (9 - i) * 2),
      patch: Math.max(5, patchReadiness - (9 - i) * 2),
    }));
  }, [state]);

  const infrastructureBars = useMemo(() => ([
    { name: 'Memory', value: Number(state?.memoryConsistency || 0) },
    { name: 'Critic', value: Number(state?.criticStability || 0) },
    { name: 'Tests', value: Number(state?.regressionCoverage || 0) },
    { name: 'Rollback', value: Number(state?.rollbackSafety || 0) },
    { name: 'Sandbox', value: Number(state?.sandboxReliability || 0) },
    { name: 'Patch', value: Number(state?.realPatchReadiness || 0) },
    { name: 'Build', value: Number(state?.buildReadiness || 0) },
    { name: 'Deploy', value: Number(state?.deployReadiness || 0) },
  ]), [state]);

  const operationsArea = useMemo(() => ([
    { name: 'Latency', value: Number(state?.latency || 0) },
    { name: 'Error', value: Number(state?.errorRate || 0) },
    { name: 'Success', value: Number(state?.successRate || 0) },
    { name: 'Approval', value: Number(state?.patchApprovalRate || 0) },
  ]), [state]);

  const topIssues = issues.slice(0, 5);
  const topHypotheses = hypotheses.slice(0, 5);
  const topPatches = patches.slice(0, 6);
  const topMemory = memory.slice(0, 12);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        minHeight: '100vh',
        background: '#050816',
        color: '#f8fafc',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <aside style={{ padding: 20, borderRight: '1px solid #182236', background: '#071021' }}>
        <div style={shellPanelStyle({ padding: 16, marginBottom: 16 })}>
          <h1 style={{ margin: 0, fontSize: 28 }}>Megan OS</h1>
          <div style={{ color: '#94a3b8', marginTop: 6 }}>Frontend premium compatível com backend master</div>
        </div>

        <button onClick={refresh} disabled={busy} style={buttonStyle('#2563eb', '#7c3aed')}>
          Atualizar agora
        </button>

        <button onClick={runCycle} disabled={busy} style={buttonStyle('#0f766e', '#16a34a')}>
          Rodar ciclo mestre
        </button>

        <div style={panelStyle}>
          <small style={{ color: '#94a3b8', display: 'block', marginBottom: 8 }}>Status geral</small>
          <div style={{ color: tone(overview?.systemStatus), fontSize: 28, fontWeight: 700 }}>
            {overview?.systemStatus || 'carregando'}
          </div>
          <div style={{ color: '#cbd5e1', marginTop: 8 }}>{overview?.currentBottleneck || '—'}</div>
        </div>

        <div style={panelStyle}>
          <small style={{ color: '#94a3b8', display: 'block', marginBottom: 8 }}>Próxima ação</small>
          <div style={{ color: '#fff', fontWeight: 700 }}>{overview?.nextBestAction || 'carregando'}</div>
          <div style={{ color: '#94a3b8', marginTop: 8 }}>Updated: {overview?.updatedAt || '—'}</div>
        </div>

        <div style={panelStyle}>
          <small style={{ color: '#94a3b8', display: 'block', marginBottom: 8 }}>Conectar repositório</small>
          <input value={repoPath} onChange={(e) => setRepoPath(e.target.value)} style={inputStyle} placeholder="C:/megan" />
          <button onClick={connectRepo} disabled={busy} style={buttonStyle('#1d4ed8', '#2563eb')}>
            Conectar repositório
          </button>
          <div style={{ color: '#cbd5e1', marginTop: 10 }}>
            {repoInfo?.repo?.connected ? `Conectado: ${repoInfo.repo.repoPath}` : 'Repositório ainda não conectado.'}
          </div>
        </div>

        <div style={panelStyle}>
          <small style={{ color: '#94a3b8', display: 'block', marginBottom: 8 }}>Supervisor</small>
          <div style={{ color: '#e2e8f0', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{statusMessage}</div>
        </div>
      </aside>

      <main style={{ padding: 24 }}>
        <section style={shellPanelStyle({ padding: 22, marginBottom: 18 })}>
          <div style={{ color: '#94a3b8', textTransform: 'uppercase', fontSize: 11, letterSpacing: '.08em' }}>
            Painel premium expandido
          </div>
          <h1 style={{ margin: '8px 0 10px', fontSize: 38 }}>
            Megan com mais informações, mais gráficos e alinhada ao backend
          </h1>
          <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.6 }}>
            Esta versão mantém o visual escuro premium e adiciona mais monitoramento operacional,
            evolução, infraestrutura, patches, memória e status do repositório.
          </p>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 14, marginBottom: 18 }}>
          <Card label="Cycles" value={String(state?.cycleCount ?? 0)} note="ciclos observados" />
          <Card label="Readiness" value={metric(state?.readiness)} note="prontidão geral" />
          <Card label="Memory" value={metric(state?.memoryConsistency)} note="memória técnica" />
          <Card label="Rollback" value={metric(state?.rollbackSafety)} note="segurança de reversão" />
          <Card label="Patch" value={metric(state?.realPatchReadiness)} note="patch real controlado" />
          <Card label="Deploy" value={metric(state?.deployReadiness)} note="liberação inteligente" />
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 18, marginBottom: 18 }}>
          <Section title="Evolução do núcleo" subtitle="Readiness, memória, critic, regressão e patch">
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartsTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#243041" />
                  <XAxis dataKey="step" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Line type="monotone" dataKey="readiness" stroke="#60a5fa" strokeWidth={2} />
                  <Line type="monotone" dataKey="memory" stroke="#a78bfa" strokeWidth={2} />
                  <Line type="monotone" dataKey="critic" stroke="#34d399" strokeWidth={2} />
                  <Line type="monotone" dataKey="regression" stroke="#f59e0b" strokeWidth={2} />
                  <Line type="monotone" dataKey="patch" stroke="#f43f5e" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <Section title="Infraestrutura interna" subtitle="Todos os pilares que sustentam a Megan">
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={infrastructureBars}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#243041" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#60a5fa" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
          <Section title="Operação do sistema" subtitle="Latência, erro, sucesso e aprovação">
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={operationsArea}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#243041" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#22c55e" fill="#22c55e33" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <Section title="Resumo do repositório" subtitle="Estado atual do backend master">
            <div style={{ display: 'grid', gap: 12 }}>
              <Item title="Repo" badge={repoInfo?.repo?.connected ? 'connected' : 'disconnected'} text={repoInfo?.repo?.repoPath || '—'} />
              <Item title="Branch" badge="active" text={repoInfo?.repo?.branch || '—'} />
              <Item title="Snapshots" badge="info" text={String(repoInfo?.snapshots?.length || 0)} />
              <Item title="Patch history" badge="info" text={String(repoInfo?.patchHistory?.length || 0)} />
              <Item title="Backups" badge="info" text={String(repoInfo?.backups?.length || 0)} />
            </div>
          </Section>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
          <Section title="Principais gargalos" subtitle="Top 5 diagnósticos atuais">
            <div style={{ display: 'grid', gap: 10, maxHeight: 340, overflowY: 'auto', paddingRight: 6 }}>
              {topIssues.map((item) => (
                <Item key={item.area} title={item.area} badge={item.severity} text={item.why} />
              ))}
            </div>
          </Section>

          <Section title="Hipóteses geradas" subtitle="Top 5 melhorias sugeridas">
            <div style={{ display: 'grid', gap: 10, maxHeight: 340, overflowY: 'auto', paddingRight: 6 }}>
              {topHypotheses.map((item) => (
                <Item key={item.id} title={item.title} badge={item.risk} text={item.proposal} />
              ))}
            </div>
          </Section>
        </section>

        <section style={{ marginBottom: 18 }}>
          <Section title="Planejamento de patches" subtitle="Arquivos alvo e resumo das mudanças previstas">
            <div style={{ display: 'grid', gap: 10, maxHeight: 340, overflowY: 'auto', paddingRight: 6 }}>
              {topPatches.map((item) => (
                <Item key={item.id} title={item.targetFile} badge={item.risk} text={item.patchSummary} />
              ))}
            </div>
          </Section>
        </section>

        <section style={{ marginBottom: 18 }}>
          <Section title="Memória de evolução" subtitle="Aprendizados, erros e decisões mais recentes">
            <div style={{ display: 'grid', gap: 10, maxHeight: 420, overflowY: 'auto', paddingRight: 6 }}>
              {topMemory.map((item) => (
                <Item
                  key={item.id}
                  title={item.source}
                  badge={item.impact}
                  text={`${item.content}${item.timestamp ? `\n${item.timestamp}` : ''}`}
                />
              ))}
            </div>
          </Section>
        </section>
      </main>
    </div>
  );
}
