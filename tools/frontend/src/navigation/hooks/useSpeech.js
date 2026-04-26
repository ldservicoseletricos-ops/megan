import { useEffect, useMemo, useState } from 'react';

export function useSpeech({ preferredLang = 'pt-BR', preferredVoiceNameIncludes = [] } = {}) {
  const [voices, setVoices] = useState([]);
  const [supported] = useState(Boolean(window.SpeechRecognition || window.webkitSpeechRecognition));

  useEffect(() => {
    if (!('speechSynthesis' in window)) return undefined;
    const updateVoices = () => setVoices(window.speechSynthesis.getVoices() || []);
    updateVoices();
    window.speechSynthesis.addEventListener?.('voiceschanged', updateVoices);
    return () => window.speechSynthesis.removeEventListener?.('voiceschanged', updateVoices);
  }, []);

  const preferredVoice = useMemo(() => {
    const lowerMatchers = preferredVoiceNameIncludes.map((item) => String(item).toLowerCase());
    return voices.find((voice) => {
      const name = String(voice?.name || '').toLowerCase();
      return voice?.lang?.toLowerCase().includes(preferredLang.toLowerCase()) && lowerMatchers.some((item) => name.includes(item));
    }) || voices.find((voice) => voice?.lang?.toLowerCase().includes(preferredLang.toLowerCase())) || null;
  }, [voices, preferredLang, preferredVoiceNameIncludes]);

  function listen(onResult) {
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) return;
    const recognition = new Ctor();
    recognition.lang = preferredLang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const text = event.results?.[0]?.[0]?.transcript || '';
      onResult?.(text);
    };
    recognition.start();
  }

  function speak(text, options = {}) {
    if (!('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = preferredLang;
    utter.rate = options.rate ?? 1;
    utter.pitch = options.pitch ?? 1;
    utter.volume = options.volume ?? 1;
    if (preferredVoice) utter.voice = preferredVoice;
    window.speechSynthesis.speak(utter);
  }

  return { supported, voices, preferredVoice, listen, speak };
}
