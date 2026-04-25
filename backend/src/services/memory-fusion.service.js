export function buildMemoryFusion({ sessionMemory = [], projectMemory = [], userMemory = [] } = {}) {
  return {
    sessionMemory,
    projectMemory,
    userMemory,
    mergedSummary: [
      ...sessionMemory,
      ...projectMemory,
      ...userMemory,
    ].slice(-20),
  };
}

export default {
  buildMemoryFusion,
};
