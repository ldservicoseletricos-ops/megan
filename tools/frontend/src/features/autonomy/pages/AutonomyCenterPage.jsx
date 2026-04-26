import { useEffect, useMemo, useState } from 'react';
import AutonomyHeroCard from '../components/AutonomyHeroCard';
import AutonomyScoresCard from '../components/AutonomyScoresCard';
import AutonomyControlCard from '../components/AutonomyControlCard';
import AutonomyDecisionCard from '../components/AutonomyDecisionCard';
import AutonomyHistoryCard from '../components/AutonomyHistoryCard';
import AutonomyModulesCard from '../components/AutonomyModulesCard';
import AutonomyMissionQueueCard from '../components/AutonomyMissionQueueCard';
import AutonomyApprovalCard from '../components/AutonomyApprovalCard';
import AutonomyRollbackCard from '../components/AutonomyRollbackCard';
import AutonomyTimerCard from '../components/AutonomyTimerCard';
import AutonomyPatchCard from '../components/AutonomyPatchCard';
import AutonomyNextMissionCard from '../components/AutonomyNextMissionCard';
import AutonomyAdaptiveScoresCard from '../components/AutonomyAdaptiveScoresCard';
import AutonomyMissionImpactCard from '../components/AutonomyMissionImpactCard';
import AutonomyMultiPatchCard from '../components/AutonomyMultiPatchCard';
import AutonomyCompositeGoalsCard from '../components/AutonomyCompositeGoalsCard';
import AutonomyStagesPlannerCard from '../components/AutonomyStagesPlannerCard';
import AutonomyFutureImpactCard from '../components/AutonomyFutureImpactCard';
import AutonomyRoadmapCard from '../components/AutonomyRoadmapCard';
import AutonomyBrainsCard from '../components/AutonomyBrainsCard';
import AutonomySpecializationCard from '../components/AutonomySpecializationCard';
import AutonomyDelegationCard from '../components/AutonomyDelegationCard';
import AutonomySharedGoalsCard from '../components/AutonomySharedGoalsCard';
import AutonomyConsensusCard from '../components/AutonomyConsensusCard';
import AutonomyCoordinationCard from '../components/AutonomyCoordinationCard';
import AutonomyCapabilitiesCard from '../components/AutonomyCapabilitiesCard';
import AutonomyGeneratedBrainsCard from '../components/AutonomyGeneratedBrainsCard';
import AutonomyAuditCard from '../components/AutonomyAuditCard';
import AutonomySelfOptimizationCard from '../components/AutonomySelfOptimizationCard';
import AutonomyBrainRankingCard from '../components/AutonomyBrainRankingCard';
import AutonomyFusionCard from '../components/AutonomyFusionCard';
import AutonomyRetirementCard from '../components/AutonomyRetirementCard';
import AutonomyMeritCard from '../components/AutonomyMeritCard';
import AutonomyResourceEconomyCard from '../components/AutonomyResourceEconomyCard';
import AutonomyCognitiveBudgetCard from '../components/AutonomyCognitiveBudgetCard';
import AutonomyEnergyCard from '../components/AutonomyEnergyCard';
import AutonomyEfficiencyCard from '../components/AutonomyEfficiencyCard';
import AutonomyBrainMarketCard from '../components/AutonomyBrainMarketCard';
import AutonomyAuctionsCard from '../components/AutonomyAuctionsCard';
import AutonomyPriorityBidsCard from '../components/AutonomyPriorityBidsCard';
import AutonomyOpportunityAllocationCard from '../components/AutonomyOpportunityAllocationCard';
import AutonomyGovernanceCard from '../components/AutonomyGovernanceCard';
import AutonomyLayeredPoliciesCard from '../components/AutonomyLayeredPoliciesCard';
import AutonomyVotingWeightsCard from '../components/AutonomyVotingWeightsCard';
import AutonomyGovernanceLedgerCard from '../components/AutonomyGovernanceLedgerCard';
import AutonomyEpisodesCard from '../components/AutonomyEpisodesCard';
import AutonomyNarrativeCard from '../components/AutonomyNarrativeCard';
import AutonomyLessonsCard from '../components/AutonomyLessonsCard';
import AutonomyRecallCard from '../components/AutonomyRecallCard';
import AutonomyForecastHistoryCard from '../components/AutonomyForecastHistoryCard';
import AutonomyBestPathCard from '../components/AutonomyBestPathCard';
import AutonomyProbabilityCard from '../components/AutonomyProbabilityCard';
import AutonomyForecastScenariosCard from '../components/AutonomyForecastScenariosCard';
import AutonomyIdeasCard from '../components/AutonomyIdeasCard';
import AutonomySolutionSynthesisCard from '../components/AutonomySolutionSynthesisCard';
import AutonomyBreakthroughCard from '../components/AutonomyBreakthroughCard';
import AutonomyInnovationLedgerCard from '../components/AutonomyInnovationLedgerCard';
import AutonomyHumanContextCard from '../components/AutonomyHumanContextCard';
import AutonomyInterfaceProfileCard from '../components/AutonomyInterfaceProfileCard';
import AutonomyCommunicationScoreCard from '../components/AutonomyCommunicationScoreCard';
import AutonomyExperienceLedgerCard from '../components/AutonomyExperienceLedgerCard';
import AutonomyHumanPrioritiesCard from '../components/AutonomyHumanPrioritiesCard';
import AutonomyExecutiveTodayCard from '../components/AutonomyExecutiveTodayCard';
import AutonomyFocusEngineCard from '../components/AutonomyFocusEngineCard';
import AutonomyPriorityCalendarCard from '../components/AutonomyPriorityCalendarCard';
import AutonomyExecutiveLedgerCard from '../components/AutonomyExecutiveLedgerCard';
import AutonomyCrmLeadsCard from '../components/AutonomyCrmLeadsCard';
import AutonomyPipelineCard from '../components/AutonomyPipelineCard';
import AutonomyConversionCard from '../components/AutonomyConversionCard';
import AutonomyRevenueLedgerCard from '../components/AutonomyRevenueLedgerCard';
import AutonomySalesActionsCard from '../components/AutonomySalesActionsCard';
import {
  activateAutonomyMission,
  approveAutonomyAction,
  completeAutonomyMission,
  createAutonomyMission,
  getAutonomyDashboard,
  getAutonomyHistory,
  getAutonomyPatchHistory,
  getAutonomySnapshot,
  getAutonomyStatus,
  getAutonomyTimerStatus,
  rejectAutonomyAction,
  runAutonomyCycle,
  runAutonomyDiagnostics,
  runAutonomyRepair,
  runAutonomyRollback,
  setAutonomyGoal,
  setAutonomyMode,
  simulateAutonomyDecision,
  startAutonomyTimer,
  stopAutonomyTimer,
  tickAutonomyTimer,
  selectNextAutonomyMission,
  applyAutonomySafePatch,
  applyAutonomyMultiPatch,
  getAutonomyAdaptiveScores,
  rankAutonomyMissionImpact,
  selectBestAutonomyMission,
  validateAutonomyMultiPatch,
  getAutonomyCompositeGoals,
  createAutonomyCompositeGoal,
  getAutonomyPlannerStages,
  getAutonomyFutureImpact,
  getAutonomyRoadmap,
  regenerateAutonomyRoadmap,
  getAutonomyBrains,
  getAutonomyModuleSpecializations,
  getAutonomyDelegationPlan,
  dispatchAutonomyDelegation,
  getAutonomySharedGoals,
  createAutonomySharedGoal,
  getAutonomyConsensusStatus,
  decideAutonomyConsensus,
  getAutonomyCoordinationStatus,
  executeAutonomyCoordination,
  getAutonomyCapabilities,
  expandAutonomyCapabilities,
  createAutonomyBrain,
  getAutonomyGeneratedBrains,
  getAutonomyAuditReport,
  runAutonomyAudit,
  getAutonomyGrowthPlan,
  getAutonomySelfOptimization,
  getAutonomyBrainPerformance,
  getAutonomyBrainRanking,
  getAutonomyFusionOpportunities,
  getAutonomyRetirementQueue,
  fuseAutonomyBrains,
  retireAutonomyBrain,
  rebalanceAutonomyIntelligence,
  getAutonomyResourceStatus,
  rebalanceAutonomyResources,
  getAutonomyBudgetStatus,
  recalculateAutonomyBudget,
  getAutonomyEnergyStatus,
  optimizeAutonomyEnergy,
  getAutonomyMarketStatus,
  openAutonomyMarket,
  getAutonomyMarketReputation,
  getAutonomyAuctions,
  runAutonomyAuction,
  getAutonomyPriorityBids,
  recalculateAutonomyPriority,
  getAutonomyOpportunityAllocation,
  getAutonomyGovernanceStatus,
  getAutonomyLayeredPolicies,
  getAutonomyVotingWeights,
  getAutonomyGovernanceLedger,
  runAutonomyGovernanceVote,
  getAutonomyEpisodes,
  createAutonomyEpisode,
  getAutonomyNarrative,
  getAutonomyLessons,
  searchAutonomyRecall,
  getAutonomyForecastScenarios,
  runAutonomyForecast,
  getAutonomyProbability,
  getAutonomyForecastBestPath,
  getAutonomyForecastHistory,
  getAutonomyIdeas,
  generateAutonomyIdeas,
  synthesizeAutonomySolution,
  runAutonomyBreakthrough,
  getAutonomyInnovationHistory,
  analyzeAutonomyHumanContext,
  getAutonomyInterfaceProfile,
  adaptAutonomyInterface,
  getAutonomyCommunicationScore,
  getAutonomyExperienceHistory,
  getAutonomyHumanGoals,
  createAutonomyHumanGoal,
  getAutonomyExecutiveToday,
  createAutonomyExecutivePlan,
  getAutonomyFocus,
  getAutonomyPriorityCalendar,
  getAutonomyExecutiveLedger,
  getAutonomyCrmLeads,
  createAutonomyCrmLead,
  getAutonomyCrmPipeline,
  createAutonomyCrmFollowup,
  getAutonomyCrmConversion,
  getAutonomyCrmRevenue,
  getAutonomyCrmActions,
} from '../services/autonomyApi';

