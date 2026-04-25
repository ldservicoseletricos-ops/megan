import { buildAutonomyPlan } from "./autonomy.service.js";

export function runRealAutonomy({ message = "", destination = "", execution = {} } = {}) {
  const plan = buildAutonomyPlan({ message, destination, execution });

  return {
    ok: true,
    mode: "real-autonomy-v1",
    plan,
    summary: plan?.nextStep || "Autonomia pronta para o próximo passo.",
  };
}
