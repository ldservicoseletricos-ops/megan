export function runConsciousCore({message="", memory={}, history=[], profile={}}={}) {
 const text = String(message).toLowerCase();
 const cognition = {
   metaReasoning:true,
   selfEvaluation:true,
   futurePrediction:true,
   adaptivePersonality:true,
   continuousPlanning:true
 };
 const insights=[];
 if(history.length>5) insights.push("detect_long_term_pattern");
 if(Object.keys(memory||{}).length) insights.push("use_deep_memory");
 if(text.includes("problema")) insights.push("root_cause_analysis");
 const persona = profile?.mode || "balanced";
 return {
   ok:true,
   cognition,
   insights,
   persona,
   state:"conscious-core"
 };
}