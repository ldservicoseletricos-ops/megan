import { readState } from '../utils/file-state.js';
export function getRuntimeStatus() {
  const state = readState();
  return { status: state.health.status, version: state.health.version, readiness: state.overview.readiness, build: state.overview.build, deploy: state.overview.deploy, approvedPatches: state.overview.approvedPatches, appliedPatches: state.overview.appliedPatches, timestamp: new Date().toISOString() };
}
