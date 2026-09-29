import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aelbd.net';

export const metadata: Metadata = {
    title: 'B2B Garments Sourcing Services, QC & Buyer FAQs | AELBD',
    description: 'Comprehensive B2B garments sourcing services in Bangladesh: factory vetting, tech-pack fitting, inline AQL quality control, lab dips, and export customs logistics.',
    alternates: {
        canonical: '/support',
    },
    openGraph: {
        title: 'B2B Garments Sourcing Services, QC & Buyer FAQs | AELBD',
        description: 'End-to-end garments buying house services: factory sourcing, merchandising, AQL 2.5 quality control, and port logistics in Bangladesh.',
        url: `${baseUrl}/support`,
        images: ['/logo.jpg'],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'B2B Garments Sourcing Services & QC | AELBD',
        description: 'Factory sourcing, merchandising, AQL 2.5 quality control, and port logistics in Bangladesh.',
        images: ['/logo.jpg'],
    },
};

// Service JSON-LD schema
const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    'serviceType': 'Apparel Sourcing & Quality Inspection',
    'provider': {
        '@type': 'Organization',
        'name': 'Apparel Emporium Ltd.',
        'url': baseUrl
    },
    'areaServed': 'Global',
    'description': 'End-to-end readymade garment sourcing, sample development, inline and final AQL quality assurance, and export logistics in Bangladesh.',
    'hasOfferCatalog': {
        '@type': 'OfferCatalog',
        'name': 'Apparel Sourcing Services',
        'itemListElement': [
            { '@type': 'Offer', 'itemOffered': { '@type': 'Service', 'name': 'Factory Vetting & Audit' } },
            { '@type': 'Offer', 'itemOffered': { '@type': 'Service', 'name': 'Tech-Pack Sampling & Fit Development' } },
            { '@type': 'Offer', 'itemOffered': { '@type': 'Service', 'name': 'Inline & Final AQL Quality Inspection' } },
            { '@type': 'Offer', 'itemOffered': { '@type': 'Service', 'name': 'Export Logistics & Customs Documentation' } }
        ]
    }
};

export default function SupportLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
            />
            {children}
        </>
    );
}
