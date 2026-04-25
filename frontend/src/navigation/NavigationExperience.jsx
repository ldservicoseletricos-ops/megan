import React, { useEffect, useMemo, useState } from 'react';
import './mobile.styles.css';
import BottomNav from './components/BottomNav';
import HomePage from './pages/HomePage';
import RoutePage from './pages/RoutePage';
import AlertsPage from './pages/AlertsPage';
import ProfilePage from './pages/ProfilePage';
import { useLiveGps } from './hooks/useLiveGps';
import { useSpeech } from './hooks/useSpeech';
import { getJson, postJson } from './lib/api';

function buildVisualAlerts(route, speedText) {
  const speedValue = Number.parseInt(String(speedText || '').replace(/\D+/g, ''), 10) || 0;
  const sourceAlerts = Array.isArray(route?.visualAlerts) ? route.visualAlerts : [];
  const dynamicAlerts = [];
  if (speedValue >= 80) {
    dynamicAlerts.push({ id: 'speed-high', level: 'danger', title: 'Reduza agora', body: 'Velocidade alta para o trecho atual. Mantenha distância e atenção máxima.', pulse: true });
  }
  if (route?.betterRouteAvailable) {
    dynamicAlerts.push({ id: 'better-route', level: 'info', title: 'Rota melhor encontrada', body: route?.betterRouteText || 'Há uma rota alternativa com ganho de tempo.', pulse: false });
  }
  if (route?.gpsQuality === 'weak') {
    dynamicAlerts.push({ id: 'gps-weak', level: 'warning', title: 'Sinal de GPS oscilando', body: 'Aproxime-se de área aberta para melhorar a precisão.', pulse: false });
  }
  return [...sourceAlerts, ...dynamicAlerts].slice(0, 5);
}

function formatSpeed(position, fallback = '—') {
  const metersPerSecond = position?.coords?.speed;
  if (typeof metersPerSecond === 'number' && metersPerSecond >= 0) return `${Math.round(metersPerSecond * 3.6)} km/h`;
  return fallback;
}

