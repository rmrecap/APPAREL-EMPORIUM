'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/context/ThemeContext';
import {
    X,
    ChevronDown,
    ChevronRight,
    User,
    Phone,
    Mail,
    MessageCircle,
    Sun,
    Moon,
    ArrowRight,
    ShoppingBag,
    Factory,
    ShieldCheck,
    Sparkles,
    Layers
} from 'lucide-react';

type MenuItem = {
    id: string;
    label: string;
    url: string;
    target?: string;
    isMegaMenu?: boolean;
    megaMenuData?: string | null;
    children?: MenuItem[];
    icon?: string | null;
};

interface MobileNavProps {
    menus: MenuItem[];
    isOpen: boolean;
    onClose: () => void;
}

const DEFAULT_NAV_ITEMS: MenuItem[] = [
    { id: 'home', label: 'Home', url: '/' },
    {
        id: 'products',
        label: 'Products & Collections',
        url: '/products',
        children: [
            { id: 'p-knit', label: 'Knitwear Sourcing', url: '/products?category=knitwear' },
            { id: 'p-woven', label: 'Woven Garments', url: '/products?category=woven' },
            { id: 'p-sweater', label: 'Sweater Fashion', url: '/products?category=sweater' },
            { id: 'p-denim', label: 'Denim & Bottoms', url: '/products?category=denim' },
            { id: 'p-hometextile', label: 'Home Textiles', url: '/products?category=home-textile' },
            { id: 'p-accessories', label: 'Apparel Accessories', url: '/products?category=accessories' },
        ]
    },
    { id: 'divisions', label: 'Manufacturing Divisions', url: '/#divisions' },
    { id: 'about', label: 'About Us', url: '/about' },
    { id: 'support', label: 'Buyer Support & FAQs', url: '/support' },
    { id: 'contact', label: 'Contact Us', url: '/contact' },
    { id: 'portal', label: 'Buyer Portal', url: '/buyer-portal' },
];

