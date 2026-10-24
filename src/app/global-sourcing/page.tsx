import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Globe2, ShieldCheck, Ship, Plane, Clock, Award, CheckCircle2, ArrowRight, FileCheck, Layers, HelpCircle, MapPin, Building2, ExternalLink } from 'lucide-react';
import B2BLeadMagnetSection from '@/components/leads/B2BLeadMagnetSection';

export const metadata: Metadata = {
    title: 'Global Apparel Sourcing Hub | Bangladesh Readymade Garments Export Markets',
    description: 'Comprehensive B2B guide for international fashion brands sourcing readymade garments from Bangladesh. Duty-free access to UK/EU, fast sea freight to USA, air transit to UAE/GCC, and audited compliant manufacturing.',
    keywords: [
        'apparel sourcing bangladesh',
        'bangladesh garments export markets',
        'duty free apparel sourcing uk eu',
        'apparel buying house bangladesh usa',
        'garments manufacturing gcc uae',
        'b2b clothing manufacturer bangladesh',
        'sedex bsci certified garment factory'
    ],
    alternates: {
        canonical: 'https://aelbd.net/global-sourcing',
    },
    openGraph: {
        title: 'Global Apparel Sourcing Markets | Apparel Emporium Bangladesh',
        description: 'B2B apparel manufacturing & export corridors for USA, UK, Europe, UAE, Australia & Canada with verified compliance & duty benefits.',
        url: 'https://aelbd.net/global-sourcing',
        siteName: 'Apparel Emporium',
        type: 'website',
    },
};

const MARKETS = [
    {
        id: 'usa',
        region: 'United States & North America',
        flag: '🇺🇸 🇨🇦',
        headline: 'Volume Sourcing, Rapid Tech-Pack Prototyping & CPSIA Compliance',
        transitSea: '24–28 Days (Chittagong to East Coast / Savannah)',
        transitAir: '3–4 Days (Direct Air Cargo to JFK / ORD / LAX)',
        keyStrengths: [
            'Denim & Twill bottom manufacturing with specialized ozone/laser eco-washing',
            'Full compliance with US Consumer Product Safety Improvement Act (CPSIA)',
            'Strict adherence to AQL 1.5 Major / 2.5 Minor final container inspection',
            'Large-scale order management for department stores & DTC ecommerce labels'
        ],
        popularProducts: 'Denim Jeans, Heavyweight Fleece Hoodies, Chinos & Casual Shirts',
        leadTime: '45–60 Days bulk delivery after proto approval',
        recommendedAudit: 'BSCI, WRAP Gold, Sedex SMETA 4-Pillar',
    },
    {
        id: 'uk-eu',
        region: 'United Kingdom & European Union',
        flag: '🇬🇧 🇪🇺',
        headline: '0% Duty-Free Tariff Entry via DCTS & GSP with Higg Index Verification',
        transitSea: '22–26 Days (Direct vessel to Felixstowe, Rotterdam & Hamburg)',
        transitAir: '2–3 Days (Direct freight to LHR, CDG, FRA)',
        keyStrengths: [
            '0% Import Tariffs under UK Developing Countries Trading Scheme (DCTS) & EU GSP',
            'GOTS-certified 100% Organic Cotton and GRS Recycled Polyester traceability',
            'Verified Higg Facility Environmental Module (FEM) & Social Labor Module (FSLM)',
            'OEKO-TEX Standard 100 Class 1 safety for adult & childrenswear'
        ],
        popularProducts: 'Organic Cotton T-Shirts, Fine Gauge Sweaters, Oxford Woven Shirts',
        leadTime: '45–60 Days bulk production',
        recommendedAudit: 'Higg Index, Sedex SMETA, GOTS, BSCI Grade A',
    },
    {
        id: 'uae-gcc',
        region: 'UAE & Middle East (GCC Corridor)',
        flag: '🇦🇪 🇸🇦',
        headline: 'Express Air & Sea Freight, Luxury Heavyweight Knits & Corporate Apparel',
        transitSea: '10–14 Days (Direct container lines to Jebel Ali Port, Dubai)',
        transitAir: '4–6 Hours (Daily non-stop widebody freighter flights from DAC to DXB)',
        keyStrengths: [
            'Ultra-rapid supply replenishment via Jebel Ali Port and Dubai World Central',
            'Premium heavyweight 280–420 GSM French Terry and loopback fleece production',
            'High-durability corporate shirting, twill work trousers, and modest collections',
            'Flexible MOQs starting from 1,000 pieces per style for regional boutique chains'
        ],
        popularProducts: 'Oversized Streetwear Hoodies, Pique Polo Shirts, Formal Trousers',
        leadTime: '35–45 Days express production & delivery',
        recommendedAudit: 'BSCI, Sedex SMETA, OEKO-TEX',
    },
    {
        id: 'australia-canada',
        region: 'Australia & Canada Markets',
        flag: '🇦🇺 🇨🇦',
        headline: 'Seasonal Inversion Planning, High-Gauge Knitwear & Ethical Transparency',
        transitSea: '18–22 Days (Direct sea routes to Melbourne/Sydney & Vancouver)',
        transitAir: '3–5 Days (Connecting air cargo hubs)',
        keyStrengths: [
            'Southern Hemisphere counter-seasonal calendar alignment for fashion retailers',
            'Seamless duty-free entry into Canada under General Preferential Tariff (GPT)',
            'Fine gauge 12GG & 14GG merino wool and cotton-cashmere blend sweaters',
            'Full supply chain traceability from yarn spin to garment carton dispatch'
        ],
        popularProducts: 'Jacquard Knitted Sweaters, Breathable Athletic Polos, Linen Shirts',
        leadTime: '45–60 Days bulk delivery',
        recommendedAudit: 'BSCI, Sedex SMETA, WRAP',
    },
];

