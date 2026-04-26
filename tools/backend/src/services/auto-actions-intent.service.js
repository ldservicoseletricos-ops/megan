export async function runAutoActions({message="",flow={},deviceLocation=null}={}) {
 const intent = flow?.intent || (/rota|navega/i.test(message) ? "navigation" : /clima/i.test(message) ? "weather" : "chat");
 let actions=[];
 if(intent==="navigation"){
   actions=["capture_location","open_map","calculate_route","start_navigation"];
 } else if(intent==="weather"){
   actions=["resolve_city","fetch_weather","compose_weather_reply"];
 } else {
   actions=["compose_reply","store_context"];
 }
 const hasLocation=!!(deviceLocation&&typeof deviceLocation.lat==="number"&&typeof deviceLocation.lng==="number");
 return {ok:true,mode:"auto-actions-intent",intent,actions,hasLocation,ready:true};
}