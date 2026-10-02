'use client';

import { useSettings } from '@/context/SettingsContext';
import Script from 'next/script';
import { useEffect, useState, useRef } from 'react';

// Safe component to inject and execute custom HTML and scripts in DOM
function CustomScriptRenderer({ scripts, location }: { scripts: any[]; location: 'head' | 'body-start' | 'body-end' }) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const activeScripts = (scripts || []).filter(
            s => s && (s.active === true || s.active === 'true') && s.location === location && typeof s.code === 'string' && s.code.trim().length > 0
        );

        if (location === 'head') {
            if (activeScripts.length === 0) return;
            const injectedElements: Node[] = [];

            activeScripts.forEach((item, index) => {
                const temp = document.createElement('div');
                temp.innerHTML = item.code;

                // Handle script tags
                const scriptTags = temp.querySelectorAll('script');
                if (scriptTags.length > 0) {
                    scriptTags.forEach((oldScript) => {
                        const newScript = document.createElement('script');
                        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                        newScript.textContent = oldScript.textContent;
                        newScript.setAttribute('data-custom-script-head', `${index}`);
                        document.head.appendChild(newScript);
                        injectedElements.push(newScript);
                        oldScript.remove();
                    });
                } else if (!/<[a-z][\s\S]*>/i.test(item.code)) {
                    // Plain JS snippet without <script> tags
                    const newScript = document.createElement('script');
                    newScript.textContent = item.code;
                    newScript.setAttribute('data-custom-script-head', `plain-${index}`);
                    document.head.appendChild(newScript);
                    injectedElements.push(newScript);
                }

                // Handle non-script tags (like <meta>, <style>, <link>, comments)
                while (temp.firstChild) {
                    const child = temp.firstChild;
                    document.head.appendChild(child);
                    injectedElements.push(child);
                }
            });

            return () => {
                injectedElements.forEach(el => {
                    try {
                        if ((el as any).remove) {
                            (el as any).remove();
                        } else if (el.parentNode) {
                            el.parentNode.removeChild(el);
                        }
                    } catch (e) {
                        // ignore cleanup errors
                    }
                });
            };
        } else {
            // body-start or body-end
            const container = containerRef.current;
            if (!container) return;

            container.innerHTML = '';
            if (activeScripts.length === 0) return;

            activeScripts.forEach((item) => {
                const wrapper = document.createElement('div');
                wrapper.innerHTML = item.code;

                const scriptTags = wrapper.querySelectorAll('script');
                scriptTags.forEach((oldScript) => {
                    const newScript = document.createElement('script');
                    Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                    newScript.textContent = oldScript.textContent;
                    oldScript.parentNode?.replaceChild(newScript, oldScript);
                });

                while (wrapper.firstChild) {
                    container.appendChild(wrapper.firstChild);
                }
            });

            return () => {
                if (container) container.innerHTML = '';
            };
        }
    }, [scripts, location]);

    if (location === 'head') return null;
    return <div ref={containerRef} className={location === 'body-end' ? 'custom-scripts-body-end' : 'custom-scripts-body-start'} />;
}

