export function suggestNextStep({ execution = {}, goal = null, tasks = [] } = {}) {
  if (execution?.route) {
    return "Iniciar a navegação e acompanhar o progresso do trajeto.";
  }

  const pending = (Array.isArray(tasks) ? tasks : []).find((task) => task.status === "ready");
  if (pending) {
    return pending.title;
  }

  if (goal?.nextStep) {
    return goal.nextStep;
  }

  return "Continuar com a próxima ação útil para avançar o objetivo.";
}
