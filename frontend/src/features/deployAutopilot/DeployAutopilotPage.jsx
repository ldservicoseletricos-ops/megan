import React, { useEffect, useMemo, useState } from 'react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:10000').replace(/\/$/, '');

const providerIcon = {
  github: '⌘',
  vercel: '▲',
  render: '◆',
  supabase: '◈',
  google: 'G',
  stripe: '$',
};

const providerAccent = {
  github: 'neutral',
  vercel: 'cyan',
  render: 'violet',
  supabase: 'emerald',
  google: 'amber',
  stripe: 'rose',
};

const fallbackProviders = [
  { id: 'github', name: 'GitHub', purpose: 'Repositórios, push e versionamento.', connected: false, fields: ['token', 'owner', 'repo', 'branch'], values: {}, help: 'Conecte o token do GitHub.' },
  { id: 'vercel', name: 'Vercel', purpose: 'Deploy automático do frontend.', connected: false, fields: ['token', 'teamId', 'projectId', 'projectName'], values: {}, help: 'Conecte o token da Vercel.' },
  { id: 'render', name: 'Render', purpose: 'Deploy automático do backend.', connected: false, fields: ['token', 'ownerId', 'serviceId', 'serviceName'], values: {}, help: 'Conecte a API Key do Render.' },
  { id: 'supabase', name: 'Supabase', purpose: 'Banco, project ref e variáveis.', connected: false, fields: ['token', 'projectRef', 'projectUrl', 'anonKey', 'databaseUrl'], values: {}, help: 'Conecte o Access Token do Supabase.' },
  { id: 'google', name: 'Google / Gemini', purpose: 'Gemini, Maps e OAuth.', connected: false, fields: ['token', 'geminiModel', 'mapsKey', 'oauthClientId'], values: {}, help: 'Conecte a chave do Gemini/Google.' },
  { id: 'stripe', name: 'Stripe', purpose: 'Pagamentos e assinaturas.', connected: false, fields: ['token', 'webhookSecret', 'priceIdPro', 'priceIdEnterprise'], values: {}, help: 'Conecte a Secret Key da Stripe.' },
];

function buildFallbackData(reason = '') {
  return {
    ok: true,
    offline: true,
    reason,
    summary: { total: fallbackProviders.length, connected: 0, pending: fallbackProviders.length, percent: 0 },
    providers: fallbackProviders,
    history: [],
  };
}

async function readResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();
  if (!text.trim()) return {};
  if (!contentType.includes('application/json')) {
    const compact = text.replace(/\s+/g, ' ').trim().slice(0, 160);
    throw new Error(
      compact.startsWith('<!DOCTYPE') || compact.startsWith('<html')
        ? 'O backend retornou HTML em vez de JSON. Confira VITE_API_URL e se o backend está online.'
        : `Resposta não JSON recebida: ${compact}`
    );
  }
  try {
    return JSON.parse(text);
  } catch (_error) {
    throw new Error('Resposta JSON inválida recebida do backend.');
  }
}

async function fetchJson(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options);
  const payload = await readResponse(response);
  if (!response.ok || payload?.ok === false) {
    throw new Error(payload?.reason || payload?.message || `Falha HTTP ${response.status}`);
  }
  return payload;
}

function labelForField(field) {
  const labels = {
    token: 'Token / API Key',
    owner: 'GitHub Owner',
    repo: 'GitHub Repo',
    branch: 'Branch',
    ownerId: 'Render Owner ID',
    serviceId: 'Render Service ID',
    serviceName: 'Nome do serviço Render',
    teamId: 'Team / Org ID',
    projectId: 'Project ID',
    projectName: 'Nome do projeto',
    projectRef: 'Project Ref',
    projectUrl: 'Project URL',
    anonKey: 'Anon Key',
    databaseUrl: 'Database URL',
    geminiModel: 'Modelo Gemini',
    mapsKey: 'Google Maps Key',
    oauthClientId: 'OAuth Client ID',
    webhookSecret: 'Webhook Secret',
    priceIdPro: 'Price ID Pro',
    priceIdEnterprise: 'Price ID Enterprise',
  };
  return labels[field] || field;
}

function fieldType(field) {
  const sensitive = ['token', 'databaseUrl', 'anonKey', 'mapsKey', 'webhookSecret'];
  return sensitive.includes(field) ? 'password' : 'text';
}

function StatusPill({ connected }) {
  return <span className={`integration-pill ${connected ? 'ok' : 'warn'}`}>{connected ? 'Conectado' : 'Pendente'}</span>;
}

