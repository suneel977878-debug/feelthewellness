import pandas as pd
import glob
import os
import shutil
import re
import math
import json
import difflib

def clean_brand(text):
    if pd.isna(text):
        return ""
    # Replace all variations of Kaamastra / Kamasutra with FeelTheWellness
    pattern = re.compile(r'(?i)(kaamastra(\'s)?|kamasutra(\'s)?)')
    return pattern.sub('FeelTheWellness', str(text)).strip()

def parse_price(val):
    if pd.isna(val):
        return 0
    # Extract numbers
    s = str(val).replace(',', '')
    nums = re.findall(r'\d+\.?\d*', s)
    if nums:
        return int(float(nums[0]))
    return 0

def get_subcategory(title, category):
    t = title.lower()
    
    def has(words):
        return any(re.search(r'\b' + w + r'\b', t) for w in words)
        
    if has(['condom', 'condoms']): return 'Condoms'
    if has(['lubricant', 'lube', 'gel', 'oil', 'cream']): return 'Lubricants'
    if has(['pill', 'delay', 'spray', 'supplement', 'capsule']): return 'Supplements'
    if has(['lingerie', 'bra', 'panty', 'costume', 'dress', 'thong', 'bikini', 'underwear', 'briefs']): return 'Lingerie'
    if has(['ring', 'cockring']): return 'Cock Rings'
    if has(['anal', 'plug', 'beads', 'prostate']): return 'Anal Toys'
    if has(['bondage', 'whip', 'gag', 'cuff', 'cuffs', 'collar', 'chastity', 'blindfold', 'spank', 'paddle', 'rope', 'restraint']): return 'Bondage & BDSM'
    if has(['masturbator', 'masturbating', 'masturabating', 'fleshlight', 'stroker', 'cup', 'pocket pussy', 'sleeve', 'buttock']): return 'Male Masturbators'
    if has(['pump', 'enhancer']): return 'Pumps & Enhancers'
    if has(['dildo', 'dong']): return 'Dildos'
    if has(['vibrator', 'vibrating', 'wand', 'massage', 'massager', 'bullet', 'rabbit']): return 'Vibrators & Wands'
    
    # Fallbacks based on category
    if category == 'Lingerie & Clothing': return 'Lingerie'
    if category == 'BDSM & Bondage': return 'Bondage & BDSM'
    if category == 'Supplements & Condoms': return 'Supplements'
    return 'All Toys'

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

category_mapping = {
    'women': 'Women Sex Toys',
    'man': 'Men Sex Toys',
    'lgbt and couple': 'Couples Toys',
    'bondage and bdsm': 'BDSM & Bondage',
    'lingriee and clothings ': 'Lingerie & Clothing',
    'sex suppliments and cindoms': 'Supplements & Condoms'
}

products = []
product_id_counter = 1

public_products_dir = 'public/products'
if os.path.exists(public_products_dir):
    shutil.rmtree(public_products_dir)
os.makedirs(public_products_dir, exist_ok=True)

excel_files = glob.glob('updated imagge/*.xlsx')

