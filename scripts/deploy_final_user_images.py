import os
from PIL import Image

USER_UPLOADED_DIR = r"C:\Users\DELL\.gemini\antigravity\brain\a38d3e45-8298-481c-9b51-347c10493782\.user_uploaded"
OUT_OFFICE = r"c:\Users\DELL\OneDrive\Desktop\AELBDNET\public\images\office"
OUT_3D = r"c:\Users\DELL\OneDrive\Desktop\AELBDNET\public\images\3d"

# The latest and finest customized images provided by the user:
IMG_WIDE_EST2008  = os.path.join(USER_UPLOADED_DIR, "media_1794652915799_e44e488a.jpg") # Wide showroom with table, vase, leather folder, EST. 2008 sign
IMG_RACK_EST2008  = os.path.join(USER_UPLOADED_DIR, "media_1794652990677_3d3bcdf1.jpg") # Focused on racks with EST. 2008 sign and swatches
IMG_DOUBLE_RACK_EYE = os.path.join(USER_UPLOADED_DIR, "media_1794653031975_eba1dbeb.jpg") # Eye-level double rack with swatches and sketches
IMG_DOUBLE_RACK_TOP = os.path.join(USER_UPLOADED_DIR, "media_1794652288535_affa5c70.jpg") # Top-down angle double rack with warm light
IMG_DARK_BOARDROOM = os.path.join(USER_UPLOADED_DIR, "media_1794652205733_9929e318.jpg") # Dark executive timber suite (for Dark mode)
IMG_WIDE_PLANT    = os.path.join(USER_UPLOADED_DIR, "media_1794651802305_1f0da2f3.jpg") # Wide showroom with potted plants & table

def deploy(src, dest):
    img = Image.open(src).convert("RGB")
    img.save(dest, "JPEG", quality=95, optimize=True)
    print(f"✅ Deployed: {os.path.basename(dest)} from {os.path.basename(src)} ({img.size})")

# 1. 3D Homepage Component (ProductionProcess3D.tsx - "Introducing Apparel Emporium")
deploy(IMG_WIDE_EST2008, os.path.join(OUT_3D, "luxury_office_showroom_light.jpg"))
deploy(IMG_WIDE_EST2008, os.path.join(OUT_3D, "mannequin_studio_light.jpg"))
deploy(IMG_DARK_BOARDROOM, os.path.join(OUT_3D, "luxury_office_showroom_dark.jpg"))
deploy(IMG_DARK_BOARDROOM, os.path.join(OUT_3D, "mannequin_studio_dark.jpg"))

# 2. Office Showroom Gallery & Sliders (About & Contact Pages)
deploy(IMG_WIDE_EST2008, os.path.join(OUT_OFFICE, "luxury_executive_showroom.jpg"))
deploy(IMG_WIDE_PLANT, os.path.join(OUT_OFFICE, "luxury_buyer_lounge.jpg"))
deploy(IMG_DARK_BOARDROOM, os.path.join(OUT_OFFICE, "luxury_executive_boardroom.jpg"))
deploy(IMG_DOUBLE_RACK_EYE, os.path.join(OUT_OFFICE, "knit_woven_double_rack.jpg"))
deploy(IMG_RACK_EST2008, os.path.join(OUT_OFFICE, "apparel_collection_racks.jpg"))
deploy(IMG_DOUBLE_RACK_TOP, os.path.join(OUT_OFFICE, "vertical_sample_display.jpg"))

# 3. Supporting office files (for legacy & background components)
deploy(IMG_WIDE_EST2008, os.path.join(OUT_OFFICE, "boardroom_conference_table.jpg"))
deploy(IMG_WIDE_PLANT, os.path.join(OUT_OFFICE, "showroom_lounge_wide.jpg"))
deploy(IMG_RACK_EST2008, os.path.join(OUT_OFFICE, "sample_racks_shirts.jpg"))
deploy(IMG_WIDE_PLANT, os.path.join(OUT_OFFICE, "meeting_room_perspective.jpg"))

print("\n🚀 All user images deployed successfully!")
