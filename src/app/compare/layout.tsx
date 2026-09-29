import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Product Comparison | Apparel Emporium',
    description: 'Side-by-side garment technical specifications and sourcing comparison tool.',
    robots: {
        index: false,
        follow: true,
    },
};

export default function CompareLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
