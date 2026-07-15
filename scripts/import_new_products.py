import os
import glob
import re
import math
import json
import difflib
from PIL import Image
import pandas as pd

# ---------------- CONFIGURATION ----------------
SOURCE_DIR = "/home/parrot/Pictures/updated imagge"
OUTPUT_IMG_DIR = "/home/parrot/Downloads/Telegram Desktop/SexToys_Project/public/products"
SQL_OUTPUT = "/home/parrot/Downloads/Telegram Desktop/SexToys_Project/scripts/import_batch.sql"

# Starting ID (Live DB max is ~823)
# To be safe, we'll fetch max id dynamically or just start high enough
STARTING_ID = 1000

# Created At (To ensure they sort below current items)
CREATED_AT = "2025-01-01 00:00:00"

CATEGORY_MAPPING = {
    'man': 'Men Sex Toys',
    'women': 'Women Sex Toys',
    'lgbt and couple': 'Couples Toys',
    'bondage and bdsm': 'BDSM & Bondage',
    'lingriee and clothings ': 'Lingerie & Clothing',
    'sex suppliments and cindoms': 'Supplements & Condoms'
}

# ---------------- HELPERS ----------------

def clean_brand(text):
    if pd.isna(text):
        return ""
    pattern = re.compile(r'(?i)(kaamastra(\'s)?|kamasutra(\'s)?)')
    return pattern.sub('FeelTheWellness', str(text)).strip().replace("'", "''")

def parse_price(val):
    if pd.isna(val):
        return 1999
    s = str(val).replace(',', '')
    nums = re.findall(r'\d+\.?\d*', s)
    if nums:
        return int(float(nums[0]))
    return 1999

def get_subcategory(title, category):
    t = title.lower()
    def has(words):
        return any(re.search(r'\b' + w + r'\b', t) for w in words)
        
    if has(['condom', 'condoms']): return 'Condoms'
    if has(['lubricant', 'lube', 'gel', 'oil', 'cream', 'spray', 'delay']): return 'Lubricants'
    if has(['pill', 'supplement', 'capsule']): return 'Supplements'
    if has(['lingerie', 'bra', 'panty', 'costume', 'dress', 'thong', 'bikini', 'underwear', 'briefs', 'stocking', 'babydoll', 'catsuit', 'skirt']): return 'Lingerie'
    if has(['ring', 'cockring', 'cock ring']): return 'Cock Rings'
    if has(['anal', 'plug', 'beads', 'prostate']): return 'Anal Toys'
    if has(['bondage', 'whip', 'gag', 'cuff', 'cuffs', 'collar', 'chastity', 'blindfold', 'spank', 'paddle', 'rope', 'restraint', 'harness', 'flogger', 'clamp', 'clip']): return 'Bondage & BDSM'
    if has(['masturbator', 'masturbating', 'masturabating', 'fleshlight', 'stroker', 'cup', 'pocket pussy', 'sleeve', 'buttock', 'pussy', 'vagina']): return 'Male Masturbators'
    if has(['pump', 'enhancer', 'extender']): return 'Pumps & Enhancers'
    if has(['dildo', 'dong']): return 'Dildos'
    if has(['doll']): return 'Sex Dolls'
    if has(['vibrator', 'vibrating', 'wand', 'massage', 'massager', 'bullet', 'rabbit', 'egg', 'clit', 'sucker', 'thrusting']): return 'Vibrators & Wands'
    
    # Fallbacks based on category
    if category == 'Lingerie & Clothing': return 'Lingerie'
    if category == 'BDSM & Bondage': return 'Bondage & BDSM'
    if category == 'Supplements & Condoms': return 'Supplements'
    if category == 'Men Sex Toys': return 'Male Masturbators'
    if category == 'Women Sex Toys': return 'Vibrators & Wands'
    
    return 'All Toys'

# ---------------- MAIN ----------------

