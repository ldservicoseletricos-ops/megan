import { getAgentCatalog } from "./agent-catalog.js";
import { listAgentRuns, insertAgentRun } from "../../db/repositories/agent-run.repository.js";
import { listAgentTasks, insertAgentTask } from "../../db/repositories/agent-task.repository.js";

function buildDefaultReview() {
  return {
    status: "ok",
    summary: "pipeline reviewed",
    issues: [],
    recommendations: [],
    reviewedAt: new Date().toISOString()
  };
}

export function reviewAgentPipeline(payload = {}) {
  const review = {
    ...buildDefaultReview(),
    runId: payload.runId || null,
    userId: payload.userId || "anonymous",
    sessionId: payload.sessionId || null,
    pipelineStatus: payload.pipelineStatus || "completed",
    completedSteps: Array.isArray(payload.completedSteps) ? payload.completedSteps : [],
    selectedAgents: Array.isArray(payload.selectedAgents) ? payload.selectedAgents : [],
    reviewedAt: new Date().toISOString()
  };

  const hasNoAgents = !review.selectedAgents.length;
  const hasNoSteps = !review.completedSteps.length;

  if (hasNoAgents) {
    review.status = "warning";
    review.issues.push("no_agents_selected");
    review.recommendations.push("select at least one agent for the pipeline");
  }

  if (hasNoSteps) {
    review.status = "warning";
    review.issues.push("no_pipeline_steps");
    review.recommendations.push("generate at least one pipeline task");
  }

  if (!hasNoAgents && !hasNoSteps) {
    review.summary = "pipeline reviewed successfully";
  }

  return review;
}

export function superviseAgentPipeline(payload = {}) {
  const selectedAgents = Array.isArray(payload.selectedAgents) ? payload.selectedAgents : [];
  const completedSteps = Array.isArray(payload.completedSteps)
    ? payload.completedSteps
    : Array.isArray(payload.pipelineSteps)
      ? payload.pipelineSteps
      : Array.isArray(payload.tasks)
        ? payload.tasks
        : [];

  const review = reviewAgentPipeline({
    runId: payload.runId || null,
    userId: payload.userId || "anonymous",
    sessionId: payload.sessionId || null,
    pipelineStatus: payload.pipelineStatus || payload.status || "completed",
    completedSteps,
    selectedAgents
  });

  return {
    supervisor: "supervisor_agent",
    approved: review.status === "ok",
    review,
    reviewedAt: review.reviewedAt
  };
}

export function registerAgentRun(payload = {}) {
  return insertAgentRun({
    userId: payload.userId || "anonymous",
    sessionId: payload.sessionId || null,
    objective: payload.objective || payload.message || "",
    selectedAgents: Array.isArray(payload.selectedAgents) ? payload.selectedAgents : [],
    leadAgent: payload.leadAgent || "supervisor_agent",
    pipelineStatus: payload.pipelineStatus || "created",
    supervisorReview: payload.supervisorReview || null,
    createdAt: payload.createdAt || new Date().toISOString()
  });
}

export function registerAgentTask(payload = {}) {
  return insertAgentTask({
    runId: payload.runId || null,
    userId: payload.userId || "anonymous",
    sessionId: payload.sessionId || null,
    agent: payload.agent || "operator_agent",
    title: payload.title || "untitled_task",
    description: payload.description || "",
    status: payload.status || "pending",
    input: payload.input || null,
    output: payload.output || null,
    createdAt: payload.createdAt || new Date().toISOString(),
    updatedAt: payload.updatedAt || new Date().toISOString()
  });
}

export function getAgentsOverview() {
  const catalog = getAgentCatalog();
  const agentRuns = listAgentRuns(20);
  const agentTasks = listAgentTasks(50);

  const runsByLeadAgent = agentRuns.reduce((acc, item) => {
    const key = item.leadAgent || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const tasksByAgent = agentTasks.reduce((acc, item) => {
    const key = item.agent || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const tasksByStatus = agentTasks.reduce((acc, item) => {
    const key = item.status || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return {
    totalAgentsAvailable: Array.isArray(catalog) ? catalog.length : 0,
    agentsAvailable: catalog,
    totalAgentRuns: agentRuns.length,
    totalAgentTasks: agentTasks.length,
    runsByLeadAgent,
    tasksByAgent,
    tasksByStatus,
    recentAgentRuns: agentRuns,
    recentAgentTasks: agentTasks,
    lastAgentReviewAt: new Date().toISOString()
  };
}

const agentSupervisorService = {
  reviewAgentPipeline,
  superviseAgentPipeline,
  registerAgentRun,
  registerAgentTask,
  getAgentsOverview
};

export default agentSupervisorService;