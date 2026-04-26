import React, { useMemo, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useModuleAccess } from './hooks/useModuleAccess';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import PlanosPage from './pages/PlanosPage';
import MeuPlanoPage from './pages/MeuPlanoPage';
import AdmPanel from './pages/AdmPanel';
import NavigationPanel from './pages/NavigationPanel';
import HealthPanel from './pages/HealthPanel';
import CrmPage from './pages/CrmPage';
import CoreDashboardPage from './pages/CoreDashboardPage';
import AutonomyCenterPage from './features/autonomy/pages/AutonomyCenterPage';
import AgentsCenterPage from './features/agents/pages/AgentsCenterPage';
import AppAutomationPage from './features/appAutomation/pages/AppAutomationPage';
import AutoempresaPage from './features/autoempresa/pages/AutoempresaPage';
import PersonalCopilotPage from './features/personalCopilot/pages/PersonalCopilotPage';
import ContinuousLearningPage from './features/continuousLearning/pages/ContinuousLearningPage';
import AutonomousAgentsPage from './features/autonomousAgents/pages/AutonomousAgentsPage';
import MultichannelPage from './features/multichannel/MultichannelPage';
import VoiceMobilePresencePage from './features/voiceMobilePresence/VoiceMobilePresencePage';
import GlobalCommandCenterPage from './features/globalCommandCenter/GlobalCommandCenterPage';
import EcosystemPage from './features/ecosystem/EcosystemPage';
import AgentMarketplacePage from './features/agentMarketplace/AgentMarketplacePage';
import BusinessCloudPage from './features/businessCloud/BusinessCloudPage';
import PersonalLifePage from './features/personalLife/PersonalLifePage';
import MeganVoicePage from './features/meganVoice/MeganVoicePage';
import MeganAppStorePage from './features/meganAppStore/MeganAppStorePage';
import MeganNationPage from './features/meganNation/MeganNationPage';
import OperatingNetworkPage from './features/operatingNetwork/OperatingNetworkPage';
import DeployAutopilotPage from './features/deployAutopilot/DeployAutopilotPage';
import SelfInfrastructurePage from './features/selfInfrastructure/SelfInfrastructurePage';
import SelfGrowthPage from './features/selfGrowth/SelfGrowthPage';
import ExecutiveOperatorPage from './features/executiveOperator/ExecutiveOperatorPage';
import OperatorCommandCenterPage from './features/operatorCommandCenter/OperatorCommandCenterPage';
import AutonomyCore18Page from './features/autonomyCore18/AutonomyCore18Page';
import SelfEvolution19Page from './features/selfEvolution19/SelfEvolution19Page';
import TotalControl21Page from './features/totalControl21/TotalControl21Page';
import OperatorSovereignMind22Page from './features/operatorSovereignMind22/OperatorSovereignMind22Page';
import RealActionEngine24Page from './features/realActionEngine24/RealActionEngine24Page';
import SystemHealth25Page from './features/systemHealth25/SystemHealth25Page';
import AutonomousRepair26Page from './features/autonomousRepair26/AutonomousRepair26Page';
import DevStudio27Page from './features/devStudio27/DevStudio27Page';

