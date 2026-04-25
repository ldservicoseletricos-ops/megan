import { getDb } from "../lib/store.js";
import { getUserProfile } from "./user-profile.service.js";

function getUserPermissions(userId = "default") {
  const db = getDb();
  const profile = getUserProfile(userId);
  const defaults = {
    executiveView: false,
    autonomousExecution: false,
    businessMode: false,
    unifiedControl: false
  };

  if ((profile.role || "user") === "admin") {
    defaults.executiveView = true;
    defaults.autonomousExecution = true;
    defaults.businessMode = true;
    defaults.unifiedControl = true;
  }

  return { ...defaults, ...(db.userPermissions[userId] || {}) };
}

export { getUserPermissions };
