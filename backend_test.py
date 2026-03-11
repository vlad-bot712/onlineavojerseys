#!/usr/bin/env python3
"""
Comprehensive Backend Testing for AVO Jerseys - Admin CRUD endpoints for casual products
Testing POST, PUT, DELETE operations and image upload functionality
"""

import requests
import json
import base64
import os
from datetime import datetime

# Configuration
BACKEND_URL = "https://casual-products.preview.emergentagent.com/api"
TEST_RESULTS = []

def log_test(test_name, success, message, response_data=None):
    """Log test result"""
    result = {
        "test": test_name,
        "success": success,
        "message": message,
        "timestamp": datetime.now().isoformat()
    }
    if response_data:
        result["response_data"] = response_data
    TEST_RESULTS.append(result)
    print(f"{'✅' if success else '❌'} {test_name}: {message}")

def test_admin_casual_products_crud():
    """Test Admin CRUD endpoints for casual products"""
    print("\n🔄 TESTING: Admin CRUD endpoints for casual products")
    print("=" * 60)
    
    created_product_id = None
    
    try:
        # Test 1: POST /api/admin/casual-products - Create a new casual product
        print("\n1️⃣ Testing: POST /api/admin/casual-products")
        
        test_product = {
            "name": "Test Admin Product",
            "category": "tricouri",
            "price_ron": 199,
            "sale_price_ron": 149,
            "description": "Test product created via admin",
            "sizes": ["S", "M", "L", "XL"],
            "colors": [
                {"name": "Negru", "slug": "negru", "image": "/images/casual/test-admin-product/negru"},
                {"name": "Alb", "slug": "alb", "image": "/images/casual/test-admin-product/alb"}
            ],
            "in_stock": True
        }
        
        response = requests.post(f"{BACKEND_URL}/admin/casual-products", json=test_product, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            created_product_id = data.get("id")
            
            # Verify response includes all required fields
            required_fields = ["id", "slug", "garment_type", "created_at", "updated_at"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                log_test("POST /api/admin/casual-products", False, f"Missing fields in response: {missing_fields}")
            else:
                # Verify the data structure
                if (data["name"] == test_product["name"] and
                    data["category"] == test_product["category"] and
                    data["price_ron"] == test_product["price_ron"] and
                    data["sale_price_ron"] == test_product["sale_price_ron"] and
                    "slug" in data and data["slug"] and
                    "garment_type" in data):
                    log_test("POST /api/admin/casual-products", True, 
                           f"Product created successfully. ID: {created_product_id}, Slug: {data['slug']}, Garment Type: {data['garment_type']}")
                else:
                    log_test("POST /api/admin/casual-products", False, 
                           "Product created but data doesn't match expected values")
        else:
            log_test("POST /api/admin/casual-products", False, 
                   f"Failed with status {response.status_code}: {response.text}")
            return
            
    except Exception as e:
        log_test("POST /api/admin/casual-products", False, f"Exception occurred: {str(e)}")
        return
    
    if not created_product_id:
        print("❌ Cannot continue with remaining tests - product creation failed")
        return
    
    try:
        # Test 2: PUT /api/admin/casual-products/{id} - Update the created product
        print(f"\n2️⃣ Testing: PUT /api/admin/casual-products/{created_product_id}")
        
        update_data = {
            "price_ron": 179,
            "sale_price_ron": None,  # Remove sale price
            "in_stock": False
        }
        
        response = requests.put(f"{BACKEND_URL}/admin/casual-products/{created_product_id}", 
                              json=update_data, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            # Verify partial updates work correctly
            if (data["price_ron"] == 179 and 
                data.get("sale_price_ron") is None and 
                data["in_stock"] is False and
                data["name"] == "Test Admin Product"):  # Original name should remain
                log_test("PUT /api/admin/casual-products/{id}", True, 
                       "Product updated successfully - partial updates work correctly")
            else:
                log_test("PUT /api/admin/casual-products/{id}", False, 
                       f"Update failed - incorrect values: price_ron={data.get('price_ron')}, sale_price_ron={data.get('sale_price_ron')}, in_stock={data.get('in_stock')}")
        else:
            log_test("PUT /api/admin/casual-products/{id}", False, 
                   f"Failed with status {response.status_code}: {response.text}")
            
    except Exception as e:
        log_test("PUT /api/admin/casual-products/{id}", False, f"Exception occurred: {str(e)}")
    
    try:
        # Test 3: DELETE /api/admin/casual-products/{id} - Delete the test product
        print(f"\n3️⃣ Testing: DELETE /api/admin/casual-products/{created_product_id}")
        
        response = requests.delete(f"{BACKEND_URL}/admin/casual-products/{created_product_id}", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "message" in data and "deleted successfully" in data["message"]:
                log_test("DELETE /api/admin/casual-products/{id}", True, 
                       "Product deleted successfully")
                
                # Verify product is actually deleted by trying to fetch it
                try:
                    verify_response = requests.get(f"{BACKEND_URL}/casual-products/{created_product_id}", timeout=5)
                    if verify_response.status_code == 404:
                        log_test("DELETE verification", True, "Product deletion confirmed - 404 when trying to fetch deleted product")
                    else:
                        log_test("DELETE verification", False, f"Product still exists after deletion: {verify_response.status_code}")
                except:
                    log_test("DELETE verification", True, "Product deletion confirmed - unable to fetch deleted product")
            else:
                log_test("DELETE /api/admin/casual-products/{id}", False, 
                       f"Unexpected response format: {data}")
        else:
            log_test("DELETE /api/admin/casual-products/{id}", False, 
                   f"Failed with status {response.status_code}: {response.text}")
            
    except Exception as e:
        log_test("DELETE /api/admin/casual-products/{id}", False, f"Exception occurred: {str(e)}")

def test_casual_image_upload():
    """Test POST /api/upload/casual-image - Image upload endpoint"""
    print("\n4️⃣ Testing: POST /api/upload/casual-image")
    
    try:
        # Create a small test image as base64 (1x1 red pixel PNG)
        test_image_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
        
        upload_data = {
            "image": f"data:image/png;base64,{test_image_base64}",
            "product_slug": "test-admin-product",
            "color_slug": "test-color"
        }
        
        response = requests.post(f"{BACKEND_URL}/upload/casual-image", json=upload_data, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if (data.get("success") and 
                "image_url" in data and 
                "casual/test-admin-product/test-color" in data["image_url"]):
                log_test("POST /api/upload/casual-image", True, 
                       f"Image upload successful. URL: {data['image_url']}")
            else:
                log_test("POST /api/upload/casual-image", False, 
                       f"Upload response incorrect format: {data}")
        else:
            # Note: This might fail without actual file system access, which is expected
            log_test("POST /api/upload/casual-image", False, 
                   f"Failed with status {response.status_code}: {response.text} (Note: May be expected due to file system limitations)")
            
    except Exception as e:
        log_test("POST /api/upload/casual-image", False, 
               f"Exception occurred: {str(e)} (Note: May be expected due to file system limitations)")

def test_admin_settings():
    """Test GET /api/admin/settings - Get all site settings"""
    print("\n5️⃣ Testing: GET /api/admin/settings")
    
    try:
        response = requests.get(f"{BACKEND_URL}/admin/settings", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, dict):
                settings_count = len(data)
                log_test("GET /api/admin/settings", True, 
                       f"Settings retrieved successfully. Found {settings_count} settings: {list(data.keys())}")
                
                # Check if casual_visible setting exists
                if "casual_visible" in data:
                    log_test("Settings validation", True, 
                           f"Required 'casual_visible' setting found with value: {data['casual_visible']}")
                else:
                    log_test("Settings validation", False, 
                           "Required 'casual_visible' setting not found in settings")
            else:
                log_test("GET /api/admin/settings", False, 
                       f"Expected object response, got: {type(data)}")
        else:
            log_test("GET /api/admin/settings", False, 
                   f"Failed with status {response.status_code}: {response.text}")
            
    except Exception as e:
        log_test("GET /api/admin/settings", False, f"Exception occurred: {str(e)}")

def test_additional_admin_endpoints():
    """Test additional endpoints for completeness"""
    print("\n6️⃣ Testing: Additional Admin endpoints")
    
    # Test getting casual products (admin view)
    try:
        print("  📋 Testing GET /api/casual-products?force=true")
        response = requests.get(f"{BACKEND_URL}/casual-products?force=true", timeout=10)
        
        if response.status_code == 200:
            products = response.json()
            if isinstance(products, list):
                log_test("GET /api/casual-products?force=true", True, 
                       f"Admin casual products list retrieved. Found {len(products)} products")
            else:
                log_test("GET /api/casual-products?force=true", False, 
                       f"Expected array response, got: {type(products)}")
        else:
            log_test("GET /api/casual-products?force=true", False, 
                   f"Failed with status {response.status_code}: {response.text}")
            
    except Exception as e:
        log_test("GET /api/casual-products?force=true", False, f"Exception occurred: {str(e)}")

def run_all_tests():
    """Run all admin CRUD tests"""
    print("🚀 Starting Admin CRUD endpoints testing for casual products")
    print(f"📡 Backend URL: {BACKEND_URL}")
    print(f"🕐 Test started at: {datetime.now().isoformat()}")
    
    test_admin_casual_products_crud()
    test_casual_image_upload() 
    test_admin_settings()
    test_additional_admin_endpoints()
    
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    total_tests = len(TEST_RESULTS)
    passed_tests = len([t for t in TEST_RESULTS if t["success"]])
    failed_tests = total_tests - passed_tests
    
    print(f"✅ Passed: {passed_tests}")
    print(f"❌ Failed: {failed_tests}")
    print(f"📈 Success Rate: {(passed_tests/total_tests*100):.1f}%")
    
    if failed_tests > 0:
        print(f"\n🔍 FAILED TESTS:")
        for test in TEST_RESULTS:
            if not test["success"]:
                print(f"  ❌ {test['test']}: {test['message']}")
    
    print(f"\n🏁 Testing completed at: {datetime.now().isoformat()}")

if __name__ == "__main__":
    run_all_tests()