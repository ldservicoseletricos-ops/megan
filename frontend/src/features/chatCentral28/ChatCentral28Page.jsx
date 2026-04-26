import React, { useEffect, useMemo, useState } from 'react';
import { getChatCentral28Status, sendChatCentral28Message } from './chatCentral28Api';

const quickCommands = [
  'Megan, qual o status do sistema em tempo real?',
  'Megan, criar um projeto novo no Dev Studio',
  'Megan, corrigir erro mantendo todos os módulos',
  'Megan, mostrar memória ativa do projeto'
];

export default function ChatCentral28Page() {
  const [status, setStatus] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Megan OS 28.0 online. Envie um comando para controlar criação, memória, diagnóstico, Dev Studio, deploy ou módulos de fase.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function loadStatus() {
    try {
      const data = await getChatCentral28Status();
      setStatus(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Não foi possível carregar o status em tempo real.');
    }
  }

  useEffect(() => {
    loadStatus();
    const timer = window.setInterval(loadStatus, 8000);
    return () => window.clearInterval(timer);
  }, []);

  const memoryItems = useMemo(() => {
    return status?.memory?.lastActions || [];
  }, [status]);

  async function submitMessage(nextMessage = input) {
    const text = String(nextMessage || '').trim();
    if (!text || loading) return;

    setMessages((current) => [...current, { role: 'user', text }]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const data = await sendChatCentral28Message(text);
      setMessages((current) => [...current, { role: 'assistant', text: data.answer }]);
      setStatus((current) => ({ ...(current || {}), memory: data.memory, ...data.realtime }));
    } catch (err) {
      const message = err.message || 'Falha ao enviar comando para a Megan.';
      setError(message);
      setMessages((current) => [...current, { role: 'assistant', text: message }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chat28-page">
      <section className="chat28-hero premium-glass">
        <div>
          <span className="omega-kicker">MEGAN OS 28.0</span>
          <h2>Chat Central Inteligente</h2>
          <p>Controle único para criação, memória, diagnóstico, tempo real, Dev Studio e módulos de fase preservados.</p>
        </div>

        <div className="chat28-status-grid">
          <article>
            <span>Status</span>
            <strong>{status?.status || 'carregando'}</strong>
          </article>
          <article>
            <span>Módulos</span>
            <strong>{status?.modulesOnline || 0}</strong>
          </article>
          <article>
            <span>Uptime</span>
            <strong>{status?.uptimeSeconds || 0}s</strong>
          </article>
        </div>
      </section>

      <section className="chat28-grid">
        <div className="chat28-console premium-glass">
          <div className="chat28-messages">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`chat28-message ${message.role}`}>
                <span>{message.role === 'user' ? 'Luiz' : 'Megan'}</span>
                <p>{message.text}</p>
              </div>
            ))}
            {loading && <div className="chat28-thinking">Megan analisando comando...</div>}
          </div>

          <form
            className="chat28-input-row"
            onSubmit={(event) => {
              event.preventDefault();
              submitMessage();
            }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Digite: Megan cria app, Megan corrige erro, Megan mostra status..."
            />
            <button type="submit" disabled={loading}>Enviar</button>
          </form>

          {error && <p className="chat28-error">{error}</p>}
        </div>

        <aside className="chat28-side-stack">
          <div className="chat28-card premium-glass">
            <h3>Comandos rápidos</h3>
            <div className="chat28-command-list">
              {quickCommands.map((command) => (
                <button key={command} type="button" onClick={() => submitMessage(command)}>
                  {command}
                </button>
              ))}
            </div>
          </div>

          <div className="chat28-card premium-glass">
            <h3>Memória ativa</h3>
            <p>{status?.memory?.activeGoal || 'Aguardando memória do backend.'}</p>
            <ul>
              {memoryItems.slice(0, 5).map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>

          <div className="chat28-card premium-glass">
            <h3>Módulos monitorados</h3>
            <div className="chat28-module-list">
              {(status?.modules || []).map((item) => (
                <span key={item.id}><i />{item.label}</span>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
