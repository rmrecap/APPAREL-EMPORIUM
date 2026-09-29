import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { FileCheck2, Scale, ArrowRight, ShieldAlert } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Terms of Service | Apparel Emporium (AELBD)',
    description: 'Terms of Service and B2B export sourcing agreements for Apparel Emporium (AELBD). Specifications on proto-sampling, order confirmations, quality control, and L/C payment.',
    alternates: {
        canonical: '/terms',
    },
};

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300 pt-28 pb-20 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12 sm:mb-16">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-primary/10 text-primary dark:bg-white/10 dark:text-secondary mb-4">
                        <Scale size={13} />
                        Commercial Sourcing Terms
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight uppercase font-heading mb-4">
                        Terms of Service
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        These terms govern all commercial quotations, tech-pack sampling, merchandising operations, and export order management provided by Apparel Emporium Ltd. (&quot;AELBD&quot;).
                    </p>
                </div>

                {/* Content Box */}
                <div className="bg-white dark:bg-dark-surface rounded-3xl p-6 sm:p-10 shadow-lg border border-gray-100 dark:border-gray-800 space-y-8 text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
                    
                    <section>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">1. Scope of B2B Sourcing Services</h2>
                        <p>
                            Apparel Emporium functions as an export-oriented buying house and apparel merchandising liaison in Bangladesh. We facilitate factory selection, sample development, technical fitting, inline quality auditing, packaging inspection, and port logistics between international buyers and certified manufacturing facilities.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">2. Quotations, Pricing & MOQs</h2>
                        <p className="mb-3">
                            All formal pricing proposals (FOB Dhaka/Chittagong, CIF, or C&F) are calculated on specified order volumes, fabric yarn compositions, GSM weights, embellishments, and delivery timelines:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li>Minimum Order Quantities (MOQs) depend on fabric knitting, weaving, and minimum dye-lot volumes.</li>
                            <li>Price quotes remain valid for the period specified in formal proforma invoices (typically 14 to 30 calendar days due to yarn market fluctuations).</li>
                            <li>Currency denominations are primarily United States Dollars (USD) or Euros (EUR) unless agreed otherwise in writing.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">3. Sampling & Technical Tech-Packs</h2>
                        <p>
                            Proto samples, lab dips, strike-offs, and fit samples are fabricated strictly in adherence to buyer-approved tech-packs. Sampling development schedules range between 7 to 14 working days depending on yarn sourcing and specialized washes. Bulk fabric cutting commences only upon explicit written approval of the Pre-Production (PP) sample.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">4. Quality Assurance & Inspection Standards</h2>
                        <p>
                            Quality benchmarks are governed by international Acceptable Quality Limit (AQL) standards (standard AQL 2.5 for major defects, AQL 4.0 for minor defects) or custom tolerances designated by the buyer. Independent third-party inspection agencies (SGS, Intertek, Bureau Veritas) are welcomed at the buyer&apos;s request prior to vessel dispatch.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">5. Commercial Payment Terms</h2>
                        <p>
                            Standard payment modalities for international apparel exports from Bangladesh are executed via Irrevocable Letter of Credit (L/C) at sight or agreed Telegraphic Transfer (T/T) deposit schedules adhering to Bangladesh Bank export documentation regulations.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">6. Governing Law & Jurisdiction</h2>
                        <p>
                            These commercial terms and any formal supply contracts established through Apparel Emporium are construed under the laws and international trade statutes of Bangladesh, subject to the jurisdiction of the commercial courts of Dhaka.
                        </p>
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
