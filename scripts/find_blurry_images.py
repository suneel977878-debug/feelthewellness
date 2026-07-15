import os
from PIL import Image

IMAGE_DIR = "/home/parrot/Downloads/Telegram Desktop/SexToys_Project/public/products"
BASE_URL = "https://feelthewellness.vercel.app/product/"

def check_images():
    low_quality_images = []
    
    for filename in os.listdir(IMAGE_DIR):
        if filename.endswith(".webp") or filename.endswith(".jpg") or filename.endswith(".png"):
            filepath = os.path.join(IMAGE_DIR, filename)
            try:
                filesize_kb = os.path.getsize(filepath) / 1024
                
                with Image.open(filepath) as img:
                    width, height = img.size
                    
                    if width < 300 or height < 300 or filesize_kb < 6:
                        # Extract product ID from "prod_123_0.webp"
                        prod_id = None
                        if filename.startswith("prod_"):
                            parts = filename.split("_")
                            if len(parts) >= 2 and parts[1].isdigit():
                                prod_id = parts[1]
                                
                        low_quality_images.append({
                            'filename': filename,
                            'dimensions': f"{width}x{height}",
                            'size_kb': round(filesize_kb, 2),
                            'prod_id': prod_id
                        })
            except Exception as e:
                pass

    # Sort by size or dimensions
    low_quality_images.sort(key=lambda x: (x['size_kb'], x['filename']))
    
    print("### Links to Products with Low Quality Images\n")
    
    seen_ids = set()
    for img in low_quality_images:
        if img['prod_id'] and img['prod_id'] not in seen_ids:
            seen_ids.add(img['prod_id'])
            link = f"{BASE_URL}{img['prod_id']}"
            print(f"- **Product {img['prod_id']}** ({img['dimensions']}, {img['size_kb']} KB) - [View on site]({link})")
            
    print("\n### Suspicious Banner/Logo Images (800x171)\n")
    banner_ids = set()
    for img in low_quality_images:
        if img['dimensions'] == "800x171" and img['prod_id'] and img['prod_id'] not in banner_ids:
            banner_ids.add(img['prod_id'])
            link = f"{BASE_URL}{img['prod_id']}"
            print(f"- **Product {img['prod_id']}** - [View on site]({link})")


if __name__ == "__main__":
    check_images()