const tabs = [
  { id: 'core', label: 'Megan OS 4.2', badge: 'Core', category: 'Base', accent: 'emerald', description: 'Painel principal da Megan OS.' },
  { id: 'agents', label: 'Agentes 4.2', badge: 'Agents', category: 'IA', accent: 'violet', description: 'Agentes especializados reais.' },
  { id: 'apps42', label: 'Apps 4.2', badge: 'Apps', category: 'Automação', accent: 'emerald', description: 'Automação entre aplicativos.' },
  { id: 'autoempresa43', label: 'Autoempresa 4.3', badge: 'B2B', category: 'Empresa', accent: 'emerald', description: 'Operação empresarial inteligente.' },
  { id: 'copilot44', label: 'Copiloto Pessoal 4.4', badge: 'Vida', category: 'Pessoal', accent: 'cyan', description: 'Rotina, foco e decisões pessoais.' },
  { id: 'learning45', label: 'Aprendizado 4.5', badge: 'Learn', category: 'IA', accent: 'violet', description: 'Aprendizado contínuo e melhorias.' },
  { id: 'autonomous46', label: 'Agentes Autônomos 4.6', badge: 'Auto', category: 'IA', accent: 'emerald', description: 'Execução autônoma supervisionada.' },
  { id: 'multichannel47', label: 'Multicanal 4.7', badge: 'Omni', category: 'Canais', accent: 'cyan', description: 'Central para múltiplos canais.' },
  { id: 'voice48', label: 'Voz + Celular 4.8', badge: 'Mobile', category: 'Voz', accent: 'violet', description: 'Presença por voz e celular.' },
  { id: 'global49', label: 'Central Global 4.9', badge: 'Global', category: 'Comando', accent: 'emerald', description: 'Central global de comando.' },
  { id: 'ecosystem50', label: 'Ecossistema 5.0', badge: 'SaaS', category: 'Negócio', accent: 'violet', description: 'Base de ecossistema SaaS.' },
  { id: 'agentMarketplace51', label: 'Marketplace Agentes 5.1', badge: 'Store', category: 'Negócio', accent: 'emerald', description: 'Loja de agentes e módulos.' },
  { id: 'businessCloud52', label: 'Business Cloud 5.2', badge: 'Empresa', category: 'Empresa', accent: 'cyan', description: 'Dashboard executivo empresarial.' },
  { id: 'personalLife53', label: 'Personal Life OS 5.3', badge: 'Vida+', category: 'Pessoal', accent: 'emerald', description: 'Vida, metas, dinheiro e saúde.' },
  { id: 'meganVoice54', label: 'Megan Voice 5.4', badge: 'Voice', category: 'Voz', accent: 'violet', description: 'Assistente por voz total.' },
  { id: 'meganAppStore55', label: 'Megan App Store 5.5', badge: 'Apps+', category: 'Negócio', accent: 'emerald', description: 'Loja de módulos da Megan.' },
  { id: 'meganNation60', label: 'Megan Nation 6.0', badge: 'Nation', category: 'Rede', accent: 'violet', description: 'Comunidade e marketplace global.' },
  { id: 'operatingNetwork65', label: 'Operating Network 6.5', badge: 'Network', category: 'Rede', accent: 'emerald', description: 'Rede operacional para empresas.' },
  { id: 'deployAutopilot70', label: 'Deploy Autopilot 7.4', badge: 'Deploy', category: 'Deploy', accent: 'cyan', description: 'Publicação e deploy guiado.' },
  { id: 'selfInfrastructure80', label: 'Self Infrastructure 8.0', badge: 'Infra', category: 'Sistema', accent: 'emerald', description: 'Infraestrutura inteligente.' },
  { id: 'selfGrowth85', label: 'Self Growth 8.5', badge: 'Growth', category: 'Sistema', accent: 'violet', description: 'Motor de autoevolução.' },
  { id: 'executiveOperator100', label: 'Executive Operator 10.0', badge: 'Exec', category: 'Comando', accent: 'cyan', description: 'Operador executivo da Megan.' },
  { id: 'operatorCommand170', label: 'Command Center 17.0', badge: 'Chat', category: 'Comando', accent: 'emerald', description: 'Chat operador conectado ao sistema.' },
  { id: 'autonomyCore180', label: 'Autonomy Core 18.0', badge: 'Auto 18', category: 'Autonomia', accent: 'violet', description: 'Núcleo de autonomia operacional.' },
  { id: 'selfEvolution190', label: 'Self Evolution 19.0', badge: 'Evolve', category: 'Autonomia', accent: 'cyan', description: 'Evolução própria organizada.' },
  { id: 'totalControl210', label: 'Total Control Chat 21.0', badge: 'Control', category: 'Comando', accent: 'emerald', description: 'Chat com controle total dos módulos.' },
  { id: 'operatorSovereignMind220', label: 'Operator Sovereign Mind 22.0', badge: 'Mind', category: 'Autonomia', accent: 'violet', description: 'Camada soberana de decisão.' },
  { id: 'realActionEngine240', label: 'Real Action Engine 24.0', badge: 'Action', category: 'Ações', accent: 'emerald', description: 'Motor de ações reais.' },
  { id: 'systemHealth250', label: 'System Health 25.0', badge: 'Health', category: 'Sistema', accent: 'cyan', description: 'Saúde e diagnóstico do sistema.' },
  { id: 'autonomousRepair260', label: 'Autonomous Repair 26.0', badge: 'Repair', category: 'Sistema', accent: 'emerald', description: 'Reparo autônomo assistido.' },
  { id: 'devStudio270', label: 'Dev Studio 27.0', badge: 'Studio', category: 'Criação', accent: 'violet', description: 'Desenvolvimento, criação e publicação.' },
  { id: 'autonomy', label: 'Autonomy Center', badge: 'Central', category: 'Autonomia', accent: 'violet', description: 'Centro completo de autonomia.' },
  { id: 'planos', label: 'Planos', badge: 'Planos', category: 'Conta', accent: 'cyan', description: 'Planos disponíveis.' },
  { id: 'meu-plano', label: 'Meu Plano', badge: 'Billing', category: 'Conta', accent: 'violet', description: 'Assinatura e acesso.' },
  { id: 'crm', label: 'CRM + Billing', badge: 'CRM', category: 'Empresa', accent: 'emerald', description: 'CRM, leads e cobrança.' },
  { id: 'adm', label: 'Painel ADM', badge: 'ADM', category: 'Painéis', accent: 'amber', accessKey: 'adm', description: 'Administração principal.' },
  { id: 'navigation', label: 'Painel Navegação', badge: 'Drive', category: 'Painéis', accent: 'cyan', accessKey: 'navigation', description: 'Navegação premium.' },
  { id: 'health', label: 'Painel Saúde', badge: 'Saúde', category: 'Painéis', accent: 'rose', accessKey: 'health', description: 'Saúde, rotina e indicadores.' },
];

