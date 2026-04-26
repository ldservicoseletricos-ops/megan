const store = require('./continuous-learning-store.service');

function now() { return new Date().toISOString(); }
function makeId(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`; }

function calculateLearningScore(state) {
  const patterns = state.patterns || [];
  const predictions = state.predictions || [];
  const patternScore = patterns.reduce((sum, item) => sum + Number(item.confidence || 0), 0) / Math.max(patterns.length, 1);
  const predictionScore = predictions.reduce((sum, item) => sum + Number(item.confidence || 0), 0) / Math.max(predictions.length, 1);
  return Math.round((patternScore * 0.58) + (predictionScore * 0.42));
}

function getDashboard() {
  const state = store.read();
  return {
    ok: true,
    title: state.title,
    version: state.version,
    status: state.status,
    focus: state.focus,
    learningScore: calculateLearningScore(state),
    metrics: {
      events: (state.events || []).length,
      patterns: (state.patterns || []).length,
      predictions: (state.predictions || []).length,
      optimizations: (state.optimizations || []).length,
      preferences: Object.keys(state.preferences || {}).length,
    },
    patterns: state.patterns || [],
    preferences: state.preferences || {},
    predictions: state.predictions || [],
    optimizations: state.optimizations || [],
    responseImprovements: state.responseImprovements || [],
    lastLearningCycle: state.lastLearningCycle,
  };
}

function getPatterns() { return { ok: true, patterns: store.read().patterns || [] }; }
function getPredictions() { return { ok: true, predictions: store.read().predictions || [] }; }
function getPreferences() { return { ok: true, preferences: store.read().preferences || {} }; }

function recordUse(payload) {
  const state = store.read();
  const text = String(payload.text || payload.message || 'Uso registrado para aprendizado contínuo.');
  const type = String(payload.type || 'uso');
  const weight = Math.max(1, Math.min(100, Number(payload.weight || 80)));
  const event = { id: makeId('evt'), type, text, weight, createdAt: now() };
  state.events = [event, ...(state.events || [])].slice(0, 200);
  if (weight >= 75) {
    const exists = (state.patterns || []).some((pattern) => pattern.evidence === text);
    if (!exists) {
      state.patterns = [{ id: makeId('pat'), label: type, confidence: Math.min(99, weight), evidence: text }, ...(state.patterns || [])].slice(0, 30);
    }
  }
  store.save(state);
  return { ok: true, event, dashboard: getDashboard() };
}

function optimizeRoutine(payload) {
  const state = store.read();
  const area = String(payload.area || 'rotina diária');
  const goal = String(payload.goal || 'reduzir atrito e antecipar necessidades');
  const optimization = {
    id: makeId('opt'),
    area,
    suggestion: `Otimizar ${area}: ${goal}. Prioridade definida pelos padrões aprendidos.`,
    impact: 'execução mais rápida, menos repetição e melhor continuidade',
    createdAt: now(),
  };
  state.optimizations = [optimization, ...(state.optimizations || [])].slice(0, 40);
  store.save(state);
  return { ok: true, optimization, optimizations: state.optimizations };
}

function improveResponse(payload) {
  const state = store.read();
  const rule = String(payload.rule || 'Responder com mais continuidade, clareza e ação prática.');
  const improvement = { id: makeId('resp'), rule, active: true, createdAt: now() };
  state.responseImprovements = [improvement, ...(state.responseImprovements || [])].slice(0, 40);
  store.save(state);
  return { ok: true, improvement, responseImprovements: state.responseImprovements };
}

function runLearningCycle(payload) {
  const state = store.read();
  const cycle = {
    id: makeId('cycle'),
    createdAt: now(),
    input: payload.context || 'ciclo manual 4.5',
    detectedPatterns: (state.patterns || []).slice(0, 5),
    predictedNeeds: (state.predictions || []).slice(0, 5),
    recommendedActions: [
      'usar preferências aprendidas antes de montar respostas',
      'antecipar necessidade de arquivo ZIP validado quando o pedido for gerar fase',
      'manter histórico de decisões para melhorar próximas entregas',
      'otimizar rotinas repetidas do projeto Megan OS'
    ],
    learningScore: calculateLearningScore(state),
  };
  state.lastLearningCycle = cycle;
  store.save(state);
  return { ok: true, cycle, dashboard: getDashboard() };
}

module.exports = { getDashboard, getPatterns, getPredictions, getPreferences, recordUse, optimizeRoutine, improveResponse, runLearningCycle };
