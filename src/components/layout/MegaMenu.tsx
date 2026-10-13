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
        <div className="w-full bg-[#FAF6F0]/98 dark:bg-[#0E1626]/98 backdrop-blur-2xl text-slate-800 dark:text-white shadow-[0_20px_50px_rgba(0,0,0,0.16)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.7)] border border-[#E8E0D2] dark:border-white/10 rounded-2xl p-5 sm:p-6 transition-all duration-200">
            {/* 3-Column Grid Matching Reference Screenshot Exactly */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6">
                {columns.map((col, idx) => {
                    const links: MegaMenuLink[] = [];
                    col.sections.forEach(sec => {
                        if (sec.links) links.push(...sec.links);
                    });

                    return (
                        <div key={idx} className="flex flex-col">
                            {/* Column Header */}
                            <div className="pb-2 mb-2 border-b border-[#E0D7C6] dark:border-slate-800">
                                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs sm:text-[13px] font-heading">
                                    {col.title}
                                </h3>
                            </div>

                            {/* Item Links */}
                            <ul className="space-y-1 flex-1">
                                {links.map((link, lIdx) => (
                                    <li key={lIdx}>
                                        <Link
                                            href={link.url}
                                            onClick={onItemClick}
                                            className="text-xs sm:text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:translate-x-1 transition-all block py-1"
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
    );
}
