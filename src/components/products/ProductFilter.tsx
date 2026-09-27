'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ChevronDown, ChevronRight, Check, Loader2, X, Filter, Sparkles } from 'lucide-react';
import Link from 'next/link';
import AtelierDecorations3D from './AtelierDecorations3D';

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
    const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

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
            // Find category for this gender
            const match = categories.find(c => c.slug.includes(gender));
            if (match) handleCategorySelect(match.slug);
            else applyFilters(undefined, undefined, undefined, gender);
        }
    };

    // Main 4 catalog categories from screenshot
    const mainCategories = [
        { name: 'Knitwear', slug: 'knitwear' },
        { name: 'Woven', slug: 'woven' },
        { name: 'Sweater', slug: 'sweater' },
        { name: 'Accessories', slug: 'accessories' }
    ];

    const hasActiveFilters = !!selectedCategory || selectedFabrics.length > 0 || selectedMOQs.length > 0 || !!search;

    return (
        <div className="sidebar-3d-panel p-5 sm:p-6 rounded-[28px] space-y-6 max-w-full relative">
            {/* Header & Clear */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-200/70 dark:border-white/10">
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-blue-600 dark:text-blue-400" />
                    <h2 className="text-xs sm:text-sm font-black font-heading text-slate-900 dark:text-white uppercase tracking-wider">
                        Sourcing Filters
                    </h2>
                </div>
                {hasActiveFilters && (
                    <button
                        onClick={clearAll}
                        className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline uppercase tracking-wide"
                    >
                        Clear All
                    </button>
                )}
            </div>

            {/* ── SMART SOURCING SEARCH ── */}
            <div className="relative" ref={dropdownRef}>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 mb-1.5">
                    Smart Sourcing Search
                </label>
                <div className="relative">
                    <input
                        type="text"
                        value={search}
                        onFocus={() => setShowSuggestions(true)}
                        onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true); }}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilters(undefined, undefined, undefined, search)}
                        placeholder="Search Men's, Suits, etc..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl input-3d-inset text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    {isSearching && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 size={13} className="animate-spin text-blue-600" />
                        </div>
                    )}
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && (suggestions.length > 0 || isSearching) && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#FAF6F0] dark:bg-[#101726] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 z-50 overflow-hidden">
                        <div className="p-2 space-y-1 max-h-56 overflow-y-auto">
                            {suggestions.map((p) => (
                                <Link
                                    key={p.id}
                                    href={`/products/${p.slug}`}
                                    className="flex items-center gap-2.5 p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors"
                                    onClick={() => setShowSuggestions(false)}
                                >
                                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-white shrink-0">
                                        <img src={p.thumbnail} alt={p.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{p.name}</p>
                                        <p className="text-[10px] text-slate-400 uppercase">{p.category?.name}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── DEPARTMENT & CATEGORY ── */}
            <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
                    Department &amp; Category
                </label>

                {/* In-category search input */}
                <div className="relative">
                    <input
                        type="text"
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        placeholder="Enter categories..."
                        className="w-full pl-8 pr-3 py-2 rounded-xl input-3d-inset text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
                    />
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>

                {/* All Categories Dropdown Pill */}
                <button
                    type="button"
                    onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#1B2B44] text-white text-xs font-bold shadow-md transition-all active:scale-98"
                >
                    <span>{selectedCategory ? `Category: ${selectedCategory}` : 'All Categories'}</span>
                    <ChevronDown size={14} className={`transform transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Checkbox Category List */}
                <div className="space-y-2 pt-1 px-1">
                    {mainCategories.map((cat) => {
                        const isChecked = selectedCategory === cat.slug || selectedCategory.includes(cat.slug);
                        return (
                            <label
                                key={cat.slug}
                                onClick={() => handleCategorySelect(isChecked ? '' : cat.slug)}
                                className="flex items-center justify-between cursor-pointer group select-none"
                            >
                                <span className={`text-xs font-bold transition-colors ${isChecked
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'
                                    }`}>
                                    {cat.name}
                                </span>
                                <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${isChecked
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                                    : 'border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800'
                                    }`}>
                                    {isChecked && <Check size={11} className="stroke-[3]" />}
                                </div>
                            </label>
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
                                className={`px-3 py-1 rounded-full text-[10.5px] font-bold transition-all ${isSelected
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
                                className="flex items-center gap-2.5 cursor-pointer group select-none"
                            >
                                <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${isChecked
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                                    : 'border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800'
                                    }`}>
                                    {isChecked && <Check size={11} className="stroke-[3]" />}
                                </div>
                                <span className={`text-xs font-semibold ${isChecked ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                                    {moq}
                                </span>
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
