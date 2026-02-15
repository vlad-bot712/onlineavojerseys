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
    price_ron: float = 170.0
    images: List[str] = []
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


class CreateOrderRequest(BaseModel):
    items: List[OrderItem]
    customer_name: str
    customer_email: str
    customer_phone: str
    customer_address: str
    shipping_method: str
    total_ron: float
    currency: str = "RON"


class Order(BaseModel):
    id: Optional[str] = None
    order_number: str
    items: List[OrderItem]
    customer_name: str
    customer_email: str
    customer_phone: str
    customer_address: str
    shipping_method: str
    total_ron: float
    currency: str
    status: str = "pending"
    payment_status: str = "pending"
    payment_method: str = ""
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
            "image_url": "https://images.unsplash.com/photo-1551563983-7f51a18f2d01?w=800"
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
