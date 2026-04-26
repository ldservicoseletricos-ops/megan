export function updateStrategicMemory({memory={}, feedback={}}={}) {
 return {
   ...memory,
   strategic:{
     lastFeedback: feedback,
     updatedAt: new Date().toISOString()
   }
 };
}