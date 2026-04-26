import { useEffect, useMemo, useState } from 'react';
import { Code2, Cpu, Palette, Rocket, Sparkles, Wand2 } from 'lucide-react';
import { apiGet, apiPost } from '../../lib/api.js';
import './devstudio.css';

const cards = [
  { id: 'site', title: 'Criar Site', icon: Sparkles, text: 'Landing pages, páginas institucionais, páginas de venda e portais.' },
  { id: 'app', title: 'Criar App', icon: Cpu, text: 'Aplicativos web/mobile com telas, fluxo, backend e próximos passos.' },
  { id: 'api', title: 'Criar API', icon: Code2, text: 'Rotas, serviços, validações, logs, banco de dados e segurança.' },
  { id: 'design', title: 'Criar Design', icon: Palette, text: 'Interfaces premium, cards, dashboards, logos e organização visual.' },
  { id: 'prompt', title: 'Prompt Lab', icon: Wand2, text: 'Prompts profissionais para código, imagem, livro, campanha e produto.' },
  { id: 'deploy', title: 'Publicar Online', icon: Rocket, text: 'Checklist Render, Vercel, Supabase, GitHub e variáveis de ambiente.' }
];

const defaultObjective = 'Criar uma área de desenvolvimento e criação dentro da Megan OS';

export default function DevStudioPanel() {
  const [activeType, setActiveType] = useState('site');
  const [objective, setObjective] = useState(defaultObjective);
  const [status, setStatus] = useState(null);
  const [plan, setPlan] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const activeCard = useMemo(() => cards.find((card) => card.id === activeType) || cards[0], [activeType]);

  useEffect(() => {
    apiGet('/api/dev-studio/status')
      .then(setStatus)
      .catch(() => setStatus({ ok: false, name: 'Dev Studio local', capabilities: ['Modo frontend ativo'] }));
  }, []);

  async function handleGeneratePlan() {
    setLoading(true);
    setError('');
    try {
      const data = await apiPost('/api/dev-studio/plan', { type: activeType, objective });
      setPlan(data);
    } catch (err) {
      setError('Nao foi possivel conectar ao backend. Verifique se ele esta rodando na porta 10000.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGeneratePrompt() {
    setLoading(true);
    setError('');
    try {
      const data = await apiPost('/api/dev-studio/prompt', {
        target: objective,
        style: 'premium, futurista, organizado, responsivo e pronto para produção'
      });
      setPrompt(data.prompt);
    } catch (err) {
      setError('Nao foi possivel gerar o prompt pelo backend.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="devstudio-shell">
      <div className="devstudio-hero">
        <div>
          <span className="devstudio-kicker">MEGAN OS 27.0</span>
          <h1>Dev Studio Real Completo</h1>
          <p>
            Área central para criar sistemas, apps, sites, designs, prompts e planos de deploy dentro da Megan OS.
          </p>
        </div>
        <div className="devstudio-status-card">
          <strong>{status?.name || 'Conectando Dev Studio...'}</strong>
          <span>{status?.ok ? 'Backend ativo' : 'Modo visual ativo'}</span>
          <small>{status?.version ? `Versão ${status.version}` : 'Preparado para integração'}</small>
        </div>
      </div>

      <div className="devstudio-grid">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              type="button"
              key={card.id}
              className={`devstudio-card ${activeType === card.id ? 'active' : ''}`}
              onClick={() => setActiveType(card.id)}
            >
              <Icon size={24} />
              <strong>{card.title}</strong>
              <span>{card.text}</span>
            </button>
          );
        })}
      </div>

      <div className="devstudio-workbench">
        <div className="devstudio-builder">
          <span className="devstudio-kicker">Módulo ativo</span>
          <h2>{activeCard.title}</h2>
          <label htmlFor="objective">Objetivo</label>
          <textarea
            id="objective"
            value={objective}
            onChange={(event) => setObjective(event.target.value)}
            rows={5}
          />
          <div className="devstudio-actions">
            <button type="button" onClick={handleGeneratePlan} disabled={loading}>
              {loading ? 'Gerando...' : 'Gerar plano'}
            </button>
            <button type="button" className="secondary" onClick={handleGeneratePrompt} disabled={loading}>
              Gerar prompt premium
            </button>
          </div>
          {error && <p className="devstudio-error">{error}</p>}
        </div>

        <div className="devstudio-output">
          <h3>Plano de execução</h3>
          {plan?.plan?.length ? (
            <ol>
              {plan.plan.map((item) => (
                <li key={item.order}>
                  <strong>{item.title}</strong>
                  <span>{item.action}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="muted">Escolha um módulo e gere um plano para a Megan executar.</p>
          )}

          {prompt && (
            <div className="devstudio-prompt-box">
              <strong>Prompt gerado</strong>
              <p>{prompt}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
