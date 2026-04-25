import { BRAIN_CATALOG } from "./brain-catalog.js";

function includesAny(text, terms = []) {
  return terms.some((term) => text.includes(term));
}

export function routeSpecialistBrains({ message = "", classification = {}, adaptiveContext = {} }) {
  const text = String(message).toLowerCase();
  const category = classification.category || "general_chat";
  const adaptiveMode = adaptiveContext?.adaptiveProfile?.selectedMode || "adaptive_balanced";

  const candidates = BRAIN_CATALOG.filter((brain) => brain.categories.includes(category));
  const selected = new Map();

  selected.set("general_coordinator", {
    brainId: "general_coordinator",
    weight: 1,
    reason: "coordenação central"
  });

  if (category === "technical_fix" || adaptiveMode === "technical_operator" || includesAny(text, ["erro", "backend", "frontend", "import", "module", "api"])) {
    selected.set("technical_operator", {
      brainId: "technical_operator",
      weight: 0.96,
      reason: "pedido técnico ou correção"
    });
    selected.set("quality_guardian", {
      brainId: "quality_guardian",
      weight: 0.92,
      reason: "proteger estabilidade da correção"
    });
    selected.set("operations_orchestrator", {
      brainId: "operations_orchestrator",
      weight: 0.82,
      reason: "organizar execução em etapas"
    });
  }

  if (category === "self_evolution" || includesAny(text, ["fase", "evolu", "estrateg", "arquitetura", "multi", "cerebro", "cérebro"])) {
    selected.set("strategic_architect", {
      brainId: "strategic_architect",
      weight: 0.95,
      reason: "decisão estratégica e evolução"
    });
    selected.set("quality_guardian", {
      brainId: "quality_guardian",
      weight: 0.78,
      reason: "validar segurança da evolução"
    });
  }

  if (includesAny(text, ["livro", "conteudo", "historia", "história", "capa", "kdp"])) {
    selected.set("creative_editor", {
      brainId: "creative_editor",
      weight: 0.84,
      reason: "pedido criativo/editorial"
    });
  }

  if (includesAny(text, ["passo a passo", "instalar", "configurar", "subir", "deploy", "fluxo"])) {
    selected.set("operations_orchestrator", {
      brainId: "operations_orchestrator",
      weight: 0.86,
      reason: "execução operacional"
    });
  }

  const resolved = Array.from(selected.values())
    .map((item) => ({
      ...item,
      label: candidates.find((brain) => brain.brainId === item.brainId)?.label || BRAIN_CATALOG.find((brain) => brain.brainId === item.brainId)?.label || item.brainId,
      specialty: BRAIN_CATALOG.find((brain) => brain.brainId === item.brainId)?.specialty || "especialidade geral"
    }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 4);

  return {
    selectedBrains: resolved,
    leadBrain: resolved[0]?.brainId || "general_coordinator",
    routingMode: resolved.length > 1 ? "multi_brain" : "single_brain"
  };
}
