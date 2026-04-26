export function getSessionMemories({ repository, userId, sessionId }) {
  if (!repository || typeof repository.findByLayer !== "function") {
    return [];
  }

  const items = repository.findByLayer({
    userId,
    layer: "session"
  });

  if (!Array.isArray(items)) {
    return [];
  }

  return items.filter((item) => {
    const itemSessionId = item?.sessionId || item?.session_id || item?.value?.sessionId;
    return itemSessionId === sessionId;
  });
}

export function saveSessionMemory({ repository, entry }) {
  if (!repository || typeof repository.insert !== "function") {
    return null;
  }

  return repository.insert({
    ...entry,
    memoryLayer: "session"
  });
}