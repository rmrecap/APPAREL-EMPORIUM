'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    CheckCircle2, Headphones, ArrowRight, Sparkles, HelpCircle
} from 'lucide-react';
import AtelierDecorations3D from '@/components/products/AtelierDecorations3D';
import Coded3DGlobe from '@/components/products/Coded3DGlobe';
import { 
    QCShield3DIcon, 
    TechPack3DIcon, 
    SourcingLayers3DIcon, 
    LogisticsTruck3DIcon, 
    Flowchart3DIcon 
} from '@/components/ui/Claymorphic3DIcons';
import { useSettings } from '@/context/SettingsContext';

export default function SupportPage() {
    const { settings } = useSettings();
    const showServiceFaqs = settings.support_buyer_faqs_protocols_enabled === 'true';
    const [activeTab, setActiveTab] = useState<'services' | 'faq'>('services');

    const supportPillars = [
        {
            icon: <SourcingLayers3DIcon size={48} />,
            title: 'Factory Sourcing & Merchandising',
            desc: 'Identifying certified leading manufacturers for each query to serve optimal pricing, MOQ scalability, and fast lead times.'
        },
        {
            icon: <TechPack3DIcon size={48} />,
            title: 'Sampling & Tech-Pack Fitting',
            desc: 'Developing proto samples, size sets, and lab dips strictly aligned with buyer tech-packs before bulk manufacturing approval.'
        },
        {
            icon: <QCShield3DIcon size={48} />,
            title: 'In-Line & Final QC (Buyer Standard)',
            desc: 'Rigorous periodic quality inspections from raw fabric yarn to stitching, needle detection, and export packaging customized to buyer demands.'
        },
        {
            icon: <LogisticsTruck3DIcon size={48} />,
            title: 'Banking, Customs & Port Logistics',
            desc: 'Complete export documentation, L/C negotiation, freight forwarding, and seamless dispatch through Dhaka and Chittagong ports.'
        }
    ];

    const workflowSteps = [
        { step: '01', title: 'Query & Costing', desc: 'Detailed bill-of-materials analysis, fabric yarn rates, and target price estimation within 24-48 hours.' },
        { step: '02', title: 'Proto & Lab Dips', desc: 'Fabric lab dips for shade matching and 1st fit proto sample development for buyer evaluation.' },
        { step: '03', title: 'Factory Audit & Order', desc: 'Selection of social & technical compliant factory with signed tech-packs and verified capacity schedule.' },
        { step: '04', title: 'In-Line Production QC', desc: 'Daily monitoring of fabric knitting/weaving, dyeing fastness, cut-to-ship ratios, and stitching tolerances.' },
        { step: '05', title: 'Pre-Shipment Inspection (PSI)', desc: 'Comprehensive Pre-Shipment Inspection (PSI) adhering strictly to buyer quality specifications and technical manuals.' },
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
            a: 'We execute thorough quality checks strictly according to buyer-specified standards covering fabric GSM, yarn consistency, shrinkage, colorfastness, seam strength, and barcode verification.'
        },
        {
            q: 'Can you source custom sustainable and organic fabrics?',
            a: 'Yes, our partner mills supply GOTS-certified 100% organic cotton, BCI cotton, recycled polyester, bamboo fiber, and OEKO-TEX Standard 100 certified eco-friendly dyes.'
        }
    ];

    return (
        <div className="min-h-screen bg-[#DDD8CF] dark:bg-[#080D1A] text-slate-800 dark:text-slate-100 transition-colors duration-500 relative overflow-hidden">
            {/* Dark mode ambient glowing fogs */}
            <div className="dark:block hidden pointer-events-none absolute inset-0 overflow-hidden z-0">
                <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-cyan-500/10 blur-[130px]" />
                <div className="absolute top-1/2 right-0 w-[540px] h-[540px] rounded-full bg-blue-600/10 blur-[160px]" />
            </div>

            {/* ── HERO BANNER: Deep Navy-Clay Atelier Banner ── */}
            <div className="bg-[#142338] dark:bg-[#071120] text-white pt-28 sm:pt-32 pb-14 sm:pb-16 relative overflow-hidden shadow-lg border-b border-white/10">
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                {/* 3D Sewing Needle, Thread & Button Floating Art */}
                <AtelierDecorations3D variant="top-right" />

                <div className="container mx-auto px-4 text-center relative z-10 max-w-4xl">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-black uppercase tracking-widest mb-4">
                        <Headphones size={13} /> Dedicated Buyer Support
                    </span>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-heading tracking-tight mb-4 text-white">
                        World-Class Trade Support &amp; Sourcing Services
                    </h1>
                    <p className="text-cyan-100/80 text-xs sm:text-sm md:text-base font-medium leading-relaxed max-w-2xl mx-auto">
                        Our seasoned merchandising, sampling, quality control, banking, and logistics professionals provide end-to-end support for international garment buyers.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-6xl space-y-16 sm:space-y-20 relative z-10">

                {/* ── 4 CORE SUPPORT PILLARS WITH 100% CODED 3D CLAY ICONS ── */}
                <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {supportPillars.map((pillar, i) => (
                        <div 
                            key={i} 
                            className="rounded-[28px] p-6 flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1.5
                            bg-[#EDE9E1] dark:bg-[#0C1628]
                            border border-white/70 dark:border-white/10
                            shadow-[10px_10px_22px_rgba(160,155,145,0.45),-8px_-8px_18px_rgba(255,255,255,0.95)]
                            dark:shadow-[0_15px_30px_rgba(0,0,0,0.6)]"
                        >
                            <div>
                                <div className="mb-4 flex items-center justify-start">
                                    {pillar.icon}
                                </div>
                                <h3 className="text-sm sm:text-base font-black text-[#1A1D20] dark:text-white mb-2 leading-tight">
                                    {pillar.title}
                                </h3>
                                <p className="text-xs text-[#4B5563] dark:text-slate-300 leading-relaxed font-medium">
                                    {pillar.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </section>

                {/* ── 3D SOURCING WORKFLOW PROCESS WITH REALISTIC FLOWCHART ── */}
                <section className="rounded-[34px] p-6 sm:p-10 space-y-8
                    bg-[#EDE9E1] dark:bg-[#0C1628]
                    border border-white/70 dark:border-white/10
                    shadow-[14px_14px_30px_rgba(160,155,145,0.45),-10px_-10px_22px_rgba(255,255,255,0.95)]
                    dark:shadow-[0_20px_40px_rgba(0,0,0,0.7)]"
                >
                    <div className="text-center max-w-xl mx-auto">
                        <span className="text-[11px] font-extrabold uppercase tracking-widest text-cyan-600 dark:text-cyan-400 block mb-1">
                            Interactive Manufacturing Flow
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black text-[#1A1D20] dark:text-white tracking-tight mb-2">
                            Our 6-Stage Sourcing Lifecycle
                        </h2>
                        <p className="text-xs sm:text-sm text-[#4B5563] dark:text-slate-300 font-medium">
                            How we ensure zero errors from initial tech-pack inquiry to port container loading.
                        </p>
                    </div>

                    {/* 100% Coded Realistic 3D Clay Flowchart matching Screenshot 2 */}
                    <div className="py-2">
                        <Flowchart3DIcon className="w-full max-w-sm sm:max-w-md mx-auto" />
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                        {workflowSteps.map((ws, idx) => (
                            <div 
                                key={idx} 
                                className="rounded-2xl p-5 flex flex-col justify-between group transition-all duration-200 hover:scale-[1.02]
                                bg-[#E6E1D7] dark:bg-[#0F1E36]
                                border border-white/50 dark:border-white/5
                                shadow-[6px_6px_14px_rgba(160,155,145,0.35),-5px_-5px_12px_rgba(255,255,255,0.85)]"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xl font-black font-mono text-cyan-600 dark:text-cyan-400">
                                            {ws.step}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                            Stage
                                        </span>
                                    </div>
                                    <h4 className="text-sm font-bold text-[#1A1D20] dark:text-white mb-1.5">
                                        {ws.title}
                                    </h4>
                                    <p className="text-xs text-[#4B5563] dark:text-slate-300 leading-relaxed font-medium">
                                        {ws.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── GLOBAL NETWORK & LOGISTICS HUBS (CODED 3D GLOBE) ── */}
                <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center rounded-[34px] p-6 sm:p-10
                    bg-[#EDE9E1] dark:bg-[#0C1628]
                    border border-white/70 dark:border-white/10
                    shadow-[14px_14px_30px_rgba(160,155,145,0.45),-10px_-10px_22px_rgba(255,255,255,0.95)]
                    dark:shadow-[0_20px_40px_rgba(0,0,0,0.7)]"
                >
                    <div className="md:col-span-5 flex items-center justify-center">
                        <Coded3DGlobe size={200} className="mx-auto" />
                    </div>
                    <div className="md:col-span-7 space-y-3">
                        <span className="text-[11px] font-extrabold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
                            Worldwide Buyer Network
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black text-[#1A1D20] dark:text-white tracking-tight">
                            Seamless Global Export &amp; Custom Sourcing
                        </h2>
                        <p className="text-xs sm:text-sm text-[#4B5563] dark:text-slate-300 leading-relaxed font-medium">
                            From Dhaka and Chittagong ports to distribution hubs across North America, Europe, the Middle East, and Asia-Pacific. We handle end-to-end export documentation, freight booking, and compliance tracking.
                        </p>
                        <div className="pt-2">
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider text-white bg-[#151D2A] hover:bg-[#0E141E] transition-all shadow-md active:scale-95"
                            >
                                <span>Get in Touch with Merchandising</span>
                                <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ── SERVICE CHECKLIST & FAQ TABS ── */}
                {showServiceFaqs && (
                    <section className="rounded-[32px] p-6 sm:p-10 space-y-8
                        bg-[#EDE9E1] dark:bg-[#0C1628]
                        border border-white/70 dark:border-white/10
                        shadow-[12px_12px_26px_rgba(160,155,145,0.4),-8px_-8px_18px_rgba(255,255,255,0.9)]"
                    >
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#CCC4B5]/40 dark:border-white/10 pb-6">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-black text-[#1A1D20] dark:text-white tracking-tight">
                                    Comprehensive Service Protocols &amp; Buyer FAQs
                                </h2>
                                <p className="text-xs text-[#4B5563] dark:text-slate-300 font-medium">
                                    Explore our standard service inclusions or review common sourcing questions.
                                </p>
                            </div>

                            {/* Tab Switcher */}
                            <div className="flex items-center gap-2 p-1.5 rounded-full bg-[#DDD7CB] dark:bg-[#121E36]">
                                <button
                                    onClick={() => setActiveTab('services')}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === 'services'
                                        ? 'bg-[#151D2A] text-white shadow-xs'
                                        : 'text-[#4B5563] dark:text-slate-300 hover:text-slate-900'
                                        }`}
                                >
                                    Service Checklist
                                </button>
                                <button
                                    onClick={() => setActiveTab('faq')}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === 'faq'
                                        ? 'bg-[#151D2A] text-white shadow-xs'
                                        : 'text-[#4B5563] dark:text-slate-300 hover:text-slate-900'
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
                                    <div key={idx} className="rounded-2xl p-4 flex items-start gap-3 bg-[#E6E1D7] dark:bg-[#0F1E36] border border-white/50 dark:border-white/5 shadow-xs">
                                        <div className="mt-0.5 w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 flex items-center justify-center shrink-0">
                                            <CheckCircle2 size={14} className="stroke-[2.5]" />
                                        </div>
                                        <p className="text-xs text-[#2D2A26] dark:text-slate-200 font-medium leading-relaxed">
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
                                    <div key={idx} className="rounded-2xl p-5 space-y-2 bg-[#E6E1D7] dark:bg-[#0F1E36] border border-white/50 dark:border-white/5 shadow-xs">
                                        <div className="flex items-start gap-2">
                                            <HelpCircle size={16} className="text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                                            <h4 className="text-xs sm:text-sm font-bold text-[#1A1D20] dark:text-white">
                                                {faq.q}
                                            </h4>
                                        </div>
                                        <p className="text-xs text-[#4B5563] dark:text-slate-300 leading-relaxed font-medium pl-6">
                                            {faq.a}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* ── 3D DIRECT INQUIRY CTA ── */}
                <section className="rounded-[36px] p-8 sm:p-14 text-center relative overflow-hidden
                    bg-[#EDE9E1] dark:bg-[#0C1628]
                    border border-white/70 dark:border-white/10
                    shadow-[14px_14px_30px_rgba(160,155,145,0.45),-10px_-10px_22px_rgba(255,255,255,0.95)]
                    dark:shadow-[0_20px_40px_rgba(0,0,0,0.7)]"
                >
                    <div className="max-w-2xl mx-auto space-y-4 relative z-10">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 text-[10px] font-black uppercase tracking-wider">
                            <Sparkles size={12} /> Custom Tech-Pack Assistance
                        </span>
                        <h2 className="text-2xl sm:text-4xl font-black text-[#1A1D20] dark:text-white tracking-tight">
                            Need Immediate Merchandising Support?
                        </h2>
                        <p className="text-xs sm:text-sm text-[#4B5563] dark:text-slate-300 font-medium leading-relaxed max-w-lg mx-auto">
                            Submit your tech-pack or sample requirements and our Dhaka merchandising team will provide immediate feedback and costing.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-3">
                            <Link
                                href="/contact"
                                className="bg-[#151D2A] hover:bg-[#0E141E] text-white text-xs font-bold py-3.5 px-8 rounded-full shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <span>Contact Merchandising Desk</span>
                                <ArrowRight size={15} />
                            </Link>
                            <Link
                                href="/contact"
                                className="bg-[#DDD7CB] hover:bg-[#CCC4B5] dark:bg-[#1E293B] dark:hover:bg-[#283548] text-slate-800 dark:text-slate-200 text-xs font-bold py-3.5 px-8 rounded-full border border-white/60 dark:border-white/10 transition-all active:scale-95"
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
