function executeDecision({ decision, risk, mode = 'supervised_autonomy' } = {}) {
  const status = risk.level === 'critical'
    ? 'blocked'
    : risk.level === 'high' && mode !== 'validated_execution'
      ? 'validation_required'
      : 'planned';

  return {
    id: `exec-${Date.now()}`,
    status,
    actionType: decision?.actionType || 'analyze_system',
    summary: status === 'blocked'
      ? 'Execução bloqueada por risco crítico.'
      : status === 'validation_required'
        ? 'Execução preparada, aguardando validação reforçada.'
        : 'Execução planejada com segurança para o próximo ciclo.',
    steps: [
      'Ler snapshot atual do sistema',
      'Comparar prioridade com histórico recente',
      'Gerar plano de ação mínima necessária',
      'Registrar saída para validação e memória',
    ],
    createdAt: new Date().toISOString(),
  };
}

module.exports = {
  executeDecision,
};
