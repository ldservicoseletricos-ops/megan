import { getDb, updateDb, pushLimited } from "../lib/store.js";
import { getBusinessGoals } from "./goals-engine.service.js";
import { getGrowthReport } from "./growth-engine.service.js";
import { getSalesReport } from "./sales-engine.service.js";
import { getMarketingReport } from "./marketing-engine.service.js";

function buildCompanyPanel() {
  const goals = getBusinessGoals();
  const growth = getGrowthReport();
  const sales = getSalesReport();
  const marketing = getMarketingReport();

  const panel = {
    id: `company_${Date.now()}`,
    goalsCount: goals.length,
    revenuePotential: "alta",
    actionOfDay: sales.topOffer,
    growthFocus: growth.focus,
    marketingFocus: marketing.channelFocus,
    createdAt: new Date().toISOString()
  };

  updateDb((draft) => {
    draft.companyPanels = pushLimited(draft.companyPanels, panel, 100);
    return draft;
  });

  return panel;
}

function getCompanyPanel() {
  return (getDb().companyPanels || [])[0] || buildCompanyPanel();
}

export { buildCompanyPanel, getCompanyPanel };
