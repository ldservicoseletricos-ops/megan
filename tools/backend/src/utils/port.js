const net = require('net');

function isPortFree(port, host) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });

    server.listen(port, host);
  });
}

async function findAvailablePort(startPort, host) {
  const maxAttempts = 20;

  for (let offset = 0; offset < maxAttempts; offset += 1) {
    const currentPort = startPort + offset;
    const free = await isPortFree(currentPort, host);

    if (free) {
      return currentPort;
    }
  }

  throw new Error(`Nenhuma porta livre encontrada a partir de ${startPort}.`);
}

function formatBaseUrl(host, port) {
  const normalizedHost = host === '0.0.0.0' ? 'localhost' : host;
  return `http://${normalizedHost}:${port}`;
}

module.exports = {
  findAvailablePort,
  formatBaseUrl
};