def main():
    os.makedirs(OUTPUT_IMG_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(SQL_OUTPUT), exist_ok=True)

    products = []
    current_id = STARTING_ID
    
    excel_files = glob.glob(os.path.join(SOURCE_DIR, '*.xlsx'))
    
    for excel_file in excel_files:
        filename = os.path.basename(excel_file).replace('.xlsx', '')
        # Map category
        cat_name = CATEGORY_MAPPING.get(filename, 'Other')
        
        try:
            df = pd.read_excel(excel_file)
        except Exception as e:
            print(f"Error reading {excel_file}: {e}")
            continue
            
        print(f"Processing category: {cat_name} from {filename}.xlsx")
        
        for index, row in df.iterrows():
            raw_title = row.get('title')
            if pd.isna(raw_title) and 'name_4' in df.columns:
                raw_title = row.get('name_4')
            if pd.isna(raw_title) or str(raw_title).strip() == '':
                continue
                
            title = clean_brand(raw_title)
            
            # Price
            price = 0
            if 'price' in df.columns and not pd.isna(row['price']):
                price = parse_price(row['price'])
            elif 'price_2' in df.columns and not pd.isna(row['price_2']):
                price = parse_price(row['price_2'])
            elif 'price_1' in df.columns and not pd.isna(row['price_1']):
                price = parse_price(row['price_1'])
            if price == 0: 
                price = 1999
                
            # Description
            desc = ""
            if 'product_description_2' in df.columns and not pd.isna(row['product_description_2']):
                desc = clean_brand(row['product_description_2'])
            elif 'product_description' in df.columns and not pd.isna(row['product_description']):
                desc = clean_brand(row['product_description'])
            if not desc:
                desc = f"Premium {title} designed for maximum pleasure."
                
            # Subcategory
            subcat = get_subcategory(raw_title, cat_name)
            
            # Features
            features = ["Premium Materials", "Discreet Shipping"]
            if "waterproof" in desc.lower(): features.append("100% Waterproof")
            if "rechargeable" in desc.lower(): features.append("USB Rechargeable")
            if "vibration" in desc.lower() or "vibrating" in desc.lower(): features.append("Multiple Vibration Modes")
            features_json = json.dumps(features).replace("'", "''")

            # Images finding
            # Best match folder inside SOURCE_DIR / filename
            parent_dir = os.path.join(SOURCE_DIR, filename)
            best_match = None
            best_ratio = 0
            
            if os.path.isdir(parent_dir):
                dirs = [d for d in os.listdir(parent_dir) if os.path.isdir(os.path.join(parent_dir, d))]
                for d in dirs:
                    ratio = difflib.SequenceMatcher(None, d.lower(), str(raw_title).lower()).ratio()
                    if ratio > best_ratio:
                        best_ratio = ratio
                        best_match = d
            
            image_paths = []
            if best_match and best_ratio > 0.4:
                img_dir = os.path.join(parent_dir, best_match)
                
                # Custom sort function for img numbering
                def get_img_num(x):
                    name_no_ext = os.path.splitext(x)[0]
                    if name_no_ext.isdigit():
                        return int(name_no_ext) if int(name_no_ext) != 1 else 998
                    match = re.search(r'-(\d+)$', name_no_ext)
                    if match:
                        n = int(match.group(1))
                        return n if n != 1 else 998
                    match2 = re.search(r'_(\d+)$', name_no_ext)
                    if match2:
                        n = int(match2.group(1))
                        return n if n != 1 else 998
                    return -1
                    
                valid_imgs = [f for f in os.listdir(img_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))]
                sorted_imgs = sorted(valid_imgs, key=get_img_num)
                
                for img_file in sorted_imgs:
                    img_src = os.path.join(img_dir, img_file)
                    safe_name = f"prod_{current_id}_{len(image_paths)}.webp"
                    img_dest = os.path.join(OUTPUT_IMG_DIR, safe_name)
                    
                    try:
                        # Convert to WebP
                        with Image.open(img_src) as img:
                            img.convert("RGB").save(img_dest, "webp", quality=85)
                        image_paths.append(f"/products/{safe_name}")
                    except Exception as e:
                        print(f"Failed to process image {img_src}: {e}")
                        
            if not image_paths:
                image_paths = ['/hero.webp']
                
            images_json = json.dumps(image_paths)
            
            sql = f"""INSERT IGNORE INTO Product (id, name, price, description, images, category, subcategory, features, isNew, isBestSeller, isOnSale, discountPercent, rating, reviews, color, silhouetteType, createdAt, updatedAt) VALUES ({current_id}, '{title}', {price}, '{desc}', '{images_json}', '{cat_name}', '{subcat}', '{features_json}', 0, 0, 0, NULL, 5.0, 12, 'Default', 'Standard', '{CREATED_AT}', NOW());"""
            
            products.append(sql)
            current_id += 1

    with open(SQL_OUTPUT, 'w') as f:
        f.write("SET NAMES utf8mb4;\\n")
        f.write("\\n".join(products))
        f.write("\\n")
        
    print(f"\\nSuccessfully generated {len(products)} INSERT statements in {SQL_OUTPUT}")
    print("Images converted to WebP successfully.")

if __name__ == "__main__":
    main()
