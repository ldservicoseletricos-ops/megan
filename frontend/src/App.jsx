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
import AutonomyCenterPage from './features/autonomy/pages/AutonomyCenterPage';
import CoreDashboardPage from './pages/CoreDashboardPage';
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
import TotalControl21Page from './features/totalControl21/TotalControl21Page';
import OperatorSovereignMind22Page from './features/operatorSovereignMind22/OperatorSovereignMind22Page';
import RealActionEngine24Page from './features/realActionEngine24/RealActionEngine24Page';
import SystemHealth25Page from './features/systemHealth25/SystemHealth25Page';
import AutonomousRepair26Page from './features/autonomousRepair26/AutonomousRepair26Page';

const tabs = [
  { id: 'core', label: 'Megan OS 4.2', badge: 'Core 4.1', accent: 'emerald' },
  { id: 'agents', label: 'Agentes 4.2', badge: 'Agents', accent: 'violet' },
  { id: 'apps42', label: 'Apps 4.2', badge: 'Apps', accent: 'emerald' },
  { id: 'autoempresa43', label: 'AUTOEMPRESA 4.3', badge: 'B2B', accent: 'emerald' },
  { id: 'copilot44', label: 'Copiloto Pessoal 4.4', badge: 'Vida', accent: 'cyan' },
  { id: 'learning45', label: 'Aprendizado 4.5', badge: 'Learning', accent: 'violet' },
  { id: 'autonomous46', label: 'Agentes Autônomos 4.6', badge: 'Auto', accent: 'emerald' },
  { id: 'multichannel47', label: 'Multicanal 4.7', badge: 'Omni', accent: 'cyan' },
  { id: 'voice48', label: 'Voz + Celular 4.8', badge: 'Mobile', accent: 'violet' },
  { id: 'global49', label: 'Central Global 4.9', badge: 'Global', accent: 'emerald' },
  { id: 'ecosystem50', label: 'Ecossistema 5.0', badge: 'SaaS', accent: 'violet' },
  { id: 'agentMarketplace51', label: 'Marketplace Agentes 5.1', badge: 'Agents+', accent: 'emerald' },
  { id: 'businessCloud52', label: 'Business Cloud 5.2', badge: 'Empresa', accent: 'cyan' },
  { id: 'personalLife53', label: 'Personal Life OS 5.3', badge: 'Vida+', accent: 'emerald' },
  { id: 'meganVoice54', label: 'Megan Voice 5.4', badge: 'Voice', accent: 'violet' },
  { id: 'meganAppStore55', label: 'Megan App Store 5.5', badge: 'Store', accent: 'emerald' },
  { id: 'meganNation60', label: 'Megan Nation 6.0', badge: 'Nation', accent: 'violet' },
  { id: 'operatingNetwork65', label: 'Operating Network 6.5', badge: 'Network', accent: 'emerald' },
  { id: 'deployAutopilot70', label: 'Deploy Autopilot 7.4', badge: 'AutoDeploy', accent: 'cyan' },
  { id: 'selfInfrastructure80', label: 'Self Infrastructure 8.0', badge: 'Infra AI', accent: 'emerald' },
  { id: 'selfGrowth85', label: 'Self Growth 8.5', badge: 'Growth AI', accent: 'violet' },
  { id: 'executiveOperator100', label: 'Executive Operator 10.0', badge: 'Executive', accent: 'cyan' },
  { id: 'operatorCommand170', label: 'Command Center 17.0', badge: 'Operator Chat', accent: 'emerald' },
{ id: 'autonomyCore180', label: 'Autonomy Core 18.0', badge: 'Auto 18', accent: 'violet' },
  { id: 'totalControl210', label: 'Total Control Chat 21.0', badge: 'Control 21', accent: 'emerald' },
  { id: 'operatorSovereignMind220', label: 'Operator Sovereign Mind 22.0', badge: 'Mind 22', accent: 'violet' },
  { id: 'realActionEngine240', label: 'Real Action Engine 24.0', badge: 'Action 24', accent: 'emerald' },
  { id: 'systemHealth250', label: 'System Health 25.0', badge: 'Health 25', accent: 'cyan' },
  { id: 'autonomousRepair260', label: 'Autonomous Repair 26.0', badge: 'Repair 26', accent: 'emerald' },
  { id: 'autonomy', label: 'Autonomy Center', badge: 'Autonomy', accent: 'violet' },
  { id: 'planos', label: 'Planos', badge: 'Core', accent: 'cyan' },
  { id: 'meu-plano', label: 'Meu Plano', badge: 'Billing', accent: 'violet' },
  { id: 'crm', label: 'CRM + Billing', badge: 'Ops', accent: 'emerald' },
  { id: 'adm', label: 'Painel ADM', badge: 'Control', accent: 'amber', accessKey: 'adm' },
  { id: 'navigation', label: 'Painel Navegação', badge: 'Drive', accent: 'cyan', accessKey: 'navigation' },
  { id: 'health', label: 'Painel Saúde', badge: 'Health', accent: 'rose', accessKey: 'health' },
];

