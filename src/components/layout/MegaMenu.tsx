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

const DEFAULT_COLUMNS: MegaMenuColumn[] = [
    {
        title: 'KNIT',
        sections: [
            {
                header: '',
                links: [
                    { label: 'Menswear', url: '/products?category=men-circular-knit' },
                    { label: 'Womenswear', url: '/products?category=women-circular-knit' },
                    { label: 'Kidswear', url: '/products?category=kids-circular-knit' }
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
                    { label: 'Men', url: '/products?category=men-woven' },
                    { label: 'Women', url: '/products?category=women-woven' },
                    { label: 'Kids', url: '/products?category=kids-woven' }
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
                    { label: 'Men', url: '/products?category=men-flat-knit' },
                    { label: 'Women', url: '/products?category=women-flat-knit' },
                    { label: 'Kids', url: '/products?category=kids-flat-knit' }
                ]
            }
        ]
    }
];

export default function MegaMenu({ data, isVisible, onItemClick }: MegaMenuProps) {
    if (!isVisible) return null;

    let columns: MegaMenuColumn[] = [];
    try {
        if (data) {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed) && parsed.length > 0) {
                // If it's legacy multi-division format, streamline to 3-column fashion view
                if (parsed.length > 3) {
                    columns = DEFAULT_COLUMNS;
                } else {
                    columns = parsed.map(col => ({
                        title: col.title,
                        sections: col.sections || [{ header: '', links: col.links || [] }]
                    }));
                }
            }
        }
    } catch (e) {
        console.error('MegaMenu Parse Error', e);
    }

    if (columns.length === 0) {
        columns = DEFAULT_COLUMNS;
    }

    return (
        <div className="w-full bg-[#FAF6F0]/98 dark:bg-[#0E1626]/98 backdrop-blur-2xl text-slate-800 dark:text-white shadow-[0_20px_50px_rgba(0,0,0,0.16)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.7)] border border-[#E8E0D2] dark:border-white/10 rounded-2xl p-5 sm:p-6 transition-all duration-200">
            {/* 3-Column Minimal Grid Matching Reference Screenshot */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6">
                {columns.map((col, idx) => {
                    // Extract all links for this column
                    const links: MegaMenuLink[] = [];
                    col.sections.forEach(sec => {
                        if (sec.links) links.push(...sec.links);
                    });

                    return (
                        <div key={idx} className="flex flex-col">
                            {/* Column Header */}
                            <div className="pb-2 mb-2.5 border-b border-[#E0D7C6] dark:border-slate-800">
                                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs sm:text-[13px] font-heading">
                                    {col.title}
                                </h3>
                            </div>

                            {/* Item Links */}
                            <ul className="space-y-1.5 flex-1">
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

            {/* Clean Bottom Link */}
            <div className="mt-3.5 pt-2.5 border-t border-[#E8E0D2] dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                <Link
                    href="/products"
                    onClick={onItemClick}
                    className="font-bold text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1 group"
                >
                    <span>View All Products</span>
                    <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
            </div>
        </div>
    );
}
