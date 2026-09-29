'use client';

import React, { useState } from 'react';
import { MapPin, Mail, Phone, MessageSquare, X, CheckCircle2, Copy, Check } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import Coded3DGlobe from '@/components/products/Coded3DGlobe';
import { Flowchart3DIcon, MapPin3DIcon, Mail3DIcon, Phone3DIcon } from '@/components/ui/Claymorphic3DIcons';

/* ─────────────────────────────────────────────────────────────
   3D Flowchart Diagram (Exact match to screenshot in Light & Dark)
───────────────────────────────────────────────────────────────── */
function Flowchart3D({ className = "w-20 h-16 sm:w-24 sm:h-20" }: { className?: string }) {
    return (
        <div className={`relative ${className} select-none`}>
            {/* Light Mode SVG */}
            <svg viewBox="0 0 110 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full dark:hidden">
                {/* Filters for 3D Clay Extrusion & Shadows */}
                <defs>
                    <filter id="clayShadow" x="-20%" y="-20%" width="150%" height="150%">
                        <feDropShadow dx="2" dy="3" stdDeviation="2.5" floodColor="#9C9588" floodOpacity="0.45" />
                        <feDropShadow dx="-1.5" dy="-1.5" stdDeviation="1.5" floodColor="#FFFFFF" floodOpacity="0.9" />
                    </filter>
                    <filter id="clayLine" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="1" dy="1.5" stdDeviation="1" floodColor="#9C9588" floodOpacity="0.35" />
                    </filter>
                </defs>

                {/* Top Rounded Rectangle */}
                <rect x="36" y="4" width="38" height="15" rx="5" fill="#E6E1D7" stroke="#C8C1B3" strokeWidth="1.5" filter="url(#clayShadow)" />

                {/* Vertical Line down from top to diamond */}
                <path d="M55 20 L55 27" stroke="#AFA799" strokeWidth="1.8" strokeLinecap="round" filter="url(#clayLine)" />
                <path d="M52.5 25 L55 28 L57.5 25" stroke="#AFA799" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />

                {/* Center Diamond */}
                <polygon points="55,28 71,40 55,52 39,40" fill="#EDE9DF" stroke="#BEB7A8" strokeWidth="1.5" filter="url(#clayShadow)" />

                {/* Left Branch: From diamond left point (39,40) left to (18,40) then down to left box (18,48) or straight */}
                <path d="M39 40 L28 40" stroke="#AFA799" strokeWidth="1.6" strokeLinecap="round" filter="url(#clayLine)" />
                <path d="M30 38 L27 40 L30 42" stroke="#AFA799" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

                {/* Left Node Box */}
                <rect x="4" y="33" width="22" height="14" rx="4" fill="#E4DFD5" stroke="#C5BEAF" strokeWidth="1.5" filter="url(#clayShadow)" />

                {/* Right Branch: From diamond right point (71,40) to right and down */}
                <path d="M71 40 L88 40 L88 56 L82 56" stroke="#AFA799" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" filter="url(#clayLine)" />
                <path d="M84 54 L81 56 L84 58" stroke="#AFA799" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

                {/* Bottom Node from Diamond */}
                <path d="M55 52 L55 59" stroke="#AFA799" strokeWidth="1.8" strokeLinecap="round" filter="url(#clayLine)" />
                <path d="M52.5 57 L55 60 L57.5 57" stroke="#AFA799" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />

                {/* Bottom Node Box */}
                <rect x="36" y="60" width="38" height="15" rx="5" fill="#E6E1D7" stroke="#C8C1B3" strokeWidth="1.5" filter="url(#clayShadow)" />

                {/* Sub-node next to bottom */}
                <rect x="80" y="50" width="24" height="13" rx="4" fill="#E4DFD5" stroke="#C5BEAF" strokeWidth="1.5" filter="url(#clayShadow)" />
            </svg>

            {/* Dark Mode SVG with glowing neon cyan accents */}
            <svg viewBox="0 0 110 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full hidden dark:block">
                <defs>
                    <filter id="neonGlowCyan" x="-30%" y="-30%" width="160%" height="160%">
                        <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#38BDF8" floodOpacity="0.85" />
                        <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#67E8F9" floodOpacity="0.95" />
                    </filter>
                </defs>

                {/* Top Rounded Rectangle */}
                <rect x="36" y="4" width="38" height="15" rx="5" fill="rgba(6, 182, 212, 0.15)" stroke="#38BDF8" strokeWidth="1.6" filter="url(#neonGlowCyan)" />

                {/* Connector down to diamond */}
                <path d="M55 20 L55 27" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round" filter="url(#neonGlowCyan)" />
                <path d="M52.5 25 L55 28 L57.5 25" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />

                {/* Center Diamond */}
                <polygon points="55,28 71,40 55,52 39,40" fill="rgba(56, 189, 248, 0.25)" stroke="#67E8F9" strokeWidth="1.6" filter="url(#neonGlowCyan)" />

                {/* Left Branch */}
                <path d="M39 40 L28 40" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round" filter="url(#neonGlowCyan)" />
                <path d="M30 38 L27 40 L30 42" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />

                {/* Left Node Box */}
                <rect x="4" y="33" width="22" height="14" rx="4" fill="rgba(6, 182, 212, 0.15)" stroke="#38BDF8" strokeWidth="1.5" filter="url(#neonGlowCyan)" />

                {/* Right Branch */}
                <path d="M71 40 L88 40 L88 56 L82 56" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" filter="url(#neonGlowCyan)" />
                <path d="M84 54 L81 56 L84 58" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />

                {/* Bottom Connector */}
                <path d="M55 52 L55 59" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round" filter="url(#neonGlowCyan)" />
                <path d="M52.5 57 L55 60 L57.5 57" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />

                {/* Bottom Node Box */}
                <rect x="36" y="60" width="38" height="15" rx="5" fill="rgba(6, 182, 212, 0.15)" stroke="#38BDF8" strokeWidth="1.6" filter="url(#neonGlowCyan)" />

                {/* Sub-node */}
                <rect x="80" y="50" width="24" height="13" rx="4" fill="rgba(6, 182, 212, 0.15)" stroke="#38BDF8" strokeWidth="1.5" filter="url(#neonGlowCyan)" />
            </svg>
        </div>
    );
}

export default function ContactPage() {
    const { settings } = useSettings();

    /* ── Content from settings with exact fallbacks matching reference designs ── */
    const goalHeading  = settings.contact_goal_heading  || 'OUR GOAL OF SERVICE';
    const goalSubtitle = settings.contact_goal_subtitle ||
        'Quality products are our main goal of services. Our efficient and highly quality assurance team involved in method of level wise inspection.';

    const contactHeading  = settings.contact_heading  || 'CONTACT US';
    const contactSubtitle = settings.contact_subtitle ||
        'Feel free to talk to our representative at any time through our website or by using one of our contact numbers. Let us build your future together.';

    const addressLabel = settings.contact_address_label || 'Address Icon';
    const addressValue = settings.contact_address       || 'Heuse-74, Road-13, Sector-10, Uttara Model Town, Dhaka, Bangladesh.';
    const emailLabel   = settings.contact_email_label   || 'Email Icon';
    const emailValue   = settings.contact_email         || 'info@apparelemporium.net';
    const phoneLabel   = settings.contact_phone_label   || 'Phone Icon';
    const phoneValue   = settings.contact_phone         || '+88 01670 15 46 46';

    /* ── Image assets ── */
    const showroomLight = settings.contact_showroom_light || '/images/contact/showroom_light.jpg';
    const showroomDark  = settings.contact_showroom_dark  || '/images/contact/showroom_dark.jpg';
    const globeLight    = settings.contact_globe_light    || '/images/contact/globe_light.jpg';
    const globeDark     = settings.contact_globe_dark     || '/images/contact/globe_dark.jpg';
    const blazerLight   = settings.contact_blazer_light   || '/images/contact/blazer_light.jpg';
    const blazerDark    = settings.contact_blazer_dark    || '/images/contact/blazer_dark.jpg';

    /* ── Interaction state ── */
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [formSuccess, setFormSuccess] = useState(false);
    const [formError, setFormError] = useState('');
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });

    const copyToClipboard = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError('');
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (!res.ok) throw new Error('Submission failed');
            setFormSuccess(true);
            setFormData({ name: '', email: '', phone: '', message: '' });
            setTimeout(() => { setFormSuccess(false); setIsFormOpen(false); }, 3000);
        } catch {
            setFormError('Failed to send inquiry. Please try again.');
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <div className="contact-canvas min-h-screen relative overflow-hidden transition-colors duration-500">

            {/* Dark mode ambient glowing fog */}
            <div className="dark:block hidden pointer-events-none absolute inset-0 overflow-hidden z-0">
                <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-cyan-500/10 blur-[120px]" />
                <div className="absolute top-1/2 right-0 w-[520px] h-[520px] rounded-full bg-blue-600/10 blur-[150px]" />
                <div className="absolute bottom-16 left-1/3 w-80 h-80 rounded-full bg-teal-400/8 blur-[100px]" />
            </div>

            <div className="container mx-auto max-w-4xl px-4 sm:px-6 pt-28 sm:pt-32 pb-24 relative z-10 space-y-10 sm:space-y-12">

                {/* ═══════════════════════ SECTION 1: OUR GOAL OF SERVICE ═══════════════════════ */}
                <section className="flex justify-center">
                    <div className="goal-tablet rounded-[26px] sm:rounded-[32px] px-8 sm:px-14 py-7 sm:py-9 text-center max-w-2xl w-full">
                        <h1 className="goal-heading text-xl sm:text-2xl md:text-3xl font-black tracking-tight mb-2.5 uppercase font-heading">
                            {goalHeading}
                        </h1>
                        <p className="goal-subtext text-xs sm:text-[13px] leading-relaxed font-medium max-w-md mx-auto">
                            {goalSubtitle}
                        </p>
                    </div>
                </section>

                {/* ═══════════════════════ UPPER FLOATING ROW (Blazer, Globe, Flowchart) ═══════════════════════ */}
                <section className="flex items-center justify-between max-w-xl mx-auto px-4 sm:px-8">
                    {/* Left: 3D Tailored Blazer */}
                    <div className="floating-slow w-16 h-20 sm:w-20 sm:h-24 flex items-center justify-center">
                        <img
                            src={blazerLight}
                            alt="3D Tailored Blazer"
                            className="w-full h-full object-contain dark:hidden drop-shadow-[0_12px_20px_rgba(150,145,135,0.4)]"
                        />
                        <img
                            src={blazerDark}
                            alt="3D Tailored Blazer Dark"
                            className="w-full h-full object-contain hidden dark:block drop-shadow-[0_0_20px_rgba(6,182,212,0.35)]"
                        />
                    </div>

                    {/* Center: 100% Coded Animated 3D Interactive Globe */}
                    <div className="floating-reverse w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
                        <Coded3DGlobe size={125} className="mx-auto" />
                    </div>

                    {/* Right: 100% Coded 3D Flowchart diagram */}
                    <div className="floating-slow flex items-center justify-center">
                        <Flowchart3DIcon className="w-24 sm:w-28" />
                    </div>
                </section>

                {/* ═══════════════════════ SECTION 2: CONTACT US + 3D SHOWROOM WINDOW ═══════════════════════ */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-7 items-stretch">

                    {/* ── Left Column: Contact Us Glassmorphic Card ── */}
                    <div className="contact-glass-card rounded-[28px] sm:rounded-[34px] p-6 sm:p-8 flex flex-col justify-between">
                        <div>
                            <h2 className="contact-heading text-xl sm:text-2xl font-black tracking-tight mb-2.5 uppercase font-heading">
                                {contactHeading}
                            </h2>
                            <p className="contact-subtext text-xs sm:text-[13px] leading-relaxed font-medium mb-6">
                                {contactSubtitle}
                            </p>

                            {/* 3 Contact Pills */}
                            <div className="space-y-3.5">

                                {/* 1. Address Pill */}
                                <div
                                    onClick={() => copyToClipboard(addressValue, 'address')}
                                    className="contact-pill rounded-2xl p-3 sm:p-3.5 flex items-center gap-3.5 cursor-pointer group transition-all duration-200 hover:scale-[1.02] active:scale-[0.99]"
                                    title="Click to copy address"
                                >
                                    <div className="pill-inset-icon-box rounded-xl w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center shrink-0">
                                        <MapPin3DIcon size={28} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="pill-label text-[11px] font-bold uppercase tracking-wider mb-0.5">
                                            {addressLabel}
                                        </div>
                                        <div className="pill-value text-[11px] sm:text-xs leading-snug font-medium line-clamp-2">
                                            {addressValue}
                                        </div>
                                    </div>
                                    <div className="shrink-0 text-slate-400 group-hover:text-primary transition-colors pr-1">
                                        {copiedKey === 'address' ? <Check size={14} className="text-emerald-500" /> : <Copy size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                                    </div>
                                </div>

                                {/* 2. Email Pill */}
                                <a
                                    href={`mailto:${emailValue}`}
                                    className="contact-pill rounded-2xl p-3 sm:p-3.5 flex items-center gap-3.5 group transition-all duration-200 hover:scale-[1.02] active:scale-[0.99]"
                                >
                                    <div className="pill-inset-icon-box rounded-xl w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center shrink-0">
                                        <Mail3DIcon size={28} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="pill-label text-[11px] font-bold uppercase tracking-wider mb-0.5">
                                            {emailLabel}
                                        </div>
                                        <div className="pill-value text-[11px] sm:text-xs font-medium break-all">
                                            {emailValue}
                                        </div>
                                    </div>
                                </a>

                                {/* 3. Phone Pill */}
                                <a
                                    href={`tel:${phoneValue.replace(/\s+/g, '')}`}
                                    className="contact-pill rounded-2xl p-3 sm:p-3.5 flex items-center gap-3.5 group transition-all duration-200 hover:scale-[1.02] active:scale-[0.99]"
                                >
                                    <div className="pill-inset-icon-box rounded-xl w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center shrink-0">
                                        <Phone3DIcon size={28} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="pill-label text-[11px] font-bold uppercase tracking-wider mb-0.5">
                                            {phoneLabel}
                                        </div>
                                        <div className="pill-value text-[11px] sm:text-xs font-medium">
                                            {phoneValue}
                                        </div>
                                    </div>
                                </a>

                            </div>
                        </div>

                        {/* Send Direct Inquiry Link Button */}
                        <div className="pt-6 flex justify-end">
                            <button
                                onClick={() => setIsFormOpen(true)}
                                className="inquiry-btn rounded-full px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 active:scale-95 inline-flex items-center gap-2 cursor-pointer shadow-sm"
                            >
                                <MessageSquare size={13} />
                                <span>Send Direct Inquiry</span>
                            </button>
                        </div>
                    </div>

                    {/* ── Right Column: 3D Beveled Showroom Window ── */}
                    <div className="showroom-bezel rounded-[28px] sm:rounded-[36px] p-2.5 sm:p-3 h-[360px] sm:h-[420px] flex items-center justify-center overflow-hidden">
                        <div className="w-full h-full rounded-[22px] sm:rounded-[28px] overflow-hidden relative group">
                            {/* Light Mode Showroom */}
                            <img
                                src={showroomLight}
                                alt="Apparel Emporium Showroom Atelier"
                                className="w-full h-full object-cover rounded-[22px] sm:rounded-[28px] dark:hidden transition-transform duration-700 group-hover:scale-105"
                            />
                            {/* Dark Mode Showroom with Ambient Cyan Rim Lighting */}
                            <div className="hidden dark:block w-full h-full relative">
                                <img
                                    src={showroomDark}
                                    alt="Apparel Emporium Showroom Atelier Dark"
                                    className="w-full h-full object-cover rounded-[22px] sm:rounded-[28px] transition-transform duration-700 group-hover:scale-105"
                                />
                                <div
                                    className="absolute inset-0 rounded-[22px] sm:rounded-[28px] pointer-events-none"
                                    style={{
                                        boxShadow: 'inset 0 0 35px rgba(6,182,212,0.22)'
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                </section>

                {/* ═══════════════════════ LOWER FLOATING ROW ═══════════════════════ */}
                <section className="relative py-8 sm:py-12">

                    {/* Centered Large 3D Globe with orbit rings */}
                    <div className="flex justify-center">
                        <div className="floating-reverse w-32 h-32 sm:w-44 sm:h-44 flex items-center justify-center">
                            <img
                                src={globeLight}
                                alt="3D Global Network"
                                className="w-full h-full object-contain dark:hidden drop-shadow-[0_18px_32px_rgba(140,135,125,0.45)]"
                            />
                            <img
                                src={globeDark}
                                alt="3D Global Network Dark"
                                className="w-full h-full object-contain hidden dark:block drop-shadow-[0_0_36px_rgba(6,182,212,0.65)]"
                            />
                        </div>
                    </div>

                    {/* Top-Left: Flowchart */}
                    <div className="absolute top-2 left-2 sm:left-8 floating-slow">
                        <Flowchart3D className="w-16 h-13 sm:w-22 sm:h-18" />
                    </div>

                    {/* Bottom-Left: 3D Tailored Blazer */}
                    <div className="absolute bottom-2 left-6 sm:left-14 floating-reverse w-16 h-20 sm:w-20 sm:h-24">
                        <img
                            src={blazerLight}
                            alt="Tailored Blazer"
                            className="w-full h-full object-contain dark:hidden drop-shadow-[0_12px_20px_rgba(150,145,135,0.35)]"
                        />
                        <img
                            src={blazerDark}
                            alt="Tailored Blazer Dark"
                            className="w-full h-full object-contain hidden dark:block drop-shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                        />
                    </div>

                    {/* Top-Right: 3D Tailored Blazer */}
                    <div className="absolute top-2 right-6 sm:right-14 floating-slow w-16 h-20 sm:w-20 sm:h-24">
                        <img
                            src={blazerLight}
                            alt="Tailored Blazer"
                            className="w-full h-full object-contain dark:hidden drop-shadow-[0_12px_20px_rgba(150,145,135,0.35)]"
                        />
                        <img
                            src={blazerDark}
                            alt="Tailored Blazer Dark"
                            className="w-full h-full object-contain hidden dark:block drop-shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                        />
                    </div>

                    {/* Bottom-Right: Flowchart */}
                    <div className="absolute bottom-2 right-2 sm:right-8 floating-reverse">
                        <Flowchart3D className="w-16 h-13 sm:w-22 sm:h-18" />
                    </div>

                </section>

            </div>

            {/* ═══════════════════════ DIRECT INQUIRY MODAL ═══════════════════════ */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="contact-glass-card rounded-[32px] p-6 sm:p-8 max-w-md w-full relative shadow-2xl">
                        <button
                            onClick={() => setIsFormOpen(false)}
                            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                        >
                            <X size={18} />
                        </button>
                        <h3 className="contact-heading text-lg sm:text-xl font-black mb-1 uppercase font-heading">
                            Send Direct Inquiry
                        </h3>
                        <p className="contact-subtext text-xs mb-5 font-medium">
                            Leave your garments sourcing requirements and our merchandising team will respond promptly.
                        </p>
                        {formSuccess ? (
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-2xl flex items-center gap-3 text-xs font-bold">
                                <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                                <span>Thank you! Your message has been sent successfully.</span>
                            </div>
                        ) : (
                            <form onSubmit={handleFormSubmit} className="space-y-3.5">
                                {formError && (
                                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 rounded-xl text-xs font-bold">{formError}</div>
                                )}
                                <input
                                    type="text"
                                    placeholder="Your Full Name"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl modal-input text-xs font-medium focus:outline-none"
                                />
                                <input
                                    type="email"
                                    placeholder="Business Email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl modal-input text-xs font-medium focus:outline-none"
                                />
                                <input
                                    type="tel"
                                    placeholder="Phone / WhatsApp Number"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl modal-input text-xs font-medium focus:outline-none"
                                />
                                <textarea
                                    rows={3}
                                    placeholder="Describe your inquiry (product type, target quantity, fabric, etc.)..."
                                    required
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl modal-input text-xs font-medium focus:outline-none resize-none"
                                />
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="w-full py-3 rounded-xl inquiry-btn text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {formLoading ? 'Submitting...' : 'Submit Inquiry'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* ═══════════════════════ EXACT NEUMORPHIC & GLOW STYLING ═══════════════════════ */}
            <style jsx global>{`
                /* ── Canvas Background: Matches reference clay / linen tone ── */
                .contact-canvas {
                    background-color: #DDD8CF;
                }

                /* ── Top Goal Tablet: Embossed 3D Plaque ── */
                .goal-tablet {
                    background-color: #E8E4DC;
                    box-shadow: 
                        12px 12px 26px rgba(160, 155, 145, 0.45),
                        -10px -10px 22px rgba(255, 255, 255, 0.9),
                        inset 1px 1px 2px rgba(255, 255, 255, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.45);
                }
                .goal-heading {
                    color: #1A1D20;
                }
                .goal-subtext {
                    color: #4B5563;
                }

                /* ── Contact Card: Glassmorphic Panel ── */
                .contact-glass-card {
                    background-color: #E8E4DC;
                    box-shadow: 
                        12px 12px 26px rgba(160, 155, 145, 0.45),
                        -10px -10px 22px rgba(255, 255, 255, 0.9),
                        inset 1px 1px 2px rgba(255, 255, 255, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                }
                .contact-heading {
                    color: #1A1D20;
                }
                .contact-subtext {
                    color: #4B5563;
                }

                /* ── Contact Pills: Extruded clay pills ── */
                .contact-pill {
                    background-color: #EDEAE3;
                    box-shadow: 
                        6px 6px 14px rgba(155, 150, 140, 0.4),
                        -5px -5px 12px rgba(255, 255, 255, 0.9),
                        inset 1px 1px 2px rgba(255, 255, 255, 0.7);
                    border: 1px solid rgba(255, 255, 255, 0.6);
                }
                .contact-pill:hover {
                    background-color: #F2EFEB;
                    box-shadow: 
                        7px 7px 16px rgba(150, 145, 135, 0.5),
                        -6px -6px 14px rgba(255, 255, 255, 0.95);
                }
                .pill-inset-icon-box {
                    background-color: #E2DDD4;
                    box-shadow: 
                        inset 2px 2px 4px rgba(150, 145, 135, 0.5),
                        inset -2px -2px 4px rgba(255, 255, 255, 0.85);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }
                .pill-icon {
                    color: #1A1D20;
                }
                .pill-label {
                    color: #1A1D20;
                }
                .pill-value {
                    color: #4B5563;
                }

                /* ── Right Showroom Bezel Frame: Deep 3D frame ── */
                .showroom-bezel {
                    background-color: #EDE9E1;
                    box-shadow: 
                        12px 12px 26px rgba(155, 150, 140, 0.45),
                        -10px -10px 22px rgba(255, 255, 255, 0.9),
                        inset 3px 3px 6px rgba(255, 255, 255, 0.8),
                        inset -3px -3px 6px rgba(0, 0, 0, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.65);
                }

                /* ── Buttons & Inputs ── */
                .inquiry-btn {
                    background-color: #D5D0C6;
                    color: #1A1D20;
                    box-shadow: 
                        5px 5px 12px rgba(160, 155, 145, 0.45),
                        -4px -4px 10px rgba(255, 255, 255, 0.85),
                        inset 1px 1px 2px rgba(255, 255, 255, 0.5);
                    border: 1.5px solid rgba(255, 255, 255, 0.4);
                }
                .inquiry-btn:hover {
                    background-color: #CCC7BD;
                }
                .modal-input {
                    background-color: #EDE9E1;
                    color: #1A1D20;
                    border: 1px solid rgba(160, 155, 145, 0.4);
                    box-shadow: inset 1px 1px 3px rgba(160, 155, 145, 0.25);
                }

                /* ═══════════════════════ DARK MODE STYLES ═══════════════════════ */
                .dark .contact-canvas {
                    background-color: #080D1A;
                }

                /* Dark Goal Tablet with Glowing Cyan Neon */
                .dark .goal-tablet {
                    background: rgba(9, 18, 33, 0.82);
                    border: 1.5px solid rgba(56, 189, 248, 0.4);
                    box-shadow: 
                        0 0 28px rgba(6, 182, 212, 0.16),
                        inset 0 0 20px rgba(6, 182, 212, 0.06),
                        0 20px 40px rgba(0, 0, 0, 0.65);
                    backdrop-filter: blur(16px);
                }
                .dark .goal-heading {
                    color: #FFFFFF;
                    text-shadow: 0 0 16px rgba(56, 189, 248, 0.65);
                }
                .dark .goal-subtext {
                    color: #94A3B8;
                }

                /* Dark Contact Glass Card */
                .dark .contact-glass-card {
                    background: rgba(9, 18, 33, 0.82);
                    border: 1.5px solid rgba(56, 189, 248, 0.4);
                    box-shadow: 
                        0 0 28px rgba(6, 182, 212, 0.16),
                        inset 0 0 20px rgba(6, 182, 212, 0.06),
                        0 20px 40px rgba(0, 0, 0, 0.65);
                    backdrop-filter: blur(16px);
                }
                .dark .contact-heading {
                    color: #38BDF8;
                    text-shadow: 0 0 16px rgba(56, 189, 248, 0.7);
                }
                .dark .contact-subtext {
                    color: #94A3B8;
                }

                /* Dark Contact Pills */
                .dark .contact-pill {
                    background: rgba(12, 24, 45, 0.8);
                    border: 1.2px solid rgba(56, 189, 248, 0.35);
                    box-shadow: 
                        0 0 16px rgba(6, 182, 212, 0.15),
                        inset 0 0 10px rgba(6, 182, 212, 0.06);
                    backdrop-filter: blur(12px);
                }
                .dark .contact-pill:hover {
                    background: rgba(16, 32, 60, 0.9);
                    border-color: rgba(56, 189, 248, 0.6);
                    box-shadow: 
                        0 0 22px rgba(6, 182, 212, 0.35),
                        inset 0 0 14px rgba(56, 189, 248, 0.15);
                }
                .dark .pill-inset-icon-box {
                    background: rgba(6, 18, 36, 0.9);
                    border: 1.2px solid rgba(56, 189, 248, 0.5);
                    box-shadow: 
                        inset 0 0 8px rgba(6, 182, 212, 0.3),
                        0 0 10px rgba(6, 182, 212, 0.25);
                }
                .dark .pill-icon {
                    color: #38BDF8;
                    filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.8));
                }
                .dark .pill-label {
                    color: #E0F2FE;
                }
                .dark .pill-value {
                    color: #94A3B8;
                }

                /* Dark Showroom Bezel Frame with Cyan Rim Glow */
                .dark .showroom-bezel {
                    background: rgba(12, 24, 44, 0.88);
                    border: 1.5px solid rgba(56, 189, 248, 0.45);
                    box-shadow: 
                        0 0 30px rgba(6, 182, 212, 0.22),
                        inset 0 0 14px rgba(6, 182, 212, 0.1),
                        0 15px 35px rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(16px);
                }

                /* Dark Buttons & Inputs */
                .dark .inquiry-btn {
                    background: linear-gradient(135deg, #0A2540 0%, #0D3B66 100%);
                    color: #FFFFFF;
                    border: 1.5px solid rgba(56, 189, 248, 0.7);
                    box-shadow: 
                        0 0 20px rgba(14, 165, 233, 0.45),
                        inset 0 0 12px rgba(56, 189, 248, 0.25);
                }
                .dark .inquiry-btn:hover {
                    background: linear-gradient(135deg, #0D3B66 0%, #0284C7 100%);
                    box-shadow: 0 0 30px rgba(14, 165, 233, 0.7);
                }
                .dark .modal-input {
                    background: rgba(10, 20, 36, 0.9);
                    color: #FFFFFF;
                    border: 1px solid rgba(56, 189, 248, 0.3);
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
                .floating-slow {
                    animation: floatSlow 5s ease-in-out infinite;
                }
                .floating-reverse {
                    animation: floatReverse 6s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
