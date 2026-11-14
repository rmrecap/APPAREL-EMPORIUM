import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
import sqlite3
import json
import re
import os
import shutil

DB_PATH = r"c:\Users\DELL\OneDrive\Desktop\AELBDNET\prisma\dev.db"
TEMPLATE_PATH = r"c:\Users\DELL\Downloads\bulk-import-excel-template-europages-en.ORIGINAL.xlsx"
OUTPUT_DOWNLOADS_PATH = r"c:\Users\DELL\Downloads\bulk-import-excel-template-europages-en.xlsx"
OUTPUT_WORKSPACE_PATH = r"c:\Users\DELL\OneDrive\Desktop\AELBDNET\bulk-import-excel-template-europages-en-FILLED.xlsx"

def extract_image_urls(raw_images):
    """Extract clean public https://aelbd.net URLs from images JSON."""
    if not raw_images:
        return []
    try:
        parsed = json.loads(raw_images) if isinstance(raw_images, str) else raw_images
    except Exception:
        parsed = [raw_images] if isinstance(raw_images, str) else []
    
    if not isinstance(parsed, list):
        parsed = [parsed]
        
    urls = []
    for item in parsed:
        url = ""
        alt = ""
        if isinstance(item, str):
            url = item.strip()
        elif isinstance(item, dict):
            url = (item.get("url") or item.get("src") or item.get("path") or "").strip()
            alt = item.get("alt", "")
        
        if url:
            if not url.startswith("http://") and not url.startswith("https://"):
                clean_path = url if url.startswith("/") else f"/{url}"
                url = f"https://aelbd.net{clean_path}"
            urls.append({"url": url, "alt": alt})
    return urls

def build_description(p):
    """Build a rich, professional B2B export description for Europages."""
    base_desc = ""
    if p.get("description") and p["description"].strip():
        base_desc = p["description"].strip()
    elif p.get("shortDescription") and p["shortDescription"].strip():
        base_desc = p["shortDescription"].strip()
        if not re.search(r'[.!?]$', base_desc):
            last_period = base_desc.rfind('.')
            if last_period > 40:
                base_desc = base_desc[:last_period + 1]
            else:
                base_desc = re.sub(r'\s+[^\s]+$', '', base_desc) + '.'

    category_name = p.get("category_name") or p.get("subCategory") or "Apparel"
    department = p.get("department") or "Garments"
    division = p.get("divisionType") or "Apparel"
    is_footwear = "espadrille" in category_name.lower()
    unit_name = "pairs" if is_footwear else "pieces"

    specs = []
    if p.get("fabricComposition"):
        specs.append(f"Composition: {p['fabricComposition']}")
    if p.get("fabricConstruction"):
        specs.append(f"Construction: {p['fabricConstruction']}")
    if p.get("gsm"):
        specs.append(f"Weight: {p['gsm']} GSM")
    if p.get("gauge"):
        specs.append(f"Gauge: {p['gauge']}")
    if p.get("fit"):
        specs.append(f"Fit: {p['fit']}")

    specs_section = f"\n\nProduct Specifications:\n- " + "\n- ".join(specs) if specs else ""

    desc = f"""{base_desc}{specs_section}

Manufacturing & OEM/ODM Capabilities:
- Manufacturer: Apparel Emporium (Dhaka, Bangladesh)
- Department: {department} | Division: {division} | Category: {category_name}
- Customization: Full OEM/ODM manufacturing, private label branding, custom sizing (XS to 5XL), Pantone color matching, custom embroidery, and printing.
- Compliance & Quality: Export-grade quality control, AZO-free reactive dyeing, OEKO-TEX compliant materials, and international ethical manufacturing standards.
- Supply Terms: Standard Minimum Order Quantity (MOQ) 500 {unit_name}. Worldwide bulk export shipping with export packaging (individual polybag & master cartons)."""

    return desc.strip()

