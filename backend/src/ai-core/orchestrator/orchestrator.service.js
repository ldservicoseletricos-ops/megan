import { classifyTask } from "../classifier/task-classifier.service.js";
import { retrieveMemory, persistCoreMemories } from "../memory/memory.service.js";
import { resolveActiveRules } from "../rules/rule-engine.service.js";
import { buildPlan } from "../planner/planner.service.js";
import { executePlan } from "../execution/executor.service.js";
import { reviewOutput } from "../critic/critic.service.js";
import { evaluateInteraction } from "../evaluation/evaluation.service.js";
import { learnFromInteraction } from "../learning/learning.service.js";
import { createInteractionRecord } from "../../db/repositories/interaction.repository.js";
import { resolveUserAdaptation } from "../adaptation/adaptation.service.js";
import { routeSpecialistBrains } from "../brains/specialist-brain-router.js";
import { buildBrainConsensus } from "../brains/brain-consensus.service.js";
import { insertBrainRouting } from "../../db/repositories/brain-routing.repository.js";
import { executeSwarm } from "../swarm/swarm-executor.service.js";
import { voteSwarmOutputs } from "../swarm/swarm-voting.service.js";
import { registerSwarmPerformance } from "../swarm/brain-performance.service.js";
import { createSwarmSession } from "../../db/repositories/swarm-session.repository.js";
import { createSwarmVote } from "../../db/repositories/swarm-vote.repository.js";
import { delegateAgents } from "../agents/agent-delegation.service.js";
import { runAgentPipeline } from "../agents/agent-pipeline.service.js";
import { superviseAgentPipeline } from "../agents/agent-supervisor.service.js";
import { createAgentRun } from "../../db/repositories/agent-run.repository.js";
import { createAgentTask } from "../../db/repositories/agent-task.repository.js";
import { updateSystemState } from "../../db/repositories/system-state.repository.js";

