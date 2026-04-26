export function buildPlan(tasks=[]) {
 return tasks.map((t,i)=>({order:i+1, task:t, status:"ready"}));
}