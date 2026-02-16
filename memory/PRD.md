# AVO JERSEYS - Product Requirements Document

## Overview
E-commerce website for premium football jerseys. Built with React, FastAPI, and MongoDB.

**Preview URL:** https://football-shop-17.preview.emergentagent.com

## Core Features (Implemented)

### 1. Product Catalog ✅
- Three categories: Club Teams, National Teams, Retro
- Products with variants (First Kit, Second Kit, Third Kit)
- Player/Fan version selection
- Customization (name, number, patches)
- Local image system with naming convention: `[team]-[year]-[kit].jpg`

### 2. Shopping Cart ✅
- Correct variant image display
- Kit and version information shown
- Customization details preserved
- Quantity management

### 3. Checkout ✅
- Full address form (Romania only)
- Multiple payment methods (Ramburs, Card, Transfer, Skrill, Paysafe)
- **Coupon code system: "AVO10LEI" = 10 RON discount**
- Order number generation

### 4. Admin Panel (/admin/orders) ✅
- Order list with stats
- Order detail view with all customization info
- Status management (Pending, Processing, Shipped, Delivered, Cancelled)
- AWB tracking input
- **Invoice generation (downloadable PNG)**
- **Invoice attachment to order for customer access**
- Order deletion

### 5. Customer Order Tracking ✅
- Search by order number
- Recent orders from localStorage
- Invoice download (if attached by admin)
- Full order details with product images

### 6. UI/Design ✅
- Logo: "AVO" (black/white) + "JERSEYS" (lime green #CCFF00)
- Footer with styled logo
- Category images (Retro fixed)
- Mobile responsive

## Technical Architecture

```
/app/
├── backend/
│   └── server.py              # FastAPI with all routes
├── frontend/
│   ├── public/
│   │   └── images/products/   # Local product images
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── Footer.js (with logo)
│   │   │   └── InvoiceGenerator.js (NEW)
│   │   ├── contexts/
│   │   │   ├── CartContext.js
│   │   │   ├── CurrencyContext.js
│   │   │   └── FavoritesContext.js
│   │   └── pages/
│   │       ├── ProductDetail.js
│   │       ├── Cart.js
│   │       ├── Checkout.js (with coupon)
│   │       ├── AdminOrders.js
│   │       ├── AdminOrderDetail.js (with invoice)
│   │       └── OrderTracking.js (with invoice view)
├── GHID_IMAGINI_PRODUSE.md    # Image naming guide
└── memory/PRD.md              # This file
```

## API Endpoints

- `GET /api/products` - List products (with filters)
- `GET /api/products/:id` - Get product detail
- `GET /api/categories` - Get categories
- `POST /api/orders` - Create order
- `GET /api/orders` - List orders (admin)
- `GET /api/orders/:id` - Get order detail
- `GET /api/orders/number/:number` - Get by order number
- `PATCH /api/orders/:id` - Update order status/AWB
- `DELETE /api/orders/:id` - Delete order
- `POST /api/orders/:id/invoice` - Save invoice image (NEW)

## Image Naming Convention
```
/images/products/[team]-[year]-[kit].jpg
```
Examples:
- `real-madrid-2024-first.jpg`
- `romania-2025-second.jpg`

## Completed Tasks (Feb 16, 2026)
1. ✅ Fixed variant image display in cart/checkout/admin
2. ✅ Added coupon code field with "AVO10LEI" discount
3. ✅ Added logo to footer
4. ✅ Fixed Retro category image
5. ✅ Added invoice generation in Admin Order Detail
6. ✅ Added invoice attachment for customers
7. ✅ Created image naming guide document

## Pending Tasks (Backlog)
- [ ] Real payment gateway integration (Stripe/PayPal functional)
- [ ] Customer order deletion from tracking page
- [ ] Email notifications for order status changes
- [ ] Stock management system

## Notes
- Payment methods (except Ramburs) are UI only - not fully integrated
- Images for national teams need to be added manually following naming convention