const FAQS = [
    {
        question: 'What duty-free tariff benefits apply to garments exported from Bangladesh to the UK and EU?',
        answer: 'Bangladesh readymade garments enjoy 0% import duty into the European Union under the GSP (Everything But Arms) initiative and 0% duty into the United Kingdom under the Developing Countries Trading Scheme (DCTS). This delivers a 12% to 14% direct duty cost advantage compared to non-preferential apparel sourcing countries.'
    },
    {
        question: 'What are standard transit times for ocean and air freight from Bangladesh to the USA and Europe?',
        answer: 'Ocean freight from Chittagong Port typically takes 22 to 26 days to major European ports (Rotterdam, Felixstowe, Hamburg) and 24 to 28 days to US East Coast ports (Savannah, New York). Air cargo from Hazrat Shahjalal International Airport (DAC) delivers within 2 to 4 days globally.'
    },
    {
        question: 'How does Apparel Emporium ensure social compliance for overseas buyers?',
        answer: 'All manufacturing operations are carried out exclusively in facilities holding valid, verified social and technical audits including BSCI (Grade A/B), SEDEX SMETA 4-Pillar, WRAP Gold, and OEKO-TEX Standard 100. Buyers receive full unredacted audit reports prior to production.'
    },
    {
        question: 'What is the Minimum Order Quantity (MOQ) for international buyers?',
        answer: 'Standard MOQs start from 1,000 pieces per style/colorway for circular knitwear and woven items, and 1,200 pieces for flat-knit sweaters, with flexible size distribution breakdowns to accommodate new market testing.'
    }
];

