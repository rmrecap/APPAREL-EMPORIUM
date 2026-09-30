const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    outputFileTracingRoot: path.join(__dirname),

    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    output: 'standalone', // Required for Hostinger Node.js hosting
    images: {
        unoptimized: false, // Next.js image optimization
        // AVIF optimization disabled due to libheif/sharp remote code execution vulnerability (CVE-2026-75604 / GHSA-2xp9-vwfh-vxw4)
        formats: ['image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
            {
                protocol: 'http',
                hostname: '**',
            }
        ],
    },
    async headers() {
        return [
            // ── CORS for External API (Product Uploader Tool) ──────────────────
            // Allows any origin: local HTML files, Google AI Studio apps, external tools
            {
                source: '/api/external/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Credentials', value: 'true' },
                    { key: 'Access-Control-Allow-Origin', value: '*' },
                    { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS, PATCH, DELETE, POST, PUT' },
                    { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-api-key, x-secret-key, secret-key, api-key, authorization, Authorization, ngrok-skip-browser-warning' },
                    { key: 'Access-Control-Max-Age', value: '86400' },
                ],
            },
            {
                source: '/api/products/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Credentials', value: 'true' },
                    { key: 'Access-Control-Allow-Origin', value: '*' },
                    { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS, PATCH, DELETE, POST, PUT' },
                    { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-api-key, x-secret-key, secret-key, api-key, authorization, Authorization, ngrok-skip-browser-warning' },
                    { key: 'Access-Control-Max-Age', value: '86400' },
                ],
            },
            // ── Security Headers for all routes ───────────────────────────────
            {
                source: '/(.*)',
                headers: [
                    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
                    { key: 'X-XSS-Protection', value: '1; mode=block' },
                    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
                    {
                        key: 'Content-Security-Policy',
                        value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: blob: https:; font-src 'self' data: https:; connect-src 'self' https: wss:; frame-ancestors 'self'; object-src 'none'; base-uri 'self';"
                    },
                ],
            },
        ];
    },
    webpack: (config, { isServer, dev }) => {
        if (!isServer) {
            // Needed if using prisma/sqlite on frontend/browser components
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                path: false,
            };
        }

        // ── Fix: OOM crash prevention ────────────────────────────────────────
        // OneDrive sync + large webpack filesystem cache causes:
        //   "RangeError: Array buffer allocation failed"
        //   "Fatal process out of memory: Zone"
        // Prevent OneDrive file locking and ArrayBuffer/Zone allocation crash
        config.cache = false;

        return config;
    },
}

module.exports = nextConfig