const categories = ['Todos', ...Array.from(new Set(tabs.map((item) => item.category)))];

function ShellLoading() {
  return (
    <div className="omega-loading-shell">
      <div className="omega-loading-card premium-glass">
        <span className="omega-orb" />
        <span className="omega-kicker">MEGAN OS 27.0</span>
        <h2>Preparando sua central inteligente</h2>
        <p>Carregando módulos, permissões, dados de operação e visual premium.</p>
      </div>
    </div>
  );
}

function OmegaBrand({ user, subscription }) {
  return (
    <div className="omega-brand-card premium-glass">
      <div className="omega-brand-topline">
        <span className="omega-kicker">MEGAN OMEGA</span>
        <span className="omega-live-chip"><i /> Online</span>
      </div>
      <h1>Megan OS</h1>
      <p>Central unificada para criação, operação, autonomia, deploy, negócios e evolução contínua.</p>

      <div className="omega-user-card">
        <strong>{user?.name || 'Operador principal'}</strong>
        <span>{user?.email || 'sem email conectado'}</span>
        <em>{subscription?.planName || 'Plano em sincronização'}</em>
      </div>
    </div>
  );
}

function MetricsRail({ totalModules, filteredModules, activeTabLabel, lockedCount }) {
  const cards = [
    { label: 'Módulos preservados', value: totalModules, caption: 'fases unificadas no painel' },
    { label: 'Visíveis agora', value: filteredModules, caption: 'após filtro e busca' },
    { label: 'Bloqueados', value: lockedCount, caption: 'dependem do plano ativo' },
    { label: 'Em operação', value: activeTabLabel, caption: 'módulo aberto agora' },
  ];

  return (
    <section className="omega-metrics-grid">
      {cards.map((card) => (
        <article key={card.label} className="omega-metric-card premium-glass">
          <span>{card.label}</span>
          <strong>{card.value}</strong>
          <p>{card.caption}</p>
        </article>
      ))}
    </section>
  );
}

function QuickActions({ onSelect }) {
  const actions = [
    { label: 'Criar projeto', target: 'devStudio270', icon: '⚡' },
    { label: 'Ver saúde', target: 'systemHealth250', icon: '🛡️' },
    { label: 'Comando', target: 'operatorCommand170', icon: '🧠' },
    { label: 'Deploy', target: 'deployAutopilot70', icon: '🚀' },
  ];

  return (
    <div className="omega-quick-actions">
      {actions.map((action) => (
        <button key={action.target} type="button" onClick={() => onSelect(action.target)}>
          <span>{action.icon}</span>
          {action.label}
        </button>
      ))}
    </div>
  );
}

function ModuleCard({ item, active, onClick }) {
  return (
    <button
      type="button"
      className={`omega-module-card omega-nav-${item.accent} ${active ? 'active' : ''} ${item.locked ? 'locked-card' : ''}`}
      onClick={onClick}
    >
      <div className="omega-module-card-head">
        <span>{item.category}</span>
        <em>{item.locked ? '🔒' : item.badge}</em>
      </div>
      <strong>{item.label}</strong>
      <p>{item.locked ? 'Bloqueado no plano atual.' : item.description}</p>
    </button>
  );
}

function LockedPanel({ label }) {
  return (
    <div className="omega-locked premium-glass">
      <span className="omega-kicker">Acesso bloqueado</span>
      <h3>{label}</h3>
      <p>Esse módulo existe no projeto, mas não está liberado para o plano atual.</p>
    </div>
  );
}

