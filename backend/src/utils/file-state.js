import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const paths = {
  state: path.resolve(__dirname, '../data/state.json'),
  memory: path.resolve(__dirname, '../data/memory.json'),
  growthForecast: path.resolve(__dirname, '../data/growth-forecast.json'),
  salesAi: path.resolve(__dirname, '../data/sales-ai.json'),
  commandCenter: path.resolve(__dirname, '../data/command-center.json'),
};

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf-8'));
const writeJson = (filePath, payload) => fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');

export const readState = () => readJson(paths.state);
export const writeState = (p) => writeJson(paths.state, p);
export const readMemory = () => readJson(paths.memory);
export const writeMemory = (p) => writeJson(paths.memory, p);
export const readGrowthForecast = () => readJson(paths.growthForecast);
export const writeGrowthForecast = (p) => writeJson(paths.growthForecast, p);
export const readSalesAi = () => readJson(paths.salesAi);
export const writeSalesAi = (p) => writeJson(paths.salesAi, p);
export const readCommandCenter = () => readJson(paths.commandCenter);
export const writeCommandCenter = (p) => writeJson(paths.commandCenter, p);
