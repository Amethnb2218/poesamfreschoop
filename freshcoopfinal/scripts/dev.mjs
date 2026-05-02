import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const apiEntry = path.join(rootDir, 'server', 'index.js');
const preferredApiPort = Number(process.env.FRESCOOP_API_PORT || '4174');
const apiPort = await findAvailablePort(preferredApiPort);
const devEnv = { ...process.env, FRESCOOP_API_PORT: String(apiPort) };

if (apiPort !== preferredApiPort) {
  console.log(`Port API ${preferredApiPort} occupe, utilisation de ${apiPort}.`);
}

const api = spawn(process.execPath, [apiEntry, '--api-only'], {
  stdio: 'inherit',
  cwd: rootDir,
  env: devEnv,
});

let vite;
if (process.platform === 'win32') {
  vite = spawn('cmd.exe', ['/c', 'npx vite --host 0.0.0.0'], {
    stdio: 'inherit',
    cwd: rootDir,
    env: devEnv,
  });
} else {
  vite = spawn('npx', ['vite', '--host', '0.0.0.0'], {
    stdio: 'inherit',
    cwd: rootDir,
    env: devEnv,
  });
}

function shutdown(signal) {
  api.kill(signal);
  vite?.kill(signal);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

api.on('exit', (code) => {
  if (code && !vite.killed) vite.kill('SIGTERM');
});

vite.on('exit', (code) => {
  if (code && !api.killed) api.kill('SIGTERM');
  process.exit(code || 0);
});

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, '0.0.0.0');
  });
}

async function findAvailablePort(startPort) {
  for (let port = startPort; port < startPort + 25; port += 1) {
    if (await isPortAvailable(port)) return port;
  }
  throw new Error(`Aucun port API libre entre ${startPort} et ${startPort + 24}`);
}
