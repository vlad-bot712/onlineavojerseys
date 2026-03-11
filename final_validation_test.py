#!/usr/bin/env python3
"""
Final Validation Test for Casual Products Checkout Flow
Comprehensive test that matches the exact review request format
"""

import requests
import json
import os

def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            content = f.read()
            for line in content.splitlines():
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except FileNotFoundError:
        pass
    return "http://localhost:8001"

BASE_URL = get_backend_url()

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def log_test(test_name, success, details=""):
    status = f"{Colors.GREEN}✅" if success else f"{Colors.RED}❌"
    print(f"{status} {test_name}{Colors.RESET}")
    if details:
        print(f"   {details}")

def main():
    print(f"{Colors.BOLD}FINAL CASUAL PRODUCTS CHECKOUT VALIDATION{Colors.RESET}")
    print(f"Backend: {BASE_URL}")
    print("="*60)
    
    all_passed = True
    
    # 1. Test GET /api/settings/casual - verify the setting exists
    print(f"\n{Colors.BLUE}1. Testing GET /api/settings/casual{Colors.RESET}")
    try:
        response = requests.get(f"{BASE_URL}/api/settings/casual", timeout=10)
        if response.status_code == 200:
            data = response.json()
            has_setting = "casual_visible" in data
            log_test("GET /api/settings/casual", has_setting, 
                    f"casual_visible: {data.get('casual_visible', 'NOT FOUND')}")
            if not has_setting:
                all_passed = False
        else:
            log_test("GET /api/settings/casual", False, f"Status: {response.status_code}")
            all_passed = False
    except Exception as e:
        log_test("GET /api/settings/casual", False, f"Error: {e}")
        all_passed = False
    
    # 2. Test GET /api/casual-products - verify casual products are returned
    print(f"\n{Colors.BLUE}2. Testing GET /api/casual-products{Colors.RESET}")
    try:
        response = requests.get(f"{BASE_URL}/api/casual-products?force=true", timeout=10)
        if response.status_code == 200:
            products = response.json()
            products_found = len(products) > 0
            log_test("GET /api/casual-products", products_found, 
                    f"Found {len(products)} products")
            if not products_found:
                all_passed = False
        else:
            log_test("GET /api/casual-products", False, f"Status: {response.status_code}")
            all_passed = False
    except Exception as e:
        log_test("GET /api/casual-products", False, f"Error: {e}")
        all_passed = False
        products = []
    
    # 3. Test GET /api/casual-products/{id} - get a single casual product
    print(f"\n{Colors.BLUE}3. Testing GET /api/casual-products/{{id}}{Colors.RESET}")
    if products:
        try:
            test_id = products[0]["id"]
            response = requests.get(f"{BASE_URL}/api/casual-products/{test_id}", timeout=10)
            if response.status_code == 200:
                product = response.json()
                valid_product = product.get("id") == test_id
                log_test("GET /api/casual-products/{id}", valid_product, 
                        f"Product: {product.get('name', 'N/A')}")
                if not valid_product:
                    all_passed = False
            else:
                log_test("GET /api/casual-products/{id}", False, f"Status: {response.status_code}")
                all_passed = False
        except Exception as e:
            log_test("GET /api/casual-products/{id}", False, f"Error: {e}")
            all_passed = False
    else:
        log_test("GET /api/casual-products/{id}", False, "No products to test with")
        all_passed = False
    
    # 4. Test POST /api/orders with a casual product order (exact format from review request)
    print(f"\n{Colors.BLUE}4. Testing POST /api/orders with casual product{Colors.RESET}")
    if products:
        try:
            test_product = products[0]
            
            # Use exact format from review request
            order_data = {
                "items": [{
                    "product_id": test_product["id"],
                    "product_name": test_product["name"],
                    "product_image": "/images/casual/test/negru.jpg",
                    "size": "M",
                    "quantity": 1,
                    "price_ron": test_product["price_ron"],
                    "customization": {"color": "Negru"},
                    "version": "fan",
                    "kit": None,
                    "kit_name": None
                }],
                "customer_name": "Test User",
                "customer_email": "test@test.com",
                "customer_phone": "+40700000000",
                "customer_address": "Test Street, Bucharest",
                "customer_street": "Test Street 10",
                "customer_city": "București",
                "customer_county": "București",
                "customer_zip": "010101",
                "customer_country": "România",
                "shipping_method": "standard",
                "payment_method": "ramburs",
                "total_ron": test_product["price_ron"] + 20,  # Add shipping
                "currency": "RON",
                "coupon_code": None,
                "coupon_discount": 0
            }
            
            response = requests.post(f"{BASE_URL}/api/orders", 
                                   json=order_data,
                                   headers={"Content-Type": "application/json"},
                                   timeout=10)
            
            if response.status_code in [200, 201]:
                order = response.json()
                order_created = "order_number" in order and "id" in order
                log_test("POST /api/orders (casual product)", order_created, 
                        f"Order #{order.get('order_number', 'N/A')} - Status: {order.get('status', 'N/A')}")
                
                # Verify order contains casual product correctly
                if order_created and order.get("items"):
                    item = order["items"][0]
                    correct_item = (item.get("product_id") == test_product["id"] and 
                                  item.get("customization", {}).get("color") == "Negru")
                    log_test("Order item validation", correct_item,
                            f"Product ID: {item.get('product_id')} - Color: {item.get('customization', {}).get('color')}")
                    if not correct_item:
                        all_passed = False
                else:
                    all_passed = False
            else:
                log_test("POST /api/orders (casual product)", False, 
                        f"Status: {response.status_code}")
                all_passed = False
                
        except Exception as e:
            log_test("POST /api/orders (casual product)", False, f"Error: {e}")
            all_passed = False
    else:
        log_test("POST /api/orders (casual product)", False, "No products to test with")
        all_passed = False
    
    # Final result
    print(f"\n{'='*60}")
    if all_passed:
        print(f"{Colors.GREEN}{Colors.BOLD}🎉 ALL TESTS PASSED - CASUAL CHECKOUT FLOW IS WORKING! 🎉{Colors.RESET}")
    else:
        print(f"{Colors.RED}{Colors.BOLD}❌ SOME TESTS FAILED - NEEDS ATTENTION{Colors.RESET}")
    print(f"{'='*60}")
    
    return all_passed

if __name__ == "__main__":
    main()