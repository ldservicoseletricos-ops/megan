import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_ROOT = path.resolve(__dirname, '..', '..');

export const BACKEND_ROOT_DIR = BACKEND_ROOT;
export const DATA_DIR = path.resolve(BACKEND_ROOT, 'data');

export function resolveDataPath(...segments) {
  return path.resolve(DATA_DIR, ...segments);
}
