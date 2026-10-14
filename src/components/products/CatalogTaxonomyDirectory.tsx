'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Shirt, 
  Home, 
  Footprints, 
  Sparkles, 
  Search, 
  Layers, 
  ArrowUpRight, 
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { TaxonomyDivision } from '@/lib/catalog-taxonomy';

interface Props {
  initialTaxonomy: TaxonomyDivision[];
}

type DivisionTreeData = {
  rootLabel: string;
  badgeLabel: string;
  pillars: Array<{
    title: string;
    subcategories: Array<{ label: string; slug: string }>;
  }>;
};

const DIVISION_TREES: Record<string, DivisionTreeData> = {
  fashion: {
    rootLabel: 'PRODUCTS (APPAREL)',
    badgeLabel: 'Core Export Garments',
    pillars: [
      {
        title: 'KNIT',
        subcategories: [
          { label: 'Menswear', slug: 'knitwear-mens' },
          { label: 'Womenswear', slug: 'knitwear-womens' },
          { label: 'Kidswear', slug: 'knitwear-kids' },
        ],
      },
      {
        title: 'WOVEN',
        subcategories: [
          { label: 'Men', slug: 'woven-mens' },
          { label: 'Women', slug: 'woven-womens' },
          { label: 'Kids', slug: 'woven-kids' },
        ],
      },
      {
        title: 'SWEATER',
        subcategories: [
          { label: 'Men', slug: 'sweater-mens' },
          { label: 'Women', slug: 'sweater-womens' },
          { label: 'Kids', slug: 'sweater-kids' },
        ],
      },
    ],
  },
  hometextiles: {
    rootLabel: 'HOME TEXTILES',
    badgeLabel: 'Home & Bedding Sourcing',
    pillars: [
      {
        title: 'TERRY TOWELS',
        subcategories: [
          { label: 'Bath Towels & Mats', slug: 'towel' },
          { label: 'Hand & Kitchen Towels', slug: 'towel' },
          { label: 'Pool & Beach Towels', slug: 'towel' },
        ],
      },
      {
        title: 'BEDDING & LINEN',
        subcategories: [
          { label: 'Bed Sheets & Sets', slug: 'bedding' },
          { label: 'Duvet Covers', slug: 'bedding' },
          { label: 'Pillow Cases', slug: 'bedding' },
        ],
      },
      {
        title: 'CURTAINS & DRAPES',
        subcategories: [
          { label: 'Window Curtains', slug: 'curtain' },
          { label: 'Sheer Drapes', slug: 'curtain' },
          { label: 'Decorative Valances', slug: 'curtain' },
        ],
      },
    ],
  },
  footwear: {
    rootLabel: 'EXPORT FOOTWEAR',
    badgeLabel: 'Leather & Casual Footwear',
    pillars: [
      {
        title: "MEN'S FOOTWEAR",
        subcategories: [
          { label: 'Casual & Formal Shoes', slug: 'footwear' },
          { label: 'Sneakers & Sport Shoes', slug: 'footwear' },
          { label: 'Sandals & Slides', slug: 'footwear' },
        ],
      },
      {
        title: "WOMEN'S FOOTWEAR",
        subcategories: [
          { label: 'Flats & Loafers', slug: 'footwear' },
          { label: 'Casual Sneakers', slug: 'footwear' },
          { label: 'Heels & Sandals', slug: 'footwear' },
        ],
      },
      {
        title: "KIDS' FOOTWEAR",
        subcategories: [
          { label: 'School Shoes', slug: 'footwear' },
          { label: 'Casual Sneakers', slug: 'footwear' },
          { label: 'Slip-ons & Sandals', slug: 'footwear' },
        ],
      },
    ],
  },
  accessories: {
    rootLabel: 'FASHION ACCESSORIES',
    badgeLabel: 'Export Accessories & Trims',
    pillars: [
      {
        title: 'HEADWEAR & CAPS',
        subcategories: [
          { label: 'Baseball & Snapback Caps', slug: 'fashion-accessories' },
          { label: 'Beanies & Winter Caps', slug: 'fashion-accessories' },
          { label: 'Bucket & Sun Hats', slug: 'fashion-accessories' },
        ],
      },
      {
        title: 'SCARVES & GLOVES',
        subcategories: [
          { label: 'Woven Winter Scarves', slug: 'fashion-accessories' },
          { label: 'Knitted Gloves & Mittens', slug: 'fashion-accessories' },
          { label: 'Fashion Bandanas & Wraps', slug: 'fashion-accessories' },
        ],
      },
      {
        title: 'SOCKS & TRIMS',
        subcategories: [
          { label: 'Crew & Athletic Socks', slug: 'fashion-accessories' },
          { label: 'Ankle & No-show Socks', slug: 'fashion-accessories' },
          { label: 'Belts & Fashion Accessories', slug: 'fashion-accessories' },
        ],
      },
    ],
  },
};

