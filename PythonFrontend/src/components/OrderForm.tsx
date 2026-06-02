/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Customer, Product } from "../types";
import { Plus, Trash, Check, AlertCircle } from "lucide-react";

interface OrderFormProps {
  customers: Customer[];
  products: Product[];
  onSubmit: (orderData: { customer_id: number; items: { product_id: number; quantity: number }[] }) => Promise<void>;
  isLoading: boolean;
  onSuccess: () => void;
}

interface OrderItemInput {
  uuid: string; // for React rendering keys
  product_id: number | "";
  quantity: number;
}

export default function OrderForm({
  customers,
  products,
  onSubmit,
  isLoading,
  onSuccess,
}: OrderFormProps) {
  const [customerId, setCustomerId] = useState<number | "">("");
  const [items, setItems] = useState<OrderItemInput[]>([
    { uuid: Math.random().toString(), product_id: "", quantity: 1 },
  ]);
  const [formError, setFormError] = useState<string | null>(null);

  const handleAddRow = () => {
    setItems((prev) => [
      ...prev,
      { uuid: Math.random().toString(), product_id: "", quantity: 1 },
    ]);
  };

  const handleRemoveRow = (uuid: string) => {
    if (items.length === 1) {
      setFormError("An order must contain at least one item.");
      return;
    }
    setItems((prev) => prev.filter((item) => item.uuid !== uuid));
  };

  const handleItemChange = (uuid: string, field: "product_id" | "quantity", value: number | "") => {
    setFormError(null);
    setItems((prev) =>
      prev.map((item) => {
        if (item.uuid === uuid) {
          return {
            ...item,
            [field]: value,
          };
        }
        return item;
      })
    );
  };

  // Calculate Order Total Estimations
  const getProductPrice = (productId: number | ""): number => {
    if (productId === "") return 0;
    const prod = products.find((p) => p.id === productId);
    return prod ? prod.price : 0;
  };

  const orderTotal = items.reduce((acc, item) => {
    const price = getProductPrice(item.product_id);
    return acc + price * (item.quantity || 0);
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (customerId === "") {
      setFormError("Please select a customer.");
      return;
    }

    // Filter valid lines
    const validItems = items.filter((item) => item.product_id !== "");
    if (validItems.length === 0) {
      setFormError("Please add at least one product with a valid selection.");
      return;
    }

    // Validate quantities are positive integers
    for (const item of validItems) {
      if (item.quantity <= 0 || !Number.isInteger(item.quantity)) {
        const prodName = products.find((p) => p.id === item.product_id)?.name || "product";
        setFormError(`Please enter a valid, positive whole quantity for ${prodName}.`);
        return;
      }

      // Check client-side if we exceed stock (as a guide, the backend will validate too)
      const targetProd = products.find((p) => p.id === item.product_id);
      if (targetProd && targetProd.stock_quantity < item.quantity) {
        setFormError(
          `Insufficient stock. "${targetProd.name}" only has ${targetProd.stock_quantity} units available.`
        );
        return;
      }
    }

    try {
      await onSubmit({
        customer_id: Number(customerId),
        items: validItems.map((item) => ({
          product_id: Number(item.product_id),
          quantity: item.quantity,
        })),
      });
      // reset form
      setCustomerId("");
      setItems([{ uuid: Math.random().toString(), product_id: "", quantity: 1 }]);
      onSuccess();
    } catch (err: any) {
      // Backend error shown inside page rather than throwing uncaught
      console.error(err);
      const apiErr = err.response?.data?.detail || err.response?.data?.message || err.message || "Failed to place order.";
      setFormError(apiErr);
    }
  };

  return (
    <div className="card shadow-sm border-0" id="order-form-container">
      <div className="card-header bg-white py-3 border-bottom">
        <h5 className="card-title mb-0 fw-bold text-dark">📦 Place New Order</h5>
      </div>
      <div className="card-body p-4">
        {formError && (
          <div className="alert alert-danger d-flex align-items-center gap-2" role="alert" id="order-form-error">
            <AlertCircle size={20} className="flex-shrink-0" />
            <div>{formError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} id="order_form">
          {/* CUSTOMER INPUT */}
          <div className="mb-4">
            <label htmlFor="order_customer" className="form-label fw-bold small text-secondary">
              Select Customer *
            </label>
            <select
              className="form-select form-select-lg"
              id="order_customer"
              value={customerId}
              onChange={(e) => {
                setFormError(null);
                setCustomerId(e.target.value ? Number(e.target.value) : "");
              }}
              disabled={isLoading}
              required
            >
              <option value="">-- Choose Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.email})
                </option>
              ))}
            </select>
            {customers.length === 0 && (
              <div className="form-text text-danger">
                No customers found. Please add a customer first under the "Customers" tab.
              </div>
            )}
          </div>

          {/* PRODUCTS ENTRIES */}
          <div className="mb-4">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <label className="form-label fw-bold small text-secondary mb-0">Order Items (Products) *</label>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                onClick={handleAddRow}
                disabled={isLoading || products.length === 0}
                id="btn-add-more-product"
              >
                <Plus size={14} />
                <span>Add Product Row</span>
              </button>
            </div>

            {items.map((item, index) => {
              const selectedProduct = products.find((p) => p.id === item.product_id);
              const maxStock = selectedProduct ? selectedProduct.stock_quantity : null;

              return (
                <div key={item.uuid} className="row g-2 align-items-end mb-3 border-bottom pb-3 pb-md-0 border-light border-md-0" id={`order-item-row-${index}`}>
                  <div className="col-12 col-md-6">
                    <label className="d-block d-md-none small text-muted">Product</label>
                    <select
                      className="form-select"
                      value={item.product_id}
                      onChange={(e) =>
                        handleItemChange(
                          item.uuid,
                          "product_id",
                          e.target.value ? Number(e.target.value) : ""
                        )
                      }
                      disabled={isLoading}
                      required
                    >
                      <option value="">-- Select Product --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id} disabled={p.stock_quantity <= 0}>
                          {p.name} (SKU: {p.sku}) — ${p.price.toFixed(2)} [Stock: {p.stock_quantity}]
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-8 col-md-3">
                    <label className="d-block d-md-none small text-muted">Qty</label>
                    <div className="input-group">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        className="form-control"
                        placeholder="Qty"
                        value={item.quantity || ""}
                        onChange={(e) =>
                          handleItemChange(
                            item.uuid,
                            "quantity",
                            e.target.value ? parseInt(e.target.value, 10) : 0
                          )
                        }
                        disabled={isLoading}
                        required
                      />
                      {maxStock !== null && (
                        <span className="input-group-text bg-light text-muted small px-2">
                          / {maxStock}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="col-4 col-md-2 text-end text-md-start">
                    <div className="pt-2 pt-md-0">
                      <span className="small text-muted d-block d-md-none">Subtotal</span>
                      <span className="fw-medium font-monospace">
                        ${((selectedProduct ? selectedProduct.price : 0) * (item.quantity || 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="col-12 col-md-1 text-end">
                    <button
                      type="button"
                      className="btn btn-outline-danger border-0 text-danger p-2"
                      onClick={() => handleRemoveRow(item.uuid)}
                      disabled={isLoading}
                      title="Remove row"
                      id={`btn-remove-row-${index}`}
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* TOTAL ESTIMATION SECTION */}
          <div className="card bg-light border-0 mb-4">
            <div className="card-body d-flex justify-content-between align-items-center py-3 px-4">
              <span className="fw-bold text-secondary text-uppercase small tracking-wider">
                Estimated Order Total:
              </span>
              <span className="fs-3 fw-bold text-dark font-monospace">
                ${orderTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* SUBMIT */}
          <div className="d-grid">
            <button
              type="submit"
              className="btn btn-primary d-flex align-items-center justify-content-center gap-2 py-2 fs-5 shadow-sm"
              disabled={isLoading || products.length === 0 || customers.length === 0}
              id="btn-place-order"
            >
              {isLoading ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
              ) : (
                <Check size={20} />
              )}
              <span>Place Order</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
