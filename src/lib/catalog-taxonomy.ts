/**
 * Apparel Emporium - Comprehensive Product & Category Taxonomy
 * 
 * Multi-tier hierarchy:
 * Division -> Department / Group -> Production Line / Category -> Garment / Item
 */

export interface TaxonomyItem {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  order: number;
  productCount?: number;
}

export interface TaxonomyGroup {
  id: string;
  name: string;
  slug: string;
  badge?: string;
  items: TaxonomyItem[];
}

export interface TaxonomyDepartment {
  id: string;
  name: string;
  slug: string;
  groups: TaxonomyGroup[];
}

export interface TaxonomyDivision {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  departments: TaxonomyDepartment[];
}

export interface FilterItem {
  name: string;
  slug: string;
}

export interface FilterGroup {
  name: string;
  slug: string;
  items?: FilterItem[];
}

export interface FilterSubcategory {
  name: string;
  slug: string;
  groups?: FilterGroup[];
  items?: FilterItem[];
}

export interface FilterMainCategory {
  name: string;
  slug: string;
  subcategories: FilterSubcategory[];
}

export const DEFAULT_CATALOG_TAXONOMY: TaxonomyDivision[] = [
  // ─────────────────────────────────────────────────────────────
  // 1. FASHION
  // ─────────────────────────────────────────────────────────────
  {
    id: 'fashion',
    name: 'FASHION',
    slug: 'fashion',
    tagline: 'Export-Quality Knits, Wovens & Sweaters for Men, Women & Children',
    departments: [
      {
        id: 'mens-fashion',
        name: "MEN'S FASHION",
        slug: 'mens-fashion',
        groups: [
          {
            id: 'men-circular-knit',
            name: 'Circular Knit Items',
            slug: 'men-circular-knit',
            badge: 'Cut & Sew Knits',
            items: [
              { id: 'm-k-1', name: 'T-Shirt', slug: 'mens-t-shirt', isActive: true, order: 1 },
              { id: 'm-k-2', name: 'Polo-Shirt', slug: 'mens-polo-shirt', isActive: true, order: 2 },
              { id: 'm-k-3', name: 'Sweatshirt / Hoodie', slug: 'mens-sweatshirt', isActive: true, order: 3 },
              { id: 'm-k-4', name: 'Jacket/Vest', slug: 'mens-knit-jacket-vest', isActive: true, order: 4 },
              { id: 'm-k-5', name: 'Jogger / Trousers', slug: 'mens-trousers-joggers', isActive: true, order: 5 },
              { id: 'm-k-6', name: 'Tank Top / Undergarments', slug: 'mens-undergarments', isActive: true, order: 6 },
              { id: 'm-k-7', name: 'Boxershorts', slug: 'mens-boxershorts', isActive: true, order: 7 },
              { id: 'm-k-8', name: 'Swimwear', slug: 'mens-knit-swimwear', isActive: true, order: 8 },
              { id: 'm-k-9', name: 'Sportswear / Activewear', slug: 'mens-knit-sportswear', isActive: true, order: 9 },
              { id: 'm-k-10', name: 'Nightwear / Sleepwear', slug: 'mens-knit-nightwear', isActive: true, order: 10 },
              { id: 'm-k-11', name: 'Workwear / Uniforms', slug: 'mens-knit-workwear', isActive: true, order: 11 },
              { id: 'm-k-12', name: 'Thermal Wear', slug: 'mens-thermal-wear', isActive: true, order: 12 },
            ],
          },
          {
            id: 'men-flat-knit',
            name: 'Flat Knit Items',
            slug: 'men-flat-knit',
            badge: 'Sweaters & Knitwear',
            items: [
              { id: 'm-s-1', name: 'Sweaters / Cardigans', slug: 'mens-sweaters-cardigans', isActive: true, order: 1 },
              { id: 'm-s-2', name: 'Pullovers / Jumpers', slug: 'mens-pullover', isActive: true, order: 2 },
              { id: 'm-s-3', name: 'Cardigans / Jackets', slug: 'mens-cardigans-jackets', isActive: true, order: 3 },
              { id: 'm-s-4', name: 'Ponchos', slug: 'mens-poncho', isActive: true, order: 4 },
              { id: 'm-s-5', name: 'Muffler / Scarf', slug: 'mens-muffler', isActive: true, order: 5 },
            ],
          },
          {
            id: 'men-woven',
            name: 'Woven Items',
            slug: 'men-woven',
            badge: 'Tailored & Casual',
            items: [
              { id: 'm-w-1', name: 'Jacket/Vest', slug: 'mens-woven-jacket-vest', isActive: true, order: 1 },
              { id: 'm-w-2', name: 'Coat / Blazer', slug: 'mens-coat-blazer', isActive: true, order: 2 },
              { id: 'm-w-3', name: 'Shirt / Casual Shirts', slug: 'mens-shirt', isActive: true, order: 3 },
              { id: 'm-w-4', name: 'Pant / Jeans / Chinos', slug: 'mens-pant', isActive: true, order: 4 },
              { id: 'm-w-5', name: "Bermuda's / Shorts", slug: 'mens-bermudas-shorts', isActive: true, order: 5 },
              { id: 'm-w-6', name: 'Swimwear', slug: 'mens-woven-swimwear', isActive: true, order: 6 },
              { id: 'm-w-7', name: 'Boxershorts / Undergarments', slug: 'mens-woven-boxershorts', isActive: true, order: 7 },
              { id: 'm-w-8', name: 'Sportswear', slug: 'mens-woven-sportswear', isActive: true, order: 8 },
              { id: 'm-w-9', name: 'Nightwear / Sleepwear', slug: 'mens-woven-nightwear', isActive: true, order: 9 },
              { id: 'm-w-10', name: 'Workwear / Suits', slug: 'mens-woven-workwear', isActive: true, order: 10 },
              { id: 'm-w-11', name: 'Uniform / School Uniform', slug: 'mens-woven-uniform', isActive: true, order: 11 },
            ],
          },
        ],
      },
      {
        id: 'womens-fashion',
        name: "WOMEN'S FASHION",
        slug: 'womens-fashion',
        groups: [
          {
            id: 'women-circular-knit',
            name: 'Circular Knit Items',
            slug: 'women-circular-knit',
            badge: 'Cut & Sew Knits',
            items: [
              { id: 'w-k-1', name: 'T-Shirt', slug: 'womens-t-shirt', isActive: true, order: 1 },
              { id: 'w-k-2', name: 'Polo-Shirt', slug: 'womens-polo-shirt', isActive: true, order: 2 },
              { id: 'w-k-3', name: 'Sweatshirt / Hoodie', slug: 'womens-sweatshirt', isActive: true, order: 3 },
              { id: 'w-k-4', name: 'Jacket/Vest', slug: 'womens-knit-jacket-vest', isActive: true, order: 4 },
              { id: 'w-k-5', name: 'Dress', slug: 'womens-knit-dress', isActive: true, order: 5 },
              { id: 'w-k-6', name: 'Trouser / Pyjama / Leggings', slug: 'womens-trouser-pyjama-skirt', isActive: true, order: 6 },
              { id: 'w-k-7', name: 'Jumpsuits / Overalls', slug: 'womens-jumpsuits-overalls', isActive: true, order: 7 },
              { id: 'w-k-8', name: 'Swimwear', slug: 'womens-knit-swimwear', isActive: true, order: 8 },
              { id: 'w-k-9', name: 'Undergarments', slug: 'womens-undergarments', isActive: true, order: 9 },
              { id: 'w-k-10', name: 'Sportswear / Activewear', slug: 'womens-knit-sportswear', isActive: true, order: 10 },
              { id: 'w-k-11', name: 'Nightwear / Sleepwear', slug: 'womens-knit-nightwear', isActive: true, order: 11 },
              { id: 'w-k-12', name: 'Thermal Wear', slug: 'womens-thermal-wear', isActive: true, order: 12 },
            ],
          },
          {
            id: 'women-flat-knit',
            name: 'Flat Knit Items',
            slug: 'women-flat-knit',
            badge: 'Sweaters & Knitwear',
            items: [
              { id: 'w-s-1', name: 'Sweaters / Cardigans / Pullovers', slug: 'womens-sweaters-cardigans-pullovers', isActive: true, order: 1 },
              { id: 'w-s-2', name: 'Cut & sew', slug: 'womens-cut-and-sew', isActive: true, order: 2 },
              { id: 'w-s-3', name: 'Poncho', slug: 'womens-poncho', isActive: true, order: 3 },
              { id: 'w-s-4', name: 'Muffler / Scarf', slug: 'womens-muffler', isActive: true, order: 4 },
            ],
          },
          {
            id: 'women-woven',
            name: 'Woven Items',
            slug: 'women-woven',
            badge: 'Tailored & Casual',
            items: [
              { id: 'w-w-1', name: 'Jacket/Vest', slug: 'womens-woven-jacket-vest', isActive: true, order: 1 },
              { id: 'w-w-2', name: 'Coat / Blazer', slug: 'womens-coat-blazer', isActive: true, order: 2 },
              { id: 'w-w-3', name: 'Shirt / Blouse', slug: 'womens-shirt-blouse', isActive: true, order: 3 },
              { id: 'w-w-4', name: 'Pant / Jeans / Trousers', slug: 'womens-pant-skirt', isActive: true, order: 4 },
              { id: 'w-w-5', name: "Bermuda's / Shorts", slug: 'womens-bermudas-shorts', isActive: true, order: 5 },
              { id: 'w-w-6', name: 'Dress / Skirt', slug: 'womens-woven-dress', isActive: true, order: 6 },
              { id: 'w-w-7', name: 'Swimwear', slug: 'womens-woven-swimwear', isActive: true, order: 7 },
              { id: 'w-w-8', name: 'Boxershorts / Lingerie', slug: 'womens-woven-boxershorts', isActive: true, order: 8 },
              { id: 'w-w-9', name: 'Sportswear', slug: 'womens-woven-sportswear', isActive: true, order: 9 },
              { id: 'w-w-10', name: 'Nightwear / Sleepwear', slug: 'womens-woven-nightwear', isActive: true, order: 10 },
              { id: 'w-w-11', name: 'Workwear / Uniforms', slug: 'womens-woven-uniform', isActive: true, order: 11 },
            ],
          },
        ],
      },
      {
        id: 'childrens-fashion',
        name: "CHILDREN'S FASHION",
        slug: 'childrens-fashion',
        groups: [
          {
            id: 'kids-circular-knit',
            name: 'Circular Knit Items',
            slug: 'kids-circular-knit',
            badge: 'Cut & Sew Knits',
            items: [
              { id: 'k-k-1', name: 'T-Shirt', slug: 'kids-t-shirt', isActive: true, order: 1 },
              { id: 'k-k-2', name: 'Polo-Shirt', slug: 'kids-polo-shirt', isActive: true, order: 2 },
              { id: 'k-k-3', name: 'Sweatshirt / Hoodie', slug: 'kids-sweatshirt', isActive: true, order: 3 },
              { id: 'k-k-4', name: 'Jacket/Vest', slug: 'kids-knit-jacket-vest', isActive: true, order: 4 },
              { id: 'k-k-5', name: 'Pant / Legging / Jogger', slug: 'kids-pant-legging-skirt', isActive: true, order: 5 },
              { id: 'k-k-6', name: 'Romper / Bodysuit', slug: 'kids-romper', isActive: true, order: 6 },
              { id: 'k-k-7', name: 'Dress', slug: 'kids-knit-dress', isActive: true, order: 7 },
              { id: 'k-k-8', name: 'Sportswear', slug: 'kids-knit-sportswear', isActive: true, order: 8 },
              { id: 'k-k-9', name: 'Nightwear / Sleepwear', slug: 'kids-knit-nightwear', isActive: true, order: 9 },
              { id: 'k-k-10', name: 'Thermal Wear', slug: 'kids-thermal-wear', isActive: true, order: 10 },
            ],
          },
          {
            id: 'kids-flat-knit',
            name: 'Flat Knit Items',
            slug: 'kids-flat-knit',
            badge: 'Sweaters & Knitwear',
            items: [
              { id: 'k-s-1', name: 'Sweaters / Cardigans / Pullovers', slug: 'kids-sweaters-cardigans-pullovers', isActive: true, order: 1 },
              { id: 'k-s-2', name: 'Cut & sew', slug: 'kids-cut-and-sew', isActive: true, order: 2 },
              { id: 'k-s-3', name: 'Poncho', slug: 'kids-poncho', isActive: true, order: 3 },
              { id: 'k-s-4', name: 'Muffler / Scarf', slug: 'kids-muffler', isActive: true, order: 4 },
            ],
          },
          {
            id: 'kids-woven',
            name: 'Woven Items',
            slug: 'kids-woven',
            badge: 'Tailored & Casual',
            items: [
              { id: 'k-w-1', name: 'Jacket/Vest', slug: 'kids-woven-jacket-vest', isActive: true, order: 1 },
              { id: 'k-w-2', name: 'Coat / Blazer', slug: 'kids-coat-blazer', isActive: true, order: 2 },
              { id: 'k-w-3', name: 'Shirt / Blouse', slug: 'kids-shirt-blouse', isActive: true, order: 3 },
              { id: 'k-w-4', name: 'Pant / Jeans / Trousers', slug: 'kids-pant-skirt', isActive: true, order: 4 },
              { id: 'k-w-5', name: "Bermuda's / Shorts", slug: 'kids-bermudas-shorts', isActive: true, order: 5 },
              { id: 'k-w-6', name: 'Swimwear', slug: 'kids-woven-swimwear', isActive: true, order: 6 },
              { id: 'k-w-7', name: 'Dress / Skirt', slug: 'kids-woven-dress', isActive: true, order: 7 },
              { id: 'k-w-8', name: 'Boxer / Undergarments', slug: 'kids-woven-boxershorts', isActive: true, order: 8 },
              { id: 'k-w-9', name: 'Nightwear / Sleepwear', slug: 'kids-woven-nightwear', isActive: true, order: 9 },
              { id: 'k-w-10', name: 'School Uniform', slug: 'kids-woven-uniform', isActive: true, order: 10 },
              { id: 'k-w-11', name: 'Sportswear', slug: 'kids-woven-sportswear', isActive: true, order: 11 },
            ],
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 2. HOMETEXTILES
  // ─────────────────────────────────────────────────────────────
  {
    id: 'hometextiles',
    name: 'HOME TEXTILES',
    slug: 'hometextiles',
    tagline: 'Premium Terry Towels, Luxury Bedding Sets & Engineered Curtains',
    departments: [
      {
        id: 'home-all',
        name: 'HOME COLLECTIONS',
        slug: 'home-collections',
        groups: [
          {
            id: 'towel',
            name: 'TOWEL',
            slug: 'towel',
            badge: '100% Combed Cotton',
            items: [
              { id: 'ht-t-1', name: 'Face Towel', slug: 'face-towel', isActive: true, order: 1 },
              { id: 'ht-t-2', name: 'Hand Towel', slug: 'hand-towel', isActive: true, order: 2 },
              { id: 'ht-t-3', name: 'Bath Towel', slug: 'bath-towel', isActive: true, order: 3 },
              { id: 'ht-t-4', name: 'Bath Mat', slug: 'bath-mat', isActive: true, order: 4 },
              { id: 'ht-t-5', name: 'Bath Sheet', slug: 'bath-sheet', isActive: true, order: 5 },
              { id: 'ht-t-6', name: 'Kitchen Towel', slug: 'kitchen-towel', isActive: true, order: 6 },
              { id: 'ht-t-7', name: 'Bar Mop', slug: 'bar-mop', isActive: true, order: 7 },
              { id: 'ht-t-8', name: 'Beach Towel', slug: 'beach-towel', isActive: true, order: 8 },
              { id: 'ht-t-9', name: 'Bath Robe', slug: 'bath-robe', isActive: true, order: 9 },
              { id: 'ht-t-10', name: 'Stripe Towel', slug: 'stripe-towel', isActive: true, order: 10 },
              { id: 'ht-t-11', name: 'Embroidered Towel', slug: 'embroidered-towel', isActive: true, order: 11 },
              { id: 'ht-t-12', name: 'Shower Curtain', slug: 'shower-curtain', isActive: true, order: 12 },
            ],
          },
          {
            id: 'bedding',
            name: 'BEDDING',
            slug: 'bedding',
            badge: 'Percale & Sateen Weaves',
            items: [
              { id: 'ht-b-1', name: 'Duvet Cover', slug: 'duvet-cover', isActive: true, order: 1 },
              { id: 'ht-b-2', name: 'Pillowcases', slug: 'pillowcases', isActive: true, order: 2 },
              { id: 'ht-b-3', name: 'Valance Sheets', slug: 'valance-sheets', isActive: true, order: 3 },
              { id: 'ht-b-4', name: 'Flat Sheets', slug: 'flat-sheets', isActive: true, order: 4 },
              { id: 'ht-b-5', name: 'Fitted Sheets', slug: 'fitted-sheets', isActive: true, order: 5 },
              { id: 'ht-b-6', name: 'Bed in a Bag', slug: 'bed-in-a-bag', isActive: true, order: 6 },
              { id: 'ht-b-7', name: 'Bed Spreads', slug: 'bed-spreads', isActive: true, order: 7 },
              { id: 'ht-b-8', name: 'Bed Skirts', slug: 'bed-skirts', isActive: true, order: 8 },
              { id: 'ht-b-9', name: 'Comforters & Spreads', slug: 'comforters', isActive: true, order: 9 },
              { id: 'ht-b-10', name: 'Bean Bags', slug: 'bean-bags', isActive: true, order: 10 },
              { id: 'ht-b-11', name: 'Cushion Covers', slug: 'cushion-covers', isActive: true, order: 11 },
              { id: 'ht-b-12', name: 'Sleeping Bags', slug: 'sleeping-bags', isActive: true, order: 12 },
            ],
          },
          {
            id: 'curtain',
            name: 'CURTAIN',
            slug: 'curtain',
            badge: 'Blackout & Sheer Finishes',
            items: [
              { id: 'ht-c-1', name: 'Ring / Eyelet Curtains', slug: 'ring-eyelet-curtains', isActive: true, order: 1 },
              { id: 'ht-c-2', name: 'Pleated Curtains', slug: 'pleated-curtains', isActive: true, order: 2 },
              { id: 'ht-c-3', name: 'Tab Top Curtains', slug: 'tab-top-curtains', isActive: true, order: 3 },
              { id: 'ht-c-4', name: 'Belt Top Curtains', slug: 'belt-top-curtains', isActive: true, order: 4 },
              { id: 'ht-c-5', name: 'Lined Curtains', slug: 'lined-curtains', isActive: true, order: 5 },
              { id: 'ht-c-6', name: 'Unlined Curtains', slug: 'unlined-curtains', isActive: true, order: 6 },
              { id: 'ht-c-7', name: 'Lined / Unlined Curtains', slug: 'lined-unlined-curtains', isActive: true, order: 7 },
              { id: 'ht-c-8', name: 'Window Panel & Valences', slug: 'window-panel-valences', isActive: true, order: 8 },
            ],
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 3. FOOTWEAR
  // ─────────────────────────────────────────────────────────────
  {
    id: 'footwear',
    name: 'FOOTWEAR',
    slug: 'footwear',
    tagline: 'Authentic Jute Sole Espadrilles & Casual Footwear',
    departments: [
      {
        id: 'footwear-collections',
        name: 'FOOTWEAR COLLECTIONS',
        slug: 'footwear-collections',
        groups: [
          {
            id: 'basic-espadrilles',
            name: 'BASIC ESPADRILLES',
            slug: 'basic-espadrilles',
            badge: 'Classic Canvas & Jute',
            items: [
              { id: 'fw-1', name: 'Classic Canvas Espadrille', slug: 'classic-canvas-espadrille', isActive: true, order: 1 },
              { id: 'fw-2', name: 'Slip-on Flat Espadrille', slug: 'slip-on-flat-espadrille', isActive: true, order: 2 },
              { id: 'fw-3', name: 'Lace-Up Espadrille', slug: 'lace-up-espadrille', isActive: true, order: 3 },
            ],
          },
          {
            id: 'fashion-espadrilles',
            name: 'FASHION ESPADRILLES',
            slug: 'fashion-espadrilles',
            badge: 'Platform & Leather Accent',
            items: [
              { id: 'fw-4', name: 'Wedge Platform Espadrille', slug: 'wedge-platform-espadrille', isActive: true, order: 1 },
              { id: 'fw-5', name: 'Embroidered Ribbon Espadrille', slug: 'embroidered-espadrille', isActive: true, order: 2 },
              { id: 'fw-6', name: 'Open Toe Ribbon Espadrille', slug: 'open-toe-ribbon-espadrille', isActive: true, order: 3 },
            ],
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 4. ACCESSORIES
  // ─────────────────────────────────────────────────────────────
  {
    id: 'accessories',
    name: 'ACCESSORIES',
    slug: 'accessories',
    tagline: 'Export Fashion Accessories, Knit Scarves, Gloves, Socks & Packaging',
    departments: [
      {
        id: 'accessories-collections',
        name: 'ACCESSORY COLLECTIONS',
        slug: 'accessory-collections',
        groups: [
          {
            id: 'fashion-accessories',
            name: 'FASHION ACCESSORIES',
            slug: 'fashion-accessories',
            badge: 'Winter & All-Season',
            items: [
              { id: 'acc-1', name: 'Scarves', slug: 'scarves', isActive: true, order: 1 },
              { id: 'acc-2', name: 'Hats / Caps', slug: 'hats-caps', isActive: true, order: 2 },
              { id: 'acc-3', name: 'Gloves', slug: 'gloves', isActive: true, order: 3 },
              { id: 'acc-4', name: 'Socks', slug: 'socks', isActive: true, order: 4 },
              { id: 'acc-5', name: 'Gift Box', slug: 'gift-box', isActive: true, order: 5 },
            ],
          },
        ],
      },
    ],
  },
];

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => {
      if (word.startsWith("men's")) return "Men's" + word.slice(5);
      if (word.startsWith("women's")) return "Women's" + word.slice(7);
      if (word.startsWith("children's")) return "Children's" + word.slice(10);
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Transforms the comprehensive taxonomy into the exact hierarchical format
 * used by ProductFilter (Matches the user's Department & Category sidebar).
 */
export function getFilterMainCategories(): FilterMainCategory[] {
  const fashionDiv = DEFAULT_CATALOG_TAXONOMY.find(d => d.id === 'fashion');
  const homeDiv = DEFAULT_CATALOG_TAXONOMY.find(d => d.id === 'hometextiles');
  const footwearDiv = DEFAULT_CATALOG_TAXONOMY.find(d => d.id === 'footwear');
  const accDiv = DEFAULT_CATALOG_TAXONOMY.find(d => d.id === 'accessories');

  return [
    {
      name: 'Fashion',
      slug: 'fashion',
      subcategories: (fashionDiv?.departments || []).map(dept => ({
        name: toTitleCase(dept.name),
        slug: dept.slug,
        groups: dept.groups.map(grp => ({
          name: grp.name,
          slug: grp.slug,
          // Granular items hidden from filter list per client instructions
          items: []
        }))
      }))
    },
    {
      name: 'Home Textiles',
      slug: 'hometextiles',
      subcategories: (homeDiv?.departments[0]?.groups || []).map(grp => ({
        name: toTitleCase(grp.name),
        slug: grp.slug,
        items: []
      }))
    },
    {
      name: 'Footwear',
      slug: 'footwear',
      subcategories: (footwearDiv?.departments[0]?.groups || []).map(grp => ({
        name: toTitleCase(grp.name),
        slug: grp.slug,
        items: []
      }))
    },
    {
      name: 'Accessories',
      slug: 'accessories',
      subcategories: (accDiv?.departments[0]?.groups[0]?.items || []).map(it => ({
        name: it.name,
        slug: it.slug
      }))
    }
  ];
}

/**
 * Collects all matching/descendant slugs for any selected category slug
 * so products assigned to children/descendants appear when parent is selected.
 */
export function getAllDescendantSlugs(targetSlug: string): string[] {
  const norm = targetSlug.toLowerCase().trim();
  const results = new Set<string>([norm]);

  // Common aliases & division umbrellas
  if (norm === 'fashion') {
    results.add('apparel');
    results.add('garments');
    results.add('knitwear');
    results.add('woven');
    results.add('sweater');
    results.add('mens-fashion');
    results.add('womens-fashion');
    results.add('childrens-fashion');
    results.add('men-circular-knit');
    results.add('men-flat-knit');
    results.add('men-woven');
    results.add('women-circular-knit');
    results.add('women-flat-knit');
    results.add('women-woven');
    results.add('kids-circular-knit');
    results.add('kids-flat-knit');
    results.add('kids-woven');
    results.add('knitwear-mens');
    results.add('knitwear-womens');
    results.add('knitwear-kids');
    results.add('woven-mens');
    results.add('woven-womens');
    results.add('woven-kids');
    results.add('sweater-mens');
    results.add('sweater-womens');
    results.add('sweater-kids');
  } else if (norm === 'men-circular-knit' || norm === 'men-knit-fashion' || norm === 'knitwear-mens') {
    results.add('men-circular-knit');
    results.add('men-knit-fashion');
    results.add('knitwear-mens');
    results.add('mens-t-shirt');
    results.add('mens-polo-shirt');
    results.add('mens-sweatshirt');
    results.add('mens-knit-jacket-vest');
    results.add('mens-trousers-joggers');
    results.add('mens-undergarments');
    results.add('mens-boxershorts');
    results.add('mens-knit-swimwear');
    results.add('mens-knit-sportswear');
    results.add('mens-knit-nightwear');
    results.add('mens-knit-workwear');
    results.add('mens-thermal-wear');
  } else if (norm === 'women-circular-knit' || norm === 'women-knit-fashion' || norm === 'knitwear-womens') {
    results.add('women-circular-knit');
    results.add('women-knit-fashion');
    results.add('knitwear-womens');
    results.add('womens-t-shirt');
    results.add('womens-polo-shirt');
    results.add('womens-sweatshirt');
    results.add('womens-knit-jacket-vest');
    results.add('womens-knit-dress');
    results.add('womens-trouser-pyjama-skirt');
    results.add('womens-jumpsuits-overalls');
    results.add('womens-knit-swimwear');
    results.add('womens-undergarments');
    results.add('womens-knit-sportswear');
    results.add('womens-knit-nightwear');
    results.add('womens-thermal-wear');
  } else if (norm === 'kids-circular-knit' || norm === 'kids-knit-fashion' || norm === 'knitwear-kids') {
    results.add('kids-circular-knit');
    results.add('kids-knit-fashion');
    results.add('knitwear-kids');
    results.add('kids-t-shirt');
    results.add('kids-polo-shirt');
    results.add('kids-sweatshirt');
    results.add('kids-knit-jacket-vest');
    results.add('kids-pant-legging-skirt');
    results.add('kids-romper');
    results.add('kids-knit-dress');
    results.add('kids-knit-sportswear');
    results.add('kids-knit-nightwear');
    results.add('kids-thermal-wear');
  } else if (norm === 'men-flat-knit' || norm === 'men-sweater-fashion' || norm === 'sweater-mens') {
    results.add('men-flat-knit');
    results.add('men-sweater-fashion');
    results.add('sweater-mens');
    results.add('mens-sweaters-cardigans');
    results.add('mens-pullover');
    results.add('mens-cardigans-jackets');
    results.add('mens-poncho');
    results.add('mens-muffler');
  } else if (norm === 'women-flat-knit' || norm === 'women-sweater-fashion' || norm === 'sweater-womens') {
    results.add('women-flat-knit');
    results.add('women-sweater-fashion');
    results.add('sweater-womens');
    results.add('womens-sweaters-cardigans-pullovers');
    results.add('womens-cut-and-sew');
    results.add('womens-poncho');
    results.add('womens-muffler');
  } else if (norm === 'kids-flat-knit' || norm === 'kids-sweater-fashion' || norm === 'sweater-kids') {
    results.add('kids-flat-knit');
    results.add('kids-sweater-fashion');
    results.add('sweater-kids');
    results.add('kids-sweaters-cardigans-pullovers');
    results.add('kids-cut-and-sew');
    results.add('kids-poncho');
    results.add('kids-muffler');
  } else if (norm === 'men-woven' || norm === 'men-woven-fashion' || norm === 'woven-mens') {
    results.add('men-woven');
    results.add('men-woven-fashion');
    results.add('woven-mens');
    results.add('mens-woven-jacket-vest');
    results.add('mens-coat-blazer');
    results.add('mens-shirt');
    results.add('mens-pant');
    results.add('mens-bermudas-shorts');
    results.add('mens-woven-swimwear');
    results.add('mens-woven-boxershorts');
    results.add('mens-woven-sportswear');
    results.add('mens-woven-nightwear');
    results.add('mens-woven-workwear');
    results.add('mens-woven-uniform');
  } else if (norm === 'women-woven' || norm === 'women-woven-fashion' || norm === 'woven-womens') {
    results.add('women-woven');
    results.add('women-woven-fashion');
    results.add('woven-womens');
    results.add('womens-woven-jacket-vest');
    results.add('womens-coat-blazer');
    results.add('womens-shirt-blouse');
    results.add('womens-pant-skirt');
    results.add('womens-bermudas-shorts');
    results.add('womens-woven-dress');
    results.add('womens-woven-swimwear');
    results.add('womens-woven-boxershorts');
    results.add('womens-woven-sportswear');
    results.add('womens-woven-nightwear');
    results.add('womens-woven-uniform');
  } else if (norm === 'kids-woven' || norm === 'kids-woven-fashion' || norm === 'woven-kids') {
    results.add('kids-woven');
    results.add('kids-woven-fashion');
    results.add('woven-kids');
    results.add('kids-woven-jacket-vest');
    results.add('kids-coat-blazer');
    results.add('kids-shirt-blouse');
    results.add('kids-pant-skirt');
    results.add('kids-bermudas-shorts');
    results.add('kids-woven-swimwear');
    results.add('kids-woven-dress');
    results.add('kids-woven-boxershorts');
    results.add('kids-woven-nightwear');
    results.add('kids-woven-uniform');
    results.add('kids-woven-sportswear');
  } else if (norm === 'hometextiles' || norm === 'home-textiles') {
    results.add('hometextiles');
    results.add('home-textiles');
    results.add('towel');
    results.add('bedding');
    results.add('curtain');
  } else if (norm === 'footwear') {
    results.add('footwear');
    results.add('shoes');
    results.add('basic-espadrilles');
    results.add('fashion-espadrilles');
  } else if (norm === 'accessories') {
    results.add('accessories');
    results.add('scarves');
    results.add('hats-caps');
    results.add('gloves');
    results.add('socks');
    results.add('gift-box');
  }

  // Recursive search in taxonomy
  for (const div of DEFAULT_CATALOG_TAXONOMY) {
    const divMatch = div.slug === norm || div.id === norm;
    if (divMatch) {
      div.departments.forEach(dept => {
        results.add(dept.slug);
        dept.groups.forEach(grp => {
          results.add(grp.slug);
          grp.items.forEach(it => results.add(it.slug));
        });
      });
      continue;
    }

    for (const dept of div.departments) {
      const deptMatch = dept.slug === norm || dept.id === norm;
      if (deptMatch) {
        dept.groups.forEach(grp => {
          results.add(grp.slug);
          grp.items.forEach(it => results.add(it.slug));
        });
        continue;
      }

      for (const grp of dept.groups) {
        const grpMatch = grp.slug === norm || grp.id === norm;
        if (grpMatch) {
          grp.items.forEach(it => results.add(it.slug));
          continue;
        }

        for (const it of grp.items) {
          if (it.slug === norm || it.id === norm) {
            results.add(it.slug);
          }
        }
      }
    }
  }

  return Array.from(results);
}

export interface CategoryFilterCandidate {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
}

/**
 * Builds a robust Prisma filter object for category matching.
 * Handles:
 * - Umbrella categories (Fashion, Home Textiles, Footwear, Accessories)
 * - Canonical & descendant slugs from taxonomy and database tree
 * - Suffix-tolerant slugs (e.g. `womens-sweatshirt-9635` matches `womens-sweatshirt`)
 * - Product subCategory, department, and divisionType fields
 * - Gender exclusivity (Men's vs Women's)
 */
export function buildCategoryPrismaFilter(
  targetSlug: string,
  categories: CategoryFilterCandidate[]
): any {
  const norm = targetSlug.toLowerCase().trim();
  const taxonomySlugs = getAllDescendantSlugs(norm);

  // Collect DB descendant slugs
  const targetCat = categories.find(c => c.slug.toLowerCase() === norm);
  const dbSlugs: string[] = [];
  if (targetCat) {
    const collect = (id: string) => {
      categories.filter(c => c.parentId === id).forEach(child => {
        dbSlugs.push(child.slug);
        collect(child.id);
      });
    };
    collect(targetCat.id);
  }

  // Suffix-agnostic slug matching (e.g. womens-sweatshirt-9635 -> womens-sweatshirt)
  const suffixMatches = categories
    .filter(c => {
      const base = c.slug.toLowerCase().replace(/-\d+$/, '');
      return base === norm || taxonomySlugs.includes(base) || c.slug.toLowerCase().startsWith(norm);
    })
    .map(c => c.slug);

  const allSlugs = Array.from(new Set([...taxonomySlugs, ...dbSlugs, ...suffixMatches, norm]));
  const matchedCategoryIds = categories.filter(c => allSlugs.includes(c.slug)).map(c => c.id);

  const orConditions: any[] = [
    { category: { slug: { in: allSlugs } } },
    { categoryId: { in: matchedCategoryIds } },
    { subCategory: { contains: norm } },
    { tags: { contains: norm } },
  ];

  // 1. Fashion Umbrella
  if (norm === 'fashion' || norm === 'apparel' || norm === 'garments') {
    orConditions.push(
      { divisionType: { in: ['Knit', 'Woven', 'Sweater', 'knit', 'woven', 'sweater'] } },
      { department: { in: ['Menswear', 'Womenswear', 'Kidswear', 'Men', 'Women', 'Kids'] } },
      { category: { name: { contains: 'shirt' } } },
      { category: { name: { contains: 'sweat' } } },
      { category: { name: { contains: 'knit' } } },
      { category: { name: { contains: 'woven' } } },
      { category: { name: { contains: 'polo' } } },
      { category: { name: { contains: 'dress' } } },
      { category: { name: { contains: 'fashion' } } },
      { category: { name: { contains: 'apparel' } } }
    );
    return { OR: orConditions };
  }

  // 2. Sweatshirt / Hoodie matching
  if (norm.includes('sweatshirt') || norm.includes('hoodie')) {
    orConditions.push(
      { name: { contains: 'Sweatshirt' } },
      { name: { contains: 'sweatshirt' } },
      { name: { contains: 'Hoodie' } },
      { name: { contains: 'hoodie' } },
      { subCategory: { contains: 'sweatshirt' } },
      { subCategory: { contains: 'hoodie' } },
      { category: { name: { contains: 'sweatshirt' } } },
      { category: { slug: { contains: 'sweatshirt' } } },
      { category: { name: { contains: 'hoodie' } } },
      { category: { slug: { contains: 'hoodie' } } }
    );
  }

  // 3. T-Shirt / Tee matching (exclude 'sweat' since 'sweatshirt' contains 'tshirt')
  const isTshirtQuery = !norm.includes('sweat') && (norm.includes('t-shirt') || norm.includes('tshirt') || norm.endsWith('tee') || norm.includes('tee-') || norm.includes('t-shirts'));
  if (isTshirtQuery) {
    orConditions.push(
      { name: { contains: 'T-Shirt' } },
      { name: { contains: 't-shirt' } },
      { name: { contains: 'Tee' } },
      { name: { contains: 'tee' } },
      { subCategory: { contains: 't-shirt' } },
      { category: { name: { contains: 't-shirt' } } },
      { category: { slug: { contains: 't-shirt' } } },
      { category: { slug: { contains: 'tshirt' } } }
    );
  }

  // 4. Polo
  if (norm.includes('polo')) {
    orConditions.push(
      { name: { contains: 'Polo' } },
      { name: { contains: 'polo' } },
      { subCategory: { contains: 'polo' } },
      { category: { name: { contains: 'polo' } } },
      { category: { slug: { contains: 'polo' } } }
    );
  }

  // 5. Dress
  if (norm.includes('dress')) {
    orConditions.push(
      { name: { contains: 'Dress' } },
      { name: { contains: 'dress' } },
      { subCategory: { contains: 'dress' } },
      { category: { name: { contains: 'dress' } } }
    );
  }

  // 6. Towel / Home Textiles
  if (norm.includes('towel') || norm.includes('hometextiles')) {
    orConditions.push(
      { name: { contains: 'Towel' } },
      { name: { contains: 'towel' } },
      { category: { name: { contains: 'towel' } } },
      { category: { slug: { contains: 'towel' } } },
      { divisionType: 'Home Textiles' }
    );
  }

  // 7. Footwear / Espadrille
  if (norm.includes('footwear') || norm.includes('espadrille') || norm.includes('shoes')) {
    orConditions.push(
      { name: { contains: 'Espadrille' } },
      { name: { contains: 'espadrille' } },
      { category: { name: { contains: 'espadrille' } } },
      { category: { slug: { contains: 'espadrille' } } },
      { divisionType: 'Footwear' }
    );
  }

  // 8. Accessories
  if (norm.includes('accessories') || norm.includes('scarf') || norm.includes('hat') || norm.includes('glove') || norm.includes('socks')) {
    orConditions.push(
      { divisionType: 'Accessories' },
      { category: { name: { contains: 'accessories' } } },
      { category: { slug: { contains: 'accessories' } } }
    );
  }

  // Circular Knit matching
  if (norm.includes('circular-knit') || norm.includes('knit')) {
    orConditions.push(
      { divisionType: { in: ['Knit', 'knit'] } },
      { category: { name: { contains: 'knit' } } },
      { category: { slug: { contains: 'knit' } } },
      { subCategory: { contains: 'knit' } },
      { name: { contains: 'T-Shirt' } },
      { name: { contains: 'Polo' } },
      { name: { contains: 'Hoodie' } },
      { name: { contains: 'Sweatshirt' } },
      { name: { contains: 'Jogger' } }
    );
  }

  // Flat Knit matching (Sweaters, Cardigans, Pullovers)
  if (norm.includes('flat-knit') || norm.includes('sweater')) {
    orConditions.push(
      { divisionType: { in: ['Sweater', 'sweater'] } },
      { category: { name: { contains: 'sweater' } } },
      { category: { slug: { contains: 'sweater' } } },
      { subCategory: { contains: 'sweater' } },
      { name: { contains: 'Sweater' } },
      { name: { contains: 'Cardigan' } },
      { name: { contains: 'Pullover' } },
      { name: { contains: 'Jumper' } },
      { name: { contains: 'Poncho' } }
    );
  }

  // Woven matching
  if (norm.includes('woven')) {
    orConditions.push(
      { divisionType: { in: ['Woven', 'woven'] } },
      { category: { name: { contains: 'woven' } } },
      { category: { slug: { contains: 'woven' } } },
      { subCategory: { contains: 'woven' } },
      { name: { contains: 'Shirt' } },
      { name: { contains: 'Blazer' } },
      { name: { contains: 'Jacket' } },
      { name: { contains: 'Pant' } },
      { name: { contains: 'Chino' } },
      { name: { contains: 'Denim' } }
    );
  }

  const isExplicitWomen = norm.includes('women');
  const isExplicitMen = norm.includes('men') && !norm.includes('women');
  const isExplicitKids = norm.includes('kids') || norm.includes('children');

  const baseFilter = { OR: orConditions };

  if (isExplicitKids) {
    return {
      AND: [
        baseFilter,
        {
          OR: [
            { name: { contains: 'Kids' } },
            { name: { contains: 'kids' } },
            { name: { contains: 'Child' } },
            { name: { contains: 'children' } },
            { category: { name: { contains: 'kids' } } },
            { category: { slug: { contains: 'kids' } } },
            { subCategory: { contains: 'kids' } },
            { department: 'Kidswear' }
          ]
        }
      ]
    };
  }

  if (isExplicitWomen) {
    return {
      AND: [
        baseFilter,
        {
          OR: [
            { name: { contains: 'Women' } },
            { name: { contains: 'women' } },
            { category: { name: { contains: 'women' } } },
            { category: { slug: { contains: 'women' } } },
            { subCategory: { contains: 'women' } },
          ]
        }
      ]
    };
  }

  if (isExplicitMen) {
    return {
      AND: [
        baseFilter,
        {
          NOT: [
            { name: { contains: 'Women' } },
            { name: { contains: 'women' } },
            { category: { name: { contains: 'women' } } },
            { category: { slug: { contains: 'women' } } },
            { subCategory: { contains: 'women' } },
          ]
        }
      ]
    };
  }

  return baseFilter;
}

