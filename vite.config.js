import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import crypto from 'node:crypto';

export default defineConfig(({ mode }) => {
  // Load ALL env vars (including non-VITE_ ones) so the dev auth middleware
  // can read APP_USERNAME / APP_PASSWORD / APP_SECRET from .env
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'local-auth-api',
        configureServer(server) {
          server.middlewares.use('/api/auth', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.end('Method not allowed');
              return;
            }

            const chunks = [];
            for await (const chunk of req) chunks.push(chunk);
            let body;
            try {
              body = JSON.parse(Buffer.concat(chunks).toString());
            } catch {
              res.statusCode = 400;
              res.setHeader('content-type', 'application/json');
              res.end(JSON.stringify({ error: 'Invalid request body' }));
              return;
            }

            const { username, password } = body;

            if (!env.APP_USERNAME || !env.APP_PASSWORD || !env.APP_SECRET) {
              res.statusCode = 503;
              res.setHeader('content-type', 'application/json');
              res.end(JSON.stringify({ error: 'AUTH_NOT_CONFIGURED' }));
              return;
            }

            if (username !== env.APP_USERNAME || password !== env.APP_PASSWORD) {
              res.statusCode = 401;
              res.setHeader('content-type', 'application/json');
              res.end(JSON.stringify({ error: 'INVALID_CREDENTIALS' }));
              return;
            }

            const token = crypto
              .createHmac('sha256', env.APP_SECRET)
              .update(`${username}:${password}`)
              .digest('base64');

            res.statusCode = 200;
            res.setHeader('content-type', 'application/json');
            res.end(JSON.stringify({ token }));
          });
        },
      },
    ],
    server: {
      port: 5173,
      open: true,
      proxy: {
        '/anthropic': {
          target: 'https://api.anthropic.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/anthropic/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.removeHeader('origin');
              proxyReq.removeHeader('referer');
            });
          },
        },
      },
    },
  };
});
