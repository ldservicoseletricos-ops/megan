export function runOmnipresentAI({devices=[], wakeWords=["ok megan","oi megan"], memory={}, message=""}={}) {
 const text = String(message).toLowerCase();
 const presence = {
   alwaysAvailable:true,
   crossDeviceSync:true,
   sharedMemory:true,
   wakeWordEnabled:true,
   ambientAssist:true
 };
 const heardWakeWord = wakeWords.some(w => text.includes(String(w).toLowerCase()));
 const actions=[];
 if(heardWakeWord) actions.push("activate_voice_session");
 if(devices.length>1) actions.push("sync_all_devices");
 if(Object.keys(memory||{}).length) actions.push("load_global_context");
 if(!actions.length) actions.push("standby_listening");
 return {
   ok:true,
   presence,
   heardWakeWord,
   actions,
   mode:"omnipresent"
 };
}