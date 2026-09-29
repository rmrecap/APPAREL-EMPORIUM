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
  CheckCircle2, 
  FileText,
  SlidersHorizontal
} from 'lucide-react';
import { TaxonomyDivision } from '@/lib/catalog-taxonomy';

interface Props {
  initialTaxonomy: TaxonomyDivision[];
}

export default function CatalogTaxonomyDirectory({ initialTaxonomy }: Props) {
  const [taxonomy] = useState<TaxonomyDivision[]>(initialTaxonomy);
  const [activeDivisionId, setActiveDivisionId] = useState<string>('fashion');
  const [activeDepartmentId, setActiveDepartmentId] = useState<string>('mens-fashion');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active division
  const currentDivision = useMemo(() => {
    return taxonomy.find(d => d.id === activeDivisionId) || taxonomy[0];
  }, [taxonomy, activeDivisionId]);

  // Active department inside current division
  const currentDepartment = useMemo(() => {
    if (!currentDivision) return null;
    const found = currentDivision.departments.find(d => d.id === activeDepartmentId);
    return found || currentDivision.departments[0] || null;
  }, [currentDivision, activeDepartmentId]);

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

  // Switch division and reset department
  const handleDivisionChange = (divId: string) => {
    setActiveDivisionId(divId);
    const div = taxonomy.find(d => d.id === divId);
    if (div && div.departments.length > 0) {
      setActiveDepartmentId(div.departments[0].id);
    }
  };

  const getDivisionIcon = (id: string) => {
    switch (id) {
      case 'fashion':
        return <Shirt className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'hometextiles':
        return <Home className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'footwear':
        return <Footprints className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'accessories':
        return <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />;
      default:
        return <Layers className="w-4 h-4 sm:w-5 sm:h-5" />;
    }
  };

  return (
    <section 
      aria-label="Manufacturing & Category Directory"
      className="mt-14 sm:mt-16 pt-10 pb-6 border-t border-[#D9D1C7] dark:border-slate-800"
    >
      <div className="rounded-[28px] sm:rounded-[36px] bg-[#EAE3D9] dark:bg-[#0E1626] p-6 sm:p-10 shadow-[8px_8px_24px_rgba(160,150,135,0.35),-6px_-6px_20px_rgba(255,255,255,0.85)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)] border border-white/60 dark:border-white/5 relative overflow-hidden">
        
        {/* Header Ribbon & Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-[#D8CEBF] dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-600/10 text-blue-700 dark:text-blue-400 border border-blue-600/20">
                Official Production Matrix
              </span>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Apparel Emporium Sourcing Grid
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase font-heading">
              Complete Product & Category Directory
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl font-medium">
              Browse our factory-backed production taxonomy across Fashion, Home Textiles, Footwear, and Accessories.
            </p>
          </div>

          {/* Quick Item Filter Input */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Quick find garment or item..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  CLEAR
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── SEARCH RESULTS OVERLAY (When Search is Active) ── */}
        {searchResults !== null ? (
          <div className="py-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Search Results ({searchResults.length} matching items)
              </h3>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Back to full taxonomy
              </button>
            </div>

            {searchResults.length === 0 ? (
              <div className="p-10 text-center rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-700">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3">
                  No direct taxonomy match for "{searchQuery}".
                </p>
                <Link
                  href={`/request-quote?product=${encodeURIComponent(searchQuery)}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#142338] text-white text-xs font-bold hover:bg-blue-600 transition-all shadow-md"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Request Custom Quote for "{searchQuery}"</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {searchResults.map(({ divisionName, departmentName, groupName, item }) => (
                  <Link
                    key={`${divisionName}-${item.id}`}
                    href={`/products?category=${encodeURIComponent(item.slug)}`}
                    className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-blue-500/60 dark:hover:border-blue-400 transition-all hover:scale-[1.02] shadow-sm flex items-center justify-between group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-[9px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-0.5 truncate">
                        {divisionName} • {groupName}
                      </div>
                      <div className="text-xs font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        Dept: {departmentName}
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ── STANDARD TAXONOMY EXPLORER ── */
          <div className="pt-6">
            {/* Level 1: Main Division Pills */}
            <div className="flex items-center gap-2.5 overflow-x-auto custom-scrollbar pb-3 mb-6">
              {taxonomy.map(div => {
                const isActive = div.id === activeDivisionId;
                return (
                  <button
                    key={div.id}
                    onClick={() => handleDivisionChange(div.id)}
                    className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-2.5 shrink-0 ${
                      isActive
                        ? 'bg-[#142338] dark:bg-blue-600 text-white shadow-lg scale-[1.03] border border-[#2B4268] dark:border-blue-400'
                        : 'bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {getDivisionIcon(div.id)}
                    <span>{div.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Level 2: Sub-Departments / Audiences (e.g. Men's, Women's, Kids) */}
            {currentDivision && currentDivision.departments.length > 1 && (
              <div className="mb-8 p-1.5 rounded-2xl bg-black/5 dark:bg-slate-900/50 inline-flex flex-wrap gap-1 border border-black/5 dark:border-white/5">
                {currentDivision.departments.map(dept => {
                  const isDeptActive = dept.id === activeDepartmentId;
                  return (
                    <button
                      key={dept.id}
                      onClick={() => setActiveDepartmentId(dept.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide transition-all ${
                        isDeptActive
                          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {dept.name}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Level 3: Production Lines / Category Groups Grid */}
            {currentDepartment && (
              <div className={`grid grid-cols-1 md:grid-cols-2 ${
                currentDepartment.groups.length >= 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'
              } gap-6 sm:gap-7 items-start`}>
                {currentDepartment.groups.map(group => (
                  <div
                    key={group.id}
                    className="rounded-3xl bg-white/70 dark:bg-slate-900/60 p-5 sm:p-6 border border-white dark:border-slate-800 shadow-[4px_4px_16px_rgba(160,150,135,0.2),-4px_-4px_12px_rgba(255,255,255,0.7)] dark:shadow-none transition-all duration-300 hover:shadow-md flex flex-col justify-between"
                  >
                    <div>
                      {/* Group Header */}
                      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-200/80 dark:border-slate-800">
                        <div>
                          <Link 
                            href={`/products?category=${encodeURIComponent(group.slug)}`}
                            className="text-sm font-black text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors tracking-wide uppercase font-heading block"
                          >
                            {group.name}
                          </Link>
                          {group.badge && (
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                              {group.badge}
                            </span>
                          )}
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {group.items.length} Items
                        </span>
                      </div>

                      {/* Items Grid */}
                      <div className="space-y-1.5">
                        {group.items.map(item => (
                          <div
                            key={item.id}
                            className="group/item flex items-center justify-between p-2 sm:p-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800/80 transition-colors duration-150"
                          >
                            <Link
                              href={`/products?category=${encodeURIComponent(item.slug)}`}
                              className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors flex-1 min-w-0"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 group-hover/item:bg-blue-500 transition-colors shrink-0" />
                              <span className="truncate">{item.name}</span>
                            </Link>

                            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                              {item.productCount && item.productCount > 0 ? (
                                <Link
                                  href={`/products?category=${encodeURIComponent(item.slug)}`}
                                  className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-600 hover:text-white transition-all"
                                  title="View available products"
                                >
                                  {item.productCount} SKUs
                                </Link>
                              ) : (
                                <Link
                                  href={`/request-quote?product=${encodeURIComponent(item.name)}`}
                                  className="opacity-0 group-hover/item:opacity-100 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#142338] text-white hover:bg-blue-600 transition-all flex items-center gap-1"
                                  title="Request factory quote for this item"
                                >
                                  <span>Quote</span>
                                  <ArrowUpRight className="w-2.5 h-2.5" />
                                </Link>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Group Footer: Fast RFQ Trigger */}
                    <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        Custom OEM/ODM
                      </span>
                      <Link
                        href={`/request-quote?product=${encodeURIComponent(group.name)}`}
                        className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                      >
                        <span>Sourcing Inquiry</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Directory Bottom Bar: Enterprise Sourcing Callout */}
        <div className="mt-10 pt-6 border-t border-[#D8CEBF] dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Looking for Custom Garment Development or Fabrics?
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Our merchandisers can develop custom GSM, yarn blends, colors, and trims to your exact tech pack.
              </div>
            </div>
          </div>

          <Link
            href="/request-quote"
            className="px-6 py-2.5 rounded-xl bg-[#142338] dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md shrink-0 flex items-center gap-2"
          >
            <span>Request Full Catalog RFQ</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </section>
  );
}
