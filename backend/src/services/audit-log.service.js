import { getDb, updateDb, pushLimited } from "../lib/store.js";

function appendAuditLog(entry = {}) {
  const item = {
    id: `audit_${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...entry
  };

  updateDb((draft) => {
    draft.auditLogs = pushLimited(draft.auditLogs, item, 300);
    return draft;
  });

  return item;
}

function listAuditLogs() {
  return getDb().auditLogs || [];
}

export { appendAuditLog, listAuditLogs };
