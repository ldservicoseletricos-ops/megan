import { getDb, updateDb } from "../lib/store.js";
import { updateUserProfile } from "./user-profile.service.js";

function createDepartment({ departmentId, name, teamId = null, leaderUserId = null, parentDepartmentId = null } = {}) {
  const finalId = departmentId || `dept_${Date.now()}`;
  const db = updateDb((draft) => {
    if (!draft.departments[finalId]) {
      draft.departments[finalId] = {
        departmentId: finalId,
        name: name || finalId,
        teamId,
        leaderUserId,
        parentDepartmentId,
        members: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    return draft;
  });
  if (leaderUserId) updateUserProfile(leaderUserId, { departmentId: finalId, teamId });
  return db.departments[finalId];
}

function listDepartments() {
  return Object.values(getDb().departments || {});
}

function getDepartment(departmentId) {
  return getDb().departments[departmentId] || null;
}

function assignUserToDepartment({ userId, departmentId } = {}) {
  if (!userId || !departmentId) return null;
  const department = updateDb((draft) => {
    const current = draft.departments[departmentId];
    if (!current) return draft;
    current.members = current.members || [];
    if (!current.members.includes(userId)) current.members.push(userId);
    current.updatedAt = new Date().toISOString();
    return draft;
  }).departments[departmentId];
  if (department) updateUserProfile(userId, { departmentId, teamId: department.teamId || null });
  return department;
}

function getOrgOverview() {
  const db = getDb();
  return {
    departments: Object.values(db.departments || {}),
    teams: Object.values(db.teams || {}),
    projects: Object.values(db.projects || {})
  };
}

export { createDepartment, listDepartments, getDepartment, assignUserToDepartment, getOrgOverview };
