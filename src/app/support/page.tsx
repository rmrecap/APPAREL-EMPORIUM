'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    CheckCircle2, ShieldCheck, FileCheck, Layers, Truck,
    Headphones, ArrowRight, Sparkles, ChevronRight, HelpCircle
} from 'lucide-react';
import AtelierDecorations3D from '@/components/products/AtelierDecorations3D';

export default function SupportPage() {
    const [activeTab, setActiveTab] = useState<'services' | 'faq'>('services');

    const supportPillars = [
        {
            icon: <Layers className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
            title: 'Factory Sourcing & Merchandising',
            desc: 'Identifying certified leading manufacturers for each query to serve optimal pricing, MOQ scalability, and fast lead times.'
        },
        {
            icon: <FileCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
            title: 'Sampling & Tech-Pack Fitting',
            desc: 'Developing proto samples, size sets, and lab dips strictly aligned with buyer tech-packs before bulk manufacturing approval.'
        },
        {
            icon: <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
            title: 'In-Line & Final QC (AQL Standard)',
            desc: 'Rigorous periodic quality inspections from raw fabric yarn to stitching, needle detection, and final AQL 2.5 packaging.'
        },
        {
            icon: <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
            title: 'Banking, Customs & Port Logistics',
            desc: 'Complete export documentation, L/C negotiation, freight forwarding, and seamless dispatch through Dhaka and Chittagong ports.'
        }
    ];

    const workflowSteps = [
        { step: '01', title: 'Query & Costing', desc: 'Detailed bill-of-materials analysis, fabric yarn rates, and target price estimation within 24-48 hours.' },
        { step: '02', title: 'Proto & Lab Dips', desc: 'Fabric lab dips for shade matching and 1st fit proto sample development for buyer evaluation.' },
        { step: '03', title: 'Factory Audit & Order', desc: 'Selection of social & technical compliant factory with signed tech-packs and verified capacity schedule.' },
        { step: '04', title: 'In-Line Production QC', desc: 'Daily monitoring of fabric knitting/weaving, dyeing fastness, cut-to-ship ratios, and stitching tolerances.' },
        { step: '05', title: 'Final AQL Inspection', desc: 'Comprehensive Pre-Shipment Inspection (PSI) adhering to AQL 1.5/2.5 international standards.' },
        { step: '06', title: 'Export & Handover', desc: 'Customs clearance, bill of lading documentation, and on-time shipment handover to the shipping line.' }
    ];

    const servicesList = [
        'Fulfill readymade garments, home textiles, footwear and accessories sourcing needs for international Buyers/Importers.',
        'Build long-term trust and transparency with international retail chains in merchandising and production.',
        'Evaluate and audit manufacturers regarding compliance with BSCI, OEKO-TEX, WRAP, and GOTS standards.',
        'Provide technical guidance to partner factories in implementing advanced manufacturing and lean assembly management.',
        'Monitor daily factory capacity and extend necessary merchandising cooperation to avoid production bottlenecks.',
        'Execute rigorous inspection checkpoints and never take shortcuts on fabric weight, color fastness, or seam strength.',
        'Maintain real-time tracking data so buyers receive prompt progress updates on their active purchase orders.',
        'Continuous evaluation of our internal sourcing operations to guarantee highest client satisfaction.'
    ];

    const faqs = [
        {
            q: 'What is your typical Minimum Order Quantity (MOQ)?',
            a: 'Our flexible sourcing network accommodates MOQs starting from 300 to 500 pcs per style for custom tech-packs, with capability to scale to 50,000+ pcs for bulk seasonal programs.'
        },
        {
            q: 'How long does sample development take?',
            a: 'Proto samples and lab dips are typically prepared and dispatched within 7 to 10 working days upon receiving your tech-pack and fabric specifications.'
        },
        {
            q: 'What quality inspection standards do you follow?',
            a: 'We strictly execute AQL 2.5 (or AQL 1.5 upon buyer request) standard quality checks covering fabric GSM, yarn consistency, shrinkage, colorfastness, seam strength, and barcode verification.'
        },
        {
            q: 'Can you source custom sustainable and organic fabrics?',
            a: 'Yes, our partner mills supply GOTS-certified 100% organic cotton, BCI cotton, recycled polyester, bamboo fiber, and OEKO-TEX Standard 100 certified eco-friendly dyes.'
        }
    ];

    return (
        <div className="catalog-bg-canvas min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-500">
            {/* ── HERO BANNER: Deep Navy Blue Banner ── */}
            <div className="bg-[#142338] dark:bg-[#0A1220] text-white pt-28 sm:pt-32 pb-14 sm:pb-16 relative overflow-hidden shadow-lg border-b border-white/10">
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                {/* 3D Sewing Needle, Thread & Button Floating Art */}
                <AtelierDecorations3D variant="top-right" />

                <div className="container mx-auto px-4 text-center relative z-10 max-w-4xl">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-black uppercase tracking-widest mb-4">
                        <Headphones size={13} /> Dedicated Buyer Support
                    </span>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-heading tracking-tight mb-4 text-white">
                        World-Class Trade Support &amp; Sourcing Services
                    </h1>
                    <p className="text-blue-100/90 text-xs sm:text-sm md:text-base font-medium leading-relaxed max-w-2xl mx-auto">
                        Our seasoned merchandising, sampling, quality control, banking, and logistics professionals provide end-to-end support for international garment buyers.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-6xl space-y-16 sm:space-y-20">

                {/* ── 4 CORE SUPPORT PILLARS ── */}
                <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {supportPillars.map((pillar, i) => (
                        <div key={i} className="neumorphic-card-3d rounded-[26px] p-5 sm:p-6 flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 rounded-2xl pedestal-stage-3d flex items-center justify-center mb-4 shadow-xs">
                                    {pillar.icon}
                                </div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white mb-2 leading-tight">
                                    {pillar.title}
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                    {pillar.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </section>

                {/* ── 3D SOURCING WORKFLOW PROCESS ── */}
                <section className="sidebar-3d-panel rounded-[32px] p-6 sm:p-10 space-y-8">
                    <div className="text-center max-w-xl mx-auto">
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-1.5">
                            Our 6-Stage Sourcing Lifecycle
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                            How we ensure zero errors from initial tech-pack inquiry to port container loading.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {workflowSteps.map((ws, idx) => (
                            <div key={idx} className="spec-box-3d rounded-2xl p-5 flex flex-col justify-between group hover:border-blue-500/40 transition-colors">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xl font-black font-mono text-blue-600 dark:text-blue-400">
                                            {ws.step}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            Stage
                                        </span>
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                                        {ws.title}
                                    </h4>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                        {ws.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── SERVICE CHECKLIST & FAQ TABS ── */}
                <section className="neumorphic-card-3d rounded-[32px] p-6 sm:p-10 space-y-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-200/70 dark:border-white/10 pb-6">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                Comprehensive Service Protocols &amp; Buyer FAQs
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                Explore our standard service inclusions or review common sourcing questions.
                            </p>
                        </div>

                        {/* Tab Switcher */}
                        <div className="flex items-center gap-2 p-1.5 rounded-full input-3d-inset">
                            <button
                                onClick={() => setActiveTab('services')}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === 'services'
                                    ? 'bg-[#1B2B44] dark:bg-blue-600 text-white shadow-xs'
                                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                                    }`}
                            >
                                Service Checklist
                            </button>
                            <button
                                onClick={() => setActiveTab('faq')}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === 'faq'
                                    ? 'bg-[#1B2B44] dark:bg-blue-600 text-white shadow-xs'
                                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                                    }`}
                            >
                                Frequently Asked
                            </button>
                        </div>
                    </div>

                    {/* Tab 1: Service Checklist */}
                    {activeTab === 'services' && (
                        <div className="grid md:grid-cols-2 gap-4">
                            {servicesList.map((item, idx) => (
                                <div key={idx} className="spec-box-3d rounded-2xl p-4 flex items-start gap-3">
                                    <div className="mt-0.5 w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                        <CheckCircle2 size={14} className="stroke-[2.5]" />
                                    </div>
                                    <p className="text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                                        {item}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Tab 2: FAQs */}
                    {activeTab === 'faq' && (
                        <div className="grid md:grid-cols-2 gap-4">
                            {faqs.map((faq, idx) => (
                                <div key={idx} className="spec-box-3d rounded-2xl p-5 space-y-2">
                                    <div className="flex items-start gap-2">
                                        <HelpCircle size={16} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                            {faq.q}
                                        </h4>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium pl-6">
                                        {faq.a}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* ── 3D DIRECT INQUIRY CTA ── */}
                <section className="neumorphic-card-3d rounded-[36px] p-8 sm:p-14 text-center relative overflow-hidden">
                    <div className="max-w-2xl mx-auto space-y-4 relative z-10">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-wider">
                            <Sparkles size={12} /> Custom Tech-Pack Assistance
                        </span>
                        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                            Need Immediate Merchandising Support?
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-lg mx-auto">
                            Submit your tech-pack or sample requirements and our Dhaka merchandising team will provide immediate feedback and costing.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-3">
                            <Link
                                href="/contact"
                                className="bg-[#1B2B44] hover:bg-[#111C2E] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-bold py-3.5 px-8 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <span>Contact Merchandising Desk</span>
                                <ArrowRight size={15} />
                            </Link>
                            <Link
                                href="/request-quote"
                                className="bg-[#E8E1D6] hover:bg-[#DDD4C7] dark:bg-[#1E293B] dark:hover:bg-[#283548] text-slate-800 dark:text-slate-200 text-xs font-bold py-3.5 px-8 rounded-xl border border-[#D8CFC2] dark:border-white/10 transition-all active:scale-95"
                            >
                                Request Rapid Quote
                            </Link>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}
