'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Shirt, 
  Home, 
  Footprints, 
  Sparkles, 
  Search, 
  ArrowUpRight, 
  SlidersHorizontal 
} from 'lucide-react';
import { TaxonomyDivision } from '@/lib/catalog-taxonomy';

interface Props {
  initialTaxonomy: TaxonomyDivision[];
}

type PillarData = {
  title: string;
  badge: string;
  icon: 'fashion' | 'hometextiles' | 'footwear' | 'accessories';
  subcategories: Array<{ label: string; slug: string }>;
};

// 4 Core Pillars Synchronized with Left Sidebar & Mega Menu
const APPAREL_TAXONOMY_PILLARS: PillarData[] = [
  {
    title: 'FASHION',
    badge: 'Core Garments',
    icon: 'fashion',
    subcategories: [
      { label: "Men's Fashion", slug: 'mens-fashion' },
      { label: "Women's Fashion", slug: 'womens-fashion' },
      { label: "Children's Fashion", slug: 'childrens-fashion' },
    ],
  },
  {
    title: 'HOME TEXTILES',
    badge: 'Home & Bedding',
    icon: 'hometextiles',
    subcategories: [
      { label: 'Towel', slug: 'towel' },
      { label: 'Bedding', slug: 'bedding' },
      { label: 'Curtain', slug: 'curtain' },
    ],
  },
  {
    title: 'FOOTWEAR',
    badge: 'Export Footwear',
    icon: 'footwear',
    subcategories: [
      { label: 'Basic Espadrille', slug: 'basic-espadrilles' },
      { label: 'Fashion Espadrille', slug: 'fashion-espadrilles' },
    ],
  },
  {
    title: 'ACCESSORIES',
    badge: 'Fashion Accessories',
    icon: 'accessories',
    subcategories: [
      { label: 'Scarf', slug: 'scarves' },
      { label: 'Hat & Caps', slug: 'hats-caps' },
      { label: 'Gloves', slug: 'gloves' },
      { label: 'Socks', slug: 'socks' },
      { label: 'Gift Box', slug: 'gift-box' },
    ],
  },
];

