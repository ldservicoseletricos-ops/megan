import { getDb, updateDb, pushLimited } from "../lib/store.js";

function buildMarketingReport() {
  const report = {
    id: `marketing_${Date.now()}`,
    actions: [
      "Criar conteúdo para Instagram",
      "Preparar campanha de lançamento",
      "Montar oferta promocional"
    ],
    channelFocus: "Instagram + WhatsApp",
    createdAt: new Date().toISOString()
  };

  updateDb((draft) => {
    draft.marketingReports = pushLimited(draft.marketingReports, report, 100);
    return draft;
  });

  return report;
}

function getMarketingReport() {
  return (getDb().marketingReports || [])[0] || buildMarketingReport();
}

export { buildMarketingReport, getMarketingReport };
