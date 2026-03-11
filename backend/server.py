from fastapi import FastAPI, HTTPException, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime, timezone, timedelta
from bson import ObjectId
import os
from dotenv import load_dotenv
from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout,
    CheckoutSessionResponse,
    CheckoutStatusResponse,
    CheckoutSessionRequest
)

load_dotenv()

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB
mongo_client = AsyncIOMotorClient(os.getenv("MONGO_URL"))
db = mongo_client[os.getenv("DB_NAME")]

# Stripe
stripe_api_key = os.getenv("STRIPE_API_KEY")


# Pydantic Models
class Product(BaseModel):
    id: Optional[str] = None
    name: str
    category: str
    team: str
    year: int
    league: Optional[str] = None  # Ex: "La Liga", "Premier League"
    plays_ucl: bool = False
    country: Optional[str] = None  # Ex: "Spania", "Anglia"
    price_ron: float = 170.0
    variants: List[Dict] = []  # [{"kit": "first", "name": "Acasă", "images": [...], "color": "Alb"}]
    description: str = ""
    sizes: List[str] = ["S", "M", "L", "XL", "XXL"]
    in_stock: bool = True
    
    class Config:
        json_encoders = {ObjectId: str}


class Category(BaseModel):
    id: str
    name: str
    slug: str
    image_url: str = ""


class OrderItem(BaseModel):
    product_id: str
    product_name: str
    product_image: str
    size: str
    quantity: int
    price_ron: float
    customization: Optional[Dict] = None  # {name: str, number: str, patches: [str]}
    version: Optional[str] = "fan"  # player or fan
    kit: Optional[str] = "first"  # first, second, third
    kit_name: Optional[str] = None  # "Acasă", "Deplasare", etc.


class CreateOrderRequest(BaseModel):
    items: List[OrderItem]
    customer_name: str
    customer_email: str
    customer_phone: str
    customer_address: str
    customer_street: str
    customer_city: str
    customer_county: str
    customer_zip: str
    customer_country: str = "România"
    shipping_method: str
    payment_method: str
    total_ron: float
    currency: str = "RON"
    coupon_code: Optional[str] = None
    coupon_discount: Optional[float] = 0


class Order(BaseModel):
    id: Optional[str] = None
    order_number: str
    items: List[OrderItem]
    customer_name: str
    customer_email: str
    customer_phone: str
    customer_address: str
    customer_street: str
    customer_city: str
    customer_county: str
    customer_zip: str
    customer_country: str
    shipping_method: str
    payment_method: str
    total_ron: float
    currency: str
    status: str = "pending"
    payment_status: str = "pending"
    awb: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_encoders = {ObjectId: str, datetime: lambda v: v.isoformat()}


class UpdateOrderStatusRequest(BaseModel):
    status: str
    awb: Optional[str] = None


class PaymentTransaction(BaseModel):
    session_id: str
    order_id: str
    amount: float
    currency: str
    payment_status: str = "pending"
    metadata: Dict = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}


class ContactMessageRequest(BaseModel):
    name: str
    email: str
    subject: str
    message: str


# Ticket System Models
class TicketMessage(BaseModel):
    id: Optional[str] = None
    sender: str  # "customer" or "admin"
    message: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class CreateTicketRequest(BaseModel):
    name: str
    email: str
    subject: str
    message: str
    images: List[str] = []  # Base64 encoded images


class TicketReplyRequest(BaseModel):
    message: str


class Ticket(BaseModel):
    id: Optional[str] = None
    ticket_number: str
    name: str
    email: str
    subject: str
    status: str = "open"  # open, in_progress, resolved, closed
    priority: str = "normal"  # low, normal, high, urgent
    messages: List[Dict] = []
    images: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    seen_by_admin: bool = False
    
    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}


# Helper function
def serialize_doc(doc):
    if doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    return doc


# Seed Limited Edition products on startup
@app.on_event("startup")
async def seed_limited_edition():
    """Create Limited Edition products - always ensure exactly 18 exist"""
    existing = await db.products.count_documents({"category": "limited-edition"})
    
    # Always recreate to ensure correct products
    if existing != 18:
        print(f"Limited Edition: found {existing}, need 18. Recreating...")
        # Delete all existing
        await db.products.delete_many({"category": "limited-edition"})
        
        limited_products = [
            {"name": "Tricou Barcelona Limited Edition 1", "team": "Barcelona", "images": "/images/products/special-barcelona-1.jpg"},
            {"name": "Tricou Barcelona Limited Edition 2", "team": "Barcelona", "images": "/images/products/special-barcelona-2.jpg"},
            {"name": "Tricou Barcelona Limited Edition 3", "team": "Barcelona", "images": "/images/products/special-barcelona-3.jpg"},
            {"name": "Tricou Real Madrid Limited Edition 1", "team": "Real Madrid", "images": "/images/products/special-real-madrid-1.jpg"},
            {"name": "Tricou Real Madrid Limited Edition 2", "team": "Real Madrid", "images": "/images/products/special-real-madrid-2.jpg"},
            {"name": "Tricou Brazilia Limited Edition", "team": "Brazilia", "images": "/images/products/special-brazilia.jpg"},
            {"name": "Tricou Bayern Munchen Limited Edition", "team": "Bayern Munchen", "images": "/images/products/special-bayern.jpg"},
            {"name": "Tricou AC Milan Limited Edition", "team": "AC Milan", "images": "/images/products/special-ac-milan.jpg"},
            {"name": "Tricou Japonia Limited Edition", "team": "Japonia", "images": "/images/products/special-japonia.jpg"},
            {"name": "Tricou PSG Limited Edition", "team": "PSG", "images": "/images/products/special-psg.jpg"},
            {"name": "Tricou Italia Limited Edition", "team": "Italia", "images": "/images/products/special-italia.jpg"},
            {"name": "Tricou Manchester City Limited Edition", "team": "Manchester City", "images": "/images/products/special-man-city.jpg"},
            {"name": "Tricou Limited Edition 13", "team": "Limited", "images": "/images/products/special-13.jpg"},
            {"name": "Tricou Limited Edition 14", "team": "Limited", "images": "/images/products/special-14.jpg"},
            {"name": "Tricou Limited Edition 15", "team": "Limited", "images": "/images/products/special-15.jpg"},
            {"name": "Tricou Limited Edition 16", "team": "Limited", "images": "/images/products/special-16.jpg"},
            {"name": "Tricou Limited Edition 17", "team": "Limited", "images": "/images/products/special-17.jpg"},
            {"name": "Tricou Limited Edition 18", "team": "Limited", "images": "/images/products/special-18.jpg"},
        ]
        
        for p in limited_products:
            product = {
                "name": p["name"],
                "category": "limited-edition",
                "team": p["team"],
                "year": 2024,
                "price_ron": 170,
                "price_eur": 35,
                "variants": [{"kit": "first", "name": "Limited Edition", "images": [p["images"]]}],
                "description": f"Ediție limitată {p['team']}",
                "sizes": ["S", "M", "L", "XL", "XXL"],
                "in_stock": True
            }
            await db.products.insert_one(product)
        
        print(f"✓ Created 18 Limited Edition products")
    else:
        print(f"✓ Limited Edition products OK: {existing}")


