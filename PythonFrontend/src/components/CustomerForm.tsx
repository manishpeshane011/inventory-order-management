/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Customer } from "../types";
import { Check, RotateCcw } from "lucide-react";

interface CustomerFormProps {
  customerToEdit?: Customer | null;
  onSubmit: (customer: Customer) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const emptyCustomer: Customer = {
  name: "",
  email: "",
  phone: "",
  address: "",
};

export default function CustomerForm({
  customerToEdit,
  onSubmit,
  onCancel,
  isLoading,
}: CustomerFormProps) {
  const [formData, setFormData] = useState<Customer>(emptyCustomer);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (customerToEdit) {
      setFormData(customerToEdit);
    } else {
      setFormData(emptyCustomer);
    }
    setErrors({});
  }, [customerToEdit]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Customer name is required.";
    
    // Email regex check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address (e.g., example@domain.com).";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
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
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const isEdit = !!customerToEdit;

  return (
    <div className="card shadow-sm border-0" id="customer-form-container">
      <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
        <h5 className="card-title mb-0 fw-bold text-dark">
          {isEdit ? "✏️ Edit Customer" : "➕ Add New Customer"}
        </h5>
        {isEdit && (
          <span className="badge bg-light text-dark font-monospace border">
            ID: {customerToEdit.id}
          </span>
        )}
      </div>
      <div className="card-body p-4">
        <form onSubmit={handleSubmit} id="customer_form">
          <div className="mb-3">
            <label htmlFor="cust_name" className="form-label fw-bold small text-secondary">
              Customer Name *
            </label>
            <input
              type="text"
              className={`form-control ${errors.name ? "is-invalid" : ""}`}
              id="cust_name"
              name="name"
              placeholder="e.g. Manish Peshane"
              value={formData.name}
              onChange={handleInputChange}
              disabled={isLoading}
              required
            />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="cust_email" className="form-label fw-bold small text-secondary">
              Email Address *
            </label>
            <input
              type="email"
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              id="cust_email"
              name="email"
              placeholder="e.g. manish@gmail.com"
              value={formData.email}
              onChange={handleInputChange}
              disabled={isLoading}
              required
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="cust_phone" className="form-label fw-bold small text-secondary">
              Phone Number *
            </label>
            <input
              type="tel"
              className={`form-control ${errors.phone ? "is-invalid" : ""}`}
              id="cust_phone"
              name="phone"
              placeholder="e.g. +91 9876543210"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={isLoading}
              required
            />
            {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="cust_address" className="form-label fw-bold small text-secondary">
              Address
            </label>
            <textarea
              className="form-control"
              id="cust_address"
              name="address"
              rows={3}
              placeholder="e.g. Hyderabad, India"
              value={formData.address}
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
              id="btn-cancel-customer"
            >
              <RotateCcw size={16} />
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              className="btn btn-primary d-flex align-items-center gap-1 px-4"
              disabled={isLoading}
              id="btn-submit-customer"
            >
              {isLoading ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : (
                <Check size={16} />
              )}
              <span>{isEdit ? "Update Customer" : "Save Customer"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
