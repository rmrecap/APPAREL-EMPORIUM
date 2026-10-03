import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Lock, Eye, FileText, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Privacy Policy | Apparel Emporium (AELBD)',
    description: 'Privacy Policy and data protection standards for Apparel Emporium (AELBD). Learn how we safeguard buyer tech packs, corporate communications, and RFQ inquiries.',
    alternates: {
        canonical: '/privacy-policy',
    },
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300 pt-28 pb-20 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12 sm:mb-16">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-primary/10 text-primary dark:bg-white/10 dark:text-secondary mb-4">
                        <Lock size={13} />
                        Legal & Compliance
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight uppercase font-heading mb-4">
                        Privacy Policy
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Apparel Emporium Ltd. (&quot;AELBD&quot;) is committed to respecting your privacy, protecting proprietary apparel design specifications, and maintaining confidentiality in international B2B commerce.
                    </p>
                </div>

                {/* Content Box */}
                <div className="bg-white dark:bg-dark-surface rounded-3xl p-6 sm:p-10 shadow-lg border border-gray-100 dark:border-gray-800 space-y-8 text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
                    
                    <section>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">1. Information We Collect</h2>
                        <p className="mb-3">
                            When international apparel buyers, retail brands, and sourcing representatives interact with our platform, we collect relevant business information required for order fulfillment and communication:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li><strong>Contact Details:</strong> Corporate names, email addresses, phone numbers, and destination delivery countries submitted via Request for Quotation (RFQ) and contact forms.</li>
                            <li><strong>Product & Tech-Pack Specifications:</strong> Garment sketches, measurement specs, yarn types, trim selections, and target price points provided for sampling.</li>
                            <li><strong>Technical Usage Data:</strong> Anonymized browsing metrics, device categories, and server logs used strictly to ensure site uptime, performance, and security.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">2. Tech-Pack Confidentiality & Non-Disclosure</h2>
                        <p>
                            We treat all buyer proprietary garment tech-packs, brand labels, and sample designs with the utmost confidentiality. Sourcing specifications are shared only with vetted, certified partner manufacturing facilities actively bidding or manufacturing your authorized orders. We never sell, lease, or distribute private customer designs to third parties.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">3. How We Use Sourcing Information</h2>
                        <p className="mb-3">Information gathered is utilized exclusively to:</p>
                        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li>Calculate accurate FOB/CIF price quotes and sample lead times.</li>
                            <li>Liaise with ethical, compliant Bangladesh manufacturing factories on behalf of buyers.</li>
                            <li>Coordinate pre-production approvals, lab dips, inline inspections, and export customs documentation.</li>
                            <li>Communicate order status updates and shipping schedules.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">4. Cookies & Tracking Technologies</h2>
                        <p>
                            We employ essential cookies for secure session authentication (Buyer Portal) and privacy preference persistence. Analytics tracking operates only upon explicit user consent via our consent banner. Users may disable cookie storage via browser settings without restricting access to public catalog viewing.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">5. Data Retention & Contact</h2>
                        <p className="mb-4">
                            Business communications and RFQ records are securely archived for commercial auditing, tax compliance, and repeat production reference. You may request data inspection or record deletion by contacting our data protection officer.
                        </p>
                        <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-200 dark:border-gray-700/60 text-sm">
                            <p className="font-semibold text-gray-900 dark:text-white">Apparel Emporium Compliance Office</p>
                            <p>House # 03 (2nd Floor), Road # 12, Sector # 13, Uttara Model Town, Dhaka- 1230, Bangladesh</p>
                            <p>Email: <a href="mailto:kamal@aelbd.net" className="text-primary dark:text-secondary hover:underline">kamal@aelbd.net</a></p>
                        </div>
                    </section>
                </div>

                {/* Back to Home Button */}
                <div className="mt-10 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm font-bold text-primary dark:text-secondary hover:underline"
                    >
                        <span>Return to Homepage</span>
                        <ArrowRight size={15} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
