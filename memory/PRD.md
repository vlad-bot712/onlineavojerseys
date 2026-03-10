# AVO JERSEYS - Product Requirements Document

## Overview
E-commerce website for premium football jerseys. Built with React, FastAPI, and MongoDB.

**Preview URL:** https://interactive-jersey.preview.emergentagent.com

## Core Features (Implemented)

### 1. Product Catalog
- Categories: Club Teams, National Teams, Retro, Limited Edition
- Products with variants (First Kit, Second Kit, Third Kit)
- Player/Fan version selection
- Customization (name, number, patches)
- Size chart modal
- Custom sorting by league priority

### 2. Shopping Cart
- Correct variant image display
- Kit and version information shown
- Customization details preserved
- Quantity management
- Bundle support with main + free product display

### 3. Checkout
- Full address form (Romania only)
- Multiple payment methods (Ramburs, Card, Transfer, Skrill, Paysafe)
- Coupon code system: "AVO10LEI" = 10 RON, "AVO20" = 20 RON discount
- Bundle items split into 2 order items (main paid + free)

### 4. Admin Panel (/admin/orders)
- Order list with stats
- Order detail with customization info
- Status management (Pending, Processing, Shipped, Delivered, Cancelled)
- AWB tracking, Invoice generation, Email templates
- Bundle items shown with BUNDLE/GRATIS badges

### 5. Promo Bundle Configurator (/promotii)
- Mobile-first, iOS-compatible
- Main product: Team select -> Season -> Kit -> Image preview -> Size
- Free product: National team select -> Image preview -> Size
- Price: 250 RON (save 50 RON)
- PromoPopup: bottom sheet on mobile, centered on desktop

### 6. Customer Order Tracking
- Search by order number
- Invoice download
- Full order details with product images

### 7. Reviews System
- Customer reviews on homepage
- Star rating + text + image upload

### 8. Analytics (Admin)
- Traffic analytics modal
- Visitor stats and reset functionality

### 9. Popular Teams Carousel (Homepage)
- Horizontal scrollable carousel with 14 team logos
- Navigation arrows on hover
- Click navigates to filtered products by team
- Teams: Real Madrid, Barcelona, Man Utd, Liverpool, PSG, Bayern, Juventus, AC Milan, Arsenal, Chelsea, Man City, Inter Milan, Atletico Madrid, Borussia Dortmund

### 10. 360° Product Preview (Products Page)
- Interactive jersey viewer for Romania jersey
- 5 views: Front, Lateral (Angle), Back, Detail (Flat), Display (Hanging)
- Drag-to-rotate functionality
- Arrow buttons and tab navigation
- Name/Number customization with live overlay on back view
- Font: Bebas Neue (blocky, condensed sans-serif)
- Fullscreen mode toggle
- Progress bar showing current view position
- Responsive design with dark theme

### 11. Quick View Modal (Products Page)
- Opens from product card hover button
- Shows product image, variant selection, size picker
- Add to cart directly from modal

## Technical Architecture

```
/app/
├── backend/
│   └── server.py              # FastAPI with all routes
├── frontend/
│   ├── public/
│   │   ├── images/
│   │   │   ├── logos/         # Team logo images (14 teams)
│   │   │   ├── preview360/    # 360° preview images + font references
│   │   │   └── products/      # Product images
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Jersey360Viewer.js  # 360° interactive viewer
│   │   │   ├── Navbar.js, Footer.js
│   │   │   ├── PromoPopup.js
│   │   │   ├── InvoiceGenerator.js
│   │   │   ├── AnalyticsModal.js
│   │   │   ├── ReviewsSection.js
│   │   │   └── SizeChartModal.js
│   │   ├── contexts/
│   │   │   ├── CartContext.js
│   │   │   ├── CurrencyContext.js
│   │   │   └── FavoritesContext.js
│   │   └── pages/
│   │       ├── Home.js            # TeamsCarousel component
│   │       ├── Products.js        # 360° banner + viewer integration
│   │       ├── ProductDetail.js
│   │       ├── PromoBundle.js
│   │       ├── Cart.js, Checkout.js
│   │       ├── AdminOrders.js, AdminOrderDetail.js
│   │       └── OrderTracking.js, Contact.js
├── memory/PRD.md
```

## API Endpoints

- `GET /api/products` - List products (with filters)
- `GET /api/products/:id` - Get product detail
- `POST /api/products` - Create product
- `DELETE /api/products/:id` - Delete product
- `GET /api/categories` - Get categories
- `POST /api/orders` - Create order
- `GET /api/orders` - List orders (admin)
- `GET /api/orders/:id` - Get order detail
- `PATCH /api/orders/:id` - Update order status/AWB
- `DELETE /api/orders/:id` - Delete order
- `POST /api/orders/:id/invoice` - Save invoice image
- `POST /api/reviews` / `GET /api/reviews` / `DELETE /api/reviews/:id`
- `POST /api/analytics/visit` / `GET /api/analytics/stats` / `DELETE /api/analytics/reset`

## Completed Tasks

### Feb 16, 2026
1. Fixed variant image display in cart/checkout/admin
2. Added coupon code field with discounts
3. Added logo to footer, Fixed Retro category image
4. Added invoice generation and attachment
5. Created image naming guide

### Feb 27, 2026
6. Implemented PromoBundle configurator with full customization flow
7. Added PromoPopup to App layout
8. Updated Cart to display bundle items
9. Updated Checkout to split bundles into 2 order items
10. Updated AdminOrderDetail to show bundle badges

### Mar 10, 2026
11. Fixed pytz backend dependency (was crashing on timestamp operations)
12. Implemented Popular Teams carousel on homepage (14 teams with logos)
13. Implemented 360° Product Preview for Romania jersey (5 views, drag-to-rotate, name/number customization)
14. Added Quick View modal on product cards

## Pending Tasks (Backlog)
- [ ] Extend 360° preview to more products
- [ ] Real payment gateway integration (Stripe)
- [ ] Admin product management panel (CRUD)
- [ ] Verify merged repo features (CountdownModal, NewsletterPopup, AdminTickets, Favorites, OrderSuccess)
- [ ] Refactor server.py into modular routers
- [ ] Deploy data sync (Limited Edition products + sorting)
- [ ] Customer order deletion from tracking page

## Notes
- Payment methods (except Ramburs via Stripe) are facade/UI only
- Bundle items: main product at full price, free product at 0 RON
- Patches stored as actual league names for admin clarity
- 360° viewer uses Bebas Neue Google Font for jersey customization text
- pytz used for Romanian timezone (Europe/Bucharest) timestamps
