"""
Backend API Tests for PromoBundle feature
Tests the /api/products endpoints used by the PromoBundle configurator
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthEndpoint:
    """Health check tests - run first"""
    
    def test_health_endpoint(self):
        """Verify API is accessible"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        print("PASS: Health endpoint working")


class TestClubTeamsAPI:
    """Tests for /api/products?category=echipe-club endpoint"""
    
    def test_get_club_teams_returns_data(self):
        """Verify club teams endpoint returns products"""
        response = requests.get(f"{BASE_URL}/api/products?category=echipe-club")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "Should return at least one club team product"
        print(f"PASS: Club teams API returned {len(data)} products")
    
    def test_club_teams_have_required_fields(self):
        """Verify club team products have all required fields for PromoBundle"""
        response = requests.get(f"{BASE_URL}/api/products?category=echipe-club")
        assert response.status_code == 200
        data = response.json()
        
        required_fields = ['id', 'name', 'team', 'year', 'league', 'variants', 'category']
        
        for product in data[:5]:  # Check first 5 products
            for field in required_fields:
                assert field in product, f"Missing field '{field}' in product {product.get('name', 'unknown')}"
        print("PASS: Club team products have all required fields")
    
    def test_club_teams_have_variants_with_images(self):
        """Verify club teams have variants with kit information"""
        response = requests.get(f"{BASE_URL}/api/products?category=echipe-club")
        assert response.status_code == 200
        data = response.json()
        
        for product in data[:5]:
            assert 'variants' in product
            assert isinstance(product['variants'], list)
            assert len(product['variants']) > 0, f"Product {product['name']} should have at least 1 variant"
            
            # Check first variant has required structure
            variant = product['variants'][0]
            assert 'images' in variant, f"Variant in {product['name']} missing images"
            assert 'name' in variant or 'kit' in variant, f"Variant in {product['name']} missing name/kit"
        print("PASS: Club team products have proper variants structure")
    
    def test_club_teams_grouped_by_league(self):
        """Verify club teams can be grouped by league"""
        response = requests.get(f"{BASE_URL}/api/products?category=echipe-club")
        assert response.status_code == 200
        data = response.json()
        
        leagues = set()
        for product in data:
            if product.get('league'):
                leagues.add(product['league'])
        
        # Should have at least 3 different leagues
        assert len(leagues) >= 3, f"Should have at least 3 leagues, found: {leagues}"
        print(f"PASS: Found {len(leagues)} leagues: {leagues}")
    
    def test_club_teams_have_multiple_years(self):
        """Verify club teams have products for multiple years (2024, 2025, 2026)"""
        response = requests.get(f"{BASE_URL}/api/products?category=echipe-club")
        assert response.status_code == 200
        data = response.json()
        
        years = set()
        for product in data:
            years.add(product.get('year'))
        
        assert 2024 in years, "Should have 2024 products"
        assert 2025 in years, "Should have 2025 products"
        assert 2026 in years, "Should have 2026 products"
        print(f"PASS: Found products for years: {sorted(years)}")


class TestNationalTeamsAPI:
    """Tests for /api/products?category=nationale endpoint"""
    
    def test_get_national_teams_returns_data(self):
        """Verify national teams endpoint returns products"""
        response = requests.get(f"{BASE_URL}/api/products?category=nationale")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "Should return at least one national team product"
        print(f"PASS: National teams API returned {len(data)} products")
    
    def test_national_teams_have_required_fields(self):
        """Verify national team products have required fields for free product selection"""
        response = requests.get(f"{BASE_URL}/api/products?category=nationale")
        assert response.status_code == 200
        data = response.json()
        
        required_fields = ['id', 'name', 'team', 'year', 'variants', 'category']
        
        for product in data[:5]:
            for field in required_fields:
                assert field in product, f"Missing field '{field}' in national product {product.get('name', 'unknown')}"
        print("PASS: National team products have all required fields")
    
    def test_national_teams_have_year_2025_for_free_jersey(self):
        """Verify national teams have 2025 products (used for 25/26 free jersey)"""
        response = requests.get(f"{BASE_URL}/api/products?category=nationale")
        assert response.status_code == 200
        data = response.json()
        
        year_2025_products = [p for p in data if p.get('year') == 2025]
        assert len(year_2025_products) > 0, "Should have year 2025 national products for free jersey"
        print(f"PASS: Found {len(year_2025_products)} national team products with year 2025")
    
    def test_national_teams_have_multiple_teams(self):
        """Verify there are multiple national teams available"""
        response = requests.get(f"{BASE_URL}/api/products?category=nationale")
        assert response.status_code == 200
        data = response.json()
        
        teams = set()
        for product in data:
            teams.add(product.get('team'))
        
        assert len(teams) >= 5, f"Should have at least 5 different national teams, found: {len(teams)}"
        print(f"PASS: Found {len(teams)} unique national teams: {teams}")


