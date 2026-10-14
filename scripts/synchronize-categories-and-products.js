const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Comprehensive Category & Product Synchronization ---');

  // 1. Ensure Root Divisions Exist
  const rootDivisions = [
    { name: 'Fashion', slug: 'fashion', description: 'Core Readymade Garments Division (Knitwear, Woven & Sweaters)' },
    { name: 'Home Textiles', slug: 'hometextiles', description: 'Export Quality Home Textiles, Terry Towels, Bedding & Curtains' },
    { name: 'Footwear', slug: 'footwear', description: 'Export Footwear, Jute Espadrilles & Canvas Casuals' },
    { name: 'Accessories', slug: 'accessories', description: 'Garment Trims, Fashion Accessories, Scarves, Caps, Gloves, Socks & Packaging' },
  ];

  const divMap = new Map();
  for (const div of rootDivisions) {
    let cat = await prisma.category.findUnique({ where: { slug: div.slug } });
    if (!cat) {
      cat = await prisma.category.create({
        data: { name: div.name, slug: div.slug, description: div.description, parentId: null, isActive: true }
      });
      console.log(`Created root category: ${div.name}`);
    }
    divMap.set(div.slug, cat.id);
  }

  // 2. Ensure Key Subcategories Exist
  const subCategoriesToEnsure = [
    // Fashion Departments
    { name: "Men's Fashion", slug: 'mens-fashion', parentSlug: 'fashion', description: "Men's Garment Sourcing" },
    { name: "Women's Fashion", slug: 'womens-fashion', parentSlug: 'fashion', description: "Women's Garment Sourcing" },
    { name: "Children's Fashion", slug: 'childrens-fashion', parentSlug: 'fashion', description: "Children's & Kids Garment Sourcing" },
    
    // Men's Groups
    { name: 'Circular Knit Items', slug: 'men-circular-knit', parentSlug: 'mens-fashion', description: "Men's Cut & Sew Knits" },
    { name: 'Flat Knit Items', slug: 'men-flat-knit', parentSlug: 'mens-fashion', description: "Men's Sweaters & Flat Knits" },
    { name: 'Woven Items', slug: 'men-woven', parentSlug: 'mens-fashion', description: "Men's Tailored & Casual Wovens" },
    
    // Men's Items
    { name: 'T-Shirt', slug: 'mens-t-shirt', parentSlug: 'men-circular-knit', description: "Men's T-Shirts" },
    { name: 'Polo-Shirt', slug: 'mens-polo-shirt', parentSlug: 'men-circular-knit', description: "Men's Polo Shirts" },
    { name: 'Sweatshirt / Hoodie', slug: 'mens-sweatshirt', parentSlug: 'men-circular-knit', description: "Men's Sweatshirts & Hoodies" },
    { name: 'Jogger / Trousers', slug: 'mens-trousers-joggers', parentSlug: 'men-circular-knit', description: "Men's Knit Joggers" },
    { name: 'Sweaters / Cardigans', slug: 'mens-sweaters-cardigans', parentSlug: 'men-flat-knit', description: "Men's Sweaters" },
    { name: 'Pullovers / Jumpers', slug: 'mens-pullover', parentSlug: 'men-flat-knit', description: "Men's Pullovers" },
    { name: 'Shirt / Casual Shirts', slug: 'mens-shirt', parentSlug: 'men-woven', description: "Men's Casual & Formal Shirts" },
    { name: 'Pant / Jeans / Chinos', slug: 'mens-pant', parentSlug: 'men-woven', description: "Men's Pants, Jeans & Chinos" },
    { name: 'Coat / Blazer', slug: 'mens-coat-blazer', parentSlug: 'men-woven', description: "Men's Blazers & Overcoats" },
    { name: "Bermuda's / Shorts", slug: 'mens-bermudas-shorts', parentSlug: 'men-woven', description: "Men's Shorts & Bermudas" },

    // Women's Groups
    { name: 'Circular Knit Items', slug: 'women-circular-knit', parentSlug: 'womens-fashion', description: "Women's Cut & Sew Knits" },
    { name: 'Flat Knit Items', slug: 'women-flat-knit', parentSlug: 'womens-fashion', description: "Women's Sweaters & Knitwear" },
    { name: 'Woven Items', slug: 'women-woven', parentSlug: 'womens-fashion', description: "Women's Woven Apparel" },

    // Women's Items
    { name: 'T-Shirt', slug: 'womens-t-shirt', parentSlug: 'women-circular-knit', description: "Women's T-Shirts" },
    { name: 'Polo-Shirt', slug: 'womens-polo-shirt', parentSlug: 'women-circular-knit', description: "Women's Polo Shirts" },
    { name: 'Sweatshirt / Hoodie', slug: 'womens-sweatshirt', parentSlug: 'women-circular-knit', description: "Women's Hoodies" },
    { name: 'Dress', slug: 'womens-knit-dress', parentSlug: 'women-circular-knit', description: "Women's Knit Dresses" },
    { name: 'Tank Top / Undergarments', slug: 'womens-undergarments', parentSlug: 'women-circular-knit', description: "Women's Tanks & Undergarments" },
    { name: 'Sweaters / Cardigans / Pullovers', slug: 'womens-sweaters-cardigans-pullovers', parentSlug: 'women-flat-knit', description: "Women's Sweaters" },
    { name: 'Shirt / Blouse', slug: 'womens-shirt-blouse', parentSlug: 'women-woven', description: "Women's Blouses & Shirts" },
    { name: 'Pant / Jeans / Trousers', slug: 'womens-pant-skirt', parentSlug: 'women-woven', description: "Women's Woven Pants & Jeans" },
    { name: 'Coat / Blazer', slug: 'womens-coat-blazer', parentSlug: 'women-woven', description: "Women's Tailored Blazers" },

    // Children's Groups
    { name: 'Circular Knit Items', slug: 'kids-circular-knit', parentSlug: 'childrens-fashion', description: "Kids' Knit Apparel" },
    { name: 'Flat Knit Items', slug: 'kids-flat-knit', parentSlug: 'childrens-fashion', description: "Kids' Sweaters" },
    { name: 'Woven Items', slug: 'kids-woven', parentSlug: 'childrens-fashion', description: "Kids' Wovens" },

    // Kids' Items
    { name: 'Kids T-Shirts & Polos', slug: 'kids-knit-tshirt', parentSlug: 'kids-circular-knit', description: "Kids' T-Shirts" },
    { name: 'Kids Hoodies & Sets', slug: 'kids-knit-hoodie', parentSlug: 'kids-circular-knit', description: "Kids' Hoodies" },
    { name: 'Baby Rompers & Bodysuits', slug: 'kids-knit-romper', parentSlug: 'kids-circular-knit', description: "Baby Rompers" },
    { name: 'Kids Shirts & Tops', slug: 'kids-woven-shirt', parentSlug: 'kids-woven', description: "Kids' Woven Shirts" },
    { name: 'Kids Pants & Shorts', slug: 'kids-pant-skirt', parentSlug: 'kids-woven', description: "Kids' Jeans & Pants" },
    { name: 'Kids Sweaters', slug: 'kids-sweater', parentSlug: 'kids-flat-knit', description: "Kids' Sweaters" },

    // Home Textiles Subcategories
    { name: 'Towel', slug: 'towel', parentSlug: 'hometextiles', description: 'Terry Towels, Bath Mats & Kitchen Towels' },
    { name: 'Bedding', slug: 'bedding', parentSlug: 'hometextiles', description: 'Bed Sheets, Duvet Sets & Pillow Covers' },
    { name: 'Curtain', slug: 'curtain', parentSlug: 'hometextiles', description: 'Window Curtains, Blackouts & Drapes' },

    // Footwear Subcategories
    { name: 'Basic Espadrilles', slug: 'basic-espadrilles', parentSlug: 'footwear', description: 'Classic Jute-Sole Canvas Espadrilles' },
    { name: 'Fashion Espadrilles', slug: 'fashion-espadrilles', parentSlug: 'footwear', description: 'Printed, Striped & Leather Trim Espadrilles' },

    // Accessories Subcategories
    { name: 'Scarves', slug: 'scarves', parentSlug: 'accessories', description: 'Woven & Knitted Scarves & Mufflers' },
    { name: 'Hats & Caps', slug: 'hats-caps', parentSlug: 'accessories', description: 'Baseball Caps, Beanies & Bucket Hats' },
    { name: 'Gloves', slug: 'gloves', parentSlug: 'accessories', description: 'Knitted & Warm Winter Gloves' },
    { name: 'Socks', slug: 'socks', parentSlug: 'accessories', description: 'Crew, Ankle & Athletic Socks' },
    { name: 'Gift Box', slug: 'gift-box', parentSlug: 'accessories', description: 'Custom Export Rigid Packaging & Gift Boxes' },
  ];

  const catMap = new Map();
  for (const sub of subCategoriesToEnsure) {
    let parentId = null;
    if (sub.parentSlug) {
      if (divMap.has(sub.parentSlug)) {
        parentId = divMap.get(sub.parentSlug);
      } else if (catMap.has(sub.parentSlug)) {
        parentId = catMap.get(sub.parentSlug);
      } else {
        const p = await prisma.category.findUnique({ where: { slug: sub.parentSlug } });
        if (p) parentId = p.id;
      }
    }

    let existing = await prisma.category.findUnique({ where: { slug: sub.slug } });
    if (!existing) {
      existing = await prisma.category.create({
        data: {
          name: sub.name,
          slug: sub.slug,
          description: sub.description,
          parentId,
          isActive: true
        }
      });
      console.log(`Created subcategory: ${sub.name} (${sub.slug})`);
    } else if (parentId && existing.parentId !== parentId) {
      await prisma.category.update({
        where: { id: existing.id },
        data: { parentId }
      });
    }
    catMap.set(sub.slug, existing.id);
  }

  // 3. Repair Existing 48 Products
  console.log('Repairing existing products in database...');
  const allProds = await prisma.product.findMany();
  let repairedCount = 0;

  for (const p of allProds) {
    const nameLower = p.name.toLowerCase();
    const slugLower = p.slug.toLowerCase();

    let newDivisionType = p.divisionType || 'Knit';
    let newDepartment = p.department || 'Menswear';
    let newSubCategory = p.subCategory;

    // Detect Footwear (Espadrilles)
    if (nameLower.includes('espadrille') || slugLower.includes('espadrille') || nameLower.includes('footwear')) {
      newDivisionType = 'Footwear';
      newDepartment = nameLower.includes('women') ? 'Womenswear' : 'Menswear';
      if (nameLower.includes('classic') || nameLower.includes('minimalist') || nameLower.includes('basic') || nameLower.includes('slip-on')) {
        newSubCategory = 'basic-espadrilles';
      } else {
        newSubCategory = 'fashion-espadrilles';
      }
    }
    // Detect Home Textiles (Towel)
    else if (nameLower.includes('towel') || slugLower.includes('towel')) {
      newDivisionType = 'Home Textiles';
      newDepartment = 'Home Textiles';
      newSubCategory = 'towel';
    }
    // Detect Sweaters
    else if (nameLower.includes('sweater') || nameLower.includes('pullover') || nameLower.includes('cardigan')) {
      newDivisionType = 'Sweater';
      newDepartment = nameLower.includes('women') ? 'Womenswear' : (nameLower.includes('kids') ? 'Kidswear' : 'Menswear');
      newSubCategory = newDepartment === 'Womenswear' ? 'womens-sweaters-cardigans-pullovers' : 'mens-pullover';
    }
    // Detect Wovens
    else if (nameLower.includes('shirt') && !nameLower.includes('t-shirt') && !nameLower.includes('polo')) {
      newDivisionType = 'Woven';
      newDepartment = nameLower.includes('women') ? 'Womenswear' : (nameLower.includes('kids') ? 'Kidswear' : 'Menswear');
      newSubCategory = newDepartment === 'Womenswear' ? 'womens-shirt-blouse' : 'mens-shirt';
    }
    // Detect Knits
    else {
      newDivisionType = 'Knit';
      if (nameLower.includes('women')) newDepartment = 'Womenswear';
      else if (nameLower.includes('kids') || nameLower.includes('baby')) newDepartment = 'Kidswear';
      else newDepartment = 'Menswear';

      if (nameLower.includes('t-shirt') || nameLower.includes('tee') || nameLower.includes('top') || nameLower.includes('tank')) {
        newSubCategory = newDepartment === 'Womenswear' ? 'womens-t-shirt' : 'mens-t-shirt';
      } else if (nameLower.includes('polo')) {
        newSubCategory = newDepartment === 'Womenswear' ? 'womens-polo-shirt' : 'mens-polo-shirt';
      } else if (nameLower.includes('hoodie') || nameLower.includes('sweatshirt')) {
        newSubCategory = newDepartment === 'Womenswear' ? 'womens-sweatshirt' : 'mens-sweatshirt';
      } else if (nameLower.includes('dress')) {
        newSubCategory = 'womens-knit-dress';
      } else if (nameLower.includes('bodysuit') || nameLower.includes('undergarment')) {
        newSubCategory = 'womens-undergarments';
      }
    }

    // Link categoryId if possible
    let catToLink = null;
    if (newSubCategory && catMap.has(newSubCategory)) {
      catToLink = catMap.get(newSubCategory);
    }

    await prisma.product.update({
      where: { id: p.id },
      data: {
        divisionType: newDivisionType,
        department: newDepartment,
        subCategory: newSubCategory,
        ...(catToLink ? { categoryId: catToLink } : {})
      }
    });
    repairedCount++;
  }
  console.log(`Repaired ${repairedCount} existing products.`);

  // 4. Seed Representative Products for Missing Categories
  // So every category in Mega Menu & Left Sidebar returns gorgeous, authentic items!
  const newProducts = [
    // ── MEN'S CIRCULAR KNIT ──
    {
      name: "Men's Heavyweight Combed Cotton Crewneck T-Shirt",
      slug: "mens-heavyweight-combed-cotton-tshirt",
      description: "Premium 200 GSM 100% combed ring-spun cotton crewneck t-shirt. Double needle stitched hems, pre-shrunk reactive dyeing with superior color fastness for European and US export markets.",
      shortDescription: "200 GSM 100% Combed Cotton, Pre-Shrunk, Reactive Dyed",
      categorySlug: "mens-t-shirt",
      divisionType: "Knit",
      department: "Menswear",
      subCategory: "mens-t-shirt",
      images: JSON.stringify(["/products/knitwear-hero.png", "/products/knitwear-thumb-1.png"]),
      specifications: "Fabric: 100% Combed Ring-Spun Cotton\nGSM: 200\nYarn Count: 26s/1\nFit: Regular European Fit\nMOQ: 1000 Pcs per color",
      minOrder: "1000 Pcs",
      priceRange: "$2.80 - $3.40",
      styleNo: "AE-M-CK-001"
    },
    {
      name: "Men's Classic Pique Polo Shirt with Ribbed Collar",
      slug: "mens-classic-pique-polo-shirt",
      description: "220 GSM 100% cotton micro-pique knit polo shirt. Features 2-button placket with real pearlized buttons, reinforced side vents, and shape-retaining flat-knit collar.",
      shortDescription: "220 GSM Cotton Pique Knit, 2-Button Placket, Ribbed Collar",
      categorySlug: "mens-polo-shirt",
      divisionType: "Knit",
      department: "Menswear",
      subCategory: "mens-polo-shirt",
      images: JSON.stringify(["/products/knitwear-thumb-2.png", "/products/knitwear-hero.png"]),
      specifications: "Fabric: 100% Cotton Pique\nGSM: 220\nYarn Count: 30s/2\nFit: Modern Fit\nMOQ: 800 Pcs per color",
      minOrder: "800 Pcs",
      priceRange: "$4.10 - $4.90",
      styleNo: "AE-M-CK-002"
    },
    {
      name: "Men's French Terry Pullover Hoodie with Kangaroo Pocket",
      slug: "mens-french-terry-pullover-hoodie",
      description: "320 GSM 80% cotton 20% polyester unbrushed French terry hoodie. Features double-layer hood, matching cotton flat drawstrings, heavy 2x2 rib cuffs and hem.",
      shortDescription: "320 GSM French Terry Fleece, Double Layer Hood, Preshrunk",
      categorySlug: "mens-sweatshirt",
      divisionType: "Knit",
      department: "Menswear",
      subCategory: "mens-sweatshirt",
      images: JSON.stringify(["/products/sweatshirt-hero.png", "/products/knitwear-hero.png"]),
      specifications: "Fabric: 80% Cotton / 20% Polyester\nGSM: 320\nWash: Bio-Silicon Softener Wash\nMOQ: 500 Pcs per color",
      minOrder: "500 Pcs",
      priceRange: "$6.50 - $7.80",
      styleNo: "AE-M-CK-003"
    },
    {
      name: "Men's Tapered Slim French Terry Joggers",
      slug: "mens-tapered-slim-joggers",
      description: "300 GSM cotton-rich athletic joggers with deep side pockets, rear welt pocket, elasticated waistband with eyelets, and ribbed ankle cuffs.",
      shortDescription: "300 GSM Cotton French Terry, Tapered Fit, Elastic Waistband",
      categorySlug: "mens-trousers-joggers",
      divisionType: "Knit",
      department: "Menswear",
      subCategory: "mens-trousers-joggers",
      images: JSON.stringify(["/products/knitwear-thumb-3.png", "/products/knitwear-hero.png"]),
      specifications: "Fabric: 85% Cotton / 15% Polyester\nGSM: 300\nFit: Tapered Athletic Fit\nMOQ: 600 Pcs per color",
      minOrder: "600 Pcs",
      priceRange: "$5.20 - $6.10",
      styleNo: "AE-M-CK-004"
    },

    // ── MEN'S FLAT KNIT (SWEATERS) ──
    {
      name: "Men's 100% Lambswool Cable Knit Crewneck Sweater",
      slug: "mens-lambswool-cable-knit-sweater",
      description: "Authentic 7GG 100% Australian lambswool cable knit pullover. Luxurious hand feel with natural temperature regulation, ribbed neck and tubular cuffs.",
      shortDescription: "7 Gauge 100% Pure Lambswool Cable Pattern Pullover",
      categorySlug: "mens-sweaters-cardigans",
      divisionType: "Sweater",
      department: "Menswear",
      subCategory: "mens-sweaters-cardigans",
      images: JSON.stringify(["/products/sweater-hero.png", "/products/sweater-thumb-1.png"]),
      specifications: "Yarn: 100% Lambswool\nGauge: 7GG\nWeight: 480g\nFinish: Enzyme Washed\nMOQ: 400 Pcs per style",
      minOrder: "400 Pcs",
      priceRange: "$11.50 - $13.80",
      styleNo: "AE-M-SW-001"
    },
    {
      name: "Men's Fine Gauge Cotton-Cashmere Button Cardigan",
      slug: "mens-cotton-cashmere-cardigan",
      description: "12GG cotton-cashmere blend cardigan with horn buttons, clean self-fabric placket, and ribbed trim. Lightweight yet warm for layering across seasons.",
      shortDescription: "12 Gauge 90% Cotton 10% Cashmere Blend Cardigan",
      categorySlug: "mens-pullover",
      divisionType: "Sweater",
      department: "Menswear",
      subCategory: "mens-pullover",
      images: JSON.stringify(["/products/sweater-thumb-2.png", "/products/sweater-hero.png"]),
      specifications: "Yarn: 90% Combed Cotton / 10% Cashmere\nGauge: 12GG\nMOQ: 400 Pcs per style",
      minOrder: "400 Pcs",
      priceRange: "$9.80 - $11.50",
      styleNo: "AE-M-SW-002"
    },

    // ── MEN'S WOVEN ITEMS ──
    {
      name: "Men's 100% Cotton Poplin Long Sleeve Formal Shirt",
      slug: "mens-cotton-poplin-formal-shirt",
      description: "Export-grade 50s/1 cotton poplin dress shirt. Semi-spread collar with removable stays, convertible barrel cuffs, single needle tailored construction.",
      shortDescription: "100% Cotton Poplin, Semi-Spread Collar, Single Needle Tailored",
      categorySlug: "mens-shirt",
      divisionType: "Woven",
      department: "Menswear",
      subCategory: "mens-shirt",
      images: JSON.stringify(["/products/woven-hero.png", "/products/woven-thumb-1.png"]),
      specifications: "Fabric: 100% Cotton Poplin\nYarn Count: 50s x 50s\nDensity: 144 x 76\nFinish: Easy Care Wrinkle Free\nMOQ: 800 Pcs per color",
      minOrder: "800 Pcs",
      priceRange: "$5.40 - $6.50",
      styleNo: "AE-M-WV-001"
    },
    {
      name: "Men's Premium Selvedge Denim 5-Pocket Jeans",
      slug: "mens-selvedge-denim-jeans",
      description: "12.5 oz stretch cotton-spandex denim with authentic indigo wash and whiskers. Heavy brass rivets, YKK zipper fly, reinforced pocket bags.",
      shortDescription: "12.5 oz Indigo Denim, 98% Cotton 2% Spandex, 5-Pocket Classic",
      categorySlug: "mens-pant",
      divisionType: "Woven",
      department: "Menswear",
      subCategory: "mens-pant",
      images: JSON.stringify(["/products/woven-thumb-2.png", "/products/woven-hero.png"]),
      specifications: "Fabric: 98% Cotton / 2% Spandex\nWeight: 12.5 oz\nWash: Medium Stone & Enzyme Wash\nMOQ: 600 Pcs per wash",
      minOrder: "600 Pcs",
      priceRange: "$7.20 - $8.60",
      styleNo: "AE-M-WV-002"
    },
    {
      name: "Men's Tailored Stretch Cotton Twill Chinos",
      slug: "mens-stretch-cotton-chinos",
      description: "260 GSM combed cotton twill with 3% elastane. Clean flat front styling, slant side pockets, double welt buttoned back pockets.",
      shortDescription: "260 GSM Stretch Twill Chino Trousers, Enzyme Washed",
      categorySlug: "mens-pant",
      divisionType: "Woven",
      department: "Menswear",
      subCategory: "mens-pant",
      images: JSON.stringify(["/products/woven-thumb-3.png", "/products/woven-hero.png"]),
      specifications: "Fabric: 97% Cotton / 3% Spandex Twill\nGSM: 260\nFit: Slim Straight\nMOQ: 800 Pcs",
      minOrder: "800 Pcs",
      priceRange: "$6.00 - $7.10",
      styleNo: "AE-M-WV-003"
    },

    // ── WOMEN'S WOVEN & SWEATERS ──
    {
      name: "Women's Relaxed Fit Cotton-Linen Button-Down Blouse",
      slug: "womens-cotton-linen-blouse",
      description: "55% linen 45% combed cotton relaxed silhouette blouse. Dropped shoulders, mother of pearl buttons, gentle garment enzyme wash for soft drape.",
      shortDescription: "55% Linen 45% Cotton Blend, Breathable Summer Blouse",
      categorySlug: "womens-shirt-blouse",
      divisionType: "Woven",
      department: "Womenswear",
      subCategory: "womens-shirt-blouse",
      images: JSON.stringify(["/products/woven-hero.png", "/products/woven-thumb-1.png"]),
      specifications: "Fabric: 55% Linen / 45% Cotton\nWeight: 140 GSM\nMOQ: 600 Pcs",
      minOrder: "600 Pcs",
      priceRange: "$5.80 - $6.90",
      styleNo: "AE-W-WV-001"
    },
    {
      name: "Women's High-Rise Wide-Leg Denim Trousers",
      slug: "womens-wide-leg-denim-trousers",
      description: "11 oz 100% sustainable BCI cotton rigid denim. Vintage high-rise waist, deep patch pockets, clean hem with contrast topstitching.",
      shortDescription: "11 oz BCI Cotton Denim, Vintage High-Rise Wide-Leg Cut",
      categorySlug: "womens-pant-skirt",
      divisionType: "Woven",
      department: "Womenswear",
      subCategory: "womens-pant-skirt",
      images: JSON.stringify(["/products/woven-thumb-2.png", "/products/woven-hero.png"]),
      specifications: "Fabric: 100% BCI Cotton Denim\nWeight: 11 oz\nWash: Eco-friendly Ozone Light Wash\nMOQ: 600 Pcs",
      minOrder: "600 Pcs",
      priceRange: "$6.80 - $7.90",
      styleNo: "AE-W-WV-002"
    },
    {
      name: "Women's Mohair Blend Oversized Knit Cardigan",
      slug: "womens-mohair-blend-cardigan",
      description: "5GG soft mohair-wool blend oversized open cardigan. Balloon sleeves with ribbed cuffs and cozy patch pockets.",
      shortDescription: "5 Gauge Mohair-Wool Blend Fluffy Oversized Cardigan",
      categorySlug: "womens-sweaters-cardigans-pullovers",
      divisionType: "Sweater",
      department: "Womenswear",
      subCategory: "womens-sweaters-cardigans-pullovers",
      images: JSON.stringify(["/products/sweater-hero.png", "/products/sweater-thumb-1.png"]),
      specifications: "Yarn: 30% Mohair / 30% Wool / 40% Acrylic\nGauge: 5GG\nMOQ: 400 Pcs",
      minOrder: "400 Pcs",
      priceRange: "$10.20 - $12.50",
      styleNo: "AE-W-SW-001"
    },

    // ── CHILDREN'S FASHION ──
    {
      name: "Kids' 100% Bio-Washed Cotton Printed Graphic T-Shirt",
      slug: "kids-bio-washed-graphic-tshirt",
      description: "160 GSM 100% OEKO-TEX certified combed cotton kids tee. Non-toxic water-based screen printing, soft neck tape, side seam construction.",
      shortDescription: "160 GSM OEKO-TEX Cotton, Non-Toxic Water-Based Print",
      categorySlug: "kids-knit-tshirt",
      divisionType: "Knit",
      department: "Kidswear",
      subCategory: "kids-knit-tshirt",
      images: JSON.stringify(["/products/knitwear-hero.png", "/products/knitwear-thumb-1.png"]),
      specifications: "Fabric: 100% Organic Combed Cotton\nGSM: 160\nCertification: OEKO-TEX Standard 100 / GOTS\nMOQ: 1000 Pcs",
      minOrder: "1000 Pcs",
      priceRange: "$2.10 - $2.60",
      styleNo: "AE-K-CK-001"
    },
    {
      name: "Kids' French Terry Kangaroo Pocket Pullover Hoodie",
      slug: "kids-french-terry-kangaroo-hoodie",
      description: "280 GSM soft brushed cotton fleece hoodie designed for children. Safety-certified cordless hood, ribbed hem and cuffs.",
      shortDescription: "280 GSM Cotton Fleece, Safety-Certified Cordless Hood",
      categorySlug: "kids-knit-hoodie",
      divisionType: "Knit",
      department: "Kidswear",
      subCategory: "kids-knit-hoodie",
      images: JSON.stringify(["/products/sweatshirt-hero.png", "/products/knitwear-hero.png"]),
      specifications: "Fabric: 80% Cotton / 20% Polyester\nGSM: 280\nSafety: Complies with EU/US child safety standards\nMOQ: 800 Pcs",
      minOrder: "800 Pcs",
      priceRange: "$4.50 - $5.30",
      styleNo: "AE-K-CK-002"
    },
    {
      name: "Baby Organic Cotton Soft Ribbed Snap Romper",
      slug: "baby-organic-cotton-snap-romper",
      description: "200 GSM 100% GOTS certified organic cotton 1x1 rib knit baby romper. Nickel-free snap closures along the inseam for effortless changing.",
      shortDescription: "100% GOTS Organic Cotton, Nickel-Free Snaps, Ultra Soft",
      categorySlug: "kids-knit-romper",
      divisionType: "Knit",
      department: "Kidswear",
      subCategory: "kids-knit-romper",
      images: JSON.stringify(["/products/knitwear-thumb-2.png", "/products/knitwear-hero.png"]),
      specifications: "Fabric: 100% Organic Combed Cotton Rib\nGSM: 200\nCertification: GOTS Organic\nMOQ: 1000 Pcs",
      minOrder: "1000 Pcs",
      priceRange: "$2.90 - $3.50",
      styleNo: "AE-K-CK-003"
    },
    {
      name: "Kids' Durable Comfort Stretch Denim Jeans",
      slug: "kids-comfort-stretch-denim-jeans",
      description: "9.5 oz soft stretch denim with adjustable inner elastic buttonhole waistband. Reinforced knee panel stitching for high active wear resistance.",
      shortDescription: "9.5 oz Stretch Denim, Adjustable Waistband, Reinforced Knees",
      categorySlug: "kids-pant-skirt",
      divisionType: "Woven",
      department: "Kidswear",
      subCategory: "kids-pant-skirt",
      images: JSON.stringify(["/products/woven-thumb-2.png", "/products/woven-hero.png"]),
      specifications: "Fabric: 98% Cotton / 2% Elastane\nWeight: 9.5 oz\nFeatures: Inner adjustable waistband\nMOQ: 800 Pcs",
      minOrder: "800 Pcs",
      priceRange: "$4.80 - $5.70",
      styleNo: "AE-K-WV-001"
    },
    {
      name: "Kids' Cozy Jacquard Knit Crewneck Winter Sweater",
      slug: "kids-cozy-jacquard-crewneck-sweater",
      description: "9GG soft anti-pilling acrylic-cotton blend sweater featuring playful festive Scandinavian jacquard patterns.",
      shortDescription: "9 Gauge Anti-Pilling Acrylic-Cotton Jacquard Pattern Sweater",
      categorySlug: "kids-sweater",
      divisionType: "Sweater",
      department: "Kidswear",
      subCategory: "kids-sweater",
      images: JSON.stringify(["/products/sweater-hero.png", "/products/sweater-thumb-2.png"]),
      specifications: "Yarn: 60% Cotton / 40% Anti-Pill Acrylic\nGauge: 9GG\nMOQ: 500 Pcs",
      minOrder: "500 Pcs",
      priceRange: "$6.20 - $7.40",
      styleNo: "AE-K-SW-001"
    },

    // ── HOME TEXTILES ──
    {
      name: "Luxury 600 GSM Combed Cotton Terry Bath Towel Set",
      slug: "luxury-600-gsm-combed-cotton-bath-towel-set",
      description: "600 GSM 100% Pakistani combed cotton ring-spun terry towels. Extra-long loops for extreme absorbency, double-stitched reinforced borders, color-fast reactive dyeing.",
      shortDescription: "600 GSM Pure Combed Cotton, Ultra Absorbent, Hotel Quality",
      categorySlug: "towel",
      divisionType: "Home Textiles",
      department: "Home Textiles",
      subCategory: "towel",
      images: JSON.stringify(["/products/woven-hero.png", "/products/woven-thumb-1.png"]),
      specifications: "Material: 100% Combed Ring-Spun Cotton\nGSM: 600 GSM\nSizes: Bath (70x140cm), Hand (50x90cm), Face (30x30cm)\nMOQ: 1200 Sets",
      minOrder: "1200 Sets",
      priceRange: "$7.50 - $9.20",
      styleNo: "AE-HT-TW-001"
    },
    {
      name: "400 Thread Count Egyptian Cotton Sateen Bedding Sheet Set",
      slug: "400-tc-egyptian-cotton-sateen-bedding-set",
      description: "400 TC 100% long-staple cotton silky sateen sheet set. Includes 1 fitted sheet with all-around deep elastic, 1 flat sheet, and 2 tailored pillowcases with envelope closure.",
      shortDescription: "400 TC Cotton Sateen, Silky Soft Hotel Finish, Deep Pocket",
      categorySlug: "bedding",
      divisionType: "Home Textiles",
      department: "Home Textiles",
      subCategory: "bedding",
      images: JSON.stringify(["/products/woven-thumb-1.png", "/products/woven-hero.png"]),
      specifications: "Material: 100% Long-Staple Cotton\nThread Count: 400 TC Sateen Weave\nSizes: Queen, King, Super King\nMOQ: 500 Sets",
      minOrder: "500 Sets",
      priceRange: "$18.50 - $24.00",
      styleNo: "AE-HT-BD-001"
    },
    {
      name: "Linen-Textured Triple-Weave Blackout Window Curtains",
      slug: "linen-textured-blackout-window-curtains",
      description: "280 GSM woven faux-linen blackout drape with silver anti-rust grommets. Blocks 95%+ of light and provides thermal insulation for home and hotel projects.",
      shortDescription: "280 GSM Faux Linen Triple Weave Thermal Blackout Drapes",
      categorySlug: "curtain",
      divisionType: "Home Textiles",
      department: "Home Textiles",
      subCategory: "curtain",
      images: JSON.stringify(["/products/woven-thumb-3.png", "/products/woven-hero.png"]),
      specifications: "Material: 100% High-Density Polyester Triple Weave\nGSM: 280 GSM\nSizes: 52x84 in, 52x96 in\nMOQ: 600 Pairs",
      minOrder: "600 Pairs",
      priceRange: "$12.00 - $15.50",
      styleNo: "AE-HT-CR-001"
    },

    // ── FOOTWEAR ──
    {
      name: "Handcrafted Jute Sole Traditional Canvas Espadrilles",
      slug: "handcrafted-jute-sole-canvas-espadrilles",
      description: "Authentic handmade braided natural jute rope sole with vulcanized rubber bottom for durability. 10 oz washed canvas upper, cushioned textile footbed.",
      shortDescription: "100% Natural Jute Sole, 10 oz Washed Canvas, Rubber Outsole",
      categorySlug: "basic-espadrilles",
      divisionType: "Footwear",
      department: "Menswear",
      subCategory: "basic-espadrilles",
      images: JSON.stringify(["/products/woven-thumb-1.png", "/products/woven-hero.png"]),
      specifications: "Upper: 100% Cotton Canvas (10 oz)\nSole: Braided Natural Jute + Vulcanized Rubber\nSizes: EU 40-45 (US 7-12)\nMOQ: 500 Pairs",
      minOrder: "500 Pairs",
      priceRange: "$4.50 - $5.50",
      styleNo: "AE-FW-ES-001"
    },
    {
      name: "Women's Striped Nautical Jute Espadrille Flats",
      slug: "womens-striped-nautical-jute-espadrilles",
      description: "Fashion forward navy-and-white nautical stripe woven canvas espadrille with braided jute midsole, soft microfiber insole, and flexible anti-slip sole.",
      shortDescription: "Striped Cotton Canvas Upper, Natural Jute Midsole, Anti-Slip Base",
      categorySlug: "fashion-espadrilles",
      divisionType: "Footwear",
      department: "Womenswear",
      subCategory: "fashion-espadrilles",
      images: JSON.stringify(["/products/woven-thumb-2.png", "/products/woven-hero.png"]),
      specifications: "Upper: Yarn-Dyed Striped Cotton Canvas\nSole: Natural Jute + TPR Outsole\nSizes: EU 36-41 (US 5-10)\nMOQ: 500 Pairs",
      minOrder: "500 Pairs",
      priceRange: "$4.80 - $5.80",
      styleNo: "AE-FW-ES-002"
    },

    // ── ACCESSORIES ──
    {
      name: "Cashmere-Feel Brushed Acrylic Winter Plaid Scarf",
      slug: "cashmere-feel-brushed-plaid-scarf",
      description: "Ultra-soft 260 GSM brushed acrylic jacquard woven scarf with 3-inch twisted fringe hems. Authentic cashmere feel, warm, lightweight, hypoallergenic.",
      shortDescription: "260 GSM Brushed Jacquard Weave, Twisted Fringe, Cashmere Touch",
      categorySlug: "scarves",
      divisionType: "Accessories",
      department: "Accessories",
      subCategory: "scarves",
      images: JSON.stringify(["/products/sweater-hero.png", "/products/sweater-thumb-1.png"]),
      specifications: "Material: 100% Premium Cashmere-Feel Acrylic\nWeight: 240g\nSize: 30 x 180 cm + fringes\nMOQ: 1000 Pcs",
      minOrder: "1000 Pcs",
      priceRange: "$2.90 - $3.60",
      styleNo: "AE-AC-SC-001"
    },
    {
      name: "6-Panel Washed Heavy Cotton Twill Baseball Cap",
      slug: "6-panel-washed-cotton-twill-baseball-cap",
      description: "280 GSM heavy cotton twill 6-panel unconstructed dad hat. Features curved pre-bent visor, brass buckle closure, embroidered eyelets, custom 3D embroidery ready.",
      shortDescription: "280 GSM Heavy Cotton Twill, Brass Metal Buckle, 6-Panel Design",
      categorySlug: "hats-caps",
      divisionType: "Accessories",
      department: "Accessories",
      subCategory: "hats-caps",
      images: JSON.stringify(["/products/woven-thumb-3.png", "/products/woven-hero.png"]),
      specifications: "Material: 100% Heavy Brushed Cotton Twill\nClosure: Self-fabric strap with antique brass buckle\nMOQ: 1000 Pcs",
      minOrder: "1000 Pcs",
      priceRange: "$1.90 - $2.40",
      styleNo: "AE-AC-CP-001"
    },
    {
      name: "Touchscreen Compatible Knitted Winter Warm Gloves",
      slug: "touchscreen-knitted-winter-gloves",
      description: "10GG acrylic knit gloves with silver conductive yarn on thumb, index, and middle fingertips for smartphone touchscreen operation. Brushed thermal fleece inner lining.",
      shortDescription: "10 Gauge Knitted Glove, Conductive Touchscreen Fingers, Thermal",
      categorySlug: "gloves",
      divisionType: "Accessories",
      department: "Accessories",
      subCategory: "gloves",
      images: JSON.stringify(["/products/sweater-thumb-2.png", "/products/sweater-hero.png"]),
      specifications: "Material: 95% Acrylic / 5% Conductive Metal Fiber\nGauge: 10GG\nMOQ: 1200 Pairs",
      minOrder: "1200 Pairs",
      priceRange: "$1.40 - $1.80",
      styleNo: "AE-AC-GL-001"
    },
    {
      name: "Combed Cotton Cushioned Athletic Crew Socks (5-Pack)",
      slug: "combed-cotton-cushioned-crew-socks-5pack",
      description: "168N high-needle count combed cotton crew socks with terry cushioning on sole, arch compression band, seamless hand-linked toe closure, and reinforced heel.",
      shortDescription: "168N Combed Cotton, Terry Cushion Sole, Arch Support (5-Pack)",
      categorySlug: "socks",
      divisionType: "Accessories",
      department: "Accessories",
      subCategory: "socks",
      images: JSON.stringify(["/products/knitwear-thumb-1.png", "/products/knitwear-hero.png"]),
      specifications: "Composition: 80% Combed Cotton / 17% Polyester / 3% Spandex\nNeedle: 168 Needles\nPackaging: Custom Printed Paper Header Card (5-Pack)\nMOQ: 1500 Packs",
      minOrder: "1500 Packs",
      priceRange: "$3.50 - $4.20",
      styleNo: "AE-AC-SK-001"
    },
    {
      name: "Custom Luxury Rigid Magnetic Apparel Export Gift Box",
      slug: "custom-luxury-magnetic-apparel-gift-box",
      description: "1200 GSM greyboard wrapped in 157 GSM matte art paper with hot-stamped gold foil logo. Concealed magnetic closure with satin pull ribbon. Custom size for shirts and knitwear.",
      shortDescription: "1200 GSM Heavy Rigid Board, Concealed Magnetic Closure, Gold Foil",
      categorySlug: "gift-box",
      divisionType: "Accessories",
      department: "Accessories",
      subCategory: "gift-box",
      images: JSON.stringify(["/products/woven-hero.png", "/products/woven-thumb-1.png"]),
      specifications: "Structure: Collapsible Magnetic Rigid Box\nBoard: 1200 GSM Chipboard\nLamination: Matte Soft-Touch Anti-Scratch\nMOQ: 1000 Pcs",
      minOrder: "1000 Pcs",
      priceRange: "$1.80 - $2.50",
      styleNo: "AE-AC-GB-001"
    }
  ];

  console.log(`Seeding ${newProducts.length} high-quality curated products...`);
  let createdCount = 0;
  for (const item of newProducts) {
    const existing = await prisma.product.findUnique({ where: { slug: item.slug } });
    if (!existing) {
      const catId = catMap.get(item.categorySlug) || divMap.get(item.divisionType.toLowerCase()) || divMap.get('fashion');
      await prisma.product.create({
        data: {
          name: item.name,
          slug: item.slug,
          description: item.description,
          shortDescription: item.shortDescription,
          categoryId: catId,
          images: item.images,
          specifications: item.specifications,
          isFeatured: true,
          isActive: true,
          tags: `${item.divisionType}, ${item.department}, ${item.subCategory}, ${item.categorySlug}`,
          minOrder: item.minOrder,
          priceRange: item.priceRange,
          styleNo: item.styleNo,
          divisionType: item.divisionType,
          department: item.department,
          subCategory: item.subCategory,
          status: 'PUBLISHED'
        }
      });
      createdCount++;
    }
  }

  console.log(`Successfully created ${createdCount} new category-synchronized products!`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
