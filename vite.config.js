import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { handleAskAiRequest } from './server/geminiService.js';
import { handleAdminRequest } from './server/adminService.js';

function askAiApiPlugin() {
  return {
    name: 'ask-ai-api-middleware',
    configureServer(server) {
      server.middlewares.use('/api/ask-ai', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Method Not Allowed' }));
          return;
        }

        let body = '';
        req.on('data', chunk => {
          body += chunk;
        });

        req.on('end', async () => {
          res.setHeader('Content-Type', 'application/json');
          try {
            const parsed = JSON.parse(body || '{}');
            const { action, payload } = parsed;

            // Load environment variable securely on the server
            const env = loadEnv('development', process.cwd(), '');
            const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

            if (!apiKey) {
              res.statusCode = 500;
              res.end(JSON.stringify({
                success: false,
                error: 'GEMINI_API_KEY is not configured in the server environment. Please ensure GEMINI_API_KEY is defined in your .env file.'
              }));
              return;
            }

            const result = await handleAskAiRequest(action, payload, apiKey);
            res.statusCode = 200;
            res.end(JSON.stringify(result));
          } catch (err) {
            console.error('Ask AI server error:', err?.message || err);
            res.statusCode = 500;
            res.end(JSON.stringify({
              success: false,
              error: err?.message || 'AI explanation is temporarily unavailable. Please try again.'
            }));
          }
        });
      });
    }
  };
}

function adminApiPlugin() {
  return {
    name: 'admin-api-middleware',
    configureServer(server) {
      server.middlewares.use('/api/admin', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Method Not Allowed' }));
          return;
        }

        let body = '';
        req.on('data', chunk => {
          body += chunk;
        });

        req.on('end', async () => {
          res.setHeader('Content-Type', 'application/json');
          try {
            const parsed = JSON.parse(body || '{}');
            const { action, payload } = parsed;

            const env = loadEnv('development', process.cwd(), '');
            const apiKey = env.INSFORGE_API_KEY || process.env.INSFORGE_API_KEY;
            const baseUrl = env.VITE_INSFORGE_URL || process.env.VITE_INSFORGE_URL || 'https://3g2ha7rp.ap-southeast.insforge.app';

            if (!apiKey) {
              res.statusCode = 500;
              res.end(JSON.stringify({
                success: false,
                error: 'INSFORGE_API_KEY is not configured in the server environment (.env).'
              }));
              return;
            }

            const authHeader = req.headers['authorization'];
            const result = await handleAdminRequest(action, payload, authHeader, { baseUrl, apiKey });
            res.statusCode = 200;
            res.end(JSON.stringify(result));
          } catch (err) {
            console.error('Admin API dev server error:', err?.message || err);
            const status = err.statusCode || 500;
            res.statusCode = status;
            res.end(JSON.stringify({
              success: false,
              error: err?.message || 'Admin operation failed.'
            }));
          }
        });
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), askAiApiPlugin(), adminApiPlugin()],
  server: {
    port: 5173,
    host: true
  }
});

