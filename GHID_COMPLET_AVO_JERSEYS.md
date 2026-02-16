# 🎯 GHID COMPLET AVO JERSEYS

## 📍 CUM ACCESEZI ADMIN ORDERS

### Metoda 1: URL Direct
Accesează acest link în browser:
```
https://football-shop-17.preview.emergentagent.com/admin/orders
```

### Metoda 2: Din Site
1. Mergi pe site-ul tău
2. Adaugă `/admin/orders` la finalul URL-ului
3. Apasă Enter

### Ce Poți Face în Admin:
✅ Vezi toate comenzile (carduri elegante)
✅ Statistici: Total, În Așteptare, Procesare, Expediate, Livrate
✅ Click pe "Vezi Detalii" pentru orice comandă
✅ Modifici status: Pending → Processing → Shipped → Delivered
✅ Adaugi AWB pentru tracking
✅ Vezi detalii complete: client, produse, plată, adresă

---

## 💾 CUM DOWNLOADEZI SITE-UL

### OPȚIUNEA 1: Save to GitHub (Recomandată) ⭐

**Pas 1: Conectează GitHub**
1. Click pe profilul tău (colțul dreapta sus în Emergent)
2. Selectează "Connect GitHub"
3. Autorizează accesul

**Pas 2: Push to GitHub**
1. Click butonul "Save to GitHub" din interfața chat
2. Selectează repository-ul (sau creează unul nou)
3. Alege branch-ul (ex: main)
4. Click "PUSH TO GITHUB"
5. ✅ Codul tău este acum pe GitHub!

**Pas 3: Clonează Local**
```bash
git clone https://github.com/username/repo-name.git
cd repo-name
```

**Notă:** Această funcție necesită un plan plătit Emergent

---

### OPȚIUNEA 2: VS Code View (Manual)

**Pas 1: Deschide VS Code View**
1. Click pe iconița VS Code din Emergent (stânga sus)
2. Vezi structura completă a proiectului

**Pas 2: Copiază Fișierele**
- Navighează prin foldere în panoul din stânga
- Click pe fiecare fișier pentru a-l deschide
- Copiază conținutul manual într-un editor local

**Structura Principală:**
```
/app/
├── backend/
│   ├── server.py          ← API principal
│   ├── requirements.txt   ← Dependențe Python
│   └── .env              ← Variabile mediu
└── frontend/
    ├── src/
    │   ├── App.js
    │   ├── pages/
    │   │   ├── Home.js
    │   │   ├── Products.js
    │   │   ├── Checkout.js
    │   │   ├── AdminOrders.js
    │   │   └── ...
    │   ├── contexts/
    │   │   ├── CartContext.js
    │   │   ├── CurrencyContext.js
    │   │   └── FavoritesContext.js
    │   └── components/
    │       ├── Navbar.js
    │       └── Footer.js
    ├── package.json       ← Dependențe Node.js
    └── .env              ← Variabile mediu
```

---

### OPȚIUNEA 3: Export din Emergent

**Pas 1: Verifică opțiunile de export**
1. Click pe meniul proiect
2. Caută opțiunea "Export" sau "Download"
3. Selectează formatul (ZIP sau GitHub)

---

## 🚀 CUM RULEZI LOCAL (După Download)

### Backend (FastAPI + MongoDB)

**1. Instalează dependențe:**
```bash
cd backend
pip install -r requirements.txt
```

**2. Configurează .env:**
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=avo_jerseys
CORS_ORIGINS=http://localhost:3000
STRIPE_API_KEY=sk_test_emergent
```

**3. Pornește MongoDB local:**
```bash
# Instalează MongoDB dacă nu ai
# Windows: https://www.mongodb.com/try/download/community
# Mac: brew install mongodb-community
# Linux: sudo apt install mongodb

# Pornește server
mongod
```

**4. Rulează backend:**
```bash
python server.py
# Sau
uvicorn server:app --reload --port 8001
```

### Frontend (React)

**1. Instalează dependențe:**
```bash
cd frontend
npm install
# Sau
yarn install
```

**2. Configurează .env:**
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

**3. Rulează frontend:**
```bash
npm start
# Sau
yarn start
```

**4. Deschide browser:**
```
http://localhost:3000
```

---

## 🌐 DEPLOYMENT LIVE

### Deploy pe Emergent Platform

**1. Click "Deploy"**
- În interfața Emergent, click pe butonul "Deploy"
- Selectează "Deploy Now"

**2. Configurare:**
- Alege un nume pentru aplicație
- Verifică variabilele de mediu
- Confirmă deployment

**3. Așteaptă:**
- Procesul durează ~10-15 minute
- Primești notificare când e gata

**4. URL Live:**
- Primești un URL public: `https://your-app.emergentagent.com`
- Site-ul este LIVE 24/7!

**Cost:** 50 credite/lună per aplicație deployed

### Custom Domain (Opțional)

**1. Cumpără domeniu:**
- De la GoDaddy, Namecheap, Google Domains, etc.
- Ex: www.avojerseys.ro

**2. Configurează în Emergent:**
- Click "Link Domain"
- Adaugă domeniul tău
- Urmează instrucțiunile DNS

**3. ✅ Site-ul tău va fi pe:**
```
www.avojerseys.ro
```

---

## 🐛 TROUBLESHOOTING

### Problema: "Comandă plasată corect" nu apare

**✅ REZOLVAT!** Am reparat codul. Acum:
- Selectează Ramburs/Transfer/Skrill/Paysafe → Vezi pagina de succes
- Selectează Card Bancar → Redirectează către Stripe

### Problema: Stiluri CSS nu se încarcă

**Soluție:**
1. Hard Refresh: Ctrl+Shift+R (Windows) sau Cmd+Shift+R (Mac)
2. Șterge cache browser
3. Testează în mod Incognito

### Problema: MongoDB connection error

**Soluție:**
```bash
# Verifică dacă MongoDB rulează
mongosh
# Sau
mongo

# Pornește MongoDB
mongod --dbpath /path/to/data
```

---

## 📞 SUPORT

### Link-uri Utile:
- 🌐 Site Preview: https://football-shop-17.preview.emergentagent.com
- 👨‍💼 Admin: https://football-shop-17.preview.emergentagent.com/admin/orders
- 📦 Backend API: https://football-shop-17.preview.emergentagent.com/api/health

### Resurse:
- Emergent Docs: https://docs.emergentagent.com
- MongoDB Docs: https://docs.mongodb.com
- React Docs: https://react.dev
- FastAPI Docs: https://fastapi.tiangolo.com

---

## ✅ CHECKLIST FINAL

- [ ] Am accesat pagina admin și văd comenzile
- [ ] Am testat checkout cu Ramburs
- [ ] Apare pagina "Comandă plasată cu succes"
- [ ] Numărul comenzii se salvează automat
- [ ] Pot vedea "Comenzile mele recente" în tracking
- [ ] Am downloadat codul pe GitHub/local
- [ ] Am testat site-ul local (opțional)
- [ ] Am făcut deploy live (opțional)

---

**🎉 GATA! Site-ul tău AVO JERSEYS este complet funcțional!**