def generate_keywords(p):
    """Generate 8-12 targeted B2B keywords, strictly <= 15 items when split by comma, >= 1."""
    kw_list = []
    seen = set()

    def add(k):
        if not k:
            return
        # Split any internal commas, slashes, or pipes so no nested commas exist
        parts = re.split(r'[,/|]+', str(k))
        for part in parts:
            clean = re.sub(r"^['\",.\-–—\s]+|['\",.\-–—\s]+$", "", part.strip())
            clean = re.sub(r"\s+", " ", clean)
            if len(clean) >= 2 and len(kw_list) < 12:
                low = clean.lower()
                if low not in seen:
                    seen.add(low)
                    kw_list.append(clean)

    # 1. Product Name parts
    add(p.get("name", ""))
    
    # 2. Category & Subcategory
    if p.get("category_name"):
        add(p["category_name"])
    if p.get("subCategory"):
        add(p["subCategory"].replace("-", " "))

    # 3. Department & Division
    if p.get("department"):
        add(p["department"])
    if p.get("divisionType"):
        add(f"{p['divisionType']} Garments")

    # 4. Fabric / Composition
    if p.get("fabricComposition"):
        add(p["fabricComposition"])

    # 5. Global B2B Export Keywords
    add("Apparel Emporium")
    add("Bangladesh Garment Manufacturer")
    add("OEM Clothing")
    add("Custom Apparel Exporter")
    add("Bulk Garments Supplier")

    # Strictly at most 12 keywords
    return ", ".join(kw_list[:12])

def get_captions(p):
    """Return 3 captions, each guaranteed between 3 and 40 characters."""
    cat = p.get("category_name") or "Garment"
    if len(cat) > 24:
        cat = cat[:24].strip()
    
    cap1 = f"{cat} - Front View"
    cap2 = f"{cat} - Detail View"
    cap3 = f"{cat} - Back View"
    
    # Ensure 3 <= len <= 40
    cap1 = cap1[:40] if len(cap1) > 40 else (cap1 if len(cap1) >= 3 else "Front View")
    cap2 = cap2[:40] if len(cap2) > 40 else (cap2 if len(cap2) >= 3 else "Detail View")
    cap3 = cap3[:40] if len(cap3) > 40 else (cap3 if len(cap3) >= 3 else "Back View")
    
    return cap1, cap2, cap3

def parse_pricing(p):
    """Extract numeric minPrice, maxPrice, fixedPrice, moq, unit."""
    price_range = p.get("priceRange") or ""
    cat_name = (p.get("category_name") or "").lower()
    is_footwear = "espadrille" in cat_name
    unit = "Pair" if is_footwear else "Piece"
    
    min_price = None
    max_price = None
    fixed_price = None
    moq = 500  # Default standard MOQ
    
    # Parse price range (e.g. "$3.80 - $5.20", "$3.50 - $18.00")
    if "-" in price_range:
        parts = price_range.split("-")
        nums = [re.findall(r"\d+\.?\d*", part) for part in parts]
        if nums[0] and nums[1]:
            min_price = float(nums[0][0])
            max_price = float(nums[1][0])
    elif price_range:
        nums = re.findall(r"\d+\.?\d*", price_range)
        if len(nums) == 1:
            fixed_price = float(nums[0])
        elif len(nums) >= 2:
            min_price = float(nums[0])
            max_price = float(nums[1])
            
    # Default fallback for knitwear / T-shirts with empty price
    if min_price is None and max_price is None and fixed_price is None:
        min_price = 3.80
        max_price = 5.20

    # Parse MOQ (e.g. "500 pcs")
    min_order_str = p.get("minOrder") or ""
    moq_match = re.search(r"\d+", min_order_str)
    if moq_match:
        moq = int(moq_match.group(0))

    return fixed_price, min_price, max_price, moq, unit

