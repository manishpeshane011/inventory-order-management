from sqlalchemy.orm import Session

from app.models.customer import Customer


class CustomerService:

    @staticmethod
    def create_customer(
        db: Session,
        customer_data
    ):

        existing = db.query(Customer).filter(
            Customer.email == customer_data.email
        ).first()

        if existing:
            return None, "Email already exists"

        customer = Customer(
            **customer_data.dict()
        )

        db.add(customer)
        db.commit()
        db.refresh(customer)

        return customer, None

    @staticmethod
    def get_all_customers(
        db: Session,
        skip: int = 0,
        limit: int = 10,
        email: str = None
    ):

        query = db.query(Customer)

        if email:
            query = query.filter(
                Customer.email.ilike(f"%{email}%")
            )

        return query.offset(skip).limit(limit).all()

    @staticmethod
    def get_customer_by_id(
        db: Session,
        customer_id: int
    ):
        return db.query(Customer).filter(
            Customer.id == customer_id
        ).first()

    @staticmethod
    def update_customer(
        db: Session,
        customer_id: int,
        customer_data
    ):

        customer = db.query(Customer).filter(
            Customer.id == customer_id
        ).first()

        if not customer:
            return None

        update_data = customer_data.dict(
            exclude_unset=True
        )

        for key, value in update_data.items():
            setattr(customer, key, value)

        db.commit()
        db.refresh(customer)

        return customer

    @staticmethod
    def delete_customer(
        db: Session,
        customer_id: int
    ):

        customer = db.query(Customer).filter(
            Customer.id == customer_id
        ).first()

        if not customer:
            return False

        db.delete(customer)
        db.commit()

        return True