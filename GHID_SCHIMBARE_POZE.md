# 📸 CUM SCHIMBI POZELE - GHID SIMPLU

## PASUL 1: ÎNCARCĂ POZELE UNDEVA

Pozele trebuie să fie pe internet. Opțiuni:

**A. Imgur (Gratis, Rapid)** ⭐
1. Mergi pe https://imgur.com
2. Click "New post"
3. Upload poza ta
4. Click dreapta pe poză → "Copy image address"
5. Primești link: `https://i.imgur.com/abc123.jpg`

**B. Google Drive**
1. Upload în Google Drive
2. Click dreapta → "Get link" → "Anyone with link"
3. Copiază link-ul

**C. Orice hosting de poze**
- Dropbox
- Google Photos
- Site-ul tău

---

## PASUL 2: SCHIMBĂ POZELE ÎN BAZA DE DATE

### METODA CEA MAI SIMPLĂ - Script Python

**1. Creează fișier `/app/schimba_poze.py`:**

```python
from pymongo import MongoClient

# Conectare MongoDB
client = MongoClient("mongodb://localhost:27017")
db = client["test_database"]

# ====================================
# EXEMPLU: REAL MADRID 2024
# ====================================

db.products.update_one(
    {"name": "Tricou Real Madrid 2024"},  # Căută produsul
    {"$set": {
        # First Kit - pui link-urile tale aici
        "variants.0.images": [
            "https://i.imgur.com/POZA-RM-FIRST-1.jpg",
            "https://i.imgur.com/POZA-RM-FIRST-2.jpg"
        ],
        
        # Second Kit
        "variants.1.images": [
            "https://i.imgur.com/POZA-RM-SECOND.jpg"
        ],
        
        # Third Kit
        "variants.2.images": [
            "https://i.imgur.com/POZA-RM-THIRD.jpg"
        ]
    }}
)
print("✓ Real Madrid 2024 - poze schimbate!")

# ====================================
# EXEMPLU: FCSB 2024
# ====================================

db.products.update_one(
    {"name": "Tricou FCSB 2024"},
    {"$set": {
        "variants.0.images": [
            "https://i.imgur.com/POZA-FCSB-FIRST.jpg"
        ],
        "variants.1.images": [
            "https://i.imgur.com/POZA-FCSB-SECOND.jpg"
        ],
        "variants.2.images": [
            "https://i.imgur.com/POZA-FCSB-THIRD.jpg"
        ]
    }}
)
print("✓ FCSB 2024 - poze schimbate!")

# ====================================
# Adaugă și alte echipe aici
# ====================================

print("\n🎉 GATA! Toate pozele au fost schimbate!")
print("Refresh site-ul pentru a vedea noile poze.")
```

**2. Rulează scriptul:**
```bash
cd /app
python3 schimba_poze.py
```

**3. GATA! Pozele sunt schimbate!**

---

## EXPLICAȚIE SIMPLĂ:

**Ce înseamnă `variants.0`, `variants.1`, `variants.2`?**
- `variants.0` = First Kit (prima opțiune)
- `variants.1` = Second Kit (a doua opțiune)
- `variants.2` = Third Kit (a treia opțiune)

**Câte poze pot pune?**
- Poți pune 1, 2, 3 sau mai multe poze per kit!
- Exemplu cu 3 poze:
```python
"variants.0.images": [
    "https://poza1.jpg",  # Față
    "https://poza2.jpg",  # Spate
    "https://poza3.jpg"   # Detalii
]
```

---

## TEMPLATE GOL - COPIAZĂ ȘI COMPLETEAZĂ:

```python
from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")
db = client["test_database"]

# Schimbă "NUME_PRODUS" cu numele exact din listă
# Schimbă "URL_POZE" cu link-urile tale

db.products.update_one(
    {"name": "NUME_PRODUS_AICI"},
    {"$set": {
        "variants.0.images": ["URL_FIRST_KIT"],
        "variants.1.images": ["URL_SECOND_KIT"],
        "variants.2.images": ["URL_THIRD_KIT"]
    }}
)

print("✓ Poze schimbate!")
```

---

## LISTA PRODUSE DISPONIBILE:

### 🇷🇴 ECHIPE ROMÂNEȘTI:
- Tricou FCSB 2024
- Tricou FCSB 2023
- Tricou CFR Cluj 2024
- Tricou CFR Cluj 2023
- Tricou Universitatea Cluj 2024
- Tricou Universitatea Cluj 2023
- Tricou Universitatea Craiova 2024
- Tricou Universitatea Craiova 2023
- Tricou FC Botoșani 2024
- Tricou FC Botoșani 2023

### 🌍 ECHIPE INTERNAȚIONALE:
- Tricou Real Madrid 2024
- Tricou Real Madrid 2023
- Tricou Barcelona 2024
- Tricou Barcelona 2023
- Tricou Manchester United 2024
- Tricou Manchester City 2024
- Tricou Liverpool 2024
- ... și multe altele

### Vezi toate:
```bash
mongosh mongodb://localhost:27017/test_database

db.products.find({}, {name: 1, _id: 0})
```

---

## ÎNTREBĂRI FRECVENTE:

**Q: Pot schimba pozele direct în MongoDB?**
A: Da! 
```bash
mongosh mongodb://localhost:27017/test_database

db.products.update_one(
  {name: "Tricou FCSB 2024"},
  {$set: {"variants.0.images": ["URL_NOU"]}}
)
```

**Q: Cum văd ce poze am acum?**
A: 
```bash
mongosh mongodb://localhost:27017/test_database

db.products.findOne({name: "Tricou FCSB 2024"})
```

**Q: Pozele nu se schimbă pe site?**
A: Hard refresh în browser: **Ctrl + Shift + R**

**Q: Pot adăuga produse noi?**
A: Da! Folosește același script, dar cu `insert_one` în loc de `update_one`.

---

## 🎯 RECAP:

1. **Încarcă pozele** pe Imgur/Drive → Primești link
2. **Copiază template** de mai sus
3. **Înlocuiește** numele produsului și URL-urile
4. **Rulează** script: `python3 schimba_poze.py`
5. **GATA!** Refresh site-ul

**SIMPLU! 🚀**
