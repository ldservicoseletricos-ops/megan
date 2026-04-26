import { readPipeline, writePipeline } from '../utils/file-state.js';
export const getPipeline = () => readPipeline();
export function createPipelineItem(payload) {
  const pipeline = readPipeline();
  const nextItem = { id: `pipe-${String(pipeline.length + 1).padStart(3, '0')}`, stage: payload.stage || 'backlog', title: payload.title || 'Novo item pipeline', owner: payload.owner || 'Megan Ops AI', status: payload.status || 'waiting' };
  const next = [...pipeline, nextItem];
  writePipeline(next);
  return nextItem;
}
