import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { SettingsProvider } from '@/context/SettingsContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AuthProvider from '@/components/providers/AuthProvider';
import TrackingScripts from '@/components/layout/TrackingScripts';
import CookieConsent from '@/components/layout/CookieConsent';
import CompareTray from '@/components/products/CompareTray';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

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

// Organization & WebSite JSON-LD Structured Data
const organizationSchema = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'Organization',
            '@id': `${baseUrl}/#organization`,
            'name': 'Apparel Emporium Ltd.',
            'alternateName': 'AELBD',
            'url': baseUrl,
            'logo': {
                '@type': 'ImageObject',
                '@id': `${baseUrl}/#logo`,
                'url': `${baseUrl}/logo.jpg`,
                'caption': 'Apparel Emporium Ltd.'
            },
            'contactPoint': [
                {
                    '@type': 'ContactPoint',
                    'telephone': '+880-2-1234-5678',
                    'contactType': 'customer service',
                    'areaServed': 'Global',
                    'availableLanguage': ['English', 'Bengali']
                }
            ],
            'address': {
                '@type': 'PostalAddress',
                'streetAddress': 'House 12, Road 5, Gulshan-1',
                'addressLocality': 'Dhaka',
                'postalCode': '1212',
                'addressCountry': 'BD'
            }
        },
        {
            '@type': 'WebSite',
            '@id': `${baseUrl}/#website`,
            'url': baseUrl,
            'name': 'Apparel Emporium',
            'description': 'Export-Oriented Garments Buying House and Sourcing Partner in Bangladesh',
            'publisher': {
                '@id': `${baseUrl}/#organization`
            },
            'inLanguage': 'en-US'
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
            </head>
            <body className={`${inter.variable} font-sans min-h-screen flex flex-col transition-colors duration-300 dark:bg-dark-bg`} suppressHydrationWarning>
                <SettingsProvider>
                    <ThemeProvider>
                        <AuthProvider>
                            <TrackingScripts />
                            <Header />
                            <main className="flex-grow relative">
                                {children}
                            </main>
                            <Footer />
                            <CompareTray />
                            <CookieConsent />
                        </AuthProvider>
                    </ThemeProvider>
                </SettingsProvider>
            </body>
        </html>
    );
}
