'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
    Scissors, 
    X, 
    CheckCircle2, 
    ShieldCheck, 
    Layers, 
    Cpu, 
    Globe, 
    FileCheck2,
    ArrowRight
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { 
    GarmentButton3D, 
    Scissors3D, 
    NeedleWithThread3D, 
    ThreadSpool3D 
} from './Garment3DElements';

interface ProductionProcessProps {
    headings?: Record<string, string>;
    data?: any;
    showDecor?: boolean;
    showIcons?: boolean;
}

export default function ProductionProcess3D({ headings, data, showDecor = false, showIcons = false }: ProductionProcessProps) {
    const { theme } = useTheme();
    const cardRef = useRef<HTMLDivElement>(null);

    // 3D Parallax Tilt
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
    const [isHovered, setIsHovered] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Content from Admin Dashboard or Defaults
    const parsedData = typeof data === 'string' ? (() => { try { return JSON.parse(data); } catch { return {}; } })() : (data || {});
    
    const defaultHeading = 'Introducing Apparel Emporium';
    const defaultP1 = 'Apparel Emporium is a Bangladesh-based apparel sourcing partner, exporter, and small-scale manufacturer.';
    const defaultP2 = "With an integrated production and sourcing network, we maintain close attention to quality, workmanship, and timely delivery at every stage. Whether you’re looking stylish casual wear and sophisticated formalwear to customized design, we offer flexible solutions tailored to each client's unique requirements.";
    const defaultP3 = 'At Apparel Emporium, we believe successful partnerships are built on quality, transparency, ethical practices, and trust. Our commitment is not simply to supply garments, but to build long-term relationships by delivering dependable service in the global apparel industry.';

    const heading = (headings?.production_process_heading && headings.production_process_heading !== 'Our Premium Production Process') 
        ? headings.production_process_heading 
        : (parsedData.heading && parsedData.heading !== 'Our Premium Production Process' ? parsedData.heading : defaultHeading);

    const p1 = (headings?.production_process_p1 && !headings.production_process_p1.includes('leading apparel sourcing and manufacturing partner based in Bangladesh'))
        ? headings.production_process_p1
        : (parsedData.p1 && !parsedData.p1.includes('leading apparel sourcing and manufacturing partner') ? parsedData.p1 : defaultP1);

    const p2 = (headings?.production_process_p2 && !headings.production_process_p2.includes('vertically integrated production process ensures strict quality control'))
        ? headings.production_process_p2
        : (parsedData.p2 && !parsedData.p2.includes('vertically integrated production process') ? parsedData.p2 : defaultP2);

    const p3 = defaultP3;

    const btnText = (headings?.production_process_btn_text && headings.production_process_btn_text !== 'VIEW PRODUCTION DETAILS')
        ? headings.production_process_btn_text
        : (parsedData.btnText && parsedData.btnText !== 'VIEW PRODUCTION DETAILS' ? parsedData.btnText : 'EXPLORE SOURCING CAPABILITIES');
    const btnUrl = headings?.production_process_btn_url || parsedData.btnUrl || '';
    const isDecorVisible = showDecor && parsedData.showDecor !== false;

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        const rotateY = (x - 0.5) * 8;
        const rotateX = -(y - 0.5) * 8;

        setTilt({ x: rotateX, y: rotateY });
        setGlarePos({ x: x * 100, y: y * 100 });
    }, []);

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => {
        setIsHovered(false);
        setTilt({ x: 0, y: 0 });
    };

    // Close modal on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsModalOpen(false);
        };
        if (isModalOpen) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isModalOpen]);

    const categories = [
        { 
            num: '01', 
            title: 'Knitwear & Jersey Essentials', 
            desc: 'T-shirts, polo shirts, tank tops, hoodies, sweatshirts, and joggers tailored with premium single jersey, pique, interlock, and rib fabrics with custom washes.', 
            icon: Layers 
        },
        { 
            num: '02', 
            title: 'Woven Garments & Tailoring', 
            desc: 'Casual & formal shirts, denim jeans, twill chinos, cargo trousers, and light jackets with precision stitching and tailored buyer fits.', 
            icon: Scissors 
        },
        { 
            num: '03', 
            title: 'Sweaters & Heavy Knitcraft', 
            desc: '3GG to 12GG gauge flat-knit pullovers, cardigans, and knitwear crafted from soft cotton, acrylic, cashmere-touch, and blended yarns.', 
            icon: Cpu 
        },
        { 
            num: '04', 
            title: 'Fashion & Performance Activewear', 
            desc: 'Contemporary casual dresses, performance sportswear, gym apparel, and custom-styled fashion wear developed directly from buyer tech packs.', 
            icon: FileCheck2 
        },
        { 
            num: '05', 
            title: 'Home Textiles & Terry Linen', 
            desc: 'High-absorbency terry towels, bathrobes, bed sheets, duvet covers, pillowcases, and kitchen linen crafted for lasting softness and durability.', 
            icon: ShieldCheck 
        },
        { 
            num: '06', 
            title: 'Accessories & Custom Footwear', 
            desc: 'Knitted socks, caps, canvas/casual shoes, woven belts, shopping tote bags, and custom trims tailored to client specifications.', 
            icon: Globe 
        }
    ];

    return (
        <section 
            id="production-process"
            aria-labelledby="production-process-heading"
            className="relative py-16 sm:py-24 bg-[#DDD8CF] dark:bg-[#080D1A] transition-colors duration-500 overflow-hidden"
        >
            {/* Top Organic Wave Accent matching mockup */}
            <div className="absolute top-0 left-0 right-0 h-16 overflow-hidden pointer-events-none opacity-50 dark:opacity-30">
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full text-blue-400/40 dark:text-cyan-500/30 fill-current">
                    <path d="M0,0 C200,90 400,-30 600,50 C800,130 1000,20 1200,40 L1200,0 L0,0 Z"></path>
                </svg>
            </div>

            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-400/5 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* ── FLOATING 3D CRAFT ELEMENTS (Matching User Reference Mockup) ── */}
            {isDecorVisible && (
                <div className="pointer-events-none absolute inset-0 overflow-hidden z-0 hidden md:block">
                    {/* Top Right Scissors */}
                    <div className="absolute top-8 right-[32%] animate-[bounce_8s_infinite_ease-in-out]">
                        <Scissors3D size={64} rotation={-35} />
                    </div>

                    {/* Top Right Needle & Thread */}
                    <div className="absolute top-12 right-[8%] animate-[bounce_7s_infinite_ease-in-out_1s]">
                        <NeedleWithThread3D size={76} rotation={35} />
                    </div>

                    {/* Right Side Buttons */}
                    <div className="absolute top-[38%] right-[5%] animate-[bounce_9s_infinite_ease-in-out_0.5s]">
                        <GarmentButton3D size={42} rotation={18} />
                    </div>

                    {/* Bottom Right Scissors */}
                    <div className="absolute bottom-8 right-[12%] animate-[bounce_7.5s_infinite_ease-in-out_1.5s]">
                        <Scissors3D size={78} rotation={35} />
                    </div>

                    {/* Bottom Center Tilted Button */}
                    <div className="absolute bottom-4 left-[46%] animate-[bounce_6.5s_infinite_ease-in-out_2s]">
                        <GarmentButton3D size={48} rotation={-25} />
                    </div>

                    {/* Bottom Left Button */}
                    <div className="absolute bottom-16 left-[5%] animate-[bounce_8.5s_infinite_ease-in-out_0.8s]">
                        <GarmentButton3D size={46} rotation={12} />
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">

                {/* 3D Interactive Container matching Mockup */}
                <div 
                    className="relative"
                    style={{ perspective: '1400px' }}
                >
                    {/* Main Integrated 3D Beveled Card */}
                    <div
                        ref={cardRef}
                        onMouseMove={handleMouseMove}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        className="relative rounded-[28px] sm:rounded-[36px] overflow-hidden transition-all duration-300
                            bg-[#F3EFE8]/92 dark:bg-[#0B1324]/92 
                            border border-white/70 dark:border-white/10
                            shadow-[0_20px_50px_rgba(0,0,0,0.12),inset_0_2px_4px_rgba(255,255,255,0.8)]
                            dark:shadow-[0_25px_60px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.1)]
                            p-6 sm:p-10 lg:p-12"
                        style={{
                            transform: isHovered 
                                ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.01, 1.01, 1.01)` 
                                : 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
                            transformStyle: 'preserve-3d',
                            transition: isHovered ? 'transform 0.12s ease-out' : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
                            willChange: 'transform',
                        }}
                    >
                        {/* Dynamic Interactive Glare */}
                        <div 
                            className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-[28px] sm:rounded-[36px]"
                            style={{
                                opacity: isHovered ? 0.35 : 0,
                                background: `radial-gradient(circle 450px at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.4), transparent 75%)`
                            }}
                        />

                        {/* 2-Column Integrated Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                            
                            {/* Left Column: 3D Beveled Mannequin Studio Compartment (Pure visual, NO text baked in) */}
                            <div className="lg:col-span-5 relative">
                                <div className="relative aspect-square w-full max-w-[380px] mx-auto rounded-3xl overflow-hidden
                                    border-6 sm:border-8 border-[#FAF7F2] dark:border-[#162035]
                                    shadow-[0_15px_30px_rgba(0,0,0,0.14),inset_0_2px_6px_rgba(0,0,0,0.1)]
                                    dark:shadow-[0_20px_40px_rgba(0,0,0,0.7),inset_0_2px_8px_rgba(0,0,0,0.5)]
                                    bg-[#E4DFD5] dark:bg-[#0D1527]"
                                >
                                    {/* Light Mode 3D Studio Visual */}
                                    <div className="absolute inset-0 dark:opacity-0 opacity-100 transition-opacity duration-500">
                                        <Image
                                            src="/images/3d/mannequin_studio_light.jpg"
                                            alt="Apparel Emporium 3D Garment Mannequin Studio (Light)"
                                            fill
                                            sizes="(max-width: 1024px) 100vw, 400px"
                                            className="object-cover w-full h-full transition-transform duration-700 hover:scale-105"
                                            quality={95}
                                        />
                                    </div>
                                    {/* Dark Mode 3D Studio Visual */}
                                    <div className="absolute inset-0 opacity-0 dark:opacity-100 transition-opacity duration-500">
                                        <Image
                                            src="/images/3d/mannequin_studio_dark.jpg"
                                            alt="Apparel Emporium 3D Garment Mannequin Studio (Dark)"
                                            fill
                                            sizes="(max-width: 1024px) 100vw, 400px"
                                            className="object-cover w-full h-full transition-transform duration-700 hover:scale-105"
                                            quality={95}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Live Glassmorphism Content (100% Coded & Admin Controlled) */}
                            <div className="lg:col-span-7 flex flex-col justify-center space-y-5 sm:space-y-6">
                                
                                {/* Live Title (Editable from Admin) */}
                                {heading && (
                                    <h2 
                                        id="production-process-heading" 
                                        className="text-2xl sm:text-4xl lg:text-[40px] font-bold tracking-tight leading-tight font-heading
                                        text-slate-900 dark:text-[#ECD4A5]"
                                    >
                                        {heading}
                                    </h2>
                                )}

                                {/* Paragraph 1 (Editable from Admin) */}
                                {p1 && (
                                    <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                        {p1}
                                    </p>
                                )}

                                {/* Paragraph 2 (Editable from Admin) */}
                                {p2 && (
                                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                                        {p2}
                                    </p>
                                )}

                                {/* Paragraph 3 (Editable from Admin) */}
                                {p3 && (
                                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                                        {p3}
                                    </p>
                                )}

                                {/* Action Button (Editable from Admin) */}
                                {btnText && (
                                    <div className="pt-2">
                                        {btnUrl ? (
                                            <Link
                                                href={btnUrl}
                                                className="inline-flex items-center justify-center px-7 py-3 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer shadow-md
                                                bg-gradient-to-b from-[#FAF8F5] to-[#EAE6DF] hover:from-white hover:to-[#DFDBD3] text-slate-800 border border-white/60
                                                dark:bg-gradient-to-b dark:from-[#1E2E4A] dark:to-[#121E33] dark:hover:from-[#263A5C] dark:hover:to-[#172740] dark:text-slate-100 dark:border-[#2A3E60] dark:hover:border-amber-400/60"
                                            >
                                                <span>{btnText}</span>
                                            </Link>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => setIsModalOpen(true)}
                                                className="inline-flex items-center justify-center px-7 py-3 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer shadow-md
                                                bg-gradient-to-b from-[#FAF8F5] to-[#EAE6DF] hover:from-white hover:to-[#DFDBD3] text-slate-800 border border-white/60
                                                dark:bg-gradient-to-b dark:from-[#1E2E4A] dark:to-[#121E33] dark:hover:from-[#263A5C] dark:hover:to-[#172740] dark:text-slate-100 dark:border-[#2A3E60] dark:hover:border-amber-400/60"
                                            >
                                                <span>{btnText}</span>
                                            </button>
                                        )}
                                    </div>
                                )}

                            </div>
                        </div>

                    </div>
                </div>

            </div>

            {/* ── MODAL: APPAREL EMPORIUM SOURCING CAPABILITIES ── */}
            {isModalOpen && (
                <div 
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="proc-modal-title"
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 animate-in fade-in duration-200"
                >
                    <div 
                        className="fixed inset-0 bg-slate-950/75 backdrop-blur-md transition-opacity"
                        onClick={() => setIsModalOpen(false)}
                    />

                    <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#F3EFE8]/98 dark:bg-[#0B1324]/98 border border-white/80 dark:border-cyan-500/35 ring-1 ring-[#D8D2C5]/70 dark:ring-cyan-400/20 rounded-[32px] shadow-[0_30px_70px_rgba(0,0,0,0.22),inset_0_2px_4px_rgba(255,255,255,0.95)] dark:shadow-[0_0_60px_rgba(6,182,212,0.25),0_30px_70px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-200">
                        
                        {/* 3D Header */}
                        <div className="p-6 sm:p-8 border-b border-[#D8D2C5]/70 dark:border-cyan-500/20 flex items-start justify-between bg-gradient-to-b from-[#FAF7F2] to-[#ECE6DC] dark:from-[#091120] dark:to-[#0E1B30]">
                            <div>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#E5DFD4] dark:bg-cyan-500/20 text-primary dark:text-cyan-300 border border-[#D0C8B8] dark:border-cyan-400/40 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] mb-2">
                                    Apparel Sourcing & Manufacturing
                                </span>
                                <h3 id="proc-modal-title" className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading">
                                    Apparel Emporium — Sourcing & Manufacturing Scope
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
                                    Integrated apparel solutions tailored to buyers across Europe, North America, and global markets.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="p-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-white/10 border border-[#DDD6C8] dark:border-white/10 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-[#EAE4D9] dark:hover:bg-cyan-500/20 shadow-sm transition-all cursor-pointer"
                                title="Close modal"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* 3D Product Categories Grid */}
                        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {categories.map((cat, i) => {
                                    const IconComponent = cat.icon;
                                    return (
                                        <div 
                                            key={i}
                                            className="p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#0E1A30]/90 border border-[#DDD6C8] dark:border-cyan-500/25 shadow-[0_6px_16px_rgba(150,145,135,0.18),inset_0_1px_2px_rgba(255,255,255,0.95)] dark:shadow-[0_6px_18px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(255,255,255,0.04)] hover:shadow-[0_12px_24px_rgba(150,145,135,0.28)] dark:hover:shadow-[0_0_24px_rgba(6,182,212,0.25)] hover:border-[#C4BCAD] dark:hover:border-cyan-400/60 hover:-translate-y-0.5 transition-all flex flex-col justify-between"
                                        >
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[11px] font-black tracking-widest text-primary dark:text-cyan-300 uppercase bg-[#E8E2D6] dark:bg-cyan-950/70 px-2.5 py-0.5 rounded-full border border-[#D8D2C5] dark:border-cyan-500/40 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
                                                        Category {cat.num}
                                                    </span>
                                                </div>
                                                <h4 className="text-base font-extrabold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2 font-heading">
                                                    {showIcons && <IconComponent className="w-4 h-4 text-primary dark:text-cyan-400 shrink-0" />}
                                                    {cat.title}
                                                </h4>
                                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                                    {cat.desc}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Authentic Sourcing Standards 3D Inset Plaque */}
                            <div className="p-5 rounded-2xl bg-[#EAE4D9] dark:bg-[#070F1E] border border-[#D5CEC0] dark:border-cyan-500/25 shadow-[inset_0_2px_5px_rgba(0,0,0,0.07)] dark:shadow-[inset_0_0_20px_rgba(6,182,212,0.08)] flex flex-wrap items-center justify-around gap-4 text-center">
                                <div className="max-w-[200px]">
                                    <div className="text-base sm:text-lg font-black text-primary dark:text-cyan-400">Flexible Production</div>
                                    <div className="text-[11px] font-medium text-slate-600 dark:text-slate-400 mt-0.5">Small to custom volume orders adapted to client needs</div>
                                </div>
                                <div className="h-8 w-px bg-[#D0C8B8] dark:bg-cyan-900/60 hidden sm:block" />
                                <div className="max-w-[200px]">
                                    <div className="text-base sm:text-lg font-black text-primary dark:text-cyan-400">Quality Workmanship</div>
                                    <div className="text-[11px] font-medium text-slate-600 dark:text-slate-400 mt-0.5">Continuous attention to detail, fabric, and finishing</div>
                                </div>
                                <div className="h-8 w-px bg-[#D0C8B8] dark:bg-cyan-900/60 hidden sm:block" />
                                <div className="max-w-[200px]">
                                    <div className="text-base sm:text-lg font-black text-primary dark:text-cyan-400">Ethical & Transparent</div>
                                    <div className="text-[11px] font-medium text-slate-600 dark:text-slate-400 mt-0.5">Building dependable, long-term B2B partnerships</div>
                                </div>
                            </div>
                        </div>

                        {/* 3D Footer */}
                        <div className="p-5 sm:p-6 border-t border-[#D8D2C5]/70 dark:border-cyan-500/20 bg-gradient-to-r from-[#FAF7F2] to-[#ECE6DC] dark:from-[#091120] dark:to-[#0E1B30] flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-[#FAF7F2] dark:bg-white/5 border border-[#DDD6C8] dark:border-white/10 hover:bg-[#E2DCCE] dark:hover:bg-white/10 shadow-sm transition-all cursor-pointer"
                            >
                                Close
                            </button>
                            <Link
                                href="/request-quote"
                                onClick={() => setIsModalOpen(false)}
                                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-blue-700 via-primary to-blue-900 text-white dark:from-sky-500 dark:to-cyan-400 dark:text-slate-950 shadow-[0_8px_18px_rgba(30,58,138,0.35),inset_0_1px_2px_rgba(255,255,255,0.3)] dark:shadow-[0_0_25px_rgba(6,182,212,0.5)] hover:shadow-[0_12px_24px_rgba(30,58,138,0.45)] dark:hover:shadow-[0_0_35px_rgba(6,182,212,0.7)] hover:-translate-y-0.5 transition-all"
                            >
                                <span>Request Sourcing Quote</span>
                                <ArrowRight size={13} />
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
