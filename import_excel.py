import pandas as pd
import json
import os
import requests
import uuid
import re

FILES = [
    {"path": "new products/Sex Dolls.xlsx", "category": "Men Sex Toys", "subcategory": "Sex Dolls", "type": "doll"},
    {"path": "new products/sex doll,s.xlsx", "category": "Men Sex Toys", "subcategory": "Sex Dolls", "type": "doll"},
    {"path": "new products/dildos.xlsx", "category": "Women Sex Toys", "subcategory": "Dildos", "type": "dildo"}
]

IMG_DIR = "public/products"
os.makedirs(IMG_DIR, exist_ok=True)

seen_titles = set()
products_to_insert = []

def clean_description(about_item, desc):
    text = ""
    if pd.notna(about_item):
        text += str(about_item)
    if pd.notna(desc):
        if text:
            text += "\n"
        text += str(desc)
    
    # Remove amazon links, asins, etc
    text = re.sub(r'http\S+', '', text)
    text = text.replace('Amazon', 'our store').replace('amazon', 'our store')
    text = text.strip()
    if not text or text.lower() == 'nan':
        return "Experience premium pleasure with this meticulously designed adult wellness product. Crafted from body-safe, high-quality materials for your ultimate satisfaction."
    return text[:1000]

def parse_price(price_str):
    if pd.isna(price_str):
        return 4999.0
    s = str(price_str).replace('$', '').replace(',', '').strip()
    try:
        usd = float(s)
        # Convert to INR approx
        inr = usd * 83
        return round(inr)
    except:
        return 4999.0

def extract_main_image(row):
    url = ""
    # Try all possible image columns
    for col in ['image', 'images', 'image_22', 'url', 'image_1', 'image_4', 'image_2']:
        val = row.get(col)
        if pd.notna(val) and str(val).strip():
            # If it's a JSON string
            if str(val).strip().startswith('['):
                try:
                    imgs = json.loads(str(val))
                    if isinstance(imgs, list) and len(imgs) > 0:
                        if 'hiRes' in imgs[0] and imgs[0]['hiRes']:
                            return imgs[0]['hiRes']
                        elif 'large' in imgs[0] and imgs[0]['large']:
                            return imgs[0]['large']
                except:
                    pass
            # If it's a newline separated string
            if '\n' in str(val):
                return str(val).split('\n')[0].strip()
            # If it's a simple URL
            if str(val).startswith('http'):
                return str(val).strip()
    return url

sql_statements = []

for file_info in FILES:
    df = pd.read_excel(file_info["path"], engine="openpyxl")
    print(f"Processing {file_info['path']} ({len(df)} rows)")
    
    for idx, row in df.iterrows():
        title = ""
        for col in ['title', 'name', 'product_name', 'item_page_title']:
            val = row.get(col)
            if pd.notna(val) and str(val).strip():
                title = str(val).strip()
                break
                
        if not title or title.lower() == 'nan':
            continue
            
        # Basic dedup
        normalized_title = title.lower().strip()[:50]
        if normalized_title in seen_titles:
            continue
        seen_titles.add(normalized_title)
        
        desc = clean_description(row.get('about_item'), row.get('description'))
        price = parse_price(row.get('price'))
        
        # Determine image
        img_url = extract_main_image(row)
        
        # Strip thumbnail suffixes from Amazon links (e.g. ._AC_US40_.jpg -> .jpg)
        if img_url and 'm.media-amazon.com' in img_url:
            img_url = re.sub(r'\._[^_]+_\.', '.', img_url)
        
        local_img_path = ""
        if img_url and str(img_url).startswith('http'):
            # Download it
            ext = str(img_url).split('.')[-1]
            if len(ext) > 4 or ext not in ['jpg', 'png', 'jpeg', 'webp', 'gif']:
                ext = 'jpg'
            filename = f"prod_{file_info['type']}_{uuid.uuid4().hex[:8]}.{ext}"
            filepath = os.path.join(IMG_DIR, filename)
            try:
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
                }
                r = requests.get(img_url, headers=headers, timeout=10)
                if r.status_code == 200:
                    with open(filepath, 'wb') as f:
                        f.write(r.content)
                    local_img_path = f"/products/{filename}"
                else:
                    print(f"Failed to download {img_url}: Status {r.status_code}")
            except Exception as e:
                print(f"Failed to download {img_url}: {e}")
        
        if not local_img_path:
            # Fallback
            local_img_path = "/products/default_product.jpg"
            
        # Build SQL
        # We need to escape quotes properly for SQL
        safe_title = title.replace("'", "\\'").replace('"', '\\"')
        safe_desc = desc.replace("'", "\\'").replace('"', '\\"')
        images_json = json.dumps([local_img_path]).replace("'", "\\'")
        features_json = "[]"
        
        sql = f"""INSERT INTO Product (name, price, description, images, category, subcategory, features, isNew, isBestSeller, isOnSale, rating, reviews, color, silhouetteType, createdAt, updatedAt)
VALUES ('{safe_title}', {price}, '{safe_desc}', '{images_json}', '{file_info['category']}', '{file_info['subcategory']}', '{features_json}', 1, 1, 1, 5.0, {idx + 10}, 'Default', 'Standard', NOW(), NOW());"""
        
        sql_statements.append(sql)

with open("import_new_products.sql", "w") as f:
    f.write("\n".join(sql_statements))
    
print(f"Generated {len(sql_statements)} INSERT statements in import_new_products.sql")