# Routes - Products
@app.get("/api/products")
async def get_products(
    category: Optional[str] = None,
    team: Optional[str] = None,
    year: Optional[int] = None,
    search: Optional[str] = None
):
    query = {}
    if category:
        query["category"] = category
    if team:
        query["team"] = {"$regex": team, "$options": "i"}
    if year:
        query["year"] = year
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"team": {"$regex": search, "$options": "i"}}
        ]
    
    cursor = db.products.find(query)
    products = await cursor.to_list(length=200)
    
    # Custom sort order
    category_order = {"echipe-club": 0, "nationale": 1, "retro": 2, "limited-edition": 3}
    
    # Teams by league/country priority
    team_order = {
        # Spain first
        "Real Madrid": 1, "Barcelona": 2, "Atletico Madrid": 3,
        # England
        "Manchester United": 10, "Manchester City": 11, "Liverpool": 12, "Chelsea": 13, "Arsenal": 14, "Tottenham": 15,
        # Italy
        "Juventus": 20, "AC Milan": 21, "Inter Milan": 22, "AS Roma": 23, "Napoli": 24,
        # Germany
        "Bayern Munich": 30, "Bayern Munchen": 30, "Borussia Dortmund": 31,
        # France
        "PSG": 40, "Paris Saint-Germain": 40, "Olympique Lyon": 41, "Marseille": 42,
        # Portugal
        "Benfica": 50, "Porto": 51, "Sporting": 52,
        # Netherlands
        "Ajax": 60,
        # National teams
        "România": 100, "Romania": 100, "Spania": 101, "Germania": 102, "Franța": 103, "Franta": 103,
        "Anglia": 104, "Italia": 105, "Portugalia": 106, "Olanda": 107,
        "Brazilia": 110, "Argentina": 111, "Japonia": 112,
    }
    
    def sort_key(p):
        cat_priority = category_order.get(p.get("category", ""), 99)
        team_priority = team_order.get(p.get("team", ""), 999)
        year = p.get("year", 2024)
        return (cat_priority, team_priority, year)
    
    products = [serialize_doc(p) for p in products]
    products.sort(key=sort_key)
    return products


@app.get("/api/products/{product_id}")
async def get_product(product_id: str):
    # Try to find by string ID first (UUID format)
    product = await db.products.find_one({"_id": product_id})
    if not product:
        # Try with ObjectId if string search fails
        try:
            product = await db.products.find_one({"_id": ObjectId(product_id)})
        except:
            pass
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return serialize_doc(product)


@app.post("/api/products")
async def create_product(product: Product):
    product_dict = product.model_dump(exclude={"id"})
    result = await db.products.insert_one(product_dict)
    return {"status": "success", "product_id": str(result.inserted_id)}