export default function TrackingScripts() {
    const { settings } = useSettings();
    const [consent, setConsent] = useState<{ necessary: boolean; analytics: boolean; marketing: boolean } | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('cookieConsentData');
        if (stored) {
            try {
                setConsent(JSON.parse(stored));
            } catch (e) { console.error('Error parsing cookie consent'); }
        }
    }, []);

    // If cookie banner is disabled, allow tracking by default. If enabled, allow unless explicitly rejected.
    const isAnalytics = () => {
        if (settings.cookie_banner_enabled !== 'true') return true;
        return consent ? consent.analytics !== false : true;
    };

    const isMarketing = () => {
        if (settings.cookie_banner_enabled !== 'true') return true;
        return consent ? consent.marketing !== false : true;
    };

    // Process Custom Scripts
    let customScripts: any[] = [];
    try {
        if (settings.custom_scripts) customScripts = JSON.parse(settings.custom_scripts);
    } catch (e) {
        // Safe fail
    }

    useEffect(() => {
        if (settings.google_search_console_meta && typeof document !== 'undefined') {
            let metaTag = document.querySelector('meta[name="google-site-verification"]');
            if (!metaTag) {
                metaTag = document.createElement('meta');
                metaTag.setAttribute('name', 'google-site-verification');
                document.head.appendChild(metaTag);
            }
            metaTag.setAttribute('content', settings.google_search_console_meta);
        }
    }, [settings.google_search_console_meta]);

    const ga4Id = (settings.ga4_measurement_id || settings.ga4_id)?.trim();
    const gtmId = (settings.gtm_container_id || settings.gtm_id)?.trim();
    const fbPixelId = (settings.fb_pixel_id || settings.fb_id)?.trim();
    const clarityId = (settings.clarity_project_id || settings.clarity_id)?.trim();
    const hotjarId = (settings.hotjar_site_id || settings.hotjar_id)?.trim();
    const tiktokId = (settings.tiktok_pixel_id || settings.tiktok_id)?.trim();
    const linkedinId = (settings.linkedin_partner_id || settings.linkedin_id)?.trim();
    const pinterestId = (settings.pinterest_tag_id || settings.pinterest_id)?.trim();
    const customHasGa4 = customScripts.some(
        s => s && (s.active === true || s.active === 'true') && typeof s.code === 'string' && (s.code.includes('googletagmanager.com/gtag/js') || (ga4Id && s.code.includes(ga4Id)))
    );

    return (
        <>
            {/* Custom Scripts HEAD */}
            <CustomScriptRenderer scripts={customScripts} location="head" />

            {/* Custom Scripts BODY START */}
            <CustomScriptRenderer scripts={customScripts} location="body-start" />

            {/* 2. Analytics Scripts */}
            {isAnalytics() && (
                <>
                    {/* GTM */}
                    {settings.gtm_enabled === 'true' && gtmId && (
                        <Script
                            id="gtag-manager-head"
                            strategy="lazyOnload"
                            dangerouslySetInnerHTML={{
                                __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                                })(window,document,'script','dataLayer','${gtmId}');`
                            }}
                        />
                    )}

                    {/* GA4 */}
                    {(settings.ga4_enabled === 'true' || (ga4Id && settings.ga4_enabled !== 'false')) && ga4Id && settings.gtm_enabled !== 'true' && !customHasGa4 && (
                        <>
                            <Script
                                src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
                                strategy="lazyOnload"
                            />
                            <Script id="ga4-script" strategy="lazyOnload">
                                {`
                                  window.dataLayer = window.dataLayer || [];
                                  function gtag(){dataLayer.push(arguments);}
                                  gtag('js', new Date());
                                  gtag('config', '${ga4Id}');
                                `}
                            </Script>
                        </>
                    )}

                    {/* Clarity */}
                    {settings.clarity_enabled === 'true' && clarityId && (
                        <Script id="clarity-script" strategy="lazyOnload">
                            {`
                                (function(c,l,a,r,i,t,y){
                                    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                                    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                                    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                                })(window, document, "clarity", "script", "${clarityId}");
                            `}
                        </Script>
                    )}

                    {/* Hotjar */}
                    {settings.hotjar_enabled === 'true' && hotjarId && (
                        <Script id="hotjar-script" strategy="lazyOnload">
                            {`
                                (function(h,o,t,j,a,r){
                                    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                                    h._hjSettings={hjid:${hotjarId},hjsv:6};
                                    a=o.getElementsByTagName('head')[0];
                                    r=o.createElement('script');r.async=1;
                                    r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                                    a.appendChild(r);
                                })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
                            `}
                        </Script>
                    )}
                </>
            )}

            {/* 3. Marketing Scripts */}
            {isMarketing() && (
                <>
                    {/* FB Pixel */}
                    {settings.fb_pixel_enabled === 'true' && fbPixelId && settings.gtm_enabled !== 'true' && (
                        <Script id="fb-pixel" strategy="lazyOnload">
                            {`
                              !function(f,b,e,v,n,t,s)
                              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                              n.queue=[];t=b.createElement(e);t.async=!0;
                              t.src=v;s=b.getElementsByTagName(e)[0];
                              s.parentNode.insertBefore(t,s)}(window, document,'script',
                              'https://connect.facebook.net/en_US/fbevents.js');
                              fbq('init', '${fbPixelId}');
                              fbq('track', 'PageView');
                            `}
                        </Script>
                    )}

                    {/* TikTok Pixel */}
                    {settings.tiktok_pixel_enabled === 'true' && tiktokId && (
                        <Script id="tiktok-pixel" strategy="lazyOnload">
                            {`
                                !function (w, d, t) {
                                  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
                                  ttq.load('${tiktokId}');
                                  ttq.page();
                                 }(window, document, 'ttq');
                            `}
                        </Script>
                    )}

                    {/* LinkedIn Insight */}
                    {settings.linkedin_enabled === 'true' && linkedinId && (
                        <Script id="linkedin-pixel" strategy="lazyOnload">
                            {`
                                _linkedin_partner_id = "${linkedinId}";
                                window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
                                window._linkedin_data_partner_ids.push(_linkedin_partner_id);
                                (function(l) {
                                if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
                                window.lintrk.q=[]}
                                var s = document.getElementsByTagName("script")[0];
                                var b = document.createElement("script");
                                b.type = "text/javascript";b.async = true;
                                b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
                                s.parentNode.insertBefore(b, s);})(window.lintrk);
                            `}
                        </Script>
                    )}

                    {/* Pinterest Tag */}
                    {settings.pinterest_enabled === 'true' && pinterestId && (
                        <Script id="pinterest-pixel" strategy="lazyOnload">
                            {`
                                !function(e){if(!window.pintrk){window.pintrk = function () {
                                window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var
                                n=window.pintrk;n.queue=[],n.version="3.0";var
                                t=document.createElement("script");t.async=!0,t.src=e;var
                                r=document.getElementsByTagName("script")[0];
                                r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
                                pintrk('load', '${pinterestId}');
                                pintrk('page');
                            `}
                        </Script>
                    )}
                </>
            )}

            {/* Custom Scripts BODY END */}
            <CustomScriptRenderer scripts={customScripts} location="body-end" />

            {/* GTM Noscript Fallback */}
            {isAnalytics() && settings.gtm_enabled === 'true' && gtmId && (
                <noscript dangerouslySetInnerHTML={{
                    __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`
                }} />
            )}
        </>
    );
}

