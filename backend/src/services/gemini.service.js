async function generateReply({message,recentMemory}) {
 const key=process.env.GEMINI_API_KEY||'';
 if(key){
   return `Megan (Gemini pronto): recebi sua mensagem: ${message}`;
 }
 return `Megan local: entendi "${message}". Memória recente: ${recentMemory.length} registros.`;
}
module.exports={generateReply};
