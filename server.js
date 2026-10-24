const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT || '3000', 10);
const hostname = '0.0.0.0';

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

console.log(`[BOOT] Initializing Next.js (dev=${dev}) on ${hostname}:${port}...`);

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
