export function buildVoiceMapsPayload({ guidance = {}, traffic = {}, navigationState = {} } = {}) {
  const messages = [];
  if (guidance?.instruction) messages.push(guidance.instruction);
  if (traffic?.alerts?.length) messages.push(traffic.alerts[0].text);

  return {
    ok: true,
    mode: 'voice-maps',
    enabled: true,
    shouldSpeak: Boolean(messages.length),
    voiceText: messages.join(' '),
    navigationStatus: navigationState?.status || 'idle',
  };
}
