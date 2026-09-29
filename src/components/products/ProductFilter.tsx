'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ChevronDown, ChevronRight, Check, X, Filter, Sparkles } from 'lucide-react';
import Link from 'next/link';
import AtelierDecorations3D from './AtelierDecorations3D';

import { getFilterMainCategories, FilterMainCategory, FilterSubcategory, FilterGroup, FilterItem } from '@/lib/catalog-taxonomy';

interface CategoryItem {
    id: string;
    name: string;
    slug: string;
    parentId?: string | null;
    parent?: { name: string };
    children?: CategoryItem[];
    _count?: { products: number };
}

interface ProductFilterProps {
    categories: CategoryItem[];
}

export default function ProductFilter({ categories }: ProductFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [search, setSearch] = useState(searchParams.get('q') || '');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Filter states
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [selectedFabrics, setSelectedFabrics] = useState<string[]>(searchParams.get('fabric')?.split(',').filter(Boolean) || []);
    const [selectedMOQs, setSelectedMOQs] = useState<string[]>(searchParams.get('moq')?.split(',').filter(Boolean) || []);
    const [activeGender, setActiveGender] = useState<string | null>(null);

    // Category tree & expansion states
    const [categorySearch, setCategorySearch] = useState('');

    const FABRIC_OPTIONS = ['Cotton', 'Polyester', 'Denim', 'Linen', 'Silk', 'Viscose', 'Jersey', 'Fleece'];
    const MOQ_OPTIONS = ['< 100', '100-500', '500-1000', '1000+'];

    // Sync from URL
    useEffect(() => {
        const cat = searchParams.get('category') || '';
        setSelectedCategory(cat);
        setSelectedFabrics(searchParams.get('fabric')?.split(',').filter(Boolean) || []);
        setSelectedMOQs(searchParams.get('moq')?.split(',').filter(Boolean) || []);
        setSearch(searchParams.get('q') || '');

        if (cat.includes('men')) setActiveGender('men');
        else if (cat.includes('women')) setActiveGender('women');
        else if (cat.includes('kid')) setActiveGender('kids');
    }, [searchParams]);

    // Autocomplete search
    useEffect(() => {
        if (search.length < 2) {
            setSuggestions([]);
            return;
        }

        const fetchSuggestions = async () => {
            setIsSearching(true);
            try {
                const res = await fetch(`/api/products/search?q=${encodeURIComponent(search)}`);
                const data = await res.json();
                if (data.success) setSuggestions(data.products);
            } catch (e) { } finally {
                setIsSearching(false);
            }
        };

        const timer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Handle outside clicks
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const applyFilters = (newCategory?: string, newFabrics?: string[], newMOQs?: string[], newSearch?: string) => {
        const params = new URLSearchParams(searchParams.toString());

        const cat = newCategory !== undefined ? newCategory : selectedCategory;
        const fab = newFabrics !== undefined ? newFabrics : selectedFabrics;
        const moq = newMOQs !== undefined ? newMOQs : selectedMOQs;
        const q = newSearch !== undefined ? newSearch : search;

        if (q) params.set('q', q); else params.delete('q');
        if (cat) params.set('category', cat); else params.delete('category');
        if (fab.length) params.set('fabric', fab.join(',')); else params.delete('fabric');
        if (moq.length) params.set('moq', moq.join(',')); else params.delete('moq');

        params.set('page', '1');
        router.push(`/products?${params.toString()}`);
    };

    const handleCategorySelect = (slug: string) => {
        setSelectedCategory(slug);
        applyFilters(slug);
    };

    const toggleFabric = (fabric: string) => {
        const updated = selectedFabrics.includes(fabric)
            ? selectedFabrics.filter(f => f !== fabric)
            : [...selectedFabrics, fabric];
        setSelectedFabrics(updated);
        applyFilters(undefined, updated);
    };

    const toggleMOQ = (moq: string) => {
        const updated = selectedMOQs.includes(moq)
            ? selectedMOQs.filter(m => m !== moq)
            : [...selectedMOQs, moq];
        setSelectedMOQs(updated);
        applyFilters(undefined, undefined, updated);
    };

    const clearAll = () => {
        setSearch('');
        setSelectedCategory('');
        setSelectedFabrics([]);
        setSelectedMOQs([]);
        setCategorySearch('');
        setActiveGender(null);
        router.push('/products');
    };

    const handleGenderFilter = (gender: 'men' | 'women' | 'kids') => {
        setActiveGender(activeGender === gender ? null : gender);
        if (activeGender === gender) {
            handleCategorySelect('');
        } else {
            const match = categories.find(c => c.slug.includes(gender));
            if (match) handleCategorySelect(match.slug);
            else applyFilters(undefined, undefined, undefined, gender);
        }
    };

    // ─────────────────────────────────────────────────────────────
    // UNIFIED CATEGORIES HIERARCHY (Synchronized from Catalog Taxonomy)
    // ─────────────────────────────────────────────────────────────
    const MAIN_FILTER_CATEGORIES: FilterMainCategory[] = useMemo(() => getFilterMainCategories(), []);

    // Expansion state for categories
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
        'fashion': true,
        'hometextiles': false,
        'footwear': false,
        'accessories': false,
    });

    const toggleExpand = (slug: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setExpandedCategories(prev => ({
            ...prev,
            [slug]: !prev[slug]
        }));
    };

    // Auto-expand parent if selectedCategory is a descendant
    useEffect(() => {
        if (!selectedCategory) return;
        MAIN_FILTER_CATEGORIES.forEach(main => {
            const hasMain = main.slug === selectedCategory;
            let subMatch = false;

            main.subcategories.forEach(sub => {
                if (sub.slug === selectedCategory) subMatch = true;
                if (sub.items?.some(it => it.slug === selectedCategory)) {
                    subMatch = true;
                    setExpandedCategories(prev => ({ ...prev, [`${main.slug}-${sub.slug}`]: true }));
                }
                if (sub.groups) {
                    sub.groups.forEach(grp => {
                        if (grp.slug === selectedCategory) subMatch = true;
                        if (grp.items?.some(it => it.slug === selectedCategory)) {
                            subMatch = true;
                            setExpandedCategories(prev => ({
                                ...prev,
                                [`${main.slug}-${sub.slug}`]: true,
                                [`${main.slug}-${sub.slug}-${grp.slug}`]: true,
                            }));
                        }
                    });
                }
            });

            if (hasMain || subMatch) {
                setExpandedCategories(prev => ({ ...prev, [main.slug]: true }));
            }
        });
    }, [selectedCategory]);

    // Active Category Label Finder
    const activeCategoryLabel = useMemo(() => {
        if (!selectedCategory) return null;
        for (const main of MAIN_FILTER_CATEGORIES) {
            if (main.slug === selectedCategory) return main.name;
            for (const sub of main.subcategories) {
                if (sub.slug === selectedCategory) return sub.name;
                if (sub.items) {
                    const matchItem = sub.items.find(it => it.slug === selectedCategory);
                    if (matchItem) return matchItem.name;
                }
                if (sub.groups) {
                    for (const grp of sub.groups) {
                        if (grp.slug === selectedCategory) return grp.name;
                        if (grp.items) {
                            const matchItem = grp.items.find(it => it.slug === selectedCategory);
                            if (matchItem) return matchItem.name;
                        }
                    }
                }
            }
        }
        return selectedCategory;
    }, [selectedCategory]);

    const hasActiveFilters = !!selectedCategory || selectedFabrics.length > 0 || selectedMOQs.length > 0 || !!search;

    return (
        <div className="sidebar-3d-panel p-5 sm:p-6 rounded-[28px] space-y-6 max-w-full relative">
            {/* Header & Clear */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-200/70 dark:border-white/10">
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-[#1B2B44] dark:text-blue-400" />
                    <h2 className="text-xs sm:text-sm font-black font-heading text-slate-900 dark:text-white uppercase tracking-wider">
                        Sourcing Filters
                    </h2>
                </div>
                {hasActiveFilters && (
                    <button
                        onClick={clearAll}
                        className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline uppercase tracking-wide cursor-pointer"
                    >
                        Clear All
                    </button>
                )}
            </div>

            {/* ── SMART SOURCING SEARCH ── */}
            <div className="relative" ref={dropdownRef}>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 mb-2">
                    Smart Sourcing Search
                </label>
                <div className="relative">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        placeholder="Search Men's, Suits, etc..."
                        className="w-full pl-9 pr-8 py-2.5 rounded-2xl input-3d-inset text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
                    />
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    {search && (
                        <button
                            type="button"
                            onClick={() => { setSearch(''); applyFilters(undefined, undefined, undefined, ''); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            <X size={12} />
                        </button>
                    )}
                </div>

                {/* Autocomplete Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-black/5 dark:border-white/10 overflow-hidden z-50">
                        {suggestions.map((p) => (
                            <Link
                                key={p.id}
                                href={`/products/${p.slug}`}
                                className="flex items-center gap-3 p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 overflow-hidden">
                                    {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{p.name}</p>
                                    <p className="text-[10px] text-slate-400">{p.category?.name || 'Garment'}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* ── DEPARTMENT & CATEGORY (Matches User Screenshot) ── */}
            <div className="space-y-2.5">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    DEPARTMENT & CATEGORY
                </label>

                {/* Search In Categories */}
                <div className="relative">
                    <input
                        type="text"
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        placeholder="Enter categories..."
                        className="w-full pl-8 pr-7 py-2.5 rounded-2xl bg-[#EBE5DB]/70 dark:bg-slate-900/70 border border-black/5 dark:border-white/10 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:border-blue-500/50 transition-all"
                    />
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    {categorySearch && (
                        <button
                            type="button"
                            onClick={() => setCategorySearch('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                        >
                            <X size={12} />
                        </button>
                    )}
                </div>

                {/* All Categories Pill Button (Matches Screenshot Pill) */}
                <button
                    type="button"
                    onClick={() => {
                        if (selectedCategory) {
                            handleCategorySelect('');
                        } else {
                            // Toggle all open / closed
                            const anyOpen = Object.values(expandedCategories).some(Boolean);
                            const nextState: Record<string, boolean> = {};
                            MAIN_FILTER_CATEGORIES.forEach(m => nextState[m.slug] = !anyOpen);
                            setExpandedCategories(nextState);
                        }
                    }}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-[#1B2B44] text-white text-[12.5px] font-bold shadow-md hover:bg-[#152338] transition-all active:scale-[0.99] group cursor-pointer select-none"
                >
                    <span className="truncate">
                        {activeCategoryLabel ? `Active: ${activeCategoryLabel}` : 'All Categories'}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                        {selectedCategory && (
                            <span 
                                onClick={(e) => { e.stopPropagation(); handleCategorySelect(''); }}
                                className="text-[10px] bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-full text-white font-medium"
                                title="Clear category"
                            >
                                Clear
                            </span>
                        )}
                        <ChevronDown size={14} className={`transform transition-transform ${selectedCategory ? '' : 'group-hover:translate-y-0.5'}`} />
                    </div>
                </button>

                {/* 4 Main Categories Hierarchy with Nested Subcategories & Checkboxes */}
                <div className="space-y-1 pt-1 select-none">
                    {MAIN_FILTER_CATEGORIES.map((main) => {
                        const q = categorySearch.trim().toLowerCase();
                        
                        // Check if main category, subcategories, or nested items match search query
                        const matchesMain = !q || main.name.toLowerCase().includes(q) || main.slug.toLowerCase().includes(q);
                        
                        const filteredSubs = main.subcategories.filter(sub => {
                            if (!q) return true;
                            if (sub.name.toLowerCase().includes(q) || sub.slug.toLowerCase().includes(q)) return true;
                            if (sub.items && sub.items.some(it => it.name.toLowerCase().includes(q) || it.slug.toLowerCase().includes(q))) return true;
                            if (sub.groups) {
                                return sub.groups.some(grp => 
                                    grp.name.toLowerCase().includes(q) || 
                                    (grp.items && grp.items.some(it => it.name.toLowerCase().includes(q) || it.slug.toLowerCase().includes(q)))
                                );
                            }
                            return matchesMain;
                        });

                        if (!matchesMain && filteredSubs.length === 0) return null;

                        const isMainOpen = q ? true : !!expandedCategories[main.slug];
                        const isMainChecked = selectedCategory === main.slug;

                        return (
                            <div key={main.slug} className="py-0.5">
                                {/* ── Tier 1: Main Category Row (Clean, matches screenshot) ── */}
                                <div 
                                    className="flex items-center justify-between py-1.5 px-2 rounded-xl hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors group cursor-pointer"
                                >
                                    <div 
                                        onClick={() => toggleExpand(main.slug)}
                                        className="flex items-center gap-2 flex-1 min-w-0"
                                    >
                                        <button 
                                            type="button"
                                            className="p-0.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors"
                                        >
                                            {isMainOpen ? <ChevronDown size={14} className="stroke-[2.5]" /> : <ChevronRight size={14} className="stroke-[2.5]" />}
                                        </button>
                                        <span className={`text-[13.5px] font-bold tracking-tight transition-colors truncate ${
                                            isMainChecked
                                                ? 'text-[#1B2B44] dark:text-blue-400 font-extrabold'
                                                : 'text-slate-800 dark:text-slate-200 group-hover:text-[#1B2B44] dark:group-hover:text-white'
                                        }`}>
                                            {main.name}
                                        </span>
                                    </div>

                                    {/* Rounded Checkbox on Right (Exact Match to User Screenshot) */}
                                    <div 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleCategorySelect(isMainChecked ? '' : main.slug);
                                        }}
                                        className={`w-5 h-5 rounded-[6px] border flex items-center justify-center transition-all shrink-0 ml-2 cursor-pointer ${
                                            isMainChecked
                                                ? 'bg-[#1B2B44] dark:bg-blue-600 border-[#1B2B44] dark:border-blue-600 text-white shadow-xs'
                                                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] hover:border-slate-400'
                                        }`}
                                        title={`Filter by ${main.name}`}
                                    >
                                        {isMainChecked && <Check size={12} className="stroke-[3]" />}
                                    </div>
                                </div>

                                {/* ── Tier 2: Subcategories (Indented Tree) ── */}
                                {isMainOpen && filteredSubs.length > 0 && (
                                    <div className="ml-3 pl-3 border-l-2 border-slate-300/70 dark:border-slate-700/60 space-y-1 py-1">
                                        {filteredSubs.map((sub) => {
                                            const isSubChecked = selectedCategory === sub.slug;
                                            const subKey = `${main.slug}-${sub.slug}`;
                                            const isSubOpen = q ? true : !!expandedCategories[subKey];
                                            const hasNested = (sub.items && sub.items.length > 0) || (sub.groups && sub.groups.length > 0);

                                            return (
                                                <div key={sub.slug} className="space-y-0.5">
                                                    {/* Subcategory Row */}
                                                    <div className="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors group/sub cursor-pointer">
                                                        <div 
                                                            onClick={() => hasNested ? toggleExpand(subKey) : handleCategorySelect(isSubChecked ? '' : sub.slug)}
                                                            className="flex items-center gap-1.5 flex-1 min-w-0"
                                                        >
                                                            {hasNested && (
                                                                <button type="button" className="p-0.5 text-slate-400 group-hover/sub:text-slate-700 transition-colors">
                                                                    {isSubOpen ? <ChevronDown size={12} className="stroke-[2.5]" /> : <ChevronRight size={12} className="stroke-[2.5]" />}
                                                                </button>
                                                            )}
                                                            <span className={`text-[12.5px] font-semibold transition-colors truncate ${
                                                                isSubChecked
                                                                    ? 'text-[#1B2B44] dark:text-blue-400 font-bold'
                                                                    : 'text-slate-700 dark:text-slate-300 group-hover/sub:text-slate-900 dark:group-hover/sub:white'
                                                            }`}>
                                                                {sub.name}
                                                            </span>
                                                        </div>

                                                        {/* Subcategory Checkbox */}
                                                        <div 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCategorySelect(isSubChecked ? '' : sub.slug);
                                                            }}
                                                            className={`w-4.5 h-4.5 rounded-[5px] border flex items-center justify-center transition-all shrink-0 ml-2 cursor-pointer ${
                                                                isSubChecked
                                                                    ? 'bg-[#1B2B44] dark:bg-blue-600 border-[#1B2B44] dark:border-blue-600 text-white shadow-xs'
                                                                    : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] hover:border-slate-400'
                                                            }`}
                                                            title={`Filter by ${sub.name}`}
                                                        >
                                                            {isSubChecked && <Check size={11} className="stroke-[3]" />}
                                                        </div>
                                                    </div>

                                                    {/* ── Tier 3A: Fashion Groups (Knit, Woven, Sweater) ── */}
                                                    {isSubOpen && sub.groups && (
                                                        <div className="ml-3 pl-2.5 border-l border-slate-300/60 dark:border-slate-700/50 space-y-1 py-0.5">
                                                            {sub.groups.map((grp) => {
                                                                const isGrpChecked = selectedCategory === grp.slug;
                                                                const grpKey = `${subKey}-${grp.slug}`;
                                                                const isGrpOpen = q ? true : !!expandedCategories[grpKey];
                                                                const hasItems = grp.items && grp.items.length > 0;

                                                                return (
                                                                    <div key={grp.slug} className="space-y-0.5">
                                                                        <div className="flex items-center justify-between py-1 px-1 rounded hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors group/grp cursor-pointer">
                                                                            <div 
                                                                                onClick={() => hasItems ? toggleExpand(grpKey) : handleCategorySelect(isGrpChecked ? '' : grp.slug)}
                                                                                className="flex items-center gap-1.5 flex-1 min-w-0"
                                                                            >
                                                                                {hasItems && (
                                                                                    <button type="button" className="p-0.5 text-slate-400">
                                                                                        {isGrpOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                                                                                    </button>
                                                                                )}
                                                                                <span className={`text-[11.5px] font-bold uppercase tracking-wider transition-colors truncate ${
                                                                                    isGrpChecked
                                                                                        ? 'text-[#1B2B44] dark:text-blue-400 font-extrabold'
                                                                                        : 'text-slate-600 dark:text-slate-400 group-hover/grp:text-slate-900 dark:group-hover/grp:white'
                                                                                }`}>
                                                                                    {grp.name}
                                                                                </span>
                                                                            </div>

                                                                            <div 
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleCategorySelect(isGrpChecked ? '' : grp.slug);
                                                                                }}
                                                                                className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all shrink-0 ml-2 cursor-pointer ${
                                                                                    isGrpChecked
                                                                                        ? 'bg-[#1B2B44] dark:bg-blue-600 border-[#1B2B44] dark:border-blue-600 text-white shadow-xs'
                                                                                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-slate-400'
                                                                                }`}
                                                                                title={`Filter by ${grp.name}`}
                                                                            >
                                                                                {isGrpChecked && <Check size={10} className="stroke-[3]" />}
                                                                            </div>
                                                                        </div>

                                                                        {/* Tier 4: Garment Items inside Fashion Groups */}
                                                                        {isGrpOpen && grp.items && (
                                                                            <div className="ml-2.5 pl-2 border-l border-slate-200 dark:border-slate-800 space-y-0.5 py-0.5">
                                                                                {grp.items.map((it) => {
                                                                                    const isItemChecked = selectedCategory === it.slug;
                                                                                    return (
                                                                                        <div 
                                                                                            key={it.slug}
                                                                                            onClick={() => handleCategorySelect(isItemChecked ? '' : it.slug)}
                                                                                            className="flex items-center justify-between py-0.5 px-1 rounded hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors cursor-pointer group/it"
                                                                                        >
                                                                                            <span className={`text-[11px] font-medium transition-colors truncate ${
                                                                                                isItemChecked
                                                                                                    ? 'text-[#1B2B44] dark:text-blue-400 font-bold'
                                                                                                    : 'text-slate-600 dark:text-slate-400 group-hover/it:text-slate-900 dark:group-hover/it:white'
                                                                                            }`}>
                                                                                                {it.name}
                                                                                            </span>
                                                                                            <div className={`w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center transition-all shrink-0 ml-2 ${
                                                                                                isItemChecked
                                                                                                    ? 'bg-[#1B2B44] dark:bg-blue-600 border-[#1B2B44] dark:border-blue-600 text-white'
                                                                                                    : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-400'
                                                                                            }`}>
                                                                                                {isItemChecked && <Check size={8} className="stroke-[3]" />}
                                                                                            </div>
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}

                                                    {/* ── Tier 3B: Direct Items (Home Textiles, Footwear, etc.) ── */}
                                                    {isSubOpen && sub.items && (
                                                        <div className="ml-3 pl-2.5 border-l border-slate-300/60 dark:border-slate-700/50 space-y-0.5 py-0.5">
                                                            {sub.items.map((it) => {
                                                                const isItemChecked = selectedCategory === it.slug;
                                                                return (
                                                                    <div 
                                                                        key={it.slug}
                                                                        onClick={() => handleCategorySelect(isItemChecked ? '' : it.slug)}
                                                                        className="flex items-center justify-between py-1 px-1 rounded hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors cursor-pointer group/it"
                                                                    >
                                                                        <span className={`text-[11.5px] font-medium transition-colors truncate ${
                                                                            isItemChecked
                                                                                ? 'text-[#1B2B44] dark:text-blue-400 font-bold'
                                                                                : 'text-slate-600 dark:text-slate-400 group-hover/it:text-slate-900 dark:group-hover/it:white'
                                                                        }`}>
                                                                            {it.name}
                                                                        </span>
                                                                        <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all shrink-0 ml-2 ${
                                                                            isItemChecked
                                                                                ? 'bg-[#1B2B44] dark:bg-blue-600 border-[#1B2B44] dark:border-blue-600 text-white shadow-xs'
                                                                                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-slate-400'
                                                                        }`}>
                                                                            {isItemChecked && <Check size={10} className="stroke-[3]" />}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── FABRIC TYPE ── */}
            <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 mb-2.5">
                    Fabric Type
                </label>
                <div className="flex flex-wrap gap-1.5">
                    {FABRIC_OPTIONS.map((fabric) => {
                        const isSelected = selectedFabrics.includes(fabric);
                        return (
                            <button
                                key={fabric}
                                type="button"
                                onClick={() => toggleFabric(fabric)}
                                className={`px-3 py-1 rounded-full text-[10.5px] font-bold transition-all cursor-pointer ${isSelected
                                    ? 'bg-[#1B2B44] text-white shadow-sm scale-105'
                                    : 'bg-[#ECE5DC] dark:bg-[#121A2C] text-slate-700 dark:text-slate-300 hover:bg-[#E2D8CC] dark:hover:bg-[#1A253E] border border-white/60 dark:border-white/5'
                                    }`}
                            >
                                {fabric}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── MOQ REQUIREMENTS (PCS) ── */}
            <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 mb-2.5">
                    MOQ Requirements (PCS)
                </label>
                <div className="space-y-2 px-1">
                    {MOQ_OPTIONS.map((moq) => {
                        const isChecked = selectedMOQs.includes(moq);
                        return (
                            <label
                                key={moq}
                                onClick={() => toggleMOQ(moq)}
                                className="flex items-center justify-between cursor-pointer group select-none py-0.5"
                            >
                                <span className={`text-xs font-semibold ${isChecked ? 'text-[#1B2B44] dark:text-blue-400 font-bold' : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                                    {moq}
                                </span>
                                <div className={`w-4 h-4 rounded-[5px] border flex items-center justify-center transition-all ${isChecked
                                    ? 'bg-[#1B2B44] dark:bg-blue-600 border-[#1B2B44] dark:border-blue-600 text-white shadow-xs'
                                    : 'border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800'
                                    }`}>
                                    {isChecked && <Check size={11} className="stroke-[3]" />}
                                </div>
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* ── CUSTOM SOURCING? INSET CALLOUT ── */}
            <div className="pt-2">
                <div className="input-3d-inset rounded-2xl p-4 space-y-2">
                    <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles size={13} className="text-blue-600 dark:text-blue-400" />
                        Custom Sourcing?
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                        Need custom with specs or fabrics not listed? Our Dhaka merchandising team can source directly.
                    </p>
                    <Link
                        href="/contact"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline pt-0.5"
                    >
                        Send custom inquiry <ChevronRight size={13} />
                    </Link>
                </div>
            </div>

            {/* ── ATELIER DECORATIONS (Bottom Left Spool & Gender Chips) ── */}
            <AtelierDecorations3D
                variant="bottom-left"
                onGenderSelect={handleGenderFilter}
                activeGender={activeGender}
            />
        </div>
    );
}
