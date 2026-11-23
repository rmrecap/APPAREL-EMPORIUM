import openpyxl
import sqlite3
import json
import re
import os

DB_PATH = r"c:\Users\DELL\OneDrive\Desktop\AELBDNET\prisma\dev.db"
TEMPLATE_PATH = r"c:\Users\DELL\Downloads\Google Merchant Center feed - Products source.xlsx"
OUTPUT_DOWNLOADS = r"c:\Users\DELL\Downloads\Google Merchant Center feed - Products source.xlsx"
OUTPUT_DESKTOP = r"c:\Users\DELL\Desktop\Google Merchant Center feed - Products source.xlsx"
BASE_URL = "https://www.aelbd.net"

def clean_text(text):
    if not text:
        return ""
    return re.sub(r'[\r\n\t]+', ' ', str(text)).strip()

def parse_images(raw_images):
    if not raw_images:
        return []
    try:
        parsed = json.loads(raw_images) if isinstance(raw_images, str) else raw_images
        if not isinstance(parsed, list):
            parsed = [parsed]
        urls = []
        for item in parsed:
            u = ""
            if isinstance(item, str):
                u = item.strip()
            elif isinstance(item, dict):
                u = (item.get("url") or item.get("src") or item.get("path") or "").strip()
            if u:
                if not u.startswith("http://") and not u.startswith("https://"):
                    clean = u if u.startswith("/") else f"/{u}"
                    u = f"{BASE_URL}{clean}"
                urls.append(u)
        return urls
    except Exception:
        return []

def parse_base_price(price_range):
    if not price_range:
        return "3.50 USD"
    m = re.search(r'\$?(\d+(?:\.\d+)?)', str(price_range))
    if m:
        return f"{float(m.group(1)):.2f} USD"
    return "3.50 USD"

def map_gender(department):
    dept = (department or "").lower()
    if any(k in dept for k in ["women", "female", "girl"]):
        return "female"
    if any(k in dept for k in ["men", "male", "boy"]):
        return "male"
    return "unisex"

def map_age_group(department, name):
    comb = f"{department or ''} {name or ''}".lower()
    if any(k in comb for k in ["kid", "child", "boy", "girl", "infant", "baby", "toddler"]):
        return "kids"
    return "adult"

def main():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM Product WHERE isActive = 1 ORDER BY id ASC")
    products = c.fetchall()
    print(f"Loaded {len(products)} active products from database.")

    # Load template workbook
    wb = openpyxl.load_workbook(TEMPLATE_PATH)
    ws = wb["Sheet1"]

    # We keep Row 1 (Header formulas).
    # Delete rows 2 to max_row (which contain instructions, sample rows, and empty rows)
    if ws.max_row >= 2:
        ws.delete_rows(2, ws.max_row - 1)

    print("Existing instruction/sample rows deleted. Writing product records...")

    for p in products:
        sku = p["sku"] or f"AE-{p['id'][-6:]}"
        name = p["name"] or p["title"] or "Apparel Product"
        title = name[:150]

        # Rich B2B Description
        raw_desc = p["description"] or p["shortDescription"] or name
        if len(raw_desc) < 40:
            raw_desc = (
                f"{name}. Export-quality garment manufactured in Bangladesh by Apparel Emporium. "
                f"Custom tech-pack development, private label, and volume manufacturing. "
                f"Flexible MOQ and custom quotation available."
            )
        description = clean_text(raw_desc)[:5000]

        link = f"{BASE_URL}/products/{p['slug'] or p['id']}"
        images = parse_images(p["images"])
        primary_image = images[0] if images else f"{BASE_URL}/logo.jpg"
        additional_images = ",".join(images[1:10]) if len(images) > 1 else ""

        price_str = parse_base_price(p["priceRange"])
        gender = map_gender(p["department"])
        age_group = map_age_group(p["department"], name)
        brand = p["brand"] or "Apparel Emporium"

        # B2B Product Highlights
        product_highlight = (
            f"B2B Custom Manufacturing; Flexible MOQ ({clean_text(p['minOrder'] or 'Custom')}); "
            f"Made in Bangladesh; Custom Tech-Pack & Private Label Export"
        )

        material = p["fabricComposition"] or "100% Cotton / Combed Cotton / Blends"

        # Build row matching all 40 columns
        row = [
            clean_text(sku),                # 1: id
            clean_text(title),              # 2: title
            description,                    # 3: description
            "in_stock",                     # 4: availability
            "",                             # 5: availability_date
            "",                             # 6: expiration_date
            clean_text(link),               # 7: link
            "",                             # 8: mobile_link
            clean_text(primary_image),      # 9: image_link
            price_str,                      # 10: price
            "",                             # 11: sale_price
            "",                             # 12: sale_price_effective_date
            "no",                           # 13: identifier_exists
            "",                             # 14: gtin
            clean_text(sku),                # 15: mpn
            clean_text(brand),              # 16: brand
            product_highlight,              # 17: product_highlight
            f"Origin:Bangladesh:MOQ:{clean_text(p['minOrder'] or 'Flexible')}", # 18: product_detail
            clean_text(additional_images),  # 19: additional_image_link
            "new",                          # 20: condition
            "no",                           # 21: adult
            clean_text(p["colors"] or ""),  # 22: color
            clean_text(p["sizes"] or ""),   # 23: size
            "regular",                      # 24: size_type
            "US",                           # 25: size_system
            gender,                         # 26: gender
            clean_text(material),           # 27: material
            "",                             # 28: pattern
            age_group,                      # 29: age_group
            "",                             # 30: multipack
            "",                             # 31: is bundle
            "",                             # 32: unit_pricing_measure
            "",                             # 33: unit_pricing_base_measure
            "",                             # 34: energy_efficiency_class
            "",                             # 35: min_energy_efficiency_class
            "",                             # 36: max_energy_efficiency
            "",                             # 37: item_group_id
            "",                             # 38: video_link
            "",                             # 39: virtual_model_link
            ""                              # 40: cost_of_goods_sold
        ]

        ws.append(row)

    wb.save(OUTPUT_DOWNLOADS)
    wb.save(OUTPUT_DESKTOP)
    print(f"Successfully populated {len(products)} products into:")
    print(f"  1. {OUTPUT_DOWNLOADS}")
    print(f"  2. {OUTPUT_DESKTOP}")

if __name__ == "__main__":
    main()
