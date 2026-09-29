'use client';

import React from 'react';
import Link from 'next/link';
import { useSettings } from '@/context/SettingsContext';
import Coded3DGlobe from '@/components/products/Coded3DGlobe';
import { Vision3DIcon, Mission3DIcon, Values3DIcon, Flowchart3DIcon } from '@/components/ui/Claymorphic3DIcons';

export default function AboutPage() {
    const { settings } = useSettings();

    /* ── Content from settings with exact fallbacks from reference designs ── */
    const aboutHeading   = settings.about_heading   || 'ABOUT US';
    const aboutParagraph = settings.about_paragraph ||
        'Apparel Emporium is a premier Buying House headquartered in Bangladesh. We specialized in premier B2B corporations of a global logistics networks, specialized in sourcing, designing, and distributing accessories readymade garments, home textiles, footwear, and accessories.';

    const ceoHeading = settings.ceo_heading || 'CEO MESSAGE';
    const ceoP1      = settings.ceo_p1      || 'Our dedication is delivering apparel sourcing strictly tailored to buyer requirements and specifications.';
    const ceoP2      = settings.ceo_p2      || 'With rigorous multi-stage quality assurance, our team ensures total production transparency and timely deliveries.';
    const ceoP3      = settings.ceo_p3      || 'We partner with audited manufacturing facilities adhering to global ethical, social, and environmental standards.';
    const ceoSignoff = settings.ceo_signoff || 'Managing Director & CEO, Apparel Emporium';

    const visionHeading  = settings.vision_heading  || 'OUR VISION';
    const visionText     = settings.vision_text     ||
        'Our vision is to be a premier Buying House to merchandise readymade garments, home textiles, footwear and accessories to international customers/buyers.';

    const missionHeading = settings.mission_heading || 'OUR MISSION';
    const missionText    = settings.mission_text    ||
        'Our mission is to source locally leading manufacturers and export readymade garments, home textiles, footwear and accessories to international customers/buyers.';

    const valueHeading   = settings.value_heading   || 'OUR VALUE';
    const valueText      = settings.value_text      ||
        'We, Apparel Emporium value our professionals, buyers, associated manufacturers and other trade associates more than anything else. We love the people, commitment, integrity, trust, customer satisfaction and team work...';

    const profileBtnText = settings.profile_btn_text || 'DOWNLOAD OUR COMPANY PROFILE';
    const profileBtnUrl  = settings.profile_btn_url  || '/company-profile.pdf';

    /* ── Image assets ── */
    const aboutImgLight = settings.about_image_light || '/images/about/mannequin_light.jpg';
    const aboutImgDark  = settings.about_image_dark  || '/images/about/mannequin_dark.jpg';
    const ceoImage      = settings.ceo_image         || '/images/about/ceo_portrait.jpg';
    const sphereLight   = settings.globe_image_light || '/images/about/sphere_light.jpg';
    const sphereDark    = settings.globe_image_dark  || '/images/about/sphere_dark.jpg';
    const blazerLight   = '/images/about/blazer_light.jpg';
    const blazerDark    = '/images/about/blazer_dark.jpg';

    return (
        <div className="about-page-canvas min-h-screen relative overflow-hidden transition-colors duration-500">

            {/* Dark mode ambient glowing fog */}
            <div className="dark:block hidden pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-[100px]" />
                <div className="absolute top-1/2 right-0 w-96 h-96 rounded-full bg-blue-600/10 blur-[120px]" />
                <div className="absolute bottom-16 left-1/4 w-72 h-72 rounded-full bg-teal-400/8 blur-[90px]" />
            </div>

            {/* Main compact container matching reference proportions */}
            <div className="container mx-auto max-w-4xl px-4 sm:px-6 pt-28 sm:pt-32 pb-20 space-y-9 sm:space-y-11 relative z-10">

                {/* ═══════════════════════ SECTION 1: ABOUT US & STUDIO MANNEQUIN ═══════════════════════ */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-center">
                    
                    {/* Left: About Us text card - compact, proportionate */}
                    <div className="clay-card rounded-[28px] p-6 sm:p-7 flex flex-col justify-center h-full min-h-[220px] sm:min-h-[240px]">
                        <h1 className="clay-heading text-xl sm:text-2xl font-black tracking-tight mb-3 uppercase">
                            {aboutHeading}
                        </h1>
                        <p className="clay-text text-xs sm:text-[13px] leading-relaxed font-medium">
                            {aboutParagraph}
                        </p>
                    </div>

                    {/* Right: Studio Mannequin Showcase - compact frame matching height */}
                    <div className="clay-bezel-frame rounded-[28px] p-2 sm:p-2.5 h-[230px] sm:h-[250px] flex items-center justify-center overflow-hidden">
                        <div className="w-full h-full rounded-[22px] overflow-hidden relative group">
                            <img
                                src={aboutImgLight}
                                alt="Atelier Mannequin Tailoring Studio"
                                className="w-full h-full object-cover rounded-[22px] dark:hidden transition-transform duration-700 group-hover:scale-105"
                            />
                            <img
                                src={aboutImgDark}
                                alt="Atelier Mannequin Tailoring Studio Dark"
                                className="w-full h-full object-cover rounded-[22px] hidden dark:block transition-transform duration-700 group-hover:scale-105"
                            />
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════ SECTION 2: 3D GLOBE ORCHESTRATION & CEO MESSAGE ═══════════════════════ */}
                <section className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">

                    {/* Left: 3D Globe with individual floating elements coded in place */}
                    <div className="md:col-span-6 flex items-center justify-center">
                        <div className="relative w-full max-w-[340px] aspect-square flex items-center justify-center">
                            
                            {/* Center 100% Coded Animated 3D Interactive Globe */}
                            <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full flex items-center justify-center z-10">
                                <Coded3DGlobe size={230} className="mx-auto" />
                            </div>

                            {/* Floating Element 1 (Top-Left): 3D User Network Icon */}
                            <div className="absolute -top-1 -left-2 z-20 floating-item-slow">
                                <div className="clay-floating-badge rounded-2xl p-2.5 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14">
                                    <svg viewBox="0 0 48 48" className="w-7 h-7 sm:w-8 sm:h-8 network-svg-icon" fill="none">
                                        {/* Outer nodes */}
                                        <circle cx="24" cy="9" r="4.5" className="net-node" />
                                        <circle cx="9" cy="32" r="4.5" className="net-node" />
                                        <circle cx="39" cy="32" r="4.5" className="net-node" />
                                        {/* Center node */}
                                        <circle cx="24" cy="24" r="5" className="net-center-node" />
                                        {/* Connector lines */}
                                        <line x1="24" y1="13.5" x2="24" y2="19" className="net-line" strokeWidth="2" strokeDasharray="2 2" />
                                        <line x1="13" y1="30" x2="20" y2="26" className="net-line" strokeWidth="2" strokeDasharray="2 2" />
                                        <line x1="35" y1="30" x2="28" y2="26" className="net-line" strokeWidth="2" strokeDasharray="2 2" />
                                        <line x1="12" y1="28" x2="21" y2="12" className="net-line" strokeWidth="1.5" />
                                        <line x1="36" y1="28" x2="27" y2="12" className="net-line" strokeWidth="1.5" />
                                    </svg>
                                </div>
                            </div>

                            {/* Floating Element 2 (Top-Right): 3D Miniature Tailored Blazer */}
                            <div className="absolute top-0 -right-2 z-20 floating-item-reverse">
                                <div className="clay-floating-badge rounded-2xl p-1 w-14 h-16 sm:w-16 sm:h-20 overflow-hidden flex items-center justify-center">
                                    <img
                                        src={blazerLight}
                                        alt="Tailored Blazer"
                                        className="w-full h-full object-cover rounded-xl dark:hidden"
                                    />
                                    <img
                                        src={blazerDark}
                                        alt="Tailored Blazer Dark"
                                        className="w-full h-full object-cover rounded-xl hidden dark:block"
                                    />
                                </div>
                            </div>

                            {/* Floating Element 3 (Bottom-Left): 3D Miniature Tailored Blazer */}
                            <div className="absolute bottom-2 -left-3 z-20 floating-item-slow">
                                <div className="clay-floating-badge rounded-2xl p-1 w-14 h-16 sm:w-16 sm:h-20 overflow-hidden flex items-center justify-center">
                                    <img
                                        src={blazerLight}
                                        alt="Tailored Blazer"
                                        className="w-full h-full object-cover rounded-xl dark:hidden transform -scale-x-100"
                                    />
                                    <img
                                        src={blazerDark}
                                        alt="Tailored Blazer Dark"
                                        className="w-full h-full object-cover rounded-xl hidden dark:block transform -scale-x-100"
                                    />
                                </div>
                            </div>

                            {/* Floating Element 4 (Bottom-Right): 3D Process Flowchart Diagram */}
                            <div className="absolute -bottom-3 -right-2 z-20 floating-item-reverse">
                                <div className="clay-floating-badge rounded-2xl p-2 flex items-center justify-center w-20 h-16 sm:w-24 sm:h-20">
                                    <Flowchart3DIcon className="w-full h-full" />
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Right: CEO Message Card with framed portrait */}
                    <div className="md:col-span-6">
                        <div className="clay-card rounded-[28px] p-6 sm:p-7 relative">
                            
                            <h2 className="clay-heading text-lg sm:text-xl font-black tracking-tight mb-4 uppercase">
                                {ceoHeading}
                            </h2>

                            <div className="flex gap-4 sm:gap-5 items-start">
                                {/* Message text lines */}
                                <div className="clay-text flex-1 space-y-3 text-[11px] sm:text-xs leading-relaxed font-medium">
                                    <p>{ceoP1}</p>
                                    <p>{ceoP2}</p>
                                    <p>{ceoP3}</p>
                                    <p className="font-bold pt-1 text-slate-900 dark:text-cyan-200">
                                        {ceoSignoff}
                                    </p>
                                </div>

                                {/* CEO portrait in extruded 3D photo bezel */}
                                <div className="flex-shrink-0 clay-bezel-frame rounded-[18px] p-1.5 w-24 h-32 sm:w-28 sm:h-36 overflow-hidden">
                                    <img
                                        src={ceoImage}
                                        alt="Chief Executive Officer"
                                        className="w-full h-full object-cover rounded-[13px]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════ SECTION 3: VISION, MISSION, VALUE ═══════════════════════ */}
                <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">

                    {/* Our Vision */}
                    <div className="clay-card rounded-[26px] p-6 flex flex-col justify-start min-h-[210px] group transition-all duration-300 hover:-translate-y-1">
                        <div className="mb-2.5">
                            <Vision3DIcon size={50} />
                        </div>
                        <h3 className="clay-heading text-base sm:text-lg font-black tracking-tight mb-2 uppercase">
                            {visionHeading}
                        </h3>
                        <p className="clay-text text-xs leading-relaxed font-medium">
                            {visionText}
                        </p>
                    </div>

                    {/* Our Mission */}
                    <div className="clay-card rounded-[26px] p-6 flex flex-col justify-start min-h-[210px] group transition-all duration-300 hover:-translate-y-1">
                        <div className="mb-2.5">
                            <Mission3DIcon size={50} />
                        </div>
                        <h3 className="clay-heading text-base sm:text-lg font-black tracking-tight mb-2 uppercase">
                            {missionHeading}
                        </h3>
                        <p className="clay-text text-xs leading-relaxed font-medium">
                            {missionText}
                        </p>
                    </div>

                    {/* Our Value */}
                    <div className="clay-card rounded-[26px] p-6 flex flex-col justify-start min-h-[210px] group transition-all duration-300 hover:-translate-y-1">
                        <div className="mb-2.5">
                            <Values3DIcon size={50} />
                        </div>
                        <h3 className="clay-heading text-base sm:text-lg font-black tracking-tight mb-2 uppercase">
                            {valueHeading}
                        </h3>
                        <p className="clay-text text-xs leading-relaxed font-medium">
                            {valueText}
                        </p>
                    </div>
                </section>

                {/* ═══════════════════════ DOWNLOAD COMPANY PROFILE BUTTON ═══════════════════════ */}
                <section className="text-center pt-2 pb-4">
                    <Link
                        href={profileBtnUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="clay-button inline-flex items-center justify-center px-8 sm:px-12 py-3.5 rounded-full text-xs sm:text-[13px] font-black tracking-wider uppercase transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                    >
                        {profileBtnText}
                    </Link>
                </section>

            </div>

            {/* ═══════════════════════ EXACT NEUMORPHIC & GLOW STYLING ═══════════════════════ */}
            <style jsx global>{`
                /* ── Light Mode Base: Soft warm clay canvas matching reference ── */
                .about-page-canvas {
                    background-color: #DDD8CF;
                }

                /* ── Light Mode Cards: Neumorphic 3D clay with dual light/dark shadows ── */
                .clay-card {
                    background-color: #E8E4DC;
                    box-shadow: 
                        12px 12px 24px rgba(160, 155, 145, 0.45),
                        -10px -10px 20px rgba(255, 255, 255, 0.85),
                        inset 1px 1px 2px rgba(255, 255, 255, 0.5);
                    border: 1px solid rgba(255, 255, 255, 0.4);
                }

                /* ── Light Mode Extruded 3D Photo Bezel Frame ── */
                .clay-bezel-frame {
                    background-color: #EDE9E1;
                    box-shadow: 
                        10px 10px 20px rgba(160, 155, 145, 0.4),
                        -8px -8px 18px rgba(255, 255, 255, 0.9),
                        inset 2px 2px 4px rgba(255, 255, 255, 0.8),
                        inset -2px -2px 4px rgba(0, 0, 0, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.6);
                }

                /* ── Light Mode Floating Badges (Network, Blazers, Flowchart) ── */
                .clay-floating-badge {
                    background-color: #EDE9E1;
                    box-shadow: 
                        6px 6px 14px rgba(150, 145, 135, 0.4),
                        -5px -5px 12px rgba(255, 255, 255, 0.9),
                        inset 1px 1px 2px rgba(255, 255, 255, 0.7);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                }

                /* Globe shadow in light mode */
                .globe-sphere-shadow-light {
                    filter: drop-shadow(0 14px 24px rgba(140, 135, 125, 0.4));
                }

                /* ── Light Mode Typography ── */
                .clay-heading {
                    color: #1A1D20;
                    letter-spacing: -0.01em;
                }
                .clay-text {
                    color: #4B5563;
                }

                /* ── Light Mode SVG Icons (Clay Embossed look) ── */
                .network-svg-icon .net-node {
                    fill: #D3CDC2;
                    stroke: #B8B0A2;
                    stroke-width: 1.5;
                }
                .network-svg-icon .net-center-node {
                    fill: #E8E4DC;
                    stroke: #8E8678;
                    stroke-width: 2;
                }
                .network-svg-icon .net-line {
                    stroke: #A8A092;
                }
                .flowchart-svg-icon .chart-box {
                    fill: #D8D2C7;
                    stroke: #A8A092;
                    stroke-width: 1.2;
                }
                .flowchart-svg-icon .chart-diamond {
                    fill: #E8E4DC;
                    stroke: #8E8678;
                    stroke-width: 1.5;
                }
                .flowchart-svg-icon .chart-line {
                    stroke: #A8A092;
                }

                /* ── Light Mode Pill Button: Neumorphic Extruded Button ── */
                .clay-button {
                    background-color: #D5D0C6;
                    color: #1A1D20;
                    box-shadow: 
                        7px 7px 16px rgba(160, 155, 145, 0.5),
                        -5px -5px 12px rgba(255, 255, 255, 0.85),
                        inset 1px 1px 2px rgba(255, 255, 255, 0.6);
                    border: 1.5px solid rgba(255, 255, 255, 0.3);
                }
                .clay-button:hover {
                    background-color: #CCC7BD;
                    box-shadow: 
                        9px 9px 20px rgba(150, 145, 135, 0.6),
                        -7px -7px 16px rgba(255, 255, 255, 0.95);
                }

                /* ═══════════════════════ DARK MODE STYLES ═══════════════════════ */
                .dark .about-page-canvas {
                    background-color: #080D1A;
                }

                /* Dark Cards: Glowing Glassmorphism with Cyan Outlines */
                .dark .clay-card {
                    background: rgba(9, 18, 33, 0.8);
                    border: 1.5px solid rgba(56, 189, 248, 0.35);
                    box-shadow: 
                        0 0 25px rgba(6, 182, 212, 0.12),
                        inset 0 0 20px rgba(6, 182, 212, 0.05),
                        0 20px 40px rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(16px);
                }

                /* Dark Extruded Bezel Frame with Cyan Rim Glow */
                .dark .clay-bezel-frame {
                    background: rgba(12, 22, 40, 0.85);
                    border: 1.5px solid rgba(56, 189, 248, 0.4);
                    box-shadow: 
                        0 0 25px rgba(6, 182, 212, 0.2),
                        inset 0 0 12px rgba(6, 182, 212, 0.08),
                        0 15px 35px rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(16px);
                }

                /* Dark Floating Badges */
                .dark .clay-floating-badge {
                    background: rgba(10, 22, 40, 0.9);
                    border: 1.5px solid rgba(56, 189, 248, 0.5);
                    box-shadow: 
                        0 0 18px rgba(6, 182, 212, 0.3),
                        inset 0 0 10px rgba(6, 182, 212, 0.1);
                    backdrop-filter: blur(12px);
                }

                /* Globe shadow in dark mode */
                .globe-sphere-shadow-dark {
                    filter: drop-shadow(0 0 35px rgba(6, 182, 212, 0.45));
                }

                /* Dark Headings with soft cyan neon radiance */
                .dark .clay-heading {
                    color: #FFFFFF;
                    text-shadow: 0 0 14px rgba(56, 189, 248, 0.55);
                }
                .dark .clay-text {
                    color: #94A3B8;
                }

                /* Dark Mode SVG Icons (Neon Cyan) */
                .dark .network-svg-icon .net-node {
                    fill: rgba(6, 182, 212, 0.3);
                    stroke: #38BDF8;
                    stroke-width: 1.5;
                    filter: drop-shadow(0 0 4px #06B6D4);
                }
                .dark .network-svg-icon .net-center-node {
                    fill: #06B6D4;
                    stroke: #E0F2FE;
                    stroke-width: 2;
                    filter: drop-shadow(0 0 6px #38BDF8);
                }
                .dark .network-svg-icon .net-line {
                    stroke: #38BDF8;
                    filter: drop-shadow(0 0 3px #06B6D4);
                }
                .dark .flowchart-svg-icon .chart-box {
                    fill: rgba(6, 182, 212, 0.25);
                    stroke: #38BDF8;
                    stroke-width: 1.5;
                    filter: drop-shadow(0 0 4px #06B6D4);
                }
                .dark .flowchart-svg-icon .chart-diamond {
                    fill: rgba(56, 189, 248, 0.4);
                    stroke: #E0F2FE;
                    stroke-width: 1.5;
                    filter: drop-shadow(0 0 6px #06B6D4);
                }
                .dark .flowchart-svg-icon .chart-line {
                    stroke: #38BDF8;
                    filter: drop-shadow(0 0 3px #06B6D4);
                }

                /* Dark Pill Button with Vibrant Cyan / Blue Neon glow */
                .dark .clay-button {
                    background: linear-gradient(135deg, #0A2540 0%, #0D3B66 100%);
                    color: #FFFFFF;
                    border: 1.5px solid rgba(56, 189, 248, 0.7);
                    box-shadow: 
                        0 0 25px rgba(14, 165, 233, 0.45),
                        inset 0 0 15px rgba(56, 189, 248, 0.25),
                        0 10px 25px rgba(0, 0, 0, 0.5);
                }
                .dark .clay-button:hover {
                    background: linear-gradient(135deg, #0D3B66 0%, #0284C7 100%);
                    box-shadow: 
                        0 0 35px rgba(14, 165, 233, 0.7),
                        inset 0 0 20px rgba(255, 255, 255, 0.3),
                        0 15px 30px rgba(0, 0, 0, 0.6);
                }

                /* ── Floating Animations ── */
                @keyframes floatSlow {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-7px); }
                }
                @keyframes floatReverse {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(6px); }
                }
                .floating-item-slow {
                    animation: floatSlow 5s ease-in-out infinite;
                }
                .floating-item-reverse {
                    animation: floatReverse 6s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
