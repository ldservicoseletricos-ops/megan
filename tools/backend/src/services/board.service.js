import { readBoard, writeBoard } from '../utils/file-state.js';
export const getBoard = () => readBoard();
export function createBoardItem(payload) {
  const board = readBoard();
  const nextItem = { id: `board-${String(board.length + 1).padStart(3, '0')}`, title: payload.title || 'Novo item estratégico', area: payload.area || 'general', priority: payload.priority || 'medium', status: payload.status || 'planned' };
  const next = [...board, nextItem];
  writeBoard(next);
  return nextItem;
}
