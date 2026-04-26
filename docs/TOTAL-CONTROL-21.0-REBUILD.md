# Megan OS 21.0 Total Control Chat Core — REBUILD

Pacote refeito do zero a partir da base 19.0 validada.

## O que foi adicionado

- Backend: `backend/src/modules/total-control-chat-21/`
- Rota: `POST /api/total-control-21/chat`
- Status real: `GET /api/total-control-21/status`
- Auditoria rápida: `GET /api/total-control-21/audit`
- Tarefas: `GET/POST /api/total-control-21/tasks`
- Frontend: `frontend/src/features/totalControl21/`
- Aba: `Total Control Chat 21.0`

## Segurança operacional

O chat interpreta comandos livres, consulta o sistema e cria tarefas. Ações críticas de terminal são propostas e exigem aprovação humana pelo painel antes de executar.

## Comandos úteis

```powershell
cd C:\megan\backend
npm install
npm start
```

```powershell
cd C:\megan\frontend
npm install
npm run dev
```