function ShellLoading() {
  return (
    <div className="omega-loading-shell">
      <div className="omega-loading-card">
        <span className="omega-kicker">MEGAN OMEGA</span>
        <h2>Preparando sua central inteligente</h2>
        <p>Carregando módulos, acesso e visão executiva.</p>
      </div>
    </div>
  );
}

function OmegaBrand({ user, subscription }) {
  return (
    <div className="omega-brand-card">
      <div className="omega-brand-topline">
        <span className="omega-kicker">MEGAN OMEGA</span>
        <span className="omega-status-dot" />
      </div>
      <h1>Megan OS</h1>
      <p>Plataforma unificada para operação, autonomia, navegação premium e evolução contínua.</p>

      <div className="omega-user-card">
        <strong>{user?.name || 'Operador principal'}</strong>
        <span>{user?.email || 'sem email'}</span>
        <em>{subscription?.planName || 'Plano em sincronização'}</em>
      </div>
    </div>
  );
}

function OverviewRail({ access = {}, activeTab }) {
  const activeModules = Object.entries(access).filter(([, allowed]) => Boolean(allowed)).length;

  const cards = [
    { label: 'Módulos ativos', value: String(activeModules || 3), caption: 'liberados para esta conta' },
    { label: 'Ambiente', value: 'Omega Dark', caption: 'visual premium consolidado' },
    { label: 'Foco atual', value: activeTab, caption: 'módulo em uso agora' },
  ];

  return (
    <div className="omega-overview-rail">
      {cards.map((card) => (
        <article key={card.label} className="omega-overview-card">
          <span>{card.label}</span>
          <strong>{card.value}</strong>
          <p>{card.caption}</p>
        </article>
      ))}
    </div>
  );
}

export default function App() {
  const auth = useAuth();
  const [tab, setTab] = useState('core');
  const [refreshKey, setRefreshKey] = useState(0);

  const modules = useModuleAccess(Boolean(auth.user), refreshKey);

  const access = modules.access || {};
  const currentUser = modules.user || auth.user;

  const visibleTabs = useMemo(() => {
    return tabs.map((item) => ({
      ...item,
      locked: item.accessKey ? !access[item.accessKey] : false,
    }));
  }, [access]);

  const activeTabLabel = visibleTabs.find((item) => item.id === tab)?.label || 'Autonomy Center';

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
    totalControl210: <TotalControl21Page />,
    operatorSovereignMind220: <OperatorSovereignMind22Page />, 
    realActionEngine240: <RealActionEngine24Page />, 
    systemHealth250: <SystemHealth25Page />, 
    autonomousRepair260: <AutonomousRepair26Page />, 
    autonomy: <AutonomyCenterPage />,
    planos: (
      <PlanosPage
        plans={modules.plans}
        onUpdated={() => setRefreshKey((v) => v + 1)}
      />
    ),
    'meu-plano': (
      <MeuPlanoPage
        user={currentUser}
        subscription={modules.subscription}
        plans={modules.plans}
        onUpdated={() => setRefreshKey((v) => v + 1)}
      />
    ),
    crm: <CrmPage />,
    adm: access.adm ? <AdmPanel /> : <div className="locked omega-locked">Módulo ADM não contratado.</div>,
    navigation: access.navigation ? <NavigationPanel /> : <div className="locked omega-locked">Módulo Navegação não contratado.</div>,
    health: access.health ? <HealthPanel /> : <div className="locked omega-locked">Módulo Saúde não contratado.</div>,
  };

  return (
    <ProtectedRoute user={auth.user}>
      <div className="omega-shell">
        <aside className="omega-sidebar">
          <OmegaBrand user={currentUser} subscription={modules.subscription} />
          <OverviewRail access={access} activeTab={activeTabLabel} />

          <nav className="omega-nav">
            {visibleTabs.map((item) => (
              <button
                key={item.id}
                className={`omega-nav-button omega-nav-${item.accent} ${tab === item.id ? 'active' : ''}`}
                onClick={() => setTab(item.id)}
              >
                <div>
                  <strong>{item.label}</strong>
                  <span>{item.locked ? 'bloqueado no plano atual' : `${item.badge} disponível`}</span>
                </div>
                <em>{item.locked ? '🔒' : item.badge}</em>
              </button>
            ))}
          </nav>

          <button className="omega-logout" onClick={auth.logout}>
            Sair da Megan
          </button>
        </aside>

        <main className="omega-content">
          <header className="omega-topbar">
            <div>
              <span className="omega-kicker">PAINEL ATIVO</span>
              <h2>{activeTabLabel}</h2>
            </div>

            <div className="omega-topbar-pills">
              <span className="omega-top-pill">Megan OS 26.0</span>
              <span className="omega-top-pill">Fusion Live</span>
            </div>
          </header>

          <section className="omega-panel-stage">{panels[tab]}</section>
        </main>
      </div>
    </ProtectedRoute>
  );
}
