'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
    ShieldCheck, 
    Award, 
    Leaf 
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
    showDecor?: boolean;
    showIcons?: boolean;
}

export default function CoreValues3D({ headings, data, showDecor = false, showIcons = false }: CoreValuesProps) {
    const parsedData = typeof data === 'string' ? (() => { try { return JSON.parse(data); } catch { return []; } })() : (data || []);

    const sectionHeading = (headings?.core_values_heading && headings.core_values_heading !== 'OUR CORE VALUES') 
        ? headings.core_values_heading 
        : 'Values of Apparel Emporium';

    const defaultSubheading = "We are able to offer customers great quality and value, an easy and inspirational trading experience.\nWe are passionate about serving our customers and getting better every day. The relationships we build with our customers are an important part of why they keep coming back to us and we believe a good reputation is an impression.";

    const sectionSubheading = (headings?.core_values_subheading && !headings.core_values_subheading.includes('inspiring trading experience. Our relationships are built on trust'))
        ? headings.core_values_subheading
        : defaultSubheading;

    const defaultValues = [
        {
            id: 'ownership',
            title: 'Ownership',
            desc: 'We believe in ownership. We are all owners in the business and think of our employment at the company as a two-way street.',
            emblemLight: '/images/3d/emblem_ownership_light.png',
            emblemDark: '/images/3d/emblem_ownership_dark.png',
            glowColor: 'dark:border-blue-400/60 dark:shadow-[0_0_30px_rgba(59,130,246,0.35),inset_0_0_15px_rgba(59,130,246,0.1)]',
            icon: ShieldCheck
        },
        {
            id: 'excellence',
            title: 'Excellence',
            desc: 'We go all-out to excel in every aspect of our business and approach every challenge with a determination to succeed.',
            emblemLight: '/images/3d/emblem_excellence_light.png',
            emblemDark: '/images/3d/emblem_excellence_dark.png',
            glowColor: 'dark:border-cyan-400/60 dark:shadow-[0_0_30px_rgba(6,182,212,0.35),inset_0_0_15px_rgba(6,182,212,0.1)]',
            icon: Award
        },
        {
            id: 'social',
            title: 'Social Responsibility',
            desc: 'We care for the future generation of our beloved country. Our Environment care is always ensured by green technology and management.',
            emblemLight: '/images/3d/emblem_social_light.png',
            emblemDark: '/images/3d/emblem_social_dark.png',
            glowColor: 'dark:border-emerald-400/60 dark:shadow-[0_0_30px_rgba(16,185,129,0.35),inset_0_0_15px_rgba(16,185,129,0.1)]',
            icon: Leaf
        }
    ];

    const values = defaultValues;

    // Track active tilt per card
    const [cardTilts, setCardTilts] = useState<Record<string, { x: number; y: number }>>({});

    const handleMouseMove = (id: string, e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        const rotateY = (x - 0.5) * 8;
        const rotateX = -(y - 0.5) * 8;

        setCardTilts(prev => ({ ...prev, [id]: { x: rotateX, y: rotateY } }));
    };

    const handleMouseLeave = (id: string) => {
        setCardTilts(prev => ({ ...prev, [id]: { x: 0, y: 0 } }));
    };

    return (
        <section 
            id="core-values-3d"
            aria-labelledby="core-values-heading"
            className="relative py-16 sm:py-24 bg-[#DDD8CF] dark:bg-[#080D1A] transition-colors duration-500 overflow-hidden border-t border-slate-300/40 dark:border-white/5"
        >
            {/* Ambient Background Lighting */}
            <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* ── FLOATING 3D CRAFT ELEMENTS (Matching User Mockup) ── */}
            {showDecor && (
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
            )}

            <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">

                {/* Section Header matching Mockup */}
                <div className="text-center max-w-4xl mx-auto mb-12 sm:mb-16">
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
                        <div className="mt-4 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto space-y-2">
                            {sectionSubheading.split('\n').map((line, idx) => (
                                <p key={idx}>{line}</p>
                            ))}
                        </div>
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
                                    onMouseMove={(e) => handleMouseMove(val.id, e)}
                                    onMouseLeave={() => handleMouseLeave(val.id)}
                                    className={`relative rounded-[32px] p-8 sm:p-9 transition-all duration-300 flex flex-col items-center justify-start text-center min-h-[380px]
                                        bg-[#F3EFE8]/95 dark:bg-[#0A1222]/95
                                        border-4 border-[#FAF7F2] ${val.glowColor || 'dark:border-cyan-400/50'}
                                        shadow-[0_15px_35px_rgba(0,0,0,0.1),inset_0_2px_4px_rgba(255,255,255,0.8)]
                                        hover:border-primary/40`}
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

                                    {/* Title matching Mockup (100% Coded & Authentic) */}
                                    {val.title && (
                                        <h3 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white mb-3">
                                            {val.title}
                                        </h3>
                                    )}

                                    {/* Description matching Mockup (100% Coded & Authentic) */}
                                    {val.desc && (
                                        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium max-w-[280px]">
                                            {val.desc}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
}
