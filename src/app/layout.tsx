import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { SettingsProvider } from '@/context/SettingsContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AuthProvider from '@/components/providers/AuthProvider';
import { Suspense } from 'react';
import TrackingScripts from '@/components/layout/TrackingScripts';
import TrafficTracker from '@/components/analytics/TrafficTracker';
import CookieConsent from '@/components/layout/CookieConsent';
import CompareTray from '@/components/products/CompareTray';
import FloatingWhatsApp from '@/components/layout/FloatingWhatsApp';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aelbd.net';

export const metadata: Metadata = {
    metadataBase: new URL(baseUrl),
    title: {
        default: 'Apparel Emporium | B2B Garment Manufacturer & Apparel Buying House in Bangladesh',
        template: '%s | Apparel Emporium (AELBD)',
    },
    description: 'Leading B2B Garment Manufacturer, Apparel Buying House, and Custom OEM/ODM Clothing Exporter in Uttara, Dhaka, Bangladesh. Globally Compliant & Ethically Audited Partner Factories.',
    alternates: {
        canonical: './',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    openGraph: {
        title: 'Apparel Emporium | B2B Garment Manufacturer & Apparel Buying House in Bangladesh',
        description: 'Leading B2B Garment Manufacturer, Apparel Buying House, and Custom OEM/ODM Clothing Exporter in Bangladesh. Sourcing circular knitwear, flat knitwear, woven garments, denim, and outerwear.',
        url: baseUrl,
        siteName: 'Apparel Emporium (AELBD)',
        images: [
            {
                url: '/logo.jpg',
                width: 1200,
                height: 630,
                alt: 'Apparel Emporium - Garments Buying House Bangladesh',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Apparel Emporium | B2B Garment Manufacturer & Apparel Buying House in Bangladesh',
        description: 'Leading B2B Garment Manufacturer, Apparel Buying House, and Custom OEM/ODM Clothing Exporter in Bangladesh.',
        images: ['/logo.jpg'],
    },
    icons: {
        icon: '/favicon.png',
        shortcut: '/favicon.png',
        apple: '/apple-touch-icon.png',
    },
    verification: {
        google: process.env.GOOGLE_SITE_VERIFICATION || '',
    },
};

// B2B Buying House, Garment Manufacturer, Services, FAQs & Custom Sourcing JSON-LD Structured Data
const organizationSchema = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': ['Organization', 'LocalBusiness'],
            '@id': `${baseUrl}/#organization`,
            'name': 'Apparel Emporium',
            'alternateName': 'AELBD',
            'url': `${baseUrl}/`,
            'description': 'Leading B2B Garment Manufacturer, Apparel Buying House, and OEM/ODM Clothing Exporter in Uttara, Dhaka, Bangladesh.',
            'knowsAbout': [
                'Garment Manufacturing',
                'Apparel Buying House Services',
                'Custom OEM & Private Label Clothing',
                'Circular Knitwear',
                'Flat Knitwear',
                'Woven Garments',
                'Denim & Outerwear Export'
            ],
            'telephone': '+88 02 4895 5519',
            'email': 'info@aelbd.net',
            'priceRange': 'Custom Bulk Pricing (FOB/CIF/DDP)',
            'currenciesAccepted': 'USD, EUR, GBP, BDT',
            'paymentAccepted': 'Bank Wire (T/T), Letter of Credit (L/C)',
            'logo': {
                '@type': 'ImageObject',
                '@id': `${baseUrl}/#logo`,
                'url': `${baseUrl}/logo.jpg`,
                'caption': 'Apparel Emporium - Garment Buying House & OEM Clothing Manufacturer Bangladesh'
            },
            'image': `${baseUrl}/logo.jpg`,
            'sameAs': [
                'https://www.linkedin.com/company/apparel-emporium',
                'https://www.facebook.com/ApparelEmporiumBD'
            ],
            'contactPoint': [
                {
                    '@type': 'ContactPoint',
                    'telephone': '+88 02 4895 5519',
                    'contactType': 'customer service',
                    'areaServed': 'Worldwide',
                    'availableLanguage': ['English', 'Bengali']
                }
            ],
            'address': {
                '@type': 'PostalAddress',
                'streetAddress': 'House # 03 (2nd Floor), Road # 12, Sector # 13, Uttara Model Town',
                'addressLocality': 'Uttara, Dhaka',
                'postalCode': '1230',
                'addressCountry': 'BD'
            },
            'geo': {
                '@type': 'GeoCoordinates',
                'latitude': '23.8698',
                'longitude': '90.3957'
            },
            'openingHoursSpecification': [
                {
                    '@type': 'OpeningHoursSpecification',
                    'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday', 'Sunday'],
                    'opens': '09:00',
                    'closes': '19:00'
                }
            ],
            'areaServed': 'Worldwide'
        },
        {
            '@type': 'WebSite',
            '@id': `${baseUrl}/#website`,
            'url': `${baseUrl}/`,
            'name': 'Apparel Emporium',
            'description': 'Export-Oriented Readymade Garments Buying House and Sourcing Partner in Bangladesh',
            'publisher': {
                '@id': `${baseUrl}/#organization`
            },
            'inLanguage': 'en-US',
            'potentialAction': {
                '@type': 'SearchAction',
                'target': {
                    '@type': 'EntryPoint',
                    'urlTemplate': `${baseUrl}/products?q={search_term_string}`
                },
                'query-input': 'required name=search_term_string'
            }
        },
        {
            '@type': 'Service',
            '@id': `${baseUrl}/#service-sourcing`,
            'name': 'OEM & ODM Garments Sourcing & Manufacturing',
            'serviceType': 'Apparel Manufacturing & Export Sourcing',
            'provider': { '@id': `${baseUrl}/#organization` },
            'description': 'End-to-end garments merchandising, manufacturing, and export sourcing from Bangladesh for Knitwear, Woven, Sweaters, Denim, and Outerwear.',
            'areaServed': 'Worldwide'
        },
        {
            '@type': 'Service',
            '@id': `${baseUrl}/#service-qa`,
            'name': 'Quality Assurance (AQL Inspection Standards & Pre-Shipment QC)',
            'serviceType': 'Garments Quality Inspection & Compliance Audit',
            'provider': { '@id': `${baseUrl}/#organization` },
            'description': 'On-site factory quality audits, inline inspection, pre-shipment inspection (AQL 1.5/2.5 standard), and compliance verification.',
            'areaServed': 'Worldwide'
        },
        {
            '@type': 'FAQPage',
            '@id': `${baseUrl}/#faq`,
            'mainEntity': [
                {
                    '@type': 'Question',
                    'name': 'What is the minimum order quantity (MOQ) for garments manufacturing in Bangladesh?',
                    'acceptedAnswer': {
                        '@type': 'Answer',
                        'text': 'Our minimum order quantity (MOQ) generally starts from 500 to 1,000 pieces per style/colorway for basic knitwear, and 1,000 to 3,000 pieces for woven and denim apparel, depending on fabric specifications.'
                    }
                },
                {
                    '@type': 'Question',
                    'name': 'What are the typical FOB pricing ranges for garments sourced through Apparel Emporium?',
                    'acceptedAnswer': {
                        '@type': 'Answer',
                        'text': 'FOB pricing is custom-tailored based on volume, fabric GSM, and construction. Inquiries and tech packs are evaluated for competitive bulk manufacturing quotes under FOB, CIF, or DDP incoterms.'
                    }
                },
                {
                    '@type': 'Question',
                    'name': 'How can international buyers submit a Request for Quotation (RFQ)?',
                    'acceptedAnswer': {
                        '@type': 'Answer',
                        'text': 'Buyers can submit tech packs, fabric requirements, and target pricing directly via our online RFQ portal at https://aelbd.net/request-quote or by emailing info@aelbd.net.'
                    }
                }
            ]
        },
        {
            '@type': 'ItemList',
            'name': 'B2B Custom Garment Manufacturing & Sourcing Categories',
            'itemListElement': [
                {
                    '@type': 'ListItem',
                    'position': 1,
                    'item': {
                        '@type': 'Service',
                        'name': 'Custom OEM Cotton T-Shirts & Polos',
                        'serviceType': 'B2B Custom Garment Manufacturing & Private Label Sourcing',
                        'provider': {
                            '@id': `${baseUrl}/#organization`
                        },
                        'areaServed': 'Worldwide',
                        'availableChannel': {
                            '@type': 'ServiceChannel',
                            'serviceUrl': `${baseUrl}/products/knitwear`
                        }
                    }
                },
                {
                    '@type': 'ListItem',
                    'position': 2,
                    'item': {
                        '@type': 'Service',
                        'name': 'Export Denim Jeans & Trousers',
                        'serviceType': 'B2B Woven & Denim Garment Manufacturing',
                        'provider': {
                            '@id': `${baseUrl}/#organization`
                        },
                        'areaServed': 'Worldwide',
                        'availableChannel': {
                            '@type': 'ServiceChannel',
                            'serviceUrl': `${baseUrl}/products/woven`
                        }
                    }
                },
                {
                    '@type': 'ListItem',
                    'position': 3,
                    'item': {
                        '@type': 'Service',
                        'name': 'Winter Outerwear & Technical Jackets',
                        'serviceType': 'B2B Technical Outerwear & Jacket Manufacturing',
                        'provider': {
                            '@id': `${baseUrl}/#organization`
                        },
                        'areaServed': 'Worldwide',
                        'availableChannel': {
                            '@type': 'ServiceChannel',
                            'serviceUrl': `${baseUrl}/products/sweater`
                        }
                    }
                }
            ]
        }
    ]
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
                />
                {/* WebMCP: In-Browser Agent Tools Registration */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
(function() {
    try {
        if (typeof window !== 'undefined' && window.navigator && 'modelContext' in window.navigator) {
            var mc = window.navigator.modelContext;
            if (mc && typeof mc.registerTool === 'function') {
                window.navigator.modelContext.registerTool({
                    name: 'search_catalog',
                    description: 'Search 170+ export garments products and fabric specifications at Apparel Emporium',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            query: { type: 'string', description: 'Garment style or keyword' }
                        },
                        required: ['query']
                    },
                    execute: function(params) {
                        return fetch('/api/products?search=' + encodeURIComponent(params.query || ''))
                            .then(function(r) { return r.json(); });
                    }
                });
                window.navigator.modelContext.registerTool({
                    name: 'request_quote',
                    description: 'Submit an RFQ or inquiry for garments manufacturing and FOB pricing',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            email: { type: 'string' },
                            message: { type: 'string' }
                        },
                        required: ['name', 'email', 'message']
                    },
                    execute: function(params) {
                        return fetch('/api/rfq', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(params)
                        }).then(function(r) { return r.json(); });
                    }
                });
            }
        }
    } catch (e) {}
})();
`
                    }}
                />
            </head>
            <body className={`${inter.variable} font-sans min-h-screen flex flex-col dark:bg-dark-bg`} suppressHydrationWarning>
                <SettingsProvider>
                    <ThemeProvider>
                        <AuthProvider>
                            <TrackingScripts />
                            <Suspense fallback={null}>
                                <TrafficTracker />
                            </Suspense>
                            <Header />
                            <main className="flex-grow relative">
                                {children}
                            </main>
                            <Footer />
                            <CompareTray />
                            <CookieConsent />
                            <FloatingWhatsApp />
                        </AuthProvider>
                    </ThemeProvider>
                </SettingsProvider>
            </body>
        </html>
    );
}
