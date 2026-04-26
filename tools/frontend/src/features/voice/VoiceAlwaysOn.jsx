import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRecognition, hasWakeWord, isVoiceSupported, removeWakeWord, speak } from '../../services/voiceService';
import './voice.css';

const ACKNOWLEDGEMENTS = [
  'Oi Luiz, estou ouvindo.',
  'Pode falar, Luiz.',
  'Pronta, Luiz. O que você precisa?',
  'Estou aqui, pode mandar.',
  'Sim, Luiz. Fala comigo.',
];

function pickNaturalReply() {
  return ACKNOWLEDGEMENTS[Math.floor(Math.random() * ACKNOWLEDGEMENTS.length)];
}

function isExecutiveCommand(command) {
  const text = String(command || '').toLowerCase();
  return ['resumo', 'projeto', 'tarefas', 'pendentes', 'realizar', 'executar', 'prioridades'].some((word) => text.includes(word));
}

async function sendCommandToMegan(command) {
  const apiBase = import.meta.env.VITE_API_URL || '';
  const endpoint = isExecutiveCommand(command)
    ? `${apiBase}/api/executive-operator/voice-command`
    : `${apiBase}/api/chat`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        message: command,
        command,
        source: 'voice-always-on',
        user: 'Luiz',
      }),
    });

    if (!response.ok) {
      return 'Recebi o comando, mas a API da Megan não respondeu corretamente.';
    }

    const data = await response.json().catch(() => ({}));
    return data.reply || data.message || data.response || 'Comando recebido pela Megan.';
  } catch (error) {
    console.warn('[Megan Voice] API indisponível:', error.message);
    return `Entendi: ${command}. A conexão com a API ainda precisa ser validada.`;
  }
}

export default function VoiceAlwaysOn() {
  const supported = useMemo(() => isVoiceSupported(), []);
  const recognitionRef = useRef(null);
  const shouldListenRef = useRef(false);
  const commandModeRef = useRef(false);
  const processingRef = useRef(false);

  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState('desligado');
  const [lastHeard, setLastHeard] = useState('');
  const [lastCommand, setLastCommand] = useState('');

  useEffect(() => {
    if (!supported) return undefined;

    recognitionRef.current = createRecognition({
      onResult: async (transcript) => {
        const text = String(transcript || '').trim();
        if (!text) return;

        setLastHeard(text);

        if (processingRef.current) return;

        if (hasWakeWord(text)) {
          const possibleCommand = removeWakeWord(text);
          commandModeRef.current = true;
          const reply = pickNaturalReply();
          setStatus('ativada');
          speak(reply);

          if (possibleCommand.length > 4) {
            processingRef.current = true;
            setLastCommand(possibleCommand);
            const meganReply = await sendCommandToMegan(possibleCommand);
            speak(meganReply);
            processingRef.current = false;
            commandModeRef.current = false;
            setStatus('escutando');
          }
          return;
        }

        if (commandModeRef.current) {
          processingRef.current = true;
          setStatus('processando');
          setLastCommand(text);
          const meganReply = await sendCommandToMegan(text);
          speak(meganReply);
          processingRef.current = false;
          commandModeRef.current = false;
          setStatus('escutando');
        }
      },
      onError: (event) => {
        console.warn('[Megan Voice] erro:', event?.error || event);
        if (event?.error === 'not-allowed') {
          shouldListenRef.current = false;
          setEnabled(false);
          setStatus('microfone bloqueado');
        }
      },
      onEnd: () => {
        if (shouldListenRef.current) {
          try {
            recognitionRef.current?.start();
          } catch (error) {
            console.warn('[Megan Voice] reinício ignorado:', error.message);
          }
        }
      },
    });

    return () => {
      shouldListenRef.current = false;
      recognitionRef.current?.stop?.();
    };
  }, [supported]);

  const toggleVoice = () => {
    if (!supported) {
      setStatus('navegador incompatível');
      return;
    }

    if (enabled) {
      shouldListenRef.current = false;
      commandModeRef.current = false;
      setEnabled(false);
      setStatus('desligado');
      recognitionRef.current?.stop?.();
      window.speechSynthesis?.cancel?.();
      return;
    }

    try {
      shouldListenRef.current = true;
      setEnabled(true);
      setStatus('escutando');
      recognitionRef.current?.start?.();
      speak('Modo voz ativado. Diga Ok Megan ou Oi Megan.');
    } catch (error) {
      console.warn('[Megan Voice] não iniciou:', error.message);
      setStatus('erro ao iniciar');
      setEnabled(false);
      shouldListenRef.current = false;
    }
  };

  return (
    <section className={`voice-always-on ${enabled ? 'is-enabled' : ''}`}>
      <div className="voice-orb" aria-hidden="true">
        <span />
      </div>

      <div className="voice-copy">
        <strong>🎙️ Megan Voice 9.5</strong>
        <span>{status}</span>
        <small>{enabled ? 'Diga “Ok Megan” ou “Oi Megan”.' : 'Ative para escuta contínua no navegador.'}</small>
        {lastHeard ? <em>Ouvido: {lastHeard}</em> : null}
        {lastCommand ? <em>Último comando: {lastCommand}</em> : null}
      </div>

      <button type="button" className="voice-toggle" onClick={toggleVoice}>
        {enabled ? 'Desligar voz' : 'Ativar voz'}
      </button>
    </section>
  );
}
