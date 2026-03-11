#!/usr/bin/env python3
"""
Backend API Testing Suite for Casual Products Checkout Flow
Tests the complete casual products checkout flow:
1. Settings API - casual visibility toggle
2. Casual Products API - listing and individual product fetch
3. Orders API - creating orders with casual products
"""

import requests
import json
import os
from datetime import datetime
import sys

# Get backend URL from frontend .env
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
print(f"Testing backend at: {BASE_URL}")

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def log_success(message):
    print(f"{Colors.GREEN}✅ {message}{Colors.RESET}")

def log_error(message):
    print(f"{Colors.RED}❌ {message}{Colors.RESET}")

def log_warning(message):
    print(f"{Colors.YELLOW}⚠️ {message}{Colors.RESET}")

def log_info(message):
    print(f"{Colors.BLUE}ℹ️ {message}{Colors.RESET}")

def make_request(method, endpoint, **kwargs):
    """Helper to make HTTP requests with error handling"""
    url = f"{BASE_URL}{endpoint}"
    try:
        response = requests.request(method, url, timeout=10, **kwargs)
        return response
    except requests.exceptions.ConnectionError:
        log_error(f"Connection failed to {url}")
        return None
    except requests.exceptions.Timeout:
        log_error(f"Request timeout to {url}")
        return None
    except Exception as e:
        log_error(f"Request failed to {url}: {str(e)}")
        return None

def test_health_check():
    """Test if backend is running"""
    print(f"\n{Colors.BOLD}=== Backend Health Check ==={Colors.RESET}")
    
    response = make_request("GET", "/api/health")
    if not response:
        log_error("Backend is not running or not accessible")
        return False
    
    if response.status_code == 200:
        log_success("Backend is running")
        return True
    else:
        log_error(f"Health check failed: {response.status_code}")
        return False

def test_casual_settings():
    """Test GET and PATCH /api/settings/casual"""
    print(f"\n{Colors.BOLD}=== Testing Casual Settings API ==={Colors.RESET}")
    
    # Test GET /api/settings/casual
    log_info("Testing GET /api/settings/casual")
    response = make_request("GET", "/api/settings/casual")
    if not response:
        return False
    
    if response.status_code != 200:
        log_error(f"GET /api/settings/casual failed: {response.status_code}")
        return False
    
    try:
        data = response.json()
        if "casual_visible" not in data:
            log_error("Response missing 'casual_visible' field")
            return False
        
        initial_value = data["casual_visible"]
        log_success(f"GET /api/settings/casual - casual_visible: {initial_value}")
        
        # Test PATCH /api/settings/casual (toggle)
        log_info("Testing PATCH /api/settings/casual (toggle)")
        response = make_request("PATCH", "/api/settings/casual")
        if not response or response.status_code != 200:
            log_error(f"PATCH /api/settings/casual failed: {response.status_code if response else 'No response'}")
            return False
        
        toggled_data = response.json()
        toggled_value = toggled_data.get("casual_visible")
        
        if toggled_value == initial_value:
            log_error("PATCH did not toggle the value")
            return False
        
        log_success(f"PATCH /api/settings/casual - toggled to: {toggled_value}")
        
        # Toggle back to original state
        make_request("PATCH", "/api/settings/casual")
        log_info("Restored original casual_visible setting")
        
        return True
        
    except json.JSONDecodeError:
        log_error("Invalid JSON response")
        return False

def test_casual_products_api():
    """Test GET /api/casual-products and /api/casual-products/{id}"""
    print(f"\n{Colors.BOLD}=== Testing Casual Products API ==={Colors.RESET}")
    
    # Test GET /api/casual-products (force=true to ensure we get products)
    log_info("Testing GET /api/casual-products?force=true")
    response = make_request("GET", "/api/casual-products?force=true")
    if not response:
        return False, None
    
    if response.status_code != 200:
        log_error(f"GET /api/casual-products failed: {response.status_code}")
        return False, None
    
    try:
        products = response.json()
        if not isinstance(products, list):
            log_error("Response is not a list")
            return False, None
        
        if len(products) == 0:
            log_error("No casual products found")
            return False, None
        
        log_success(f"GET /api/casual-products - found {len(products)} products")
        
        # Verify product structure
        first_product = products[0]
        required_fields = ["id", "name", "category", "price_ron", "colors", "sizes"]
        for field in required_fields:
            if field not in first_product:
                log_error(f"Product missing required field: {field}")
                return False, None
        
        log_success("Product structure validation passed")
        
        # Test individual product fetch
        product_id = first_product["id"]
        log_info(f"Testing GET /api/casual-products/{product_id}")
        response = make_request("GET", f"/api/casual-products/{product_id}")
        if not response:
            return False, None
        
        if response.status_code != 200:
            log_error(f"GET /api/casual-products/{product_id} failed: {response.status_code}")
            return False, None
        
        single_product = response.json()
        if single_product["id"] != product_id:
            log_error("Single product fetch returned wrong product")
            return False, None
        
        log_success(f"GET /api/casual-products/{product_id} - product fetch successful")
        
        return True, products
        
    except json.JSONDecodeError:
        log_error("Invalid JSON response")
        return False, None

