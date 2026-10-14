/**
 * Automated Product Classification & Integrity Engine for Apparel Emporium
 * Ensures 100% disciplined catalog taxonomy across API ingestions, bulk uploads,
 * admin edits, and automated sync jobs.
 */

export interface TaxonomyClassification {
    divisionType: 'Knit' | 'Woven' | 'Sweater' | 'Footwear' | 'Home Textiles' | 'Accessories';
    department: 'Menswear' | 'Womenswear' | 'Kidswear' | 'Home Textiles' | 'Accessories';
    subCategory: string;
}

export interface ProductInputForClassification {
    name?: string | null;
    title?: string | null;
    category?: string | null;
    categoryName?: string | null;
    department?: string | null;
    divisionType?: string | null;
    subCategory?: string | null;
    description?: string | null;
    shortDescription?: string | null;
    tags?: string | string[] | null;
}

/**
 * Deterministically classifies any incoming product into its correct divisionType,
 * department, and canonical subcategory.
 */
export function autoClassifyProductTaxonomy(input: ProductInputForClassification): TaxonomyClassification {
    const rawName = (input.title || input.name || '').toLowerCase();
    const rawCat = (input.category || input.categoryName || '').toLowerCase();
    const rawSub = (input.subCategory || '').toLowerCase();
    const rawDesc = (input.description || input.shortDescription || '').toLowerCase();
    const rawTags = Array.isArray(input.tags)
        ? input.tags.join(' ').toLowerCase()
        : (typeof input.tags === 'string' ? input.tags.toLowerCase() : '');

    const fullText = `${rawName} ${rawCat} ${rawSub} ${rawTags} ${rawDesc}`;

    // ─────────────────────────────────────────────────────────────
    // 1. Division Type Classification
    // ─────────────────────────────────────────────────────────────
    let divisionType: TaxonomyClassification['divisionType'] = 'Knit';

    const isFootwear = /espadrille|shoe|footwear|sneaker|sandal|loafer|slip-on|slipon|canvas shoe|jute sole|flats/i.test(fullText);
    const isHomeTextile = /towel|bedding|curtain|bath sheet|bath towel|bed sheet|bedsheet|duvet|pillow|quilt|linen|home textile/i.test(fullText);
    const isAccessory = /scarf|scarves|muffler|hat|cap|baseball cap|beanie|glove|gloves|mitten|sock|socks|gift box|belt|accessories/i.test(fullText);
    const isSweater = /sweater|cardigan|pullover|jumper|poncho|flat knit|cashmere knit|wool knit|cable knit|lambswool/i.test(fullText);
    const isWoven = /woven|denim|jean|jeans|chino|chinos|trouser|trousers|pant|pants|cargo|poplin|twill|chambray|blazer|suit|blouse|woven shirt/i.test(fullText)
        && !/t-shirt|tshirt|tee|polo|sweatshirt|hoodie|jogger/i.test(fullText);

    if (isFootwear) {
        divisionType = 'Footwear';
    } else if (isHomeTextile) {
        divisionType = 'Home Textiles';
    } else if (isAccessory) {
        divisionType = 'Accessories';
    } else if (isSweater) {
        divisionType = 'Sweater';
    } else if (isWoven) {
        divisionType = 'Woven';
    } else {
        // Default to Knit (Circular Knit Items) for t-shirts, polos, hoodies, joggers, knit dresses, etc.
        divisionType = 'Knit';
    }

    // ─────────────────────────────────────────────────────────────
    // 2. Department (Gender / Section) Classification
    // ─────────────────────────────────────────────────────────────
    let department: TaxonomyClassification['department'] = 'Menswear';

    if (divisionType === 'Home Textiles') {
        department = 'Home Textiles';
    } else if (divisionType === 'Accessories') {
        department = 'Accessories';
    } else {
        // Fashion or Footwear: Determine Gender
        const hasKids = /\b(kid|kids|child|children|childrens|baby|toddler|infant|boy|girl|romper|bodysuit)\b/i.test(fullText);
        const hasWomen = /\b(women|womens|woman|ladies|lady|female|dress|dresses|skirt|crop top)\b/i.test(fullText);
        const hasMen = /\b(men|mens|man|male|gent|gentleman)\b/i.test(fullText);

        if (hasKids) {
            department = 'Kidswear';
        } else if (hasWomen && !hasMen) {
            department = 'Womenswear';
        } else if (hasMen) {
            department = 'Menswear';
        } else if (hasWomen) {
            department = 'Womenswear';
        } else {
            // Check provided input department if valid
            if (input.department === 'Womenswear' || input.department === 'Kidswear') {
                department = input.department;
            } else {
                department = 'Menswear';
            }
        }
    }

    // ─────────────────────────────────────────────────────────────
    // 3. SubCategory Mapping (Canonical Slug Resolution)
    // ─────────────────────────────────────────────────────────────
    let subCategory = 'general';

    if (divisionType === 'Footwear') {
        if (/basic|classic|white canvas/i.test(fullText)) {
            subCategory = 'basic-espadrilles';
        } else {
            subCategory = 'fashion-espadrilles';
        }
    } else if (divisionType === 'Home Textiles') {
        if (/towel/i.test(fullText)) subCategory = 'towel';
        else if (/bedding|bed sheet|duvet|pillow/i.test(fullText)) subCategory = 'bedding';
        else if (/curtain/i.test(fullText)) subCategory = 'curtain';
        else subCategory = 'towel';
    } else if (divisionType === 'Accessories') {
        if (/scarf|muffler/i.test(fullText)) subCategory = 'scarves';
        else if (/hat|cap|beanie/i.test(fullText)) subCategory = 'hats-caps';
        else if (/glove|mitten/i.test(fullText)) subCategory = 'gloves';
        else if (/sock/i.test(fullText)) subCategory = 'socks';
        else if (/gift box/i.test(fullText)) subCategory = 'gift-box';
        else subCategory = 'scarves';
    } else if (divisionType === 'Sweater') {
        if (department === 'Kidswear') {
            subCategory = 'kids-sweater';
        } else if (department === 'Womenswear') {
            if (/pullover|jumper/i.test(fullText)) subCategory = 'womens-pullover';
            else subCategory = 'womens-sweaters-cardigans';
        } else {
            if (/pullover|jumper/i.test(fullText)) subCategory = 'mens-pullover';
            else subCategory = 'mens-sweaters-cardigans';
        }
    } else if (divisionType === 'Woven') {
        if (department === 'Kidswear') {
            if (/pant|jean|trouser|denim/i.test(fullText)) subCategory = 'kids-denim-pants';
            else subCategory = 'kids-woven-shirts';
        } else if (department === 'Womenswear') {
            if (/pant|jean|trouser|denim|chinos/i.test(fullText)) subCategory = 'womens-denim-jeans';
            else subCategory = 'womens-shirt-blouse';
        } else {
            if (/pant|jean|trouser|denim|chinos/i.test(fullText)) subCategory = 'mens-denim-jeans';
            else subCategory = 'mens-formal-shirt';
        }
    } else {
        // Knit (Circular Knit)
        if (department === 'Kidswear') {
            if (/romper|bodysuit/i.test(fullText)) subCategory = 'kids-rompers-bodysuits';
            else if (/hoodie|sweatshirt|set/i.test(fullText)) subCategory = 'kids-hoodies-sets';
            else subCategory = 'kids-t-shirt';
        } else if (department === 'Womenswear') {
            if (/dress|nightwear|sleepwear/i.test(fullText)) subCategory = 'womens-knit-dress';
            else if (/hoodie|sweatshirt/i.test(fullText)) subCategory = 'womens-sweatshirt';
            else if (/polo/i.test(fullText)) subCategory = 'womens-polo-shirt';
            else if (/tank|undergarment|bodysuit/i.test(fullText)) subCategory = 'womens-undergarments';
            else subCategory = 'womens-t-shirt';
        } else {
            // Menswear
            if (/polo/i.test(fullText)) subCategory = 'mens-polo-shirt';
            else if (/hoodie|sweatshirt/i.test(fullText)) subCategory = 'mens-sweatshirt';
            else if (/jogger|trouser|pyjama/i.test(fullText)) subCategory = 'mens-trousers-joggers';
            else if (/tank|undergarment|boxer/i.test(fullText)) subCategory = 'mens-undergarments';
            else subCategory = 'mens-t-shirt';
        }
    }

    return {
        divisionType,
        department,
        subCategory,
    };
}
