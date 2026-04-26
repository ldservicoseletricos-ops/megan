import React, { useEffect, useMemo, useState } from 'react';
import MapCard from '../components/MapCard';

function levelLabel(level) {
  if (level === 'danger') return 'alert-danger';
  if (level === 'warning') return 'alert-warning';
  return 'alert-info';
}

function directionGlyph(instruction = '') {
  const text = instruction.toLowerCase();
  if (text.includes('esquerda')) return '←';
  if (text.includes('direita')) return '→';
  if (text.includes('retorno') || text.includes('volte')) return '↺';
  if (text.includes('rotatória')) return '⟳';
  return '↑';
}

export default function RoutePage({ position, routeSummary, driveMode, onSpeakNext, onOpenMaps, onOpenWaze, onRefresh }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [overlayChatOpen, setOverlayChatOpen] = useState(false);
  const [nightMode, setNightMode] = useState(routeSummary?.theme !== 'day');
  const primaryAlert = useMemo(() => routeSummary?.visualAlerts?.[0] || null, [routeSummary]);
  const glyph = useMemo(() => directionGlyph(routeSummary?.nextInstruction), [routeSummary?.nextInstruction]);
  const trafficTone = routeSummary?.traffic?.intensity || routeSummary?.alertLevel || 'info';
  const laneGuidance = routeSummary?.laneGuidance || { lanes: [], recommendedIndex: -1, note: '' };

  useEffect(() => {
    setNightMode(routeSummary?.theme !== 'day');
  }, [routeSummary?.theme]);

  useEffect(() => {
    async function openFullscreen() {
      const element = document.documentElement;
      if (!document.fullscreenElement && element?.requestFullscreen) {
        try {
          await element.requestFullscreen();
          setIsFullscreen(true);
        } catch {
          setIsFullscreen(false);
        }
      } else if (document.fullscreenElement) {
        setIsFullscreen(true);
      }
    }
    openFullscreen();
    function handleFullscreenChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
        setIsFullscreen(false);
        return;
      }
      if (!document.fullscreenElement && document.documentElement?.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
  }

  return (
    <div className={`drive-screen drive-screen-overlay-mode drive-screen-hotfix drive-screen-v36 ${nightMode ? 'night-mode-active' : ''}`}>
      <MapCard position={position} routeSummary={routeSummary} fullscreen={isFullscreen} />

      <div className="hud-top-strip overlay-panel">
        <div>
          <span className="mini-kicker">WAR ROOM</span>
          <strong>{routeSummary?.routeModeLabel || 'WAR ROOM LIVE OPS V36'}</strong>
        </div>
        <div className="hud-pill-row">
          <span>{routeSummary?.roadShield || 'SP-046'}</span>
          <span>{routeSummary?.arrivalWindowText || 'Janela estimada ativa'}</span>
          <span>{routeSummary?.dangerLabel || 'atenção elevada'}</span>
        </div>
      </div>

      <div className="drive-floating-stack">
        {primaryAlert && (
          <div className={`drive-alert-banner drive-alert-banner-hotfix ${levelLabel(primaryAlert.level)} ${primaryAlert.pulse ? 'pulse-strong' : ''}`}>
            <span className="drive-alert-kicker">ALERTA VISUAL FORTE</span>
            <strong>{primaryAlert.title}</strong>
            <p>{primaryAlert.body}</p>
          </div>
        )}

        <div className={`giant-direction-card giant-direction-card-v26 ${trafficTone === 'danger' ? 'giant-direction-danger pulse-strong' : trafficTone === 'warning' ? 'giant-direction-warning' : ''}`}>
          <div className="giant-direction-arrow">{glyph}</div>
          <div className="giant-direction-copy">
            <span className="direction-kicker">PRÓXIMA MANOBRA</span>
            <h1>{routeSummary?.nextInstruction || 'Aguardando rota ativa.'}</h1>
            <p>{routeSummary?.laneHint || 'Mantenha-se atento às próximas faixas.'}</p>
          </div>
          <div className="maneuver-side-panel maneuver-side-panel-v26">
            <span className="maneuver-badge">{routeSummary?.maneuverBadge || 'MANOBRA'}</span>
            <strong>{routeSummary?.guidance?.nextManeuverDistance || '350 m'}</strong>
            <small>{routeSummary?.laneFocusText || 'Faixa ideal ativa'}</small>
          </div>
        </div>

        <div className="hud-progress-grid">
          <div className="progress-panel overlay-panel">
            <div className="progress-panel-top">
              <span className="mini-kicker">PROGRESSO DA ROTA</span>
              <strong>{routeSummary?.progressLabel || 'Rota em andamento'}</strong>
            </div>
            <div className="progress-bar-shell">
              <div className="progress-bar-fill" style={{ width: `${routeSummary?.progressPercent || 0}%` }} />
            </div>
            <small>{routeSummary?.betterRouteText || 'Sem recálculo no momento.'}</small>
          </div>
          <div className={`danger-meter-panel overlay-panel ${(routeSummary?.dangerScore || 0) >= 80 ? 'danger-meter-critical pulse-strong' : ''}`}>
            <span className="mini-kicker">MEDIDOR DE PERIGO</span>
            <strong>{routeSummary?.dangerScore || 0}%</strong>
            <small>{routeSummary?.dangerLabel || 'atenção moderada'}</small>
          </div>
        </div>

        <div className="lane-hud-panel overlay-panel">
          <div>
            <span className="mini-kicker">FAIXA IDEAL EM TEMPO REAL</span>
            <strong>{routeSummary?.laneFocusText || 'Faixa ideal ativa'}</strong>
            <small>{laneGuidance.note || 'Posicione o veículo com antecedência.'}</small>
          </div>
          <div className="lane-visual-strip">
            {laneGuidance.lanes.map((lane, index) => (
              <div key={`${lane}-${index}`} className={`lane-box ${laneGuidance.recommendedIndex === index ? 'lane-box-active' : ''}`}>
                <span>{index + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`turn-panel overlay-panel turn-panel-hotfix ${routeSummary?.alertLevel === 'danger' ? 'turn-panel-danger pulse-strong' : ''}`}>
          <div className="turn-panel-top">
            <span className="turn-distance">{routeSummary?.distanceText || '—'}</span>
            <span className="turn-road">{routeSummary?.currentRoad || 'Rota ativa'}</span>
          </div>
          <div className="turn-subline">
            <strong>{routeSummary?.destination || 'Destino ativo'}</strong>
            <span>{routeSummary?.arrivalText || 'Chegada estimada em breve'}</span>
          </div>
        </div>

        <div className="drive-stats-bar overlay-panel slim-panel">
          <div className="drive-stat-box"><strong>{routeSummary?.etaText || '—'}</strong><span>ETA</span></div>
          <div className="drive-stat-box drive-stat-box-highlight"><strong>{routeSummary?.speedText || '—'}</strong><span>Velocidade</span></div>
          <div className="drive-stat-box"><strong>{routeSummary?.speedLimitText || '—'}</strong><span>Limite</span></div>
        </div>
      </div>

      <div className="alerts-grid-strong overlay-alerts-grid">
        {(routeSummary?.visualAlerts || []).map((alert) => (
          <div key={alert.id} className={`alert-card-strong hotfix-alert-card ${levelLabel(alert.level)} ${alert.pulse ? 'pulse-strong' : ''}`}>
            <strong>{alert.title}</strong>
            <span>{alert.body}</span>
          </div>
        ))}
      </div>

      <div className={`traffic-panel overlay-panel traffic-panel-hotfix ${routeSummary?.trafficPanelTone === 'danger' ? 'traffic-panel-danger' : ''}`}>
        <div>
          <span className="mini-kicker">TRÂNSITO AO VIVO</span>
          <strong>{routeSummary?.traffic?.summary || 'Sem dados de trânsito no momento.'}</strong>
        </div>
        <div className="traffic-panel-grid">
          <div><b>{routeSummary?.traffic?.delayText || '—'}</b><span>Atraso</span></div>
          <div><b>{routeSummary?.traffic?.averageSpeedText || '—'}</b><span>Velocidade média</span></div>
          <div><b>{routeSummary?.alternatives?.[1]?.gainText || '—'}</b><span>Melhor alternativa</span></div>
        </div>
      </div>

      <div className="command-center-grid overlay-panel">
        <div className="command-center-card">
          <span className="mini-kicker">COMMAND CENTER</span>
          <strong>{routeSummary?.commandCenter?.travelModeLabel || 'Executivo premium'}</strong>
          <small>Modo {routeSummary?.commandCenter?.executiveMode || 'ativo'} • score {routeSummary?.commandCenter?.tripScore || 0}</small>
        </div>
        <div className="command-center-card">
          <span className="mini-kicker">CÂMERA / TELEMETRIA</span>
          <strong>{routeSummary?.commandCenter?.cameraStatus || 'assistido'}</strong>
          <small>Telemetria {routeSummary?.commandCenter?.telemetriaStatus || 'normal'}</small>
        </div>
        <div className="command-center-card">
          <span className="mini-kicker">FROTA / RISCO</span>
          <strong>{routeSummary?.commandCenter?.fleetSummary?.routeHealth || 'estável'}</strong>
          <small>Alertas críticos {routeSummary?.commandCenter?.fleetSummary?.criticalAlerts ?? 0}</small>
        </div>
      </div>


      <div className="enterprise-liveops-panel overlay-panel">
        <div className="enterprise-liveops-head">
          <span className="mini-kicker">ENTERPRISE LIVE OPS V35</span>
          <strong>{routeSummary?.enterpriseLiveOps?.tenant || 'Megan Enterprise'}</strong>
          <small>{routeSummary?.enterpriseLiveOps?.centralOpsNote || 'Operação empresarial ativa.'}</small>
        </div>
        <div className="enterprise-liveops-grid">
          <div className="command-center-card">
            <span className="mini-kicker">MULTI USUÁRIOS</span>
            <strong>{routeSummary?.enterpriseLiveOps?.activeUsers || 0} usuários</strong>
            <small>{routeSummary?.enterpriseLiveOps?.activeManagers || 0} gestores online</small>
          </div>
          <div className="command-center-card">
            <span className="mini-kicker">PERMISSÕES</span>
            <strong>{routeSummary?.enterpriseLiveOps?.permissionsMode || 'granular'}</strong>
            <small>Controle por perfil e operação</small>
          </div>
          <div className="command-center-card">
            <span className="mini-kicker">RELATÓRIOS</span>
            <strong>{routeSummary?.enterpriseLiveOps?.reportAutomation || '0 relatórios'}</strong>
            <small>Geração automática ativa</small>
          </div>
        </div>
        <div className="enterprise-user-strip">
          {(routeSummary?.multiUserAccess || []).map((user) => (
            <span key={user.id} className="enterprise-user-badge">{user.role} • {user.status}</span>
          ))}
        </div>
      </div>

      <div className="command-center-grid overlay-panel command-center-grid-pro">
        <div className="command-center-card">
          <span className="mini-kicker">CÂMERA & SEGURANÇA</span>
          <strong>{routeSummary?.cameraSafety?.driverState || 'normal'}</strong>
          <small>Risco frontal {routeSummary?.cameraSafety?.frontalRisk || 'baixo'} • {routeSummary?.cameraSafety?.fatigueWarning || 'sem alerta crítico'}</small>
        </div>
        <div className="command-center-card">
          <span className="mini-kicker">TELEMETRIA PRO</span>
          <strong>{routeSummary?.telemetryPro?.averageSpeed || '—'}</strong>
          <small>Parado {routeSummary?.telemetryPro?.stoppedTime || '—'} • eficiência {routeSummary?.telemetryPro?.efficiency || '—'}</small>
        </div>
        <div className="command-center-card">
          <span className="mini-kicker">EMPRESA / FROTA</span>
          <strong>{routeSummary?.enterprisePanel?.executiveStatus || 'estável'}</strong>
          <small>{routeSummary?.enterprisePanel?.tripScoreLabel || 'score 0/100'} • {routeSummary?.enterprisePanel?.operationalSummary || 'sem resumo'}</small>
        </div>
      </div>



      <div className={`enterprise-liveops-panel overlay-panel ${(routeSummary?.warRoom?.severity === 'crítica' || routeSummary?.warRoom?.severity === 'alta') ? 'traffic-panel-danger' : ''}`}>
        <div className="enterprise-liveops-head">
          <span className="mini-kicker">WAR ROOM LIVE OPS V36</span>
          <strong>{routeSummary?.warRoom?.commandStatus || 'ativo'}</strong>
          <small>{routeSummary?.warRoom?.priorityOfDay || 'Prioridade operacional ativa.'}</small>
        </div>
        <div className="enterprise-liveops-grid">
          <div className="command-center-card">
            <span className="mini-kicker">INCIDENTES SEVEROS</span>
            <strong>{routeSummary?.warRoom?.severeIncidents ?? 0}</strong>
            <small>Severidade {routeSummary?.warRoom?.severity || 'moderada'}</small>
          </div>
          <div className="command-center-card">
            <span className="mini-kicker">TEMPO RESPOSTA</span>
            <strong>{routeSummary?.warRoom?.responseTime || '—'}</strong>
            <small>Escalonamento {routeSummary?.warRoom?.escalationMode || 'manual'}</small>
          </div>
          <div className="command-center-card">
            <span className="mini-kicker">SCORE OPERACIONAL</span>
            <strong>{routeSummary?.warRoom?.operationalScore || '—'}</strong>
            <small>{(routeSummary?.warRoom?.criticalRegions || []).join(' • ') || 'Sem região crítica'}</small>
          </div>
        </div>
        <div className="enterprise-user-strip">
          {(routeSummary?.warRoom?.liveGoals || []).map((goal) => (
            <span key={goal.id} className="enterprise-user-badge">{goal.label} • {goal.value}</span>
          ))}
        </div>
      </div>

      <div className="voice-command-panel overlay-panel">
        <div>
          <span className="mini-kicker">COMANDOS DE VOZ</span>
          <strong>Controle rápido da direção</strong>
        </div>
        <div className="voice-command-chips">
          {(routeSummary?.commandCenter?.voiceCommandExamples || []).map((item) => (
            <button key={item} className="voice-chip" onClick={() => onSpeakNext?.()}>{item}</button>
          ))}
        </div>
      </div>

      <div className="hud-card command-center-card">
        <div className="hud-card-header">
          <span>Governança</span>
          <strong>Web Admin V35</strong>
        </div>
        <div className="mini-metrics">
          <div className="mini-metric"><span>Perfis</span><strong>{routeSummary?.enterpriseLiveOps?.activeUsers || 12}</strong></div>
          <div className="mini-metric"><span>Auditoria</span><strong>ativa</strong></div>
          <div className="mini-metric"><span>Compliance</span><strong>ok</strong></div>
        </div>
      </div>

      <div className="enterprise-liveops-panel overlay-panel">
        <div className="enterprise-liveops-head">
          <span className="mini-kicker">ENTERPRISE COMMAND CLOUD V35</span>
          <strong>{routeSummary?.enterpriseCommandCloud?.globalStatus || 'online'}</strong>
          <small>{routeSummary?.enterpriseCommandCloud?.globalComparison?.bestUnit || 'Unidade principal'} em destaque corporativo.</small>
        </div>
        <div className="enterprise-liveops-grid">
          <div className="command-center-card">
            <span className="mini-kicker">FILIAIS</span>
            <strong>{routeSummary?.enterpriseCommandCloud?.totalBranches || 0} unidades</strong>
            <small>{routeSummary?.enterpriseCommandCloud?.activeBranches || 0} ativas agora</small>
          </div>
          <div className="command-center-card">
            <span className="mini-kicker">COMPARATIVO</span>
            <strong>{routeSummary?.enterpriseCommandCloud?.globalComparison?.bestScore || '0/100'}</strong>
            <small>Melhor unidade: {routeSummary?.enterpriseCommandCloud?.globalComparison?.bestUnit || '—'}</small>
          </div>
          <div className="command-center-card">
            <span className="mini-kicker">ALERTAS GLOBAIS</span>
            <strong>{routeSummary?.enterpriseCommandCloud?.corporateAlerts?.critical || 0} críticos</strong>
            <small>{routeSummary?.enterpriseCommandCloud?.corporateAlerts?.warning || 0} alertas médios</small>
          </div>
        </div>
        <div className="enterprise-user-strip">
          {(routeSummary?.enterpriseCommandCloud?.branchGoals || []).map((branch) => (
            <span key={branch.id} className="enterprise-user-badge">{branch.name} • {branch.progress}</span>
          ))}
        </div>
      </div>


      <div className="enterprise-liveops-panel overlay-panel">
        <div className="enterprise-liveops-head">
          <span className="mini-kicker">ENTERPRISE CONTROL TOWER V35</span>
          <strong>{routeSummary?.controlTower?.matrixStatus || 'matriz sincronizada'}</strong>
          <small>{routeSummary?.controlTower?.executiveNote || 'Torre executiva ativa.'}</small>
        </div>
        <div className="enterprise-liveops-grid">
          <div className="command-center-card">
            <span className="mini-kicker">SLA EXECUTIVO</span>
            <strong>{routeSummary?.controlTower?.executiveSla || '97%'}</strong>
            <small>Visibilidade global {routeSummary?.controlTower?.globalVisibility || 'ativa'}</small>
          </div>
          <div className="command-center-card">
            <span className="mini-kicker">REGIÕES</span>
            <strong>{routeSummary?.controlTower?.activeRegions || 0} online</strong>
            <small>Unidades críticas {routeSummary?.controlTower?.criticalUnits || 0}</small>
          </div>
          <div className="command-center-card">
            <span className="mini-kicker">FILA EXECUTIVA</span>
            <strong>{routeSummary?.controlTower?.commandQueue?.length || 0} comandos</strong>
            <small>Torre central em sincronização contínua</small>
          </div>
        </div>
        <div className="enterprise-user-strip">
          {(routeSummary?.controlTower?.commandQueue || []).map((item) => (
            <span key={item.id} className="enterprise-user-badge">{item.label} • {item.status}</span>
          ))}
        </div>
      </div>

      <div className="incidents-grid incidents-grid-hotfix">
        {(routeSummary?.incidents || []).map((item) => (
          <div key={item.id} className={`incident-card incident-card-hotfix ${item.severity === 'danger' ? 'incident-danger' : item.severity === 'warning' ? 'incident-warning' : 'incident-info'}`}>
            <div className="incident-top">
              <strong>{item.title}</strong>
              <span>{item.distanceText}</span>
            </div>
            <p>{item.description}</p>
          </div>
        ))}
      </div>

      <div className="route-chat-overlay-wrap">
        <button className="overlay-chat-toggle" onClick={() => setOverlayChatOpen((prev) => !prev)}>
          {overlayChatOpen ? 'Fechar chat' : 'Abrir chat'}
        </button>
        {overlayChatOpen && (
          <div className="route-chat-overlay-card">
            <div className="route-chat-head">
              <strong>Megan no volante</strong>
              <span>{driveMode?.voiceProfile || 'voz premium'}</span>
            </div>
            <div className="route-chat-messages">
              <div className="chat-bubble assistant">Rota ativa para {routeSummary?.destination || 'destino'}.</div>
              <div className="chat-bubble assistant">Instrução atual: {routeSummary?.nextInstruction || 'aguardando'}.</div>
              <div className="chat-bubble assistant">HUD {driveMode?.hudDirectionMode ? 'ligado' : 'desligado'} • GPS contínuo {driveMode?.continuousGps ? 'ligado' : 'desligado'}.</div>
            </div>
          </div>
        )}
      </div>

      <div className="section-card route-steps-card overlay-panel route-steps-overlay">
        <h2>Passos da rota</h2>
        <div className="route-steps-list">
          {(routeSummary?.steps || []).map((step, index) => (
            <div key={`${step}-${index}`} className="route-step-item">
              <span>{index + 1}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>
      </div>



      <div className="traffic-panel overlay-panel">
        <div>
          <span className="mini-kicker">AUTOPILOT ASSIST</span>
          <strong>{routeSummary?.autopilotSummary?.recommendedAction || 'Assistência preditiva ativa.'}</strong>
        </div>
        <div className="traffic-panel-grid">
          <div><b>{routeSummary?.autopilotSummary?.predictedDelayWindow || '—'}</b><span>Janela prevista</span></div>
          <div><b>{routeSummary?.autopilotSummary?.frequentRouteConfidence || '—'}</b><span>Confiança</span></div>
          <div><b>{routeSummary?.autopilotSummary?.fatigueRisk || '—'}</b><span>Fadiga</span></div>
        </div>
        <small>{routeSummary?.autopilotSummary?.departureAdvice || 'Sem recomendação adicional no momento.'}</small>
      </div>


      <div className="enterprise-liveops-panel overlay-panel">
        <div className="enterprise-liveops-head">
          <span className="mini-kicker">ENTERPRISE LIVE OPS V35</span>
          <strong>{routeSummary?.enterpriseLiveOps?.tenant || 'Megan Enterprise'}</strong>
          <small>{routeSummary?.enterpriseLiveOps?.centralOpsNote || 'Operação empresarial ativa.'}</small>
        </div>
        <div className="enterprise-liveops-grid">
          <div className="command-center-card">
            <span className="mini-kicker">MULTI USUÁRIOS</span>
            <strong>{routeSummary?.enterpriseLiveOps?.activeUsers || 0} usuários</strong>
            <small>{routeSummary?.enterpriseLiveOps?.activeManagers || 0} gestores online</small>
          </div>
          <div className="command-center-card">
            <span className="mini-kicker">PERMISSÕES</span>
            <strong>{routeSummary?.enterpriseLiveOps?.permissionsMode || 'granular'}</strong>
            <small>Controle por perfil e operação</small>
          </div>
          <div className="command-center-card">
            <span className="mini-kicker">RELATÓRIOS</span>
            <strong>{routeSummary?.enterpriseLiveOps?.reportAutomation || '0 relatórios'}</strong>
            <small>Geração automática ativa</small>
          </div>
        </div>
        <div className="enterprise-user-strip">
          {(routeSummary?.multiUserAccess || []).map((user) => (
            <span key={user.id} className="enterprise-user-badge">{user.role} • {user.status}</span>
          ))}
        </div>
      </div>

      <div className="command-center-grid overlay-panel command-center-grid-pro">
        <div className="command-center-card">
          <span className="mini-kicker">FLEET AI</span>
          <strong>{routeSummary?.fleetAi?.operationsMode || 'operação estável'}</strong>
          <small>{routeSummary?.fleetAi?.nextRecommendation || 'Sem nova recomendação no momento.'}</small>
        </div>
        <div className="command-center-card">
          <span className="mini-kicker">MULTI VEÍCULOS</span>
          <strong>{routeSummary?.fleetAi?.vehiclesOnline ?? 0} online</strong>
          <small>{routeSummary?.fleetAi?.activeTrips ?? 0} viagens ativas • score {routeSummary?.fleetAi?.fleetScore ?? 0}</small>
        </div>
        <div className="command-center-card">
          <span className="mini-kicker">WEB ADMIN</span>
          <strong>{routeSummary?.fleetAi?.webAdminStatus || 'sincronizando'}</strong>
          <small>{routeSummary?.fleetAi?.routeHistoryToday ?? 0} rotas registradas hoje</small>
        </div>
      </div>

      <div className="hud-card command-center-card">
        <div className="hud-card-header">
          <span>Governança</span>
          <strong>Web Admin V35</strong>
        </div>
        <div className="mini-metrics">
          <div className="mini-metric"><span>Perfis</span><strong>{routeSummary?.enterpriseLiveOps?.activeUsers || 12}</strong></div>
          <div className="mini-metric"><span>Auditoria</span><strong>ativa</strong></div>
          <div className="mini-metric"><span>Compliance</span><strong>ok</strong></div>
        </div>
      </div>

      <div className="enterprise-liveops-panel overlay-panel">
        <div className="enterprise-liveops-head">
          <span className="mini-kicker">ENTERPRISE COMMAND CLOUD V35</span>
          <strong>{routeSummary?.enterpriseCommandCloud?.globalStatus || 'online'}</strong>
          <small>{routeSummary?.enterpriseCommandCloud?.globalComparison?.bestUnit || 'Unidade principal'} em destaque corporativo.</small>
        </div>
        <div className="enterprise-liveops-grid">
          <div className="command-center-card">
            <span className="mini-kicker">FILIAIS</span>
            <strong>{routeSummary?.enterpriseCommandCloud?.totalBranches || 0} unidades</strong>
            <small>{routeSummary?.enterpriseCommandCloud?.activeBranches || 0} ativas agora</small>
          </div>
          <div className="command-center-card">
            <span className="mini-kicker">COMPARATIVO</span>
            <strong>{routeSummary?.enterpriseCommandCloud?.globalComparison?.bestScore || '0/100'}</strong>
            <small>Melhor unidade: {routeSummary?.enterpriseCommandCloud?.globalComparison?.bestUnit || '—'}</small>
          </div>
          <div className="command-center-card">
            <span className="mini-kicker">ALERTAS GLOBAIS</span>
            <strong>{routeSummary?.enterpriseCommandCloud?.corporateAlerts?.critical || 0} críticos</strong>
            <small>{routeSummary?.enterpriseCommandCloud?.corporateAlerts?.warning || 0} alertas médios</small>
          </div>
        </div>
        <div className="enterprise-user-strip">
          {(routeSummary?.enterpriseCommandCloud?.branchGoals || []).map((branch) => (
            <span key={branch.id} className="enterprise-user-badge">{branch.name} • {branch.progress}</span>
          ))}
        </div>
      </div>

      <div className="incidents-grid incidents-grid-hotfix">
        {(routeSummary?.centralizedAlerts || []).map((item) => (
          <div key={item.id} className={`incident-card incident-card-hotfix ${item.level === 'danger' ? 'incident-danger' : item.level === 'warning' ? 'incident-warning' : 'incident-info'}`}>
            <div className="incident-top">
              <strong>{item.title}</strong>
              <span>CENTRAL</span>
            </div>
            <p>{item.body}</p>
          </div>
        ))}
      </div>

      <div className="section-card route-steps-card overlay-panel route-steps-overlay">
        <h2>Histórico de rotas</h2>
        <div className="route-steps-list">
          {(routeSummary?.routeHistory || []).map((item, index) => (
            <div key={item.id || index} className="route-step-item">
              <span>{index + 1}</span>
              <strong>{item.label} • {item.etaText} • {item.score}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="enterprise-liveops-panel overlay-panel">
        <div className="enterprise-liveops-head">
          <span className="mini-kicker">ENTERPRISE LIVE OPS V35</span>
          <strong>{routeSummary?.enterpriseLiveOps?.tenant || 'Megan Enterprise'}</strong>
          <small>{routeSummary?.enterpriseLiveOps?.centralOpsNote || 'Operação empresarial ativa.'}</small>
        </div>
        <div className="enterprise-liveops-grid">
          <div className="command-center-card">
            <span className="mini-kicker">MULTI USUÁRIOS</span>
            <strong>{routeSummary?.enterpriseLiveOps?.activeUsers || 0} usuários</strong>
            <small>{routeSummary?.enterpriseLiveOps?.activeManagers || 0} gestores online</small>
          </div>
          <div className="command-center-card">
            <span className="mini-kicker">PERMISSÕES</span>
            <strong>{routeSummary?.enterpriseLiveOps?.permissionsMode || 'granular'}</strong>
            <small>Controle por perfil e operação</small>
          </div>
          <div className="command-center-card">
            <span className="mini-kicker">RELATÓRIOS</span>
            <strong>{routeSummary?.enterpriseLiveOps?.reportAutomation || '0 relatórios'}</strong>
            <small>Geração automática ativa</small>
          </div>
        </div>
        <div className="enterprise-user-strip">
          {(routeSummary?.multiUserAccess || []).map((user) => (
            <span key={user.id} className="enterprise-user-badge">{user.role} • {user.status}</span>
          ))}
        </div>
      </div>

      <div className="command-center-grid overlay-panel command-center-grid-pro">
        <div className="command-center-card">
          <span className="mini-kicker">FLEET ADMIN</span>
          <strong>{routeSummary?.fleetAdmin?.commandCenter || 'ativo'}</strong>
          <small>{routeSummary?.fleetAdmin?.dailyOperationalSummary || 'Sem resumo operacional no momento.'}</small>
        </div>
        <div className="command-center-card">
          <span className="mini-kicker">VEÍCULOS</span>
          <strong>{routeSummary?.fleetAdmin?.onlineVehicles ?? 0} online • {routeSummary?.fleetAdmin?.offlineVehicles ?? 0} offline</strong>
          <small>Risco alto: {routeSummary?.fleetAdmin?.highRiskVehicles ?? 0} • Prioridade: {(routeSummary?.fleetAdmin?.priorityVehicles || []).join(', ') || 'nenhuma'}</small>
        </div>
        <div className="command-center-card">
          <span className="mini-kicker">RECOMENDAÇÃO</span>
          <strong>Painel gestor ativo</strong>
          <small>{routeSummary?.fleetAdmin?.adminRecommendation || 'Sem recomendação adicional.'}</small>
        </div>
      </div>


      <div className="drive-action-bar drive-action-bar-floating hotfix-actions">
        <button onClick={onSpeakNext}>Falar alerta</button>
        <button onClick={onRefresh}>Atualizar rota</button>
        <button onClick={toggleFullscreen}>{isFullscreen ? 'Sair full screen' : 'Tela cheia'}</button>
        <button onClick={() => setNightMode((prev) => !prev)}>{nightMode ? 'Modo dia' : 'Modo noite'}</button>
        <button onClick={onOpenMaps}>Google Maps</button>
        <button onClick={onOpenWaze}>Waze</button>
      </div>
    </div>
  );
}
