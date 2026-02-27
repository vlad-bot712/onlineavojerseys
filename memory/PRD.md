# AVO JERSEYS - Product Requirements Document

## Overview
E-commerce website for premium football jerseys. Built with React, FastAPI, and MongoDB.

**Preview URL:** https://limited-edition-1.preview.emergentagent.com

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
- **Bundle support with main + free product display**

### 3. Checkout
- Full address form (Romania only)
- Multiple payment methods (Ramburs, Card, Transfer, Skrill, Paysafe)
- Coupon code system: "AVO10LEI" = 10 RON, "AVO20" = 20 RON discount
- **Bundle items split into 2 order items (main paid + free)**

### 4. Admin Panel (/admin/orders)
- Order list with stats
- Order detail with customization info
- Status management (Pending, Processing, Shipped, Delivered, Cancelled)
- AWB tracking, Invoice generation, Email templates
- **Bundle items shown with BUNDLE/GRATIS badges**

### 5. Promo Bundle Configurator (/promotii) - NEW (Updated Feb 27)
- Mobile-first design, single column, touch-friendly
- Main product: Team select (optgroup by league) → Season → Kit → Inline image preview → Size
- Free product: National team select → Inline image preview → Size (year preset 25/26)
- Product images show inline for both selections
- Price: 200 RON (save 100 RON)
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

## Technical Architecture

```
/app/
├── backend/
│   └── server.py              # FastAPI with all routes (~926 lines)
├── frontend/
│   ├── public/images/          # Product and promo images
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js, Footer.js
│   │   │   ├── PromoPopup.js     # Bundle promo popup
│   │   │   ├── InvoiceGenerator.js
│   │   │   ├── AnalyticsModal.js
│   │   │   ├── ReviewsSection.js
│   │   │   └── SizeChartModal.js
│   │   ├── contexts/
│   │   │   ├── CartContext.js
│   │   │   ├── CurrencyContext.js
│   │   │   └── FavoritesContext.js
│   │   └── pages/
│   │       ├── PromoBundle.js    # Bundle configurator
│   │       ├── Products.js, ProductDetail.js
│   │       ├── Cart.js, Checkout.js
│   │       ├── AdminOrders.js, AdminOrderDetail.js
│   │       └── OrderTracking.js, Home.js, Contact.js
├── memory/PRD.md
```

## API Endpoints

- `GET /api/products` - List products (with filters: category, team, year, search)
- `GET /api/products/:id` - Get product detail
- `POST /api/products` - Create product
- `DELETE /api/products/:id` - Delete product
- `GET /api/categories` - Get categories
- `POST /api/orders` - Create order (supports bundle items)
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
6. Implemented PromoBundle configurator (/promotii) with full customization flow
7. Added PromoPopup to App layout
8. Updated Cart to display bundle items (main + free with GRATIS label)
9. Updated Checkout to split bundles into 2 order items
10. Updated AdminOrderDetail to show bundle badges

## Pending Tasks (Backlog)
- [ ] Deploy data sync (Limited Edition products + sorting)
- [ ] Real payment gateway integration
- [ ] Customer order deletion from tracking page
- [ ] Admin product management panel
- [ ] Refactor server.py into modular routers

## Notes
- Payment methods (except Ramburs via Stripe) are facade/UI only
- Bundle items: main product at full price, free product at 0 RON
- Patches stored as actual league names (e.g., "La Liga", "UCL") for admin clarity
