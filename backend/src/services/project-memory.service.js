export function buildProjectMemory({ currentMemory = {}, message = "", autonomy = null } = {}) {
  const project = currentMemory?.project || {};
  return {
    ...currentMemory,
    project: {
      ...project,
      objective: project.objective || message || "Objetivo em andamento",
      nextStep: autonomy?.plan?.nextStep || project.nextStep || "Definir próximo passo",
      progress: autonomy?.plan?.tracker?.progress || project.progress || 0,
      updatedAt: new Date().toISOString(),
    },
  };
}
