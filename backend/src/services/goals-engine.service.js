import { getDb, updateDb } from "../lib/store.js";

function buildBusinessGoals() {
  const month = new Date().toISOString().slice(0, 7);
  const goals = [
    { id: `goal_${Date.now()}_1`, title: "Lançar app Android", category: "produto", month, status: "planned" },
    { id: `goal_${Date.now()}_2`, title: "Publicar 2 livros KDP", category: "conteúdo", month, status: "planned" },
    { id: `goal_${Date.now()}_3`, title: "Fechar 3 clientes", category: "vendas", month, status: "planned" }
  ];

  updateDb((draft) => {
    draft.businessGoals = goals;
    return draft;
  });

  return goals;
}

function getBusinessGoals() {
  const current = getDb().businessGoals || [];
  return current.length ? current : buildBusinessGoals();
}

export { buildBusinessGoals, getBusinessGoals };
