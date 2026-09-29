/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    output: 'standalone', // Required for Hostinger Node.js hosting
    images: {
        unoptimized: false, // Re-enable Next.js image optimization
        formats: ['image/avif', 'image/webp'],
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
                    { key: 'Access-Control-Allow-Origin', value: '*' },
                    { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
                    { key: 'Access-Control-Allow-Headers', value: 'Content-Type, x-api-key, Authorization' },
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
        // Solution: use in-memory cache in dev (no disk writes, no file locks).
        if (dev) {
            config.cache = { type: 'memory' };
        }

        return config;
    },
}

module.exports = nextConfig
