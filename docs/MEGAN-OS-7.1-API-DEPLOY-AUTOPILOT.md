# Megan OS 7.1 API Deploy Autopilot

Este pacote adiciona uma API real, supervisionada e segura para a Megan configurar e validar integrações com GitHub, Render, Vercel e Supabase.

## Arquivos adicionados

- `backend/src/modules/deploy-autopilot/deploy-api.service.js`
- `backend/src/modules/deploy-autopilot/deploy-api.routes.js`
- `backend/src/app.js` atualizado para registrar `/api/deploy-autopilot/api`
- `backend/.env.example` atualizado com as variáveis necessárias

## Endpoints principais

### Status seguro

`GET /api/deploy-autopilot/status`

Mostra plano, provedores e variáveis ausentes sem expor chaves.

### Configuração pública mascarada

`GET /api/deploy-autopilot/api/config`

Mostra configuração ativa com tokens mascarados.

### Checagem geral das APIs

`GET /api/deploy-autopilot/api/check`

Valida conexão com:

- GitHub
- Vercel
- Render
- Supabase

### Execução completa supervisionada

`POST /api/deploy-autopilot/api/full-setup`

Body sem executar:

```json
{
  "confirm": false
}
```

Body para executar chamadas reais:

```json
{
  "confirm": true,
  "triggerDeploy": false
}
```

Para disparar deploy no Render também:

```json
{
  "confirm": true,
  "triggerDeploy": true
}
```

## GitHub

- `GET /api/deploy-autopilot/api/github/check`
- `POST /api/deploy-autopilot/api/github/repo`

Criar repositório:

```json
{
  "name": "megan-os",
  "privateRepo": true,
  "description": "Megan OS"
}
```

## Vercel

- `GET /api/deploy-autopilot/api/vercel/check`
- `GET /api/deploy-autopilot/api/vercel/projects`
- `POST /api/deploy-autopilot/api/vercel/project`
- `POST /api/deploy-autopilot/api/vercel/env`

Criar projeto Vercel:

```json
{
  "name": "megan-os-frontend",
  "framework": "vite",
  "rootDirectory": "frontend"
}
```

Criar variável Vercel:

```json
{
  "key": "VITE_API_URL",
  "value": "https://seu-backend.onrender.com",
  "target": ["production", "preview", "development"]
}
```

## Render

- `GET /api/deploy-autopilot/api/render/check`
- `GET /api/deploy-autopilot/api/render/services`
- `POST /api/deploy-autopilot/api/render/deploy`

Disparar deploy:

```json
{
  "serviceId": "srv_xxxxxxxxx"
}
```

## Supabase

- `GET /api/deploy-autopilot/api/supabase/check`
- `GET /api/deploy-autopilot/api/supabase/projects`

## Segurança

- Nenhuma chave secreta é retornada inteira.
- A execução completa exige `confirm: true`.
- A Megan registra histórico local em `backend/data/deploy-autopilot-state.json`.
- Criação de recursos externos só acontece nos endpoints POST específicos.

## Como testar local

No PowerShell, dentro de `backend`:

```powershell
npm install
npm run dev
```

Teste:

```powershell
Invoke-RestMethod http://localhost:10000/api/deploy-autopilot/api/config
Invoke-RestMethod http://localhost:10000/api/deploy-autopilot/api/check
```
