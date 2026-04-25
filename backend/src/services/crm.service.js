const path = require('path');
const { readJson, writeJson } = require('./_utils');
const leadsPath = path.join(__dirname, '..', 'data', 'crm-leads.json');

function listLeads() {
  return readJson(leadsPath, []);
}

function createLead(payload = {}) {
  const leads = readJson(leadsPath, []);
  const lead = {
    id: `lead_${Date.now()}`,
    name: payload.name || 'Lead',
    email: payload.email || '',
    planId: payload.planId || '',
    status: payload.status || 'new',
    createdAt: new Date().toISOString(),
  };
  leads.unshift(lead);
  writeJson(leadsPath, leads);
  return lead;
}

function updateLead(email, updates = {}) {
  const leads = readJson(leadsPath, []);
  const idx = leads.findIndex((item) => item.email === email);
  if (idx >= 0) {
    leads[idx] = { ...leads[idx], ...updates, updatedAt: new Date().toISOString() };
    writeJson(leadsPath, leads);
    return leads[idx];
  }
  return null;
}

module.exports = { listLeads, createLead, updateLead };
