export async function connectMemoryProvider({
  provider = "local-adapter"
} = {}) {
  return {
    ok: true,
    provider,
    connectedAt: new Date().toISOString(),
    mode: "database-memory-adapter"
  };
}

export async function loadUserMemoryRecord({
  userId = "default"
} = {}) {
  return {
    ok: true,
    userId,
    record: {
      memory: {
        profile: {},
        preferences: {},
        aliases: {},
        projects: {}
      },
      projectHistory: []
    }
  };
}

export async function saveUserMemoryRecord({
  userId = "default",
  record = {}
} = {}) {
  return {
    ok: true,
    userId,
    savedAt: new Date().toISOString(),
    record
  };
}

export function mergeUserMemoryRecord({
  record = {},
  memory = {},
  projectEvent = null
} = {}) {
  const currentProjects = record?.memory?.projects || {};
  const currentHistory = Array.isArray(record?.projectHistory) ? record.projectHistory : [];

  const merged = {
    ...record,
    memory: {
      ...(record?.memory || {}),
      ...(memory || {}),
      projects: {
        ...currentProjects,
        ...((memory && memory.projects) || {})
      },
      updatedAt: new Date().toISOString()
    },
    projectHistory: projectEvent
      ? [
          {
            id: projectEvent?.id || `project_${Date.now()}`,
            projectId: projectEvent?.projectId || "default",
            type: projectEvent?.type || "project_update",
            summary: projectEvent?.summary || "Atualização de projeto",
            createdAt: projectEvent?.createdAt || new Date().toISOString(),
            meta: projectEvent?.meta || {}
          },
          ...currentHistory
        ].slice(0, 500)
      : currentHistory
  };

  return merged;
}
