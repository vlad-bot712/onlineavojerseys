import requests
import json

API_URL = "http://localhost:8001/api/products"

# Club teams
clubs = [
    {"team": "Real Madrid", "slug": "real-madrid", "league": "La Liga", "country": "Spania", "plays_ucl": True},
    {"team": "Barcelona", "slug": "barcelona", "league": "La Liga", "country": "Spania", "plays_ucl": True},
    {"team": "Atletico Madrid", "slug": "atletico-madrid", "league": "La Liga", "country": "Spania", "plays_ucl": True},
    {"team": "Manchester City", "slug": "manchester-city", "league": "Premier League", "country": "Anglia", "plays_ucl": True},
    {"team": "Manchester United", "slug": "manchester-united", "league": "Premier League", "country": "Anglia", "plays_ucl": True},
    {"team": "Liverpool", "slug": "liverpool", "league": "Premier League", "country": "Anglia", "plays_ucl": True},
    {"team": "Chelsea", "slug": "chelsea", "league": "Premier League", "country": "Anglia", "plays_ucl": True},
    {"team": "Arsenal", "slug": "arsenal", "league": "Premier League", "country": "Anglia", "plays_ucl": True},
    {"team": "Bayern Munich", "slug": "bayern-munich", "league": "Bundesliga", "country": "Germania", "plays_ucl": True},
    {"team": "Borussia Dortmund", "slug": "borussia-dortmund", "league": "Bundesliga", "country": "Germania", "plays_ucl": True},
    {"team": "Juventus", "slug": "juventus", "league": "Serie A", "country": "Italia", "plays_ucl": True},
    {"team": "AC Milan", "slug": "ac-milan", "league": "Serie A", "country": "Italia", "plays_ucl": True},
    {"team": "Inter Milan", "slug": "inter-milan", "league": "Serie A", "country": "Italia", "plays_ucl": True},
    {"team": "PSG", "slug": "psg", "league": "Ligue 1", "country": "Franța", "plays_ucl": True},
]

# National teams
nationals = [
    {"team": "România", "slug": "romania", "country": "România"},
    {"team": "Spania", "slug": "spania", "country": "Spania"},
    {"team": "Germania", "slug": "germania", "country": "Germania"},
    {"team": "Franța", "slug": "franta", "country": "Franța"},
    {"team": "Anglia", "slug": "anglia", "country": "Anglia"},
    {"team": "Italia", "slug": "italia", "country": "Italia"},
    {"team": "Portugalia", "slug": "portugalia", "country": "Portugalia"},
    {"team": "Olanda", "slug": "olanda", "country": "Olanda"},
    {"team": "Argentina", "slug": "argentina", "country": "Argentina"},
    {"team": "Brazilia", "slug": "brazilia", "country": "Brazilia"},
]

years = [2024, 2025, 2026]
kit_names = {"first": "First Kit", "second": "Second Kit", "third": "Third Kit"}

def add_club_products():
    for club in clubs:
        for year in years:
            # Check which kits exist
            variants = []
            for kit in ["first", "second", "third"]:
                img_path = f"/images/products/{club['slug']}-{year}-{kit}.jpg"
                # Add variant
                variants.append({
                    "kit": kit,
                    "name": kit_names[kit],
                    "images": [img_path],
                    "color": "Standard"
                })
            
            product = {
                "name": f"{club['team']} {year}/{str(year+1)[-2:]}",
                "category": "echipe-club",
                "team": club["team"],
                "year": year,
                "league": club["league"],
                "plays_ucl": club["plays_ucl"],
                "country": club["country"],
                "price_ron": 170.0,
                "variants": variants,
                "description": f"Tricou oficial {club['team']} sezonul {year}/{year+1}",
                "sizes": ["S", "M", "L", "XL", "XXL"],
                "in_stock": True
            }
            
            try:
                res = requests.post(API_URL, json=product)
                print(f"Added: {product['name']} - {res.status_code}")
            except Exception as e:
                print(f"Error adding {product['name']}: {e}")

def add_national_products():
    for nation in nationals:
        for year in years:
            # Check which kits exist
            variants = []
            for kit in ["first", "second"]:
                img_path = f"/images/products/{nation['slug']}-{year}-{kit}.jpg"
                variants.append({
                    "kit": kit,
                    "name": kit_names[kit],
                    "images": [img_path],
                    "color": "Standard"
                })
            
            product = {
                "name": f"{nation['team']} {year}/{str(year+1)[-2:]}",
                "category": "nationale",
                "team": nation["team"],
                "year": year,
                "country": nation["country"],
                "price_ron": 170.0,
                "variants": variants,
                "description": f"Tricou oficial echipa națională {nation['team']} {year}/{year+1}",
                "sizes": ["S", "M", "L", "XL", "XXL"],
                "in_stock": True
            }
            
            try:
                res = requests.post(API_URL, json=product)
                print(f"Added: {product['name']} - {res.status_code}")
            except Exception as e:
                print(f"Error adding {product['name']}: {e}")

if __name__ == "__main__":
    print("Adding club products...")
    add_club_products()
    print("\nAdding national products...")
    add_national_products()
    print("\nDone!")
