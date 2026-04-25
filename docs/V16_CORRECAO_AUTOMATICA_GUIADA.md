# Megan V16 - Correção automática guiada

## Backend
- `C:\megan\backend\package.json`
- `C:\megan\backend\.env`
- `C:\megan\backend\render.yaml`
- `C:\megan\backend\src\server.js`

## Frontend
- `C:\megan\frontend\package.json`
- `C:\megan\frontend\.env`
- `C:\megan\frontend\vercel.json`
- `C:\megan\frontend\src\App.jsx`

## Fluxo
1. Validar `.env`
2. Validar `/api/health`
3. Validar `/api/env-check`
4. Validar `/api/deploy-guide`
5. Validar `/api/final-check`
6. Validar `/api/auto-fix`
7. Aplicar correções sugeridas
