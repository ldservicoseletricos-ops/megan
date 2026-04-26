const app = require('./app');
const port = Number(process.env.PORT || 10000);
app.listen(port, () => console.log(`[MEGAN_OS_27_UNIFICADO] backend online em http://localhost:${port}`));
