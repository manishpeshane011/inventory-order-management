from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.product import Product


class ProductService:

    @staticmethod
    def create_product(db: Session, product_data):

        existing = db.query(Product).filter(
            Product.sku == product_data.sku
        ).first()

        if existing:
            return None, "SKU already exists"

        product = Product(**product_data.dict())

        db.add(product)
        db.commit()
        db.refresh(product)

        return product, None

    @staticmethod
    def get_all_products(
        db: Session,
        skip: int = 0,
        limit: int = 10,
        search: str = None
    ):

        query = db.query(Product)

        if search:
            query = query.filter(
                Product.name.ilike(f"%{search}%")
            )

        return query.offset(skip).limit(limit).all()

    @staticmethod
    def get_product_by_id(
        db: Session,
        product_id: int
    ):
        return db.query(Product).filter(
            Product.id == product_id
        ).first()

    @staticmethod
    def update_product(
        db: Session,
        product_id: int,
        product_data
    ):

        product = db.query(Product).filter(
            Product.id == product_id
        ).first()

        if not product:
            return None

        update_data = product_data.dict(
            exclude_unset=True
        )

        for key, value in update_data.items():
            setattr(product, key, value)

        db.commit()
        db.refresh(product)

        return product

    @staticmethod
    def delete_product(
        db: Session,
        product_id: int
    ):

        product = db.query(Product).filter(
            Product.id == product_id
        ).first()

        if not product:
            return False

        db.delete(product)
        db.commit()

        return True