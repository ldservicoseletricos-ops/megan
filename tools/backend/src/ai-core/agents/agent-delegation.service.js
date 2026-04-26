import { AGENT_CATALOG } from "./agent-catalog.js";

function baseSequenceForCategory(category) {
  if (category === "technical_fix") {
    return ["research_agent", "technical_agent", "operator_agent", "supervisor_agent"];
  }

  if (category === "self_evolution") {
    return ["research_agent", "operator_agent", "technical_agent", "supervisor_agent"];
  }

  if (category === "strategic_planning") {
    return ["research_agent", "writer_agent", "operator_agent", "supervisor_agent"];
  }

  return ["research_agent", "writer_agent", "supervisor_agent"];
}

export function delegateAgents({ message = "", classification, adaptiveContext, brainConsensus, swarmVoting }) {
  const category = classification?.category || "general_chat";
  const sequence = baseSequenceForCategory(category);
  const normalized = String(message).toLowerCase();

  const hints = [];
  if (normalized.includes("arquivo") || normalized.includes("código") || normalized.includes("codigo")) {
    hints.push("focus_on_full_file_delivery");
  }
  if (normalized.includes("estratég") || normalized.includes("estrateg")) {
    hints.push("strategic_depth");
  }

  const delegatedAgents = sequence
    .map((agentId, index) => {
      const catalog = AGENT_CATALOG.find((item) => item.agentId === agentId);
      return {
        order: index + 1,
        agentId,
        label: catalog?.label || agentId,
        specialty: catalog?.specialty || "apoio especializado",
        role:
          index === 0
            ? "analisar"
            : index === sequence.length - 1
            ? "supervisionar"
            : "executar",
        assignedBy: brainConsensus?.leadBrain || swarmVoting?.winner?.brainId || "general_coordinator"
      };
    });

  return {
    mode: delegatedAgents.length > 3 ? "autonomous_pipeline" : "compact_pipeline",
    category,
    hints,
    delegatedAgents,
    leaderAgentId: delegatedAgents[0]?.agentId || "supervisor_agent",
    finalSupervisorAgentId: delegatedAgents[delegatedAgents.length - 1]?.agentId || "supervisor_agent",
    contextSignals: {
      selectedMode: adaptiveContext?.adaptiveProfile?.selectedMode || "adaptive_balanced",
      leadBrain: brainConsensus?.leadBrain || "general_coordinator"
    }
  };
}
