import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aelbd.net';

export const metadata: Metadata = {
    title: 'About Apparel Emporium | Leading Garments Buying House Dhaka',
    description: 'Learn about Apparel Emporium Ltd. (AELBD): premier export-oriented garments buying house in Bangladesh. Ethically certified partner factories, tailored quality assurance, and global merchandising.',
    alternates: {
        canonical: '/about',
    },
    openGraph: {
        title: 'About Apparel Emporium | Leading Garments Buying House Dhaka',
        description: 'Premier export-oriented garments buying house in Bangladesh. Ethically audited factories, tailored quality control, and global apparel sourcing.',
        url: `${baseUrl}/about`,
        images: ['/logo.jpg'],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'About Apparel Emporium | Garments Sourcing Partner',
        description: 'Premier export-oriented garments buying house in Bangladesh. Ethically audited factories and global apparel sourcing.',
        images: ['/logo.jpg'],
    },
};

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
