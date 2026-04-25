function buildModuleSpecializations() {
  return [
    { id: 'autonomy', label: 'Autonomy Core', ownerBrain: 'operational', specialty: 'ciclo autônomo, validação e coordenação', maturity: 'advanced' },
    { id: 'planner', label: 'Strategic Planner', ownerBrain: 'strategic', specialty: 'metas compostas, roadmap e impacto futuro', maturity: 'advanced' },
    { id: 'integration', label: 'Integration Layer', ownerBrain: 'technical', specialty: 'backend/frontend, APIs e patch multiarquivo', maturity: 'advanced' },
    { id: 'safety', label: 'Safety Policy', ownerBrain: 'guardian', specialty: 'aprovação, bloqueio e rollback', maturity: 'advanced' },
    { id: 'crm', label: 'CRM', ownerBrain: 'operational', specialty: 'operações comerciais e execução de fluxo', maturity: 'growing' },
    { id: 'navigation', label: 'Navigation', ownerBrain: 'technical', specialty: 'rotas, integração visual e dados de navegação', maturity: 'growing' },
    { id: 'health', label: 'Health', ownerBrain: 'guardian', specialty: 'segurança, sensibilidade e estabilidade operacional', maturity: 'growing' },
  ];
}

module.exports = { buildModuleSpecializations };
