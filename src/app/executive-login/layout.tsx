import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Executive Portal Login | Apparel Emporium',
    description: 'Executive management portal authentication.',
    robots: {
        index: false,
        follow: false,
    },
};

export default function ExecutiveLoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