function ProviderEditor({ provider, onSaved, onDeleted, onTested, busy }) {
  const fields = provider.fields || [];
  const [form, setForm] = useState(() => {
    const values = provider.values || {};
    return fields.reduce((acc, field) => {
      acc[field] = field === 'token' ? '' : values[field] || '';
      return acc;
    }, {});
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const values = provider.values || {};
    setForm(fields.reduce((acc, field) => {
      acc[field] = field === 'token' ? '' : values[field] || '';
      return acc;
    }, {}));
  }, [provider.id, provider.updatedAt]);

  return (
    <article className={`integration-card ${providerAccent[provider.id] || 'cyan'}`}>
      <div className="integration-card-head">
        <div className="integration-icon">{providerIcon[provider.id] || '•'}</div>
        <div>
          <h3>{provider.name}</h3>
          <p>{provider.purpose}</p>
        </div>
        <StatusPill connected={provider.connected} />
      </div>

      <div className="integration-card-meta">
        <span>Token: {provider.tokenPreview || 'não salvo'}</span>
        <span>{provider.configuredFields?.length || 0} campos configurados</span>
      </div>

      {provider.lastTest ? (
        <div className="integration-test-result">Último teste: sucesso em {new Date(provider.lastTest.testedAt).toLocaleString()}</div>
      ) : null}

      <button className="integration-open" onClick={() => setOpen((value) => !value)}>
        {open ? 'Fechar configuração' : 'Configurar no painel'}
      </button>

      {open ? (
        <div className="integration-form">
          <p className="integration-help">{provider.help}</p>
          {fields.map((field) => (
            <label key={field}>
              <span>{labelForField(field)}</span>
              <input
                type={fieldType(field)}
                value={form[field] || ''}
                placeholder={field === 'token' && provider.tokenPreview ? `Atual: ${provider.tokenPreview} — deixe vazio para manter` : labelForField(field)}
                onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))}
              />
            </label>
          ))}
          <div className="integration-actions">
            <button disabled={busy} onClick={() => onSaved(provider.id, form)}>Salvar</button>
            <button disabled={busy || !provider.connected} onClick={() => onTested(provider.id)}>Testar</button>
            <button disabled={busy} className="danger" onClick={() => onDeleted(provider.id)}>Desconectar</button>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function OneClickDeployPanel({ providers, busy, onRun, oneClickResult }) {
  const [project, setProject] = useState({
    projectName: 'megan-os',
    repoName: 'megan-os',
    backendName: 'megan-os-backend',
    frontendName: 'megan-os-frontend',
    branch: 'main',
  });

  const requiredIds = ['github', 'render', 'vercel', 'supabase'];
  const requiredProviders = providers.filter((provider) => requiredIds.includes(provider.id));
  const connectedRequired = requiredProviders.filter((provider) => provider.connected).length;
  const ready = connectedRequired === requiredIds.length;

  function updateField(field, value) {
    setProject((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="one-click-grid">
      <article className="one-click-hero">
        <span className="omega-kicker">MEGAN 7.4 AUTO CONNECT</span>
        <h3>Conectar tudo e publicar projeto</h3>
        <p>Um fluxo guiado que valida GitHub, Render, Vercel e Supabase, prepara o plano e publica com confirmação supervisionada.</p>

        <div className="one-click-progress">
          <strong>{connectedRequired}/{requiredIds.length}</strong>
          <span>integrações obrigatórias prontas</span>
        </div>

        <div className="one-click-required">
          {requiredProviders.map((provider) => (
            <span key={provider.id} className={provider.connected ? 'ok' : 'warn'}>
              {provider.connected ? '✅' : '⚠️'} {provider.name}
            </span>
          ))}
        </div>

        <div className="one-click-main-actions">
          <button disabled={busy} onClick={() => onRun({ ...project, confirm: false })}>
            Validar tudo
          </button>
          <button disabled={busy || !ready} className="primary" onClick={() => onRun({ ...project, confirm: true })}>
            Publicar agora
          </button>
        </div>

        {!ready ? <p className="one-click-warning">Configure as integrações pendentes antes de publicar.</p> : null}
      </article>

      <article className="deploy-panel">
        <div className="deploy-panel-title">
          <h3>Dados do projeto</h3>
          <span>editável</span>
        </div>

        <div className="one-click-form">
          {[
            ['projectName', 'Nome do projeto'],
            ['repoName', 'Repositório GitHub'],
            ['backendName', 'Serviço Render'],
            ['frontendName', 'Projeto Vercel'],
            ['branch', 'Branch'],
          ].map(([field, label]) => (
            <label key={field}>
              <span>{label}</span>
              <input value={project[field]} onChange={(event) => updateField(field, event.target.value)} />
            </label>
          ))}
        </div>
      </article>

      <article className="deploy-panel wide">
        <div className="deploy-panel-title">
          <h3>Resultado da execução</h3>
          <span>{oneClickResult?.ok ? 'pronto' : 'aguardando'}</span>
        </div>

        {oneClickResult ? (
          <div className="one-click-result">
            <p>{oneClickResult.message || oneClickResult.reason || 'Resultado recebido.'}</p>

            {oneClickResult.plan?.steps?.length ? (
              <ol className="deploy-steps compact">
                {oneClickResult.plan.steps.map((step) => (
                  <li key={step.id}>{step.title}</li>
                ))}
              </ol>
            ) : null}

            {oneClickResult.links ? (
              <div className="one-click-links">
                {Object.entries(oneClickResult.links).map(([key, value]) => (
                  <a key={key} href={value} target="_blank" rel="noreferrer">{key}: {value}</a>
                ))}
              </div>
            ) : null}

            {oneClickResult.preflight ? (
              <div className="one-click-preflight">
                {oneClickResult.preflight.map((item) => (
                  <span key={item.provider} className={item.ok ? 'ok' : 'warn'}>
                    {item.ok ? '✅' : '❌'} {item.provider}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <p>Valide tudo primeiro. Depois clique em publicar agora.</p>
        )}
      </article>
    </div>
  );
}

export default function DeployAutopilotPage() {
  const [tab, setTab] = useState('oneclick');
  const [data, setData] = useState(null);
  const [oneClickStatus, setOneClickStatus] = useState(null);
  const [oneClickResult, setOneClickResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  async function loadIntegrations() {
    setLoading(true);
    setNotice('');
    try {
      const payload = await fetchJson('/api/deploy-autopilot/api/integrations');
      setData(payload);
      try {
        const status = await fetchJson('/api/deploy-autopilot/one-click/status');
        setOneClickStatus(status);
      } catch (_error) {
        setOneClickStatus(null);
      }
    } catch (err) {
      const message = err.message || 'Não foi possível carregar integrações.';
      setData(buildFallbackData(message));
      setNotice(message);
    } finally {
      setLoading(false);
    }
  }

  async function saveProvider(providerId, form) {
    setBusy(true);
    setNotice('');
    try {
      const payload = await fetchJson(`/api/deploy-autopilot/api/integrations/${providerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setNotice(`${payload.provider?.name || providerId} salvo com segurança.`);
      await loadIntegrations();
    } catch (err) {
      setNotice(err.message || 'Erro ao salvar integração.');
    } finally {
      setBusy(false);
    }
  }

  async function deleteProvider(providerId) {
    setBusy(true);
    setNotice('');
    try {
      await fetchJson(`/api/deploy-autopilot/api/integrations/${providerId}`, { method: 'DELETE' });
      setNotice('Integração desconectada.');
      await loadIntegrations();
    } catch (err) {
      setNotice(err.message || 'Erro ao desconectar integração.');
    } finally {
      setBusy(false);
    }
  }

  async function testProvider(providerId) {
    setBusy(true);
    setNotice('');
    try {
      const payload = await fetchJson(`/api/deploy-autopilot/api/integrations/${providerId}/test`, { method: 'POST' });
      setNotice(`${payload.provider?.name || providerId} testado com sucesso.`);
      await loadIntegrations();
    } catch (err) {
      setNotice(err.message || 'Erro ao testar integração.');
    } finally {
      setBusy(false);
    }
  }

  async function prepareRun(action) {
    setBusy(true);
    setNotice('');
    try {
      await fetchJson('/api/deploy-autopilot/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      setNotice('Plano de deploy preparado com sucesso.');
    } catch (err) {
      setNotice(err.message || 'Não foi possível preparar a execução.');
    } finally {
      setBusy(false);
    }
  }

  async function runOneClick(payload) {
    setBusy(true);
    setNotice('');
    try {
      const result = await fetchJson('/api/deploy-autopilot/one-click/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setOneClickResult(result);
      setNotice(result.message || 'Fluxo 1 clique executado.');
      await loadIntegrations();
    } catch (err) {
      setOneClickResult({ ok: false, reason: err.message });
      setNotice(err.message || 'Erro no Deploy 1 clique.');
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    loadIntegrations();
  }, []);

  const providers = data?.providers || [];
  const summary = data?.summary || { total: providers.length || 6, connected: 0, pending: providers.length || 6, percent: 0 };
  const connectedProviders = useMemo(() => providers.filter((provider) => provider.connected), [providers]);
  const pendingProviders = useMemo(() => providers.filter((provider) => !provider.connected), [providers]);

  if (loading && !data) {
    return (
      <section className="deploy-autopilot-page">
        <div className="deploy-hero-card">
          <span className="omega-kicker">MEGAN 7.4</span>
          <h2>Carregando Auto Connect + Deploy 1 Clique...</h2>
          <p>Preparando GitHub, Render, Vercel, Supabase, Google e Stripe.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="deploy-autopilot-page integrations-page">
      <div className="deploy-hero-card integrations-hero">
        <div>
          <span className="omega-kicker">MEGAN 7.4 DEVELOPER MODE</span>
          <h2>Auto Connect + Deploy One Click</h2>
          <p>Configure direto no painel e publique com fluxo supervisionado: GitHub, Render, Vercel, Supabase, Google/Gemini e Stripe.</p>
        </div>
        <div className="deploy-score">
          <strong>{oneClickStatus?.summary?.requiredConnected ?? summary.connected}/{oneClickStatus?.summary?.required ?? 4}</strong>
          <span>obrigatórias prontas</span>
        </div>
      </div>

      {notice ? <div className={`deploy-alert ${notice.toLowerCase().includes('sucesso') || notice.toLowerCase().includes('salvo') || notice.toLowerCase().includes('aprovada') || notice.toLowerCase().includes('executado') ? 'ok' : 'warn'}`}>{notice}</div> : null}

      <div className="deploy-tabs">
        <button className={tab === 'oneclick' ? 'active' : ''} onClick={() => setTab('oneclick')}>Deploy 1 clique</button>
        <button className={tab === 'integrations' ? 'active' : ''} onClick={() => setTab('integrations')}>Integrações</button>
        <button className={tab === 'deploy' ? 'active' : ''} onClick={() => setTab('deploy')}>Operações</button>
        <button className={tab === 'logs' ? 'active' : ''} onClick={() => setTab('logs')}>Histórico</button>
      </div>

      {tab === 'oneclick' ? (
        <OneClickDeployPanel
          providers={providers}
          busy={busy}
          onRun={runOneClick}
          oneClickResult={oneClickResult}
        />
      ) : null}

      {tab === 'integrations' ? (
        <>
          <div className="integration-summary-grid">
            <article><strong>{summary.connected}</strong><span>Conectadas</span></article>
            <article><strong>{summary.pending}</strong><span>Pendentes</span></article>
            <article><strong>{connectedProviders.map((p) => p.name).join(', ') || 'Nenhuma'}</strong><span>Prontas para automação</span></article>
            <article><strong>{pendingProviders.map((p) => p.name).join(', ') || 'Tudo pronto'}</strong><span>Faltam configurar</span></article>
          </div>

          <div className="integration-grid">
            {providers.map((provider) => (
              <ProviderEditor
                key={provider.id}
                provider={provider}
                busy={busy}
                onSaved={saveProvider}
                onDeleted={deleteProvider}
                onTested={testProvider}
              />
            ))}
          </div>
        </>
      ) : null}

      {tab === 'deploy' ? (
        <div className="deploy-layout">
          <article className="deploy-panel wide">
            <div className="deploy-panel-title">
              <h3>Operação automática supervisionada</h3>
              <span>{busy ? 'executando' : 'pronta'}</span>
            </div>
            <p>Use estes comandos depois de conectar as integrações. A Megan valida, prepara e executa o plano com segurança.</p>
            <div className="deploy-actions-grid inside">
              <button disabled={busy} onClick={() => prepareRun('preflight_completo')}>Validar tudo</button>
              <button disabled={busy} onClick={() => prepareRun('preparar_git')}>Preparar Git</button>
              <button disabled={busy} onClick={() => prepareRun('preparar_supabase')}>Preparar Supabase</button>
              <button disabled={busy} onClick={() => prepareRun('preparar_render_vercel')}>Preparar Render + Vercel</button>
            </div>
          </article>

          <article className="deploy-panel">
            <div className="deploy-panel-title">
              <h3>Ordem recomendada</h3>
              <span>segura</span>
            </div>
            <ol className="deploy-steps compact">
              <li>Conectar GitHub.</li>
              <li>Conectar Supabase.</li>
              <li>Conectar Render.</li>
              <li>Conectar Vercel.</li>
              <li>Validar tudo e publicar.</li>
            </ol>
          </article>
        </div>
      ) : null}

      {tab === 'logs' ? (
        <article className="deploy-panel full">
          <div className="deploy-panel-title">
            <h3>Histórico de integrações</h3>
            <span>{data?.history?.length || 0}</span>
          </div>
          <div className="integration-history">
            {(data?.history || []).length ? data.history.map((item) => (
              <div key={item.id}>
                <strong>{item.provider}</strong>
                <span>{item.action}</span>
                <em>{new Date(item.createdAt).toLocaleString()}</em>
              </div>
            )) : <p>Nenhuma ação registrada ainda.</p>}
          </div>
        </article>
      ) : null}

      <article className="deploy-panel full integration-security-note">
        <div className="deploy-panel-title">
          <h3>Segurança</h3>
          <span>tokens protegidos</span>
        </div>
        <p>Os tokens são enviados apenas para o backend e salvos localmente criptografados em <code>backend/data/deploy-autopilot/integrations.secure.json</code>. Eles não ficam expostos no frontend.</p>
      </article>
    </section>
  );
}
