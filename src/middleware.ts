import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { canAccessRoute, Role } from '@/lib/permissions';

export async function middleware(req: NextRequest) {
    // ── PRIORITY 0: Block CVE-2025-29927 (Next.js Middleware Auth Bypass) ───────
    // Prevent spoofed internal subrequest headers from bypassing middleware authentication.
    if (req.headers.has('x-middleware-subrequest')) {
        return new NextResponse('Access Denied: Malformed Subrequest Header', { status: 403 });
    }

    // ── PRIORITY 0.5: Enforce Canonical WWW Domain (301 Permanent Redirect non-www to www) ──
    const host = (req.headers.get('host') || '').toLowerCase();
    const proto = req.headers.get('x-forwarded-proto') || '';

    // If request arrives at non-www (aelbd.net) or unencrypted HTTP on aelbd domain, 301 Permanent Redirect to https://www.aelbd.net
    if (host === 'aelbd.net' || (host === 'www.aelbd.net' && proto === 'http')) {
        const redirectUrl = new URL(req.nextUrl.pathname + req.nextUrl.search, 'https://www.aelbd.net');
        return NextResponse.redirect(redirectUrl, { status: 301 });
    }

    const path = req.nextUrl.pathname;
    const method = req.method;

    // ── PRIORITY 1: Let OPTIONS preflight pass ALWAYS ─────────────────────────
    // Browsers send OPTIONS before every cross-origin POST/GET. If we block it,
    // the actual request never happens. OPTIONS carries no API key — by design.
    if (method === 'OPTIONS') {
        const preflightResponse = new NextResponse(null, { status: 204 });
        preflightResponse.headers.set('Access-Control-Allow-Origin', '*');
        preflightResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        preflightResponse.headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-api-key, x-secret-key, secret-key, api-key, authorization, Authorization, ngrok-skip-browser-warning');
        preflightResponse.headers.set('Access-Control-Max-Age', '86400');
        return preflightResponse;
    }

    // ── PRIORITY 2: External API & Backup routes bypass middleware session auth ─
    // /api/external/*, /api/admin/backup/*, and /api/admin/gsc/* have their own route-level token & secret verification.
    if (path.startsWith('/api/external/') || path.startsWith('/api/admin/backup/') || path.startsWith('/api/backup/') || path.startsWith('/api/admin/gsc/')) {
        return NextResponse.next();
    }


    // ── PRIORITY 2.5: Auto-route Misdirected External AI/API Requests ──────────
    // If external tools or clients mistakenly POST to '/' or '/products' or '/product' 
    // with JSON or API key, rewrite internally to /api/external/products so they get
    // valid JSON responses instead of receiving the website homepage HTML!
    const isRootOrProductPage = path === '/' || path === '' || path === '/api' || path === '/api/' || path === '/products' || path === '/product' || path === '/api/product';
    const hasApiIdentifier = req.headers.get('x-api-key') || req.headers.get('x-secret-key') || req.headers.get('api-key') || req.headers.get('authorization');
    const isJsonPost = method === 'POST' && (req.headers.get('content-type')?.includes('application/json') || req.headers.get('content-type')?.includes('multipart/form-data'));

    if (method === 'POST' && isRootOrProductPage && (hasApiIdentifier || isJsonPost)) {
        return NextResponse.rewrite(new URL('/api/external/products', req.url));
    }

    // ── PRIORITY 2.8: Agent Content Negotiation (Accept: text/markdown) ───────
    // If an AI agent or markdown-aware client requests markdown, return compact markdown representation.
    const acceptHeader = req.headers.get('accept') || '';
    if (
        method === 'GET' &&
        acceptHeader.includes('text/markdown') &&
        !path.startsWith('/api/') &&
        !path.startsWith('/executive')
    ) {
        const markdown = getMarkdownRepresentation(path);
        return new NextResponse(markdown, {
            status: 200,
            headers: {
                'Content-Type': 'text/markdown; charset=utf-8',
                'Vary': 'Accept',
                'Cache-Control': 'public, max-age=3600',
            },
        });
    }

    // Core routes definition
    const isAdminRoute = path.startsWith('/executive-portal-aelbd');
    const isApiRoute = path.startsWith('/api/');
    const isAdminApiRoute = path.startsWith('/api/admin/');

    // 1. Redirect Check (Check BEFORE Auth/Maintenance so redirects don't break)
    // Note: Ideally, this would securely fetch from DB, but edge function restrictions 
    // mean we might fetch from a cached API endpoint or handle static lists.
    // For now, allow passthrough if not explicitly intercepted below.

    // 2. Authentication Check for Admin Portals
    const nextAuthSecret = process.env.NEXTAUTH_SECRET;
    if (!nextAuthSecret && (isAdminRoute || isAdminApiRoute)) {
        console.error('[CRITICAL_SECURITY_ERROR] NEXTAUTH_SECRET is not configured in middleware.');
        if (isApiRoute) {
            return NextResponse.json({ error: "Server misconfiguration: missing auth secret" }, { status: 500 });
        }
        return NextResponse.redirect(new URL('/executive-login?error=ConfigurationError', req.url));
    }

    let token = null;
    if (isAdminRoute || isAdminApiRoute) {
        token = await getToken({
            req,
            secret: nextAuthSecret
        });

        if (!token) {
            if (isApiRoute) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            return NextResponse.redirect(new URL('/executive-login', req.url));
        }
    }

    // 3. RBAC Strict Route Permission Check
    if (token && isAdminRoute) {
        const userRole = token.role as Role;
        const mappedPath = path === '/executive-portal-aelbd' ? 'dashboard.view' : path; // Handle root

        // Basic map checks (More complex logic handled per-component or API layer)
        const allowed = canAccessRoute(userRole, path);
        if (!allowed) {
            // Prevent redirect loop by sending Viewer home if they hit a wall
            if (path !== '/executive-portal-aelbd') {
                return NextResponse.redirect(new URL('/executive-portal-aelbd', req.url));
            }
            // If they can't even see the dashboard, eject them
            return NextResponse.redirect(new URL('/executive-login?error=Forbidden', req.url));
        }
    }

    // 4. API Endpoints Safety Wall
    // Protect standard API routes from unauthorized POST/PUT/DELETE
    if (isApiRoute && !isAdminApiRoute) {
        // Allow public POST/OPTIONS for contact forms, RFQs, products DNA sync, external APIs, or requests with API tokens
        const hasApiToken = req.headers.get('authorization') || req.headers.get('x-api-key');
        const isExemptEndpoint = path.includes('/api/contact') || 
                                 path.includes('/api/rfq') || 
                                 path.includes('/api/products') || 
                                 path.includes('/api/proxy') || 
                                 path.includes('/api/external');
        const isExempt = (isExemptEndpoint && (req.method === 'POST' || req.method === 'OPTIONS')) || (hasApiToken && ['POST', 'PUT', 'DELETE', 'OPTIONS'].includes(req.method));

        // Block non-GET requests if not authenticated (except exempt endpoints which handle their own token auth)
        if (req.method !== 'GET' && !isExempt) {
            if (!nextAuthSecret) {
                return NextResponse.json({ error: "Server misconfiguration: missing auth secret" }, { status: 500 });
            }
            const apiToken = await getToken({ req, secret: nextAuthSecret });
            if (!apiToken) {
                return NextResponse.json({ error: "Unauthorized Mutation" }, { status: 401 });
            }
        }
    }

    // 5. Developer Admin API Endpoints RBAC
    if (token && isAdminApiRoute) {
        if (path.includes('/api/admin/tracking')) {
            if (!['DEVELOPER', 'SUPER_ADMIN', 'ADMIN'].includes(token.role as string)) {
                return NextResponse.json({ error: "Forbidden: Developer or Administrator access required" }, { status: 403 });
            }
        } else if (path.includes('/api/admin/maintenance')) {
            if (token.role !== 'DEVELOPER') {
                return NextResponse.json({ error: "Forbidden: Developer access required" }, { status: 403 });
            }
        }
    }

    // 5. Generate Response with Security Headers & SEO Query Protection
    const res = NextResponse.next();
    res.headers.set('X-Frame-Options', 'DENY');
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('X-XSS-Protection', '1; mode=block');
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Prevent search parameter bloat from indexing in Google
    if (
        req.nextUrl.searchParams.has('q') ||
        req.nextUrl.searchParams.has('page') ||
        req.nextUrl.searchParams.has('product')
    ) {
        res.headers.set('X-Robots-Tag', 'noindex, follow');
    }

    return res;
}

