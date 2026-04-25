import { buildResponse } from "./response-builder.js";

export function executePlan({
  input,
  classification,
  plan,
  memorySummary,
  activeRules,
  adaptiveContext,
  brainConsensus,
  swarmExecution,
  swarmVoting,
  agentDelegation,
  agentPipeline,
  agentSupervisor
}) {
  const response = buildResponse({
    input,
    classification,
    plan,
    memorySummary,
    activeRules,
    adaptiveContext,
    brainConsensus,
    swarmExecution,
    swarmVoting,
    agentDelegation,
    agentPipeline,
    agentSupervisor
  });

  return {
    response,
    responseType: classification.expectedOutput
  };
}
