# AVO JERSEYS - Product Requirements Document

## Overview
E-commerce website for premium football jerseys + casual sportswear. Built with React, FastAPI, MongoDB.

**Preview URL:** https://casual-products.preview.emergentagent.com

## Core Features (Implemented)

### 1. Jersey Product Catalog
- Categories: Club Teams, National Teams, Retro, Limited Edition
- Products with variants (First Kit, Second Kit, Third Kit)
- Player/Fan version, Customization (name, number, patches)
- Size chart, Quick View modal

### 2. Casual Sportswear Catalog (/casual) — NEW Mar 11, 2026
- **15 products** across 4 categories: Pantaloni Scurți (3), Pantaloni Lungi (2), Vestă (1), Tricouri (9)
- **Color selector** per product — changes main image on selection
- **Size selector** with "AJUTOR MĂRIMI" wizard popup (3-step)
- **Prices:** Shorts 150 RON, Pants 150 RON, Vest 180 RON, T-shirts 160 RON
- **Admin ON/OFF toggle** in /admin/orders to show/hide entire category
- **Coming Soon** page when disabled, full catalog when enabled
- **Navbar** shows/hides CASUAL link based on toggle state
- Images: placeholder SVGs in `/images/casual/{product-slug}/{color}.svg` — user will replace with real JPGs
- Products: Nike, Adidas, Jordan, Nike x Stussy collections

### 3. Size Recommendation System (AJUTOR MĂRIMI)
- **Step 1:** Select garment type (Pantaloni Scurți/Lungi, Tricou, Vestă)
- **Step 2:** Enter measurements (height+weight for pants, weight-only for shirts/vests)
- **Step 3:** Returns recommended size based on lookup tables
- Size tables match exact user-provided data

### 4. Shopping Cart & Checkout
- Supports both jersey and casual products
- Coupon codes: "AVO10LEI" = 10 RON, "AVO20" = 20 RON

### 5. Admin Panel (/admin/orders)
- Order management with status tracking
- **CASUAL ON/OFF toggle** — controls visibility of casual category for all users
- Analytics dashboard

### 6. Homepage Design
- Hero slideshow (4 images, 5s interval): Champions League, Bernabeu, Allianz Arena, night match
- Popular Teams Carousel (14 teams)
- Countdown timer set to **March 15, 2026** (Drop Casual launch date)
- Space Grotesk font, minimalist lime design

## Technical Architecture
```
/app/backend/server.py          # FastAPI - all routes including casual products + settings
/app/frontend/src/
  pages/Casual.js               # Casual sportswear catalog page
  pages/Home.js                 # Homepage with slideshow
  pages/Products.js             # Jersey catalog
  pages/AdminOrders.js          # Admin with CASUAL toggle
  components/SizeHelper.js      # 3-step size recommendation popup
  components/Navbar.js          # Conditional CASUAL link
  components/CountdownModal.js  # Timer → March 15, 2026
```

## Key DB Collections
- **products** — Jersey products (98 items)
- **casual_products** — Sportswear (15 items, seeded on startup)
- **site_settings** — { key: "casual_visible", value: boolean }
- **orders**, **reviews**, **analytics_visits**

## API Endpoints (Casual)
- `GET /api/settings/casual` — get toggle state
- `PATCH /api/settings/casual` — toggle ON/OFF
- `GET /api/casual-products?force=true` — get all products (admin)
- `GET /api/casual-products` — get products (respects toggle)
- `GET /api/casual-products/:id` — get single product

## Image Structure for Casual Products
```
/images/casual/{product-slug}/{color-slug}.jpg
Example: /images/casual/nike-running-division-shorts/negru.jpg
```
Currently SVG placeholders — user uploads real JPGs via Local Folder Upload.

## Completed Tasks (Latest First)

### Mar 11, 2026
- Casual sportswear page with 15 products, color/size selectors
- Size Helper wizard popup (3 steps, garment-specific logic)
- Admin ON/OFF toggle for casual visibility
- Navbar conditional CASUAL link
- Countdown timer updated to March 15, 2026
- Promo popup excluded from /casual page

### Mar 10, 2026
- Design overhaul: hero slideshow, Space Grotesk, lime accents
- Popular Teams carousel (14 teams)
- Fixed pytz backend dependency

## Pending Tasks (Backlog)
- [ ] User uploads real product images for casual products
- [ ] Real payment gateway integration (Stripe)
- [ ] Admin product management panel (CRUD)
- [ ] Refactor server.py into modular routers
