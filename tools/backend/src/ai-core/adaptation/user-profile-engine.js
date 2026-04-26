export function buildUserProfile({ userId, interactions = [], memory = {} }) {
  const userInteractions = interactions.filter((item) => item.userId === userId);
  const totalInteractions = userInteractions.length;

  const frequentTopics = {
    technical: 0,
    business: 0,
    books: 0,
    automation: 0,
    strategy: 0
  };

  const recurringObjectives = new Set();

  for (const item of userInteractions) {
    const text = String(item.message || "").toLowerCase();

    if (text.includes("erro") || text.includes("codigo") || text.includes("código") || text.includes("backend") || text.includes("frontend")) frequentTopics.technical += 1;
    if (text.includes("negocio") || text.includes("negócio") || text.includes("vender") || text.includes("cliente")) frequentTopics.business += 1;
    if (text.includes("livro") || text.includes("kdp") || text.includes("amazon")) frequentTopics.books += 1;
    if (text.includes("automacao") || text.includes("automação") || text.includes("make") || text.includes("fluxo")) frequentTopics.automation += 1;
    if (text.includes("estrateg") || text.includes("planejamento") || text.includes("fase")) frequentTopics.strategy += 1;

    if (text.includes("pronto para colar")) recurringObjectives.add("entregas prontas para colar");
    if (text.includes("sem quebrar")) recurringObjectives.add("preservar estabilidade");
    if (text.includes("completo")) recurringObjectives.add("arquivos completos");
    if (text.includes("passo a passo")) recurringObjectives.add("instruções passo a passo");
  }

  const explicitPreferences = [
    ...(memory.explicitPreferences || []),
    ...(memory.profileHints || [])
  ];

  const topTopic = Object.entries(frequentTopics).sort((a, b) => b[1] - a[1])[0]?.[0] || "general";

  const preferredMode =
    topTopic === "technical" ? "technical_operator" :
    topTopic === "strategy" ? "strategic_architect" :
    topTopic === "automation" ? "operations_orchestrator" :
    topTopic === "books" ? "creative_editor" :
    "adaptive_balanced";

  const detailLevel =
    explicitPreferences.some((item) => String(item).toLowerCase().includes("completo")) || totalInteractions >= 10
      ? "deep"
      : totalInteractions >= 3
      ? "balanced"
      : "simple";

  const confidence = Number(Math.min(0.96, 0.35 + totalInteractions * 0.03).toFixed(3));

  return {
    userId,
    totalInteractions,
    memorySize: explicitPreferences.length,
    preferredMode,
    detailLevel,
    confidence,
    frequentTopics,
    recurringObjectives: Array.from(recurringObjectives),
    explicitPreferences,
    updatedAt: new Date().toISOString()
  };
}
