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
        default: 'Apparel Emporium | Trusted Garments Sourcing Partner in Bangladesh',
        template: '%s | Apparel Emporium (AELBD)',
    },
    description: '100% Export Oriented Readymade Garments, Home Textiles, Footwear and Accessories Buying House in Bangladesh. Globally Compliant & Ethically Audited Partner Factories.',
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
        title: 'Apparel Emporium | Trusted Garments Sourcing Partner in Bangladesh',
        description: '100% Export Oriented Readymade Garments Buying House in Bangladesh. Certified compliance, custom tech-pack development, and global shipping.',
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
        title: 'Apparel Emporium | Trusted Garments Sourcing Partner in Bangladesh',
        description: '100% Export Oriented Readymade Garments Buying House in Bangladesh. Certified compliance, custom tech-pack development, and global shipping.',
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

// Organization, LocalBusiness, Services, FAQs, & Product Offers JSON-LD Structured Data
const organizationSchema = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': ['Organization', 'LocalBusiness'],
            '@id': `${baseUrl}/#organization`,
            'name': 'Apparel Emporium Ltd.',
            'alternateName': 'AELBD',
            'url': baseUrl,
            'telephone': '+88 02 4895 5519',
            'email': 'info@aelbd.net',
            'priceRange': '$2.50 - $45.00 USD',
            'currenciesAccepted': 'USD, EUR, GBP, BDT',
            'paymentAccepted': 'Cash, Bank Wire (T/T), Letter of Credit (L/C)',
            'logo': {
                '@type': 'ImageObject',
                '@id': `${baseUrl}/#logo`,
                'url': `${baseUrl}/logo.jpg`,
                'caption': 'Apparel Emporium Ltd. - Bangladesh Garments Buying House'
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
                    'areaServed': 'Global',
                    'availableLanguage': ['English', 'Bengali']
                }
            ],
            'address': {
                '@type': 'PostalAddress',
                'streetAddress': 'House # 03 (2nd Floor), Road # 12, Sector # 13, Uttara Model Town',
                'addressLocality': 'Dhaka',
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
            ]
        },
        {
            '@type': 'WebSite',
            '@id': `${baseUrl}/#website`,
            'url': baseUrl,
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
            'offers': {
                '@type': 'Offer',
                'price': '0',
                'priceCurrency': 'USD',
                'description': 'Free initial tech-pack consultation and cost quotation'
            }
        },
        {
            '@type': 'Service',
            '@id': `${baseUrl}/#service-qa`,
            'name': 'Garments Quality Assurance & AQL 2.5 Inspection',
            'serviceType': 'Quality Inspection',
            'provider': { '@id': `${baseUrl}/#organization` },
            'description': 'On-site factory quality audits, inline inspection, pre-shipment inspection (AQL 2.5 standard), and compliance verification.'
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
                        'text': 'FOB pricing ranges from $2.50 to $6.50 USD for basic knit t-shirts and polos, $8.00 to $18.00 USD for denim jeans and woven trousers, and $15.00 to $45.00 USD for technical jackets and outerwear, subject to fabric composition and order volume.'
                    }
                },
                {
                    '@type': 'Question',
                    'name': 'How can international buyers submit a Request for Quotation (RFQ)?',
                    'acceptedAnswer': {
                        '@type': 'Answer',
                        'text': 'Buyers can submit tech packs, fabric requirements, and target pricing directly via our online contact portal at https://aelbd.net/contact or by emailing info@aelbd.net.'
                    }
                }
            ]
        },
        {
            '@type': 'ItemList',
            '@id': `${baseUrl}/#core-products`,
            'name': 'Export Garments Sourcing Product Catalog',
            'itemListElement': [
                {
                    '@type': 'ListItem',
                    'position': 1,
                    'item': {
                        '@type': 'Product',
                        'name': 'Custom OEM Cotton T-Shirts & Polos',
                        'description': '100% combed cotton, CVC, or TC jersey knit t-shirts and polo shirts with custom GSM, embroidery, and printing.',
                        'image': `${baseUrl}/images/categories/knitwear.jpg`,
                        'sku': 'AEL-KNIT-001',
                        'offers': {
                            '@type': 'Offer',
                            'url': `${baseUrl}/products`,
                            'priceCurrency': 'USD',
                            'price': '3.50',
                            'priceValidUntil': '2027-12-31',
                            'itemCondition': 'https://schema.org/NewCondition',
                            'availability': 'https://schema.org/InStock',
                            'seller': { '@id': `${baseUrl}/#organization` }
                        }
                    }
                },
                {
                    '@type': 'ListItem',
                    'position': 2,
                    'item': {
                        '@type': 'Product',
                        'name': 'Export Denim Jeans & Trousers',
                        'description': 'High-grade stretch and rigid cotton denim pants with custom enzyme, bleach, and distress washing.',
                        'image': `${baseUrl}/images/categories/woven.jpg`,
                        'sku': 'AEL-DENIM-002',
                        'offers': {
                            '@type': 'Offer',
                            'url': `${baseUrl}/products`,
                            'priceCurrency': 'USD',
                            'price': '9.50',
                            'priceValidUntil': '2027-12-31',
                            'itemCondition': 'https://schema.org/NewCondition',
                            'availability': 'https://schema.org/InStock',
                            'seller': { '@id': `${baseUrl}/#organization` }
                        }
                    }
                },
                {
                    '@type': 'ListItem',
                    'position': 3,
                    'item': {
                        '@type': 'Product',
                        'name': 'Winter Outerwear & Technical Jackets',
                        'description': 'Windproof, water-resistant insulated jackets, hoodies, and softshell coats for international buyers.',
                        'image': `${baseUrl}/images/categories/sweaters.jpg`,
                        'sku': 'AEL-OUTER-003',
                        'offers': {
                            '@type': 'Offer',
                            'url': `${baseUrl}/products`,
                            'priceCurrency': 'USD',
                            'price': '18.50',
                            'priceValidUntil': '2027-12-31',
                            'itemCondition': 'https://schema.org/NewCondition',
                            'availability': 'https://schema.org/InStock',
                            'seller': { '@id': `${baseUrl}/#organization` }
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
