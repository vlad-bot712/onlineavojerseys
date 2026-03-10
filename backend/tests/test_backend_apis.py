"""
Backend API Tests for AVO Jerseys E-commerce
Tests: Products API, Reviews API, Health check
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthCheck:
    """Health check endpoint tests"""
    
    def test_health_endpoint_returns_ok(self):
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        print("✓ Health endpoint returns OK")


class TestProductsAPI:
    """Products API tests"""
    
    def test_get_all_products_returns_98(self):
        """GET /api/products should return 98 products"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 98, f"Expected 98 products, got {len(data)}"
        print(f"✓ GET /api/products returns {len(data)} products")
    
    def test_products_have_required_fields(self):
        """Products should have id, name, team, year, price_ron"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        products = response.json()
        
        # Check first 5 products
        for product in products[:5]:
            assert "id" in product, "Product missing 'id'"
            assert "name" in product, "Product missing 'name'"
            assert "team" in product, "Product missing 'team'"
            assert "year" in product, "Product missing 'year'"
            assert "price_ron" in product, "Product missing 'price_ron'"
        print("✓ Products have required fields")
    
    def test_filter_products_by_category(self):
        """Filter products by category should work"""
        response = requests.get(f"{BASE_URL}/api/products", params={"category": "echipe-club"})
        assert response.status_code == 200
        products = response.json()
        for p in products:
            assert p["category"] == "echipe-club"
        print(f"✓ Category filter works - found {len(products)} club team products")
    
    def test_filter_products_by_team(self):
        """Filter products by team should work"""
        response = requests.get(f"{BASE_URL}/api/products", params={"team": "Real Madrid"})
        assert response.status_code == 200
        products = response.json()
        assert len(products) > 0, "Expected at least one Real Madrid product"
        for p in products:
            assert "Real Madrid" in p["team"]
        print(f"✓ Team filter works - found {len(products)} Real Madrid products")


class TestReviewsAPI:
    """Reviews API tests - Verifies pytz fix is working"""
    
    def test_create_review_success(self):
        """POST /api/reviews should create a review (pytz dependency test)"""
        review_data = {
            "name": "TEST_PytzVerify",
            "text": "Testing pytz datetime fix",
            "stars": 5
        }
        response = requests.post(f"{BASE_URL}/api/reviews", json=review_data)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["status"] == "success"
        assert "review_id" in data
        print(f"✓ POST /api/reviews works (pytz fix verified) - review_id: {data['review_id']}")
        return data["review_id"]
    
    def test_get_reviews_success(self):
        """GET /api/reviews should return list"""
        response = requests.get(f"{BASE_URL}/api/reviews")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/reviews returns {len(data)} reviews")


class TestCategoriesAPI:
    """Categories API tests"""
    
    def test_get_categories(self):
        """GET /api/categories should return 3 categories"""
        response = requests.get(f"{BASE_URL}/api/categories")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3
        category_ids = [c["id"] for c in data]
        assert "echipe-club" in category_ids
        assert "nationale" in category_ids
        assert "retro" in category_ids
        print("✓ GET /api/categories returns 3 categories")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
