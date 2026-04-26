import { runCoreBrain } from './core-brain.service.js';

export function runUnifiedBrain({ intent = null, memory = {}, autonomy = {}, execution = {}, evolution = {} } = {}) {
  const core = runCoreBrain({ intent, memory, autonomy, execution });
  return {
    ok: true,
    mode: 'unified-brain-v1',
    core,
    evolution,
    summary: {
      intentKind: intent?.kind || 'general',
      hasExecution: Boolean(execution?.ok),
      hasMemory: Boolean(memory && Object.keys(memory).length),
      hasAutonomy: Boolean(autonomy && Object.keys(autonomy).length),
    },
    createdAt: new Date().toISOString(),
  };
}
