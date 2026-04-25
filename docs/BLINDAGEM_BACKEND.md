# Blindagem do backend Megan

Arquivos ajustados:
- backend/package.json
- backend/.npmrc
- backend/.node-version
- backend/render.yaml
- deploy/render.yaml
- backend/src/server.js
- backend/server.js

Objetivo:
- reduzir risco de falha no build por npm
- fixar versão do Node no Render
- melhorar timeouts do servidor
- garantir shutdown limpo
- manter o serviço em porta 10000 com health check