const TABS = [
  { key: 'overview', label: 'Visão geral' },
  { key: 'execution', label: 'Execução' },
  { key: 'brains', label: 'Cérebros' },
  { key: 'strategy', label: 'Estratégia' },
  { key: 'memory', label: 'Memória' },
  { key: 'forecast', label: 'Previsão' },
  { key: 'creative', label: 'Criatividade' },
  { key: 'human', label: 'Humano' },
  { key: 'executive', label: 'Executivo' },
  { key: 'sales', label: 'Comercial' },
  { key: 'economy', label: 'Economia' },
];

function Zone({ eyebrow, title, description, actions, children }) {
  return (
    <section className="autonomy-zone">
      <header className="autonomy-zone-header">
        <div>
          {eyebrow ? <span className="autonomy-zone-eyebrow">{eyebrow}</span> : null}
          <h3>{title}</h3>
          {description ? <p>{description}</p> : null}
        </div>
        {actions ? <div className="autonomy-zone-actions">{actions}</div> : null}
      </header>
      <div className="autonomy-zone-grid">{children}</div>
    </section>
  );
}

function OverviewStrip({ status, snapshot, dashboard, feedback, error }) {
  const items = [
    { label: 'Missão ativa', value: status?.activeMission?.title || snapshot?.state?.currentMission || 'Sem missão ativa' },
    { label: 'Meta atual', value: dashboard?.activeGoal?.title || snapshot?.activeGoal?.title || 'Sem meta ativa' },
    { label: 'Brain ativo', value: status?.state?.activeBrain || snapshot?.state?.activeBrain || 'autonomy' },
    { label: 'Modo', value: status?.state?.mode || snapshot?.state?.mode || 'supervised_autonomy' },
  ];

  return (
    <section className="autonomy-overview-strip">
      <div className="autonomy-overview-grid">
        {items.map((item) => (
          <article key={item.label} className="autonomy-overview-card-clean">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
      </div>
      {error ? <div className="error autonomy-feedback autonomy-feedback-clean">{error}</div> : null}
      {feedback ? <div className="hint autonomy-feedback autonomy-feedback-clean">{feedback}</div> : null}
    </section>
  );
}

export default function AutonomyCenterPage() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [status, setStatus] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [history, setHistory] = useState([]);
  const [simulation, setSimulation] = useState(null);
  const [timer, setTimer] = useState(null);
  const [patchHistory, setPatchHistory] = useState([]);
  const [adaptiveScores, setAdaptiveScores] = useState(null);
  const [missionImpactRanking, setMissionImpactRanking] = useState([]);
  const [compositeGoals, setCompositeGoals] = useState([]);
  const [plannerStages, setPlannerStages] = useState([]);
  const [futureImpact, setFutureImpact] = useState(null);
  const [roadmap, setRoadmap] = useState([]);
  const [roadmapPriorities, setRoadmapPriorities] = useState(null);
  const [brains, setBrains] = useState([]);
  const [brainSummary, setBrainSummary] = useState(null);
  const [specializations, setSpecializations] = useState([]);
  const [delegation, setDelegation] = useState(null);
  const [delegationHistory, setDelegationHistory] = useState([]);
  const [sharedGoals, setSharedGoals] = useState([]);
  const [consensus, setConsensus] = useState(null);
  const [coordination, setCoordination] = useState(null);
  const [capabilities, setCapabilities] = useState(null);
  const [generatedBrains, setGeneratedBrains] = useState([]);
  const [audit, setAudit] = useState(null);
  const [growthPlan, setGrowthPlan] = useState(null);
  const [selfOptimization, setSelfOptimization] = useState(null);
  const [brainPerformance, setBrainPerformance] = useState(null);
  const [brainRanking, setBrainRanking] = useState([]);
  const [fusionOpportunities, setFusionOpportunities] = useState([]);
  const [retirementQueue, setRetirementQueue] = useState([]);
  const [resourceStatus, setResourceStatus] = useState(null);
  const [budgetStatus, setBudgetStatus] = useState(null);
  const [energyStatus, setEnergyStatus] = useState(null);
  const [efficiencyLedger, setEfficiencyLedger] = useState(null);
  const [marketStatus, setMarketStatus] = useState(null);
  const [marketReputation, setMarketReputation] = useState([]);
  const [auctions, setAuctions] = useState(null);
  const [priorityBids, setPriorityBids] = useState(null);
  const [opportunityAllocation, setOpportunityAllocation] = useState(null);
  const [governance, setGovernance] = useState(null);
  const [layeredPolicies, setLayeredPolicies] = useState(null);
  const [votingWeights, setVotingWeights] = useState(null);
  const [governanceLedger, setGovernanceLedger] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [narrative, setNarrative] = useState(null);
  const [lessons, setLessons] = useState(null);
  const [recall, setRecall] = useState(null);
  const [forecastScenarios, setForecastScenarios] = useState(null);
  const [probabilityMatrix, setProbabilityMatrix] = useState(null);
  const [forecastBestPath, setForecastBestPath] = useState(null);
  const [forecastHistory, setForecastHistory] = useState(null);
  const [ideas, setIdeas] = useState(null);
  const [synthesis, setSynthesis] = useState(null);
  const [breakthrough, setBreakthrough] = useState(null);
  const [innovationHistory, setInnovationHistory] = useState(null);
  const [humanContext, setHumanContext] = useState(null);
  const [interfaceProfile, setInterfaceProfile] = useState(null);
  const [communicationScore, setCommunicationScore] = useState(null);
  const [experienceHistory, setExperienceHistory] = useState(null);
  const [humanGoals, setHumanGoals] = useState([]);
  const [humanGoalsSummary, setHumanGoalsSummary] = useState(null);
  const [executiveToday, setExecutiveToday] = useState(null);
  const [focusState, setFocusState] = useState(null);
  const [priorityCalendar, setPriorityCalendar] = useState(null);
  const [executiveLedger, setExecutiveLedger] = useState(null);
  const [crmLeads, setCrmLeads] = useState(null);
  const [crmPipeline, setCrmPipeline] = useState(null);
  const [crmConversion, setCrmConversion] = useState(null);
  const [crmRevenue, setCrmRevenue] = useState(null);
  const [crmActions, setCrmActions] = useState(null);


  async function loadForecast() {
    const [scenariosData, probabilityData, bestPathData, historyData] = await Promise.all([getAutonomyForecastScenarios(), getAutonomyProbability(), getAutonomyForecastBestPath(), getAutonomyForecastHistory()]);
    setForecastScenarios(scenariosData);
    setProbabilityMatrix(probabilityData);
    setForecastBestPath(bestPathData);
    setForecastHistory(historyData);
  }

  async function loadAll() {
    setError('');
    const [statusData, snapshotData, dashboardData, historyData, timerData, patchHistoryData, adaptiveScoresData, compositeGoalsData, plannerStagesData, futureImpactData, roadmapData, brainsData, specializationData, sharedGoalsData, consensusData, coordinationData, capabilitiesData, generatedBrainsData, auditData, growthPlanData, selfOptimizationData, brainPerformanceData, brainRankingData, fusionData, retirementData, resourceData, budgetData, energyData, marketData, marketReputationData, auctionsData, priorityBidsData, opportunityAllocationData, governanceData, layeredPoliciesData, votingWeightsData, governanceLedgerData, episodesData, narrativeData, lessonsData, ideasData, innovationHistoryData] = await Promise.all([
      getAutonomyStatus(), getAutonomySnapshot(), getAutonomyDashboard(), getAutonomyHistory(), getAutonomyTimerStatus(), getAutonomyPatchHistory(), getAutonomyAdaptiveScores(), getAutonomyCompositeGoals(), getAutonomyPlannerStages(), getAutonomyFutureImpact(), getAutonomyRoadmap(), getAutonomyBrains(), getAutonomyModuleSpecializations(), getAutonomySharedGoals(), getAutonomyConsensusStatus(), getAutonomyCoordinationStatus(), getAutonomyCapabilities(), getAutonomyGeneratedBrains(), getAutonomyAuditReport(), getAutonomyGrowthPlan(), getAutonomySelfOptimization(), getAutonomyBrainPerformance(), getAutonomyBrainRanking(), getAutonomyFusionOpportunities(), getAutonomyRetirementQueue(), getAutonomyResourceStatus(), getAutonomyBudgetStatus(), getAutonomyEnergyStatus(), getAutonomyMarketStatus(), getAutonomyMarketReputation(), getAutonomyAuctions(), getAutonomyPriorityBids(), getAutonomyOpportunityAllocation(), getAutonomyGovernanceStatus(), getAutonomyLayeredPolicies(), getAutonomyVotingWeights('balanced'), getAutonomyGovernanceLedger(), getAutonomyEpisodes(), getAutonomyNarrative(), getAutonomyLessons(), getAutonomyIdeas(), getAutonomyInnovationHistory(),
    ]);
    setStatus(statusData); setSnapshot(snapshotData); setDashboard(dashboardData); setHistory(historyData.items || []); setTimer(timerData); setPatchHistory(patchHistoryData.items || []); setAdaptiveScores(adaptiveScoresData.scores || null); setMissionImpactRanking(snapshotData.missionImpactRanking || dashboardData.missionImpactRanking || []); setCompositeGoals(compositeGoalsData.items || []); setPlannerStages(plannerStagesData.items || []); setFutureImpact(futureImpactData || null); setRoadmap(roadmapData.items || roadmapData.roadmap || []); setRoadmapPriorities(roadmapData.priorities || null); setBrains(brainsData.items || []); setBrainSummary(brainsData.summary || null); setSpecializations(specializationData.items || []); setDelegation(snapshotData.delegation || null); setDelegationHistory(snapshotData.delegationHistory || []); setSharedGoals(sharedGoalsData.items || []); setConsensus(consensusData || null); setCoordination(coordinationData || null); setCapabilities(capabilitiesData || null); setGeneratedBrains(generatedBrainsData.items || []); setAudit(auditData || null); setGrowthPlan(growthPlanData || null); setSelfOptimization(selfOptimizationData || null); setBrainPerformance(brainPerformanceData || null); setBrainRanking(brainRankingData.items || []); setFusionOpportunities(fusionData.items || []); setRetirementQueue(retirementData.items || []); setResourceStatus(resourceData || snapshotData.resourceEconomy || dashboardData.resourceEconomy || null); setBudgetStatus(budgetData || snapshotData.cognitiveBudget || dashboardData.cognitiveBudget || null); setEnergyStatus(energyData || snapshotData.energy || dashboardData.energy || null); setEfficiencyLedger(snapshotData.efficiencyLedger || dashboardData.efficiencyLedger || null); setMarketStatus(marketData || snapshotData.market || null); setMarketReputation(marketReputationData.items || marketData?.items || []); setAuctions(auctionsData || snapshotData.auctions || null); setPriorityBids(priorityBidsData || snapshotData.priorityBids || null); setOpportunityAllocation(opportunityAllocationData || snapshotData.opportunityAllocation || null); setGovernance(governanceData || null); setLayeredPolicies(layeredPoliciesData || null); setVotingWeights(votingWeightsData || null); setGovernanceLedger(governanceLedgerData || null); setEpisodes(episodesData.episodes || []); setNarrative(narrativeData || null); setLessons(lessonsData || null); setIdeas(ideasData || null); setInnovationHistory(innovationHistoryData || null);
    const humanContextData = await analyzeAutonomyHumanContext({ text: 'avaliar experiência humana atual' });
    const interfaceProfileData = await getAutonomyInterfaceProfile();
    const communicationScoreData = await getAutonomyCommunicationScore();
    const experienceHistoryData = await getAutonomyExperienceHistory();
    const humanGoalsData = await getAutonomyHumanGoals();
    const executiveTodayData = await getAutonomyExecutiveToday();
    const focusData = await getAutonomyFocus();
    const priorityCalendarData = await getAutonomyPriorityCalendar();
    const executiveLedgerData = await getAutonomyExecutiveLedger();
    setHumanContext(humanContextData);
    setInterfaceProfile(interfaceProfileData);
    setCommunicationScore(communicationScoreData);
    setExperienceHistory(experienceHistoryData);
    setHumanGoals(humanGoalsData.items || []);
    setHumanGoalsSummary(humanGoalsData.summary || null);
    setExecutiveToday(executiveTodayData);
    setFocusState(focusData);
    setPriorityCalendar(priorityCalendarData);
    setExecutiveLedger(executiveLedgerData);
  }

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([loadAll(), loadForecast()]).catch((err) => active && setError(err.message || 'Falha ao carregar Autonomy Center.')).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  async function handleAction(action, successMessage) {
    try {
      setBusy(true);
      setFeedback('');
      const result = await action();
      await loadAll();
      setFeedback(successMessage || result?.validation?.summary || result?.result?.resultSummary || result?.resultSummary || 'Ação concluída.');
      return result;
    } catch (err) {
      setError(err.message || 'Ação falhou.');
      return null;
    } finally {
      setBusy(false);
    }
  }

  const activeMissionSuggestion = useMemo(() => (
    status?.state?.lastAutoSelection
      ? { selected: status?.activeMission, reason: status.state.lastAutoSelection.reason }
      : status?.activeMission
        ? { selected: status.activeMission, reason: 'Missão ativa mantida pelo núcleo.' }
        : null
  ), [status]);

  if (loading) return <div className="loading">Carregando Autonomy Center...</div>;

  return (
    <div className="autonomy-organizer">
      <AutonomyHeroCard status={status} snapshot={snapshot} />
      <OverviewStrip status={status} snapshot={snapshot} dashboard={dashboard} error={error} feedback={feedback} />

      <section className="autonomy-tabs-shell">
        <div className="autonomy-tabs-row">
          {TABS.map((tab) => (
            <button key={tab.key} type="button" className={`autonomy-tab-button ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' ? (
          <div className="autonomy-tab-panel">
            <Zone eyebrow="Resumo" title="Estado central" description="Visão limpa do núcleo atual, sem poluição visual.">
              <AutonomyScoresCard snapshot={snapshot} dashboard={dashboard} />
              <AutonomyAdaptiveScoresCard scores={adaptiveScores || snapshot?.scores || {}} />
            </Zone>
            <Zone eyebrow="Operação" title="Missões e módulos" description="O que está ativo agora e como a base está distribuída.">
              <AutonomyMissionQueueCard
                missionQueue={snapshot?.missionQueue}
                loading={busy}
                onCreateMission={(payload) => handleAction(() => createAutonomyMission(payload), 'Missão criada e adicionada à fila.')}
                onActivateMission={(missionId) => handleAction(() => activateAutonomyMission(missionId), 'Missão ativada.')}
                onCompleteMission={(missionId) => handleAction(() => completeAutonomyMission(missionId), 'Missão concluída.')}
              />
              <AutonomyModulesCard modules={snapshot?.modules || []} summary={status?.summary} />
            </Zone>
            <Zone eyebrow="Registro" title="Histórico recente" description="Últimos eventos importantes do núcleo autônomo.">
              <AutonomyDecisionCard status={status} simulation={simulation} />
              <AutonomyHistoryCard history={history} />
            </Zone>
          </div>
        ) : null}

        {activeTab === 'execution' ? (
          <div className="autonomy-tab-panel">
            <Zone eyebrow="Execução" title="Comandos seguros" description="Ações operacionais e validações, organizadas por prioridade.">
              <AutonomyControlCard
                currentMode={status?.state?.mode}
                loading={busy}
                onRunCycle={() => handleAction(() => runAutonomyCycle(), 'Ciclo autônomo executado com sucesso.')}
                onRunDiagnostics={() => handleAction(() => runAutonomyDiagnostics(), 'Diagnóstico concluído e registrado.')}
                onRunRepair={(actionType) => handleAction(() => runAutonomyRepair(actionType), 'Reparo seguro aplicado dentro da política atual.')}
                onChangeMode={(mode) => handleAction(() => setAutonomyMode(mode), `Modo de autonomia alterado para ${mode}.`)}
                onSetGoal={(payload) => handleAction(() => setAutonomyGoal(payload), 'Meta atualizada com sucesso.')}
              />
              <AutonomyTimerCard
                timer={timer || snapshot?.timer}
                loading={busy}
                onStart={() => handleAction(() => startAutonomyTimer(), 'Timer contínuo iniciado.')}
                onStop={() => handleAction(() => stopAutonomyTimer(), 'Timer contínuo interrompido.')}
                onTick={() => handleAction(() => tickAutonomyTimer(), 'Tick autônomo executado com sucesso.')}
              />
            </Zone>
            <Zone eyebrow="Fluxo" title="Próxima ação" description="Missão sugerida, patch seguro e governança operacional.">
              <AutonomyNextMissionCard suggestion={activeMissionSuggestion} loading={busy} onSelectNext={() => handleAction(() => selectNextAutonomyMission(), 'Próxima missão selecionada automaticamente.')} />
              <AutonomyPatchCard patchHistory={patchHistory} loading={busy} onApplySafePatch={(actionType) => handleAction(() => applyAutonomySafePatch(actionType), 'Patch seguro processado pela política atual.')} />
              <AutonomyApprovalCard approvals={snapshot?.approvalBacklog || dashboard?.approvalBacklog || []} loading={busy} onApprove={(approvalId) => handleAction(() => approveAutonomyAction(approvalId), 'Ação aprovada com sucesso.')} onReject={(approvalId) => handleAction(() => rejectAutonomyAction(approvalId), 'Ação rejeitada e registrada.')} />
              <AutonomyRollbackCard rollbackQueue={snapshot?.rollbackQueue || dashboard?.rollbackQueue || []} loading={busy} onRunRollback={(rollbackId) => handleAction(() => runAutonomyRollback(rollbackId), 'Rollback executado com segurança.')} />
            </Zone>
            <Zone eyebrow="Simulação" title="Validação antes da execução" description="Evita que o painel vire um mural de botões sem contexto.">
              <AutonomyMissionImpactCard ranking={missionImpactRanking} loading={busy} onRank={() => handleAction(async () => { const result = await rankAutonomyMissionImpact(); setMissionImpactRanking(result.ranking || []); return result; }, 'Ranking de impacto recalculado com sucesso.')} onSelectBest={() => handleAction(async () => { const result = await selectBestAutonomyMission(); if (result?.ranking) setMissionImpactRanking(result.ranking); return result; }, 'Melhor missão selecionada por impacto real.')} />
              <AutonomyMultiPatchCard lastMultiPatch={snapshot?.patch?.lastMultiPatch || status?.state?.lastMultiPatch} loading={busy} onValidate={(files) => handleAction(() => validateAutonomyMultiPatch(files), 'Plano multiarquivo validado com sucesso.')} onApply={(payload) => handleAction(() => applyAutonomyMultiPatch(payload), 'Patch multiarquivo enviado para validação/aplicação.')} />
              <section className="autonomy-simulate-card autonomy-card autonomy-span-2">
                <header className="autonomy-card-header"><div><span className="autonomy-eyebrow">Simulação</span><h3>Decisão guiada</h3></div><p>Rodar análise hipotética antes de mexer em qualquer fluxo existente.</p></header>
                <div className="autonomy-simulate-grid">
                  <button disabled={busy} onClick={async () => setSimulation(await handleAction(() => simulateAutonomyDecision('generate_patch_plan'), 'Simulação de geração de plano concluída.'))}>Simular plano</button>
                  <button disabled={busy} onClick={async () => setSimulation(await handleAction(() => simulateAutonomyDecision('apply_safe_local_patch'), 'Simulação de patch seguro concluída.'))}>Simular patch</button>
                  <button disabled={busy} onClick={async () => setSimulation(await handleAction(() => simulateAutonomyDecision('deploy_to_production'), 'Simulação crítica executada.'))}>Simular crítico</button>
                </div>
              </section>
            </Zone>
          </div>
        ) : null}

        {activeTab === 'brains' ? (
          <div className="autonomy-tab-panel">
            <Zone eyebrow="Inteligência" title="Mapa dos cérebros" description="Cérebros, especialização, delegação e evolução interna agrupados por função.">
              <AutonomyBrainsCard brains={brains} summary={brainSummary || status?.brains || {}} />
              <AutonomySpecializationCard items={specializations} />
              <AutonomyDelegationCard delegation={delegation} history={delegationHistory} loading={busy} onPlan={() => handleAction(async () => { const result = await getAutonomyDelegationPlan({}); setDelegation(result); return result; }, 'Plano de delegação gerado com sucesso.')} onDispatch={() => handleAction(async () => { const result = await dispatchAutonomyDelegation({}); setDelegation(result.plan || null); setDelegationHistory(result.history || []); return result; }, 'Missão despachada entre cérebros internos.')} />
              <AutonomyCapabilitiesCard capabilities={capabilities} loading={busy} onExpand={(payload) => handleAction(async () => { const result = await expandAutonomyCapabilities(payload); setCapabilities({ ...(capabilities || {}), items: result.items || [] }); return result; }, 'Capacidade expandida com sucesso.')} />
              <AutonomyGeneratedBrainsCard brains={generatedBrains} loading={busy} onCreate={(payload) => handleAction(async () => { const result = await createAutonomyBrain(payload); setGeneratedBrains(result.items || []); return result; }, 'Novo cérebro especializado criado.')} />
              <AutonomySelfOptimizationCard optimization={selfOptimization} growthPlan={growthPlan} />
            </Zone>
            <Zone eyebrow="Desempenho" title="Ranking, fusão e mérito" description="Visão limpa de performance, sem cards se atropelando.">
              <AutonomyBrainRankingCard ranking={brainRanking} performance={brainPerformance} />
              <AutonomyFusionCard opportunities={fusionOpportunities} loading={busy} onFuse={(payload) => handleAction(() => fuseAutonomyBrains(payload), 'Fusão de cérebros registrada com sucesso.')} />
              <AutonomyRetirementCard queue={retirementQueue} loading={busy} onRetire={(payload) => handleAction(() => retireAutonomyBrain(payload), 'Cérebro movido para aposentadoria com segurança.')} />
              <AutonomyMeritCard performance={brainPerformance} onRebalance={() => handleAction(() => rebalanceAutonomyIntelligence(), 'Rebalanceamento de inteligência executado.')} loading={busy} />
            </Zone>
          </div>
        ) : null}

        {activeTab === 'strategy' ? (
          <div className="autonomy-tab-panel">
            <Zone eyebrow="Governança" title="Metas e consenso" description="Objetivos, consenso e coordenação com menos ruído visual.">
              <AutonomySharedGoalsCard goals={sharedGoals} loading={busy} onCreateGoal={(payload) => handleAction(async () => { const result = await createAutonomySharedGoal(payload); setSharedGoals(result.items || []); return result; }, 'Meta compartilhada criada com sucesso.')} />
              <AutonomyConsensusCard consensus={consensus} history={consensus?.history || []} loading={busy} onDecide={(payload) => handleAction(async () => { const result = await decideAutonomyConsensus(payload); setConsensus(result); return result; }, 'Consenso interno atualizado.')} />
              <AutonomyCoordinationCard coordination={coordination} history={coordination?.history || []} loading={busy} onExecute={(payload) => handleAction(async () => { const result = await executeAutonomyCoordination(payload); setCoordination(result); return result; }, 'Execução coordenada registrada.')} />
              <AutonomyAuditCard audit={audit} loading={busy} onRun={() => handleAction(async () => { const result = await runAutonomyAudit(); setAudit(result.report || null); return result; }, 'Auditoria interna executada com sucesso.')} />
            </Zone>
            <Zone eyebrow="Política" title="Governança contextual" description="Pesos de voto, camadas de política e ledger de decisões por contexto.">
              <AutonomyGovernanceCard governance={governance} loading={busy} onVote={(payload) => handleAction(async () => { const result = await runAutonomyGovernanceVote(payload); setGovernance(result.policies ? governance : governance); setLayeredPolicies(result.policies || null); setVotingWeights(result.voting || null); setGovernanceLedger(result.ledger || null); return result; }, 'Voto contextual de governança executado com sucesso.')} />
              <AutonomyLayeredPoliciesCard policies={layeredPolicies} />
              <AutonomyVotingWeightsCard voting={votingWeights} />
              <AutonomyGovernanceLedgerCard ledger={governanceLedger} />
            </Zone>
            
            <Zone eyebrow="Planejamento" title="Roadmap estratégico" description="Metas compostas, etapas e impacto futuro em um fluxo legível.">
              <AutonomyCompositeGoalsCard goals={compositeGoals} loading={busy} onCreateGoal={(payload) => handleAction(() => createAutonomyCompositeGoal(payload), 'Meta composta criada com sucesso.')} />
              <AutonomyStagesPlannerCard stages={plannerStages} />
              <AutonomyFutureImpactCard futureImpact={futureImpact} loading={busy} onRefresh={() => handleAction(async () => { const result = await getAutonomyFutureImpact(); setFutureImpact(result); return result; }, 'Previsão de impacto atualizada.')} />
              <AutonomyRoadmapCard roadmap={roadmap} priorities={roadmapPriorities} loading={busy} onRegenerate={() => handleAction(async () => { const result = await regenerateAutonomyRoadmap(); setRoadmap(result.roadmap || []); setRoadmapPriorities(result.priorities || null); return result; }, 'Roadmap autogerado atualizado.')} />
            </Zone>
          </div>
        ) : null}


        {activeTab === 'memory' ? (
          <div className="autonomy-tab-panel">
            <Zone eyebrow="Memória 3.1" title="Memória episódica profunda" description="Episódios, narrativa, lições e recuperação de experiências organizados em uma área própria.">
              <AutonomyEpisodesCard episodes={episodes} loading={busy} onCreate={(payload) => handleAction(async () => { const result = await createAutonomyEpisode(payload); setEpisodes(result.episodes || []); return result; }, 'Episódio registrado na memória profunda.')} />
              <AutonomyNarrativeCard narrative={narrative} />
              <AutonomyLessonsCard lessons={lessons} />
              <AutonomyRecallCard recall={recall} loading={busy} onSearch={(payload) => handleAction(async () => { const result = await searchAutonomyRecall(payload); setRecall(result); return result; }, 'Experiências similares recuperadas.')} />
            </Zone>
          </div>
        ) : null}


        {activeTab === 'forecast' ? (
          <div className="autonomy-tab-panel">
            <Zone eyebrow="Previsão 3.2" title="Simulação de cenários futuros" description="A Megan avalia caminhos prováveis antes de agir, comparando risco, impacto e chance de sucesso.">
              <AutonomyForecastScenariosCard scenarios={forecastScenarios} loading={busy} onRun={() => handleAction(async () => { const result = await runAutonomyForecast({ intent: 'simular próximos ciclos' }); setForecastScenarios({ scenarios: result.scenarios || [], ranking: result.ranking || [] }); setProbabilityMatrix(result.probability || null); setForecastBestPath(result); await loadForecast(); return result; }, 'Forecast 3.2 executado e registrado.')} />
              <AutonomyProbabilityCard probability={probabilityMatrix} />
              <AutonomyBestPathCard bestPath={forecastBestPath} />
              <AutonomyForecastHistoryCard history={forecastHistory} />
            </Zone>
          </div>
        ) : null}

        {activeTab === 'creative' ? (
          <div className="autonomy-tab-panel">
            <Zone eyebrow="Criatividade 3.3" title="Criatividade estratégica guiada" description="A Megan cria opções novas, sintetiza planos híbridos e busca rotas alternativas quando há bloqueios.">
              <AutonomyIdeasCard ideas={ideas} loading={busy} onGenerate={(payload) => handleAction(async () => { const result = await generateAutonomyIdeas(payload); setIdeas(result); const history = await getAutonomyInnovationHistory(); setInnovationHistory(history); return result; }, 'Ideias estratégicas 3.3 geradas.')} />
              <AutonomySolutionSynthesisCard synthesis={synthesis} loading={busy} onSynthesize={(payload) => handleAction(async () => { const result = await synthesizeAutonomySolution(payload); setSynthesis(result); const history = await getAutonomyInnovationHistory(); setInnovationHistory(history); return result; }, 'Solução híbrida sintetizada pela Megan.')} />
              <AutonomyBreakthroughCard breakthrough={breakthrough} loading={busy} onRun={(payload) => handleAction(async () => { const result = await runAutonomyBreakthrough(payload); setBreakthrough(result); const history = await getAutonomyInnovationHistory(); setInnovationHistory(history); return result; }, 'Breakthrough estratégico executado.')} />
              <AutonomyInnovationLedgerCard history={innovationHistory} />
            </Zone>
          </div>
        ) : null}


        {activeTab === 'human' ? (
          <div className="autonomy-tab-panel">
            <Zone eyebrow="Humano 3.4" title="Adaptação humana avançada" description="A Megan ajusta tom, densidade, prioridade visual e clareza conforme o momento do usuário.">
              <AutonomyHumanContextCard context={humanContext} loading={busy} onAnalyze={(payload) => handleAction(async () => { const result = await analyzeAutonomyHumanContext(payload); setHumanContext(result); return result; }, 'Contexto humano 3.4 analisado.')} />
              <AutonomyInterfaceProfileCard profile={interfaceProfile} loading={busy} onAdapt={(payload) => handleAction(async () => { const result = await adaptAutonomyInterface(payload); setInterfaceProfile(result.profile || result); return result; }, 'Interface adaptada ao contexto humano atual.')} />
              <AutonomyCommunicationScoreCard score={communicationScore} />
              <AutonomyExperienceLedgerCard history={experienceHistory} />
            </Zone>
          </div>
        ) : null}


        {activeTab === 'executive' ? (
          <div className="autonomy-tab-panel">
            <Zone eyebrow="Executivo 3.6" title="Assistente executivo real" description="A Megan organiza metas humanas, foco diário, agenda estratégica e histórico executivo sem apagar o núcleo existente.">
              <AutonomyHumanPrioritiesCard goals={humanGoals} summary={humanGoalsSummary} loading={busy} onCreate={(payload) => handleAction(async () => { const result = await createAutonomyHumanGoal(payload); setHumanGoals(result.items || []); setHumanGoalsSummary(result.summary || null); const today = await getAutonomyExecutiveToday(); setExecutiveToday(today); const focus = await getAutonomyFocus(); setFocusState(focus); return result; }, 'Prioridade humana criada e reordenada.')} />
              <AutonomyExecutiveTodayCard today={executiveToday} loading={busy} onPlan={(payload) => handleAction(async () => { const result = await createAutonomyExecutivePlan(payload); setExecutiveToday({ ...(executiveToday || {}), lastPlan: result, headline: result.primary ? ('Hoje o foco principal é: ' + result.primary.title) : 'Plano executivo criado.' }); const ledger = await getAutonomyExecutiveLedger(); setExecutiveLedger(ledger); return result; }, 'Plano executivo 3.6 criado.')} />
              <AutonomyFocusEngineCard focus={focusState} />
              <AutonomyPriorityCalendarCard calendar={priorityCalendar} />
              <AutonomyExecutiveLedgerCard ledger={executiveLedger} />
            </Zone>
          </div>
        ) : null}



        {activeTab === 'sales' ? (
          <div className="autonomy-tab-panel">
            <Zone eyebrow="Comercial 3.8" title="CRM inteligente e operador comercial" description="Leads, funil, conversão, follow-ups e receita prevista em uma área própria.">
              <AutonomyCrmLeadsCard leads={crmLeads} loading={busy} onCreate={(payload) => handleAction(async () => { const result = await createAutonomyCrmLead(payload); setCrmLeads(result); const pipeline = await getAutonomyCrmPipeline(); setCrmPipeline(pipeline); const conversion = await getAutonomyCrmConversion(); setCrmConversion(conversion); const revenue = await getAutonomyCrmRevenue(); setCrmRevenue(revenue); return result; }, 'Lead criado no CRM inteligente.')} />
              <AutonomyPipelineCard pipeline={crmPipeline} />
              <AutonomyConversionCard conversion={crmConversion} />
              <AutonomySalesActionsCard actions={crmActions} loading={busy} onFollowup={(payload) => handleAction(async () => { const result = await createAutonomyCrmFollowup(payload); const actions = await getAutonomyCrmActions(); setCrmActions(actions); return result; }, 'Follow-up comercial gerado.')} />
              <AutonomyRevenueLedgerCard revenue={crmRevenue} />
            </Zone>
          </div>
        ) : null}

        {activeTab === 'economy' ? (
          <div className="autonomy-tab-panel">
            <Zone eyebrow="Mercado" title="Mercado interno entre cérebros" description="Reputação, leilões e alocação em um bloco próprio.">
              <AutonomyBrainMarketCard market={marketStatus} reputation={marketReputation} loading={busy} onOpen={() => handleAction(async () => { const result = await openAutonomyMarket(); setMarketStatus(result.market || null); return result; }, 'Mercado interno atualizado com sucesso.')} />
              <AutonomyAuctionsCard auctions={auctions} loading={busy} onRun={(missionId) => handleAction(async () => { const result = await runAutonomyAuction({ missionId }); setOpportunityAllocation(result.opportunityAllocation || null); setAuctions({ ...(auctions || {}), items: result.auctions || [] }); return result; }, 'Leilão interno executado com sucesso.')} />
              <AutonomyPriorityBidsCard bids={priorityBids} loading={busy} onRecalculate={() => handleAction(async () => { const result = await recalculateAutonomyPriority(); setPriorityBids(result.bids || null); setOpportunityAllocation(result.opportunityAllocation || null); return result; }, 'Lances de prioridade recalculados com sucesso.')} />
              <AutonomyOpportunityAllocationCard allocation={opportunityAllocation} />
            </Zone>
            <Zone eyebrow="Recursos" title="Economia e energia" description="Alocação, orçamento e energia em painéis limpos e legíveis.">
              <AutonomyResourceEconomyCard resources={resourceStatus} loading={busy} onRebalance={() => handleAction(async () => { const result = await rebalanceAutonomyResources(); setResourceStatus(result.resources || null); return result; }, 'Economia interna rebalanceada com sucesso.')} />
              <AutonomyCognitiveBudgetCard budget={budgetStatus} loading={busy} onRecalculate={() => handleAction(async () => { const result = await recalculateAutonomyBudget(); setBudgetStatus(result.budget || null); return result; }, 'Orçamento cognitivo recalculado com sucesso.')} />
              <AutonomyEnergyCard energy={energyStatus} efficiency={efficiencyLedger} loading={busy} onOptimize={() => handleAction(async () => { const result = await optimizeAutonomyEnergy(); setEnergyStatus(result.energy || null); return result; }, 'Energia computacional otimizada com sucesso.')} />
              <AutonomyEfficiencyCard ledger={efficiencyLedger} />
            </Zone>
          </div>
        ) : null}
      </section>
    </div>
  );
}
