# Megan OS 24.0.1 — Pacote corrigido e estabilizado

## Melhorias aplicadas

- Corrigido `frontend/.env`, removendo chave Google Maps exposta e eliminando `VITE_API_URL` duplicado.
- Atualizado `frontend/.env.example` com placeholders seguros.
- Atualizado `backend/.env.example` com variáveis principais para Render, Supabase, Gemini, Stripe, Google Maps e SMTP.
- Corrigido `backend/package.json` com dependências necessárias usadas pelo código: `dotenv`, `multer`, `stripe`, `@supabase/supabase-js`, `cors`, `express`.
- Corrigido `frontend/package.json` com dependências necessárias usadas pelo código: `@supabase/supabase-js`, `leaflet`, `react-leaflet`, `recharts`, `react`, `react-dom`.
- Adicionados scripts de validação no `package.json` raiz, backend e frontend.
- Criados stubs seguros para serviços ausentes importados por `backend/src/ai-core/index.js`, evitando quebra por imports inexistentes.
- Mantida a estrutura original do projeto e módulos existentes, sem apagar o restante do sistema.

## Validações executadas

- ZIP original extraído com sucesso.
- `backend/src/app.js` validado com `node --check`.
- `backend/src/server.js` validado com `node --check`.
- `backend/package.json` validado como JSON.
- `frontend/package.json` validado como JSON.
- Imports ausentes do `backend/src/ai-core/index.js` corrigidos.

## Como instalar e rodar localmente

```powershell
cd megan
npm run install:all
npm run validate
npm run dev:backend
```

Em outro terminal:

```powershell
cd megan
npm run dev:frontend
```

## Observação importante

Não use `npm ci` neste pacote sem antes regenerar os `package-lock.json`, porque as dependências foram corrigidas no `package.json`. Use `npm install` para atualizar os locks automaticamente.
