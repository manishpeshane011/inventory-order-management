from fastapi import APIRouter
from fastapi import Depends
from fastapi import Query
from fastapi import status

from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.customer import CustomerCreate
from app.schemas.customer import CustomerUpdate

from app.services.customer_service import CustomerService

from app.utils.response import (
    success_response,
    error_response
)

router = APIRouter(
    prefix="/api/customers",
    tags=["Customers"]
)


@router.post("")
def create_customer(
    customer: CustomerCreate,
    db: Session = Depends(get_db)
):

    result, error = CustomerService.create_customer(
        db,
        customer
    )

    if error:
        return error_response(
            error,
            status.HTTP_409_CONFLICT
        )

    return success_response(
        "Customer created successfully",
        result.id,
        status.HTTP_201_CREATED
    )


@router.get("")
def get_customers(
    skip: int = Query(0),
    limit: int = Query(10),
    email: str = None,
    db: Session = Depends(get_db)
):

    customers = CustomerService.get_all_customers(
        db,
        skip,
        limit,
        email
    )

    return success_response(
        "Customers fetched successfully",
        customers
    )


@router.get("/{customer_id}")
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db)
):

    customer = CustomerService.get_customer_by_id(
        db,
        customer_id
    )

    if not customer:
        return error_response(
            "Customer not found",
            status.HTTP_404_NOT_FOUND
        )

    return success_response(
        "Customer fetched successfully",
        customer
    )


@router.put("/{customer_id}")
def update_customer(
    customer_id: int,
    customer: CustomerUpdate,
    db: Session = Depends(get_db)
):

    updated = CustomerService.update_customer(
        db,
        customer_id,
        customer
    )

    if not updated:
        return error_response(
            "Customer not found",
            status.HTTP_404_NOT_FOUND
        )

    return success_response(
        "Customer updated successfully",
        updated
    )


@router.delete("/{customer_id}")
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db)
):

    deleted = CustomerService.delete_customer(
        db,
        customer_id
    )

    if not deleted:
        return error_response(
            "Customer not found",
            status.HTTP_404_NOT_FOUND
        )

    return success_response(
        "Customer deleted successfully"
    )