def test_orders_api_with_casual_products(products):
    """Test POST /api/orders with casual product data"""
    print(f"\n{Colors.BOLD}=== Testing Orders API with Casual Products ==={Colors.RESET}")
    
    if not products or len(products) == 0:
        log_error("No products available for testing orders")
        return False
    
    # Select first product for testing
    test_product = products[0]
    
    # Get first available color and size
    first_color = test_product["colors"][0] if test_product["colors"] else {"name": "Default", "slug": "default"}
    first_size = test_product["sizes"][0] if test_product["sizes"] else "M"
    
    # Create order data matching the format from review request
    order_data = {
        "items": [
            {
                "product_id": test_product["id"],
                "product_name": test_product["name"],
                "product_image": first_color.get("image", "/images/casual/test/default.jpg"),
                "size": first_size,
                "quantity": 1,
                "price_ron": test_product["price_ron"],
                "customization": {"color": first_color["name"]},
                "version": "fan",
                "kit": None,
                "kit_name": None
            }
        ],
        "customer_name": "Alex Popescu",
        "customer_email": "alex.popescu@test.com",
        "customer_phone": "+40733123456",
        "customer_address": "Strada Victoriei 15, București",
        "customer_street": "Strada Victoriei 15",
        "customer_city": "București",
        "customer_county": "București",
        "customer_zip": "010101",
        "customer_country": "România",
        "shipping_method": "standard",
        "payment_method": "ramburs",
        "total_ron": test_product["price_ron"] + 20,  # Add 20 RON shipping
        "currency": "RON",
        "coupon_code": None,
        "coupon_discount": 0
    }
    
    log_info("Testing POST /api/orders with casual product")
    log_info(f"Order data: {json.dumps(order_data, indent=2, ensure_ascii=False)}")
    
    response = make_request("POST", "/api/orders", 
                           json=order_data,
                           headers={"Content-Type": "application/json"})
    
    if not response:
        return False
    
    if response.status_code not in [200, 201]:
        log_error(f"POST /api/orders failed: {response.status_code}")
        try:
            error_detail = response.json()
            log_error(f"Error detail: {error_detail}")
        except:
            log_error(f"Response text: {response.text}")
        return False
    
    try:
        created_order = response.json()
        
        # Verify order was created correctly
        required_order_fields = ["id", "order_number", "items", "customer_name", "total_ron", "status"]
        for field in required_order_fields:
            if field not in created_order:
                log_error(f"Created order missing field: {field}")
                return False
        
        log_success(f"Order created successfully: #{created_order['order_number']}")
        log_success(f"Order ID: {created_order['id']}")
        log_success(f"Order status: {created_order['status']}")
        log_success(f"Payment status: {created_order.get('payment_status', 'N/A')}")
        
        # Verify order items
        order_items = created_order["items"]
        if len(order_items) != 1:
            log_error(f"Expected 1 item, got {len(order_items)}")
            return False
        
        order_item = order_items[0]
        if order_item["product_id"] != test_product["id"]:
            log_error("Order item product_id mismatch")
            return False
        
        if order_item["product_name"] != test_product["name"]:
            log_error("Order item product_name mismatch")
            return False
        
        log_success("Order item validation passed")
        
        # Test fetching the created order
        order_id = created_order["id"]
        log_info(f"Testing GET /api/orders/{order_id}")
        
        fetch_response = make_request("GET", f"/api/orders/{order_id}")
        if not fetch_response or fetch_response.status_code != 200:
            log_warning("Could not fetch created order")
        else:
            fetched_order = fetch_response.json()
            if fetched_order["id"] == order_id:
                log_success("Order fetch verification passed")
            else:
                log_error("Fetched order ID mismatch")
        
        return True
        
    except json.JSONDecodeError:
        log_error("Invalid JSON response from order creation")
        return False

def test_complete_casual_checkout_flow():
    """Test the complete casual products checkout flow"""
    print(f"\n{Colors.BOLD}{'='*60}{Colors.RESET}")
    print(f"{Colors.BOLD}CASUAL PRODUCTS CHECKOUT FLOW TEST SUITE{Colors.RESET}")
    print(f"{Colors.BOLD}{'='*60}{Colors.RESET}")
    
    success_count = 0
    total_tests = 4
    
    # 1. Health check
    if test_health_check():
        success_count += 1
    
    # 2. Test casual settings
    if test_casual_settings():
        success_count += 1
    
    # 3. Test casual products API
    products_success, products = test_casual_products_api()
    if products_success:
        success_count += 1
    
    # 4. Test orders API with casual products
    if products and test_orders_api_with_casual_products(products):
        success_count += 1
    
    # Summary
    print(f"\n{Colors.BOLD}=== TEST SUMMARY ==={Colors.RESET}")
    if success_count == total_tests:
        log_success(f"All {total_tests} tests passed! ✨")
        print(f"\n{Colors.GREEN}🎉 CASUAL PRODUCTS CHECKOUT FLOW IS WORKING! 🎉{Colors.RESET}")
        return True
    else:
        log_error(f"Only {success_count}/{total_tests} tests passed")
        print(f"\n{Colors.RED}💔 SOME TESTS FAILED - NEEDS ATTENTION 💔{Colors.RESET}")
        return False

if __name__ == "__main__":
    success = test_complete_casual_checkout_flow()
    sys.exit(0 if success else 1)