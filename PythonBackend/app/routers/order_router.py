from fastapi import APIRouter
from fastapi import Depends
from fastapi import status

from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.order import OrderCreate

from app.services.order_service import OrderService

from app.utils.response import (
    success_response,
    error_response
)

router = APIRouter(
    prefix="/api",
    tags=["Orders"]
)


@router.post("/orders")
def create_order(
    order: OrderCreate,
    db: Session = Depends(get_db)
):

    result, error = OrderService.create_order(
        db,
        order
    )

    if error:
        return error_response(
            error,
            status.HTTP_400_BAD_REQUEST
        )

    return success_response(
        "Order placed successfully",
        {
            "order_id": result.id,
            "customer_id": result.customer_id,
            "total_amount": float(
                result.total_amount
            ),
            "status": result.status
        },
        status.HTTP_201_CREATED
    )


@router.get("/orders")
def get_orders(
    db: Session = Depends(get_db)
):

    orders = OrderService.get_orders(db)

    return success_response(
        "Orders fetched successfully",
        orders
    )


@router.get("/orders/{order_id}")
def get_order(
    order_id: int,
    db: Session = Depends(get_db)
):

    order = OrderService.get_order_by_id(
        db,
        order_id
    )

    if not order:
        return error_response(
            "Order not found",
            status.HTTP_404_NOT_FOUND
        )

    return success_response(
        "Order fetched successfully",
        order
    )


@router.get("/inventory")
def inventory(
    db: Session = Depends(get_db)
):

    data = OrderService.inventory(db)

    return success_response(
        "Inventory fetched successfully",
        data
    )