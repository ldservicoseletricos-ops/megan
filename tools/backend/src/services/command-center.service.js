import { readCommandCenter, writeCommandCenter } from '../utils/file-state.js';
export const getCommandCenter = () => readCommandCenter();
export function updateCommandCenter(payload) {
  const current = readCommandCenter();
  const next = current.map((item, index) => index === 0 ? { ...item, ...payload } : item);
  writeCommandCenter(next);
  return next[0];
}
