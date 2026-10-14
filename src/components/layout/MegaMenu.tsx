'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

type MegaMenuLink = {
    label: string;
    url: string;
};

type MegaMenuSection = {
    header?: string;
    links: MegaMenuLink[];
};

type MegaMenuColumn = {
    title: string;
    sections: MegaMenuSection[];
};

interface MegaMenuProps {
    data: string | null;
    isVisible: boolean;
    onItemClick?: () => void;
}

export const PRODUCT_MEGA_COLUMNS: MegaMenuColumn[] = [
    {
        title: 'KNIT',
        sections: [
            {
                header: '',
                links: [
                    { label: 'Menswear', url: '/products?category=knitwear-mens' },
                    { label: 'Womenswear', url: '/products?category=knitwear-womens' },
                    { label: 'Kidswear', url: '/products?category=knitwear-kids' }
                ]
            }
        ]
    },
    {
        title: 'WOVEN',
        sections: [
            {
                header: '',
                links: [
                    { label: 'Men', url: '/products?category=woven-mens' },
                    { label: 'Women', url: '/products?category=woven-womens' },
                    { label: 'Kids', url: '/products?category=woven-kids' }
                ]
            }
        ]
    },
    {
        title: 'SWEATER',
        sections: [
            {
                header: '',
                links: [
                    { label: 'Men', url: '/products?category=sweater-mens' },
                    { label: 'Women', url: '/products?category=sweater-womens' },
                    { label: 'Kids', url: '/products?category=sweater-kids' }
                ]
            }
        ]
    }
];

export default function MegaMenu({ isVisible, onItemClick }: MegaMenuProps) {
    if (!isVisible) return null;

    // Strict 3-column, 9-item structure matching reference screenshot:
    // KNIT: Menswear, Womenswear, Kidswear
    // WOVEN: Men, Women, Kids
    // SWEATER: Men, Women, Kids
    const columns: MegaMenuColumn[] = PRODUCT_MEGA_COLUMNS;

    return (
        <div className="relative w-full">
            {/* Top Triangular 3D Notch Anchoring to Nav Item */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 bg-[#FAF6F0] dark:bg-[#0E1626] border-t-2 border-l-2 border-[#E0D7C6] dark:border-white/15 z-10"></div>

            {/* Main Dropdown Card: 100% Solid Opaque (Zero Bleed-Through) with 3D Elevation */}
            <div className="relative z-20 w-full bg-[#FAF6F0] dark:bg-[#0E1626] text-slate-800 dark:text-white shadow-[0_28px_65px_-12px_rgba(15,23,42,0.38),0_0_0_1px_rgba(215,205,190,0.85)] dark:shadow-[0_30px_70px_-12px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.12)] border-2 border-[#E0D7C6] dark:border-white/15 rounded-2xl p-4 sm:p-5 transition-all">
                
                {/* Subtle Top Header Label */}
                <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#E2D9C8] dark:border-slate-800">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        Apparel Emporium Categories
                    </span>
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        Export Sourcing
                    </span>
                </div>

                {/* 3-Column Grid Matching Reference Screenshot Exactly */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                    {columns.map((col, idx) => {
                        const links: MegaMenuLink[] = [];
                        col.sections.forEach(sec => {
                            if (sec.links) links.push(...sec.links);
                        });

                        return (
                            <div key={idx} className="flex flex-col space-y-2">
                                {/* 3D Embossed Pillar Header */}
                                <div className="text-center py-1.5 px-2 rounded-xl bg-gradient-to-b from-[#1E293B] to-[#0F172A] dark:from-blue-600 dark:to-blue-700 text-white shadow-[0_3px_8px_rgba(15,23,42,0.18),inset_0_1px_0_rgba(255,255,255,0.2)] border border-slate-700/60 dark:border-blue-400/30">
                                    <h3 className="font-black uppercase tracking-wider text-[11px] sm:text-xs">
                                        {col.title}
                                    </h3>
                                </div>

                                {/* 3D Tactile Subcategory Cards */}
                                <ul className="space-y-1.5 flex-1 pt-0.5">
                                    {links.map((link, lIdx) => (
                                        <li key={lIdx}>
                                            <Link
                                                href={link.url}
                                                onClick={onItemClick}
                                                className="w-full text-center text-xs sm:text-[13px] font-bold text-slate-700 dark:text-slate-200 bg-white/90 dark:bg-slate-800/80 hover:bg-[#142338] hover:text-white dark:hover:bg-blue-600 dark:hover:text-white border border-[#E5DEC8] dark:border-slate-700/80 hover:border-[#142338] dark:hover:border-blue-500 rounded-xl py-2 px-2 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0 transition-all block"
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
