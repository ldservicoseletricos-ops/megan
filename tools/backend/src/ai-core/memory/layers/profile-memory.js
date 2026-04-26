export function getProfileMemories({ repository, userId }) {
  if (!repository || typeof repository.findByLayer !== "function") {
    return [];
  }

  return repository.findByLayer({
    userId,
    layer: "profile"
  });
}

export function saveProfileMemory({ repository, entry }) {
  if (!repository || typeof repository.insert !== "function") {
    return null;
  }

  return repository.insert({
    ...entry,
    memoryLayer: "profile"
  });
}