for excel_file in excel_files:
    filename = os.path.basename(excel_file).replace('.xlsx', '')
    cat_name = category_mapping.get(filename, 'Other')
    
    try:
        df = pd.read_excel(excel_file)
    except Exception as e:
        print(f"Error reading {excel_file}: {e}")
        continue
        
    for index, row in df.iterrows():
        # Get title
        raw_title = row.get('title')
        if pd.isna(raw_title) and 'name_4' in df.columns:
            raw_title = row.get('name_4')
        if pd.isna(raw_title):
            continue
            
        title = clean_brand(raw_title)
        
        # Get price
        price = 0
        if 'price' in df.columns and not pd.isna(row['price']):
            price = parse_price(row['price'])
        elif 'price_2' in df.columns and not pd.isna(row['price_2']):
            price = parse_price(row['price_2'])
        elif 'price_1' in df.columns and not pd.isna(row['price_1']):
            price = parse_price(row['price_1'])
            
        if price == 0: price = 1999 # Fallback
            
        # Get description
        desc = ""
        if 'product_description_2' in df.columns and not pd.isna(row['product_description_2']):
            desc = clean_brand(row['product_description_2'])
        elif 'product_description' in df.columns and not pd.isna(row['product_description']):
            desc = clean_brand(row['product_description'])
            
        if not desc:
            desc = f"Premium {title} designed for maximum pleasure."
            
        # Find images
        def get_img_num(x):
            name_without_ext = os.path.splitext(x)[0]
            if name_without_ext.isdigit():
                num = int(name_without_ext)
                if num == 1: return 998
                return num
            match = re.search(r'-(\d+)$', name_without_ext)
            if match:
                num = int(match.group(1))
                if num == 1: return 998
                return num
            return -1 # Base file with no dash is absolute first

        # Search across all subdirectories in 'updated imagge'
        best_match = None
        best_ratio = 0
        best_parent_dir = None
        
        for main_dir in os.listdir('updated imagge'):
            main_dir_path = os.path.join('updated imagge', main_dir)
            if not os.path.isdir(main_dir_path): continue
            
            dirs = [d for d in os.listdir(main_dir_path) if os.path.isdir(os.path.join(main_dir_path, d))]
            for d in dirs:
                ratio = difflib.SequenceMatcher(None, d.lower(), str(raw_title).lower()).ratio()
                if ratio > best_ratio:
                    best_ratio = ratio
                    best_match = d
                    best_parent_dir = main_dir_path
                    
        image_paths = []
        if best_match and best_ratio > 0.4:
            image_source_dir = os.path.join(best_parent_dir, best_match)
            
            sorted_imgs = sorted(os.listdir(image_source_dir), key=get_img_num)
            for img_file in sorted_imgs:
                if img_file.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                    safe_name = f"prod_{product_id_counter}_{len(image_paths)}.jpg"
                    shutil.copy(os.path.join(image_source_dir, img_file), os.path.join(public_products_dir, safe_name))
                    image_paths.append(f"/products/{safe_name}")
                    
        if not image_paths:
            image_paths = ['/hero.png'] # Safe fallback placeholder

        subcat = get_subcategory(title, cat_name)
        
        # Features extraction
        features = ["Premium Materials", "Discreet Shipping"]
        if "waterproof" in desc.lower(): features.append("100% Waterproof")
        if "rechargeable" in desc.lower(): features.append("USB Rechargeable")
        if "vibration" in desc.lower() or "vibrating" in desc.lower(): features.append("Multiple Vibration Modes")

        prod_obj = {
            "id": product_id_counter,
            "name": title,
            "price": price,
            "category": cat_name,
            "subcategory": subcat,
            "description": desc,
            "silhouetteType": "wand" if "wand" in title.lower() else "dildo" if "dildo" in title.lower() else "vibrator",
            "color": "#ff2a85",
            "features": features,
            "isNew": product_id_counter % 5 == 0,
            "isBestSeller": product_id_counter % 7 == 0,
            "isOnSale": product_id_counter % 6 == 0,
            "discountPercent": 15 if product_id_counter % 6 == 0 else 0,
            "rating": 4.8,
            "reviews": 12,
            "images": image_paths
        }
        
        products.append(prod_obj)
        product_id_counter += 1

print(f"Successfully processed {len(products)} products.")

# Now write to src/data/products.ts
ts_content = f"""
export type Product = {{
  id: number;
  name: string;
  price: number;
  category: string;
  subcategory?: string;
  description: string;
  silhouetteType: string;
  color: string;
  features: string[];
  isNew?: boolean;
  isBestSeller?: boolean;
  isOnSale?: boolean;
  discountPercent?: number;
  rating: number;
  reviews: number;
  images: string[];
}};

export const categories = [
  {{ id: 'women', name: 'Women Sex Toys' }},
  {{ id: 'men', name: 'Men Sex Toys' }},
  {{ id: 'couples', name: 'Couples Toys' }},
  {{ id: 'bdsm', name: 'BDSM & Bondage' }},
  {{ id: 'lingerie', name: 'Lingerie & Clothing' }},
  {{ id: 'supplements', name: 'Supplements & Condoms' }}
];

export const categoryTree = [
  {{ id: 'women', name: 'Women Sex Toys', subcategories: ['Vibrators & Wands', 'Dildos', 'Anal Toys', 'Lingerie', 'All Toys'] }},
  {{ id: 'men', name: 'Men Sex Toys', subcategories: ['Male Masturbators', 'Cock Rings', 'Anal Toys', 'All Toys'] }},
  {{ id: 'couples', name: 'Couples Toys', subcategories: ['Vibrators & Wands', 'Bondage & BDSM', 'All Toys'] }},
  {{ id: 'bdsm', name: 'BDSM & Bondage', subcategories: ['Bondage & BDSM', 'Lingerie', 'All Toys'] }},
  {{ id: 'lingerie', name: 'Lingerie & Clothing', subcategories: ['Lingerie', 'All Toys'] }},
  {{ id: 'supplements', name: 'Supplements & Condoms', subcategories: ['Condoms', 'Lubricants', 'Supplements', 'All Toys'] }},
  {{ id: 'other', name: 'Other', subcategories: ['All Toys'] }}
];

export const products: Product[] = {json.dumps(products, indent=2)};
"""

with open('src/data/products.ts', 'w') as f:
    f.write(ts_content)

print("Written to src/data/products.ts")
