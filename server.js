const path = require('path');

process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '3000';
process.env.HOSTNAME = process.env.HOSTNAME || '127.0.0.1';

console.log(`[BOOT] Launching Next.js production server on http://${process.env.HOSTNAME}:${process.env.PORT}...`);

process.argv = [
  process.execPath,
  require.resolve('next/dist/bin/next'),
  'start',
  '-p',
  process.env.PORT,
  '-H',
  process.env.HOSTNAME,
];

require('next/dist/bin/next');



