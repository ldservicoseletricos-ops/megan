import { getDb, updateDb, pushLimited } from "../lib/store.js";

function buildSalesReport() {
  const report = {
    id: `sales_${Date.now()}`,
    offers: [
      "Megan OS Premium",
      "Livro infantil bíblico",
      "Automação empresarial"
    ],
    topOffer: "Megan OS Premium",
    createdAt: new Date().toISOString()
  };

  updateDb((draft) => {
    draft.salesReports = pushLimited(draft.salesReports, report, 100);
    return draft;
  });

  return report;
}

function getSalesReport() {
  return (getDb().salesReports || [])[0] || buildSalesReport();
}

export { buildSalesReport, getSalesReport };
