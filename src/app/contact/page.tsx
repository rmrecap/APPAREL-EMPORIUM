'use client';

import React, { useState } from 'react';
import {
    Mail, MapPin, Phone, Send, Loader2, MessageSquare,
    Clock, ShieldCheck, CheckCircle2, Sparkles, Building2, Globe
} from 'lucide-react';
import AtelierDecorations3D from '@/components/products/AtelierDecorations3D';
import { useSettings } from '@/context/SettingsContext';

export default function ContactPage() {
    const { settings } = useSettings();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '', email: '', company: '', phone: '', country: '', message: '', productInterest: '', estimatedMoq: ''
    });

    const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error('Failed to send inquiry. Please try again.');

            setSuccess(true);
            setFormData({ name: '', email: '', company: '', phone: '', country: '', message: '', productInterest: '', estimatedMoq: '' });
            setTimeout(() => setSuccess(false), 6000);
        } catch (err: any) {
            setError(err.message || 'An error occurred while sending your inquiry.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="catalog-bg-canvas min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-500">
            {/* ── HERO BANNER: Deep Navy Blue Banner ── */}
            <div className="bg-[#142338] dark:bg-[#0A1220] text-white pt-28 sm:pt-32 pb-14 sm:pb-16 relative overflow-hidden shadow-lg border-b border-white/10">
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                {/* 3D Sewing Needle, Thread & Button Floating Art */}
                <AtelierDecorations3D variant="top-right" />

                <div className="container mx-auto px-4 text-center relative z-10 max-w-4xl">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-black uppercase tracking-widest mb-4">
                        <MessageSquare size={13} /> Global Merchandising Desk
                    </span>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-heading tracking-tight mb-4 text-white">
                        Contact Us &amp; Request Sourcing Quotation
                    </h1>
                    <p className="text-blue-100/90 text-xs sm:text-sm md:text-base font-medium leading-relaxed max-w-2xl mx-auto">
                        Let's discuss your custom garment tech-packs, fabric specifications, and export schedules. Our Dhaka merchandising team responds within 24 hours.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-6xl space-y-12">

                <div className="grid lg:grid-cols-12 gap-8 items-start">

                    {/* ── 3D INSET SOURCING INQUIRY FORM (7 COLS) ── */}
                    <div className="lg:col-span-7 neumorphic-card-3d rounded-[32px] p-6 sm:p-9 space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                    Send Sourcing RFQ
                                </h2>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                    <Sparkles size={12} /> Fast Response
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                Fill in your order details and attach any target specifications.
                            </p>
                        </div>

                        {success && (
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-2xl flex items-center gap-3 text-xs font-bold animate-in fade-in">
                                <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                                <span>Thank you! Your sourcing inquiry has been received. Our team will contact you shortly.</span>
                            </div>
                        )}

                        {error && (
                            <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 rounded-2xl text-xs font-bold">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 mb-1.5">
                                        Full Name *
                                    </label>
                                    <input
                                        required
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        type="text"
                                        placeholder="e.g. David Miller"
                                        className="w-full px-4 py-2.5 rounded-xl input-3d-inset text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 mb-1.5">
                                        Work Email *
                                    </label>
                                    <input
                                        required
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        type="email"
                                        placeholder="buyer@brand.com"
                                        className="w-full px-4 py-2.5 rounded-xl input-3d-inset text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 mb-1.5">
                                        Company / Brand Name
                                    </label>
                                    <input
                                        name="company"
                                        value={formData.company}
                                        onChange={handleChange}
                                        type="text"
                                        placeholder="e.g. Nordic Apparel AB"
                                        className="w-full px-4 py-2.5 rounded-xl input-3d-inset text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 mb-1.5">
                                        Country / Market
                                    </label>
                                    <input
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        type="text"
                                        placeholder="e.g. Germany, UK, USA"
                                        className="w-full px-4 py-2.5 rounded-xl input-3d-inset text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 mb-1.5">
                                        Product Interest
                                    </label>
                                    <select
                                        name="productInterest"
                                        value={formData.productInterest}
                                        onChange={handleChange}
                                        className="w-full px-3.5 py-2.5 rounded-xl input-3d-inset text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/40 transition-all cursor-pointer"
                                    >
                                        <option value="">Select Category...</option>
                                        <option value="Knitwear (T-Shirts, Polos, Hoodies)">Knitwear (T-Shirts, Polos, Hoodies)</option>
                                        <option value="Woven (Denim Jeans, Casual Shirts, Jackets)">Woven (Denim, Shirts, Jackets)</option>
                                        <option value="Sweater & Cardigans">Sweater &amp; Cardigans</option>
                                        <option value="Home Textiles & Towels">Home Textiles &amp; Towels</option>
                                        <option value="Footwear & Leather Goods">Footwear &amp; Leather Goods</option>
                                        <option value="Custom Sourcing / Other">Custom Sourcing / Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 mb-1.5">
                                        Estimated Target MOQ
                                    </label>
                                    <input
                                        name="estimatedMoq"
                                        value={formData.estimatedMoq}
                                        onChange={handleChange}
                                        type="text"
                                        placeholder="e.g. 1,000 pcs"
                                        className="w-full px-4 py-2.5 rounded-xl input-3d-inset text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 mb-1.5">
                                    Detailed Message &amp; Specifications *
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Provide fabric composition (e.g. 100% Combed Cotton 220 GSM), size set, target FOB price, or delivery deadline..."
                                    className="w-full px-4 py-3 rounded-xl input-3d-inset text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/40 transition-all resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 px-6 rounded-xl bg-[#1B2B44] hover:bg-[#111C2E] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        <span>Submitting Inquiry...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send size={15} />
                                        <span>Submit Sourcing RFQ</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* ── 3D GLOBAL HEADQUARTERS & ATELIER CARDS (5 COLS) ── */}
                    <div className="lg:col-span-5 space-y-5">

                        {/* Head Office Card */}
                        <div className="neumorphic-card-3d rounded-[28px] p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl pedestal-stage-3d flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xs">
                                    <Building2 size={22} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                                        Corporate Headquarters
                                    </h3>
                                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                        Dhaka, Bangladesh
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 pt-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                                <div className="flex items-start gap-3">
                                    <MapPin size={16} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                    <span>
                                        {settings.company_address || "House-12, Road-04, Sector-03, Uttara, Dhaka-1230, Bangladesh"}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Phone size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
                                    <span>{settings.company_phone || "+880 1711-000000"}</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Mail size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
                                    <span>{settings.company_email || "info@apparelemporium.com"}</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Clock size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
                                    <span>Sun - Thu: 9:00 AM - 7:00 PM (BST)</span>
                                </div>
                            </div>
                        </div>

                        {/* Global Trade & WhatsApp Direct Card */}
                        <div className="sidebar-3d-panel rounded-[28px] p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl pedestal-stage-3d flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xs">
                                    <Globe size={22} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                                        Direct Buyer Liaison
                                    </h3>
                                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                        Instant WhatsApp &amp; Video Call
                                    </p>
                                </div>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                For urgent tech-pack clarification or live sampling room video conferences with our senior merchandisers:
                            </p>

                            <a
                                href="https://wa.me/8801700000000"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
                            >
                                <MessageSquare size={16} />
                                <span>Chat on Official WhatsApp</span>
                            </a>
                        </div>

                        {/* 24h Guarantee Badge Card */}
                        <div className="spec-box-3d rounded-[24px] p-4 flex items-center gap-3">
                            <ShieldCheck size={26} className="text-blue-600 dark:text-blue-400 shrink-0" />
                            <div>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                    24-Hour RFQ Guarantee
                                </h4>
                                <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">
                                    All tech-packs and fabric queries receive detailed cost analysis within one business day.
                                </p>
                            </div>
                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
}
