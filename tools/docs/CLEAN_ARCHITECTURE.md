# Megan Omega Clean Architecture

## Objetivo
Consolidar a Megan em uma arquitetura simples e oficial, com uma única base principal para frontend e backend.

## Estrutura oficial

```text
megan/
├── backend/
├── frontend/
├── database/
├── deploy/
├── docs/
├── scripts/
├── .gitignore
├── .env.example
├── package.json
└── README.md
```

## O que foi removido da raiz oficial

Foram removidas da estrutura principal pastas legadas e paralelas que geravam duplicação arquitetural, como frontends e backends alternativos, módulos históricos e bases experimentais.

## Benefícios
- deploy mais simples
- Git mais limpo
- menos duplicação
- manutenção mais previsível
- valor percebido maior do projeto
