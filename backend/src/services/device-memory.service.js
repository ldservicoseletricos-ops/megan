export async function savePersistentMemory({userId="default", memory={}}={}) {
  return {
    ok:true,
    userId,
    savedAt:new Date().toISOString(),
    memory
  };
}

export async function loadPersistentMemory({userId="default"}={}) {
  return {
    ok:true,
    userId,
    memory:{
      preferences:{ voice:"female-natural" },
      aliases:{ casa:null, trabalho:null }
    }
  };
}
