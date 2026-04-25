# Megan OS 8.0 Self Infrastructure AI

Central de infraestrutura autônoma supervisionada.

## O que foi adicionado

- Backend: `backend/src/modules/self-infrastructure/`
- Frontend: `frontend/src/features/selfInfrastructure/SelfInfrastructurePage.jsx`
- Rota API: `/api/self-infrastructure`
- Painel: aba `Self Infrastructure 8.0`

## Funções

- Verificar GitHub, Render, Vercel, Supabase, Google/Gemini e Stripe.
- Criar plano de correção.
- Executar correções seguras.
- Ativar ou pausar monitoramento.
- Registrar histórico operacional.

## Rotas principais

- `GET /api/self-infrastructure/dashboard`
- `POST /api/self-infrastructure/scan`
- `GET /api/self-infrastructure/repair-plan`
- `POST /api/self-infrastructure/repair-all`
- `POST /api/self-infrastructure/monitor`

## Segurança

A Megan usa os tokens salvos no Painel de Integrações 7.3/7.4. Os tokens continuam protegidos pelo backend e criptografados usando `MEGAN_SECRET_KEY` ou `JWT_SECRET`.
