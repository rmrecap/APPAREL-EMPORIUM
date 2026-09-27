'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
    X, 
    ShieldCheck, 
    Award, 
    Leaf, 
    CheckCircle2, 
    ArrowRight
} from 'lucide-react';
import { 
    GarmentButton3D, 
    NeedleWithThread3D, 
    Hanger3D, 
    ThreadSpool3D, 
    GenderSilhouette3D 
} from './Garment3DElements';

interface CoreValuesProps {
    headings?: Record<string, string>;
    data?: any;
}

export default function CoreValues3D({ headings, data }: CoreValuesProps) {
    const parsedData = typeof data === 'string' ? (() => { try { return JSON.parse(data); } catch { return []; } })() : (data || []);

    const sectionHeading = headings?.core_values_heading || 'OUR CORE VALUES';
    const sectionSubheading = headings?.core_values_subheading || 'We offer great quality, value, and an inspiring trading experience. Our relationships are built on trust and exceptional service.';

    const defaultValues = [
        {
            id: 'ownership',
            title: 'Ownership',
            desc: 'We believe in ownership and mutual growth across every partnership.',
            emblemLight: '/images/3d/emblem_ownership_light.png',
            emblemDark: '/images/3d/emblem_ownership_dark.png',
            glowColor: 'dark:border-blue-400/60 dark:shadow-[0_0_30px_rgba(59,130,246,0.35),inset_0_0_15px_rgba(59,130,246,0.1)]',
            icon: ShieldCheck
        },
        {
            id: 'excellence',
            title: 'Excellence',
            desc: 'We go all-out to excel in every aspect of garment manufacturing.',
            emblemLight: '/images/3d/emblem_excellence_light.png',
            emblemDark: '/images/3d/emblem_excellence_dark.png',
            glowColor: 'dark:border-cyan-400/60 dark:shadow-[0_0_30px_rgba(6,182,212,0.35),inset_0_0_15px_rgba(6,182,212,0.1)]',
            icon: Award
        },
        {
            id: 'social',
            title: 'Social Responsibility',
            desc: 'Ensuring a sustainable future through green technology and ethical practices.',
            emblemLight: '/images/3d/emblem_social_light.png',
            emblemDark: '/images/3d/emblem_social_dark.png',
            glowColor: 'dark:border-emerald-400/60 dark:shadow-[0_0_30px_rgba(16,185,129,0.35),inset_0_0_15px_rgba(16,185,129,0.1)]',
            icon: Leaf
        }
    ];

    const values = Array.isArray(parsedData) && parsedData.length > 0 ? parsedData : defaultValues;

    // Track active tilt per card
    const [cardTilts, setCardTilts] = useState<Record<string, { x: number; y: number }>>({});
    const [activeModalValue, setActiveModalValue] = useState<string | null>(null);

    const handleMouseMove = (id: string, e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        const rotateY = (x - 0.5) * 10;
        const rotateX = -(y - 0.5) * 10;

        setCardTilts(prev => ({ ...prev, [id]: { x: rotateX, y: rotateY } }));
    };

    const handleMouseLeave = (id: string) => {
        setCardTilts(prev => ({ ...prev, [id]: { x: 0, y: 0 } }));
    };

    // Close modal on Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setActiveModalValue(null);
        };
        if (activeModalValue) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [activeModalValue]);

    return (
        <section 
            id="core-values-3d"
            aria-labelledby="core-values-heading"
            className="relative py-16 sm:py-24 bg-[#EAE7E0] dark:bg-[#060B16] transition-colors duration-500 overflow-hidden border-t border-slate-300/40 dark:border-white/5"
        >
            {/* Ambient Background Lighting */}
            <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* ── FLOATING 3D CRAFT ELEMENTS (Matching User Mockup) ── */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden z-0 hidden lg:block">
                {/* Needle & Thread (Top Left) */}
                <div className="absolute top-8 left-[7%] animate-[bounce_8s_infinite_ease-in-out]">
                    <NeedleWithThread3D size={84} rotation={-30} />
                </div>

                {/* Garment Button (Left Edge) */}
                <div className="absolute top-[42%] left-[4%] animate-[bounce_9s_infinite_ease-in-out_1s]">
                    <GarmentButton3D size={46} rotation={-15} />
                </div>

                {/* Garment Button 2 (Left Lower) */}
                <div className="absolute top-[56%] left-[6%] animate-[bounce_7s_infinite_ease-in-out_0.5s]">
                    <GarmentButton3D size={38} rotation={25} />
                </div>

                {/* Clothes Hanger (Bottom Left) */}
                <div className="absolute bottom-10 left-[8%] animate-[bounce_8.5s_infinite_ease-in-out_2s]">
                    <Hanger3D size={80} rotation={-15} />
                </div>

                {/* Thread Spool (Bottom Center-Left) */}
                <div className="absolute bottom-6 left-[28%] animate-[bounce_7.5s_infinite_ease-in-out_1.5s]">
                    <ThreadSpool3D size={64} rotation={-20} threadColor="#3B82F6" />
                </div>

                {/* Family Line Silhouette (Bottom Center) matching Mockup! */}
                <div className="absolute bottom-4 left-[46%] animate-[bounce_9s_infinite_ease-in-out_2.5s]">
                    <GenderSilhouette3D gender="family" size={48} />
                </div>

                {/* Buttons (Top Right) */}
                <div className="absolute top-10 right-[20%] animate-[bounce_6.5s_infinite_ease-in-out_0.8s]">
                    <GarmentButton3D size={42} rotation={20} />
                </div>

                {/* Thread Spool (Top Right) */}
                <div className="absolute top-14 right-[8%] animate-[bounce_8s_infinite_ease-in-out_1.2s]">
                    <ThreadSpool3D size={60} rotation={25} threadColor="#10B981" />
                </div>

                {/* Clothes Hanger (Right Edge) */}
                <div className="absolute top-[44%] right-[4%] animate-[bounce_9s_infinite_ease-in-out_1.8s]">
                    <Hanger3D size={86} rotation={12} />
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">

                {/* Section Header matching Mockup */}
                <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
                    {sectionHeading && (
                        <h2 
                            id="core-values-heading"
                            className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight font-heading
                            text-slate-900 dark:text-[#E0F2FE] dark:drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                        >
                            {sectionHeading}
                        </h2>
                    )}
                    {sectionSubheading && (
                        <p className="mt-3 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
                            {sectionSubheading}
                        </p>
                    )}
                </div>

                {/* 3 Core Value Cards matching Mockup */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
                    {values.map((val: any) => {
                        const tilt = cardTilts[val.id] || { x: 0, y: 0 };
                        const isHovered = tilt.x !== 0 || tilt.y !== 0;

                        return (
                            <div 
                                key={val.id} 
                                style={{ perspective: '1200px' }}
                                className="w-full"
                            >
                                <div
                                    onClick={() => setActiveModalValue(val.id)}
                                    onMouseMove={(e) => handleMouseMove(val.id, e)}
                                    onMouseLeave={() => handleMouseLeave(val.id)}
                                    className={`relative rounded-[32px] p-8 sm:p-9 transition-all duration-300 flex flex-col items-center justify-between text-center cursor-pointer min-h-[380px]
                                        bg-[#F3EFE8]/95 dark:bg-[#0A1222]/95
                                        border-4 border-[#FAF7F2] ${val.glowColor || 'dark:border-cyan-400/50'}
                                        shadow-[0_15px_35px_rgba(0,0,0,0.1),inset_0_2px_4px_rgba(255,255,255,0.8)]
                                        hover:border-primary/40 dark:hover:scale-102`}
                                    style={{
                                        transform: isHovered 
                                            ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.02, 1.02, 1.02)` 
                                            : 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
                                        transformStyle: 'preserve-3d',
                                        transition: isHovered ? 'transform 0.12s ease-out' : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                        willChange: 'transform',
                                    }}
                                >
                                    {/* 3D Emblem matching Mockup (100% Transparent PNG, Realistic 3D Popout) */}
                                    <div 
                                        className="relative w-32 h-32 sm:w-36 sm:h-36 mb-6 flex items-center justify-center transition-transform duration-300"
                                        style={{ transform: isHovered ? 'translateZ(35px) scale(1.08)' : 'translateZ(15px) scale(1)' }}
                                    >
                                        {/* Ambient soft glow background behind the 3D emblem */}
                                        <div className={`absolute inset-2 rounded-full blur-xl pointer-events-none opacity-40 dark:opacity-60 transition-opacity duration-500
                                            ${val.id === 'ownership' ? 'bg-blue-500/30' : val.id === 'excellence' ? 'bg-cyan-400/30' : 'bg-emerald-500/30'}`} 
                                        />

                                        {/* Light Mode 3D Emblem */}
                                        <div className="absolute inset-0 dark:opacity-0 opacity-100 transition-opacity duration-500 flex items-center justify-center">
                                            <Image
                                                src={val.emblemLight || '/images/3d/emblem_ownership_light.png'}
                                                alt={val.title}
                                                fill
                                                sizes="160px"
                                                className="object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.18)]"
                                                priority
                                            />
                                        </div>

                                        {/* Dark Mode 3D Emblem with Vivid Theme-Matched Glow */}
                                        <div className="absolute inset-0 opacity-0 dark:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                                            <Image
                                                src={val.emblemDark || '/images/3d/emblem_ownership_dark.png'}
                                                alt={val.title}
                                                fill
                                                sizes="160px"
                                                className={`object-contain transition-all duration-300 ${
                                                    val.id === 'ownership' 
                                                        ? 'drop-shadow-[0_0_24px_rgba(59,130,246,0.65)]' 
                                                        : val.id === 'excellence' 
                                                            ? 'drop-shadow-[0_0_24px_rgba(6,182,212,0.65)]' 
                                                            : 'drop-shadow-[0_0_24px_rgba(16,185,129,0.65)]'
                                                }`}
                                                priority
                                            />
                                        </div>
                                    </div>

                                    {/* Title matching Mockup (100% Coded & Editable from Admin) */}
                                    {val.title && (
                                        <h3 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white mb-3">
                                            {val.title}
                                        </h3>
                                    )}

                                    {/* Description matching Mockup (100% Coded & Editable from Admin) */}
                                    {val.desc && (
                                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-[260px]">
                                            {val.desc}
                                        </p>
                                    )}

                                    {/* Click Indicator */}
                                    <div className="mt-5 text-[11px] font-bold text-primary dark:text-cyan-400 flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                        <span>Learn more</span>
                                        <ArrowRight size={12} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>

            {/* ── MODAL: VALUE COMMITMENTS ── */}
            {activeModalValue && (
                <div 
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="value-modal-title"
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
                >
                    <div 
                        className="fixed inset-0 bg-slate-950/75 backdrop-blur-md transition-opacity"
                        onClick={() => setActiveModalValue(null)}
                    />

                    <div className="relative w-full max-w-lg bg-white dark:bg-[#121826] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-200">
                        {(() => {
                            const val = values.find((v: any) => v.id === activeModalValue) || values[0];
                            return (
                                <>
                                    <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-start justify-between bg-gradient-to-r from-slate-50 to-white dark:from-[#0F1420] dark:to-[#121826]">
                                        <div>
                                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary dark:text-cyan-400">
                                                Core Value Commitment
                                            </span>
                                            <h3 id="value-modal-title" className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading mt-0.5">
                                                {val.title}
                                            </h3>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setActiveModalValue(null)}
                                            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <div className="p-6 space-y-4">
                                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                            {val.desc}
                                        </p>
                                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-white/5 space-y-2.5">
                                            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                                                Operational Practice:
                                            </span>
                                            <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                                <span>100% compliant export apparel sourcing aligned with international buyer codes of conduct.</span>
                                            </div>
                                            <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                                <span>AQL 1.5 - 2.5 final inspection benchmarks with comprehensive photographic audit reports.</span>
                                            </div>
                                            <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                                <span>Long-term strategic partnership model focusing on transparent costing and timely shipment.</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-5 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0F1420] flex items-center justify-between">
                                        <button
                                            type="button"
                                            onClick={() => setActiveModalValue(null)}
                                            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/5 transition-colors"
                                        >
                                            Close
                                        </button>
                                        <Link
                                            href="/about"
                                            onClick={() => setActiveModalValue(null)}
                                            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-primary hover:bg-blue-900 text-white dark:bg-cyan-600 dark:hover:bg-cyan-500 transition-colors shadow-sm"
                                        >
                                            <span>About Company</span>
                                            <ArrowRight size={13} />
                                        </Link>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}
        </section>
    );
}