@app.delete("/api/products/{product_id}")
async def delete_product(product_id: str):
    try:
        # Try string ID first
        result = await db.products.delete_one({"_id": product_id})
        if result.deleted_count == 0:
            # Try ObjectId
            result = await db.products.delete_one({"_id": ObjectId(product_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Product not found")
        return {"message": "Product deleted successfully", "product_id": product_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting product: {str(e)}")


@app.patch("/api/products/{product_id}")
async def update_product(product_id: str, request: Request):
    try:
        body = await request.json()
        result = await db.products.update_one(
            {"_id": ObjectId(product_id)},
            {"$set": body}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Product not found")
        product = await db.products.find_one({"_id": ObjectId(product_id)})
        return serialize_doc(product)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating product: {str(e)}")


# Routes - Categories
@app.get("/api/categories")
async def get_categories():
    categories = [
        {
            "id": "echipe-club",
            "name": "Echipe de Club",
            "slug": "echipe-club",
            "image_url": "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800"
        },
        {
            "id": "nationale",
            "name": "Naționale",
            "slug": "nationale",
            "image_url": "https://images.unsplash.com/photo-1624880357913-a8539238245b?w=800"
        },
        {
            "id": "retro",
            "name": "Retro",
            "slug": "retro",
            "image_url": "https://images.unsplash.com/photo-1770155590942-49d858bc5401?w=800"
        }
    ]
    return categories


# Routes - Orders
@app.post("/api/orders")
async def create_order(order_req: CreateOrderRequest):
    # Generate order number
    order_count = await db.orders.count_documents({})
    order_number = f"AVO{(order_count + 1):05d}"
    
    order_dict = order_req.model_dump()
    order_dict["order_number"] = order_number
    order_dict["status"] = "pending"
    
    # Set payment status based on payment method
    if order_req.payment_method == "ramburs":
        order_dict["payment_status"] = "cod"  # Cash on delivery
        order_dict["status"] = "processing"
    elif order_req.payment_method == "transfer":
        order_dict["payment_status"] = "awaiting_transfer"
    else:
        order_dict["payment_status"] = "pending"
    
    order_dict["awb"] = ""
    order_dict["created_at"] = datetime.now(timezone(timedelta(hours=3))).isoformat()
    order_dict["updated_at"] = datetime.now(timezone(timedelta(hours=3))).isoformat()
    
    result = await db.orders.insert_one(order_dict)
    order_dict["id"] = str(result.inserted_id)
    del order_dict["_id"]
    
    return order_dict


@app.get("/api/orders")
async def get_orders(status: Optional[str] = None):
    query = {}
    if status:
        query["status"] = status
    
    cursor = db.orders.find(query).sort("created_at", -1)
    orders = await cursor.to_list(length=1000)
    return [serialize_doc(o) for o in orders]


@app.get("/api/orders/{order_id}")
async def get_order(order_id: str):
    try:
        order = await db.orders.find_one({"_id": ObjectId(order_id)})
    except:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return serialize_doc(order)


@app.get("/api/orders/number/{order_number}")
async def get_order_by_number(order_number: str):
    order = await db.orders.find_one({"order_number": order_number})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return serialize_doc(order)


@app.patch("/api/orders/{order_id}")
async def update_order_status(order_id: str, update_req: UpdateOrderStatusRequest):
    update_data = {"status": update_req.status, "updated_at": datetime.now(timezone(timedelta(hours=3)))}
    if update_req.awb:
        update_data["awb"] = update_req.awb
    
    result = await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order = await db.orders.find_one({"_id": ObjectId(order_id)})
    return serialize_doc(order)


@app.delete("/api/orders/{order_id}")
async def delete_order(order_id: str):
    try:
        result = await db.orders.delete_one({"_id": ObjectId(order_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Order not found")
        
        return {"message": "Order deleted successfully", "order_id": order_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting order: {str(e)}")


# Route - Save Invoice to Order
@app.post("/api/orders/{order_id}/invoice")
async def save_invoice(order_id: str, request: Request):
    try:
        body = await request.json()
        invoice_image = body.get("invoice_image")
        
        if not invoice_image:
            raise HTTPException(status_code=400, detail="Invoice image is required")
        
        result = await db.orders.update_one(
            {"_id": ObjectId(order_id)},
            {"$set": {"invoice_image": invoice_image, "updated_at": datetime.now(timezone(timedelta(hours=3)))}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Order not found")
        
        return {"message": "Invoice saved successfully", "order_id": order_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving invoice: {str(e)}")


# Routes - Payments (Stripe)
@app.post("/api/payments/stripe/create-session")
async def create_stripe_session(request: Request):
    body = await request.json()
    order_id = body.get("order_id")
    amount_ron = body.get("amount_ron")
    currency = body.get("currency", "RON")
    origin_url = body.get("origin_url")
    
    if not order_id or not amount_ron or not origin_url:
        raise HTTPException(status_code=400, detail="Missing required fields")
    
    # Convert RON to EUR for Stripe (1 EUR = 5 RON)
    if currency == "RON":
        amount_eur = amount_ron / 5.0
        stripe_currency = "eur"
    else:
        amount_eur = amount_ron
        stripe_currency = "eur"
    
    # Initialize Stripe
    host_url = origin_url
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
    
    # Create checkout session
    success_url = f"{origin_url}/order-success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin_url}/checkout"
    
    checkout_request = CheckoutSessionRequest(
        amount=float(amount_eur),
        currency=stripe_currency,
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={"order_id": order_id}
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Save transaction
    transaction = {
        "session_id": session.session_id,
        "order_id": order_id,
        "amount": amount_eur,
        "currency": stripe_currency,
        "payment_status": "pending",
        "metadata": {"order_id": order_id},
        "created_at": datetime.now(timezone(timedelta(hours=3)))
    }
    await db.payment_transactions.insert_one(transaction)
    
    # Update order with payment method
    await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"payment_method": "stripe", "updated_at": datetime.now(timezone(timedelta(hours=3)))}}
    )
    
    return {"url": session.url, "session_id": session.session_id}


@app.get("/api/payments/stripe/status/{session_id}")
async def get_stripe_status(session_id: str):
    # Get transaction
    transaction = await db.payment_transactions.find_one({"session_id": session_id})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # If already processed, return status
    if transaction["payment_status"] == "paid":
        return serialize_doc(transaction)
    
    # Check with Stripe
    host_url = os.getenv("REACT_APP_BACKEND_URL", "http://localhost:8001")
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
    
    try:
        checkout_status = await stripe_checkout.get_checkout_status(session_id)
        
        # Update transaction
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": checkout_status.payment_status}}
        )
        
        # Update order if paid
        if checkout_status.payment_status == "paid":
            order_id = transaction["metadata"]["order_id"]
            await db.orders.update_one(
                {"_id": ObjectId(order_id)},
                {"$set": {
                    "payment_status": "paid",
                    "status": "processing",
                    "updated_at": datetime.now(timezone(timedelta(hours=3)))
                }}
            )
        
        return {
            "session_id": session_id,
            "payment_status": checkout_status.payment_status,
            "status": checkout_status.status,
            "order_id": transaction["metadata"]["order_id"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking payment status: {str(e)}")


@app.post("/api/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        # Update transaction and order
        if webhook_response.payment_status == "paid":
            session_id = webhook_response.session_id
            transaction = await db.payment_transactions.find_one({"session_id": session_id})
            
            if transaction and transaction["payment_status"] != "paid":
                # Update transaction
                await db.payment_transactions.update_one(
                    {"session_id": session_id},
                    {"$set": {"payment_status": "paid"}}
                )
                
                # Update order
                order_id = transaction["metadata"]["order_id"]
                await db.orders.update_one(
                    {"_id": ObjectId(order_id)},
                    {"$set": {
                        "payment_status": "paid",
                        "status": "processing",
                        "updated_at": datetime.now(timezone(timedelta(hours=3)))
                    }}
                )
        
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Health check
@app.get("/api/health")
async def health():
    return {"status": "ok"}


# ===== REVIEWS SYSTEM =====

@app.post("/api/reviews")
async def create_review(request: Request):
    """Create a new review"""
    try:
        body = await request.json()
        review = {
            "name": body.get("name", "Anonim"),
            "text": body.get("text", ""),
            "stars": min(max(int(body.get("stars", 5)), 1), 5),
            "image": body.get("image"),  # Base64 image or null
            "created_at": datetime.now(timezone(timedelta(hours=3)))
        }
        result = await db.reviews.insert_one(review)
        return {"status": "success", "review_id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating review: {str(e)}")


@app.get("/api/reviews")
async def get_reviews(limit: int = 10):
    """Get all reviews"""
    try:
        cursor = db.reviews.find().sort("created_at", -1).limit(limit)
        reviews = await cursor.to_list(length=limit)
        return [serialize_doc(r) for r in reviews]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting reviews: {str(e)}")


@app.delete("/api/reviews/{review_id}")
async def delete_review(review_id: str):
    """Delete a review"""
    try:
        result = await db.reviews.delete_one({"_id": ObjectId(review_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Review not found")
        return {"status": "success", "message": "Review deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting review: {str(e)}")


# ===== ANALYTICS SYSTEM =====

@app.post("/api/analytics/visit")
async def track_visit(request: Request):
    """Track a page visit"""
    try:
        body = await request.json()
        visit = {
            "page": body.get("page", "/"),
            "referrer": body.get("referrer", ""),
            "user_agent": request.headers.get("user-agent", ""),
            "ip": request.client.host if request.client else "unknown",
            "timestamp": datetime.now(timezone(timedelta(hours=3))),
            "session_id": body.get("session_id", "")
        }
        await db.analytics_visits.insert_one(visit)
        return {"status": "tracked"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.get("/api/analytics/stats")
async def get_analytics_stats():
    """Get analytics statistics for admin dashboard"""
    try:
        now = datetime.now(timezone(timedelta(hours=3)))
        
        # Today's visits
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        today_visits = await db.analytics_visits.count_documents({
            "timestamp": {"$gte": today_start}
        })
        
        # Last 7 days visits by day
        daily_stats = []
        for i in range(7):
            day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)
            count = await db.analytics_visits.count_documents({
                "timestamp": {"$gte": day_start, "$lt": day_end}
            })
            daily_stats.append({
                "date": day_start.strftime("%Y-%m-%d"),
                "day_name": day_start.strftime("%A"),
                "visits": count
            })
        
        # Last 30 minutes (active users approximation)
        thirty_mins_ago = now - timedelta(minutes=30)
        recent_sessions = await db.analytics_visits.distinct("session_id", {
            "timestamp": {"$gte": thirty_mins_ago}
        })
        active_now = len([s for s in recent_sessions if s])  # Filter empty sessions
        
        # Total visits all time
        total_visits = await db.analytics_visits.count_documents({})
        
        # Top pages
        pipeline = [
            {"$group": {"_id": "$page", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 10}
        ]
        top_pages_cursor = db.analytics_visits.aggregate(pipeline)
        top_pages = await top_pages_cursor.to_list(length=10)
        
        return {
            "today_visits": today_visits,
            "active_now": active_now,
            "total_visits": total_visits,
            "daily_stats": list(reversed(daily_stats)),  # Oldest first for chart
            "top_pages": [{"page": p["_id"], "visits": p["count"]} for p in top_pages]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting analytics: {str(e)}")


@app.delete("/api/analytics/reset")
async def reset_analytics():
    """Reset all analytics data"""
    try:
        result = await db.analytics_visits.delete_many({})
        return {"status": "success", "deleted_count": result.deleted_count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error resetting analytics: {str(e)}")


# ===== EMAIL SYSTEM =====

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def get_email_template(order, status):
    """Generate email content based on order status"""
    templates = {
        "pending": {
            "subject": f"Comandă #{order['order_number']} - Primită",
            "body": f"""
Dragă {order['customer_name']},

Îți mulțumim pentru comanda ta la AVO JERSEYS!

📦 DETALII COMANDĂ:
━━━━━━━━━━━━━━━━━━━━
Număr comandă: #{order['order_number']}
Total: {order['total_ron']} {order.get('currency', 'RON')}
Metodă plată: {order.get('payment_method', 'N/A')}

Comanda ta a fost primită și este în curs de verificare.
Te vom notifica când va fi procesată.

Cu stimă,
Echipa AVO JERSEYS
📧 avojerseys@gmail.com
"""
        },
        "processing": {
            "subject": f"Comandă #{order['order_number']} - În Procesare",
            "body": f"""
Dragă {order['customer_name']},

Vești bune! Comanda ta #{order['order_number']} este acum în procesare.

📦 DETALII COMANDĂ:
━━━━━━━━━━━━━━━━━━━━
Număr comandă: #{order['order_number']}
Total: {order['total_ron']} {order.get('currency', 'RON')}

Pregătim produsele pentru expediere și te vom notifica 
când coletul tău va fi trimis.

Cu stimă,
Echipa AVO JERSEYS
📧 avojerseys@gmail.com
"""
        },
        "shipped": {
            "subject": f"Comandă #{order['order_number']} - Expediată! 🚚",
            "body": f"""
Dragă {order['customer_name']},

Coletul tău a fost EXPEDIAT! 🎉

📦 DETALII LIVRARE:
━━━━━━━━━━━━━━━━━━━━
Număr comandă: #{order['order_number']}
AWB: {order.get('awb', 'Va fi adăugat în curând')}

Adresa de livrare:
{order.get('customer_address', 'N/A')}

Poți urmări coletul folosind numărul AWB de mai sus.
Livrarea durează de obicei 1-3 saptamani lucrătoare.

Cu stimă,
Echipa AVO JERSEYS
📧 avojerseys@gmail.com
"""
        },
        "delivered": {
            "subject": f"Comandă #{order['order_number']} - Livrată! ✅",
            "body": f"""
Dragă {order['customer_name']},

Comanda ta #{order['order_number']} a fost LIVRATĂ cu succes! ✅

Sperăm că ești mulțumit(ă) de achiziția ta!

💬 Dacă ai orice întrebări sau feedback, nu ezita să ne contactezi.

Mulțumim că ai ales AVO JERSEYS! 
Așteptăm să te revedem curând! ⚽

Cu stimă,
Echipa AVO JERSEYS
📧 avojerseys@gmail.com
"""
        },
        "cancelled": {
            "subject": f"Comandă #{order['order_number']} - Anulată",
            "body": f"""
Dragă {order['customer_name']},

Ne pare rău să te informăm că comanda #{order['order_number']} a fost anulată.

Dacă ai plătit deja, suma va fi returnată în 3-5 zile lucrătoare.

Dacă ai întrebări sau dorești să plasezi o nouă comandă, 
te rugăm să ne contactezi.

Cu stimă,
Echipa AVO JERSEYS
📧 avojerseys@gmail.com
"""
        }
    }
    
    return templates.get(status, templates["pending"])


@app.post("/api/orders/{order_id}/send-email")
async def send_order_email(order_id: str, request: Request):
    """Send email notification to customer based on order status"""
    try:
        body = await request.json()
        status_override = body.get("status")  # Optional: override order status for email
        
        # Get order
        order = await db.orders.find_one({"_id": ObjectId(order_id)})
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        order = serialize_doc(order)
        status = status_override or order.get("status", "pending")
        
        # Get email template
        template = get_email_template(order, status)
        
        # Get email credentials from environment
        smtp_email = os.getenv("SMTP_EMAIL", "avojerseys@gmail.com")
        smtp_password = os.getenv("SMTP_PASSWORD", "")
        
        if not smtp_password:
            # Return template info if no password configured (for preview)
            return {
                "status": "preview",
                "message": "Email nu poate fi trimis - lipsește parola SMTP. Configurați SMTP_PASSWORD în .env",
                "to": order.get("customer_email"),
                "subject": template["subject"],
                "body": template["body"]
            }
        
        # Create email message
        msg = MIMEMultipart()
        msg['From'] = f"AVO JERSEYS <{smtp_email}>"
        msg['To'] = order.get("customer_email")
        msg['Subject'] = template["subject"]
        
        msg.attach(MIMEText(template["body"], 'plain', 'utf-8'))
        
        # Send email via Gmail SMTP
        try:
            server = smtplib.SMTP('smtp.gmail.com', 587)
            server.starttls()
            server.login(smtp_email, smtp_password)
            server.send_message(msg)
            server.quit()
            
            # Log email sent
            await db.email_logs.insert_one({
                "order_id": order_id,
                "order_number": order.get("order_number"),
                "to": order.get("customer_email"),
                "subject": template["subject"],
                "status": status,
                "sent_at": datetime.now(timezone(timedelta(hours=3)))
            })
            
            return {
                "status": "sent",
                "message": f"Email trimis cu succes la {order.get('customer_email')}",
                "subject": template["subject"]
            }
        except smtplib.SMTPAuthenticationError:
            return {
                "status": "error",
                "message": "Eroare autentificare SMTP. Verificați parola sau activați 'App Passwords' în Gmail."
            }
        except Exception as smtp_error:
            return {
                "status": "error", 
                "message": f"Eroare SMTP: {str(smtp_error)}"
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending email: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)


# Contact form endpoint - send email to avojerseys@gmail.com
@app.post("/api/contact")
async def send_contact_message(data: ContactMessageRequest):
    """Send contact message via email to avojerseys@gmail.com"""
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    
    # Store message in database
    contact_doc = {
        "name": data.name,
        "email": data.email,
        "subject": data.subject,
        "message": data.message,
        "created_at": datetime.utcnow(),
        "status": "new"
    }
    await db.contact_messages.insert_one(contact_doc)
    
    # Try to send email notification
    try:
        # Create email content
        email_body = f"""
Mesaj nou de pe site-ul AVO JERSEYS!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DE LA: {data.name}
EMAIL: {data.email}
SUBIECT: {data.subject}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MESAJ:
{data.message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Trimis automat de pe avojerseys.com
        """
        
        # Try using Gmail SMTP if credentials are available
        smtp_user = os.getenv("SMTP_USER")
        smtp_pass = os.getenv("SMTP_PASS")
        
        if smtp_user and smtp_pass:
            msg = MIMEMultipart()
            msg['From'] = smtp_user
            msg['To'] = "avojerseys@gmail.com"
            msg['Subject'] = f"[AVO JERSEYS] {data.subject} - de la {data.name}"
            msg['Reply-To'] = data.email
            msg.attach(MIMEText(email_body, 'plain', 'utf-8'))
            
            with smtplib.SMTP('smtp.gmail.com', 587) as server:
                server.starttls()
                server.login(smtp_user, smtp_pass)
                server.send_message(msg)
            
            return {"status": "success", "message": "Mesajul a fost trimis cu succes!"}
        else:
            # No SMTP credentials - just store in database
            return {"status": "success", "message": "Mesajul a fost înregistrat! Te vom contacta în curând."}
            
    except Exception as e:
        print(f"Email send error: {e}")
        # Even if email fails, message is stored in DB
        return {"status": "success", "message": "Mesajul a fost înregistrat! Te vom contacta în curând."}


# ==================== TICKET SYSTEM ====================

def generate_ticket_number():
    """Generate unique ticket number like TKT-20250309-XXXX"""
    import random
    import string
    date_part = datetime.utcnow().strftime("%Y%m%d")
    random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"TKT-{date_part}-{random_part}"


@app.post("/api/tickets")
async def create_ticket(data: CreateTicketRequest):
    """Create a new support ticket"""
    ticket_number = generate_ticket_number()
    
    ticket_doc = {
        "ticket_number": ticket_number,
        "name": data.name,
        "email": data.email,
        "subject": data.subject,
        "status": "open",
        "priority": "normal",
        "messages": [
            {
                "id": str(ObjectId()),
                "sender": "customer",
                "message": data.message,
                "created_at": datetime.utcnow()
            }
        ],
        "images": data.images,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "seen_by_admin": False
    }
    
    result = await db.tickets.insert_one(ticket_doc)
    
    return {
        "status": "success",
        "ticket_number": ticket_number,
        "ticket_id": str(result.inserted_id),
        "message": f"Ticketul #{ticket_number} a fost creat cu succes!"
    }


@app.get("/api/tickets")
async def get_all_tickets(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None
):
    """Get all tickets with optional filters"""
    query = {}
    
    if status:
        query["status"] = status
    if priority:
        query["priority"] = priority
    if search:
        query["$or"] = [
            {"ticket_number": {"$regex": search, "$options": "i"}},
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"subject": {"$regex": search, "$options": "i"}}
        ]
    
    tickets = await db.tickets.find(query).sort("created_at", -1).to_list(length=500)
    return [serialize_doc(t) for t in tickets]


@app.get("/api/tickets/{ticket_id}")
async def get_ticket(ticket_id: str):
    """Get a single ticket by ID"""
    ticket = await db.tickets.find_one({"_id": ObjectId(ticket_id)})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return serialize_doc(ticket)


@app.get("/api/tickets/by-number/{ticket_number}")
async def get_ticket_by_number(ticket_number: str):
    """Get a ticket by ticket number (for customers)"""
    ticket = await db.tickets.find_one({"ticket_number": ticket_number})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return serialize_doc(ticket)


@app.patch("/api/tickets/{ticket_id}")
async def update_ticket(ticket_id: str, request: Request):
    """Update ticket status, priority, or other fields"""
    data = await request.json()
    
    update_data = {"updated_at": datetime.utcnow()}
    
    if "status" in data:
        update_data["status"] = data["status"]
    if "priority" in data:
        update_data["priority"] = data["priority"]
    if "seen_by_admin" in data:
        update_data["seen_by_admin"] = data["seen_by_admin"]
    
    result = await db.tickets.update_one(
        {"_id": ObjectId(ticket_id)},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    ticket = await db.tickets.find_one({"_id": ObjectId(ticket_id)})
    return serialize_doc(ticket)


@app.post("/api/tickets/{ticket_id}/reply")
async def reply_to_ticket(ticket_id: str, data: TicketReplyRequest):
    """Add admin reply to ticket"""
    new_message = {
        "id": str(ObjectId()),
        "sender": "admin",
        "message": data.message,
        "created_at": datetime.utcnow()
    }
    
    result = await db.tickets.update_one(
        {"_id": ObjectId(ticket_id)},
        {
            "$push": {"messages": new_message},
            "$set": {
                "updated_at": datetime.utcnow(),
                "status": "in_progress"
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    ticket = await db.tickets.find_one({"_id": ObjectId(ticket_id)})
    return serialize_doc(ticket)


@app.post("/api/tickets/{ticket_id}/customer-reply")
async def customer_reply_to_ticket(ticket_id: str, data: TicketReplyRequest):
    """Add customer reply to ticket"""
    new_message = {
        "id": str(ObjectId()),
        "sender": "customer",
        "message": data.message,
        "created_at": datetime.utcnow()
    }
    
    result = await db.tickets.update_one(
        {"_id": ObjectId(ticket_id)},
        {
            "$push": {"messages": new_message},
            "$set": {
                "updated_at": datetime.utcnow(),
                "seen_by_admin": False
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    ticket = await db.tickets.find_one({"_id": ObjectId(ticket_id)})
    return serialize_doc(ticket)


@app.delete("/api/tickets/{ticket_id}")
async def delete_ticket(ticket_id: str):
    """Delete a ticket"""
    result = await db.tickets.delete_one({"_id": ObjectId(ticket_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    return {"status": "success", "message": "Ticket deleted successfully"}


@app.get("/api/tickets/stats/summary")
async def get_tickets_stats():
    """Get ticket statistics"""
    total = await db.tickets.count_documents({})
    open_count = await db.tickets.count_documents({"status": "open"})
    in_progress = await db.tickets.count_documents({"status": "in_progress"})
    resolved = await db.tickets.count_documents({"status": "resolved"})
    closed = await db.tickets.count_documents({"status": "closed"})
    unseen = await db.tickets.count_documents({"seen_by_admin": False})
    
    # Priority counts
    urgent = await db.tickets.count_documents({"priority": "urgent"})
    high = await db.tickets.count_documents({"priority": "high"})
    
    return {
        "total": total,
        "open": open_count,
        "in_progress": in_progress,
        "resolved": resolved,
        "closed": closed,
        "unseen": unseen,
        "urgent": urgent,
        "high_priority": high
    }



# ═══════════════════════════════════════════════
# CASUAL PRODUCTS & SETTINGS
# ═══════════════════════════════════════════════

CASUAL_PRODUCTS_DATA = [
    {
        "name": "Nike Running Division Shorts",
        "slug": "nike-running-division-shorts",
        "category": "pantaloni-scurti",
        "garment_type": "pantaloni-scurti",
        "price_ron": 150,
        "description": "Pantaloni scurți Nike Running Division, confecționați din material ușor și respirabil. Design sport modern, ideali pentru alergare și activități casual.",
        "colors": [
            {"name": "Bej", "slug": "bej", "image": "/images/casual/nike-running-division-shorts/bej"},
            {"name": "Negru", "slug": "negru", "image": "/images/casual/nike-running-division-shorts/negru"}
        ],
        "sizes": ["M", "L", "XL", "2XL", "3XL"]
    },
    {
        "name": "Adidas Shorts",
        "slug": "adidas-shorts",
        "category": "pantaloni-scurti",
        "garment_type": "pantaloni-scurti",
        "price_ron": 150,
        "description": "Pantaloni scurți Adidas cu design clasic sport. Material confortabil, potriviți pentru antrenament și purtare zilnică.",
        "colors": [
            {"name": "Alb / Negru", "slug": "alb-negru", "image": "/images/casual/adidas-shorts/alb-negru"},
            {"name": "Gri / Alb", "slug": "gri-alb", "image": "/images/casual/adidas-shorts/gri-alb"},
            {"name": "Negru / Alb", "slug": "negru-alb", "image": "/images/casual/adidas-shorts/negru-alb"}
        ],
        "sizes": ["M", "L", "XL", "2XL", "3XL"]
    },
    {
        "name": "Nike Shorts",
        "slug": "nike-shorts",
        "category": "pantaloni-scurti",
        "garment_type": "pantaloni-scurti",
        "price_ron": 150,
        "description": "Pantaloni scurți Nike cu tehnologie Dri-FIT. Ușori, respirabili și confortabili, perfecți pentru sport și casual.",
        "colors": [
            {"name": "Bej", "slug": "bej", "image": "/images/casual/nike-shorts/bej"},
            {"name": "Gri", "slug": "gri", "image": "/images/casual/nike-shorts/gri"},
            {"name": "Negru", "slug": "negru", "image": "/images/casual/nike-shorts/negru"}
        ],
        "sizes": ["M", "L", "XL", "2XL", "3XL"]
    },
    {
        "name": "Nike Training Pants",
        "slug": "nike-training-pants",
        "category": "pantaloni-lungi",
        "garment_type": "pantaloni-lungi",
        "price_ron": 150,
        "description": "Pantaloni lungi Nike Training din material elastic și respirabil. Croială modernă, ideali pentru antrenament și outfit casual.",
        "colors": [
            {"name": "Negru", "slug": "negru", "image": "/images/casual/nike-training-pants/negru"}
        ],
        "sizes": ["S", "M", "L", "XL", "2XL"]
    },
    {
        "name": "Nike Sport Pants",
        "slug": "nike-sport-pants",
        "category": "pantaloni-scurti",
        "garment_type": "pantaloni-scurti",
        "price_ron": 150,
        "description": "Pantaloni scurți sport Nike cu design athletic. Material ușor și confortabil, potriviți atât pentru sală cât și pentru outfit-uri streetwear.",
        "colors": [
            {"name": "Negru", "slug": "negru", "image": "/images/casual/nike-sport-pants/negru"},
            {"name": "Verde", "slug": "verde", "image": "/images/casual/nike-sport-pants/verde"},
            {"name": "Gri", "slug": "gri", "image": "/images/casual/nike-sport-pants/gri"},
            {"name": "Light Blue", "slug": "light-blue", "image": "/images/casual/nike-sport-pants/light-blue"},
            {"name": "Dark Blue", "slug": "dark-blue", "image": "/images/casual/nike-sport-pants/dark-blue"}
        ],
        "sizes": ["M", "L", "XL", "2XL", "3XL"]
    },
    {
        "name": "Nike Sport Vest",
        "slug": "nike-sport-vest",
        "category": "vesta",
        "garment_type": "vesta",
        "price_ron": 180,
        "description": "Vestă Nike Sport cu izolație termică. Design modern și minimalist, perfectă pentru layering în sezonul rece.",
        "colors": [
            {"name": "Negru", "slug": "negru", "image": "/images/casual/nike-sport-vest/negru"},
            {"name": "Gri", "slug": "gri", "image": "/images/casual/nike-sport-vest/gri"}
        ],
        "sizes": ["S", "M", "L", "XL", "2XL"]
    },
    {
        "name": "Jordan T-Shirt Kit",
        "slug": "jordan-tshirt-kit",
        "category": "tricouri",
        "garment_type": "tricou",
        "price_ron": 160,
        "description": "Tricou Jordan din bumbac premium, cu logo iconic Jumpman. Design sport-casual, confortabil și ușor de asortat.",
        "colors": [
            {"name": "Alb", "slug": "alb", "image": "/images/casual/jordan-tshirt-kit/alb"},
            {"name": "Negru", "slug": "negru", "image": "/images/casual/jordan-tshirt-kit/negru"}
        ],
        "sizes": ["S", "M", "L", "XL", "2XL"]
    },
    {
        "name": "Adidas T-Shirt",
        "slug": "adidas-tshirt",
        "category": "tricouri",
        "garment_type": "tricou",
        "price_ron": 160,
        "description": "Tricou Adidas clasic cu cele 3 dungi iconice. Material respirabil și confortabil, perfect pentru sport și casual.",
        "colors": [
            {"name": "Alb", "slug": "alb", "image": "/images/casual/adidas-tshirt/alb"},
            {"name": "Negru", "slug": "negru", "image": "/images/casual/adidas-tshirt/negru"}
        ],
        "sizes": ["S", "M", "L", "XL", "2XL"]
    },
    {
        "name": "Jordan T-Shirt Kit 2",
        "slug": "jordan-tshirt-kit-2",
        "category": "tricouri",
        "garment_type": "tricou",
        "price_ron": 160,
        "description": "A doua variantă a tricoului Jordan, cu design minimalist și materiale premium. Confort maxim pentru stil urban.",
        "colors": [
            {"name": "Alb", "slug": "alb", "image": "/images/casual/jordan-tshirt-kit-2/alb"},
            {"name": "Negru", "slug": "negru", "image": "/images/casual/jordan-tshirt-kit-2/negru"}
        ],
        "sizes": ["S", "M", "L", "XL", "2XL"]
    },
    {
        "name": "Jordan T-Shirt Kit 3",
        "slug": "jordan-tshirt-kit-3",
        "category": "tricouri",
        "garment_type": "tricou",
        "price_ron": 160,
        "description": "Tricou Jordan Kit 3 cu imprimeu grafic modern. Material moale și respirabil, perfect pentru zilele active.",
        "colors": [
            {"name": "Alb", "slug": "alb", "image": "/images/casual/jordan-tshirt-kit-3/alb"},
            {"name": "Negru", "slug": "negru", "image": "/images/casual/jordan-tshirt-kit-3/negru"}
        ],
        "sizes": ["S", "M", "L", "XL", "2XL"]
    },
    {
        "name": "Jordan Logo Tee",
        "slug": "jordan-logo-tee",
        "category": "tricouri",
        "garment_type": "tricou",
        "price_ron": 160,
        "description": "Tricou Jordan cu logo mare central. Design statement, din bumbac premium cu croială relaxată.",
        "colors": [
            {"name": "Negru cu logo alb", "slug": "negru", "image": "/images/casual/jordan-logo-tee/negru"}
        ],
        "sizes": ["S", "M", "L", "XL", "2XL"]
    },
    {
        "name": "Nike Tee",
        "slug": "nike-tee",
        "category": "tricouri",
        "garment_type": "tricou",
        "price_ron": 160,
        "description": "Tricou Nike essential cu Swoosh. Material Dri-FIT ușor, ideal atât pentru antrenament cât și pentru zi cu zi.",
        "colors": [
            {"name": "Alb cu logo negru", "slug": "alb", "image": "/images/casual/nike-tee/alb"},
            {"name": "Negru cu logo alb", "slug": "negru", "image": "/images/casual/nike-tee/negru"}
        ],
        "sizes": ["S", "M", "L", "XL", "2XL"]
    },
    {
        "name": "Nike x Stussy Tee #1",
        "slug": "nike-stussy-tee-1",
        "category": "tricouri",
        "garment_type": "tricou",
        "price_ron": 160,
        "description": "Colaborare exclusivă Nike x Stüssy. Design streetwear premium, material heavyweight cu fit oversized.",
        "colors": [
            {"name": "Alb", "slug": "alb", "image": "/images/casual/nike-stussy-tee-1/alb"},
            {"name": "Negru", "slug": "negru", "image": "/images/casual/nike-stussy-tee-1/negru"}
        ],
        "sizes": ["S", "M", "L", "XL", "2XL"]
    },
    {
        "name": "Jordan Air Tee",
        "slug": "jordan-air-tee",
        "category": "tricouri",
        "garment_type": "tricou",
        "price_ron": 160,
        "description": "Tricou Jordan Air cu design retro-modern. Bumbac moale 100%, croială confortabilă pentru un look clasic.",
        "colors": [
            {"name": "Alb", "slug": "alb", "image": "/images/casual/jordan-air-tee/alb"},
            {"name": "Negru", "slug": "negru", "image": "/images/casual/jordan-air-tee/negru"}
        ],
        "sizes": ["S", "M", "L", "XL", "2XL"]
    },
    {
        "name": "Nike x Stussy Tee #2",
        "slug": "nike-stussy-tee-2",
        "category": "tricouri",
        "garment_type": "tricou",
        "price_ron": 160,
        "description": "A doua variantă Nike x Stüssy cu grafică unică. Piesă statement pentru colecția ta streetwear.",
        "colors": [
            {"name": "Alb", "slug": "alb", "image": "/images/casual/nike-stussy-tee-2/alb"},
            {"name": "Negru", "slug": "negru", "image": "/images/casual/nike-stussy-tee-2/negru"}
        ],
        "sizes": ["S", "M", "L", "XL", "2XL"]
    },
]


@app.on_event("startup")
async def seed_casual_products():
    """Seed casual products and settings"""
    # Ensure settings document exists
    settings = await db.site_settings.find_one({"key": "casual_visible"})
    if not settings:
        await db.site_settings.insert_one({"key": "casual_visible", "value": False})
        print("Created casual_visible setting (default: False)")

    # Seed casual products
    existing = await db.casual_products.count_documents({})
    if existing != len(CASUAL_PRODUCTS_DATA):
        await db.casual_products.delete_many({})
        for p in CASUAL_PRODUCTS_DATA:
            await db.casual_products.insert_one(dict(p))
        print(f"Seeded {len(CASUAL_PRODUCTS_DATA)} casual products")
    else:
        print(f"Casual products OK: {existing}")


@app.get("/api/settings/casual")
async def get_casual_setting():
    setting = await db.site_settings.find_one({"key": "casual_visible"}, {"_id": 0})
    return {"casual_visible": setting["value"] if setting else False}


@app.patch("/api/settings/casual")
async def toggle_casual_setting():
    setting = await db.site_settings.find_one({"key": "casual_visible"})
    new_value = not (setting["value"] if setting else False)
    await db.site_settings.update_one(
        {"key": "casual_visible"},
        {"$set": {"value": new_value}},
        upsert=True
    )
    return {"casual_visible": new_value}


@app.get("/api/casual-products")
async def get_casual_products(category: Optional[str] = None, force: Optional[bool] = False):
    # Check visibility (unless force=True for admin)
    if not force:
        setting = await db.site_settings.find_one({"key": "casual_visible"})
        if not setting or not setting.get("value", False):
            return []

    query = {}
    if category:
        query["category"] = category

    # Sort by sort_order (ascending), then by created_at
    cursor = db.casual_products.find(query).sort([("sort_order", 1), ("created_at", -1)])
    products = await cursor.to_list(length=100)
    return [serialize_doc(p) for p in products]


@app.post("/api/admin/casual-products/reorder")
async def reorder_casual_products(request: Request):
    """Update the order of casual products"""
    data = await request.json()
    product_ids = data.get("product_ids", [])  # List of product IDs in desired order
    
    if not product_ids:
        raise HTTPException(status_code=400, detail="No product IDs provided")
    
    # Update sort_order for each product
    for index, product_id in enumerate(product_ids):
        try:
            await db.casual_products.update_one(
                {"_id": ObjectId(product_id)},
                {"$set": {"sort_order": index}}
            )
        except Exception as e:
            print(f"Error updating order for {product_id}: {e}")
    
    return {"message": "Order updated successfully", "count": len(product_ids)}


@app.get("/api/casual-products/{product_id}")
async def get_casual_product(product_id: str):
    try:
        product = await db.casual_products.find_one({"_id": ObjectId(product_id)})
    except:
        product = None
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return serialize_doc(product)



# ============== ADMIN CASUAL PRODUCTS ==============

class CasualProductColor(BaseModel):
    name: str
    slug: str
    image: str  # Base64 or URL

class CreateCasualProductRequest(BaseModel):
    name: str
    slug: Optional[str] = None
    category: str  # tricou, pantaloni-scurti, pantaloni-lungi, vesta, geaca, hanorac, papuci
    garment_type: Optional[str] = None
    price_ron: float
    sale_price_ron: Optional[float] = None  # Preț de reducere
    description: str = ""
    sizes: List[str] = ["S", "M", "L", "XL", "XXL"]
    colors: List[Dict] = []  # [{name, slug, image}]
    in_stock: bool = True

class UpdateCasualProductRequest(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    category: Optional[str] = None
    garment_type: Optional[str] = None
    price_ron: Optional[float] = None
    sale_price_ron: Optional[float] = None
    description: Optional[str] = None
    sizes: Optional[List[str]] = None
    colors: Optional[List[Dict]] = None
    in_stock: Optional[bool] = None


def generate_slug(name: str) -> str:
    """Generate URL-friendly slug from name"""
    import re
    slug = name.lower()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s_]+', '-', slug)
    slug = re.sub(r'-+', '-', slug)
    return slug.strip('-')


@app.post("/api/admin/casual-products")
async def create_casual_product(product: CreateCasualProductRequest):
    """Create a new casual product"""
    product_dict = product.model_dump()
    
    # Generate slug if not provided
    if not product_dict.get("slug"):
        product_dict["slug"] = generate_slug(product_dict["name"])
    
    # Set garment_type based on category if not provided
    if not product_dict.get("garment_type"):
        category_to_garment = {
            "tricouri": "tricou",
            "tricou": "tricou",
            "pantaloni-scurti": "pantaloni-scurti",
            "pantaloni-lungi": "pantaloni-lungi",
            "vesta": "vesta",
            "geaca": "geaca",
            "hanorac": "hanorac",
            "papuci": "papuci"
        }
        product_dict["garment_type"] = category_to_garment.get(product_dict["category"], product_dict["category"])
    
    product_dict["created_at"] = datetime.now(timezone(timedelta(hours=3))).isoformat()
    product_dict["updated_at"] = product_dict["created_at"]
    
    result = await db.casual_products.insert_one(product_dict)
    product_dict["id"] = str(result.inserted_id)
    del product_dict["_id"]
    
    return product_dict


@app.put("/api/admin/casual-products/{product_id}")
async def update_casual_product(product_id: str, update: UpdateCasualProductRequest):
    """Update an existing casual product"""
    try:
        existing = await db.casual_products.find_one({"_id": ObjectId(product_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid product ID")
    
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_dict = {k: v for k, v in update.model_dump().items() if v is not None}
    
    if update_dict:
        # Update slug if name changed and slug not provided
        if "name" in update_dict and "slug" not in update_dict:
            update_dict["slug"] = generate_slug(update_dict["name"])
        
        update_dict["updated_at"] = datetime.now(timezone(timedelta(hours=3))).isoformat()
        
        await db.casual_products.update_one(
            {"_id": ObjectId(product_id)},
            {"$set": update_dict}
        )
    
    updated = await db.casual_products.find_one({"_id": ObjectId(product_id)})
    return serialize_doc(updated)


@app.delete("/api/admin/casual-products/{product_id}")
async def delete_casual_product(product_id: str):
    """Delete a casual product"""
    try:
        result = await db.casual_products.delete_one({"_id": ObjectId(product_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid product ID")
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product deleted successfully", "id": product_id}


# Image upload for casual products
import base64
import uuid

UPLOAD_DIR = "/app/frontend/public/images/casual"

@app.post("/api/upload/casual-image")
async def upload_casual_image(request: Request):
    """Upload an image for casual products"""
    try:
        data = await request.json()
        image_data = data.get("image")  # Base64 encoded image
        product_slug = data.get("product_slug", "temp")
        color_slug = data.get("color_slug", "default")
        
        if not image_data:
            raise HTTPException(status_code=400, detail="No image data provided")
        
        # Remove data URL prefix if present
        if "base64," in image_data:
            image_data = image_data.split("base64,")[1]
        
        # Decode base64
        try:
            image_bytes = base64.b64decode(image_data)
        except:
            raise HTTPException(status_code=400, detail="Invalid base64 image data")
        
        # Create directory for product if not exists
        product_dir = os.path.join(UPLOAD_DIR, product_slug)
        os.makedirs(product_dir, exist_ok=True)
        
        # Save image as JPG
        filename = f"{color_slug}.jpg"
        filepath = os.path.join(product_dir, filename)
        
        with open(filepath, "wb") as f:
            f.write(image_bytes)
        
        # Return the URL path
        image_url = f"/images/casual/{product_slug}/{color_slug}"
        
        return {
            "success": True,
            "image_url": image_url,
            "full_path": f"{image_url}.jpg"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


# Get all site settings for admin
@app.get("/api/admin/settings")
async def get_all_settings():
    """Get all site settings"""
    settings = await db.site_settings.find().to_list(length=100)
    return {s["key"]: s["value"] for s in settings}


@app.patch("/api/admin/settings/{key}")
async def update_setting(key: str, request: Request):
    """Update a specific site setting"""
    data = await request.json()
    value = data.get("value")
    
    await db.site_settings.update_one(
        {"key": key},
        {"$set": {"value": value}},
        upsert=True
    )
    
    return {"key": key, "value": value}
