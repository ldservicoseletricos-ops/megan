import { getDb, updateDb } from "../lib/store.js";
import { updateUserProfile } from "./user-profile.service.js";

function createTeam({ teamId, name, ownerUserId } = {}) {
  const finalId = teamId || `team_${Date.now()}`;
  const db = updateDb((draft) => {
    if (!draft.teams[finalId]) {
      draft.teams[finalId] = {
        teamId: finalId,
        name: name || finalId,
        ownerUserId,
        members: ownerUserId ? [ownerUserId] : [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    return draft;
  });
  if (ownerUserId) updateUserProfile(ownerUserId, { teamId: finalId, role: "admin" });
  return db.teams[finalId];
}

function listTeams() {
  return Object.values(getDb().teams || {});
}

function getTeam(teamId) {
  return getDb().teams[teamId] || null;
}

export { createTeam, listTeams, getTeam };
