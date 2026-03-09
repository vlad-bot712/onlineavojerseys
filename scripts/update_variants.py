import requests
import json

API_URL = "http://localhost:8001/api/products"

# Get all products
response = requests.get(API_URL)
products = response.json()

for product in products:
    product_id = product['id']
    category = product.get('category', '')
    variants = product.get('variants', [])
    
    updated_variants = []
    
    if category == 'nationale':
        # Pentru naționale - doar 1st Kit
        for v in variants:
            if v['kit'] == 'first':
                v['name'] = '1st Kit'
                updated_variants.append(v)
                break
    else:
        # Pentru cluburi și alte categorii - redenumește variantele
        for v in variants:
            if v['kit'] == 'first':
                v['name'] = '1st Kit'
            elif v['kit'] == 'second':
                v['name'] = '2nd Kit'
            elif v['kit'] == 'third':
                v['name'] = '3rd Kit'
            updated_variants.append(v)
    
    # Update the product
    if updated_variants:
        try:
            res = requests.patch(
                f"{API_URL}/{product_id}",
                json={"variants": updated_variants}
            )
            print(f"Updated: {product['name']} - {len(updated_variants)} variants - {res.status_code}")
        except Exception as e:
            print(f"Error updating {product['name']}: {e}")

print("\nDone!")
