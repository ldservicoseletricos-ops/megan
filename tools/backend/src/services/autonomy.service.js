import { inferGoalFromMessage } from "./goal-engine.service.js";
import { buildTaskChain } from "./task-chain.service.js";
import { suggestNextStep } from "./next-step.service.js";
import { calculateProgress } from "./progress-tracker.service.js";

export function buildAutonomyPlan({ message = "", destination = "", execution = {} } = {}) {
  const goal = inferGoalFromMessage(message || destination || "");
  const tasks = buildTaskChain({
    message,
    destination,
    hasRoute: Boolean(execution?.route),
  });
  const tracker = calculateProgress({
    tasks,
    hasRoute: Boolean(execution?.route),
    hasWeather: Boolean(execution?.weather),
  });
  const nextStep = suggestNextStep({ execution, goal, tasks });

  return {
    ok: true,
    goal,
    tasks,
    tracker,
    nextStep,
    autonomousMode: true,
    updatedAt: new Date().toISOString(),
  };
}
