# Megan OS Unified Master 6.5

Pacote unificado da Megan OS com todos os módulos consolidados em uma única estrutura:

- Backend Node + Express na porta `10000`
- Frontend React + Vite
- Módulos 4.1 até 6.0 preservados
- Novo módulo 6.5 `Megan Operating Network`
- Base preparada para Render, Vercel e Supabase

## Estrutura

```text
megan/
  backend/
    src/
      app.js
      server.js
      modules/
  frontend/
    src/
      App.jsx
      features/
  database/
  deploy/
  docs/
  scripts/
```

## Rodar localmente

### Backend

```powershell
cd backend
npm install
npm run dev
```

Health check:

```powershell
Invoke-RestMethod http://localhost:10000/api/health
```

Novo módulo unificado:

```powershell
Invoke-RestMethod http://localhost:10000/api/operating-network/overview
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Acesse:

```text
http://localhost:5173
```

## Produção

- Backend: Render usando `backend/render.yaml` ou Root Directory `backend`
- Frontend: Vercel usando Root Directory `frontend`
- Variáveis: copiar `.env.example` e preencher chaves reais

## O que foi unificado

A entrega junta os blocos de autonomia, agentes, automação, autoempresa, copiloto pessoal, aprendizado contínuo, multicanal, voz, central global, ecossistema, marketplace de agentes, Business Cloud, Personal Life OS, Megan Voice, App Store, Megan Nation e Operating Network 6.5.
