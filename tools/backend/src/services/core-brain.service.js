export function runCoreBrain({ intent = null, memory = {}, autonomy = {}, execution = {} } = {}) {
  const confidence = [intent?.kind, memory?.updatedAt, autonomy?.mode, execution?.ok]
    .filter(Boolean).length * 0.2;

  return {
    ok: true,
    mode: 'core-brain-v1',
    confidence: Math.min(1, confidence),
    intentKind: intent?.kind || 'general',
    activeObjective: memory?.goals?.current || memory?.objective?.current || null,
    guidance: execution?.ok
      ? 'Executar e consolidar memória.'
      : 'Responder, observar contexto e aguardar próximo passo.',
    createdAt: new Date().toISOString(),
  };
}
