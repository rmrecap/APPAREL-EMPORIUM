export function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ');
}

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

export const DEFAULT_PRODUCT_IMAGE = '/images/3d/white_tshirt.jpg';

export function extractProductImages(imagesRaw: any, fallback = DEFAULT_PRODUCT_IMAGE): string[] {
    if (!imagesRaw) return [fallback];

    const cleanList = (arr: any[]): string[] => {
        return arr.map((img: any) => {
            if (typeof img === 'string') {
                const s = img.trim();
                return (s && s !== '[]' && s !== 'null' && s !== '{}' && s !== 'undefined') ? s : null;
            }
            if (typeof img === 'object' && img !== null) {
                const u = img.url || img.src || img.link || img.path;
                if (typeof u === 'string') {
                    const s = u.trim();
                    return (s && s !== '[]' && s !== 'null' && s !== '{}') ? s : null;
                }
            }
            return null;
        }).filter(Boolean) as string[];
    };

    // If it's already an array
    if (Array.isArray(imagesRaw)) {
        const cleaned = cleanList(imagesRaw);
        return cleaned.length > 0 ? cleaned : [fallback];
    }

    // Try to parse if it's a string
    if (typeof imagesRaw === 'string') {
        const trimmed = imagesRaw.trim();
        if (!trimmed || trimmed === '[]' || trimmed === 'null' || trimmed === '{}' || trimmed === 'undefined') {
            return [fallback];
        }

        // If it looks like a JSON array start, try to parse it
        if (trimmed.startsWith('[')) {
            try {
                const parsed = JSON.parse(trimmed);
                if (Array.isArray(parsed)) {
                    const cleaned = cleanList(parsed);
                    if (cleaned.length > 0) return cleaned;
                }
            } catch (e) { }
            return [fallback];
        }

        // If comma-separated
        if (trimmed.includes(',') && !trimmed.startsWith('data:')) {
            const splitList = trimmed.split(',')
                .map(s => s.trim())
                .filter(s => s && s !== '[]' && s !== 'null');
            if (splitList.length > 0) return splitList;
        }

        return [trimmed];
    }

    return [fallback];
}

export function extractFeaturedImage(imagesRaw: any, fallback = DEFAULT_PRODUCT_IMAGE): string {
    const images = extractProductImages(imagesRaw, fallback);
    return images[0] || fallback;
}