export default function App() {
  const auth = useAuth();
  const [tab, setTab] = useState('core');
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const modules = useModuleAccess(Boolean(auth.user), refreshKey);
  const access = modules.access || {};
  const currentUser = modules.user || auth.user;

  const visibleTabs = useMemo(() => {
    return tabs.map((item) => ({
      ...item,
      locked: item.accessKey ? !access[item.accessKey] : false,
    }));
  }, [access]);

  const filteredTabs = useMemo(() => {
    const term = search.trim().toLowerCase();
    return visibleTabs.filter((item) => {
      const categoryMatch = category === 'Todos' || item.category === category;
      const searchMatch = !term || `${item.label} ${item.badge} ${item.category} ${item.description}`.toLowerCase().includes(term);
      return categoryMatch && searchMatch;
    });
  }, [visibleTabs, search, category]);

  const activeItem = visibleTabs.find((item) => item.id === tab) || visibleTabs[0];
  const activeTabLabel = activeItem?.label || 'Megan OS';
  const lockedCount = visibleTabs.filter((item) => item.locked).length;

  if (auth.loading) {
    return <ShellLoading />;
  }

  if (!auth.user) {
    return <LoginPage onLogin={auth.login} error={auth.error} />;
  }

  const panels = {
    core: <CoreDashboardPage />,
    agents: <AgentsCenterPage />,
    apps42: <AppAutomationPage />,
    autoempresa43: <AutoempresaPage />,
    copilot44: <PersonalCopilotPage />,
    learning45: <ContinuousLearningPage />,
    autonomous46: <AutonomousAgentsPage />,
    multichannel47: <MultichannelPage />,
    voice48: <VoiceMobilePresencePage />,
    global49: <GlobalCommandCenterPage />,
    ecosystem50: <EcosystemPage />,
    agentMarketplace51: <AgentMarketplacePage />,
    businessCloud52: <BusinessCloudPage />,
    personalLife53: <PersonalLifePage />,
    meganVoice54: <MeganVoicePage />,
    meganAppStore55: <MeganAppStorePage />,
    meganNation60: <MeganNationPage />,
    operatingNetwork65: <OperatingNetworkPage />,
    deployAutopilot70: <DeployAutopilotPage />,
    selfInfrastructure80: <SelfInfrastructurePage />,
    selfGrowth85: <SelfGrowthPage />,
    executiveOperator100: <ExecutiveOperatorPage />,
    operatorCommand170: <OperatorCommandCenterPage />,
    autonomyCore180: <AutonomyCore18Page />,
    selfEvolution190: <SelfEvolution19Page />,
    totalControl210: <TotalControl21Page />,
    operatorSovereignMind220: <OperatorSovereignMind22Page />,
    realActionEngine240: <RealActionEngine24Page />,
    systemHealth250: <SystemHealth25Page />,
    autonomousRepair260: <AutonomousRepair26Page />,
    devStudio270: <DevStudio27Page />,
    autonomy: <AutonomyCenterPage />,
    planos: (
      <PlanosPage
        plans={modules.plans}
        onUpdated={() => setRefreshKey((value) => value + 1)}
      />
    ),
    'meu-plano': (
      <MeuPlanoPage
        user={currentUser}
        subscription={modules.subscription}
        plans={modules.plans}
        onUpdated={() => setRefreshKey((value) => value + 1)}
      />
    ),
    crm: <CrmPage />,
    adm: access.adm ? <AdmPanel /> : <LockedPanel label="Painel ADM" />,
    navigation: access.navigation ? <NavigationPanel /> : <LockedPanel label="Painel Navegação" />,
    health: access.health ? <HealthPanel /> : <LockedPanel label="Painel Saúde" />,
  };

  function openTab(nextTab) {
    setTab(nextTab);
    setSidebarOpen(false);
  }

  return (
    <ProtectedRoute user={auth.user}>
      <div className="omega-shell">
        <button className="omega-mobile-toggle" type="button" onClick={() => setSidebarOpen((value) => !value)}>
          ☰ Módulos
        </button>

        <aside className={`omega-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <OmegaBrand user={currentUser} subscription={modules.subscription} />
          <QuickActions onSelect={openTab} />

          <div className="omega-search-card premium-glass">
            <label htmlFor="module-search">Buscar módulo</label>
            <input
              id="module-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Ex: deploy, voz, saúde, Dev Studio"
            />
          </div>

          <div className="omega-category-strip">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className={category === item ? 'active' : ''}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <nav className="omega-nav" aria-label="Módulos Megan OS">
            {filteredTabs.map((item) => (
              <ModuleCard
                key={item.id}
                item={item}
                active={tab === item.id}
                onClick={() => openTab(item.id)}
              />
            ))}
          </nav>

          <button className="omega-logout" type="button" onClick={auth.logout}>
            Sair da Megan
          </button>
        </aside>

        <main className="omega-content">
          <header className="omega-topbar premium-glass">
            <div>
              <span className="omega-kicker">Painel ativo</span>
              <h2>{activeTabLabel}</h2>
              <p>{activeItem?.description || 'Módulo operacional da Megan OS.'}</p>
            </div>

            <div className="omega-topbar-pills">
              <span className="omega-top-pill">Megan OS 27.0</span>
              <span className="omega-top-pill">Fusion Live</span>
              <span className="omega-top-pill">Frontend Premium</span>
            </div>
          </header>

          <MetricsRail
            totalModules={visibleTabs.length}
            filteredModules={filteredTabs.length}
            activeTabLabel={activeTabLabel}
            lockedCount={lockedCount}
          />

          <section className="omega-panel-stage">{panels[tab]}</section>
        </main>
      </div>
    </ProtectedRoute>
  );
}
