/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Product } from "../types";
import { Plus, Check, RotateCcw, AlertTriangle } from "lucide-react";

interface ProductFormProps {
  productToEdit?: Product | null;
  onSubmit: (product: Product) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const emptyProduct: Product = {
  name: "",
  description: "",
  sku: "",
  price: 0,
  stock_quantity: 0,
};

export default function ProductForm({
  productToEdit,
  onSubmit,
  onCancel,
  isLoading,
}: ProductFormProps) {
  const [formData, setFormData] = useState<Product>(emptyProduct);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (productToEdit) {
      setFormData(productToEdit);
    } else {
      setFormData(emptyProduct);
    }
    setErrors({});
  }, [productToEdit]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Product name is required.";
    if (!formData.sku.trim()) newErrors.sku = "SKU is required.";
    if (formData.price < 0) newErrors.price = "Price must be a positive number.";
    if (formData.stock_quantity < 0) {
      newErrors.stock_quantity = "Stock quantity cannot be negative.";
    } else if (!Number.isInteger(formData.stock_quantity)) {
      newErrors.stock_quantity = "Stock quantity must be a whole number.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || 0 : name === "stock_quantity" ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const isEdit = !!productToEdit;

  return (
    <div className="card shadow-sm border-0" id="product-form-container">
      <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
        <h5 className="card-title mb-0 fw-bold text-dark">
          {isEdit ? "✏️ Edit Product" : "➕ Add New Product"}
        </h5>
        {isEdit && (
          <span className="badge bg-light text-dark font-monospace border">
            ID: {productToEdit.id}
          </span>
        )}
      </div>
      <div className="card-body p-4">
        <form onSubmit={handleSubmit} id="product_form">
          <div className="mb-3">
            <label htmlFor="prod_name" className="form-label fw-bold small text-secondary">
              Product Name *
            </label>
            <input
              type="text"
              className={`form-control ${errors.name ? "is-invalid" : ""}`}
              id="prod_name"
              name="name"
              placeholder="e.g. Dell XPS Laptop"
              value={formData.name}
              onChange={handleInputChange}
              disabled={isLoading}
              required
            />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="prod_sku" className="form-label fw-bold small text-secondary">
              SKU (Stock Keeping Unit) *
            </label>
            <input
              type="text"
              className={`form-control font-monospace ${errors.sku ? "is-invalid" : ""}`}
              id="prod_sku"
              name="sku"
              placeholder="e.g. DELL-XPS13-09"
              value={formData.sku}
              onChange={handleInputChange}
              disabled={isLoading}
              required
            />
            {errors.sku && <div className="invalid-feedback">{errors.sku}</div>}
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="prod_price" className="form-label fw-bold small text-secondary">
                Price (INR / USD) *
              </label>
              <div className="input-group">
                <span className="input-group-text">$</span>
                <input
                  type="number"
                  step="0.01"
                  className={`form-control ${errors.price ? "is-invalid" : ""}`}
                  id="prod_price"
                  name="price"
                  placeholder="0.00"
                  value={formData.price || ""}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                />
                {errors.price && <div className="invalid-feedback d-block">{errors.price}</div>}
              </div>
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="prod_stock" className="form-label fw-bold small text-secondary">
                Stock Quantity *
              </label>
              <input
                type="number"
                step="1"
                className={`form-control ${errors.stock_quantity ? "is-invalid" : ""}`}
                id="prod_stock"
                name="stock_quantity"
                placeholder="0"
                value={formData.stock_quantity || ""}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
              {errors.stock_quantity && (
                <div className="invalid-feedback">{errors.stock_quantity}</div>
              )}
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="prod_description" className="form-label fw-bold small text-secondary">
              Description
            </label>
            <textarea
              className="form-control"
              id="prod_description"
              name="description"
              rows={3}
              placeholder="Describe product brand, specifications, or details..."
              value={formData.description}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </div>

          <div className="d-flex align-items-center justify-content-end gap-2 mt-4">
            <button
              type="button"
              className="btn btn-light d-flex align-items-center gap-1 border"
              onClick={onCancel}
              disabled={isLoading}
              id="btn-cancel-product"
            >
              <RotateCcw size={16} />
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              className="btn btn-primary d-flex align-items-center gap-1 px-4"
              disabled={isLoading}
              id="btn-submit-product"
            >
              {isLoading ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : (
                <Check size={16} />
              )}
              <span>{isEdit ? "Update Product" : "Create Product"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