class TestOrdersAPI:
    """Tests for orders API - used when bundle is added to cart and checkout"""
    
    def test_create_order_with_bundle_structure(self):
        """Test creating an order with bundle items (main + free)"""
        order_data = {
            "items": [
                {
                    "product_id": "bundle_test_main",
                    "product_name": "BUNDLE: Real Madrid 2025/26 First Kit",
                    "product_image": "/images/products/real-madrid-2025-first.jpg",
                    "size": "M",
                    "quantity": 1,
                    "price_ron": 250,
                    "customization": {"name": "TESTNAME", "number": "10", "patches": ["La Liga", "UCL"]},
                    "version": "fan",
                    "kit": "first",
                    "kit_name": "First Kit"
                },
                {
                    "product_id": "bundle_test_free",
                    "product_name": "BUNDLE GRATIS: România 25/26",
                    "product_image": "/images/products/romania-2025-first.jpg",
                    "size": "L",
                    "quantity": 1,
                    "price_ron": 0,
                    "customization": None,
                    "version": "fan",
                    "kit": "first",
                    "kit_name": "First Kit"
                }
            ],
            "customer_name": "Test Bundle User",
            "customer_email": "testbundle@example.com",
            "customer_phone": "+40700000000",
            "customer_address": "Str. Test nr. 1, București, Sector 1, 010101, România",
            "customer_street": "Str. Test nr. 1",
            "customer_city": "București",
            "customer_county": "Sector 1",
            "customer_zip": "010101",
            "customer_country": "România",
            "shipping_method": "standard",
            "payment_method": "ramburs",
            "total_ron": 270,  # 250 + 20 shipping
            "currency": "RON",
            "coupon_code": None,
            "coupon_discount": 0
        }
        
        response = requests.post(f"{BASE_URL}/api/orders", json=order_data)
        assert response.status_code == 250, f"Order creation failed: {response.text}"
        
        order = response.json()
        assert 'id' in order
        assert 'order_number' in order
        assert order['order_number'].startswith('AVO')
        assert len(order['items']) == 2
        
        # Verify main item
        main_item = order['items'][0]
        assert main_item['price_ron'] == 250
        assert 'BUNDLE:' in main_item['product_name']
        
        # Verify free item
        free_item = order['items'][1]
        assert free_item['price_ron'] == 0
        assert 'GRATIS' in free_item['product_name']
        
        print(f"PASS: Bundle order created with order_number: {order['order_number']}")
        
        # Cleanup - delete test order
        delete_response = requests.delete(f"{BASE_URL}/api/orders/{order['id']}")
        assert delete_response.status_code == 200
        print("PASS: Test order cleaned up successfully")
    
    def test_get_orders_list(self):
        """Verify orders list endpoint works"""
        response = requests.get(f"{BASE_URL}/api/orders")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Orders list API returned {len(data)} orders")


class TestCategoriesAPI:
    """Tests for categories endpoint"""
    
    def test_get_categories(self):
        """Verify categories endpoint returns expected categories"""
        response = requests.get(f"{BASE_URL}/api/categories")
        assert response.status_code == 200
        data = response.json()
        
        category_slugs = [c['slug'] for c in data]
        assert 'echipe-club' in category_slugs, "Should have echipe-club category"
        assert 'nationale' in category_slugs, "Should have nationale category"
        print(f"PASS: Categories API returned: {category_slugs}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
