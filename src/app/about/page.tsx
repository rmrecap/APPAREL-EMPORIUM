'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Maximize2, X, ChevronLeft, ChevronRight, Building2, MapPin, Sparkles, CheckCircle2, UserCheck } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import Coded3DGlobe from '../../components/products/Coded3DGlobe';
import { Vision3DIcon, Mission3DIcon, Values3DIcon, Flowchart3DIcon } from '../../components/ui/Claymorphic3DIcons';

const OFFICE_GALLERY = [
    {
        src: '/images/office/showroom_lounge_wide.jpg',
        title: 'Showroom & Buyer Meeting Lounge',
        tag: 'Executive Lounge',
        desc: 'Spacious negotiation lounge with direct access to garment development collections for international buyers.'
    },
    {
        src: '/images/office/knit_woven_double_rack.jpg',
        title: 'Sampling Development Racks',
        tag: 'Knit & Woven Racks',
        desc: 'Over 500+ active apparel samples spanning knitwear, woven shirts, casual tops, and seasonal activewear.'
    },
    {
        src: '/images/office/boardroom_conference_table.jpg',
        title: 'Corporate Conference Boardroom',
        tag: 'Strategic Operations',
        desc: 'Dedicated meeting facility where our merchandising, technical, and QA executives align on production milestones.'
    },
    {
        src: '/images/office/sample_racks_shirts.jpg',
        title: 'Garments Display & Sourcing Floor',
        tag: 'Apparel Collections',
        desc: 'Curated selection of polos, tees, swimwear, casual shirts, and trousers ready for international private label sourcing.'
    },
    {
        src: '/images/office/apparel_collection_racks.jpg',
        title: 'Apparel Collection & Trims Showcase',
        tag: 'Design & Variety',
        desc: 'Vibrant casual wear, shorts, and fabric swatches demonstrating multi-category sourcing breadth.'
    },
    {
        src: '/images/office/meeting_room_perspective.jpg',
        title: 'Buyer Interaction & Fit Review Floor',
        tag: 'Uttara Model Town HQ',
        desc: 'Comfortable environment for international buyers to conduct sample evaluations, fit reviews, and costings.'
    }
];

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
    const aboutImgLight = settings.about_image_light || '/images/office/knit_woven_double_rack.jpg';
    const aboutImgDark  = settings.about_image_dark  || '/images/office/knit_woven_double_rack.jpg';
    const ceoImage      = settings.ceo_image         || '/images/about/ceo_portrait.jpg';
    const blazerLight   = '/images/about/blazer_light.jpg';
    const blazerDark    = '/images/about/blazer_dark.jpg';

    /* ── Interactive State ── */
    const [heroSlide, setHeroSlide] = useState(0);
    const [lightboxItem, setLightboxItem] = useState<{ src: string; title: string; desc?: string; tag?: string } | null>(null);

    const heroSlides = [
        {
            src: aboutImgLight,
            title: 'Garments Sampling Studio',
            subtitle: 'Uttara Model Town, Dhaka'
        },
        {
            src: '/images/office/showroom_lounge_wide.jpg',
            title: 'Showroom & Meeting Lounge',
            subtitle: 'Buyer Negotiation Suite'
        },
        {
            src: '/images/office/boardroom_conference_table.jpg',
            title: 'Executive Conference Room',
            subtitle: 'Production & Sourcing Operations'
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setHeroSlide(prev => (prev + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [heroSlides.length]);

    // Handle ESC key for modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setLightboxItem(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

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

                    {/* Right: Studio & Showroom Showcase - compact frame matching height */}
                    <div 
                        onClick={() => setLightboxItem({
                            src: heroSlides[heroSlide].src,
                            title: heroSlides[heroSlide].title,
                            desc: 'Apparel Emporium corporate headquarters & garment development showroom located in Uttara Model Town, Dhaka.',
                            tag: 'Dhaka Facility'
                        })}
                        className="clay-bezel-frame rounded-[28px] p-2 sm:p-2.5 h-[230px] sm:h-[250px] flex items-center justify-center overflow-hidden relative group cursor-pointer"
                        title="Click to view full photo"
                    >
                        <div className="w-full h-full rounded-[22px] overflow-hidden relative">
                            {heroSlides.map((slide, idx) => (
                                <img
                                    key={idx}
                                    src={slide.src}
                                    alt={slide.title}
                                    className={`w-full h-full object-cover rounded-[22px] transition-all duration-700 absolute inset-0 ${
                                        idx === heroSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
                                    }`}
                                />
                            ))}

                            {/* Showroom Overlay Badge */}
                            <div className="absolute top-2.5 left-2.5 z-10">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/20 shadow-md">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span>{heroSlides[heroSlide].title}</span>
                                </span>
                            </div>

                            {/* Zoom hint */}
                            <div className="absolute bottom-2.5 right-2.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="p-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white/90 border border-white/20">
                                    <Maximize2 size={13} />
                                </div>
                            </div>

                            {/* Slide dots */}
                            <div className="absolute bottom-2.5 left-2.5 z-10 flex gap-1.5">
                                {heroSlides.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={(e) => { e.stopPropagation(); setHeroSlide(idx); }}
                                        className={`h-1.5 rounded-full transition-all ${
                                            idx === heroSlide ? 'w-5 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'
                                        }`}
                                        aria-label={`Slide ${idx + 1}`}
                                    />
                                ))}
                            </div>
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
                                <div 
                                    onClick={() => setLightboxItem({
                                        src: ceoImage,
                                        title: 'Md. Kamal Hossain',
                                        tag: 'Managing Director & CEO',
                                        desc: 'Md. Kamal Hossain is the Managing Director & CEO of Apparel Emporium, leading global apparel merchandising and sourcing operations with international buyers worldwide.'
                                    })}
                                    className="flex-shrink-0 clay-bezel-frame rounded-[18px] p-1.5 w-24 h-32 sm:w-28 sm:h-36 overflow-hidden cursor-pointer group relative"
                                    title="Click to view full portrait"
                                >
                                    <img
                                        src={ceoImage}
                                        alt="Md. Kamal Hossain - Managing Director & CEO"
                                        className="w-full h-full object-cover object-top rounded-[13px] transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/30 rounded-[13px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center m-1.5">
                                        <Maximize2 size={16} className="text-white drop-shadow" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════ SECTION: OUR SAMPLING SHOWROOM & CORPORATE HEADQUARTERS ═══════════════════════ */}
                <section className="space-y-6">
                    {/* Header tablet */}
                    <div className="clay-card rounded-[28px] p-6 sm:p-7 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 mb-2 border border-emerald-500/30">
                            <Building2 size={13} />
                            <span>Physical Headquarters &amp; Sampling Facility</span>
                        </div>
                        <h2 className="clay-heading text-xl sm:text-2xl font-black tracking-tight mb-2 uppercase font-heading">
                            Our Office &amp; Sample Showroom
                        </h2>
                        <p className="clay-text text-xs sm:text-[13px] leading-relaxed font-medium max-w-2xl mx-auto">
                            Located at Sector 13, Uttara Model Town, Dhaka. Explore our dedicated sampling development racks, executive boardroom, and comfortable buyer negotiation suites.
                        </p>
                    </div>

                    {/* 4-Card Office Gallery Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {OFFICE_GALLERY.slice(0, 4).map((item, idx) => (
                            <div
                                key={idx}
                                onClick={() => setLightboxItem(item)}
                                className="clay-card rounded-[26px] p-3 group cursor-pointer transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                            >
                                <div className="clay-bezel-frame rounded-[20px] p-1.5 overflow-hidden relative aspect-[16/11]">
                                    <img
                                        src={item.src}
                                        alt={item.title}
                                        className="w-full h-full object-cover rounded-[16px] transition-transform duration-700 group-hover:scale-105"
                                    />
                                    {/* Overlay Badge */}
                                    <div className="absolute top-3 left-3 z-10">
                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-black/65 backdrop-blur-md text-white border border-white/20 shadow">
                                            {item.tag}
                                        </span>
                                    </div>
                                    {/* Zoom Hint */}
                                    <div className="absolute bottom-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="p-2 rounded-xl bg-black/70 backdrop-blur-md text-white border border-white/20 shadow-md">
                                            <Maximize2 size={14} />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 pt-3.5">
                                    <h3 className="clay-heading text-sm sm:text-base font-black tracking-tight mb-1 group-hover:text-emerald-700 dark:group-hover:text-cyan-400 transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="clay-text text-xs leading-relaxed line-clamp-2">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
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

            {/* ═══════════════════════ LIGHTBOX / FULLSCREEN PHOTO MODAL ═══════════════════════ */}
            {lightboxItem && (
                <div 
                    onClick={() => setLightboxItem(null)}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
                >
                    <div 
                        onClick={e => e.stopPropagation()}
                        className="clay-card rounded-[32px] p-4 sm:p-5 max-w-2xl w-full relative shadow-2xl overflow-hidden"
                    >
                        <button
                            onClick={() => setLightboxItem(null)}
                            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors cursor-pointer"
                            aria-label="Close"
                        >
                            <X size={18} />
                        </button>

                        <div className="clay-bezel-frame rounded-[22px] p-1.5 overflow-hidden mb-4 max-h-[70vh] flex items-center justify-center bg-black/10">
                            <img
                                src={lightboxItem.src}
                                alt={lightboxItem.title}
                                className="max-w-full max-h-[65vh] w-auto h-auto object-contain rounded-[18px]"
                            />
                        </div>

                        <div className="px-2 pb-1">
                            {lightboxItem.tag && (
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 mb-1 border border-emerald-500/30">
                                    {lightboxItem.tag}
                                </span>
                            )}
                            <h3 className="clay-heading text-base sm:text-lg font-black tracking-tight mb-1">
                                {lightboxItem.title}
                            </h3>
                            {lightboxItem.desc && (
                                <p className="clay-text text-xs sm:text-[13px] leading-relaxed">
                                    {lightboxItem.desc}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

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
