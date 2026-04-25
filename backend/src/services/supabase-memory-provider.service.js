export function createSupabaseMemoryConfig(env = process.env) {
  return {
    url: env.SUPABASE_URL || env.VITE_SUPABASE_URL || "",
    anonKey: env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || "",
    table: env.SUPABASE_MEMORY_TABLE || "user_memories",
    projectHistoryTable: env.SUPABASE_PROJECT_HISTORY_TABLE || "project_history"
  };
}

export async function connectSupabaseMemoryProvider({
  env = process.env
} = {}) {
  const config = createSupabaseMemoryConfig(env);

  return {
    ok: true,
    provider: "supabase-postgres",
    connected: Boolean(config.url && config.anonKey),
    config: {
      table: config.table,
      projectHistoryTable: config.projectHistoryTable
    },
    connectedAt: new Date().toISOString()
  };
}

export async function readPersistentProjectMemory({
  userId = "default",
  env = process.env
} = {}) {
  const config = createSupabaseMemoryConfig(env);

  return {
    ok: true,
    provider: "supabase-postgres",
    userId,
    config: {
      table: config.table,
      projectHistoryTable: config.projectHistoryTable
    },
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

export function mergePersistentProjectMemory({
  record = {},
  memory = {},
  projectEvent = null
} = {}) {
  const currentMemory = record?.memory || {};
  const currentProjects = currentMemory?.projects || {};
  const currentHistory = Array.isArray(record?.projectHistory) ? record.projectHistory : [];

  const nextRecord = {
    ...record,
    memory: {
      ...currentMemory,
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
            id: projectEvent?.id || `pg_${Date.now()}`,
            projectId: projectEvent?.projectId || "default",
            type: projectEvent?.type || "project_update",
            summary: projectEvent?.summary || "Atualização persistente de projeto",
            createdAt: projectEvent?.createdAt || new Date().toISOString(),
            meta: projectEvent?.meta || {}
          },
          ...currentHistory
        ].slice(0, 1000)
      : currentHistory
  };

  return nextRecord;
}

export async function writePersistentProjectMemory({
  userId = "default",
  record = {},
  env = process.env
} = {}) {
  const config = createSupabaseMemoryConfig(env);

  return {
    ok: true,
    provider: "supabase-postgres",
    userId,
    savedAt: new Date().toISOString(),
    config: {
      table: config.table,
      projectHistoryTable: config.projectHistoryTable
    },
    record
  };
}
