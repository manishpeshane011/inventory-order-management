from typing import Optional

from pydantic import BaseModel
from pydantic import Field


class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1)

    description: Optional[str] = None

    sku: str = Field(..., min_length=1)

    price: float = Field(..., gt=0)

    stock_quantity: int = Field(..., ge=0)


class ProductUpdate(BaseModel):
    name: Optional[str] = None

    description: Optional[str] = None

    sku: Optional[str] = None

    price: Optional[float] = Field(None, gt=0)

    stock_quantity: Optional[int] = Field(None, ge=0)


class ProductResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    sku: str
    price: float
    stock_quantity: int

    class Config:
        from_attributes = True