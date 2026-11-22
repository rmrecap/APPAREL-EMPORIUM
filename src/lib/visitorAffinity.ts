'use client';

/**
 * Lightweight Visitor Affinity & Interest Tracking for B2B Garment Sourcing
 * - Completely anonymous, 0 PII (Personally Identifiable Information).
 * - Tracks category, subcategory, and product tags affinity scores in localStorage.
 * - Prioritizes search engine landing products and recent browsing intent.
 * - Re-ranks candidate products dynamically with instant fallback to default catalog.
 */

const STORAGE_KEY = 'ael_visitor_affinity';
const MAX_AFFINITY_ENTRIES = 50;

export interface VisitorAffinityProfile {
    categories: Record<string, number>;
    subCategories: Record<string, number>;
    tags: Record<string, number>;
    lastVisitedCategory?: string;
    lastVisitedSubCategory?: string;
    landingReferrer?: string;
    updatedAt: number;
}

function getStoredAffinity(): VisitorAffinityProfile {
    if (typeof window === 'undefined') {
        return { categories: {}, subCategories: {}, tags: {}, updatedAt: Date.now() };
    }
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object') {
                return {
                    categories: parsed.categories || {},
                    subCategories: parsed.subCategories || {},
                    tags: parsed.tags || {},
                    lastVisitedCategory: parsed.lastVisitedCategory,
                    lastVisitedSubCategory: parsed.lastVisitedSubCategory,
                    landingReferrer: parsed.landingReferrer,
                    updatedAt: parsed.updatedAt || Date.now(),
                };
            }
        }
    } catch { }
    return { categories: {}, subCategories: {}, tags: {}, updatedAt: Date.now() };
}

function saveAffinity(profile: VisitorAffinityProfile) {
    if (typeof window === 'undefined') return;
    try {
        profile.updatedAt = Date.now();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch { }
}

function isSearchReferrer(ref: string): boolean {
    if (!ref) return false;
    const lower = ref.toLowerCase();
    return (
        lower.includes('google.') ||
        lower.includes('bing.') ||
        lower.includes('yahoo.') ||
        lower.includes('duckduckgo.') ||
        lower.includes('baidu.') ||
        lower.includes('ecosia.') ||
        lower.includes('yandex.')
    );
}

/**
 * Record visitor interest when browsing a product or clicking a product card
 */
export function recordProductInterest(product: {
    id?: string;
    category?: any;
    subCategory?: string;
    tags?: any;
}) {
    if (typeof window === 'undefined' || !product) return;

    try {
        const profile = getStoredAffinity();

        // Detect landing referrer on initial session interaction
        if (!profile.landingReferrer && typeof document !== 'undefined' && document.referrer) {
            profile.landingReferrer = document.referrer;
        }

        const isSearchLanding = profile.landingReferrer ? isSearchReferrer(profile.landingReferrer) : false;
        // On external search landing, boost the landing product's category with extra weight
        const baseWeight = isSearchLanding ? 5 : 2;

        // 1. Category affinity
        const catSlug = (product.category?.slug || product.category?.name || (typeof product.category === 'string' ? product.category : ''))
            .toLowerCase().trim();
        if (catSlug) {
            profile.categories[catSlug] = (profile.categories[catSlug] || 0) + baseWeight;
            profile.lastVisitedCategory = catSlug;
        }

        // 2. Sub-category affinity
        const subSlug = (product.subCategory || '').toLowerCase().trim();
        if (subSlug) {
            profile.subCategories[subSlug] = (profile.subCategories[subSlug] || 0) + (baseWeight + 1);
            profile.lastVisitedSubCategory = subSlug;
        }

        // 3. Tags affinity
        let tagList: string[] = [];
        if (Array.isArray(product.tags)) {
            tagList = product.tags;
        } else if (typeof product.tags === 'string') {
            tagList = product.tags.split(',').map(t => t.trim());
        }

        tagList.forEach(tag => {
            const normTag = tag.toLowerCase().trim();
            if (normTag) {
                profile.tags[normTag] = (profile.tags[normTag] || 0) + 1;
            }
        });

        // Cap entries to keep localStorage size minimal (< 2KB)
        const trimDict = (d: Record<string, number>) => {
            const keys = Object.keys(d);
            if (keys.length > MAX_AFFINITY_ENTRIES) {
                keys.sort((a, b) => d[b] - d[a]);
                const trimmed: Record<string, number> = {};
                keys.slice(0, MAX_AFFINITY_ENTRIES).forEach(k => { trimmed[k] = d[k]; });
                return trimmed;
            }
            return d;
        };

        profile.categories = trimDict(profile.categories);
        profile.subCategories = trimDict(profile.subCategories);
        profile.tags = trimDict(profile.tags);

        saveAffinity(profile);
    } catch { }
}

/**
 * Re-rank candidate products dynamically based on the visitor's affinity profile.
 * Falls back to original candidate order if no visitor history exists.
 */
export function rankProductsByAffinity<T extends {
    id?: string;
    category?: any;
    subCategory?: string;
    tags?: any;
}>(candidates: T[], currentProductId?: string): T[] {
    if (!candidates || candidates.length <= 1) return candidates || [];

    // Filter out current product
    const pool = candidates.filter(c => !currentProductId || c.id !== currentProductId);
    if (typeof window === 'undefined') return pool;

    try {
        const profile = getStoredAffinity();
        const hasHistory = (
            Object.keys(profile.categories).length > 0 ||
            Object.keys(profile.subCategories).length > 0 ||
            Object.keys(profile.tags).length > 0
        );

        if (!hasHistory) {
            return pool;
        }

        const scored = pool.map((item, originalIndex) => {
            let score = 0;

            const catSlug = (item.category?.slug || item.category?.name || (typeof item.category === 'string' ? item.category : ''))
                .toLowerCase().trim();
            if (catSlug && profile.categories[catSlug]) {
                score += profile.categories[catSlug] * 4;
            }

            const subSlug = (item.subCategory || '').toLowerCase().trim();
            if (subSlug && profile.subCategories[subSlug]) {
                score += profile.subCategories[subSlug] * 6;
            }

            if (profile.lastVisitedCategory && catSlug === profile.lastVisitedCategory) {
                score += 8;
            }
            if (profile.lastVisitedSubCategory && subSlug === profile.lastVisitedSubCategory) {
                score += 12;
            }

            let itemTags: string[] = [];
            if (Array.isArray(item.tags)) {
                itemTags = item.tags;
            } else if (typeof item.tags === 'string') {
                itemTags = item.tags.split(',').map(t => t.trim());
            }

            itemTags.forEach(t => {
                const normTag = t.toLowerCase().trim();
                if (normTag && profile.tags[normTag]) {
                    score += profile.tags[normTag] * 2;
                }
            });

            return { item, score, originalIndex };
        });

        // Sort descending by affinity score, preserving original order for ties
        scored.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.originalIndex - b.originalIndex;
        });

        return scored.map(s => s.item);
    } catch {
        return pool;
    }
}
