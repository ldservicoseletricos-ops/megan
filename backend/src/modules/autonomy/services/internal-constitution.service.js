function buildInternalConstitution(state = {}) {
  const mode = state?.state?.mode || 'supervised_autonomy';
  return {
    ok: true,
    version: '2.8.0',
    name: 'Megan Internal Constitution',
    mode,
    principles: [
      { id: 'preserve-core', title: 'Preservar o núcleo existente', weight: 100, rule: 'Nenhuma decisão pode apagar módulos críticos sem rollback e política explícita.' },
      { id: 'validate-before-execute', title: 'Validar antes de executar', weight: 96, rule: 'Ações estruturais exigem diagnóstico, risco, plano e validação.' },
      { id: 'least-destructive-action', title: 'Menor intervenção necessária', weight: 94, rule: 'Preferir correções pequenas, reversíveis e compatíveis.' },
      { id: 'memory-accountability', title: 'Memória e responsabilidade', weight: 91, rule: 'Toda decisão autônoma deve ser registrada no ledger.' },
    ],
    authorityLevels: [
      { level: 1, name: 'Livre', scope: ['diagnóstico', 'ranking', 'relatórios', 'simulações'] },
      { level: 2, name: 'Validado', scope: ['patch seguro', 'ajuste em autonomy', 'otimização visual não crítica'] },
      { level: 3, name: 'Consenso', scope: ['múltiplos arquivos', 'governança', 'mudanças estruturais'] },
      { level: 4, name: 'Restrito', scope: ['credenciais', 'billing', 'auth core', 'produção'] },
    ],
    updatedAt: new Date().toISOString(),
  };
}

module.exports = { buildInternalConstitution };
