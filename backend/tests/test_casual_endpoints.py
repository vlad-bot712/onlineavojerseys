"""
Test suite for CASUAL products feature APIs
- GET /api/settings/casual - returns casual visibility setting
- PATCH /api/settings/casual - toggles casual visibility
- GET /api/casual-products?force=true - returns all 15 casual products (admin)
- GET /api/casual-products - returns products only when casual_visible=true
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestCasualSettingsAPI:
    """Tests for casual settings toggle"""

    def test_get_casual_setting_returns_200(self):
        """GET /api/settings/casual should return 200 with casual_visible field"""
        response = requests.get(f"{BASE_URL}/api/settings/casual")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "casual_visible" in data, "Response should contain 'casual_visible' field"
        assert isinstance(data["casual_visible"], bool), "casual_visible should be a boolean"
        print(f"✓ GET /api/settings/casual - casual_visible={data['casual_visible']}")

    def test_patch_casual_setting_toggles_value(self):
        """PATCH /api/settings/casual should toggle the value"""
        # Get current value
        initial_response = requests.get(f"{BASE_URL}/api/settings/casual")
        assert initial_response.status_code == 200
        initial_value = initial_response.json()["casual_visible"]
        
        # Toggle
        toggle_response = requests.patch(f"{BASE_URL}/api/settings/casual")
        assert toggle_response.status_code == 200, f"Expected 200, got {toggle_response.status_code}"
        
        toggled_data = toggle_response.json()
        assert "casual_visible" in toggled_data
        assert toggled_data["casual_visible"] == (not initial_value), \
            f"Expected toggled value {not initial_value}, got {toggled_data['casual_visible']}"
        
        # Toggle back to restore original state
        restore_response = requests.patch(f"{BASE_URL}/api/settings/casual")
        assert restore_response.status_code == 200
        assert restore_response.json()["casual_visible"] == initial_value, \
            "Failed to restore original value"
        
        print(f"✓ PATCH /api/settings/casual - successfully toggled {initial_value} -> {not initial_value} -> {initial_value}")


class TestCasualProductsAPI:
    """Tests for casual products endpoints"""

    def test_get_casual_products_with_force_returns_15_products(self):
        """GET /api/casual-products?force=true should return all 15 products regardless of visibility"""
        response = requests.get(f"{BASE_URL}/api/casual-products?force=true")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        products = response.json()
        assert isinstance(products, list), "Response should be a list"
        assert len(products) == 15, f"Expected 15 products, got {len(products)}"
        
        # Verify product structure
        first_product = products[0]
        required_fields = ["id", "name", "slug", "category", "garment_type", "price_ron", "colors", "sizes"]
        for field in required_fields:
            assert field in first_product, f"Product should have '{field}' field"
        
        # Verify categories present
        categories = set(p["category"] for p in products)
        expected_categories = {"pantaloni-scurti", "pantaloni-lungi", "vesta", "tricouri"}
        assert categories == expected_categories, f"Expected categories {expected_categories}, got {categories}"
        
        print(f"✓ GET /api/casual-products?force=true - returned {len(products)} products with categories: {categories}")

    def test_casual_products_when_visible_true_returns_products(self):
        """When casual_visible=true, GET /api/casual-products should return products"""
        # First ensure casual_visible is true
        setting = requests.get(f"{BASE_URL}/api/settings/casual").json()
        if not setting["casual_visible"]:
            requests.patch(f"{BASE_URL}/api/settings/casual")
        
        # Now fetch products
        response = requests.get(f"{BASE_URL}/api/casual-products")
        assert response.status_code == 200
        
        products = response.json()
        assert len(products) == 15, f"Expected 15 products when visible=true, got {len(products)}"
        
        print(f"✓ GET /api/casual-products (visible=true) - returned {len(products)} products")

    def test_casual_products_when_visible_false_returns_empty(self):
        """When casual_visible=false, GET /api/casual-products should return empty list"""
        # Ensure casual_visible is true first
        setting = requests.get(f"{BASE_URL}/api/settings/casual").json()
        initial_value = setting["casual_visible"]
        
        if initial_value:
            # Toggle to false
            requests.patch(f"{BASE_URL}/api/settings/casual")
        
        # Fetch products - should be empty
        response = requests.get(f"{BASE_URL}/api/casual-products")
        assert response.status_code == 200
        
        products = response.json()
        assert len(products) == 0, f"Expected 0 products when visible=false, got {len(products)}"
        
        # Restore original state
        if initial_value:
            requests.patch(f"{BASE_URL}/api/settings/casual")
        
        print(f"✓ GET /api/casual-products (visible=false) - returned empty list as expected")

    def test_casual_products_category_filter_works(self):
        """GET /api/casual-products?category=tricouri should filter products"""
        response = requests.get(f"{BASE_URL}/api/casual-products?force=true&category=tricouri")
        assert response.status_code == 200
        
        products = response.json()
        # Should have tricouri products only
        for p in products:
            assert p["category"] == "tricouri", f"Expected tricouri, got {p['category']}"
        
        assert len(products) >= 1, "Should have at least 1 tricou product"
        print(f"✓ GET /api/casual-products?category=tricouri - filtered to {len(products)} products")

    def test_casual_product_has_colors_with_correct_structure(self):
        """Each product should have colors array with name, slug, image"""
        response = requests.get(f"{BASE_URL}/api/casual-products?force=true")
        products = response.json()
        
        for product in products[:5]:  # Check first 5
            assert "colors" in product, f"Product {product['name']} missing colors"
            assert len(product["colors"]) >= 1, f"Product {product['name']} should have at least 1 color"
            
            for color in product["colors"]:
                assert "name" in color, f"Color missing 'name' in {product['name']}"
                assert "slug" in color, f"Color missing 'slug' in {product['name']}"
                assert "image" in color, f"Color missing 'image' in {product['name']}"
        
        print(f"✓ Product colors structure verified")

    def test_casual_product_has_sizes(self):
        """Each product should have sizes array"""
        response = requests.get(f"{BASE_URL}/api/casual-products?force=true")
        products = response.json()
        
        for product in products:
            assert "sizes" in product, f"Product {product['name']} missing sizes"
            assert len(product["sizes"]) >= 1, f"Product {product['name']} should have at least 1 size"
            
            # Check sizes are valid
            valid_sizes = {"S", "M", "L", "XL", "2XL", "3XL"}
            for size in product["sizes"]:
                assert size in valid_sizes, f"Invalid size '{size}' in {product['name']}"
        
        print(f"✓ All products have valid sizes")


class TestCasualProductsCategoryDistribution:
    """Verify the distribution of products across categories"""

    def test_category_counts(self):
        """Verify expected number of products per category"""
        response = requests.get(f"{BASE_URL}/api/casual-products?force=true")
        products = response.json()
        
        category_counts = {}
        for p in products:
            cat = p["category"]
            category_counts[cat] = category_counts.get(cat, 0) + 1
        
        # Expected: pantaloni-scurti: 3, pantaloni-lungi: 2, vesta: 1, tricouri: 9
        expected = {
            "pantaloni-scurti": 3,
            "pantaloni-lungi": 2,
            "vesta": 1,
            "tricouri": 9
        }
        
        for cat, expected_count in expected.items():
            actual_count = category_counts.get(cat, 0)
            assert actual_count == expected_count, \
                f"Expected {expected_count} {cat}, got {actual_count}"
        
        print(f"✓ Category distribution verified: {category_counts}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
