# Megan OS 7.3 — Painel de Integrações Real

Esta versão adiciona configuração direta no painel para GitHub, Render, Vercel, Supabase, Google/Gemini e Stripe.

## Onde aparece no painel

Sidebar da Megan:

- Deploy Autopilot 7.0

Dentro da tela foi adicionada a aba:

- Integrações
- Deploy 1 clique
- Histórico

## Como usar

1. Abra o painel da Megan.
2. Entre em Deploy Autopilot 7.0.
3. Abra a aba Integrações.
4. Clique em Configurar no painel no serviço desejado.
5. Cole o token/API Key.
6. Salve.
7. Clique em Testar.

## Segurança

Os tokens não ficam no frontend.
Eles são enviados ao backend e salvos criptografados em:

backend/data/deploy-autopilot/integrations.secure.json

A chave de criptografia usa MEGAN_SECRET_KEY ou JWT_SECRET.

## Endpoints adicionados

GET /api/deploy-autopilot/api/integrations
POST /api/deploy-autopilot/api/integrations/:provider
DELETE /api/deploy-autopilot/api/integrations/:provider
POST /api/deploy-autopilot/api/integrations/:provider/test
GET /api/deploy-autopilot/api/integrations/env-template

## Arquivos principais alterados

backend/src/modules/deploy-autopilot/integrations-store.service.js
backend/src/modules/deploy-autopilot/deploy-api.routes.js
frontend/src/features/deployAutopilot/DeployAutopilotPage.jsx
frontend/src/styles.css
