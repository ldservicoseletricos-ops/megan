import crypto from "crypto";
import { readDb, updateDb } from "../lib/store.js";
import { summarizeQueue, listQueue } from "./persistent-queue.service.js";
import { listObjectiveMemories } from "./objective-memory.service.js";

function buildFindings({ queueSummary, memories }) {
  const findings = [];

  if (queueSummary.failed > 0) {
    findings.push(`Há ${queueSummary.failed} tarefa(s) falha(s) que podem ser retomadas.`);
  }

  if (queueSummary.queued > 0) {
    findings.push(`Há ${queueSummary.queued} tarefa(s) na fila aguardando execução.`);
  }

  const activeObjectives = memories.filter((item) => item.status === "active");
  if (activeObjectives.length > 0) {
    findings.push(`${activeObjectives.length} objetivo(s) continuam ativos.`);
  }

  return findings;
}

export function runSupervisor(conversationId) {
  const queueSummary = summarizeQueue(conversationId);
  const queueItems = listQueue(conversationId);
  const memories = listObjectiveMemories(conversationId);
  const findings = buildFindings({ queueSummary, memories });

  let nextAction = "Aguardar nova mensagem.";

  if (queueSummary.failed > 0) {
    nextAction = "Retomar tarefas falhas antes de abrir novas frentes.";
  } else if (queueSummary.queued > 0) {
    nextAction = "Executar a próxima tarefa pendente da fila.";
  } else if (memories.some((item) => item.status === "active")) {
    nextAction = "Revisar objetivos ativos e manter contexto operacional.";
  }

  const summary =
    queueItems.length === 0
      ? "Sem fila operacional pendente."
      : `Fila operacional com ${queueSummary.total} item(ns).`;

  const run = {
    id: crypto.randomUUID(),
    conversationId,
    objectiveKey: queueSummary.nextTask?.objectiveKey || memories[0]?.objectiveKey || "general",
    summary,
    findings,
    nextAction,
    createdAt: new Date().toISOString(),
  };

  updateDb((db) => {
    db.supervisorRuns = Array.isArray(db.supervisorRuns) ? db.supervisorRuns : [];
    db.supervisorRuns.unshift(run);
    return db;
  });

  return run;
}

export function listSupervisorRuns(conversationId) {
  const db = readDb();
  return (db.supervisorRuns || []).filter((item) =>
    conversationId ? item.conversationId === conversationId : true
  );
}
