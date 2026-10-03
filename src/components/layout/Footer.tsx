'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSettings } from '@/context/SettingsContext';
import { usePathname } from 'next/navigation';
import { 
    Mail, MapPin, Phone, MessageCircle, Globe, Building2, UserCheck, ArrowRight, ShieldCheck 
} from 'lucide-react';

type MenuItem = {
    id: string;
    label: string;
    url: string;
    target: string;
    parentId?: string;
};

type CategoryItem = {
    id: string;
    name: string;
    slug: string;
};

export default function Footer() {
    const { settings } = useSettings();
    const pathname = usePathname();

    if (pathname?.startsWith('/executive-portal-aelbd')) return null;

    const [footerMenus, setFooterMenus] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<CategoryItem[]>([]);

    const DEFAULT_LINKS = [
        { id: '1', label: 'About Us', url: '/about', target: '_self' },
        { id: '2', label: 'Company Heritage', url: '/about', target: '_self' },
        { id: '3', label: 'Careers', url: '/careers', target: '_self' },
        { id: '4', label: 'Our Factories', url: '/factories', target: '_self' },
        { id: '5', label: 'Contact', url: '/contact', target: '_self' }
    ];

    useEffect(() => {
        fetch('/api/menus?location=footer')
            .then(res => res.ok ? res.json() : null)
            .then(data => data && data.success && setFooterMenus(data.flat.filter((m: any) => m.active)))
            .catch(() => { });

        fetch('/api/categories')
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data && Array.isArray(data)) {
                    setCategories(data.slice(0, 5));
                }
            })
            .catch(() => { });
    }, []);

    const linksToRender = footerMenus.length > 0 ? footerMenus.filter(m => !m.parentId) : DEFAULT_LINKS;
    const year = new Date().getFullYear();

    // Corporate data with exact updated values from the proprietor signature card
    const companyName = settings.company_name || 'Apparel Emporium';
    const proprietorName = settings.proprietor_name || 'Md. Kamal Hossain';
    const proprietorTitle = settings.proprietor_title || 'Proprietor';
    const address = settings.contact_address || settings.company_address || 'House # 03 (2nd Floor), Road # 12, Sector # 13, Uttara Model Town, Dhaka- 1230, Bangladesh';
    const telephone = settings.contact_phone || settings.company_phone || '+88 02 4895 5519, 096 6691 2038';
    const cellWhatsApp = settings.contact_whatsapp || settings.whatsapp_number || '+88 018 1142 2225';
    const email = settings.contact_email || settings.company_email || 'kamal@aelbd.net';
    const website = settings.website_url ? settings.website_url.replace(/^https?:\/\//, '') : 'www.aelbd.net';

    const cleanWa = cellWhatsApp.replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent('Hello Apparel Emporium, I would like to inquire about your garments sourcing services.')}`;

    return (
        <footer className="bg-[#121620] dark:bg-[#060A12] text-slate-300 pt-16 pb-12 border-t border-slate-800/80 dark:border-white/5 transition-colors duration-500">
            <div className="max-w-7xl mx-auto px-5 sm:px-6">
                
                {/* Main Grid: Left Corporate Info Card + Right Navigation Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 mb-14">
                    
                    {/* ══════════ LEFT COLUMN (5 Cols): Corporate HQ & Proprietor Desk ══════════ */}
                    <div className="lg:col-span-5 space-y-4">
                        
                        {/* 3D Glassmorphic Corporate Badge */}
                        <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-b from-white/[0.08] to-white/[0.02] dark:from-white/[0.05] dark:to-transparent border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.35)] backdrop-blur-md space-y-4">
                            
                            {/* Brand Header */}
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-amber-400 dark:text-cyan-400" />
                                        <h3 className="text-white font-black text-lg tracking-tight font-heading">
                                            {companyName}
                                        </h3>
                                    </div>
                                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                                        100% Export Oriented Garments Buying House
                                    </p>
                                </div>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    Active Sourcing
                                </span>
                            </div>

                            {/* Proprietor Identification Pill */}
                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-black text-white text-sm shadow-md shrink-0">
                                    KH
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-amber-400/90 dark:text-cyan-400/90 flex items-center gap-1">
                                        <UserCheck size={11} />
                                        <span>{proprietorTitle}</span>
                                    </div>
                                    <div className="text-xs sm:text-[13px] font-black text-white tracking-tight truncate">
                                        {proprietorName}
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Corporate Contacts */}
                            <div className="space-y-2.5 text-xs text-slate-300">
                                {/* Address */}
                                <div className="flex items-start gap-2.5">
                                    <MapPin size={16} className="text-amber-400 dark:text-cyan-400 shrink-0 mt-0.5" />
                                    <span className="leading-snug text-slate-300 font-medium">
                                        {address}
                                    </span>
                                </div>

                                {/* Telephone */}
                                <div className="flex items-center gap-2.5">
                                    <Phone size={15} className="text-amber-400 dark:text-cyan-400 shrink-0" />
                                    <span className="font-semibold text-slate-200">
                                        Tel: <a href="tel:+880248955519" className="hover:text-white transition-colors">{telephone}</a>
                                    </span>
                                </div>

                                {/* Cell / WhatsApp */}
                                <div className="flex items-center gap-2.5">
                                    <MessageCircle size={15} className="text-emerald-400 shrink-0" />
                                    <a
                                        href={waUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5 group"
                                    >
                                        <span>Cell / WhatsApp: {cellWhatsApp}</span>
                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase font-black">
                                            Chat
                                        </span>
                                    </a>
                                </div>

                                {/* Email */}
                                <div className="flex items-center gap-2.5">
                                    <Mail size={15} className="text-amber-400 dark:text-cyan-400 shrink-0" />
                                    <span className="font-medium text-slate-300">
                                        E-mail: <a href={`mailto:${email}`} className="text-cyan-400 hover:underline">{email}</a>
                                    </span>
                                </div>

                                {/* Web */}
                                <div className="flex items-center gap-2.5">
                                    <Globe size={15} className="text-amber-400 dark:text-cyan-400 shrink-0" />
                                    <span className="font-medium text-slate-300">
                                        Web: <a href={`https://${website}`} target="_blank" rel="noopener noreferrer" className="text-slate-200 hover:text-white hover:underline">{website}</a>
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>


                    {/* ══════════ RIGHT COLUMNS (7 Cols): Quick Navigation & Categories ══════════ */}
                    <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 pt-2 text-center sm:text-left">
                        
                        {/* Column 1: Company */}
                        <div className="space-y-3.5">
                            <h4 className="text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                Company
                            </h4>
                            <ul className="space-y-2.5 text-xs sm:text-sm">
                                <li><Link href="/about" className="text-slate-400 hover:text-white transition-colors">About Us</Link></li>
                                <li><Link href="/about#certifications" className="text-slate-400 hover:text-white transition-colors">Compliance & Audits</Link></li>
                                <li><Link href="/contact" className="text-slate-400 hover:text-white transition-colors">Contact Corporate HQ</Link></li>
                                <li><Link href="/careers" className="text-slate-400 hover:text-white transition-colors">Careers & Merchandising</Link></li>
                            </ul>
                        </div>

                        {/* Column 2: Sourcing Divisions */}
                        <div className="space-y-3.5">
                            <h4 className="text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                Sourcing
                            </h4>
                            <ul className="space-y-2.5 text-xs sm:text-sm">
                                <li><Link href="/products?category=knitwear" className="text-slate-400 hover:text-white transition-colors">Knitwear Fashion</Link></li>
                                <li><Link href="/products?category=woven" className="text-slate-400 hover:text-white transition-colors">Woven & Denim</Link></li>
                                <li><Link href="/products?category=sweater" className="text-slate-400 hover:text-white transition-colors">Sweaters & Outerwear</Link></li>
                                <li><Link href="/products" className="text-slate-400 hover:text-white transition-colors">All Product Catalog</Link></li>
                            </ul>
                        </div>

                        {/* Column 3: Support & Hotlines */}
                        <div className="space-y-3.5">
                            <h4 className="text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                Buyer Support
                            </h4>
                            <ul className="space-y-2.5 text-xs sm:text-sm">
                                <li><Link href="/faqs" className="text-slate-400 hover:text-white transition-colors">Sampling FAQs</Link></li>
                                <li><Link href="/terms" className="text-slate-400 hover:text-white transition-colors">Terms of Supply</Link></li>
                                <li><Link href="/privacy-policy" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                                <li>
                                    <a
                                        href={waUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors inline-flex items-center gap-1.5"
                                    >
                                        <MessageCircle size={13} />
                                        <span>WhatsApp 24/7 Desk</span>
                                    </a>
                                </li>
                            </ul>
                        </div>

                    </div>

                </div>

                {/* Bottom Centered Copyright Strip */}
                <div className="pt-8 border-t border-slate-800/80 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                    <p className="text-xs text-slate-400 tracking-wide">
                        All Rights Reserved, {companyName} {year} &bull; Head Office: {address}
                    </p>
                    <div className="text-[11px] text-slate-400 flex items-center gap-4">
                        <span>Proprietor: <strong className="text-slate-300">{proprietorName}</strong></span>
                        <span>&bull;</span>
                        <a href={`mailto:${email}`} className="hover:text-white transition-colors">{email}</a>
                    </div>
                </div>

            </div>
        </footer>
    );
}
