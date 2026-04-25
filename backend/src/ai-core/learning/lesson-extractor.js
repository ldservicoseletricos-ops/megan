export function extractLessons({ message, classification, evaluation, criticReview }) {
  const lessons = [];

  if (classification.category === "self_evolution") {
    lessons.push("Pedidos de autoevolução precisam de resposta modular e estratégica.");
  }

  if (String(message).toLowerCase().includes("completo")) {
    lessons.push("Usuário valoriza entrega completa pronta para colar.");
  }

  if (criticReview.warnings.length > 0) {
    lessons.push("Há espaço para aprofundar ou melhorar clareza da resposta.");
  }

  if (evaluation.finalScore >= 0.9) {
    lessons.push("Estratégia atual teve bom desempenho nesta interação.");
  }

  return lessons;
}
