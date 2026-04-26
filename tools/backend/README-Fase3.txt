FASE 3 - MEGAN MAX

Arquivos completos para colar por cima da Fase 2:

Atualizar:
- backend/src/routes/chat.route.js
- backend/src/services/action-planner.service.js
- backend/src/services/action-executor.service.js

Criar:
- backend/src/services/action-queue.service.js
- backend/src/services/replanner.service.js

O que muda:
- planner multi-etapas
- fila de execução
- replanejamento simples
- queue e queueSummary no retorno de /api/chat
- passos bloqueados, prontos, concluídos e falhos
