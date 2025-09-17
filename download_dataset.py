"""
Dataset Download Script for Fashion Product Images
This script downloads the fashion dataset and saves images locally
"""

import os
import json
from datasets import load_dataset
from PIL import Image
import base64
from io import BytesIO

def download_fashion_dataset(limit=100, output_dir="public/dataset"):
    """
    Download fashion dataset and save images locally
    """
    print(f"Loading dataset...")
    
    # Load the dataset
    ds = load_dataset("ashraq/fashion-product-images-small")
    
    # Create output directories
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(f"{output_dir}/images", exist_ok=True)
    
    # Prepare data for JSON
    dataset_items = []
    
    print(f"Processing {min(limit, len(ds['train']))} items...")
    
    for i, item in enumerate(ds['train']):
        if i >= limit:
            break
            
        try:
            # Get the image
            image = item['image']
            
            # Create filename
            filename = f"item_{item['id']}.jpg"
            image_path = f"{output_dir}/images/{filename}"
            
            # Save image
            image.save(image_path, "JPEG", quality=85, optimize=True)
            
            # Create item data
            dataset_item = {
                "id": item['id'],
                "name": item.get('productDisplayName', f"{item.get('articleType', 'Item')} {item.get('baseColour', '')}"),
                "image": f"/dataset/images/{filename}",
                "category": item.get('masterCategory', ''),
                "subcategory": item.get('subCategory', ''),
                "gender": item.get('gender', 'Unisex'),  # Direct string: Men, Women, Unisex
                "color": item.get('baseColour', ''),
                "season": item.get('season', ''),
                "usage": item.get('usage', ''),
                "year": item.get('year', 2024),
                "articleType": item.get('articleType', '')
            }
            
            dataset_items.append(dataset_item)
            
            if (i + 1) % 10 == 0:
                print(f"Processed {i + 1} items...")
                
        except Exception as e:
            print(f"Error processing item {i}: {e}")
            continue
    
    # Save metadata JSON
    with open(f"{output_dir}/dataset.json", 'w') as f:
        json.dump({
            "items": dataset_items,
            "count": len(dataset_items),
            "categories": list(set(item['category'] for item in dataset_items if item['category'])),
            "articleTypes": list(set(item['articleType'] for item in dataset_items if item['articleType'])),
            "colors": list(set(item['color'] for item in dataset_items if item['color'])),
            "seasons": list(set(item['season'] for item in dataset_items if item['season'])),
            "usages": list(set(item['usage'] for item in dataset_items if item['usage']))
        }, f, indent=2)
    
    print(f"✅ Downloaded {len(dataset_items)} items to {output_dir}")
    print(f"📁 Images saved to: {output_dir}/images/")
    print(f"📄 Metadata saved to: {output_dir}/dataset.json")
    
    return dataset_items

if __name__ == "__main__":
    # Download dataset with 200 items (you can increase this)
    items = download_fashion_dataset(limit=200)
    
    # Print some statistics
    men_items = [item for item in items if item['gender'] == 'Men']
    women_items = [item for item in items if item['gender'] == 'Women']
    unisex_items = [item for item in items if item['gender'] not in ['Men', 'Women']]
    
    print(f"\n📊 Dataset Statistics:")
    print(f"👨 Men's items: {len(men_items)}")
    print(f"👩 Women's items: {len(women_items)}")
    print(f"👫 Unisex items: {len(unisex_items)}")
    print(f"📦 Total items: {len(items)}")
