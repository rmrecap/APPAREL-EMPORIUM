'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
    GarmentButton3D, 
    NeedleWithThread3D, 
    Hanger3D, 
    ThreadSpool3D, 
    GenderSilhouette3D 
} from './Garment3DElements';

interface OurProductsProps {
    headings?: Record<string, string>;
    data?: any;
}

export default function OurProducts3D({ headings, data }: OurProductsProps) {
    // Dynamic settings from Admin or defaults
    const parsedData = typeof data === 'string' ? (() => { try { return JSON.parse(data); } catch { return []; } })() : (data || []);
    
    const sectionHeading = headings?.our_products_heading || 'OUR PRODUCTS';
    const btnText = headings?.our_products_btn_text || 'VIEW ALL PRODUCTS';
    const btnUrl = headings?.our_products_btn_url || '/products';

    const defaultCategories = [
        {
            id: 'knit',
            title: 'KNIT',
            tag: 'MEN • WOMEN • KIDS',
            url: '/products?category=knitwear',
            imgLight: '/images/3d/cluster_knit_light.jpg',
            imgDark: '/images/3d/cluster_knit_dark.jpg',
            alt: 'Knit Garments - T-shirts, Polo Shirts, Underwear'
        },
        {
            id: 'woven',
            title: 'WOVEN',
            tag: 'MEN • WOMEN • KIDS',
            url: '/products?category=woven',
            imgLight: '/images/3d/cluster_woven_light.jpg',
            imgDark: '/images/3d/cluster_woven_dark.jpg',
            alt: 'Woven Garments - Denim Jackets, Shirts, Trousers'
        },
        {
            id: 'sweater',
            title: 'SWEATER',
            tag: 'MEN • WOMEN • KIDS',
            url: '/products?category=sweater',
            imgLight: '/images/3d/cluster_sweater_light.jpg',
            imgDark: '/images/3d/cluster_sweater_dark.jpg',
            alt: 'Sweaters - Turtlenecks, Cardigans, Outerwear'
        }
    ];

    const categories = Array.isArray(parsedData) && parsedData.length > 0 ? parsedData : defaultCategories;

    // Track active tilt per card
    const [cardTilts, setCardTilts] = useState<Record<string, { x: number; y: number }>>({});

    const handleMouseMove = (id: string, e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        const rotateY = (x - 0.5) * 12;
        const rotateX = -(y - 0.5) * 12;

        setCardTilts(prev => ({ ...prev, [id]: { x: rotateX, y: rotateY } }));
    };

    const handleMouseLeave = (id: string) => {
        setCardTilts(prev => ({ ...prev, [id]: { x: 0, y: 0 } }));
    };

    return (
        <section 
            id="our-products-3d"
            aria-labelledby="our-products-heading"
            className="relative py-16 sm:py-24 bg-[#EAE7E0] dark:bg-[#060B16] transition-colors duration-500 overflow-hidden border-t border-slate-300/40 dark:border-white/5"
        >
            {/* Ambient Lighting in Dark Mode */}
            <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

            {/* ── FLOATING 3D DECORATIVE ELEMENTS (Matching Mockup) ── */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden z-0 hidden lg:block">
                {/* Needle & Thread (Top Left) */}
                <div className="absolute top-8 left-[6%] animate-[bounce_8s_infinite_ease-in-out]">
                    <NeedleWithThread3D size={84} rotation={-45} />
                </div>

                {/* Male Line Silhouette (Left Side) */}
                <div className="absolute top-[45%] left-[4%] animate-[bounce_9s_infinite_ease-in-out_1s]">
                    <GenderSilhouette3D gender="male" size={32} />
                </div>

                {/* Garment Button (Top Center-Left) */}
                <div className="absolute top-12 left-[22%] animate-[bounce_6.5s_infinite_ease-in-out_0.5s]">
                    <GarmentButton3D size={44} rotation={-15} />
                </div>

                {/* Clothes Hanger (Top Right) */}
                <div className="absolute top-10 right-[8%] animate-[bounce_7.5s_infinite_ease-in-out_1.5s]">
                    <Hanger3D size={82} rotation={15} />
                </div>

                {/* Female Line Silhouette (Right Side) */}
                <div className="absolute top-[45%] right-[4%] animate-[bounce_9s_infinite_ease-in-out_2s]">
                    <GenderSilhouette3D gender="female" size={32} />
                </div>

                {/* Garment Button (Top Right) */}
                <div className="absolute top-16 right-[24%] animate-[bounce_7s_infinite_ease-in-out_0.8s]">
                    <GarmentButton3D size={48} rotation={25} />
                </div>

                {/* Clothes Hanger (Bottom Left) */}
                <div className="absolute bottom-10 left-[22%] animate-[bounce_8s_infinite_ease-in-out_2.5s]">
                    <Hanger3D size={76} rotation={-18} />
                </div>

                {/* Thread Spool (Bottom Right) */}
                <div className="absolute bottom-12 right-[10%] animate-[bounce_8.5s_infinite_ease-in-out_1.2s]">
                    <ThreadSpool3D size={62} rotation={22} threadColor="#06B6D4" />
                </div>

                {/* Garment Buttons (Bottom) */}
                <div className="absolute bottom-6 left-[8%] animate-[bounce_6s_infinite_ease-in-out_1.8s]">
                    <GarmentButton3D size={52} rotation={45} />
                </div>
                <div className="absolute bottom-8 right-[26%] animate-[bounce_7s_infinite_ease-in-out_0.3s]">
                    <GarmentButton3D size={38} rotation={-30} />
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">

                {/* Section Heading matching Mockup */}
                {sectionHeading && (
                    <div className="text-center mb-10 sm:mb-14">
                        <h2 
                            id="our-products-heading"
                            className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight font-heading
                            text-slate-900 dark:text-[#E0F2FE] dark:drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                        >
                            {sectionHeading}
                        </h2>
                    </div>
                )}

                {/* 3 Columns Category 3D Cards Grid matching Mockup */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
                    {categories.map((cat: any) => {
                        const tilt = cardTilts[cat.id] || { x: 0, y: 0 };
                        const isHovered = tilt.x !== 0 || tilt.y !== 0;

                        return (
                            <div 
                                key={cat.id} 
                                style={{ perspective: '1200px' }}
                                className="w-full"
                            >
                                <Link
                                    href={cat.url || '/products'}
                                    className="block group focus:outline-hidden"
                                >
                                    <div
                                        onMouseMove={(e) => handleMouseMove(cat.id, e)}
                                        onMouseLeave={() => handleMouseLeave(cat.id)}
                                        className="relative rounded-[32px] p-6 sm:p-7 transition-all duration-300 flex flex-col items-center justify-between
                                            bg-[#F3EFE8]/95 dark:bg-[#0A1222]/95
                                            border-4 border-[#FAF7F2] dark:border-cyan-400/50
                                            shadow-[0_15px_35px_rgba(0,0,0,0.1),inset_0_2px_4px_rgba(255,255,255,0.8)]
                                            dark:shadow-[0_0_30px_rgba(6,182,212,0.3),inset_0_0_20px_rgba(6,182,212,0.12)]
                                            hover:border-primary/50 dark:hover:border-cyan-400 dark:hover:shadow-[0_0_40px_rgba(6,182,212,0.5)]"
                                        style={{
                                            transform: isHovered 
                                                ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.02, 1.02, 1.02)` 
                                                : 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
                                            transformStyle: 'preserve-3d',
                                            transition: isHovered ? 'transform 0.12s ease-out' : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                            willChange: 'transform',
                                        }}
                                    >
                                        {/* Recessed 3D Apparel Cluster Visual (Pure image, NO baked text) */}
                                        <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden mb-6
                                            bg-[#F2ECE4] dark:bg-[#0A1222]
                                            border border-stone-200/80 dark:border-cyan-500/20
                                            shadow-[inset_0_2px_6px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_4px_12px_rgba(0,0,0,0.6)]"
                                        >
                                            {/* Light Image */}
                                            <div className="absolute inset-0 dark:opacity-0 opacity-100 transition-opacity duration-500">
                                                <Image
                                                    src={cat.imgLight || '/images/3d/cluster_knit_light.jpg'}
                                                    alt={cat.alt || cat.title}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, 350px"
                                                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                                    quality={95}
                                                />
                                            </div>
                                            {/* Dark Image */}
                                            <div className="absolute inset-0 opacity-0 dark:opacity-100 transition-opacity duration-500">
                                                <Image
                                                    src={cat.imgDark || '/images/3d/cluster_knit_dark.jpg'}
                                                    alt={cat.alt || cat.title}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, 350px"
                                                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                                    quality={95}
                                                />
                                            </div>
                                        </div>

                                        {/* Sub-tag Pill (100% Coded & Editable from Admin, NO duplicate text) */}
                                        {cat.tag && (
                                            <div className="mb-3">
                                                <span className="inline-block px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider
                                                    bg-white/80 text-slate-700 border border-slate-300/60 shadow-xs
                                                    dark:bg-slate-900/80 dark:text-cyan-300 dark:border-cyan-500/40"
                                                >
                                                    {cat.tag}
                                                </span>
                                            </div>
                                        )}

                                        {/* Category Title matching Mockup (100% Coded & Editable from Admin) */}
                                        {cat.title && (
                                            <h3 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide font-heading
                                                text-slate-800 group-hover:text-primary transition-colors
                                                dark:text-[#E0F2FE] dark:group-hover:text-cyan-300 dark:drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                                            >
                                                {cat.title}
                                            </h3>
                                        )}
                                    </div>
                                </Link>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom Center Pill Button matching Mockup (Editable from Admin) */}
                {btnText && (
                    <div className="mt-12 sm:mt-16 text-center">
                        <Link
                            href={btnUrl}
                            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full font-bold text-xs sm:text-sm uppercase tracking-widest transition-all duration-200 active:scale-95 shadow-md
                            bg-gradient-to-b from-[#FAF8F5] to-[#EAE6DF] hover:from-white hover:to-[#DFDBD3] text-slate-800 border border-white/60
                            dark:bg-transparent dark:hover:bg-cyan-500/10 dark:text-cyan-300 dark:border-2 dark:border-cyan-400 dark:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                        >
                            <span>{btnText}</span>
                        </Link>
                    </div>
                )}

            </div>
        </section>
    );
}
