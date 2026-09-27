'use client';

import React from 'react';
import Link from 'next/link';
import {
    Building2, Globe, Users, Trophy, Target, Eye, Heart,
    Calendar, CheckCircle2, Factory, Ship, ArrowRight, ShieldCheck, Sparkles
} from 'lucide-react';
import Certifications from '@/components/home/Certifications';
import { useSettings } from '@/context/SettingsContext';
import AtelierDecorations3D from '@/components/products/AtelierDecorations3D';

export default function AboutPage() {
    const { settings } = useSettings();

    const stats = [
        { icon: <Building2 className="w-6 h-6" />, label: 'Years Excellence', val: settings.founded_year ? (new Date().getFullYear() - parseInt(settings.founded_year)) + '+' : '10+' },
        { icon: <Globe className="w-6 h-6" />, label: 'Export Destinations', val: '14+ Countries' },
        { icon: <Users className="w-6 h-6" />, label: 'Export Compliance', val: '100% Certified' },
        { icon: <Trophy className="w-6 h-6" />, label: 'Client Retention', val: '98.5%' },
    ];

    const timeline = [
        { year: '2015', title: 'The Foundation', desc: 'Apparel Emporium was established in Dhaka with a vision to revolutionize garment sourcing and bridge Bangladesh with global retail brands.' },
        { year: '2017', title: 'Global Expansion', desc: 'Extended operations to North American and Scandinavian markets with dedicated sampling and tech-pack development ateliers.' },
        { year: '2020', title: 'Supply Chain Digitization', desc: 'Integrated real-time production tracking, ERP quality inspections, and digital buyer tech-pack approvals.' },
        { year: '2024+', title: 'Sustainable Horizon', desc: 'Partnering exclusively with LEED-certified, OEKO-TEX standard compliant eco-friendly knit and woven manufacturing units.' },
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
                        <Sparkles size={13} /> Our Heritage &amp; Craftsmanship
                    </span>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-heading tracking-tight mb-4 text-white">
                        Bridging Excellence from <br className="hidden sm:inline" />
                        <span className="text-blue-400">Bangladesh</span> to Global Brands
                    </h1>
                    <p className="text-blue-100/90 text-xs sm:text-sm md:text-base font-medium leading-relaxed max-w-2xl mx-auto">
                        {settings.company_tagline || '100% Export Oriented Readymade Garments, Home Textiles, Footwear and Accessories Buying House.'}
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-6xl space-y-16 sm:space-y-24">

                {/* ── 3D STORY & IDENTITY SHOWCASE ── */}
                <section className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* 3D Recessed Showcase Frame */}
                    <div className="relative group">
                        <div className="neumorphic-card-3d rounded-[32px] p-4 sm:p-5 relative">
                            <div className="relative aspect-[4/3] rounded-[24px] pedestal-stage-3d overflow-hidden flex items-center justify-center p-3">
                                <img
                                    src="/images/3d/production_process_light.jpg"
                                    alt="Garment Manufacturing Process"
                                    className="w-full h-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-105 dark:hidden"
                                />
                                <img
                                    src="/images/3d/production_process_dark.jpg"
                                    alt="Garment Manufacturing Process"
                                    className="w-full h-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-105 hidden dark:block"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none rounded-2xl" />
                                <div className="absolute bottom-4 left-5 right-5 text-white flex items-center justify-between text-xs font-bold">
                                    <span>Dhaka Sourcing Center</span>
                                    <span className="text-blue-300">ISO Certified Atelier</span>
                                </div>
                            </div>

                            {/* Floating Award Badge */}
                            <div className="absolute -bottom-5 -left-4 sm:left-4 arch-badge-3d p-4 rounded-2xl flex items-center gap-3 shadow-xl max-w-xs">
                                <div className="w-10 h-10 bg-[#1B2B44] dark:bg-blue-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-md">
                                    <Trophy size={20} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">Recognition</p>
                                    <p className="text-xs font-bold text-slate-900 dark:text-white">Trusted Global Buying House</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Story Content */}
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                            <ShieldCheck size={16} /> Decades of Textile Mastery
                        </div>
                        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                            Crafting a Legacy in <br />
                            <span className="text-blue-600 dark:text-blue-400">Sustainable Manufacturing</span>
                        </h2>
                        <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                            <p>
                                {settings.about_story_p1 || "Spending many years in the field of readymade garments, home textiles, footwear and accessories we, highly experienced professional team understand and realize the problems which most of the overseas buyers are facing today and to provide the right solutions we formed Apparel Emporium in 2015."}
                            </p>
                            <p>
                                {settings.about_story_p2 || "As a trusted and reliable Trading Company we source overseas Buyers/Importers to deal with merchandise as on their requirements from query to ship-out through our experienced professionals and trade associates."}
                            </p>
                        </div>

                        {/* Feature Badges */}
                        <div className="grid grid-cols-3 gap-3 pt-2">
                            {[
                                'Audited Factories',
                                'QC Management',
                                'Global Logistics'
                            ].map((f, i) => (
                                <div key={i} className="spec-box-3d rounded-xl p-3 text-center">
                                    <CheckCircle2 size={16} className="text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                                    <span className="text-[11px] font-bold text-slate-900 dark:text-white block">{f}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── 3D STRATEGIC CORE PILLARS (Mission, Vision, Values) ── */}
                <section className="space-y-8">
                    <div className="text-center max-w-2xl mx-auto">
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                            Our Strategic Pillars
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                            The principles that guide our client partnerships and factory network every day.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
                                title: 'Our Mission',
                                desc: 'To source leading manufacturers and export global standard apparel and textiles to international buyers with 100% transparency, on-time delivery, and uncompromising quality.'
                            },
                            {
                                icon: <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
                                title: 'Our Vision',
                                desc: 'To become the premier garments buying and sourcing house in South Asia, universally recognized for ethical trade, technological transparency, and green supply chains.'
                            },
                            {
                                icon: <Heart className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
                                title: 'Our Values',
                                desc: 'Commitment, integrity, and client ownership. We consider our buyers and factory craftsmen as unified stakeholders in long-term global fashion success.'
                            }
                        ].map((pillar, i) => (
                            <div key={i} className="neumorphic-card-3d rounded-[28px] p-6 sm:p-7 flex flex-col justify-between">
                                <div>
                                    <div className="w-12 h-12 rounded-2xl pedestal-stage-3d flex items-center justify-center mb-5 shadow-xs">
                                        {pillar.icon}
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 uppercase tracking-wide">
                                        {pillar.title}
                                    </h3>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                        {pillar.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── 3D EVOLUTION TIMELINE ── */}
                <section className="sidebar-3d-panel rounded-[32px] p-6 sm:p-10 space-y-8">
                    <div className="text-center max-w-xl mx-auto">
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-1.5">
                            Production Evolution
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                            How we grew from a local sourcing team into a trusted international apparel exporter.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {timeline.map((item, idx) => (
                            <div key={idx} className="spec-box-3d rounded-2xl p-5 flex flex-col justify-between">
                                <div>
                                    <span className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400 block mb-1.5">
                                        {item.year}
                                    </span>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                                        {item.title}
                                    </h4>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── 3D KEY METRICS ── */}
                <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {stats.map((s, i) => (
                        <div key={i} className="neumorphic-card-3d rounded-[24px] p-5 sm:p-6 text-center">
                            <div className="w-11 h-11 mx-auto rounded-xl pedestal-stage-3d flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3 shadow-xs">
                                {s.icon}
                            </div>
                            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-1">
                                {s.val}
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                {s.label}
                            </div>
                        </div>
                    ))}
                </section>

                {/* ── 3D CERTIFICATIONS & COMPLIANCE ── */}
                <div className="pt-4">
                    <Certifications data={null} />
                </div>

                {/* ── 3D CALL TO ACTION CARD ── */}
                <section className="neumorphic-card-3d rounded-[36px] p-8 sm:p-14 text-center relative overflow-hidden">
                    <div className="max-w-2xl mx-auto space-y-4 relative z-10">
                        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                            Ready to Elevate Your Garment Sourcing?
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-lg mx-auto">
                            Join international fashion retailers and distributors who rely on Apparel Emporium for factory audited reliability and custom tech-pack execution.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-3">
                            <Link
                                href="/contact"
                                className="bg-[#1B2B44] hover:bg-[#111C2E] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-bold py-3.5 px-8 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <span>Start Sourcing Inquiry</span>
                                <ArrowRight size={15} />
                            </Link>
                            <Link
                                href="/products"
                                className="bg-[#E8E1D6] hover:bg-[#DDD4C7] dark:bg-[#1E293B] dark:hover:bg-[#283548] text-slate-800 dark:text-slate-200 text-xs font-bold py-3.5 px-8 rounded-xl border border-[#D8CFC2] dark:border-white/10 transition-all active:scale-95"
                            >
                                Browse 3D Catalog
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
