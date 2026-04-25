# Megan OS 7.0 Deploy Autopilot

Objetivo: permitir que a Megan configure e acompanhe automaticamente o ciclo de deploy do projeto.

## Plataformas previstas

- GitHub: repositório, branch, commit e push.
- Supabase: banco PostgreSQL e variáveis de conexão.
- Render: backend Node.js.
- Vercel: frontend React/Vite.
- Google/Gemini: IA, mapas e OAuth.
- Stripe: planos e pagamentos.

## Modo seguro

A versão adicionada é supervisionada. Ela valida variáveis, mostra o plano, registra histórico e prepara execução. Para executar chamadas reais nas plataformas, as chaves precisam ser preenchidas nas variáveis de ambiente.

## Frontend

Novo módulo: `Deploy Autopilot 7.0`.

## Backend

Novo prefixo de API: `/api/deploy-autopilot`.

