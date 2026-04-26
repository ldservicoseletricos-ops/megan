# MEGAN OS 28.0 — Chat Central + Memória + Tempo Real

Este pacote preserva os módulos de fase anteriores, mantém o Dev Studio 27.0 e adiciona a camada 28.0.

## Adicionado

- Frontend: `megan/frontend/src/features/chatCentral28/ChatCentral28Page.jsx`
- Frontend API: `megan/frontend/src/features/chatCentral28/chatCentral28Api.js`
- Backend: `megan/backend/src/routes/chat-central-28.routes.js`
- Rota: `GET /api/chat-central-28/status`
- Rota: `GET /api/chat-central-28/memory`
- Rota: `POST /api/chat-central-28/message`

## Mantido

- Todos os módulos de fase existentes no App.jsx
- Dev Studio 27.0
- Backend com carregamento seguro `safeUse`
- Frontend premium organizado

## Rodar local

```powershell
cd C:\meganackend
npm install
npm run dev
```

```powershell
cd C:\meganrontend
npm install
npm run dev
```

## Testes rápidos

```powershell
Invoke-RestMethod http://localhost:10000/api/health
Invoke-RestMethod http://localhost:10000/api/chat-central-28/status
```
