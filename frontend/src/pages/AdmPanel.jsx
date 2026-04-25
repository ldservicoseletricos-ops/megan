import React, { useEffect, useMemo, useState } from 'react';
import { getJson, postJson } from '../lib/api';

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'deploy', label: 'Deploy' },
  { id: 'git', label: 'Git' },
  { id: 'teams', label: 'Equipes' },
  { id: 'autonomy', label: 'Autonomia' },
  { id: 'settings', label: 'Config' },
];

const defaultState = {
  health: { service: 'Megan Master Fusion', version: '1.3.0', ok: true, autonomy: 'Autonomy Core 1.3 online' },
  overview: {
    readiness: 91,
    operations: 93,
    deploySafety: 89,
    executiveMode: 'omega_fusion_live',
    nextAction: 'Consolidar melhorias aprovadas, reduzir duplicações e evoluir integrações reais.',
  },
  deploy: {
    frontend: 'online',
    backend: 'online',
    lastSync: 'agora',
    risk: 'baixo',
  },
  git: {
    repo: 'megan',
    branch: 'main',
    status: 'sincronizado',
    score: 96,
  },
  teams: [
    { name: 'Core Brain', score: 95, focus: 'estabilidade e integração' },
    { name: 'Autonomy Brain', score: 92, focus: 'diagnóstico, prioridade e reparo seguro' },
    { name: 'Frontend Brain', score: 94, focus: 'UX Omega e fluidez premium' },
    { name: 'Deploy Brain', score: 88, focus: 'publish seguro e rollback controlado' },
  ],
  queue: [
    { title: 'Validar melhorias aprovadas antes de publicar', owner: 'Autonomy Brain', priority: 'Alta' },
    { title: 'Trocar simulações críticas por integrações reais', owner: 'Core Brain', priority: 'Alta' },
    { title: 'Encerrar módulos legados com rastreio de impacto', owner: 'Deploy Brain', priority: 'Média' },
  ],
  autonomy: {
    score: 86,
    mode: 'supervisionada',
    incidentResponse: 'ativa',
    guidance: 'A Megan mede score do projeto, aprende padrões de falha e recomenda a próxima evolução com base em impacto real.',
  },
  settings: {
    api: (import.meta.env.VITE_API_URL || 'http://localhost:10000').replace(/\/+$/, ''),
    theme: 'Omega Dark',
    refresh: 'manual',
    layout: 'Omega Admin',
  },
};

function Pill({ children, tone = 'default' }) {
  return <span className={`adm-pill adm-pill-${tone}`}>{children}</span>;
}

function MetricCard({ label, value, caption }) {
  return (
    <article className="adm-metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{caption}</p>
    </article>
  );
}

function InfoGrid({ items }) {
  return (
    <div className="adm-info-grid">
      {items.map((item) => (
        <article key={`${item.label}-${item.value}`} className="adm-info-card">
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </article>
      ))}
    </div>
  );
}

function toneFromSeverity(severity = '') {
  if (['danger', 'critical', 'high', 'alta', 'alto'].includes(String(severity).toLowerCase())) return 'danger';
  if (['warning', 'medium', 'média', 'medio'].includes(String(severity).toLowerCase())) return 'warning';
  return 'success';
}

function AdmSkeleton() {
  return (
    <div className="adm-skeleton-grid">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="adm-skeleton-card" />
      ))}
    </div>
  );
}

