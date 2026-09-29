import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aelbd.net';

export const metadata: Metadata = {
    title: 'Contact Apparel Emporium | Garments Sourcing Office Dhaka',
    description: 'Contact our apparel merchandising and sourcing team in Dhaka, Bangladesh. Inquire about custom garment manufacturing, tech-pack sampling, and factory audits.',
    alternates: {
        canonical: '/contact',
    },
    openGraph: {
        title: 'Contact Apparel Emporium | Garments Sourcing Office Dhaka',
        description: 'Connect with our Dhaka sourcing office for FOB price quotations, tech-pack consultations, and factory audit inquiries.',
        url: `${baseUrl}/contact`,
        images: ['/logo.jpg'],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Contact Apparel Emporium | Garments Sourcing Office Dhaka',
        description: 'Connect with our Dhaka sourcing office for FOB price quotations, tech-pack consultations, and factory audit inquiries.',
        images: ['/logo.jpg'],
    },
};

// LocalBusiness JSON-LD schema for Dhaka HQ
const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': 'Apparel Emporium Ltd.',
    'image': `${baseUrl}/logo.jpg`,
    'telephone': '+880-2-1234-5678',
    'email': 'info@apparelemporium.com',
    'url': `${baseUrl}/contact`,
    'address': {
        '@type': 'PostalAddress',
        'streetAddress': 'House 12, Road 5, Gulshan-1',
        'addressLocality': 'Dhaka',
        'postalCode': '1212',
        'addressCountry': 'BD'
    },
    'geo': {
        '@type': 'GeoCoordinates',
        'latitude': 23.7925,
        'longitude': 90.4078
    },
    'openingHoursSpecification': [
        {
            '@type': 'OpeningHoursSpecification',
            'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday', 'Sunday'],
            'opens': '09:00',
            'closes': '18:00'
        }
    ]
};

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
            />
            {children}
        </>
    );
}
