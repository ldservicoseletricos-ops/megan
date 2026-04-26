export function buildAlwaysListeningState({
  transcript = "",
  wakeWords = ["ok megan", "oi megan"],
  mobile = true
} = {}) {
  const text = String(transcript || "").toLowerCase();
  const heardWakeWord = wakeWords.some((item) => text.includes(String(item).toLowerCase()));

  return {
    ok: true,
    mobile: Boolean(mobile),
    listening: true,
    heardWakeWord,
    wakeWords,
    mode: heardWakeWord ? "active_session" : "standby"
  };
}
