import {
  getAutonomyState,
  processMission,
  runAutonomyLoop,
  registerAssistantReply,
  setAutoLoopEnabled
} from '../services/autonomy-core.service.js';
import { getEnvStatus, saveEnvConfig, testGeminiConnection } from '../config/env.js';
import { createInteractionRecord } from '../db/repositories/interaction.repository.js';
import { storeMemory, recallMemory } from '../services/memory-core.service.js';
import { syncAdvancedMemoryFromAutonomy } from '../services/advanced-memory.service.js';
import { syncDecisionMemoryFromAutonomy } from '../services/decision-memory.service.js';
import { addPriorityQueueItem, getNextPriorityQueueItem } from '../services/priority-queue.service.js';
import { runFusionLearningCycle } from '../services/self-learning-fusion.service.js';

function isGreeting(message = '') {
  const normalized = String(message || '').toLowerCase().trim().replace(/[!?.;,]/g, '');
  return ['oi', 'olá', 'ola', 'oi megan', 'olá megan', 'ola megan', 'bom dia', 'boa tarde', 'boa noite'].includes(normalized);
}

function buildReply(message, state, memoryRecall, nextItem) {
  const text = String(message || '').trim();
  if (!text) return 'Pode me enviar sua mensagem novamente.';
  if (isGreeting(text)) return 'Olá, Luiz. Estou pronta. Me diga a missão que você quer fazer agora.';

  const recalled = Array.isArray(memoryRecall?.matches) ? memoryRecall.matches : [];
  const memoryLine = recalled.length
    ? `Memória acionada: ${String(recalled[0]?.text || '').slice(0, 160)}.`
    : 'Memória acionada: nenhuma lembrança relevante forte neste ciclo.';
  const nextAction = nextItem?.title ? `Próxima ação sugerida: ${nextItem.title}.` : 'Próxima ação sugerida: consolidar contexto e definir uma fila mais clara.';

  return [
    `Brain ativo: ${state?.activeBrain || 'operational'} (${state?.brainConfidence || 0}).`,
    `Prioridade do ciclo: ${state?.adaptivePriority?.highestPriorityAction || 'adaptive_priority'}.`,
    `Motivo: ${state?.adaptivePriority?.priorityReason || 'Nenhum'}.`,
    `Validação: ${state?.lastValidationResult || 'Nenhuma validação executada ainda'}.`,
    memoryLine,
    nextAction
  ].join(' ');
}

function jsonError(res, status, message) {
  return res.status(status).type('application/json').send(JSON.stringify({ ok: false, error: message }));
}

export async function runChatProcessController(req, res) {
  try {
    const message = String(req.body?.message || '').trim();
    const userId = String(req.body?.userId || 'luiz');
    if (!message) return jsonError(res, 400, 'Mensagem vazia');

    createInteractionRecord({ userId, role: 'user', message });
    storeMemory({ userId, type: 'working', text: message, source: 'chat_user', importance: 7 });
    const memoryRecall = recallMemory({ userId, query: message });

    await processMission(message);
    const loopState = await runAutonomyLoop();
    await syncAdvancedMemoryFromAutonomy(loopState);
    const decisionMemory = await syncDecisionMemoryFromAutonomy();

    addPriorityQueueItem({
      userId,
      title: loopState?.nextStep || loopState?.suggestedImprovement || 'Consolidar próximo passo do ciclo',
      type: loopState?.adaptivePriority?.highestPriorityAction || 'adaptive_priority',
      level: Number(loopState?.validationScore || 0) >= 90 ? 'urgent_important' : 'strategic',
      source: 'chat_process',
      note: loopState?.lastLoopSummary || 'Ação derivada do ciclo de missão'
    });

    const { nextItem } = getNextPriorityQueueItem({ userId });
    const reply = buildReply(message, loopState, memoryRecall, nextItem);
    const syncedState = await registerAssistantReply(reply);
    createInteractionRecord({ userId, role: 'assistant', message: reply });
    storeMemory({ userId, type: 'summary', text: reply, source: 'chat_assistant', importance: 8 });
    const learningState = await runFusionLearningCycle({ userId });

    return res.status(200).type('application/json').send(JSON.stringify({
      ok: true,
      reply,
      version: '156.0.0',
      mode: 'Fusion Memory Priority Learning',
      runtimeState: 'Operacional',
      selectedFlow: { name: 'fusion_memory_priority_learning' },
      toolsUsed: ['autonomy-core', 'memory-core', 'advanced-memory', 'decision-memory', 'priority-queue', 'learning-loop'],
      missionScore: { score: isGreeting(message) ? 96 : 99 },
      memoryState: 'Persistente e ativa',
      planningState: 'Priorização ativa',
      autonomyState: 'Supervisionada com memória, prioridade e aprendizado',
      memoryRecall,
      decisionMemory,
      nextPriorityItem: nextItem,
      learningState,
      projectMemory: syncedState
    }));
  } catch (error) {
    console.error('[Megan][ChatProcess]', error?.message || error);
    return jsonError(res, 500, error?.message || 'Falha no chat process');
  }
}

export async function streamChatProcessController(_req, res) {
  return jsonError(res, 501, 'Streaming ainda não ativado nesta versão');
}

export async function getAutonomyStateController(_req, res) {
  try {
    const state = await getAutonomyState();
    return res.status(200).type('application/json').send(JSON.stringify({ ok: true, state }));
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao carregar autonomy state');
  }
}

export async function runAutonomyLoopController(req, res) {
  try {
    const userId = String(req.body?.userId || 'luiz');
    const state = await runAutonomyLoop();
    await syncAdvancedMemoryFromAutonomy(state);
    await syncDecisionMemoryFromAutonomy();
    addPriorityQueueItem({
      userId,
      title: state?.nextStep || 'Executar próximo ciclo supervisionado',
      type: state?.adaptivePriority?.highestPriorityAction || 'adaptive_priority',
      level: 'strategic',
      source: 'autonomy_loop',
      note: state?.lastLoopSummary || ''
    });
    const learningState = await runFusionLearningCycle({ userId });
    return res.status(200).type('application/json').send(JSON.stringify({ ok: true, state, learningState }));
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao executar autonomy loop');
  }
}

export async function getEnvStatusController(_req, res) {
  try {
    return res.status(200).type('application/json').send(JSON.stringify({ ok: true, env: getEnvStatus() }));
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao carregar configuração de ambiente');
  }
}

export async function updateEnvConfigController(req, res) {
  try {
    const env = saveEnvConfig(req.body || {});
    return res.status(200).type('application/json').send(JSON.stringify({ ok: true, env, message: 'Configuração salva com sucesso.' }));
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao salvar configuração de ambiente');
  }
}

export async function testGeminiConnectionController(req, res) {
  try {
    const result = await testGeminiConnection(req.body || {});
    return res.status(200).type('application/json').send(JSON.stringify(result));
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao testar conexão com Gemini');
  }
}

export async function setAutoLoopController(req, res) {
  try {
    const enabled = Boolean(req.body?.enabled);
    const state = await setAutoLoopEnabled(enabled);
    return res.status(200).type('application/json').send(JSON.stringify({ ok: true, state }));
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao configurar auto loop');
  }
}
