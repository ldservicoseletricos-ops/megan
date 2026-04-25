# Megan OS 7.0 Deploy Autopilot

Central supervisionada para preparar GitHub, Render, Vercel, Supabase, Google/Gemini, Stripe e variáveis essenciais.

## Arquivos adicionados

- `backend/src/modules/deploy-autopilot/deploy-autopilot.routes.js`
- `backend/src/modules/deploy-autopilot/deploy-autopilot.service.js`
- `frontend/src/features/deployAutopilot/DeployAutopilotPage.jsx`
- `tools/deploy-autopilot/deploy-autopilot.env.example`
- `tools/deploy-autopilot/setup-deploy-autopilot.ps1`
- `tools/deploy-autopilot/preflight-deploy-autopilot.ps1`

## Endpoints

- `GET /api/deploy-autopilot/status`
- `GET /api/deploy-autopilot/providers`
- `GET /api/deploy-autopilot/plan`
- `GET /api/deploy-autopilot/env-template`
- `POST /api/deploy-autopilot/run`

## Operação

1. Copie `tools/deploy-autopilot/deploy-autopilot.env.example` para `backend/.env`.
2. Preencha as chaves no seu computador ou nas plataformas.
3. Rode `powershell -ExecutionPolicy Bypass -File tools/deploy-autopilot/preflight-deploy-autopilot.ps1`.
4. Abra o frontend e entre no módulo `Deploy Autopilot 7.0`.

