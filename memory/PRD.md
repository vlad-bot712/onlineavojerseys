# AVO JERSEYS - Product Requirements Document

## Overview
E-commerce website for premium football jerseys. Built with React, FastAPI, and MongoDB.

**Preview URL:** https://interactive-jersey.preview.emergentagent.com

## Core Features (Implemented)

### 1. Product Catalog
- Categories: Club Teams, National Teams, Retro, Limited Edition
- Products with variants (First Kit, Second Kit, Third Kit)
- Player/Fan version selection, Customization (name, number, patches)
- Size chart modal, Custom sorting by league priority

### 2. Shopping Cart & Checkout
- Correct variant image display, Kit and version info
- Coupon codes: "AVO10LEI" = 10 RON, "AVO20" = 20 RON
- Bundle support (main + free product), Multiple payment methods

### 3. Admin Panel (/admin/orders)
- Order list with stats, detail with customization info
- Status management, AWB tracking, Invoice generation

### 4. Promo Bundle Configurator (/promotii)
- Mobile-first, iOS-compatible, 250 RON pricing

### 5. Customer Order Tracking & Reviews System

### 6. Analytics (Admin)

### 7. Homepage Design (Updated Mar 10, 2026)
- **Hero Slideshow:** 4 images (Champions League stadium, Bernabeu, Allianz Arena red, night match) rotating every 5 seconds with crossfade
- **Space Grotesk font** for headings - clean, modern typography
- **Popular Teams Carousel:** 14 teams with logos in rounded square cards, navigation arrows
- **Categories:** 3 cards with hover lime underline animation
- **Featured Products:** 4 products with lime dot stock indicator
- **Benefits Section:** Dark background with lime icons (Livrare, Plata, Calitate)
- **Lime dividers** between sections
- **Color scheme:** Black, White, Lime (#CCFF00) only - no emojis, minimalist luxury

### 8. Products Page Design (Updated Mar 10, 2026)
- "CATALOG" lime label header
- Clean product cards with lime stock indicators
- Quick View modal on hover
- Preorder banner, Filter sidebar
- 360° Preview REMOVED per user request

## Technical Architecture

```
/app/
├── backend/
│   └── server.py              # FastAPI with all routes
├── frontend/
│   ├── public/
│   │   ├── images/logos/      # 14 team logo images
│   │   └── index.html         # Space Grotesk + Bebas Neue fonts
│   ├── src/
│   │   ├── components/
│   │   │   ├── Jersey360Viewer.js  # UNUSED - kept for potential future use
│   │   │   ├── Navbar.js, Footer.js, PromoPopup.js
│   │   │   ├── ReviewsSection.js, SizeChartModal.js
│   │   │   └── CountdownModal.js, InvoiceGenerator.js
│   │   ├── contexts/          # CartContext, CurrencyContext, FavoritesContext
│   │   └── pages/
│   │       ├── Home.js        # Slideshow hero, TeamsCarousel, categories
│   │       ├── Products.js    # Clean catalog with filters
│   │       └── ...
├── memory/PRD.md
```

## Completed Tasks

### Feb 16, 2026
- Fixed variant images, coupon codes, invoice generation

### Feb 27, 2026
- PromoBundle configurator, Cart/Checkout bundle support

### Mar 10, 2026
- Fixed pytz backend dependency
- Implemented Popular Teams carousel (14 teams)
- Implemented 360° Product Preview (later removed per user request)
- **Major design overhaul:**
  - Hero slideshow (4 images, 5s interval)
  - Space Grotesk font throughout
  - Minimalist luxury design with lime accents
  - Removed 360° preview from Products page
  - Redesigned carousel with proper non-distorted logos
  - Dark benefits section, lime dividers, clean typography

## Pending Tasks (Backlog)
- [ ] Real payment gateway integration (Stripe)
- [ ] Admin product management panel (CRUD)
- [ ] Verify merged repo features (CountdownModal, Favorites, OrderSuccess)
- [ ] Refactor server.py into modular routers
- [ ] Customer order deletion from tracking page

## Notes
- Payment methods (except Ramburs via Stripe) are facade/UI only
- Site colors: Black, White, Lime #CCFF00 only
- Font: Space Grotesk for headings, system/Inter for body
- pytz used for Romanian timezone timestamps