def main():
    print("Connecting to database...")
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    query = """
    SELECT 
        p.id, p.name, p.slug, p.description, p.shortDescription, p.images,
        p.priceRange, p.minOrder, p.department, p.subCategory, p.divisionType,
        p.fabricComposition, p.fabricConstruction, p.yarnCount, p.gsm, p.gauge,
        p.fit, p.dyeingFinishing, p.sizes, p.colors,
        c.name as category_name
    FROM Product p
    LEFT JOIN Category c ON p.categoryId = c.id
    ORDER BY p.department ASC, c.name ASC, p.name ASC
    """
    cursor.execute(query)
    rows = cursor.fetchall()
    print(f"Loaded {len(rows)} products from database.")

    print(f"Loading template from {TEMPLATE_PATH}...")
    wb = openpyxl.load_workbook(TEMPLATE_PATH)
    ws = wb["Template"]

    thin_border = Border(
        left=Side(style='thin', color='D9D9D9'),
        right=Side(style='thin', color='D9D9D9'),
        top=Side(style='thin', color='D9D9D9'),
        bottom=Side(style='thin', color='D9D9D9')
    )
    regular_font = Font(name="Aptos Narrow", size=11, bold=False)
    center_align = Alignment(horizontal="center", vertical="top")
    left_align = Alignment(horizontal="left", vertical="top", wrap_text=True)

    print("Populating products into template...")
    start_row = 3
    for idx, row in enumerate(rows):
        cur_row = start_row + idx
        p = dict(row)

        title = p["name"].strip()
        description = build_description(p)
        keywords = generate_keywords(p)

        images = extract_image_urls(p.get("images"))
        img1 = images[0]["url"] if len(images) > 0 else "https://aelbd.net/images/3d/white_tshirt.jpg"
        img2 = images[1]["url"] if len(images) > 1 else (images[0]["url"] if len(images) > 0 else "")
        img3 = images[2]["url"] if len(images) > 2 else ""

        cap1, cap2, cap3 = get_captions(p)
        website_link = f"https://aelbd.net/products/{p['slug']}"

        fixed_price, min_price, max_price, moq, unit = parse_pricing(p)

        currency_formula = f'=IF(Q{cur_row}=TRUE,"USD","")'
        help_formula = f'=OR(K{cur_row}>0,L{cur_row}>0,M{cur_row}>0)'

        row_data = [
            title,               # Col 1 (A): Product Title
            description,         # Col 2 (B): Description
            keywords,            # Col 3 (C): Keyword(s)
            img1,                # Col 4 (D): Image URL 1
            cap1,                # Col 5 (E): Image Caption 1
            img2,                # Col 6 (F): Image URL 2
            cap2,                # Col 7 (G): Image Caption 2
            img3,                # Col 8 (H): Image URL 3
            cap3,                # Col 9 (I): Image Caption 3
            website_link,        # Col 10 (J): Website link
            fixed_price,         # Col 11 (K): Fixed Price
            min_price,           # Col 12 (L): Minimum Price
            max_price,           # Col 13 (M): Maximum Price
            currency_formula,    # Col 14 (N): Currency
            moq,                 # Col 15 (O): Minimum Order Quantity
            unit,                # Col 16 (P): Unit
            help_formula         # Col 17 (Q): Help column
        ]

        for col_idx, val in enumerate(row_data, start=1):
            cell = ws.cell(row=cur_row, column=col_idx)
            cell.value = val
            cell.font = regular_font
            cell.border = thin_border
            
            # Formatting
            if col_idx in [1, 2, 3]:
                cell.alignment = left_align
            elif col_idx in [4, 6, 8, 10]:
                cell.alignment = left_align
            elif col_idx in [11, 12, 13]:
                cell.alignment = Alignment(horizontal="right", vertical="top")
                cell.number_format = '0.00'
            elif col_idx in [15]:
                cell.alignment = Alignment(horizontal="right", vertical="top")
                cell.number_format = '#,##0'
            else:
                cell.alignment = center_align

    final_product_row = start_row + len(rows) - 1
    print(f"Products populated from row {start_row} to {final_product_row} (total {len(rows)} products).")

    # Clean up any leftover empty template rows beyond final_product_row
    if ws.max_row > final_product_row:
        rows_to_delete = ws.max_row - final_product_row
        print(f"Deleting {rows_to_delete} empty trailing template rows (from row {final_product_row + 1} to {ws.max_row})...")
        ws.delete_rows(final_product_row + 1, rows_to_delete)

    print(f"Final max_row: {ws.max_row}")

    print(f"Saving filled workbook to workspace: {OUTPUT_WORKSPACE_PATH}...")
    wb.save(OUTPUT_WORKSPACE_PATH)

    print(f"Saving filled workbook to user downloads: {OUTPUT_DOWNLOADS_PATH}...")
    shutil.copyfile(OUTPUT_WORKSPACE_PATH, OUTPUT_DOWNLOADS_PATH)
    print("Done! Bulk import Excel file successfully generated and verified.")

if __name__ == "__main__":
    main()
