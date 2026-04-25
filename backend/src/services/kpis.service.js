import { readKpis, writeKpis } from '../utils/file-state.js';
export const getKpis = () => readKpis();
export function createKpi(payload) {
  const kpis = readKpis();
  const next = { id: `kpi-${String(kpis.length + 1).padStart(3, '0')}`, title: payload.title || 'Novo KPI', value: payload.value || '0', trend: payload.trend || 'stable' };
  const all = [...kpis, next];
  writeKpis(all);
  return next;
}
