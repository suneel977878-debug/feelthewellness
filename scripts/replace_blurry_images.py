import os
import re
import ssl
import zipfile
import requests
import pymysql
from io import BytesIO
from PIL import Image

BASE_DIR = '/home/parrot/Downloads/Telegram Desktop/SexToys_Project'
PUBLIC_PRODUCTS_DIR = os.path.join(BASE_DIR, 'public', 'products')

RAW_EXCEL_FILES = [
    os.path.join(BASE_DIR, 'new products', 'sex doll,s.xlsx'),
    os.path.join(BASE_DIR, 'new products', 'Sex Dolls.xlsx'),
    os.path.join(BASE_DIR, 'new products', 'dildos.xlsx'),
]

MIN_SIZE_THRESHOLD = 200  # Replace images smaller than 200x200

# Load DB credentials from .env.local (keep secrets out of source control)
def _load_db_config():
    env_file = os.path.join(BASE_DIR, '.env.local')
    url = None
    if os.path.exists(env_file):
        for line in open(env_file):
            if line.startswith('DATABASE_URL='):
                url = line.split('=', 1)[1].strip().strip('"')
    if not url:
        raise RuntimeError("DATABASE_URL not found in .env.local")
    m = re.search(r'mysql://(.*?):(.*?)@(.*?):(\d+)/(.*?)(\?|$)', url)
    if not m:
        raise RuntimeError("Could not parse DATABASE_URL")
    return {'host': m.group(3), 'port': int(m.group(4)),
            'user': m.group(1), 'password': m.group(2), 'database': m.group(5)}

DB = _load_db_config()


def get_db_conn():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    return pymysql.connect(**DB, ssl={'ssl': ctx},
                           cursorclass=pymysql.cursors.DictCursor, connect_timeout=10)


def to_high_res_amazon(url):
    """Strip Amazon size/format modifier string to get full resolution image."""
    return re.sub(r'\._[^/]+_\.(jpg|png|webp)', r'.\1', url)


def parse_xlsx_raw(xlsx_path):
    """Parse xlsx using zipfile. Returns {name_lower: [url, url, ...]}"""
    products = {}
    try:
        with zipfile.ZipFile(xlsx_path, 'r') as z:
            with z.open('xl/worksheets/sheet1.xml') as ws:
                content = ws.read().decode('utf-8', errors='replace')

        content = content.replace('&amp;', '&')
        rows = content.split('<row r=')
        for row in rows[1:]:
            texts = re.findall(r'<t>(.*?)</t>', row)
            if len(texts) < 3:
                continue
            name = texts[2].strip()
            if not name or 'web_scraper' in name.lower() or name.startswith('https://'):
                continue

            img_urls = []
            seen_urls = set()
            for t in texts:
                if 'https://' in t and any(ext in t.lower() for ext in ['.jpg', '.webp', '.png']):
                    url = to_high_res_amazon(t) if 'amazon.com' in t else t
                    if url not in seen_urls:
                        seen_urls.add(url)
                        img_urls.append(url)

            if img_urls and name:
                products[name.lower()] = {'name': name, 'urls': img_urls}

    except Exception as e:
        print(f"Error parsing {xlsx_path}: {e}")
    return products


def get_all_products_from_db():
    """Returns {pid: name} for all products."""
    pid_to_name = {}
    print("Connecting to live database...")
    conn = get_db_conn()
    with conn.cursor() as c:
        c.execute("SELECT id, name FROM Product")
        for row in c.fetchall():
            pid_to_name[row['id']] = row['name']
    conn.close()
    print(f"Loaded {len(pid_to_name)} products from DB.")
    return pid_to_name


def get_image_size(filepath):
    try:
        with Image.open(filepath) as img:
            return img.size
    except:
        return (0, 0)


