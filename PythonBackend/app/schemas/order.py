from typing import List

from pydantic import BaseModel
from pydantic import Field


class OrderItemRequest(BaseModel):
    product_id: int

    quantity: int = Field(..., gt=0)


class OrderCreate(BaseModel):
    customer_id: int

    items: List[OrderItemRequest]


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    subtotal: float

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: int
    customer_id: int
    total_amount: float
    status: str
    order_items: List[OrderItemResponse]

    class Config:
        from_attributes = True