export const config = {
    // Middleware runs on all routes EXCEPT:
    // - api/auth       (NextAuth internal routes)
    // - api/external   (Our public external API — secured by API Key, not session)
    // - _next/static   (static assets)
    // - _next/image    (image optimization)
    // - favicon.ico
    // - Static public assets (images, documents, fonts) to prevent middleware memory exhaustion
    matcher: ['/((?!api/auth|api/external|api/admin/gsc|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|pdf|ico|woff2?)).*)'],
};

function getMarkdownRepresentation(path: string): string {
    const cleanPath = path.toLowerCase().replace(/\/$/, '') || '/';

    if (cleanPath === '/' || cleanPath === '') {
        return `# Apparel Emporium Ltd. (AELBD) — Export Garments Sourcing & Manufacturing

Apparel Emporium is a premier buying house and garment exporter headquartered in Uttara, Dhaka, Bangladesh. We provide transparent merchandising, strict AQL 2.5 quality control, and end-to-end export production for global fashion brands.

## Core Manufacturing Divisions
- **Knitwear:** T-shirts, Polo Shirts, Hoodies, Sweatshirts, Tank Tops, Joggers (Single Jersey, Pique, Fleece, Rib).
- **Woven & Denim:** 5-pocket denim jeans, cargo shorts, chino trousers, twill workwear, formal shirts.
- **Sweaters & Outerwear:** 3GG to 14GG flat knits, cardigans, pullovers, windbreakers, and insulated jackets.

## Commercial Terms & Pricing (FOB USD)
- **MOQ:** 500 - 1,000 pcs for knitwear; 1,000 - 3,000 pcs for woven & denim.
- **FOB Pricing Estimates:**
  - Basic Knit T-Shirts: $2.50 - $4.50 USD
  - Polo Shirts: $4.00 - $7.50 USD
  - Denim Jeans & Pants: $8.50 - $18.00 USD
  - Sweaters: $8.00 - $22.00 USD
  - Outerwear & Jackets: $15.00 - $45.00 USD
- **Production Lead Time:** 45 - 75 days post-approval.

## Contact Information
- **Proprietor & CEO:** Md. Kamal Hossain
- **Address:** House # 03 (2nd Floor), Road # 12, Sector # 13, Uttara Model Town, Dhaka-1230, Bangladesh
- **Phone:** +88 02 4895 5519, +88 096 6691 2038
- **Email:** info@aelbd.net, kamal@aelbd.net
- **Website:** https://www.aelbd.net

## Agent Resources
- Full Documentation: https://www.aelbd.net/llms.txt
- MCP Server Card: https://www.aelbd.net/.well-known/mcp/server-card.json
- Products Catalog: https://www.aelbd.net/products
`;
    }

    if (cleanPath === '/products') {
        return `# Apparel Emporium Product Catalog

Over 170+ export garments styles across Knitwear, Woven, Denim, Sweaters, and Outerwear.

## Sourcing Categories
1. **Knitwear Fashion:** Cotton jersey t-shirts, CVC polo shirts, fleece hoodies, athletic joggers.
2. **Woven & Denim:** Rigid & stretch denim pants, cargo trousers, twill chinos, woven shirts.
3. **Sweaters & Flat Knits:** 3GG/5GG heavy gauge pullovers, 12GG fine gauge cardigans.
4. **Jackets & Outerwear:** Windproof parkas, softshell jackets, padded winter coats.

- To search products via API: \`GET https://www.aelbd.net/api/products?search=<keyword>\`
- To submit an inquiry: https://www.aelbd.net/contact
`;
    }

    if (cleanPath === '/about') {
        return `# About Apparel Emporium Ltd.

Established in Dhaka, Bangladesh, Apparel Emporium is a trusted buying house committed to delivering world-class apparel sourcing strictly tailored to buyer specifications.

- **Managing Director & CEO:** Md. Kamal Hossain
- **Showroom & Head Office:** Uttara Model Town, Sector 13, Road 12, House 03 (2nd Floor), Dhaka-1230.
- **Certifications:** Audited partner facilities adhering to BSCI, SEDEX, OEKO-TEX, GOTS, and WRAP.
`;
    }

    if (cleanPath === '/contact') {
        return `# Contact Apparel Emporium Corporate HQ

- **Head Office:** House # 03 (2nd Floor), Road # 12, Sector # 13, Uttara Model Town, Dhaka-1230, Bangladesh
- **Telephone:** +88 02 4895 5519, +88 096 6691 2038
- **Email:** info@aelbd.net, kamal@aelbd.net
- **RFQ Submission:** https://www.aelbd.net/contact
`;
    }

    return `# Apparel Emporium Ltd. — ${path}

Visit https://www.aelbd.net for full details or view https://www.aelbd.net/llms.txt for agent documentation.
`;
}



