import { pushDbItem } from "../lib/store.js";

function normalizeText(value) {
  return String(value || "").trim();
}

export function runSelfAnalysis({ text, reply, intent, plan, execution }) {
  const userText = normalizeText(text);
  const assistantText = normalizeText(reply);
  const replyLength = assistantText.length;

  const frictionSignals = [];
  if (!assistantText) frictionSignals.push("empty_reply");
  if (replyLength > 140) frictionSignals.push("long_reply");
  if (plan?.actions?.some((item) => /needs_/.test(item?.status || ""))) {
    frictionSignals.push("blocked_action");
  }
  if (intent === "navigation" && !execution?.effects?.hasRoute) {
    frictionSignals.push("navigation_unresolved");
  }

  const result = {
    qualityScore: Math.max(0.2, 1 - frictionSignals.length * 0.18),
    frictionSignals,
    recommendation:
      frictionSignals.includes("long_reply")
        ? "Encurtar resposta nas próximas interações semelhantes."
        : frictionSignals.includes("navigation_unresolved")
        ? "Priorizar resolução de destino e localização antes de explicar demais."
        : "Manter comportamento atual.",
    userTextPreview: userText.slice(0, 120),
    replyPreview: assistantText.slice(0, 120),
  };

  const entry = pushDbItem("selfAnalysisRuns", {
    intent: intent || "general",
    result,
  });

  return {
    ...result,
    entry,
  };
}