export default function GlobalSourcingPage() {
    const baseUrl = 'https://aelbd.net';
    const canonicalUrl = `${baseUrl}/global-sourcing`;

    // Structured Data Schemas
    const serviceSchema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        'name': 'International Apparel Sourcing & Manufacturing Export Hub',
        'serviceType': 'Apparel Sourcing and Manufacturing Export Service',
        'provider': {
            '@type': 'Organization',
            'name': 'Apparel Emporium',
            'url': baseUrl,
            'logo': `${baseUrl}/images/logo.png`,
            'address': {
                '@type': 'PostalAddress',
                'addressLocality': 'Dhaka',
                'addressCountry': 'BD'
            }
        },
        'areaServed': [
            { '@type': 'Country', 'name': 'United States' },
            { '@type': 'Country', 'name': 'United Kingdom' },
            { '@type': 'Country', 'name': 'Germany' },
            { '@type': 'Country', 'name': 'France' },
            { '@type': 'Country', 'name': 'United Arab Emirates' },
            { '@type': 'Country', 'name': 'Australia' },
            { '@type': 'Country', 'name': 'Canada' }
        ],
        'description': 'End-to-end B2B apparel merchandising, production management, AQL 1.5 inspection, and export logistics for woven, knitwear, and sweaters.'
    };

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            {
                '@type': 'ListItem',
                'position': 1,
                'name': 'Home',
                'item': baseUrl,
            },
            {
                '@type': 'ListItem',
                'position': 2,
                'name': 'Global Sourcing Markets',
                'item': canonicalUrl,
            }
        ]
    };

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': FAQS.map(f => ({
            '@type': 'Question',
            'name': f.question,
            'acceptedAnswer': {
                '@type': 'Answer',
                'text': f.answer
            }
        }))
    };

    return (
        <div className="bg-light-bg dark:bg-dark-bg min-h-screen pt-28 pb-20 text-gray-900 dark:text-gray-100">
            {/* Inject Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            <div className="container mx-auto px-4 max-w-7xl">
                
                {/* Breadcrumb Navigation */}
                <nav className="flex gap-2 items-center text-sm mb-8 text-gray-500 dark:text-gray-400">
                    <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                    <span>/</span>
                    <span className="text-primary font-medium">Global Sourcing Markets</span>
                </nav>

                {/* Hero Header */}
                <div className="text-center max-w-4xl mx-auto mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
                        <Globe2 className="w-4 h-4" /> Global Apparel Sourcing Corridors
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-heading leading-tight">
                        Bangladesh Apparel Sourcing for Global Fashion Markets
                    </h1>
                    <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                        Supplying audited, high-precision circular knitwear, flat-knit sweaters, and tailored woven garments to retail chains and emerging fashion labels across North America, Europe, the GCC, and Australasia.
                    </p>
                </div>

                {/* Corridor Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    {MARKETS.map((market) => (
                        <div
                            key={market.id}
                            className="bg-white dark:bg-dark-surface rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between gap-4 mb-4">
                                    <span className="text-3xl">{market.flag}</span>
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                        Transit: {market.transitSea.split('(')[0]}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold mb-2 font-heading">{market.region}</h3>
                                <p className="text-sm font-semibold text-primary mb-4">{market.headline}</p>

                                <div className="space-y-2.5 mb-6">
                                    {market.keyStrengths.map((point, idx) => (
                                        <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                            <span>{point}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-2 text-xs text-gray-500 dark:text-gray-400">
                                <div><strong className="text-gray-900 dark:text-white">Popular Styles:</strong> {market.popularProducts}</div>
                                <div><strong className="text-gray-900 dark:text-white">Audit Standard:</strong> {market.recommendedAudit}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Core Category Cross-Links */}
                <div className="bg-gradient-to-r from-gray-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 mb-16 shadow-xl border border-gray-800">
                    <div className="max-w-3xl mb-8">
                        <span className="text-xs uppercase font-bold tracking-widest text-primary">Certified Manufacturing Hub</span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold mt-1 text-white">Explore Factory Specifications by Garment Division</h2>
                        <p className="text-sm text-gray-300 mt-2">
                            Review detailed technical machinery, GSM parameters, stitch gauges, and sampling turnaround schedules:
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <Link
                            href="/products/woven"
                            className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition group"
                        >
                            <h3 className="text-lg font-bold text-white group-hover:text-primary transition flex items-center justify-between">
                                Woven Division <ArrowRight className="w-4 h-4" />
                            </h3>
                            <p className="text-xs text-gray-400 mt-2">Denim, twill pants, poplin & oxford shirts, outerwear (45-60 day lead time).</p>
                        </Link>

                        <Link
                            href="/products/knitwear"
                            className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition group"
                        >
                            <h3 className="text-lg font-bold text-white group-hover:text-primary transition flex items-center justify-between">
                                Circular Knitwear <ArrowRight className="w-4 h-4" />
                            </h3>
                            <p className="text-xs text-gray-400 mt-2">140–420 GSM single jersey, terry, fleece, Mayer & Cie circular knitting.</p>
                        </Link>

                        <Link
                            href="/products/sweater"
                            className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition group"
                        >
                            <h3 className="text-lg font-bold text-white group-hover:text-primary transition flex items-center justify-between">
                                Flat-Knit Sweaters <ArrowRight className="w-4 h-4" />
                            </h3>
                            <p className="text-xs text-gray-400 mt-2">3GG to 14GG computer knitting on Stoll & Shima Seiki computerized machines.</p>
                        </Link>
                    </div>
                </div>

                {/* B2B Lead Magnet Component */}
                <B2BLeadMagnetSection
                    sourcePage="Global Sourcing Hub (/global-sourcing)"
                    title="Request 2026 Factory Compliance Profile & Sourcing Dossier"
                    subtitle="Download verified BSCI & SMETA audit certificates, factory capacity schedules, and FOB export price matrices for your target delivery destination."
                />

                {/* International Buyer FAQ Section */}
                <div className="max-w-4xl mx-auto my-16">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary mb-2">
                            <HelpCircle className="w-4 h-4" /> Buyer Knowledge Base
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold font-heading">
                            Frequently Asked Questions by Overseas Buyers
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {FAQS.map((faq, idx) => (
                            <details
                                key={idx}
                                className="group bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm transition"
                            >
                                <summary className="p-6 font-bold text-base cursor-pointer list-none flex justify-between items-center text-gray-900 dark:text-white hover:text-primary transition">
                                    <span>{faq.question}</span>
                                    <span className="text-primary font-mono text-xl group-open:rotate-45 transition-transform duration-200">+</span>
                                </summary>
                                <div className="px-6 pb-6 text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800/50 pt-4">
                                    {faq.answer}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
