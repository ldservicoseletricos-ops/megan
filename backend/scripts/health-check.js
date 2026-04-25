const http = require('http');

const port = Number(process.env.PORT || 10000);
const request = http.request(
  {
    host: '127.0.0.1',
    port,
    path: '/api/health',
    method: 'GET',
    timeout: 3000,
  },
  (response) => {
    let raw = '';
    response.on('data', (chunk) => {
      raw += chunk;
    });
    response.on('end', () => {
      console.log(raw || `status=${response.statusCode}`);
      process.exit(response.statusCode === 200 ? 0 : 1);
    });
  }
);

request.on('timeout', () => {
  console.error('Health check expirou.');
  request.destroy();
  process.exit(1);
});

request.on('error', (error) => {
  console.error(`Health check falhou: ${error.message}`);
  process.exit(1);
});

request.end();
