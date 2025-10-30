#!/usr/bin/env python3
"""
Script to update pixel-racer metadata (items 101-200) with the required format.
Usage: python3 update_pixel_racer_metadata.py <PIXEL_RACER_IMAGE_CID>
"""

import json
import re
import sys

def extract_image_number(image_url):
    """Extract image number from URL like ipfs://CID/123.png"""
    match = re.search(r'/(\d+)\.png', image_url)
    return int(match.group(1)) if match else None

def capitalize_first(s):
    """Capitalize first letter of string"""
    return s[0].upper() + s[1:] if s else ""

def get_attribute_value(attributes, trait_type):
    """Get attribute value by trait_type"""
    for attr in attributes:
        if attr.get('trait_type') == trait_type:
            return attr.get('value', '')
    return ''

def update_pixel_racer_metadata(metadata_file, pixel_racer_cid):
    """Update pixel-racer metadata items (101-200)"""
    
    # Read metadata
    with open(metadata_file, 'r') as f:
        metadata = json.load(f)
    
    # Find and sort items by image number (101-200)
    target_items = []
    for item in metadata:
        edition = item.get('custom_fields', {}).get('edition')
        if not edition or edition < 1 or edition > 200:
            continue
        
        image_url = item.get('image', '')
        image_num = extract_image_number(image_url)
        if not image_num or image_num < 101 or image_num > 200:
            continue
        
        target_items.append({
            'item': item,
            'image_num': image_num,
            'edition': edition
        })
    
    # Sort by image number
    target_items.sort(key=lambda x: x['image_num'])
    
    print(f"Found {len(target_items)} pixel-racer items (101-200)")
    
    updated_count = 0
    
    # Process items 101-200 (pixel-racer)
    for entry in target_items:
        image_num = entry['image_num']
        item = entry['item']
        
        # Get animal type for name/description
        animal = get_attribute_value(item.get('attributes', []), 'animal')
        animal_capitalized = capitalize_first(animal)
        
        # Get existing data
        custom_fields = item.get('custom_fields', {})
        dna = custom_fields.get('dna', '')
        date_val = custom_fields.get('date', 0)
        compiler = custom_fields.get('compiler', 'HashLips Art Engine - Modified By ThePeanutGalleryAndCo')
        
        # Get existing attributes (excluding system ones we'll add)
        existing_attrs = item.get('attributes', [])
        seen_traits = set(['creator_id', 'origin_game', 'item_category'])
        other_attrs = []
        for attr in existing_attrs:
            trait_type = attr.get('trait_type')
            if trait_type not in seen_traits:
                other_attrs.append(attr)
                seen_traits.add(trait_type)
        
        # Build attributes with required ones first
        new_attributes = [
            {
                "trait_type": "creator_id",
                "value": "Noobisoft Gamers"
            },
            {
                "trait_type": "origin_game",
                "value": "Pixel Racer"
            },
            {
                "trait_type": "item_category",
                "value": "Skin"
            }
        ]
        
        # Add other existing attributes
        new_attributes.extend(other_attrs)
        
        # Build files array
        files = [
            {
                "uri": f"ipfs://{pixel_racer_cid}/{image_num}.png",
                "is_default_file": True,
                "type": "image/png"
            },
            {
                "uri": f"ipfs://{pixel_racer_cid}",
                "type": "image/png"
            }
        ]
        
        # Build properties
        properties = {
            "dna": dna,
            "edition": entry['edition'],
            "date": date_val,
            "compiler": compiler,
            "origin_game_details": {
                "series": "Series 1",
                "edition": "1st Edition"
            }
        }
        
        # Build custom_fields
        custom_fields_new = {
            "dna": dna,
            "edition": entry['edition'],
            "date": date_val,
            "compiler": compiler
        }
        
        # Update the item
        item.clear()
        item.update({
            "name": animal_capitalized,
            "description": f"this is a {animal}",
            "image": f"ipfs://{pixel_racer_cid}/{image_num}.png",
            "type": "image/png",
            "format": "HIP412@2.0.0",
            "files": files,
            "properties": properties,
            "attributes": new_attributes,
            "custom_fields": custom_fields_new
        })
        
        updated_count += 1
    
    # Save updated metadata
    with open(metadata_file, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"\n✓ Updated {updated_count} pixel-racer items (101-200)")
    return updated_count

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 update_pixel_racer_metadata.py <PIXEL_RACER_IMAGE_CID>")
        print("\nExample:")
        print("  python3 update_pixel_racer_metadata.py bafybeif72femk7aiadqa24tbwo7dsr2kopgpot4u2wvll45skurftcx4cm")
        sys.exit(1)
    
    pixel_racer_cid = sys.argv[1]
    metadata_file = "_metadata.json"
    
    try:
        update_pixel_racer_metadata(metadata_file, pixel_racer_cid)
        print("\n✓ Pixel-racer metadata update complete!")
    except Exception as e:
        print(f"\n✗ Error: {e}")
        sys.exit(1)

