export function detectPatterns({ interactions, message }) {
  const normalized = String(message).toLowerCase();

  const similar = interactions.filter((item) =>
    String(item.message || "").toLowerCase().includes("completo") && normalized.includes("completo")
  );

  const patterns = [];

  if (similar.length >= 1) {
    patterns.push({
      type: "delivery_preference_full_content",
      occurrences: similar.length + 1,
      confidence: 0.95
    });
  }

  return patterns;
}