export async function orchestrateUserInput({ message, userId, sessionId, context = {} }) {
  const input = { message, userId, sessionId, context };

  const memory = retrieveMemory({ userId, sessionId });
  const classification = classifyTask({ message, context, memory });
  const adaptiveContext = resolveUserAdaptation({
    userId,
    classification,
    memory,
    context
  });

  const brainRouting = routeSpecialistBrains({
    message,
    classification,
    adaptiveContext
  });

  const brainConsensus = buildBrainConsensus({
    selectedBrains: brainRouting.selectedBrains,
    classification,
    adaptiveContext
  });

  const swarmExecution = await executeSwarm({
    message,
    classification,
    adaptiveContext,
    selectedBrains: brainRouting.selectedBrains
  });

  const swarmVoting = voteSwarmOutputs({
    outputs: swarmExecution.outputs,
    classification
  });

  const swarmSession = createSwarmSession({
    userId,
    sessionId,
    category: classification.category,
    mode: swarmExecution.mode,
    totalBrainsActivated: swarmExecution.totalBrainsActivated,
    leaderBrainBeforeVote: brainConsensus.leadBrain,
    winnerBrainAfterVote: swarmVoting.winner.brainId,
    ranking: swarmVoting.ranking
  });

  const swarmVotes = swarmVoting.ranking.map((item) =>
    createSwarmVote({
      swarmSessionId: swarmSession.swarmSessionId,
      userId,
      sessionId,
      category: classification.category,
      brainId: item.brainId,
      score: item.score,
      won: item.brainId === swarmVoting.winner.brainId
    })
  );

  const performanceUpdates = registerSwarmPerformance({
    ranking: swarmVoting.ranking,
    winnerBrainId: swarmVoting.winner.brainId
  });

  const enrichedBrainConsensus = {
    ...brainConsensus,
    swarmMode: swarmExecution.mode,
    leaderBeforeVote: brainConsensus.leadBrain,
    leadBrain: swarmVoting.winner.brainId,
    leadLabel: swarmVoting.winner.label,
    selectedBrains: brainRouting.selectedBrains,
    supportingBrains: brainRouting.selectedBrains
      .map((item) => item.brainId)
      .filter((brainId) => brainId !== swarmVoting.winner.brainId),
    responseStyle:
      swarmVoting.winner.brainId === "technical_operator"
        ? "practical_fix"
        : swarmVoting.winner.brainId === "strategic_architect"
        ? "strategic_system_design"
        : swarmVoting.winner.brainId === "creative_editor"
        ? "creative_structured"
        : "adaptive_structured",
    rationale: [
      ...(brainConsensus.rationale || []),
      `swarm_mode:${swarmExecution.mode}`,
      `winner_after_vote:${swarmVoting.winner.brainId}`,
      `activated:${swarmExecution.totalBrainsActivated}`
    ]
  };

  const activeRules = resolveActiveRules({ userId, message, classification, memory });

  const plan = buildPlan({
    classification,
    message,
    context,
    memory,
    activeRules,
    adaptiveContext,
    brainConsensus: enrichedBrainConsensus,
    swarmExecution,
    swarmVoting
  });

  const agentDelegation = delegateAgents({
    message,
    classification,
    adaptiveContext,
    brainConsensus: enrichedBrainConsensus,
    swarmVoting
  });

  const agentPipeline = await runAgentPipeline({
    delegation: agentDelegation,
    message,
    classification,
    plan
  });

  const agentRun = createAgentRun({
    userId,
    sessionId,
    category: classification.category,
    mode: agentDelegation.mode,
    leaderAgentId: agentDelegation.leaderAgentId,
    finalSupervisorAgentId: agentDelegation.finalSupervisorAgentId,
    totalAgents: agentPipeline.totalAgents,
    pipelineId: agentPipeline.pipelineId
  });

  const agentTasks = agentPipeline.tasks.map((task) =>
    createAgentTask({
      agentRunId: agentRun.agentRunId,
      userId,
      sessionId,
      category: classification.category,
      agentId: task.agentId,
      label: task.label,
      role: task.role,
      title: task.title,
      summary: task.summary,
      status: task.status
    })
  );

  const execution = executePlan({
    input,
    classification,
    plan,
    memorySummary: memory.summary,
    activeRules,
    adaptiveContext,
    brainConsensus: enrichedBrainConsensus,
    swarmExecution,
    swarmVoting,
    agentDelegation,
    agentPipeline
  });

  const criticReview = reviewOutput({
    classification,
    execution,
    plan,
    activeRules
  });

  const evaluation = evaluateInteraction({
    classification,
    criticReview,
    activeRules,
    response: execution.response
  });

  const agentSupervisor = superviseAgentPipeline({
    pipeline: agentPipeline,
    delegation: agentDelegation,
    classification,
    evaluation
  });

  updateSystemState({
    lastAgentReviewAt: agentSupervisor.reviewedAt,
    autonomyLevel: "autonomous-agents-personalized",
    activeProfile: "v9-agents-baseline"
  });

  const learning = learnFromInteraction({
    userId,
    message,
    classification,
    evaluation,
    criticReview,
    adaptiveContext
  });

  const routingRecord = insertBrainRouting({
    userId,
    sessionId,
    category: classification.category,
    leadBrain: enrichedBrainConsensus.leadBrain,
    supportingBrains: enrichedBrainConsensus.supportingBrains,
    selectedBrains: enrichedBrainConsensus.selectedBrains,
    responseStyle: enrichedBrainConsensus.responseStyle,
    rationale: enrichedBrainConsensus.rationale
  });

  const result = {
    classification,
    plan,
    execution,
    criticReview,
    evaluation,
    learning,
    adaptiveContext,
    brainConsensus: enrichedBrainConsensus,
    routingRecord,
    swarmExecution,
    swarmVoting,
    swarmSession,
    swarmVotes,
    performanceUpdates,
    agentDelegation,
    agentPipeline,
    agentSupervisor,
    agentRun,
    agentTasks
  };

  persistCoreMemories({
    userId,
    sessionId,
    message,
    result
  });

  const interactionRecord = createInteractionRecord({
    userId,
    sessionId,
    message,
    classification,
    adaptiveContext: {
      selectedMode: adaptiveContext.adaptiveProfile.selectedMode,
      responseFrame: adaptiveContext.adaptiveProfile.responseFrame,
      priorities: adaptiveContext.priorities,
      profileSnapshot: adaptiveContext.userProfile
    },
    brainConsensus: {
      leadBrain: enrichedBrainConsensus.leadBrain,
      supportingBrains: enrichedBrainConsensus.supportingBrains,
      responseStyle: enrichedBrainConsensus.responseStyle,
      leaderBeforeVote: enrichedBrainConsensus.leaderBeforeVote,
      swarmMode: enrichedBrainConsensus.swarmMode
    },
    swarmVoting: {
      winnerBrain: swarmVoting.winner.brainId,
      ranking: swarmVoting.ranking
    },
    agentDelegation: {
      mode: agentDelegation.mode,
      leaderAgentId: agentDelegation.leaderAgentId,
      finalSupervisorAgentId: agentDelegation.finalSupervisorAgentId
    },
    agentSupervisor,
    plan,
    finalResponse: execution.response,
    criticReview,
    evaluation,
    learning
  });

  return {
    input,
    memorySummary: memory.summary,
    activeRules,
    interactionRecord,
    ...result
  };
}
