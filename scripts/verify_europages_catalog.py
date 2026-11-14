import openpyxl
import re

FILE_PATH = r"c:\Users\DELL\Downloads\bulk-import-excel-template-europages-en.xlsx"

def verify():
    print(f"Loading {FILE_PATH} for verification...")
    wb = openpyxl.load_workbook(FILE_PATH, data_only=False)
    
    # 1. Sheets
    expected_sheets = ['Instructions', 'Template', 'Valid Values']
    assert wb.sheetnames == expected_sheets, f"Sheets mismatch: {wb.sheetnames}"
    print("âœ“ Sheet names match:", wb.sheetnames)

    ws_vv = wb['Valid Values']
    valid_units = set()
    for r in range(2, ws_vv.max_row + 1):
        val = ws_vv.cell(r, 1).value
        if val:
            valid_units.add(val.strip())
    print(f"âœ“ Loaded {len(valid_units)} valid units from 'Valid Values'")

    valid_currencies = set()
    for r in range(2, ws_vv.max_row + 1):
        val = ws_vv.cell(r, 3).value
        if val:
            valid_currencies.add(val.strip())
    print(f"âœ“ Loaded {len(valid_currencies)} valid currencies: {valid_currencies}")

    # 2. Template
    ws = wb['Template']
    assert ws.max_row == 259, f"Expected 259 rows, got {ws.max_row}"
    assert ws.max_column == 17, f"Expected 17 columns, got {ws.max_column}"
    print(f"âœ“ Template dimensions: {ws.max_row} rows, {ws.max_column} columns")

    # 3. Headers
    expected_headers = [
        'Product Title', 'Description', 'Keyword(s)', 'Image URL 1', 'Image Caption 1',
        'Image URL 2', 'Image Caption 2', 'Image URL 3', 'Image Caption 3', 'Website link',
        'Fixed Price', 'Minimum Price', 'Maximum Price', 'Currency', 'Minimum Order Quantity',
        'Unit', 'Help column'
    ]
    actual_headers = [ws.cell(2, c).value for c in range(1, 18)]
    assert actual_headers == expected_headers, f"Header mismatch: {actual_headers}"
    print("âœ“ Row 2 headers match perfectly")

    # 4. Check all rows 3 to 259
    errors = []
    titles = set()
    total_products = 0

    for r in range(3, 260):
        total_products += 1
        title = ws.cell(r, 1).value
        desc = ws.cell(r, 2).value
        kws = ws.cell(r, 3).value
        img1 = ws.cell(r, 4).value
        cap1 = ws.cell(r, 5).value
        img2 = ws.cell(r, 6).value
        cap2 = ws.cell(r, 7).value
        img3 = ws.cell(r, 8).value
        cap3 = ws.cell(r, 9).value
        web_link = ws.cell(r, 10).value
        fixed_p = ws.cell(r, 11).value
        min_p = ws.cell(r, 12).value
        max_p = ws.cell(r, 13).value
        curr = ws.cell(r, 14).value
        moq = ws.cell(r, 15).value
        unit = ws.cell(r, 16).value
        help_c = ws.cell(r, 17).value

        # Title
        if not title or not isinstance(title, str) or not title.strip():
            errors.append(f"Row {r}: Title missing or invalid")
        titles.add(title)

        # Description
        if not desc or not isinstance(desc, str) or len(desc.strip()) < 10:
            errors.append(f"Row {r}: Description missing or too short ({desc})")

        # Keywords (1 to 15 items)
        if not kws or not isinstance(kws, str):
            errors.append(f"Row {r}: Keywords missing")
        else:
            kw_list = [k.strip() for k in kws.split(',') if k.strip()]
            if len(kw_list) < 1 or len(kw_list) > 15:
                errors.append(f"Row {r}: Keywords count {len(kw_list)} not in range [1, 15]")

        # Image URL 1
        if not img1 or not isinstance(img1, str) or not img1.startswith("https://"):
            errors.append(f"Row {r}: Image URL 1 invalid ({img1})")

        # Caption 1 (between 3 and 40 chars)
        if cap1:
            if len(cap1) < 3 or len(cap1) > 40:
                errors.append(f"Row {r}: Caption 1 length {len(cap1)} not in [3, 40] ('{cap1}')")

        # Image 2 & Caption 2
        if img2 and not img2.startswith("https://"):
            errors.append(f"Row {r}: Image URL 2 invalid ({img2})")
        if cap2 and (len(cap2) < 3 or len(cap2) > 40):
            errors.append(f"Row {r}: Caption 2 length {len(cap2)} not in [3, 40] ('{cap2}')")

        # Image 3 & Caption 3
        if img3 and not img3.startswith("https://"):
            errors.append(f"Row {r}: Image URL 3 invalid ({img3})")
        if cap3 and (len(cap3) < 3 or len(cap3) > 40):
            errors.append(f"Row {r}: Caption 3 length {len(cap3)} not in [3, 40] ('{cap3}')")

        # Website link
        if not web_link or not web_link.startswith("https://aelbd.net/products/"):
            errors.append(f"Row {r}: Website link invalid ({web_link})")

        # Pricing numbers
        if fixed_p is not None and not isinstance(fixed_p, (int, float)):
            errors.append(f"Row {r}: Fixed price not numeric ({fixed_p})")
        if min_p is not None and not isinstance(min_p, (int, float)):
            errors.append(f"Row {r}: Min price not numeric ({min_p})")
        if max_p is not None and not isinstance(max_p, (int, float)):
            errors.append(f"Row {r}: Max price not numeric ({max_p})")

        # MOQ
        if moq is not None and not isinstance(moq, (int, float)):
            errors.append(f"Row {r}: MOQ not numeric ({moq})")

        # Unit
        if unit not in valid_units:
            errors.append(f"Row {r}: Unit '{unit}' not in Valid Values")

        # Currency formula
        expected_curr = f'=IF(Q{r}=TRUE,"USD","")'
        if curr != expected_curr:
            errors.append(f"Row {r}: Currency formula mismatch ({curr} != {expected_curr})")

        # Help column formula
        expected_help = f'=OR(K{r}>0,L{r}>0,M{r}>0)'
        if help_c != expected_help:
            errors.append(f"Row {r}: Help column formula mismatch ({help_c} != {expected_help})")

    print(f"âœ“ Checked {total_products} products.")
    if errors:
        print(f"â Œ FOUND {len(errors)} ERRORS:")
        for e in errors[:10]:
            print("  -", e)
    else:
        print("âœ“ 0 errors found! 100% compliant with Europages restrictions and rules!")

    # Check sample row print
    print("\n--- SAMPLE PRODUCT ROW 3 ---")
    for c in range(1, 18):
        val = str(ws.cell(3, c).value)
        if len(val) > 70:
            val = val[:67] + "..."
        print(f"  Col {c:2d} ({expected_headers[c-1]}): {val}")

if __name__ == "__main__":
    verify()

