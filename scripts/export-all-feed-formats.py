import sqlite3
import json
import csv
import re
import os
import openpyxl

DB_PATH = r"c:\Users\DELL\OneDrive\Desktop\AELBDNET\prisma\dev.db"
BASE_URL = "https://www.aelbd.net"

DOWNLOADS_DIR = r"c:\Users\DELL\Downloads"
DESKTOP_DIR = r"c:\Users\DELL\Desktop"

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

    headers = [
        "id",
        "title",
        "description",
        "availability",
        "link",
        "image_link",
        "price",
        "identifier_exists",
        "mpn",
        "brand",
        "condition",
        "channel",
        "included_destination",
        "excluded_destination",
        "gender",
        "age_group",
        "product_type",
        "google_product_category",
        "shipping",
        "custom_label_0",
        "custom_label_1",
        "custom_label_2",
        "custom_label_3"
    ]

    all_rows = []
    for p in products:
        sku = p["sku"] or f"AE-{p['id'][-6:]}"
        name = p["name"] or p["title"] or "Apparel Product"
        title = name[:150]

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
        price_str = parse_base_price(p["priceRange"])
        gender = map_gender(p["department"])
        age_group = map_age_group(p["department"], name)
        brand = p["brand"] or "Apparel Emporium"
        product_type = clean_text(f"{p['department'] or 'Apparel'} > {p['divisionType'] or 'Garments'} > {p['subCategory'] or name}")
        google_cat = "Apparel & Accessories > Clothing"

        row = [
            clean_text(sku),
            clean_text(title),
            description,
            "in_stock",
            clean_text(link),
            clean_text(primary_image),
            price_str,
            "no",
            clean_text(sku),
            clean_text(brand),
            "new",
            "online",                                  # channel
            "Free_listings",                           # included_destination (Online Free Listings)
            "Free_local_listings,Local_inventory_ads", # excluded_destination (Excludes physical store inventory)
            gender,
            age_group,
            product_type,
            google_cat,
            "US:Standard:0.00 USD",
            clean_text(p["department"] or "Apparel"),
            clean_text(p["divisionType"] or "Manufacturing"),
            clean_text(p["minOrder"] or "Flexible MOQ"),
            "Made in Bangladesh"
        ]
        all_rows.append(row)

    # 1. Export Tab-Delimited .tsv & .txt
    tsv_content = "\t".join(headers) + "\n"
    for r in all_rows:
        tsv_content += "\t".join(r) + "\n"

    for folder in [DOWNLOADS_DIR, DESKTOP_DIR]:
        tsv_path = os.path.join(folder, "google-merchant-products.tsv")
        txt_path = os.path.join(folder, "google-merchant-products.txt")
        csv_path = os.path.join(folder, "google-merchant-products.csv")

        with open(tsv_path, "w", encoding="utf-8") as f:
            f.write(tsv_content)
        with open(txt_path, "w", encoding="utf-8") as f:
            f.write(tsv_content)

        with open(csv_path, "w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f, quoting=csv.QUOTE_MINIMAL)
            writer.writerow(headers)
            for r in all_rows:
                writer.writerow(r)

    # 2. Export clean XLSX
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Products"
    ws.append(headers)
    for r in all_rows:
        ws.append(r)

    for folder in [DOWNLOADS_DIR, DESKTOP_DIR]:
        xlsx_path = os.path.join(folder, "google-merchant-products.xlsx")
        wb.save(xlsx_path)

    # Also update public/ directory for website feed
    public_tsv = r"c:\Users\DELL\OneDrive\Desktop\AELBDNET\public\google-merchant-feed.tsv"
    with open(public_tsv, "w", encoding="utf-8") as f:
        f.write(tsv_content)

    print("Successfully updated all feeds with channel=online and excluded_destination=Free_local_listings,Local_inventory_ads!")

if __name__ == "__main__":
    main()
