'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSettings } from '@/context/SettingsContext';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';

export default function FloatingWhatsApp() {
    const pathname = usePathname();
    const { settings } = useSettings();
    const [isOpen, setIsOpen] = useState(false);

    // Never render inside executive / admin portal
    if (pathname?.startsWith('/executive-portal-aelbd')) return null;

    // Resolve WhatsApp number with prioritized fallbacks
    const rawNumber = settings.contact_whatsapp || settings.whatsapp_number || '+88 018 1142 2225';
    const cleanNumber = rawNumber.replace(/[^0-9]/g, '');
    const companyName = settings.company_name || 'Apparel Emporium';

    const defaultMessage = `Hello ${companyName}, I would like to inquire about your garments manufacturing and sourcing services.`;
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(defaultMessage)}`;

    const handleOpenWhatsApp = (customText?: string) => {
        const text = customText || defaultMessage;
        const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
        setIsOpen(false);
    };

    return (
        <aside aria-label="WhatsApp Support" className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end pointer-events-auto">
            {/* ── EXPANDABLE CHAT CARD ── */}
            {isOpen && (
                <div 
                    className="mb-3 w-[310px] sm:w-[340px] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-white/20 dark:border-white/10 bg-[#FAF7F2] dark:bg-[#0B1324] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-300"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#128C7E] to-[#25D366] text-white p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-white shadow-inner">
                                <MessageCircle size={22} className="text-white" />
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-300 border-2 border-[#128C7E] rounded-full animate-pulse" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black tracking-tight leading-none text-white">
                                    {companyName}
                                </h4>
                                <div className="flex items-center gap-1.5 mt-1 text-[11px] font-medium text-emerald-100">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping inline-block" />
                                    <span>Merchandising Desk • Online</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            aria-label="Close chat window"
                            className="w-7 h-7 rounded-full bg-black/10 hover:bg-black/25 flex items-center justify-center text-white transition-colors cursor-pointer"
                        >
                            <X size={15} />
                        </button>
                    </div>

                    {/* Chat Body */}
                    <div className="p-4 space-y-3 bg-[#EFEAE2]/60 dark:bg-[#080E1A]/80">
                        {/* Bot / Agent speech bubble */}
                        <div className="bg-white dark:bg-[#121E36] p-3.5 rounded-2xl rounded-tl-sm shadow-sm border border-slate-200/60 dark:border-white/5 space-y-2">
                            <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                                👋 Welcome to <strong>{companyName}</strong>! Have an inquiry about fabrics, sample development, or bulk export orders?
                            </p>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-white/5">
                                <span>WhatsApp: <strong>{rawNumber}</strong></span>
                                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">Ready</span>
                            </div>
                        </div>

                        {/* Quick Prompts */}
                        <div className="space-y-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Sparkles size={11} className="text-amber-500" />
                                Quick Topics
                            </span>
                            <div className="grid grid-cols-1 gap-1.5">
                                <button
                                    onClick={() => handleOpenWhatsApp('Hello, I would like to request a bulk quotation for readymade garments.')}
                                    className="text-left text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 p-2 rounded-xl border border-slate-200/50 dark:border-white/5 transition-all hover:translate-x-1"
                                >
                                    💼 Request Bulk RFQ / Pricing
                                </button>
                                <button
                                    onClick={() => handleOpenWhatsApp('Hello, I have a custom tech-pack and would like to discuss sample development.')}
                                    className="text-left text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 p-2 rounded-xl border border-slate-200/50 dark:border-white/5 transition-all hover:translate-x-1"
                                >
                                    ✂️ Custom Tech-Pack & Sampling
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bottom CTA Action Button */}
                    <div className="p-3 bg-white dark:bg-[#0B1324] border-t border-slate-200/80 dark:border-white/10">
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setIsOpen(false)}
                            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#20bd5a] hover:to-[#0f7569] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                        >
                            <Send size={14} />
                            <span>Start WhatsApp Chat</span>
                        </a>
                    </div>
                </div>
            )}

            {/* ── FLOATING LAUNCHER PILL / BUTTON ── */}
            <div className="flex items-center gap-2.5">
                {/* Tooltip hint if closed */}
                {!isOpen && (
                    <button
                        onClick={() => setIsOpen(true)}
                        className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/95 dark:bg-[#0E1726]/95 backdrop-blur-md shadow-[0_8px_25px_rgba(0,0,0,0.12)] border border-slate-200/80 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-slate-200 hover:scale-105 active:scale-95 transition-all duration-200 group cursor-pointer"
                    >
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Chat on WhatsApp</span>
                    </button>
                )}

                {/* Primary WhatsApp Action Bubble */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Open WhatsApp Chat Support"
                    className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 shadow-[0_10px_25px_rgba(37,211,102,0.45)] dark:shadow-[0_10px_30px_rgba(37,211,102,0.35)] bg-gradient-to-tr from-[#128C7E] via-[#25D366] to-[#4eed8a]"
                >
                    {/* Glowing pulse rings */}
                    <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-35 animate-ping pointer-events-none" />
                    
                    {isOpen ? (
                        <X size={26} className="relative z-10 transition-transform duration-200 rotate-90" />
                    ) : (
                        <MessageCircle size={28} className="relative z-10 drop-shadow-md" />
                    )}

                    {/* Online indicator dot */}
                    {!isOpen && (
                        <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white dark:border-[#080E1A] rounded-full z-20" />
                    )}
                </button>
            </div>
        </aside>
    );
}
