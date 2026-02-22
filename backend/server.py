from fastapi import FastAPI, HTTPException, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
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


# Helper function
def serialize_doc(doc):
    if doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    return doc


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
    products = await cursor.to_list(length=100)
    return [serialize_doc(p) for p in products]


@app.get("/api/products/{product_id}")
async def get_product(product_id: str):
    product = await db.products.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return serialize_doc(product)


@app.post("/api/products")
async def create_product(product: Product):
    product_dict = product.model_dump(exclude={"id"})
    result = await db.products.insert_one(product_dict)
    product_dict["id"] = str(result.inserted_id)
    return product_dict


@app.delete("/api/products/{product_id}")
async def delete_product(product_id: str):
    try:
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
    order_dict["created_at"] = datetime.utcnow()
    order_dict["updated_at"] = datetime.utcnow()
    
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
    update_data = {"status": update_req.status, "updated_at": datetime.utcnow()}
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
            {"$set": {"invoice_image": invoice_image, "updated_at": datetime.utcnow()}}
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
        "created_at": datetime.utcnow()
    }
    await db.payment_transactions.insert_one(transaction)
    
    # Update order with payment method
    await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"payment_method": "stripe", "updated_at": datetime.utcnow()}}
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
                    "updated_at": datetime.utcnow()
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
                        "updated_at": datetime.utcnow()
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
            "created_at": datetime.utcnow()
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
            "timestamp": datetime.utcnow(),
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
        now = datetime.utcnow()
        
        # Today's visits
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        today_visits = await db.analytics_visits.count_documents({
            "timestamp": {"$gte": today_start}
        })
        
        # Last 7 days visits by day
        from datetime import timedelta
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
Livrarea durează de obicei 1-3 zile lucrătoare.

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
                "sent_at": datetime.utcnow()
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
