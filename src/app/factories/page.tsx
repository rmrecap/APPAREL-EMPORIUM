import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Factory, ShieldCheck, Award, CheckCircle2, ArrowRight, Sparkles, Building2 } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Manufacturing Facilities & Factory Network | Apparel Emporium (AELBD)',
    description: 'Explore our ethically audited garment manufacturing partner factories in Bangladesh: circular knitting, woven garment assembly, sweater flat-knitting, and eco-dyeing facilities.',
    alternates: {
        canonical: '/factories',
    },
};

const FACTORY_DIVISIONS = [
    {
        name: "Circular Knitting & Apparel Facilities",
        capacity: "1.2 Million Pieces / Month",
        focus: "Single Jersey, Pique, Interlock, Rib, Fleece & French Terry",
        machines: "German & Japanese high-speed circular knitting machines, automated tension control, computerized fabric spreaders.",
        audits: ["amfori BSCI", "OEKO-TEX Standard 100", "SEDEX SMETA", "GOTS Organic"]
    },
    {
        name: "Woven Garments & Denim Assembly Units",
        capacity: "650,000 Pieces / Month",
        focus: "Casual Shirts, Chinos, Denim Jeans, Cargo Shorts & Light Jackets",
        machines: "Juki high-speed sewing machines, automated pocket welters, laser ozone denim washing units, eco-friendly laundry treatment.",
        audits: ["WRAP Gold", "ISO 9001:2015", "amfori BSCI", "Fair Wear"]
    },
    {
        name: "Automated Sweater & Flat-Knit Plants",
        capacity: "350,000 Pieces / Month",
        focus: "3GG, 5GG, 7GG, 12GG, and 14GG Pullovers, Cardigans & Knit Vests",
        machines: "Fully computerized Shima Seiki and Stoll flat-knitting jacquard machinery, ultrasonic linking, dry-cleaning tumbler finish.",
        audits: ["SEDEX SMETA", "OEKO-TEX", "amfori BSCI", "ISO 14001"]
    },
    {
        name: "Eco-Dyeing & Modern Washing Facilities",
        capacity: "45 Metric Tons / Day",
        focus: "Continuous open-width dyeing, low liquor-ratio soft flow dyeing, enzyme washes",
        machines: "Thies eco-dyeing vessels, biological Effluent Treatment Plants (ETP), heat recovery systems, Zero Liquid Discharge (ZLD) roadmap.",
        audits: ["OEKO-TEX Standard 100", "ZDHC Level 3", "Bluesign Partner", "amfori BEPI"]
    }
];

export default function FactoriesPage() {
    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300 pt-28 pb-20 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12 sm:mb-16">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-primary/10 text-primary dark:bg-white/10 dark:text-secondary mb-4">
                        <Building2 size={13} />
                        Production Infrastructure
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight uppercase font-heading mb-4">
                        Partner Manufacturing Facilities
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Apparel Emporium coordinates production across leading, audited apparel manufacturing plants across Gazipur, Narayanganj, and Chittagong export zones in Bangladesh.
                    </p>
                </div>

                {/* Division Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                    {FACTORY_DIVISIONS.map((div, idx) => (
                        <div
                            key={idx}
                            className="bg-white dark:bg-dark-surface rounded-3xl p-7 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-primary/10 text-primary dark:bg-white/10 dark:text-secondary">
                                        {div.capacity}
                                    </span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    {div.name}
                                </h2>
                                <p className="text-xs font-semibold text-secondary uppercase tracking-wider mb-4">
                                    {div.focus}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                                    {div.machines}
                                </p>
                            </div>

                            <div className="border-t border-gray-100 dark:border-gray-800/80 pt-4">
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                                    Audit & Safety Certifications:
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {div.audits.map((a, i) => (
                                        <span
                                            key={i}
                                            className="text-xs px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium border border-gray-200 dark:border-gray-700/60"
                                        >
                                            {a}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Safety & Compliance Pledge */}
                <div className="bg-white dark:bg-dark-surface rounded-3xl p-8 sm:p-10 border border-gray-100 dark:border-gray-800 shadow-sm text-center">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase font-heading mb-3">
                        Zero Tolerance for Non-Compliance
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
                        Every factory selected for buyer orders must maintain active structural, electrical, and fire safety clearances compliant with international Accord/RSC mandates and strict national labor standards.
                    </p>
                    <Link
                        href="/request-quote"
                        className="inline-flex items-center gap-2 bg-primary text-white font-bold text-xs uppercase tracking-wider px-8 py-4 rounded-xl hover:bg-black transition-all"
                    >
                        <span>Schedule a Sourcing Consultation</span>
                        <ArrowRight size={15} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
