'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { Eye, Columns2, Check, ChevronRight } from 'lucide-react';
import { useAddToCompare } from '@/hooks/useAddToCompare';
import { useSettings } from '@/context/SettingsContext';
import { extractFeaturedImage } from '@/lib/utils';

interface ProductCardProps {
    product: Product;
    onQuickView?: (product: Product) => void;
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
    const { addToCompare, isInCompare } = useAddToCompare();
    const isComparing = isInCompare(product.id);
    const cardRef = useRef<HTMLDivElement>(null);
    const { settings } = useSettings();

    // Dynamic visibility controls managed via Developer Options / Admin Dashboard
    // Default to false for clutter-free, clean e-commerce look matching user requirement
    const showSku = settings['product_card_show_sku'] === 'true';
    const showB2bTag = settings['product_card_show_b2b_tag'] === 'true';
    const showDescription = settings['product_card_show_description'] === 'true';
    const showMinOrder = settings['product_card_show_min_order'] === 'true';

    // 3D Parallax Tilt State
    const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, shineX: 50, shineY: 50 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -7;
        const rotateY = ((x - centerX) / centerX) * 7;
        const shineX = (x / rect.width) * 100;
        const shineY = (y / rect.height) * 100;

        setTilt({ rotateX, rotateY, shineX, shineY });
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setTilt({ rotateX: 0, rotateY: 0, shineX: 50, shineY: 50 });
    };

    // Parse specifications safely
    let specs: any = {};
    try {
        if (typeof product.specifications === 'string') {
            specs = JSON.parse(product.specifications);
        } else {
            specs = product.specifications || {};
        }
    } catch (e) {
        specs = {};
    }

    // Handle images
    const mainImage = extractFeaturedImage(product.images);

    // Dynamic top badge logic based on product type matching screenshots
    const getTopBadgeText = () => {
        const name = product.name.toLowerCase();
        if (name.includes('boot') || name.includes('leather')) return 'CARE / LEATHER & HATS';
        if (name.includes('denim') || name.includes('jacket')) return 'JACKETS & OUTERWEAR';
        if (name.includes('white') || (name.includes('classic') && name.includes('t-shirt'))) return 'T-SHIRT & RAYON';
        if (name.includes('pique polo') || (name === 'pique polo')) return 'POLO PIQUE';
        if (name.includes('piqué') || name.includes('classic piqué') || name.includes('classic pique')) return 'POLO SHIRTS';
        if (name.includes('crew') || name.includes('premium') || name.includes('neck')) return 'T-SHIRT & KNIT';
        return product.category?.name?.toUpperCase() || 'CUSTOM APPAREL';
    };

    // SKU display
    const skuDisplay = (product as any).sku || product.slug.split('-').slice(-1)[0]?.toUpperCase() || 'AEL-BD';

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            style={{
                transform: isHovered
                    ? `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translateY(-4px)`
                    : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)',
            }}
            className="group relative flex flex-col neumorphic-card-3d rounded-[28px] p-3.5 sm:p-4 transition-all duration-300 select-none overflow-hidden"
        >
            {/* Dynamic Glass Specular Light Reflection */}
            <div
                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[28px]"
                style={{
                    background: `radial-gradient(circle at ${tilt.shineX}% ${tilt.shineY}%, rgba(255,255,255,0.25) 0%, transparent 60%)`
                }}
            />

            {/* ── 3D RECESSED CONCAVE PEDESTAL DISPLAY STAGE ── */}
            <div className="relative aspect-[4/4.5] w-full rounded-[22px] pedestal-stage-3d p-4 flex flex-col items-center justify-center overflow-hidden cursor-pointer">
                {/* Top Embossed Arch Badge (Category Name) */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 arch-badge-3d px-3.5 py-1 rounded-full text-[9px] sm:text-[10px] font-black tracking-wider uppercase text-slate-700 dark:text-slate-200 transition-transform duration-300 group-hover:scale-105 whitespace-nowrap shadow-xs">
                    {getTopBadgeText()}
                </div>

                {/* Floating 3D Garment Image Frame */}
                <Link
                    href={`/products/${product.slug}`}
                    className="relative w-full h-full flex items-center justify-center z-10 p-1"
                >
                    <div className="relative w-full h-full flex items-center justify-center rounded-xl overflow-hidden">
                        <img
                            src={mainImage}
                            alt={product.name}
                            className="max-h-[86%] max-w-[90%] object-contain filter drop-shadow-md transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-2 dark:brightness-95 dark:contrast-105"
                            loading="lazy"
                        />
                    </div>

                    {/* Realistic Ambient Contact Floor Shadow */}
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3/4 h-3.5 rounded-[50%] floating-garment-shadow transition-all duration-500 group-hover:scale-110 group-hover:opacity-80" />
                </Link>

                {/* Interactive Quick View & Compare Overlay */}
                <div className="absolute inset-0 bg-black/25 dark:bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center p-4 z-20">
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView?.(product); }}
                        className="bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white font-bold text-xs px-5 py-2.5 rounded-full flex items-center gap-1.5 shadow-xl hover:scale-105 transition-transform"
                    >
                        <Eye size={14} /> Quick Specs
                    </button>

                    {/* Compare Button */}
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCompare(product); }}
                        className={`absolute bottom-3 left-3 p-2.5 rounded-full shadow-lg transition-all ${isComparing
                            ? 'bg-blue-600 text-white scale-110'
                            : 'bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 hover:bg-blue-600 hover:text-white'
                            }`}
                        title={isComparing ? "In Comparison" : "Add to Compare"}
                    >
                        {isComparing ? <Check size={14} /> : <Columns2 size={14} />}
                    </button>
                </div>
            </div>

            {/* ── CARD INFORMATION SECTION (Clean 3D E-Commerce Style) ── */}
            <div className="pt-3 px-1 pb-1 flex flex-col flex-grow">
                {/* Title & Optional SKU */}
                <div className="mb-2">
                    <Link href={`/products/${product.slug}`}>
                        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mb-0.5 line-clamp-1 transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                            {product.name}
                        </h3>
                    </Link>
                    {showSku && (
                        <p className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                            SKU : {skuDisplay}
                        </p>
                    )}
                </div>

                {/* Optional B2B Sourcing Pill Tag (Controlled dynamically) */}
                {showB2bTag && (
                    <div className="mb-2.5 flex items-center justify-between gap-2">
                        <span className="inline-flex items-center text-[10px] font-extrabold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/70 px-2 py-0.5 rounded-md">
                            B2B Sourcing &amp; Ex
                        </span>
                        <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
                            Custom Tech-Pack
                        </span>
                    </div>
                )}

                {/* Optional Short Description (Controlled dynamically) */}
                {showDescription && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-3 leading-relaxed">
                        {product.shortDescription || product.description}
                    </p>
                )}

                {/* Optional Inset Mini Specs Boxes (Controlled dynamically) */}
                {showMinOrder && (
                    <div className="grid grid-cols-2 gap-2 mb-4 mt-auto">
                        <div className="spec-box-3d rounded-xl px-2.5 py-1.5 min-w-0">
                            <span className="block text-[9px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-wider">
                                Min. Order
                            </span>
                            <span className="block text-xs font-bold text-slate-900 dark:text-white truncate" title={specs['MOQ'] || (product as any).minOrder || 'Custom'}>
                                {specs['MOQ'] || (product as any).minOrder || 'Custom'}
                            </span>
                        </div>
                        <div className="spec-box-3d rounded-xl px-2.5 py-1.5 min-w-0">
                            <span className="block text-[9px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-wider">
                                Fabric
                            </span>
                            <span className="block text-xs font-bold text-slate-900 dark:text-white truncate" title={specs['Fabric'] || specs['Composition'] || specs['Material'] || 'Custom'}>
                                {specs['Fabric'] || specs['Composition'] || specs['Material'] || 'Custom'}
                            </span>
                        </div>
                    </div>
                )}

                {/* ── ACTION BUTTONS: SPECS & QUOTE ── */}
                <div className="flex items-center gap-2 pt-2 mt-auto">
                    <Link
                        href={`/products/${product.slug}`}
                        className="flex-1 text-center py-2 px-3 text-xs font-bold text-slate-800 dark:text-slate-200 bg-[#E8E1D6] dark:bg-[#1E293B] hover:bg-[#DDD4C7] dark:hover:bg-[#283548] rounded-xl border border-[#D8CFC2] dark:border-white/10 transition-all active:scale-95 shadow-xs"
                    >
                        Specs
                    </Link>
                    <Link
                        href={`/request-quote?product=${encodeURIComponent(product.name)}`}
                        className="flex-1 text-center py-2 px-3 text-xs font-bold text-white bg-[#1B2B44] hover:bg-[#111C2E] dark:bg-blue-600 dark:hover:bg-blue-500 rounded-xl shadow-md dark:shadow-blue-600/30 transition-all active:scale-95 flex items-center justify-center gap-1"
                    >
                        <span>Quote</span>
                        <ChevronRight size={13} className="stroke-[2.5]" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
