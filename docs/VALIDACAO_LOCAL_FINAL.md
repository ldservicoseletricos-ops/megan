# Validação local final da Megan Consolidada

## Estrutura oficial
- `backend/` = API oficial
- `frontend/` = painel oficial

## 1. Backend
No PowerShell:

```powershell
cd backend
copy .env.example .env
npm install
npm start
```

Validações rápidas:

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:10000/api/health"
Invoke-RestMethod -Method Get -Uri "http://localhost:10000/api/master/overview"
Invoke-RestMethod -Method Post -Uri "http://localhost:10000/api/master/run-cycle"
```

## 2. Frontend
Em outro PowerShell:

```powershell
cd frontend
copy .env.example .env
npm install
npm run dev
```

Abrir:
- `http://localhost:5173`

## 3. Build do frontend
```powershell
cd frontend
npm run build
```

## 4. Deploy
- Render: usar `backend/render.yaml`
- Vercel: usar `frontend/vercel.json`
- Variáveis de ambiente: `deploy/env/`
