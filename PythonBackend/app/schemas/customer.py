from typing import Optional

from pydantic import BaseModel
from pydantic import EmailStr


class CustomerCreate(BaseModel):
    name: str

    email: EmailStr

    phone: Optional[str] = None

    address: Optional[str] = None


class CustomerUpdate(BaseModel):
    name: Optional[str] = None

    email: Optional[EmailStr] = None

    phone: Optional[str] = None

    address: Optional[str] = None


class CustomerResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: Optional[str]
    address: Optional[str]

    class Config:
        from_attributes = True