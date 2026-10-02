'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function TrafficTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const lastTrackedPath = useRef<string | null>(null);

    useEffect(() => {
        // Skip tracking internal admin pages
        if (!pathname || pathname.startsWith('/executive-portal-aelbd') || pathname.startsWith('/api')) {
            return;
        }

        const fullPath = searchParams && searchParams.toString() 
            ? `${pathname}?${searchParams.toString()}` 
            : pathname;

        if (lastTrackedPath.current === fullPath) {
            return;
        }
        lastTrackedPath.current = fullPath;

        // Anonymous Visitor ID
        let visitorId = '';
        try {
            visitorId = localStorage.getItem('ael_vid') || '';
            if (!visitorId) {
                visitorId = `vis_${Math.random().toString(36).substring(2, 12)}_${Date.now().toString(36)}`;
                localStorage.setItem('ael_vid', visitorId);
            }
        } catch (e) {
            visitorId = `vis_${Math.random().toString(36).substring(2, 12)}`;
        }

        // Session ID
        let sessionId = '';
        try {
            sessionId = sessionStorage.getItem('ael_sid') || '';
            if (!sessionId) {
                sessionId = `sess_${Math.random().toString(36).substring(2, 12)}_${Date.now().toString(36)}`;
                sessionStorage.setItem('ael_sid', sessionId);
            }
        } catch (e) {
            sessionId = `sess_${Math.random().toString(36).substring(2, 12)}`;
        }

        const payload = {
            visitorId,
            sessionId,
            eventType: 'pageview',
            pagePath: fullPath,
            pageTitle: typeof document !== 'undefined' ? document.title : '',
            referrer: typeof document !== 'undefined' ? document.referrer : '',
            screenResolution: typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : '',
            duration: 0
        };

        // Send non-blocking beacon or background fetch
        try {
            const bodyStr = JSON.stringify(payload);
            if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
                const blob = new Blob([bodyStr], { type: 'application/json' });
                navigator.sendBeacon('/api/analytics/track', blob);
            } else {
                fetch('/api/analytics/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: bodyStr,
                    keepalive: true
                }).catch(() => {});
            }
        } catch (err) {
            // Silently swallow analytics errors to avoid impacting visitors
        }
    }, [pathname, searchParams]);

    // Passive interaction tracking for User Journey (RFQ, WhatsApp, Products, Catalog)
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleClick = (e: MouseEvent) => {
            const target = (e.target as HTMLElement)?.closest('a, button') as HTMLElement | null;
            if (!target) return;

            const href = target.getAttribute('href') || '';
            const ariaLabel = target.getAttribute('aria-label') || '';
            const text = (target.textContent || '').trim().toLowerCase();

            let eventType: string | null = null;
            let targetUrl = href;

            if (href.includes('/request-quote') || href.includes('/rfq') || text.includes('quote') || text.includes('rfq')) {
                eventType = 'rfq_click';
            } else if (href.includes('wa.me') || href.includes('whatsapp') || text.includes('whatsapp')) {
                eventType = 'whatsapp_click';
            } else if (href.includes('/products/') && !href.endsWith('/products')) {
                eventType = 'product_click';
            } else if (href.includes('catalog') || href.endsWith('.pdf') || text.includes('download catalog')) {
                eventType = 'catalog_download';
            } else if (href.includes('/contact') || text.includes('contact us')) {
                eventType = 'contact_click';
            }

            if (!eventType) return;

            let visitorId = '';
            let sessionId = '';
            try {
                visitorId = localStorage.getItem('ael_vid') || '';
                sessionId = sessionStorage.getItem('ael_sid') || '';
            } catch (e) {}

            const payload = {
                visitorId: visitorId || 'anonymous',
                sessionId: sessionId || 'anonymous',
                eventType,
                pagePath: window.location.pathname,
                pageTitle: document.title,
                targetUrl: targetUrl || text,
                screenResolution: `${window.screen.width}x${window.screen.height}`
            };

            try {
                const bodyStr = JSON.stringify(payload);
                if (navigator.sendBeacon) {
                    const blob = new Blob([bodyStr], { type: 'application/json' });
                    navigator.sendBeacon('/api/analytics/track', blob);
                } else {
                    fetch('/api/analytics/track', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: bodyStr,
                        keepalive: true
                    }).catch(() => {});
                }
            } catch (err) {}
        };

        window.addEventListener('click', handleClick, { passive: true });
        return () => window.removeEventListener('click', handleClick);
    }, []);

    return null;
}
