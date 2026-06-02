from sqlalchemy.orm import Session

from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.customer import Customer


class OrderService:

    @staticmethod
    def create_order(
        db: Session,
        order_data
    ):

        customer = db.query(Customer).filter(
            Customer.id == order_data.customer_id
        ).first()

        if not customer:
            return None, "Customer not found"

        try:

            total_amount = 0

            order = Order(
                customer_id=order_data.customer_id,
                total_amount=0,
                status="PLACED"
            )

            db.add(order)
            db.flush()

            for item in order_data.items:

                product = db.query(Product).filter(
                    Product.id == item.product_id
                ).first()

                if not product:
                    db.rollback()
                    return None, f"Product {item.product_id} not found"

                if product.stock_quantity < item.quantity:
                    db.rollback()
                    return None, (
                        f"Insufficient stock for "
                        f"{product.name}"
                    )

                subtotal = (
                    float(product.price)
                    * item.quantity
                )

                product.stock_quantity -= item.quantity

                order_item = OrderItem(
                    order_id=order.id,
                    product_id=product.id,
                    quantity=item.quantity,
                    unit_price=product.price,
                    subtotal=subtotal
                )

                db.add(order_item)

                total_amount += subtotal

            order.total_amount = total_amount

            db.commit()
            db.refresh(order)

            return order, None

        except Exception as e:

            db.rollback()

            return None, str(e)

    @staticmethod
    def get_orders(
        db: Session
    ):
        return db.query(Order).all()

    @staticmethod
    def get_order_by_id(
        db: Session,
        order_id: int
    ):
        return db.query(Order).filter(
            Order.id == order_id
        ).first()

    @staticmethod
    def inventory(
        db: Session
    ):

        products = db.query(Product).all()

        return [
            {
                "product_id": p.id,
                "name": p.name,
                "stock_quantity": p.stock_quantity
            }
            for p in products
        ]