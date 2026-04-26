export function getSafeAutoRun() {
  return {
    safeMode: true,
    rollback: 'logical',
    executed: [
      { id: 'run-001', title: 'Verificação de readiness', status: 'ok' },
      { id: 'run-002', title: 'Classificação de correções simples', status: 'ok' }
    ],
    approvableQueue: [
      { id: 'approve-001', title: 'Aplicar correções não críticas', status: 'pending_approval' }
    ],
    result: 'modo seguro ativo',
  };
}
