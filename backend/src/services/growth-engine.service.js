import { getDb, updateDb, pushLimited } from "../lib/store.js";
import { getBusinessGoals } from "./goals-engine.service.js";

function buildGrowthReport() {
  const goals = getBusinessGoals();

  const report = {
    id: `growth_${Date.now()}`,
    focus: "crescimento de receita e produto",
    opportunities: [
      "Vender Megan OS Premium",
      "Empacotar automação empresarial",
      "Escalar livros KDP"
    ],
    goalsCount: goals.length,
    createdAt: new Date().toISOString()
  };

  updateDb((draft) => {
    draft.growthReports = pushLimited(draft.growthReports, report, 100);
    return draft;
  });

  return report;
}

function getGrowthReport() {
  return (getDb().growthReports || [])[0] || buildGrowthReport();
}

export { buildGrowthReport, getGrowthReport };
