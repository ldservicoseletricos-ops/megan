function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

export function rankMemoryItems(items = [], query = "") {
  const safeItems = Array.isArray(items) ? items : [];
  const safeQuery = normalizeText(query);

  return safeItems
    .map((item) => {
      const content = normalizeText(item?.content || item?.summary || "");
      let score = Number(item?.priority || 0);
      if (safeQuery && content.includes(safeQuery)) score += 50;
      if (safeQuery && safeQuery.split(/\s+/).some((token) => token && content.includes(token))) score += 20;
      if (item?.type === "preference") score += 10;
      if (item?.type === "project") score += 8;
      return { ...item, score };
    })
    .sort((a, b) => b.score - a.score);
}
