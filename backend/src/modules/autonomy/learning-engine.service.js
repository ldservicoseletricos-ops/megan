function buildLearningSummary(state = {}) {
  const errors = state.errors || [];
  const repairs = state.repairs || [];
  const incidents = state.incidents || [];
  const memories = state.memory || [];

  const recurringErrors = errors.reduce((acc, item) => {
    const key = item.fingerprint || item.module || item.errorType || 'unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const topRecurring = Object.entries(recurringErrors)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([fingerprint, occurrences]) => ({ fingerprint, occurrences }));

  const successfulRepairs = repairs.filter((item) => ['applied', 'ready'].includes(item.status)).length;
  const blockedRepairs = repairs.filter((item) => ['blocked', 'approval_required'].includes(item.status)).length;

  return {
    ok: true,
    totalErrorsObserved: errors.length,
    totalIncidentsObserved: incidents.length,
    totalRepairsObserved: repairs.length,
    memoryEntries: memories.length,
    successfulRepairs,
    blockedRepairs,
    topRecurring,
    learningSignal: topRecurring.length > 0
      ? 'A Megan já reconhece padrões recorrentes e consegue priorizar o que mais quebra.'
      : 'Ainda há poucos eventos para aprendizado mais profundo, mas a memória operacional está ativa.',
    generatedAt: new Date().toISOString(),
  };
}

module.exports = { buildLearningSummary };