export default function CatalogTaxonomyDirectory({ initialTaxonomy }: Props) {
  const [taxonomy] = useState<TaxonomyDivision[]>(initialTaxonomy);
  const [activeDivisionId, setActiveDivisionId] = useState<string>('fashion');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active division
  const currentDivision = useMemo(() => {
    return taxonomy.find(d => d.id === activeDivisionId) || taxonomy[0];
  }, [taxonomy, activeDivisionId]);

  // Filter items if user typed in the quick search box
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    const matches: Array<{
      divisionName: string;
      departmentName: string;
      groupName: string;
      item: { id: string; name: string; slug: string; productCount?: number };
    }> = [];

    taxonomy.forEach(div => {
      div.departments.forEach(dept => {
        dept.groups.forEach(grp => {
          grp.items.forEach(item => {
            if (
              item.name.toLowerCase().includes(q) ||
              grp.name.toLowerCase().includes(q) ||
              dept.name.toLowerCase().includes(q) ||
              div.name.toLowerCase().includes(q)
            ) {
              matches.push({
                divisionName: div.name,
                departmentName: dept.name,
                groupName: grp.name,
                item,
              });
            }
          });
        });
      });
    });

    return matches;
  }, [taxonomy, searchQuery]);

  const getDivisionIcon = (id: string) => {
    switch (id) {
      case 'fashion':
        return <Shirt className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
      case 'hometextiles':
        return <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
      case 'footwear':
        return <Footprints className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
      case 'accessories':
        return <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
      default:
        return <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
    }
  };

  // Pre-configured fashion tree departments matching Screenshot 2 reference
  const fashionDivision = taxonomy.find(d => d.id === 'fashion') || taxonomy[0];
  const fashionDepartments = fashionDivision?.departments || [];

  return (
    <section 
      aria-label="Manufacturing & Category Directory"
      className="mt-10 sm:mt-12 pt-6 pb-6 border-t border-[#D9D1C7] dark:border-slate-800"
    >
      <div className="rounded-2xl sm:rounded-3xl bg-[#FAF6F0] dark:bg-[#0D1524] p-5 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)] border border-[#E8E0D2] dark:border-white/10 relative overflow-hidden">
        
        {/* Header Ribbon & Search — Refined and compact typography */}
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
                placeholder="Search category or group..."
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
          /* ── MAIN TAXONOMY HIERARCHY TREE VIEW ── */
          <div className="pt-5">
            {/* Division Switcher Pills: Clean & Compact */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6">
              {taxonomy.map(div => {
                const isActive = div.id === activeDivisionId;
                return (
                  <button
                    key={div.id}
                    onClick={() => setActiveDivisionId(div.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 ${
                      isActive
                        ? 'bg-[#142338] dark:bg-blue-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {getDivisionIcon(div.id)}
                    <span>{div.name}</span>
                  </button>
                );
              })}
            </div>

            {/* ── CORE TREE DIAGRAM (Balanced 3-Pillar 3D Architecture for All Divisions) ── */}
            {(() => {
              const currentTree = DIVISION_TREES[activeDivisionId] || DIVISION_TREES['fashion'];
              return (
                <div className="w-full max-w-5xl mx-auto py-2 sm:py-4">
                  {/* 1. ROOT NODE (Centered 3D Embossed Pill with Gold Accent) */}
                  <div className="flex flex-col items-center">
                    <div className="px-6 py-2 rounded-xl bg-gradient-to-b from-[#142338] to-[#0B1522] dark:from-blue-600 dark:to-blue-700 text-white font-black text-xs sm:text-sm uppercase tracking-widest shadow-[0_10px_25px_rgba(20,35,56,0.28),inset_0_1px_0_rgba(255,255,255,0.25)] border border-[#C5A880]/40 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#C5A880] dark:bg-cyan-300 animate-pulse"></span>
                      <span>{currentTree.rootLabel}</span>
                    </div>

                    {/* Vertical trunk line from ROOT to Master Arrow */}
                    <div className="w-0.5 h-4 sm:h-5 bg-gradient-to-b from-[#142338] to-[#243B5C] dark:from-blue-400 dark:to-cyan-400"></div>

                    {/* Master Horizontal Double-Arrow Line (Spanning across the 3 Pillars) */}
                    <div className="w-full relative flex items-center justify-between px-6 sm:px-16 my-0.5">
                      <div className="w-full h-[3px] bg-gradient-to-r from-[#142338] via-[#2E4A70] to-[#142338] dark:from-blue-400 dark:via-cyan-400 dark:to-blue-400 relative rounded-full shadow-xs">
                        {/* Left Arrowhead */}
                        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[7px] border-r-[#142338] dark:border-r-blue-400"></div>
                        
                        {/* Left Pillar Connector Node (Warm Gold/Amber) */}
                        <div className="absolute left-[16.6%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#C5A880] dark:bg-cyan-400 border-2 border-white dark:border-slate-900 shadow-sm"></div>

                        {/* Center Node on Master Line */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#B45309] dark:bg-cyan-300 border-2 border-white dark:border-slate-900 shadow-sm"></div>
                        
                        {/* Right Pillar Connector Node */}
                        <div className="absolute left-[83.3%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#C5A880] dark:bg-cyan-400 border-2 border-white dark:border-slate-900 shadow-sm"></div>

                        {/* Right Arrowhead */}
                        <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[7px] border-l-[#142338] dark:border-l-blue-400"></div>
                      </div>
                    </div>
                  </div>

                  {/* 2. THREE PILLAR COLUMNS (Strictly 3 Columns, 9 Items Total per Division) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mt-1">
                    {currentTree.pillars.map((pillar, pIdx) => (
                      <div key={pIdx} className="flex flex-col items-center">
                        {/* Vertical line down to Pillar */}
                        <div className="w-0.5 h-4 bg-[#142338]/80 dark:bg-cyan-400/70"></div>
                        
                        <div className="w-full rounded-2xl bg-white dark:bg-[#111A2E] border-2 border-[#E2D9C8] dark:border-white/10 p-4 sm:p-5 shadow-[0_14px_30px_rgba(20,35,56,0.06),inset_0_1px_0_rgba(255,255,255,0.95)] dark:shadow-[0_15px_35px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)] transition-all">
                          {/* Pillar Header with 3D Embossed Pill */}
                          <div className="text-center pb-3 mb-3 border-b border-[#E8E0D2] dark:border-slate-800">
                            <span className="inline-block px-4 py-1.5 rounded-xl bg-gradient-to-b from-[#142338] to-[#0B1522] dark:from-blue-600 dark:to-blue-700 text-white font-black text-xs sm:text-[13px] uppercase tracking-wider shadow-[0_3px_8px_rgba(20,35,56,0.22),inset_0_1px_0_rgba(255,255,255,0.2)] border border-[#C5A880]/30">
                              {pillar.title}
                            </span>
                          </div>

                          {/* 3 Clean Subcategories (No Granular Bullets) */}
                          <div className="space-y-2.5">
                            {pillar.subcategories.map((sub, sIdx) => (
                              <Link
                                key={sIdx}
                                href={`/products?category=${encodeURIComponent(sub.slug)}`}
                                className="p-3 rounded-xl bg-gradient-to-b from-white to-[#FAF6F0] dark:from-slate-800/90 dark:to-slate-900/90 border border-[#E5DEC8] dark:border-slate-700/80 hover:border-[#142338] dark:hover:border-blue-400 hover:shadow-[0_8px_18px_rgba(20,35,56,0.12)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-between group shadow-2xs"
                              >
                                <span className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#142338] dark:group-hover:text-cyan-400 transition-colors">
                                  {sub.label}
                                </span>
                                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#C5A880] dark:group-hover:text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Directory Bottom Bar: Enterprise Sourcing Callout — Compact and subtle */}
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
