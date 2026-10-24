const fs = require('fs');
const path = require('path');

process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '3000';
process.env.HOSTNAME = process.env.HOSTNAME || '127.0.0.1';

const standaloneServer = path.join(__dirname, '.next', 'standalone', 'server.js');

if (fs.existsSync(standaloneServer)) {
  console.log('[BOOT] Starting Next.js Standalone Server from:', standaloneServer);
  require(standaloneServer);
} else {
  console.log('[BOOT] Next.js Standalone not found. Starting custom HTTP Next.js server on port:', process.env.PORT);
  const { createServer } = require('http');
  const { parse } = require('url');
  const next = require('next');

  const port = parseInt(process.env.PORT, 10);
  const hostname = process.env.HOSTNAME;
  const app = next({ dev: false, hostname, port });
  const handle = app.getRequestHandler();

  app.prepare()
    .then(() => {
      const server = createServer(async (req, res) => {
        try {
          const parsedUrl = parse(req.url, true);
          await handle(req, res, parsedUrl);
        } catch (err) {
          console.error('[HTTP ERROR]', req.method, req.url, err);
          res.statusCode = 500;
          res.end('Internal Server Error');
        }
      });

      server.once('error', (err) => {
        console.error('[SERVER FATAL ERROR]', err);
        process.exit(1);
      });

      server.listen(port, hostname, () => {
        console.log(`🚀 [READY] Next.js HTTP server listening on http://${hostname}:${port}`);
      });
    })
    .catch((err) => {
      console.error('[BOOT CRASH] Failed to prepare Next.js app:', err);
      process.exit(1);
    });
}