export default function MobileNav({ menus, isOpen, onClose }: MobileNavProps) {
    const pathname = usePathname();
    const { settings } = useSettings();
    const { theme, toggleTheme } = useTheme();
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    // Body scroll lock when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Close on route navigation
    useEffect(() => {
        if (isOpen) {
            onClose();
        }
    }, [pathname]);

    // Close on Escape key press
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (!isOpen) return null;

    const toggleExpand = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const navItemsToRender = menus && menus.length > 0 ? menus : DEFAULT_NAV_ITEMS;

    const logoSrc = theme === 'dark'
        ? (settings.header_logo_dark || settings.logo_dark || '/logo.jpg')
        : (settings.header_logo_light || settings.logo_light || '/logo.jpg');

    const renderMegaMenuItems = (dataStr: string | null) => {
        if (!dataStr) return null;
        try {
            const columns = JSON.parse(dataStr);
            return (
                <div className="space-y-3 pt-2">
                    {columns.map((col: any, idx: number) => (
                        <div
                            key={idx}
                            className="p-3 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.03] space-y-2"
                        >
                            <h5 className="text-[11px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-1.5">
                                <span className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-xs"></span>
                                    {col.title}
                                </span>
                            </h5>
                            {col.sections && col.sections.length > 0 ? (
                                <div className="space-y-2">
                                    {col.sections.map((sec: any, sIdx: number) => (
                                        <div key={sIdx} className="space-y-1">
                                            {sec.header && (
                                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                                                    {sec.header}
                                                </span>
                                            )}
                                            <ul className="space-y-1">
                                                {sec.links?.map((link: any, lIdx: number) => (
                                                    <li key={lIdx}>
                                                        <Link
                                                            href={link.url}
                                                            onClick={onClose}
                                                            className="text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 py-1 px-1.5 rounded block transition-colors"
                                                        >
                                                            {link.label}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <ul className="space-y-1">
                                    {col.links?.map((link: any, lIdx: number) => (
                                        <li key={lIdx}>
                                            <Link
                                                href={link.url}
                                                onClick={onClose}
                                                className="text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 py-1 px-1.5 rounded block transition-colors"
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            );
        } catch {
            return null;
        }
    };

    const renderItem = (item: MenuItem, depth = 0) => {
        const isExpanded = expandedIds.has(item.id);
        const hasChildren = Boolean(item.children && item.children.length > 0);
        const hasMegaMenu = Boolean(item.isMegaMenu && item.megaMenuData);
        const hasSub = hasChildren || hasMegaMenu;
        const isActive = pathname === item.url || (item.url !== '/' && pathname.startsWith(item.url));
        const linkTarget = item.target && item.target !== '_self' ? item.target : undefined;

        return (
            <div key={item.url || item.id} className="w-full">
                <div
                    className={`flex items-center justify-between py-3 px-3 rounded-xl transition-all duration-200 ${
                        isActive
                            ? 'bg-amber-500/10 dark:bg-amber-400/10 text-amber-700 dark:text-amber-400 font-bold border border-amber-500/20'
                            : 'text-slate-800 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 font-semibold'
                    }`}
                >
                    <Link
                        href={item.url}
                        target={linkTarget}
                        prefetch={true}
                        onClick={() => {
                            if (!hasSub) onClose();
                        }}
                        className={`flex-1 flex items-center gap-2.5 text-[15px] sm:text-base tracking-wide ${
                            depth > 0 ? 'text-sm font-medium text-slate-600 dark:text-slate-300' : ''
                        }`}
                    >
                        {depth === 0 && (
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                        )}
                        <span>{item.label}</span>
                    </Link>

                    {hasSub && (
                        <button
                            onClick={(e) => toggleExpand(e, item.id)}
                            aria-label={`Toggle ${item.label} submenu`}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 transition-colors ml-2"
                        >
                            <ChevronDown
                                size={18}
                                className={`transform transition-transform duration-300 ${
                                    isExpanded ? 'rotate-180 text-amber-600 dark:text-amber-400' : ''
                                }`}
                            />
                        </button>
                    )}
                </div>

                {isExpanded && hasChildren && !hasMegaMenu && (
                    <div className="pl-4 pr-1 border-l-2 border-amber-500/30 dark:border-amber-400/20 ml-4 my-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
                        {item.children!.map((child) => renderItem(child, depth + 1))}
                    </div>
                )}

                {isExpanded && hasMegaMenu && (
                    <div className="pl-4 pr-1 border-l-2 border-amber-500/30 dark:border-amber-400/20 ml-4 my-2 animate-in slide-in-from-top-2 duration-200">
                        {renderMegaMenuItems(item.megaMenuData!)}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[999] lg:hidden">
            {/* Backdrop Blur Overlay */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Slide Drawer Sheet */}
            <div className="absolute top-0 right-0 h-full w-[88vw] max-w-sm sm:max-w-md bg-white dark:bg-[#0D131F] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-200/80 dark:border-white/10 overflow-hidden">
                {/* Drawer Header */}
                <div className="px-5 py-4 border-b border-slate-100 dark:border-white/10 flex justify-between items-center bg-[#FAF6F0]/80 dark:bg-[#101726]/80 backdrop-blur-md">
                    <Link href="/" onClick={onClose} className="flex items-center gap-2.5">
                        <div className="relative h-7 sm:h-8 w-auto max-w-[170px] flex items-center">
                            <Image
                                src={logoSrc}
                                alt={settings.company_name || 'Apparel Emporium'}
                                width={180}
                                height={32}
                                className="h-full w-auto object-contain"
                                sizes="170px"
                            />
                        </div>
                    </Link>

                    <button
                        onClick={onClose}
                        aria-label="Close Navigation Menu"
                        className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 rounded-full text-slate-700 dark:text-slate-300 hover:text-red-500 transition-all duration-200 active:scale-95"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Quick Navigation Tags */}
                <div className="px-4 py-2.5 bg-slate-50/70 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
                    <Link
                        href="/products"
                        onClick={onClose}
                        className="shrink-0 text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-white dark:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/10 shadow-2xs flex items-center gap-1.5"
                    >
                        <ShoppingBag size={12} className="text-amber-600" />
                        Catalog
                    </Link>
                    <Link
                        href="/#divisions"
                        onClick={onClose}
                        className="shrink-0 text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-white dark:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/10 shadow-2xs flex items-center gap-1.5"
                    >
                        <Factory size={12} className="text-blue-500" />
                        Divisions
                    </Link>
                    <Link
                        href="/buyer-portal"
                        onClick={onClose}
                        className="shrink-0 text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-white dark:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/10 shadow-2xs flex items-center gap-1.5"
                    >
                        <User size={12} className="text-emerald-500" />
                        Buyer Portal
                    </Link>
                </div>

                {/* Navigation Links Scrollable Area */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1 custom-scrollbar">
                    {navItemsToRender.map((item) => renderItem(item, 0))}
                </div>

                {/* Drawer Footer & Actions */}
                <div className="p-4 border-t border-slate-100 dark:border-white/10 bg-[#FAF6F0]/80 dark:bg-[#101726]/80 backdrop-blur-md space-y-3 shrink-0">
                    {/* Get a Quote Primary CTA */}
                    <Link
                        href="/contact"
                        onClick={onClose}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider shadow-md text-white transition-all active:scale-[0.98]
                        bg-gradient-to-r from-slate-900 via-stone-900 to-amber-950 hover:from-black hover:to-amber-900
                        dark:from-amber-600 dark:to-amber-700 dark:hover:from-amber-500 dark:hover:to-amber-600"
                    >
                        <span>Request a Quote (RFQ)</span>
                        <ArrowRight size={15} />
                    </Link>

                    {/* Quick Contacts & Theme Switch */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                        <Link
                            href={settings.contact_whatsapp ? `https://wa.me/${settings.contact_whatsapp.replace(/[^0-9]/g, '')}` : '/contact'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 hover:bg-slate-50 transition-colors"
                        >
                            <MessageCircle size={14} className="text-emerald-500" />
                            <span>WhatsApp</span>
                        </Link>

                        <button
                            onClick={toggleTheme}
                            aria-label="Toggle Theme"
                            className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 hover:bg-slate-50 transition-colors"
                        >
                            {theme === 'dark' ? (
                                <>
                                    <Sun size={14} className="text-amber-400" />
                                    <span>Light Mode</span>
                                </>
                            ) : (
                                <>
                                    <Moon size={14} className="text-slate-600" />
                                    <span>Dark Mode</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Company Tagline */}
                    <div className="text-center pt-1">
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-medium">
                            100% Export Ready • Ethical Garments Sourcing
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
