export function buildLiveSyncState({
  userId = "default",
  frontendState = {},
  backendState = {},
  databaseState = {}
} = {}) {
  const frontendUpdatedAt = frontendState?.updatedAt || null;
  const backendUpdatedAt = backendState?.updatedAt || null;
  const databaseUpdatedAt = databaseState?.updatedAt || null;

  const syncSources = {
    frontend: Boolean(frontendState && Object.keys(frontendState).length),
    backend: Boolean(backendState && Object.keys(backendState).length),
    database: Boolean(databaseState && Object.keys(databaseState).length)
  };

  const consistent =
    syncSources.frontend &&
    syncSources.backend &&
    syncSources.database;

  return {
    ok: true,
    mode: "live-sync",
    userId,
    syncSources,
    timestamps: {
      frontendUpdatedAt,
      backendUpdatedAt,
      databaseUpdatedAt
    },
    consistent,
    summary: consistent
      ? "sync_ready"
      : "sync_partial"
  };
}

export function mergeLiveMemory({
  frontendState = {},
  backendState = {},
  databaseState = {}
} = {}) {
  return {
    profile: {
      ...(databaseState?.profile || {}),
      ...(backendState?.profile || {}),
      ...(frontendState?.profile || {})
    },
    preferences: {
      ...(databaseState?.preferences || {}),
      ...(backendState?.preferences || {}),
      ...(frontendState?.preferences || {})
    },
    aliases: {
      ...(databaseState?.aliases || {}),
      ...(backendState?.aliases || {}),
      ...(frontendState?.aliases || {})
    },
    projects: {
      ...(databaseState?.projects || {}),
      ...(backendState?.projects || {}),
      ...(frontendState?.projects || {})
    },
    updatedAt: new Date().toISOString()
  };
}