def download_and_replace_small_images():
    # Step 1: load raw xlsx -> name: urls (exact match only)
    print("Parsing raw Excel files for high-res image URLs...")
    all_excel = {}
    for xlsx in RAW_EXCEL_FILES:
        data = parse_xlsx_raw(xlsx)
        all_excel.update(data)
    print(f"Found {len(all_excel)} unique products in raw Excel files.")

    # Step 2: Get all product names from live DB
    pid_to_name = get_all_products_from_db()

    # Step 3: Scan for small images
    print(f"\nScanning {PUBLIC_PRODUCTS_DIR} for small images...")
    small_by_product = {}
    for fn in sorted(os.listdir(PUBLIC_PRODUCTS_DIR)):
        if not (fn.endswith('.webp') or fn.endswith('.jpg')):
            continue
        if not fn.startswith('prod_'):
            continue
        parts = fn.split('_')
        if len(parts) < 3 or not parts[1].isdigit():
            continue
        pid = int(parts[1])
        fp = os.path.join(PUBLIC_PRODUCTS_DIR, fn)
        w, h = get_image_size(fp)
        if w < MIN_SIZE_THRESHOLD or h < MIN_SIZE_THRESHOLD:
            if pid not in small_by_product:
                small_by_product[pid] = []
            idx_str = parts[2].replace('.webp', '').replace('.jpg', '')
            idx = int(idx_str) if idx_str.isdigit() else -1
            small_by_product[pid].append({
                'filename': fn, 'filepath': fp, 'index': idx, 'size': (w, h)
            })

    total_small = sum(len(v) for v in small_by_product.values())
    print(f"Found {total_small} small images across {len(small_by_product)} products.\n")

    # Step 4: Replace each small image using EXACT name match only
    replaced = 0
    skipped_no_data = 0
    skipped_no_url = 0
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

    for pid, small_images in sorted(small_by_product.items()):
        db_name = pid_to_name.get(pid, '')
        db_name_lower = db_name.lower().strip()

        # Try exact match; also try without FeelTheWellness prefix
        excel_data = all_excel.get(db_name_lower)
        if not excel_data and db_name.startswith('FeelTheWellness '):
            clean = db_name.replace('FeelTheWellness ', '', 1).lower().strip()
            excel_data = all_excel.get(clean)

        if not excel_data:
            print(f"  SKIP product {pid} ({db_name[:55]}): No Excel match.")
            skipped_no_data += 1
            continue

        urls = excel_data['urls']
        print(f"Product {pid} ({excel_data['name'][:55]}) - {len(small_images)} small images, {len(urls)} urls")

        for item in small_images:
            idx = item['index']
            if idx < 0 or idx >= len(urls):
                skipped_no_url += 1
                continue

            url = urls[idx]
            try:
                resp = requests.get(url, timeout=15, headers=headers)
                if resp.status_code != 200:
                    print(f"  [{idx}] HTTP {resp.status_code}")
                    continue

                img = Image.open(BytesIO(resp.content))
                w, h = img.size
                if w < MIN_SIZE_THRESHOLD or h < MIN_SIZE_THRESHOLD:
                    print(f"  [{idx}] Downloaded still small ({w}x{h}). Skipping.")
                    continue

                if img.mode in ("RGBA", "P"):
                    img = img.convert("RGB")

                target = os.path.join(PUBLIC_PRODUCTS_DIR, f"prod_{pid}_{idx}.webp")
                img.save(target, "WEBP", quality=90)
                print(f"  [{idx}] {item['filename']} {item['size']} -> {w}x{h} ✓")
                replaced += 1

                old_jpg = os.path.join(PUBLIC_PRODUCTS_DIR, f"prod_{pid}_{idx}.jpg")
                if os.path.exists(old_jpg):
                    os.remove(old_jpg)

            except Exception as e:
                print(f"  [{idx}] Error: {e}")

    print(f"\n✓ Replaced {replaced} images.")
    print(f"  {skipped_no_data} products skipped (no Excel match).")
    print(f"  {skipped_no_url} slots skipped (index out of range).")


if __name__ == "__main__":
    download_and_replace_small_images()