export default function AdmPanel() {
  const [section, setSection] = useState('overview');
  const [state, setState] = useState(defaultState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [autonomy, setAutonomy] = useState(null);
  const [autonomyBusy, setAutonomyBusy] = useState('');
  const [autonomyMessage, setAutonomyMessage] = useState('');

  async function refreshStatus() {
    setLoading(true);
    setError('');
    try {
      const [health, autonomyDashboard, executiveDashboard] = await Promise.all([
        getJson('/api/health'),
        getJson('/api/autonomy/dashboard').catch(() => null),
        getJson('/api/autonomy/executive-dashboard').catch(() => null),
      ]);

      setAutonomy({ ...(autonomyDashboard || {}), executiveDashboard });
      setState((current) => ({
        ...current,
        health,
        overview: {
          ...current.overview,
          executiveMode: health.service || current.overview.executiveMode,
          readiness: autonomyDashboard?.summary?.score || current.overview.readiness,
          nextAction: autonomyDashboard?.diagnostics?.findings?.[0]?.recommendation || current.overview.nextAction,
        },
        deploy: {
          ...current.deploy,
          backend: health.ok ? 'online' : 'atenção',
          lastSync: 'agora',
        },
        autonomy: autonomyDashboard ? {
          score: autonomyDashboard.summary?.score || current.autonomy.score,
          mode: autonomyDashboard.autonomyMode || current.autonomy.mode,
          incidentResponse: autonomyDashboard.summary?.openErrors > 0 ? 'monitorando incidentes' : 'ativa',
          guidance: autonomyDashboard.health?.summary || current.autonomy.guidance,
        } : current.autonomy,
      }));
    } catch (_err) {
      setError('Backend não respondeu agora. O painel ADM continua carregando com estado local.');
    } finally {
      setLoading(false);
    }
  }

  async function runDiagnostics() {
    setAutonomyBusy('diagnostics');
    setAutonomyMessage('');
    try {
      const response = await postJson('/api/autonomy/run-diagnostics', {});
      setAutonomyMessage(`Diagnóstico concluído com score ${response.diagnostics?.readinessScore || '--'}%.`);
      await refreshStatus();
    } catch (_err) {
      setAutonomyMessage('Falha ao rodar diagnóstico agora.');
    } finally {
      setAutonomyBusy('');
    }
  }

  async function runSafeRepair(actionType) {
    setAutonomyBusy(actionType);
    setAutonomyMessage('');
    try {
      const response = await postJson('/api/autonomy/run-safe-repair', { actionType });
      setAutonomyMessage(response.repair?.resultSummary || 'Reparo seguro processado.');
      await refreshStatus();
    } catch (_err) {
      setAutonomyMessage('Falha ao executar reparo seguro.');
    } finally {
      setAutonomyBusy('');
    }
  }

  async function runSafePatch(actionType) {
    setAutonomyBusy(actionType);
    setAutonomyMessage('');
    try {
      const response = await postJson('/api/autonomy/run-safe-patch', { actionType });
      setAutonomyMessage(response.patch?.resultSummary || 'Patch seguro processado.');
      await refreshStatus();
    } catch (_err) {
      setAutonomyMessage('Falha ao executar safe patch.');
    } finally {
      setAutonomyBusy('');
    }
  }

  useEffect(() => {
    refreshStatus();
  }, []);

  const summary = useMemo(() => {
    return [
      { label: 'Readiness', value: `${state.overview.readiness}%`, caption: 'maturidade geral da Megan' },
      { label: 'Operação', value: `${state.overview.operations}%`, caption: 'fluxo executivo atual' },
      { label: 'Deploy Safety', value: `${state.overview.deploySafety}%`, caption: 'segurança de publicação' },
      { label: 'Versão', value: state.health.version || '1.3.0', caption: state.health.service || 'Megan Master Fusion' },
    ];
  }, [state]);

  const healthModules = autonomy?.health?.modules || [];
  const diagnostics = autonomy?.diagnostics?.findings || [];
  const repairs = autonomy?.recentRepairs || [];
  const improvements = autonomy?.improvements?.suggestions || [];
  const incidents = autonomy?.incidents || [];
  const approvals = autonomy?.approvals || [];
  const policies = autonomy?.policies || { automatic: [], approvalRequired: [], blocked: [] };
  const executiveDashboard = autonomy?.executiveDashboard || null;
  const fragilityRanking = executiveDashboard?.fragilityRanking?.ranking || [];
  const priorities = executiveDashboard?.priorities?.priorities || [];
  const evolutionSteps = executiveDashboard?.evolutionPlan?.steps || [];
  const projectHealthPillars = autonomy?.projectHealth?.pillars || [];
  const duplicates = autonomy?.duplicateReport?.duplicates || [];
  const performanceFindings = autonomy?.performanceReport?.findings || [];

  return (
    <div className="panel-card adm-fusion-card omega-surface">
      <header className="adm-fusion-hero">
        <div>
          <span className="fusion-kicker">OMEGA ADMIN</span>
          <h2>Painel ADM executivo da Megan OS</h2>
          <p>Visão unificada de deploy, Git, equipes, autonomia, score de saúde do projeto e próxima evolução recomendada.</p>
        </div>
        <div className="adm-hero-actions">
          <Pill tone={state.health.ok ? 'success' : 'warning'}>{state.health.ok ? 'backend online' : 'backend em atenção'}</Pill>
          <button className="adm-refresh-button" onClick={refreshStatus} disabled={loading}>
            {loading ? 'Atualizando...' : 'Atualizar painel'}
          </button>
        </div>
      </header>

      {error ? <div className="adm-inline-alert">{error}</div> : null}
      {autonomyMessage ? <div className="adm-inline-alert adm-inline-alert-info">{autonomyMessage}</div> : null}

      {loading ? <AdmSkeleton /> : null}

      <section className="adm-summary-grid">
        {summary.map((item) => (
          <MetricCard key={item.label} {...item} />
        ))}
      </section>

      <div className="adm-layout-grid">
        <aside className="adm-side-menu omega-side-menu">
          {sections.map((item) => (
            <button
              key={item.id}
              className={section === item.id ? 'active' : ''}
              onClick={() => setSection(item.id)}
            >
              {item.label}
            </button>
          ))}
        </aside>

        <section className="adm-main-view">
          {section === 'overview' && (
            <div className="adm-section-grid">
              <article className="adm-section-card adm-section-card-wide omega-glow-card">
                <h3>Controle executivo</h3>
                <InfoGrid
                  items={[
                    { label: 'Modo executivo', value: state.overview.executiveMode },
                    { label: 'Próxima ação', value: state.overview.nextAction },
                    { label: 'Frontend', value: state.deploy.frontend },
                    { label: 'Backend', value: state.deploy.backend },
                  ]}
                />
              </article>

              <article className="adm-section-card">
                <h3>Fila prioritária</h3>
                <div className="adm-list-stack">
                  {state.queue.map((item) => (
                    <div key={item.title} className="adm-list-item">
                      <strong>{item.title}</strong>
                      <span>{item.owner}</span>
                      <Pill tone={item.priority === 'Alta' ? 'danger' : 'default'}>{item.priority}</Pill>
                    </div>
                  ))}
                </div>
              </article>

              <article className="adm-section-card">
                <h3>Fragilidade do sistema</h3>
                <div className="adm-list-stack">
                  {fragilityRanking.length ? fragilityRanking.map((item, index) => (
                    <div key={`${item.area || item.module}-${index}`} className="adm-list-item adm-list-item-column">
                      <div className="adm-list-head">
                        <strong>{item.area || item.module || `Ponto ${index + 1}`}</strong>
                        <Pill tone={toneFromSeverity(item.severity || item.risk)}>{item.severity || item.risk || 'médio'}</Pill>
                      </div>
                      <span>{item.reason || item.summary || 'Área observada pela autonomia.'}</span>
                    </div>
                  )) : <span>Sem ranking carregado agora.</span>}
                </div>
              </article>
            </div>
          )}

          {section === 'deploy' && (
            <div className="adm-section-grid">
              <article className="adm-section-card">
                <h3>Deploy atual</h3>
                <InfoGrid
                  items={[
                    { label: 'Frontend', value: state.deploy.frontend },
                    { label: 'Backend', value: state.deploy.backend },
                    { label: 'Última sincronização', value: state.deploy.lastSync },
                    { label: 'Risco', value: state.deploy.risk },
                  ]}
                />
              </article>
              <article className="adm-section-card">
                <h3>Checklist estável</h3>
                <div className="adm-check-list">
                  <label><input type="checkbox" checked readOnly /> Backend principal integrado</label>
                  <label><input type="checkbox" checked readOnly /> Frontend principal unificado</label>
                  <label><input type="checkbox" checked readOnly /> Navegação premium dentro do frontend</label>
                  <label><input type="checkbox" checked readOnly /> Painel ADM integrado</label>
                  <label><input type="checkbox" checked readOnly /> Autonomy Core 1.3 ativo</label>
                </div>
              </article>
            </div>
          )}

          {section === 'git' && (
            <article className="adm-section-card adm-section-card-wide">
              <h3>Git e versão</h3>
              <InfoGrid
                items={[
                  { label: 'Repositório', value: state.git.repo },
                  { label: 'Branch', value: state.git.branch },
                  { label: 'Status', value: state.git.status },
                  { label: 'Score', value: `${state.git.score}%` },
                ]}
              />
            </article>
          )}

          {section === 'teams' && (
            <article className="adm-section-card adm-section-card-wide">
              <h3>Equipes e cérebros</h3>
              <div className="adm-team-grid">
                {state.teams.map((team) => (
                  <article key={team.name} className="adm-team-card">
                    <strong>{team.name}</strong>
                    <span>{team.focus}</span>
                    <div className="adm-progress-track">
                      <div className="adm-progress-fill" style={{ width: `${team.score}%` }} />
                    </div>
                    <em>{team.score}%</em>
                  </article>
                ))}
              </div>
            </article>
          )}

          {section === 'autonomy' && (
            <div className="adm-main-view autonomy-grid">
              <article className="adm-section-card adm-section-card-wide omega-glow-card">
                <div className="adm-section-header-row">
                  <div>
                    <h3>Autonomy Core 1.3</h3>
                    <p className="adm-long-copy">A Megan agora aprende padrões de falha, ranqueia fragilidade, prioriza a próxima evolução e prepara reparos e patches seguros sob supervisão.</p>
                  </div>
                  <div className="adm-action-row">
                    <button className="adm-refresh-button" onClick={runDiagnostics} disabled={autonomyBusy === 'diagnostics'}>
                      {autonomyBusy === 'diagnostics' ? 'Diagnosticando...' : 'Rodar diagnóstico'}
                    </button>
                    <button className="adm-secondary-button" onClick={() => runSafeRepair('fallback_safe_mode')} disabled={autonomyBusy === 'fallback_safe_mode'}>
                      {autonomyBusy === 'fallback_safe_mode' ? 'Aplicando...' : 'Ativar reparo seguro'}
                    </button>
                  </div>
                </div>
                <InfoGrid
                  items={[
                    { label: 'Score', value: `${state.autonomy.score}%` },
                    { label: 'Modo', value: state.autonomy.mode },
                    { label: 'Resposta', value: state.autonomy.incidentResponse },
                    { label: 'Melhorias', value: `${autonomy?.summary?.improvementBacklog || improvements.length}` },
                    { label: 'Score total', value: `${autonomy?.projectHealth?.totalScore || state.autonomy.score}%` },
                  ]}
                />
              </article>

              <article className="adm-section-card">
                <h3>Saúde do sistema</h3>
                <div className="adm-list-stack">
                  {healthModules.map((item) => (
                    <div key={item.id} className="adm-list-item">
                      <div>
                        <strong>{item.label}</strong>
                        <span>{item.note}</span>
                      </div>
                      <Pill tone={item.status === 'online' ? 'success' : item.status === 'standby' ? 'warning' : 'danger'}>{item.status}</Pill>
                    </div>
                  ))}
                </div>
              </article>

              <article className="adm-section-card">
                <h3>Achados do diagnóstico</h3>
                <div className="adm-list-stack">
                  {diagnostics.map((item) => (
                    <div key={item.id} className="adm-list-item adm-list-item-column">
                      <div className="adm-list-head">
                        <strong>{item.title}</strong>
                        <Pill tone={toneFromSeverity(item.severity)}>{item.severity}</Pill>
                      </div>
                      <span>{item.probableCause}</span>
                      <em>{item.recommendation}</em>
                    </div>
                  ))}
                </div>
              </article>

              <article className="adm-section-card">
                <h3>Reparos seguros recentes</h3>
                <div className="adm-list-stack">
                  {repairs.map((item) => (
                    <div key={item.id} className="adm-list-item adm-list-item-column">
                      <div className="adm-list-head">
                        <strong>{item.actionType}</strong>
                        <Pill tone={item.status === 'applied' ? 'success' : 'warning'}>{item.status}</Pill>
                      </div>
                      <span>{item.resultSummary}</span>
                      <em>{new Date(item.createdAt).toLocaleString('pt-BR')}</em>
                    </div>
                  ))}
                </div>
                <div className="adm-action-row compact">
                  <button className="adm-secondary-button" onClick={() => runSafeRepair('retry_health_checks')} disabled={autonomyBusy === 'retry_health_checks'}>Retry health</button>
                  <button className="adm-secondary-button" onClick={() => runSafeRepair('cache_reset_runtime')} disabled={autonomyBusy === 'cache_reset_runtime'}>Reset cache lógico</button>
                </div>
              </article>

              <article className="adm-section-card">
                <h3>Melhorias sugeridas</h3>
                <div className="adm-list-stack">
                  {improvements.map((item) => (
                    <div key={item.id} className="adm-list-item adm-list-item-column">
                      <div className="adm-list-head">
                        <strong>{item.title}</strong>
                        <Pill tone={toneFromSeverity(item.priority)}>{item.priority}</Pill>
                      </div>
                      <span>{item.description}</span>
                      <em>Área afetada: {item.affectedArea}</em>
                    </div>
                  ))}
                </div>
              </article>

              <article className="adm-section-card">
                <h3>Score de saúde do projeto</h3>
                <div className="adm-list-stack">
                  {projectHealthPillars.map((item) => (
                    <div key={item.id} className="adm-list-item">
                      <div>
                        <strong>{item.label}</strong>
                        <span>{autonomy?.projectHealth?.summary}</span>
                      </div>
                      <Pill tone={item.score >= 85 ? 'success' : item.score >= 70 ? 'warning' : 'danger'}>{item.score}%</Pill>
                    </div>
                  ))}
                </div>
              </article>

              <article className="adm-section-card">
                <h3>Duplicações detectadas</h3>
                <div className="adm-list-stack">
                  {duplicates.map((item) => (
                    <div key={item.id} className="adm-list-item adm-list-item-column">
                      <div className="adm-list-head">
                        <strong>{item.label}</strong>
                        <Pill tone={toneFromSeverity(item.impact)}>{item.impact}</Pill>
                      </div>
                      <span>{item.existingFiles?.join(' · ')}</span>
                      <em>{item.recommendation}</em>
                    </div>
                  ))}
                </div>
              </article>

              <article className="adm-section-card">
                <h3>Performance & auto patch</h3>
                <div className="adm-list-stack">
                  {performanceFindings.map((item) => (
                    <div key={item.id} className="adm-list-item adm-list-item-column">
                      <div className="adm-list-head">
                        <strong>{item.metric}</strong>
                        <Pill tone={toneFromSeverity(item.severity)}>{item.severity}</Pill>
                      </div>
                      <span>{item.value}</span>
                      <em>{item.recommendation}</em>
                    </div>
                  ))}
                </div>
                <div className="adm-action-row compact">
                  <button className="adm-secondary-button" onClick={() => runSafePatch('patch_runtime_fallback')} disabled={autonomyBusy === 'patch_runtime_fallback'}>Auto patch fallback</button>
                  <button className="adm-secondary-button" onClick={() => runSafePatch('patch_port_isolation')} disabled={autonomyBusy === 'patch_port_isolation'}>Isolar porta</button>
                </div>
              </article>

              <article className="adm-section-card">
                <h3>Prioridades inteligentes</h3>
                <div className="adm-list-stack">
                  {priorities.length ? priorities.map((item, index) => (
                    <div key={`${item.title || item.label}-${index}`} className="adm-list-item adm-list-item-column">
                      <div className="adm-list-head">
                        <strong>{item.title || item.label || `Prioridade ${index + 1}`}</strong>
                        <Pill tone={toneFromSeverity(item.priority || item.impact)}>{item.priority || item.impact || 'média'}</Pill>
                      </div>
                      <span>{item.reason || item.description || 'Recomendação automática da Megan.'}</span>
                    </div>
                  )) : <span>Nenhuma prioridade gerada agora.</span>}
                </div>
              </article>

              <article className="adm-section-card">
                <h3>Plano de evolução</h3>
                <div className="adm-list-stack">
                  {evolutionSteps.length ? evolutionSteps.map((item, index) => (
                    <div key={`${item.title || item.step}-${index}`} className="adm-list-item adm-list-item-column">
                      <div className="adm-list-head">
                        <strong>{item.title || item.step || `Etapa ${index + 1}`}</strong>
                        <Pill tone={toneFromSeverity(item.priority || 'warning')}>{item.priority || 'média'}</Pill>
                      </div>
                      <span>{item.description || item.goal || 'Evolução sugerida automaticamente.'}</span>
                    </div>
                  )) : <span>Sem plano automático agora.</span>}
                </div>
              </article>

              <article className="adm-section-card">
                <h3>Incidentes</h3>
                <div className="adm-list-stack">
                  {incidents.length ? incidents.map((item) => (
                    <div key={item.id} className="adm-list-item adm-list-item-column">
                      <div className="adm-list-head">
                        <strong>{item.title}</strong>
                        <Pill tone={toneFromSeverity(item.severity)}>{item.severity}</Pill>
                      </div>
                      <span>{item.source}</span>
                      <em>{item.status}</em>
                    </div>
                  )) : <span>Nenhum incidente ativo agora.</span>}
                </div>
              </article>

              <article className="adm-section-card">
                <h3>Fila de aprovação</h3>
                <div className="adm-list-stack">
                  {approvals.length ? approvals.map((item) => (
                    <div key={item.id} className="adm-list-item adm-list-item-column">
                      <div className="adm-list-head">
                        <strong>{item.title}</strong>
                        <Pill tone={item.status === 'pending' ? 'warning' : 'success'}>{item.status}</Pill>
                      </div>
                      <span>{item.description}</span>
                      {item.status === 'pending' ? (
                        <div className="adm-action-row compact">
                          <button className="adm-secondary-button" onClick={() => postJson('/api/autonomy/approve-action', { id: item.id }).then(refreshStatus)}>Aprovar</button>
                          <button className="adm-secondary-button" onClick={() => postJson('/api/autonomy/reject-action', { id: item.id }).then(refreshStatus)}>Rejeitar</button>
                        </div>
                      ) : null}
                    </div>
                  )) : <span>Nenhuma aprovação pendente.</span>}
                </div>
              </article>

              <article className="adm-section-card adm-section-card-wide">
                <h3>Política de autonomia</h3>
                <div className="adm-policy-grid">
                  <div className="adm-policy-card">
                    <span>Automático</span>
                    <ul>
                      {policies.automatic.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                  <div className="adm-policy-card">
                    <span>Exige aprovação</span>
                    <ul>
                      {policies.approvalRequired.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                  <div className="adm-policy-card">
                    <span>Bloqueado</span>
                    <ul>
                      {policies.blocked.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                </div>
              </article>
            </div>
          )}

          {section === 'settings' && (
            <article className="adm-section-card adm-section-card-wide">
              <h3>Configurações da base</h3>
              <InfoGrid
                items={[
                  { label: 'API', value: state.settings.api },
                  { label: 'Tema', value: state.settings.theme },
                  { label: 'Atualização', value: state.settings.refresh },
                  { label: 'Layout', value: state.settings.layout },
                ]}
              />
            </article>
          )}
        </section>
      </div>
    </div>
  );
}