export default function NavigationExperience() {
  const [tab, setTab] = useState('home');
  const [destination, setDestination] = useState('Aeroporto de Congonhas, São Paulo');
  const [routeSummary, setRouteSummary] = useState({
    destination: 'Aeroporto de Congonhas, São Paulo', distanceText: '4.4 km', etaText: '12 min',
    nextInstruction: 'Siga em frente por 400 metros e vire à direita.', currentRoad: 'Av. Rubem Berta',
    laneHint: 'Mantenha-se nas 2 faixas da direita.', arrivalText: 'Chegada prevista às 12:14', speedText: '0 km/h',
    alertLevel: 'warning', betterRouteAvailable: true, betterRouteText: 'Rota alternativa pode economizar 3 min.', gpsQuality: 'good',
    progressPercent: 52, progressLabel: '52% da rota concluída', dangerScore: 76, dangerLabel: 'atenção elevada',
    visualAlerts: [
      { id: 'radar-default', level: 'danger', title: 'Radar à frente', body: 'Reduza gradualmente. Fiscalização eletrônica a 350 metros.', pulse: true },
      { id: 'traffic-default', level: 'warning', title: 'Trânsito pesado', body: 'Fluxo lento mais adiante. Prepare-se para reduzir.', pulse: true },
    ],
    traffic: { level: 'heavy', delayText: '+7 min', averageSpeedText: '28 km/h', summary: 'Trânsito pesado no corredor principal com retenção forte.' },
    incidents: [
      { id: 'radar-1', type: 'radar', title: 'Radar à frente', distanceText: '350 m', severity: 'warning', description: 'Controle de velocidade no trecho urbano.' },
      { id: 'accident-1', type: 'accident', title: 'Acidente reportado', distanceText: '1,2 km', severity: 'danger', description: 'Faixa esquerda parcialmente bloqueada.' },
    ],
    alternatives: [
      { id: 'alt-1', label: 'Rota principal', etaText: '14 min', gainText: 'rota estável' },
      { id: 'alt-2', label: 'Alternativa via corredor', etaText: '11 min', gainText: 'economia de 3 min' },
    ],
    guidance: { laneRecommendation: 'Use a faixa central-direita para manter a melhor linha da rota.', nextManeuverDistance: '350 m', nextManeuverType: 'right', roadFocus: 'Av. dos Bandeirantes' },
    laneGuidance: { lanes: ['left', 'center', 'center-right', 'right'], recommendedIndex: 2, note: 'Prepare-se para posicionar o veículo na faixa recomendada.' },
    hudMetrics: [
      { id: 'speed-limit', label: 'Limite', value: '50 km/h' },
      { id: 'hazard', label: 'Perigo', value: '76%' },
      { id: 'lane', label: 'Faixa', value: 'C-DIR' },
      { id: 'eta-window', label: 'Janela', value: '12:18' },
    ],
    roadShield: 'SP-046', routeModeLabel: 'MEGAN MASTER FUSION', laneFocusText: 'Faixa ideal: central-direita',
    steps: ['Siga em frente por 400 metros.', 'Mantenha-se nas 2 faixas da direita.', 'Vire à direita na Av. dos Bandeirantes.', 'Continue por 2,4 km até o destino.'],
  });
  const [driveMode, setDriveMode] = useState({
    overlayEnabled: true,
    voiceProfile: 'premium_ptbr_feminina_contextual_v36',
    mapProvider: 'openstreetmap_live_hud',
    alertsMode: 'war_room_live_ops_v36',
    continuousGps: true,
    hudDirectionMode: true,
  });
  const favorites = ['Casa', 'Trabalho', 'Hospital', 'Mercado'];
  const recents = ['Shopping Morumbi', 'Aeroporto de Congonhas', 'Avenida Paulista'];
  const { position, error, track, accuracyLabel } = useLiveGps({ storeTrack: true });
  const speech = useSpeech({ preferredLang: 'pt-BR', preferredVoiceNameIncludes: ['google', 'microsoft', 'maria', 'portuguese', 'brazil'] });

  useEffect(() => {
    getJson('/api/mobile-navigation/drive-mode').then((result) => {
      if (result?.driveMode) setDriveMode((prev) => ({ ...prev, ...result.driveMode }));
    }).catch(() => {});
  }, []);

  const gpsSpeedText = useMemo(() => formatSpeed(position), [position]);
  const mergedRoute = useMemo(() => {
    const speedText = gpsSpeedText === '—' ? routeSummary.speedText : gpsSpeedText;
    return {
      ...routeSummary,
      speedText,
      track,
      accuracyLabel,
      gpsQuality: accuracyLabel === 'fraco' ? 'weak' : 'good',
      visualAlerts: buildVisualAlerts({ ...routeSummary, gpsQuality: accuracyLabel === 'fraco' ? 'weak' : 'good' }, speedText),
    };
  }, [gpsSpeedText, routeSummary, track, accuracyLabel]);

  useEffect(() => {
    if (tab !== 'route') return;
    const nextInstruction = mergedRoute?.nextInstruction;
    if (nextInstruction) speech.speak(nextInstruction, { rate: 1.01, pitch: 0.95, volume: 1 });
  }, [tab, mergedRoute?.nextInstruction]);

  async function startRoute() {
    try {
      const result = await postJson('/api/mobile-navigation/route', {
        destination,
        currentLat: position?.coords?.latitude,
        currentLng: position?.coords?.longitude,
        speedKmh: gpsSpeedText === '—' ? 0 : Number.parseInt(gpsSpeedText, 10) || 0,
      });
      setRouteSummary(result.route || routeSummary);
      setDriveMode((prev) => ({ ...prev, ...(result.driveMode || {}) }));
      setTab('route');
    } catch {
      setTab('route');
    }
  }

  async function refreshDriveSnapshot() {
    try {
      const result = await postJson('/api/mobile-navigation/live-snapshot', {
        destination,
        currentLat: position?.coords?.latitude,
        currentLng: position?.coords?.longitude,
        speedKmh: gpsSpeedText === '—' ? 0 : Number.parseInt(gpsSpeedText, 10) || 0,
      });
      if (result?.route) setRouteSummary((prev) => ({ ...prev, ...result.route }));
    } catch {}
  }

  useEffect(() => {
    if (tab !== 'route' || !driveMode.continuousGps) return undefined;
    const timer = window.setInterval(() => {
      refreshDriveSnapshot();
    }, 7000);
    return () => window.clearInterval(timer);
  }, [tab, driveMode.continuousGps, destination, position?.coords?.latitude, position?.coords?.longitude, gpsSpeedText]);

  function openMaps() {
    const q = encodeURIComponent(destination);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${q}`, '_blank');
  }

  function openWaze() {
    const q = encodeURIComponent(destination);
    window.open(`https://waze.com/ul?q=${q}&navigate=yes`, '_blank');
  }

  const pages = {
    home: <HomePage destination={destination} setDestination={setDestination} onVoice={() => speech.listen(setDestination)} onStart={startRoute} favorites={favorites} recents={recents} />,
    route: <RoutePage position={position} routeSummary={mergedRoute} driveMode={driveMode} onSpeakNext={() => speech.speak(mergedRoute.voicePrompts?.[0] || mergedRoute.nextInstruction, { rate: 1.01, pitch: 0.92, volume: 1 })} onOpenMaps={openMaps} onOpenWaze={openWaze} onRefresh={refreshDriveSnapshot} />,
    alerts: <AlertsPage alerts={mergedRoute.visualAlerts.map((item) => `${item.title} — ${item.body}`)} />,
    profile: <ProfilePage />,
  };

  const shellClassName = tab === 'route' ? 'mobile-shell route-mode-shell overlay-shell' : 'mobile-shell';

  return (
    <section className="panel-card navigation-fusion-card">
      <div className="navigation-fusion-header">
        <div>
          <span className="fusion-kicker">MEGAN MASTER FUSION 1.0</span>
          <h2>Navegação Premium integrada</h2>
          <p>O módulo mobile agora roda dentro da Megan principal, sem abrir em outro projeto.</p>
        </div>
      </div>
      <main className={shellClassName}>
        {tab !== 'route' && (
          <header className="topbar">
            <div>
              <strong>Megan Navegação Integrada</strong>
              <span>{error ? `GPS: ${error}` : `GPS contínuo • precisão ${accuracyLabel}`}</span>
            </div>
            <button className="mic-btn" onClick={() => speech.listen(setDestination)}>🎤</button>
          </header>
        )}
        <section className="content-area">{pages[tab]}</section>
        {tab !== 'route' && <BottomNav current={tab} onChange={setTab} />}
      </main>
    </section>
  );
}
