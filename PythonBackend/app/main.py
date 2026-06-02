from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base
from app.database import engine

# Import Models
from app.models.product import Product
from app.models.customer import Customer
from app.models.order import Order
from app.models.order_item import OrderItem

# Routers
from app.routers.product_router import router as product_router
from app.routers.customer_router import router as customer_router
from app.routers.order_router import router as order_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Inventory & Order Management System",
    description="FastAPI + PostgreSQL + SQLAlchemy",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(product_router)
app.include_router(customer_router)
app.include_router(order_router)


@app.get("/")
def root():
    return {
        "success": True,
        "message": "Inventory Management API Running"
    }


@app.get("/health")
def health():
    return {
        "status": "UP"
    }