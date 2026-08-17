'use client';

import React from 'react';
import { FileText, Ruler, Factory, Truck, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function Testimonials() {
    const steps = [
        {
            step: '01',
            title: 'Inquiry & Tech-Pack Review',
            desc: 'Share your garment sketches, measurements, target fabric & GSM, and order volumes. Our merchandisers evaluate technical viability within 24 hours.',
            icon: <FileText className="w-6 h-6 text-primary" />,
        },
        {
            step: '02',
            title: 'Costing, Lab-Dips & Sampling',
            desc: 'We provide open-book factory costing, develop Pantone-matched color lab dips, and craft fit/proto samples within 7-10 working days.',
            icon: <Ruler className="w-6 h-6 text-primary" />,
        },
        {
            step: '03',
            title: 'Bulk Production & Inline QA',
            desc: 'Rigorous merchandising supervision across cutting, sewing, and finishing with inline QA checks at 20% and 50% production milestones.',
            icon: <Factory className="w-6 h-6 text-primary" />,
        },
        {
            step: '04',
            title: 'Final AQL Inspection & Export',
            desc: 'Comprehensive final inspection based on AQL 1.5/2.5 with photographic reports. Seamless export documentation and FOB / CIF shipment.',
            icon: <Truck className="w-6 h-6 text-primary" />,
        },
    ];

    return (
        <section className="py-20 bg-slate-900 text-white relative overflow-hidden" id="workflow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">

                <div className="text-center max-w-3xl mx-auto mb-14">
                    <span className="text-primary font-bold tracking-widest uppercase text-xs mb-2 block">
                        Transparent Sourcing Workflow
                    </span>
                    <h2 className="text-3xl md:text-5xl font-black font-heading tracking-tight text-white">
                        Our 4-Step Sourcing & Delivery Process
                    </h2>
                    <p className="text-slate-400 text-xs md:text-sm mt-3">
                        From initial design consultation to container departure at Chittagong Port, we ensure zero-defect quality and on-time delivery.
                    </p>
                    <div className="w-16 h-1 bg-primary mx-auto mt-4 rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {steps.map((item, idx) => (
                        <div
                            key={idx}
                            className="bg-slate-800/80 border border-slate-700/80 hover:border-primary/50 p-6 rounded-2xl transition-all duration-300 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center">
                                        {item.icon}
                                    </div>
                                    <span className="text-2xl font-black text-slate-600 select-none">
                                        {item.step}
                                    </span>
                                </div>
                                <h3 className="text-base font-bold text-white mb-2">
                                    {item.title}
                                </h3>
                                <p className="text-slate-400 text-xs leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <Link
                        href="/request-quote"
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary/90 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all"
                    >
                        <span>Request Sourcing Costing & Sampling</span>
                        <ArrowRight size={16} />
                    </Link>
                </div>

            </div>
        </section>
    );
}
