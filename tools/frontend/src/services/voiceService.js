const SpeechRecognition =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

export const WAKE_WORDS = ['ok megan', 'oi megan', 'hey megan', 'olá megan', 'ola megan'];

export function isVoiceSupported() {
  return Boolean(SpeechRecognition) && typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function normalizeVoiceText(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function hasWakeWord(value = '') {
  const text = normalizeVoiceText(value);
  return WAKE_WORDS.some((word) => text.includes(normalizeVoiceText(word)));
}

export function removeWakeWord(value = '') {
  let text = String(value || '').trim();
  WAKE_WORDS.forEach((word) => {
    const expression = new RegExp(word, 'ig');
    text = text.replace(expression, '').trim();
  });
  return text;
}

export function speak(text, options = {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = options.lang || 'pt-BR';
  utterance.rate = options.rate || 1;
  utterance.pitch = options.pitch || 1;
  utterance.volume = options.volume || 1;

  const voices = window.speechSynthesis.getVoices?.() || [];
  const preferredVoice = voices.find((voice) =>
    /female|maria|helena|google portuguese|portuguese/i.test(voice.name)
  ) || voices.find((voice) => /pt-BR|Portuguese/i.test(`${voice.lang} ${voice.name}`));

  if (preferredVoice) utterance.voice = preferredVoice;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

export function createRecognition({ onResult, onError, onEnd } = {}) {
  if (!SpeechRecognition) return null;

  const recognition = new SpeechRecognition();
  recognition.lang = 'pt-BR';
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const results = Array.from(event.results || []);
    const last = results[results.length - 1];
    const transcript = last?.[0]?.transcript || '';
    if (transcript) onResult?.(transcript);
  };

  recognition.onerror = (event) => onError?.(event);
  recognition.onend = () => onEnd?.();

  return recognition;
}
