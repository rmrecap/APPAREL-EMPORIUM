import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aelbd.net';

export const metadata: Metadata = {
    title: 'Request Garments Sourcing Quotation & RFQ | AELBD',
    description: 'Submit your custom garment manufacturing inquiry or tech-pack specifications. Receive transparent FOB costing, MOQ details, and sample production schedules from Dhaka.',
    alternates: {
        canonical: '/request-quote',
    },
    openGraph: {
        title: 'Request Garments Sourcing Quotation & RFQ | AELBD',
        description: 'Submit your apparel tech-pack for competitive FOB costing and manufacturing schedules from Bangladesh.',
        url: `${baseUrl}/request-quote`,
        images: ['/logo.jpg'],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Request Garments Sourcing Quotation & RFQ | AELBD',
        description: 'Submit your apparel tech-pack for competitive FOB costing and manufacturing schedules from Bangladesh.',
        images: ['/logo.jpg'],
    },
};

export default function RequestQuoteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
