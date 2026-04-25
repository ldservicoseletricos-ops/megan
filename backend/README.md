# V14 Auth Backend

Adicionar no `backend/src/app.js`:

```js
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);
```

Rotas:
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/session
