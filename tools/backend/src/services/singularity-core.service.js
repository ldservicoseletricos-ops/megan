export function runSingularityCore({message="", memory={}, goals=[], telemetry=[]}={}) {
 const text = String(message).toLowerCase();
 const engine = {
   selfImprove:true,
   instantDecision:true,
   longTermPlanner:true,
   totalMemory:true,
   adaptivePersona:true
 };
 const actions=[];
 if(goals.length) actions.push("review_long_term_goals");
 if(telemetry.length) actions.push("optimize_from_usage");
 if(text.includes("projeto")) actions.push("project_strategy");
 if(!actions.length) actions.push("smart_assist");
 return {
   ok:true,
   engine,
   actions,
   level:"singularity",
   memorySignals:Object.keys(memory||{}).length
 };
}