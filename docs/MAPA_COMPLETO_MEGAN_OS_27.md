# Mapa Completo — Megan OS 27.0 Dev Studio Real Completo

## 1. Núcleo
- Megan OS 27.0
- Frontend React/Vite
- Backend Node.js/Express
- Módulo central: Dev Studio

## 2. Área de Desenvolvimento e Criação
Local: `frontend/src/components/devstudio/`

Arquivos:
- `DevStudioPanel.jsx`
- `devstudio.css`

Funções:
- Criar sites
- Criar apps
- Criar APIs
- Criar design
- Criar prompts
- Planejar deploy

## 3. Backend Dev Studio
Local: `backend/src/`

Arquivos:
- `routes/devStudio.route.js`
- `services/devStudio.service.js`

Rotas:
- `GET /api/dev-studio/status`
- `POST /api/dev-studio/plan`
- `POST /api/dev-studio/prompt`

## 4. Fluxo do Sistema
1. Usuário abre o frontend.
2. Entra na aba Dev Studio.
3. Escolhe Site, App, API, Design, Prompt ou Deploy.
4. Escreve o objetivo.
5. Frontend envia para o backend.
6. Backend devolve plano estruturado.
7. Megan exibe os próximos passos.

## 5. Próximas Evoluções Recomendadas
- Conectar com Gemini real.
- Criar geração de arquivos automaticamente.
- Integrar GitHub.
- Integrar Render/Vercel.
- Integrar Supabase.
- Adicionar histórico de criações.
- Transformar plano em tarefas executáveis.
