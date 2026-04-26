import { getDb, updateDb } from "../lib/store.js";
import { updateUserProfile } from "./user-profile.service.js";

function createSubAccount({ parentUserId, userId, name } = {}) {
  if (!parentUserId || !userId) return null;
  const db = updateDb((draft) => {
    if (!draft.subAccounts[parentUserId]) draft.subAccounts[parentUserId] = [];
    const exists = draft.subAccounts[parentUserId].find((item) => item.userId === userId);
    if (!exists) draft.subAccounts[parentUserId].push({ userId, name: name || userId, createdAt: new Date().toISOString() });
    return draft;
  });
  updateUserProfile(userId, { name: name || userId, role: "subaccount" });
  return db.subAccounts[parentUserId];
}

function listSubAccounts(parentUserId = "default") {
  return getDb().subAccounts[parentUserId] || [];
}

export { createSubAccount, listSubAccounts };