export default function CatalogTaxonomyDirectory({ initialTaxonomy }: Props) {
  const [taxonomy] = useState<TaxonomyDivision[]>(initialTaxonomy);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Live filter items across entire taxonomy when user searches
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    const matches: Array<{
      divisionName: string;
      groupName: string;
      item: { id: string; name: string; slug: string };
    }> = [];

    // Search through 4 pillars
    APPAREL_TAXONOMY_PILLARS.forEach(pillar => {
      pillar.subcategories.forEach(sub => {
        if (sub.label.toLowerCase().includes(q) || pillar.title.toLowerCase().includes(q)) {
          matches.push({
            divisionName: 'PRODUCTS (APPAREL)',
            groupName: pillar.title,
            item: { id: sub.slug, name: sub.label, slug: sub.slug },
          });
        }
      });
    });

    // Also search through granular taxonomy
    taxonomy.forEach(div => {
      div.departments.forEach(dept => {
        dept.groups.forEach(grp => {
          grp.items.forEach(item => {
            if (
              item.name.toLowerCase().includes(q) ||
              grp.name.toLowerCase().includes(q) ||
              dept.name.toLowerCase().includes(q)
            ) {
              if (!matches.some(m => m.item.slug === item.slug)) {
                matches.push({
                  divisionName: div.name,
                  groupName: grp.name,
                  item,
                });
              }
            }
          });
        });
      });
    });

    return matches;
  }, [taxonomy, searchQuery]);

  const getPillarIcon = (type: PillarData['icon']) => {
    switch (type) {
      case 'fashion':
        return <Shirt className="w-3.5 h-3.5 text-blue-500" />;
      case 'hometextiles':
        return <Home className="w-3.5 h-3.5 text-amber-500" />;
      case 'footwear':
        return <Footprints className="w-3.5 h-3.5 text-emerald-500" />;
      case 'accessories':
        return <Sparkles className="w-3.5 h-3.5 text-purple-500" />;
    }
  };

  return (
    <section 
      aria-label="Manufacturing & Category Directory"
      className="mt-10 sm:mt-12 pt-6 pb-6 border-t border-[#D9D1C7] dark:border-slate-800"
    >
      <div className="rounded-2xl sm:rounded-3xl bg-[#FAF6F0] dark:bg-[#0D1524] p-5 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)] border border-[#E8E0D2] dark:border-white/10 relative overflow-hidden">
        
        {/* Header Ribbon & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5DEC8] dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Apparel Emporium Sourcing Matrix
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white uppercase">
              Production Taxonomy Architecture
            </h2>
          </div>

          {/* Quick Item Filter Input */}
          <div className="w-full sm:w-72 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search category or item..."
                className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  CLEAR
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── SEARCH RESULTS OVERLAY (When Search is Active) ── */}
        {searchResults !== null ? (
          <div className="py-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Search Results ({searchResults.length} matches)
              </h3>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Back to architecture
              </button>
            </div>

            {searchResults.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-white/40 dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                  No matching category found for &quot;{searchQuery}&quot;.
                </p>
                <Link
                  href={`/request-quote?product=${encodeURIComponent(searchQuery)}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#142338] text-white text-xs font-bold hover:bg-blue-600 transition-all shadow-sm"
                >
                  <span>Request Custom Quote</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {searchResults.map(({ divisionName, groupName, item }) => (
                  <Link
                    key={`${divisionName}-${item.id}`}
                    href={`/products?category=${encodeURIComponent(item.slug)}`}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-all shadow-xs flex items-center justify-between group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-[9px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 truncate">
                        {divisionName} • {groupName}
                      </div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {item.name}
                      </div>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ── MAIN 4-PILLAR ARCHITECTURAL TREE UNDER PRODUCTS (APPAREL) ── */
          <div className="pt-6">
            <div className="w-full max-w-6xl mx-auto py-2 sm:py-4">
              
              {/* 1. MASTER ROOT NODE: PRODUCTS (APPAREL) */}
              <div className="flex flex-col items-center">
                <div className="px-7 py-2.5 rounded-2xl bg-gradient-to-b from-[#142338] to-[#0B1522] dark:from-blue-600 dark:to-blue-700 text-white font-black text-xs sm:text-sm uppercase tracking-widest shadow-[0_12px_28px_rgba(20,35,56,0.3),inset_0_1px_0_rgba(255,255,255,0.25)] border-2 border-[#C5A880]/50 flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C5A880] dark:bg-cyan-300 animate-pulse"></span>
                  <span className="tracking-widest">PRODUCTS (APPAREL)</span>
                </div>

                {/* Vertical Trunk Line from ROOT down to Master Line */}
                <div className="w-0.5 h-5 sm:h-6 bg-gradient-to-b from-[#142338] to-[#243B5C] dark:from-blue-400 dark:to-cyan-400"></div>

                {/* Master Horizontal Double-Arrow Line (Spanning across 4 Pillars) */}
                <div className="w-full relative flex items-center justify-between px-6 sm:px-12 my-0.5">
                  <div className="w-full h-[3px] bg-gradient-to-r from-[#142338] via-[#2E4A70] to-[#142338] dark:from-blue-400 dark:via-cyan-400 dark:to-blue-400 relative rounded-full shadow-xs">
                    {/* Left Arrowhead */}
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[7px] border-r-[#142338] dark:border-r-blue-400"></div>
                    
                    {/* Pillar 1 Connector Node (Fashion) */}
                    <div className="absolute left-[12.5%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#C5A880] dark:bg-cyan-400 border-2 border-white dark:border-slate-900 shadow-sm" title="Fashion Connector"></div>

                    {/* Pillar 2 Connector Node (Home Textiles) */}
                    <div className="absolute left-[37.5%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#B45309] dark:bg-cyan-300 border-2 border-white dark:border-slate-900 shadow-sm" title="Home Textiles Connector"></div>
                    
                    {/* Pillar 3 Connector Node (Footwear) */}
                    <div className="absolute left-[62.5%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#10B981] dark:bg-emerald-400 border-2 border-white dark:border-slate-900 shadow-sm" title="Footwear Connector"></div>

                    {/* Pillar 4 Connector Node (Accessories) */}
                    <div className="absolute left-[87.5%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#C5A880] dark:bg-cyan-400 border-2 border-white dark:border-slate-900 shadow-sm" title="Accessories Connector"></div>

                    {/* Right Arrowhead */}
                    <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[7px] border-l-[#142338] dark:border-l-blue-400"></div>
                  </div>
                </div>
              </div>

              {/* 2. FOUR PILLAR COLUMNS (Synchronized with Left Sidebar: Fashion, Home Textiles, Footwear, Accessories) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mt-1">
                {APPAREL_TAXONOMY_PILLARS.map((pillar, pIdx) => (
                  <div key={pIdx} className="flex flex-col items-center">
                    {/* Vertical line down to Pillar */}
                    <div className="w-0.5 h-4 bg-[#142338]/80 dark:bg-cyan-400/70"></div>
                    
                    <div className="w-full h-full rounded-2xl bg-white dark:bg-[#111A2E] border-2 border-[#E2D9C8] dark:border-white/10 p-4 shadow-[0_14px_30px_rgba(20,35,56,0.06),inset_0_1px_0_rgba(255,255,255,0.95)] dark:shadow-[0_15px_35px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)] flex flex-col justify-between transition-all hover:border-[#142338]/40 dark:hover:border-blue-400/50">
                      <div>
                        {/* Pillar Header with 3D Embossed Pill */}
                        <div className="text-center pb-2.5 mb-3 border-b border-[#E8E0D2] dark:border-slate-800 flex items-center justify-center gap-1.5">
                          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-b from-[#142338] to-[#0B1522] dark:from-blue-600 dark:to-blue-700 text-white font-black text-xs uppercase tracking-wider shadow-[0_3px_8px_rgba(20,35,56,0.22),inset_0_1px_0_rgba(255,255,255,0.2)] border border-[#C5A880]/30">
                            {getPillarIcon(pillar.icon)}
                            <span>{pillar.title}</span>
                          </span>
                        </div>

                        {/* Subcategory Action Cards */}
                        <div className="space-y-2">
                          {pillar.subcategories.map((sub, sIdx) => (
                            <Link
                              key={sIdx}
                              href={`/products?category=${encodeURIComponent(sub.slug)}`}
                              className="p-2.5 rounded-xl bg-gradient-to-b from-white to-[#FAF6F0] dark:from-slate-800/90 dark:to-slate-900/90 border border-[#E5DEC8] dark:border-slate-700/80 hover:border-[#142338] dark:hover:border-blue-400 hover:shadow-[0_6px_14px_rgba(20,35,56,0.12)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-between group shadow-2xs"
                            >
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#142338] dark:group-hover:text-cyan-400 transition-colors">
                                {sub.label}
                              </span>
                              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#C5A880] dark:group-hover:text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Pillar Bottom Tagline */}
                      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-center">
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                          {pillar.badge}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}

        {/* Directory Bottom Bar: Enterprise Sourcing Callout */}
        <div className="mt-8 pt-4 border-t border-[#E5DEC8] dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Custom Garment Development & Sourcing
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Custom GSM, yarn blends, colors, and trims tailored to your exact tech pack.
              </div>
            </div>
          </div>

          <Link
            href="/request-quote"
            className="px-4 py-1.5 rounded-lg bg-[#142338] dark:bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-2xs shrink-0 flex items-center gap-1"
          >
            <span>Request Tech Pack Quote</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

      </div>
    </section>
  );
}
