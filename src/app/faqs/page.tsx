import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { HelpCircle, ChevronRight, MessageSquare, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Frequently Asked Questions (FAQ) | Apparel Emporium (AELBD)',
    description: 'Frequently asked questions regarding apparel sourcing from Bangladesh: MOQ requirements, sample lead times, FOB pricing, factory audits, and quality control.',
    alternates: {
        canonical: '/faqs',
    },
};

const FAQS_DATA = [
    {
        question: "What is the typical Minimum Order Quantity (MOQ) for custom garments?",
        answer: "Our MOQs are structured around fabric knitting and dye-lot minimums. For standard knitwear (T-shirts, polos, hoodies), MOQs typically start at 500 to 1,000 pieces per style/colorway. For woven garments and denim, MOQs range between 1,000 and 3,000 pieces. For custom yarn-dyed sweaters, typical MOQs are 500 to 800 pieces."
    },
    {
        question: "How long does it take to develop proto samples and lab dips?",
        answer: "Standard proto samples and lab dip color swatches take 7 to 10 working days using locally sourced yarns and fabrics. If specialized imported yarns, technical functional finishes, or custom trims are required, sample development typically requires 12 to 18 days."
    },
    {
        question: "What are your bulk production lead times?",
        answer: "Bulk production lead times from Bangladesh depend on fabric availability. For local circular knit garments, production ranges from 45 to 65 days following Pre-Production (PP) sample approval. For complex woven items or imported fabrications, production timelines range between 60 and 90 days."
    },
    {
        question: "What quality control standards do your partner factories follow?",
        answer: "All production runs are inspected by our dedicated quality assurance teams adhering strictly to AQL (Acceptable Quality Limit) 2.5 standard for major defects and 4.0 for minor defects, or custom buyer inspection protocols. We also facilitate third-party inspections with SGS, Intertek, or Bureau Veritas."
    },
    {
        question: "Are your associated manufacturing factories ethically certified?",
        answer: "Yes. We collaborate exclusively with audited and globally compliant garment factories adhering to amfori BSCI, SEDEX SMETA, OEKO-TEX Standard 100, WRAP, GOTS (Global Organic Textile Standard), and ISO 9001 certifications with fair labor standards and zero child labor."
    },
    {
        question: "What international payment terms do you support?",
        answer: "Standard payment methods include Irrevocable Letter of Credit (L/C at sight) and Telegraphic Transfer (T/T with standard deposit and balance against commercial export shipping documents), compliant with Bangladesh Bank regulations."
    },
    {
        question: "Can Apparel Emporium handle custom packaging, barcodes, and private labeling?",
        answer: "Yes. We coordinate complete end-to-end private label packaging: customized woven labels, heat-transfer neck prints, hangtags with barcodes/UPC stickers, polybags, and master export shipping cartons according to retailer EDI carton marking guidelines."
    }
];

export default function FAQsPage() {
    // Generate FAQPage JSON-LD schema
    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': FAQS_DATA.map(faq => ({
            '@type': 'Question',
            'name': faq.question,
            'acceptedAnswer': {
                '@type': 'Answer',
                'text': faq.answer
            }
        }))
    };

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300 pt-28 pb-20 px-4 sm:px-6">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12 sm:mb-16">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-primary/10 text-primary dark:bg-white/10 dark:text-secondary mb-4">
                        <HelpCircle size={13} />
                        Buyer Resource Center
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight uppercase font-heading mb-4">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Essential answers on apparel export sourcing from Bangladesh: production lead times, minimum order quantities, factory certifications, and quality control.
                    </p>
                </div>

                {/* FAQ List */}
                <div className="space-y-4">
                    {FAQS_DATA.map((faq, idx) => (
                        <div
                            key={idx}
                            className="bg-white dark:bg-dark-surface rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md"
                        >
                            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-start gap-2.5">
                                <span className="text-primary dark:text-secondary font-black text-sm pt-0.5">Q:</span>
                                <span>{faq.question}</span>
                            </h2>
                            <p className="text-sm sm:text-[15px] text-gray-600 dark:text-gray-300 leading-relaxed pl-6">
                                {faq.answer}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Help CTA Box */}
                <div className="mt-12 bg-primary/5 dark:bg-white/5 rounded-3xl p-8 border border-primary/10 dark:border-white/10 text-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Have a specific tech-pack or custom inquiry?</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-lg mx-auto mb-6">
                        Our merchandising team can evaluate your custom specs and provide a comprehensive FOB price estimate.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            href="/request-quote"
                            className="inline-flex items-center gap-2 bg-primary text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl hover:bg-black transition-all"
                        >
                            <span>Request a Quote</span>
                            <ArrowRight size={14} />
                        </Link>
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-2 bg-white dark:bg-dark-surface text-gray-900 dark:text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary transition-all"
                        >
                            <span>Contact Sourcing Team</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
