
from fastapi import APIRouter
from fastapi import Depends
from fastapi import Query
from fastapi import status

from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.product import ProductCreate
from app.schemas.product import ProductUpdate

from app.services.product_service import ProductService

from app.utils.response import (
    success_response,
    error_response
)

router = APIRouter(
    prefix="/api/products",
    tags=["Products"]
)


@router.post("")
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db)
):

    result, error = ProductService.create_product(
        db,
        product
    )

    if error:
        return error_response(
            error,
            status.HTTP_409_CONFLICT
        )

    return success_response(
        "Product created successfully",
        result.id,
        status.HTTP_201_CREATED
    )


@router.get("")
def get_products(
    skip: int = Query(0),
    limit: int = Query(10),
    search: str = None,
    db: Session = Depends(get_db)
):

    products = ProductService.get_all_products(
        db,
        skip,
        limit,
        search
    )

    return success_response(
        "Products fetched successfully",
        products
    )


@router.get("/{product_id}")
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):

    product = ProductService.get_product_by_id(
        db,
        product_id
    )

    if not product:
        return error_response(
            "Product not found",
            status.HTTP_404_NOT_FOUND
        )

    return success_response(
        "Product fetched successfully",
        product
    )


@router.put("/{product_id}")
def update_product(
    product_id: int,
    product: ProductUpdate,
    db: Session = Depends(get_db)
):

    updated = ProductService.update_product(
        db,
        product_id,
        product
    )

    if not updated:
        return error_response(
            "Product not found",
            status.HTTP_404_NOT_FOUND
        )

    return success_response(
        "Product updated successfully",
        updated
    )


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db)
):

    deleted = ProductService.delete_product(
        db,
        product_id
    )

    if not deleted:
        return error_response(
            "Product not found",
            status.HTTP_404_NOT_FOUND
        )

    return success_response(
        "Product deleted successfully"
    )