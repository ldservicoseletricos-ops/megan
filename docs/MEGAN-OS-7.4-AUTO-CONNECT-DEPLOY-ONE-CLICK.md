# Megan OS 7.4 — Auto Connect + Deploy One Click

Esta versão adiciona o fluxo visual para conectar integrações e publicar projeto pelo painel.

## Onde fica

Frontend:

`frontend/src/features/deployAutopilot/DeployAutopilotPage.jsx`

Backend:

`backend/src/modules/deploy-autopilot/one-click-deploy.service.js`
`backend/src/modules/deploy-autopilot/one-click-deploy.routes.js`

App:

`backend/src/app.js`

## Endpoints novos

`GET /api/deploy-autopilot/one-click/status`
`POST /api/deploy-autopilot/one-click/plan`
`POST /api/deploy-autopilot/one-click/run`

## Fluxo

1. Conectar GitHub, Render, Vercel e Supabase no painel.
2. Abrir Deploy Center.
3. Entrar na aba Deploy 1 clique.
4. Clicar em Validar tudo.
5. Clicar em Publicar agora.

## Segurança

O modo é supervisionado. Ele valida tokens, monta o plano, registra histórico e prepara links finais. A execução externa real depende das permissões e dos IDs de cada plataforma.
