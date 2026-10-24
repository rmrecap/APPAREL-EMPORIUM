'use client';

import React, { useState } from 'react';
import { ShieldCheck, Download, FileCheck, CheckCircle2, ArrowRight, Loader2, Lock, Building, Globe, Mail, User, Phone } from 'lucide-react';

interface B2BLeadMagnetProps {
    sourcePage?: string;
    defaultCategory?: 'woven' | 'knitwear' | 'sweater' | 'all';
    title?: string;
    subtitle?: string;
}

export default function B2BLeadMagnetSection({
    sourcePage = 'Website',
    defaultCategory = 'all',
    title = 'Request 2026 Factory Compliance Profile & Line Sheet',
    subtitle = 'Instant access to audited factory certifications (BSCI, SEDEX, OEKO-TEX, GOTS), machinery inventories, and wholesale production pricing.'
}: B2BLeadMagnetProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [company, setCompany] = useState('');
    const [country, setCountry] = useState('');
    const [phone, setPhone] = useState('');
    const [category, setCategory] = useState<string>(defaultCategory);
    const [requestType, setRequestType] = useState('2026 Factory Audit Dossier & Line Sheet');
    const [volume, setVolume] = useState('1,000 - 5,000 pcs');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMessage('');

        const payload = {
            name,
            email,
            company,
            country,
            phone: phone || null,
            productInterest: `[Line Sheet Request] ${category.toUpperCase()} (${requestType})`,
            message: `Lead Magnet Request from page: ${sourcePage}
Company: ${company}
Country: ${country}
Request Type: ${requestType}
Category Interest: ${category}
Expected Volume: ${volume}
Direct Contact: ${phone || 'N/A'}`
        };

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to submit request');
            }

            setSubmitted(true);
        } catch (err: any) {
            setErrorMessage(err.message || 'Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white p-8 md:p-12 shadow-2xl border border-gray-800 my-16">
            {/* Background subtle glow */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                
                {/* Left Column: Value Prop */}
                <div className="lg:col-span-6 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs font-bold uppercase tracking-wider">
                        <ShieldCheck className="w-4 h-4" /> B2B Sourcing Dossier
                    </div>

                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                        {title}
                    </h2>

                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                        {subtitle}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10">
                            <FileCheck className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                            <div>
                                <h4 className="text-sm font-bold text-white">Full Social Audit Reports</h4>
                                <p className="text-xs text-gray-400">BSCI (A/B), SEDEX SMETA 4-Pillar, WRAP Gold</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10">
                            <Download className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                            <div>
                                <h4 className="text-sm font-bold text-white">2026 Production Line Sheets</h4>
                                <p className="text-xs text-gray-400">Woven, Circular Knits & Sweater styles with FOB indicators</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-400 pt-2 border-t border-gray-800">
                        <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-gray-400" /> Direct NDA Protected</span>
                        <span>•</span>
                        <span>Turnaround: Delivered within 2 business hours</span>
                    </div>
                </div>

                {/* Right Column: High-Converting Form */}
                <div className="lg:col-span-6">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/15 shadow-xl">
                        {submitted ? (
                            <div className="text-center py-8 space-y-4">
                                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 animate-in zoom-in">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Dossier Request Received!</h3>
                                <p className="text-sm text-gray-300 max-w-md mx-auto">
                                    Thank you, <span className="text-white font-semibold">{name}</span>. Our merchandising team will deliver the 2026 Factory Compliance Profile and Line Sheet to <span className="text-primary font-semibold">{email}</span> within 2 hours.
                                </p>
                                <div className="pt-4">
                                    <a
                                        href="/request-quote"
                                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition shadow-lg"
                                    >
                                        Have a Tech Pack Ready? Submit RFQ <ArrowRight className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
                                            <User className="w-3.5 h-3.5 text-primary" /> Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="e.g. Sarah Jenkins"
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900/80 border border-gray-700 text-white placeholder-gray-500 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
                                            <Mail className="w-3.5 h-3.5 text-primary" /> Work Email *
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="sarah@brandname.com"
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900/80 border border-gray-700 text-white placeholder-gray-500 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
                                            <Building className="w-3.5 h-3.5 text-primary" /> Company / Brand *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={company}
                                            onChange={(e) => setCompany(e.target.value)}
                                            placeholder="e.g. Nordik Apparel Ltd"
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900/80 border border-gray-700 text-white placeholder-gray-500 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
                                            <Globe className="w-3.5 h-3.5 text-primary" /> Buyer Country *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={country}
                                            onChange={(e) => setCountry(e.target.value)}
                                            placeholder="e.g. United Kingdom / USA / UAE"
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900/80 border border-gray-700 text-white placeholder-gray-500 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
                                            <Phone className="w-3.5 h-3.5 text-primary" /> Phone / WhatsApp
                                        </label>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="+1 (555) 000-0000"
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900/80 border border-gray-700 text-white placeholder-gray-500 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                                            Category Interest
                                        </label>
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900/80 border border-gray-700 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                                        >
                                            <option value="all">All Core Categories (Woven, Knits, Sweaters)</option>
                                            <option value="woven">Woven Garments (Denim, Twill, Shirts, Pants)</option>
                                            <option value="knitwear">Circular Knitwear (T-Shirts, Hoodies, Polos)</option>
                                            <option value="sweater">Flat-Knit Sweaters (3GG - 14GG Jacquards)</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                                        Estimated Order Volume
                                    </label>
                                    <select
                                        value={volume}
                                        onChange={(e) => setVolume(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900/80 border border-gray-700 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                                    >
                                        <option value="1,000 - 3,000 pcs">1,000 - 3,000 pieces (Test / Pilot Order)</option>
                                        <option value="3,000 - 10,000 pcs">3,000 - 10,000 pieces (Standard Production)</option>
                                        <option value="10,000+ pcs">10,000+ pieces (High Volume / Multi-Store)</option>
                                    </select>
                                </div>

                                {errorMessage && (
                                    <p className="text-xs text-red-400 bg-red-950/50 border border-red-800 p-2.5 rounded-lg">
                                        {errorMessage}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full mt-2 py-3 px-6 rounded-xl bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/25 transition disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" /> Submitting Request...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-4 h-4" /> Download 2026 Profile & Line Sheet
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
