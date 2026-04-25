const path = require('path');
const { readJson } = require('./_utils');

const plansPath = path.join(__dirname, '..', 'data', 'module-plans.json');

function listPlans() {
  return readJson(plansPath, []);
}

function getPlanById(planId) {
  return listPlans().find((item) => item.id === planId) || null;
}

function getAccessFromModules(modules = []) {
  return {
    adm: modules.includes('adm'),
    navigation: modules.includes('navigation'),
    health: modules.includes('health'),
  };
}

module.exports = { listPlans, getPlanById, getAccessFromModules };
