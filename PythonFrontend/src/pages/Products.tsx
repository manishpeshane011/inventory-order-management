/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { productAPI } from "../services/api";
import { Product } from "../types";
import ProductForm from "../components/ProductForm";
import { Search, Edit, Trash, AlertCircle, ShoppingBag, Plus, RefreshCw, X } from "lucide-react";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Edit / Delete tracking states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const fetchProducts = async (query = "") => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await productAPI.getProducts(query);
      setProducts(data);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        "Failed to load products from API backend. Please ensure the backend server is running and accessible."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Run initial fetch and trigger search queries on search term updates
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts(searchTerm);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleCreateOrUpdate = async (productData: Product) => {
    setSubmitLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      if (productData.id !== undefined) {
        // Update Action
        await productAPI.updateProduct(productData.id, productData);
        setSuccessMessage(`Product "${productData.name}" updated successfully!`);
        setEditingProduct(null);
      } else {
        // Create Action
        await productAPI.createProduct(productData);
        setSuccessMessage(`Product "${productData.name}" created successfully!`);
      }
      // Re-trigger product listing fetch
      fetchProducts(searchTerm);
    } catch (err: any) {
      console.error(err);
      const apiErr = err.response?.data?.detail || err.response?.data?.message || err.message || "Failed to process product.";
      setErrorMessage(apiErr);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct || deletingProduct.id === undefined) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await productAPI.deleteProduct(deletingProduct.id);
      setSuccessMessage(`Product "${deletingProduct.name}" deleted successfully!`);
      setDeletingProduct(null);
      fetchProducts(searchTerm);
    } catch (err: any) {
      console.error(err);
      const apiErr = err.response?.data?.detail || err.response?.data?.message || err.message || "Failed to delete product.";
      setErrorMessage(apiErr);
      setDeletingProduct(null);
    }
  };

  return (
    <div className="container py-4" id="products-root">
      {/* Feedback Notifications */}
      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show border-0 shadow-sm d-flex justify-content-between align-items-center mb-4" role="alert" id="product-alert-success">
          <div>🎉 {successMessage}</div>
          <button type="button" className="btn-close shadow-none" onClick={() => setSuccessMessage(null)} aria-label="Close" />
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-danger alert-dismissible fade show border-0 shadow-sm d-flex justify-content-between align-items-center mb-4" role="alert" id="product-alert-error">
          <div className="d-flex align-items-center gap-2">
            <AlertCircle size={20} className="text-danger flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button type="button" className="btn-close shadow-none" onClick={() => setErrorMessage(null)} aria-label="Close" />
        </div>
      )}

      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark font-sans tracking-tight mb-1">📦 Products Catalogue</h2>
          <p className="text-secondary mb-0">Create, adjust, search, and delete products dynamically with instant synchronization.</p>
        </div>
        <div>
          <button
            onClick={() => fetchProducts(searchTerm)}
            className="btn btn-outline-secondary d-flex align-items-center gap-2"
            disabled={isLoading}
            id="btn-products-force-refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            <span>Reload Table</span>
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* LEFT COLUMN: PRODUCT INTAKE & CORRECTIONS FORM */}
        <div className="col-lg-4 col-12 order-lg-2">
          <ProductForm
            productToEdit={editingProduct}
            onSubmit={handleCreateOrUpdate}
            onCancel={() => setEditingProduct(null)}
            isLoading={submitLoading}
          />
        </div>

        {/* RIGHT COLUMN: SEARCH FILTER AND CATALOGUE DATA TABLE */}
        <div className="col-lg-8 col-12 order-lg-1">
          <div className="card shadow-sm border-0 bg-white">
            <div className="card-header bg-white py-3 border-bottom d-flex flex-column flex-md-row gap-3 align-items-md-center justify-content-between">
              <h5 className="card-title mb-0 fw-bold d-flex align-items-center gap-2">
                <ShoppingBag size={18} className="text-primary" />
                <span>Active Products List</span>
              </h5>
              <div className="input-group" style={{ maxWidth: "300px" }}>
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0 text-sm"
                  placeholder="Query Product SKU / Name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  id="search-products-field"
                />
              </div>
            </div>

            <div className="card-body p-0">
              {isLoading && products.length === 0 ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status" />
                  <p className="text-muted mt-2 mb-0">Scanning database records...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-5">
                  <ShoppingBag size={48} className="text-secondary opacity-50 mb-3" />
                  <h6 className="fw-bold">No Products Found</h6>
                  <p className="text-muted small mb-0">
                    {searchTerm ? "No inventory records match your search criteria." : "Click the Create panel to create your first product catalog item."}
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0" id="products-table">
                    <thead className="table-light text-uppercase font-sans font-medium text-xs tracking-wider">
                      <tr>
                        <th className="p-3" style={{ width: "8%" }}>ID</th>
                        <th className="p-3">Product Info</th>
                        <th className="p-3" style={{ width: "18%" }}>SKU</th>
                        <th className="p-3 text-end" style={{ width: "15%" }}>Price</th>
                        <th className="p-3 text-end" style={{ width: "12%" }}>Stock</th>
                        <th className="p-3 text-center" style={{ width: "15%" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.id} id={`product-row-${p.id}`} className={editingProduct?.id === p.id ? "table-primary-subtle" : ""}>
                          <td className="p-3 font-monospace fw-semibold text-secondary">
                            #{p.id}
                          </td>
                          <td className="p-3">
                            <div className="fw-semibold text-dark">{p.name}</div>
                            {p.description && (
                              <div className="text-secondary small text-truncate" style={{ maxWidth: "220px" }}>
                                {p.description}
                              </div>
                            )}
                          </td>
                          <td className="p-3 font-monospace text-secondary small">
                            {p.sku}
                          </td>
                          <td className="p-3 text-end font-monospace fw-semibold text-dark">
                            ${p.price.toFixed(2)}
                          </td>
                          <td className="p-3 text-end">
                            <span className={`badge rounded-pill ${p.stock_quantity === 0 ? "bg-danger" : p.stock_quantity <= 3 ? "bg-warning text-dark" : "bg-light text-dark border"}`}>
                              {p.stock_quantity}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="d-flex align-items-center justify-content-center gap-1">
                              <button
                                className="btn btn-outline-secondary border-0 p-1"
                                onClick={() => setEditingProduct(p)}
                                title="Edit Product details"
                                id={`btn-edit-prod-${p.id}`}
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                className="btn btn-outline-danger border-0 p-1"
                                onClick={() => setDeletingProduct(p)}
                                title="Delete Product"
                                id={`btn-delete-prod-${p.id}`}
                              >
                                <Trash size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="card-footer bg-white border-top py-3 text-secondary small">
              Found {products.length} registered products
            </div>
          </div>
        </div>
      </div>

      {/* CUSTOM RE-USABLE DELETE CONFIRMATION MODAL STATE */}
      {deletingProduct && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }} role="dialog" id="delete-confirmation-dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-danger text-white py-3">
                <h5 className="modal-title fw-bold">⚠️ Delete Product Confirmation</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white shadow-none"
                  onClick={() => setDeletingProduct(null)}
                  aria-label="Close"
                />
              </div>
              <div className="modal-body p-4">
                <p className="mb-2">Are you sure you want to permanently delete the following product?</p>
                <div className="p-3 bg-light rounded font-monospace text-sm mb-3 border">
                  <strong>Name:</strong> {deletingProduct.name} <br />
                  <strong>SKU:</strong> {deletingProduct.sku} <br />
                  <strong>Current Stock:</strong> {deletingProduct.stock_quantity} units
                </div>
                <p className="text-secondary small mb-0">This operational action is irreversible. Stock levels of active draft orders referencing this product might be affected.</p>
              </div>
              <div className="modal-footer bg-light py-3 border-top gap-2">
                <button
                  type="button"
                  className="btn btn-light border"
                  onClick={() => setDeletingProduct(null)}
                  id="btn-cancel-delete"
                >
                  No, Keep Product
                </button>
                <button
                  type="button"
                  className="btn btn-danger px-4"
                  onClick={handleDeleteConfirm}
                  id="btn-confirm-delete"
                >
                  Yes, Delete Forever
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
