import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Briefcase, Users, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Careers & Opportunities | Apparel Emporium (AELBD)',
    description: 'Join the Apparel Emporium team in Dhaka, Bangladesh. Career opportunities for apparel merchandisers, quality assurance auditors, pattern masters, and supply chain specialists.',
    alternates: {
        canonical: '/careers',
    },
};

const OPEN_ROLES = [
    {
        title: "Senior Merchandiser — Knitwear Division",
        department: "Merchandising & Sourcing",
        location: "Dhaka, Bangladesh",
        type: "Full-Time",
        description: "Leading overseas buyer accounts, tech-pack costing, yarn consumption analysis, and factory production follow-ups for international circular knit accounts."
    },
    {
        title: "Quality Assurance (QA) Inspector — Woven & Denim",
        department: "Quality & Compliance",
        location: "Gazipur / Narayanganj On-Site",
        type: "Full-Time",
        description: "Conducting inline AQL audits, cutting inspection, lab-dip color fastness approvals, needle detection checks, and final container packaging sign-offs."
    },
    {
        title: "Garments CAD Pattern Master",
        department: "Product Development",
        location: "Dhaka, Bangladesh",
        type: "Full-Time",
        description: "Digitizing buyer tech packs, grading marker patterns using Optitex/Gerber systems, and optimizing fabric yield consumption."
    }
];

export default function CareersPage() {
    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300 pt-28 pb-20 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12 sm:mb-16">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-primary/10 text-primary dark:bg-white/10 dark:text-secondary mb-4">
                        <Briefcase size={13} />
                        Join Our Team
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight uppercase font-heading mb-4">
                        Careers at Apparel Emporium
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        We are continuously seeking experienced apparel professionals, rigorous quality controllers, and dedicated merchandisers to grow our export sourcing operations.
                    </p>
                </div>

                {/* Job Openings */}
                <div className="space-y-5 mb-14">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Open Positions</h2>
                    {OPEN_ROLES.map((role, idx) => (
                        <div
                            key={idx}
                            className="bg-white dark:bg-dark-surface rounded-2xl p-6 sm:p-7 shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    {role.title}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs px-2.5 py-1 rounded-md bg-primary/10 text-primary dark:bg-white/10 dark:text-secondary font-bold">
                                        {role.type}
                                    </span>
                                    <span className="text-xs px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium">
                                        {role.location}
                                    </span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                                {role.description}
                            </p>
                            <div className="pt-2 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
                                <span className="text-xs text-gray-500 font-medium">{role.department}</span>
                                <a
                                    href="mailto:careers@apparelemporium.com?subject=Application for position"
                                    className="text-xs font-bold text-primary dark:text-secondary hover:underline inline-flex items-center gap-1"
                                >
                                    <span>Apply via Email</span>
                                    <ArrowRight size={13} />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

                {/* General Inquiries */}
                <div className="bg-white dark:bg-dark-surface rounded-3xl p-8 border border-gray-100 dark:border-gray-800 text-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Don&apos;t see your profile listed?</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-lg mx-auto mb-6">
                        We welcome proactive applications from experienced textile technologists, export documentation officers, and production managers.
                    </p>
                    <a
                        href="mailto:careers@apparelemporium.com"
                        className="inline-flex items-center gap-2 bg-primary text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl hover:bg-black transition-all"
                    >
                        <Mail size={15} />
                        <span>Send Your CV to careers@apparelemporium.com</span>
                    </a>
                </div>
            </div>
        </div>
    );
}
