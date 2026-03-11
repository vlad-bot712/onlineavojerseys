#!/usr/bin/env python3
"""
Additional Edge Case Tests for Casual Products Checkout Flow
Tests edge cases and error scenarios
"""

import requests
import json
import os

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

def log_info(message):
    print(f"{Colors.BLUE}ℹ️ {message}{Colors.RESET}")

def make_request(method, endpoint, **kwargs):
    """Helper to make HTTP requests with error handling"""
    url = f"{BASE_URL}{endpoint}"
    try:
        response = requests.request(method, url, timeout=10, **kwargs)
        return response
    except Exception as e:
        log_error(f"Request failed to {url}: {str(e)}")
        return None

def test_edge_cases():
    """Test edge cases and error conditions"""
    print(f"\n{Colors.BOLD}=== Edge Case Testing ==={Colors.RESET}")
    
    # 1. Test non-existent product ID
    log_info("Testing GET /api/casual-products/invalid-id")
    response = make_request("GET", "/api/casual-products/invalid-id")
    if response and response.status_code == 404:
        log_success("Correctly returns 404 for invalid product ID")
    else:
        log_error(f"Expected 404, got {response.status_code if response else 'No response'}")
    
    # 2. Test casual products when visibility is false
    log_info("Testing casual products visibility behavior")
    
    # Get current setting
    current_setting = make_request("GET", "/api/settings/casual")
    if current_setting and current_setting.status_code == 200:
        is_visible = current_setting.json().get("casual_visible", False)
        
        # If it's currently visible, toggle it off
        if is_visible:
            make_request("PATCH", "/api/settings/casual")
        
        # Now test that normal request returns empty
        response = make_request("GET", "/api/casual-products")
        if response and response.status_code == 200:
            products = response.json()
            if len(products) == 0:
                log_success("Correctly returns empty list when casual_visible=false")
            else:
                log_error(f"Expected empty list, got {len(products)} products")
        
        # Test that force=true still works
        response = make_request("GET", "/api/casual-products?force=true")
        if response and response.status_code == 200:
            products = response.json()
            if len(products) > 0:
                log_success("force=true correctly bypasses visibility setting")
            else:
                log_error("force=true should return products even when not visible")
        
        # Restore original setting
        if is_visible:
            make_request("PATCH", "/api/settings/casual")
    
    # 3. Test order with invalid data
    log_info("Testing order creation with invalid data")
    
    invalid_order = {
        "items": [],  # Empty items
        "customer_name": "",  # Empty name
        "customer_email": "invalid-email",  # Invalid email
        "total_ron": -10  # Negative total
    }
    
    response = make_request("POST", "/api/orders", 
                           json=invalid_order,
                           headers={"Content-Type": "application/json"})
    
    if response and response.status_code >= 400:
        log_success("Correctly rejects invalid order data")
    else:
        log_error(f"Should reject invalid order, got {response.status_code if response else 'No response'}")
    
    # 4. Test order with missing required fields
    log_info("Testing order with missing required fields")
    
    incomplete_order = {
        "items": [
            {
                "product_id": "test-id",
                "product_name": "Test Product",
                "size": "M",
                "quantity": 1,
                "price_ron": 100
            }
        ]
        # Missing all customer info
    }
    
    response = make_request("POST", "/api/orders", 
                           json=incomplete_order,
                           headers={"Content-Type": "application/json"})
    
    if response and response.status_code >= 400:
        log_success("Correctly rejects order with missing fields")
    else:
        log_error(f"Should reject incomplete order, got {response.status_code if response else 'No response'}")

def test_casual_product_categories():
    """Test filtering by different categories"""
    print(f"\n{Colors.BOLD}=== Category Filtering Tests ==={Colors.RESET}")
    
    categories = ["tricouri", "pantaloni-scurti", "pantaloni-lungi", "vesta"]
    
    for category in categories:
        log_info(f"Testing category filter: {category}")
        response = make_request("GET", f"/api/casual-products?force=true&category={category}")
        
        if response and response.status_code == 200:
            products = response.json()
            
            # Verify all products belong to this category
            category_match = all(p.get("category") == category for p in products)
            if category_match and len(products) > 0:
                log_success(f"Category '{category}' filter works - found {len(products)} products")
            elif len(products) == 0:
                log_error(f"No products found for category '{category}'")
            else:
                log_error(f"Category filter failed for '{category}'")
        else:
            log_error(f"Failed to fetch products for category '{category}'")

if __name__ == "__main__":
    print(f"{Colors.BOLD}CASUAL PRODUCTS EDGE CASE TESTS{Colors.RESET}")
    print(f"Testing backend at: {BASE_URL}")
    
    test_edge_cases()
    test_casual_product_categories()
    
    print(f"\n{Colors.BOLD}=== Edge Case Testing Complete ==={Colors.RESET}")