MEGAN MAX - FASE 5

Arquivos completos para colar:

Atualizar:
- backend/src/lib/store.js
- backend/src/routes/chat.route.js
- backend/src/routes/system.route.js
- backend/src/services/action-planner.service.js
- backend/src/server.js

Criar:
- backend/src/services/feature-flags.service.js
- backend/src/services/policy-engine.service.js
- backend/src/services/self-improve.service.js
- backend/src/services/rollback.service.js

Novos endpoints:
- GET /api/system
- GET /api/system/experiments
- PATCH /api/system/experiments/:id
- GET /api/system/flags
- PATCH /api/system/flags
- POST /api/system/rollback/:experimentId

O /api/chat agora também devolve:
- featureFlags
- selfImprovement
- experiments
