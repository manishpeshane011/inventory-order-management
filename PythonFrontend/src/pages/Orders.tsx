/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { orderAPI, customerAPI, productAPI } from "../services/api";
import { Order, Customer, Product, OrderItem } from "../types";
import OrderForm from "../components/OrderForm";
import { ShoppingCart, Eye, RefreshCw, Filter, ShieldCheck, HelpCircle } from "lucide-react";

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [formSubmitLoading, setFormSubmitLoading] = useState(false);
  const [selectedDetailedOrder, setSelectedDetailedOrder] = useState<Order | null>(null);
  const [detailedOrderLoading, setDetailedOrderLoading] = useState(false);

  // Status message loops
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadAllOrderData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [ords, custs, prods] = await Promise.all([
        orderAPI.getOrders(),
        customerAPI.getCustomers(),
        productAPI.getProducts(),
      ]);
      setOrders(ords);
      setCustomers(custs);
      setProducts(prods);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        "Could not load modules data from APIs. Ensure your local server is running on port 8000."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllOrderData();
  }, []);

  const handleOrderSubmit = async (orderData: {
    customer_id: number;
    items: { product_id: number; quantity: number }[];
  }) => {
    setFormSubmitLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const response = await orderAPI.createOrder(orderData);
      setSuccessMessage(`Order #${response.id || "Successfully Submitted"} was placed. Total Amount: $${(response.total_amount || 0).toFixed(2)}`);
      // Reload both products (to get new stock quantities!) and orders history ledger!
      await loadAllOrderData();
    } catch (err: any) {
      // Re-throw so child form can output precise backend details e.g., "Insufficient stock for product"
      throw err;
    } finally {
      setFormSubmitLoading(false);
    }
  };

  const handleInspectOrder = async (orderId: number) => {
    setDetailedOrderLoading(true);
    setSelectedDetailedOrder(null);
    try {
      const fullOrder = await orderAPI.getOrder(orderId);
      setSelectedDetailedOrder(fullOrder);
    } catch (err) {
      console.error("Failed to fetch order details", err);
      // Fallback: search in current local orders state to give immediate offline-friendly display
      const fallback = orders.find((o) => o.id === orderId);
      if (fallback) {
        setSelectedDetailedOrder(fallback);
      }
    } finally {
      setDetailedOrderLoading(false);
    }
  };

  // Helper function to resolve Customer and Product names for UI
  const getCustomerName = (custId: number) => {
    const cust = customers.find((c) => c.id === custId);
    return cust ? cust.name : `Customer ID #${custId}`;
  };

  const getProductName = (prodId: number) => {
    const prod = products.find((p) => p.id === prodId);
    return prod ? prod.name : `Product ID #${prodId}`;
  };

  return (
    <div className="container py-4" id="orders-root">
      {/* Toast feedback alerts */}
      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show border-0 shadow-sm d-flex justify-content-between align-items-center mb-4" role="alert" id="order-alert-success">
          <div>🚀 {successMessage}</div>
          <button type="button" className="btn-close shadow-none" onClick={() => setSuccessMessage(null)} aria-label="Close" />
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-danger alert-dismissible fade show border-0 shadow-sm d-flex justify-content-between align-items-center mb-4" role="alert" id="order-alert-error">
          <div>❌ {errorMessage}</div>
          <button type="button" className="btn-close shadow-none" onClick={() => setErrorMessage(null)} />
        </div>
      )}

      {/* Header row */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark font-sans tracking-tight mb-1">🛒 Order Management</h2>
          <p className="text-secondary mb-0">Record instant invoices, calculate dynamic totals, auto-deduct core product stock, and inspect past receipts.</p>
        </div>
        <div>
          <button
            onClick={loadAllOrderData}
            className="btn btn-outline-secondary d-flex align-items-center gap-2"
            disabled={isLoading}
            id="btn-orders-force-refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            <span>Refresh Databases</span>
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* LEFT COLUMN: PLACE ORDER INTENDED SUBMISSIONS */}
        <div className="col-lg-5 col-12 order-lg-2">
          <OrderForm
            customers={customers}
            products={products}
            onSubmit={handleOrderSubmit}
            isLoading={formSubmitLoading}
            onSuccess={() => {/* handled inside nested success state */}}
          />
        </div>

        {/* RIGHT COLUMN: TRANSACTIONAL LEDGER ORDER HISTORY */}
        <div className="col-lg-7 col-12 order-lg-1">
          <div className="card shadow-sm border-0 bg-white">
            <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
              <h5 className="card-title mb-0 fw-bold d-flex align-items-center gap-2">
                <ShoppingCart size={18} className="text-primary" />
                <span>Historical Sales Ledger</span>
              </h5>
              <span className="badge bg-light text-dark font-monospace border">
                Record Count: {orders.length}
              </span>
            </div>

            <div className="card-body p-0">
              {isLoading && orders.length === 0 ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status" />
                  <p className="text-muted mt-2 mb-0">Opening ledger logs...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-5">
                  <ShoppingCart size={48} className="text-secondary opacity-50 mb-3" />
                  <h6 className="fw-bold">No Invoices on File</h6>
                  <p className="text-muted small mb-0">Prepare dynamic customer item lines on the right to register your first sale invoice.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0" id="orders-history-table">
                    <thead className="table-light text-uppercase font-sans font-medium text-xs tracking-wider">
                      <tr>
                        <th className="p-3" style={{ width: "12%" }}>Order ID</th>
                        <th className="p-3">Customer Acc</th>
                        <th className="p-3 text-end" style={{ width: "22%" }}>Total Amount</th>
                        <th className="p-3 text-center" style={{ width: "15%" }}>Status</th>
                        <th className="p-3 text-center" style={{ width: "12%" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice().reverse().map((order) => (
                        <tr key={order.id} id={`order-row-${order.id}`}>
                          <td className="p-3 font-monospace fw-bold text-primary">
                            #{order.id}
                          </td>
                          <td className="p-3">
                            <span className="fw-semibold text-dark text-truncate d-inline-block" style={{ maxWidth: "160px" }}>
                              {getCustomerName(order.customer_id)}
                            </span>
                            <div className="small font-monospace text-secondary text-xs">
                              CID: #{order.customer_id} • {order.created_date ? new Date(order.created_date).toLocaleDateString() : "2026-06-01"}
                            </div>
                          </td>
                          <td className="p-3 text-end font-monospace fw-bold text-dark">
                            ${(order.total_amount || 0).toFixed(2)}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`badge rounded-pill px-2 py-1 ${order.status?.toLowerCase() === "draft" ? "bg-secondary" : "bg-success text-white shadow-xs"}`}>
                              {order.status || "Completed"}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              className="btn btn-sm btn-outline-primary border-0 p-1"
                              onClick={() => order.id !== undefined && handleInspectOrder(order.id)}
                              title="Inspect purchased items"
                              id={`btn-inspect-order-${order.id}`}
                            >
                              <Eye size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="card-footer bg-white border-top py-3 text-secondary small">
              All transactions require customer profiles and real stock validation.
            </div>
          </div>
        </div>
      </div>

      {/* DYNAMIC RECIEPT DETAIL OVERLAY POPUP */}
      {(selectedDetailedOrder || detailedOrderLoading) && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }} role="dialog" id="order-details-overlay">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-dark text-white py-3">
                <h5 className="modal-title fw-bold">🧾 Invoice Receipt Details</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white shadow-none"
                  onClick={() => setSelectedDetailedOrder(null)}
                  aria-label="Close"
                />
              </div>
              <div className="modal-body p-4">
                {detailedOrderLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-dark mb-2" role="status" />
                    <p className="text-muted small mb-0">Querying database server logs...</p>
                  </div>
                ) : selectedDetailedOrder ? (
                  <div>
                    {/* Customer overview block */}
                    <div className="row mb-3 bg-light p-3 rounded mx-0 border g-2">
                      <div className="col-12 text-uppercase font-sans font-medium text-xs tracking-wider text-muted mb-1">
                        Invoice Recipient
                      </div>
                      <div className="col-6">
                        <span className="small text-secondary d-block">ID / Name</span>
                        <span className="fw-bold text-dark">
                          #{selectedDetailedOrder.customer_id} - {getCustomerName(selectedDetailedOrder.customer_id)}
                        </span>
                      </div>
                      <div className="col-6 text-end">
                        <span className="small text-secondary d-block">Order Timestamp</span>
                        <span className="fw-semibold text-dark text-sm">
                          {selectedDetailedOrder.created_date ? new Date(selectedDetailedOrder.created_date).toLocaleString() : "2026-06-01"}
                        </span>
                      </div>
                    </div>

                    {/* Bought lines */}
                    <div className="table-responsive">
                      <table className="table align-middle table-sm border">
                        <thead className="table-light text-xs text-uppercase">
                          <tr>
                            <th className="p-2">Item/SKU</th>
                            <th className="p-2 text-center" style={{ width: "15%" }}>Qty</th>
                            <th className="p-2 text-end" style={{ width: "25%" }}>Calculated Sub</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedDetailedOrder.items && selectedDetailedOrder.items.map((item: OrderItem, i: number) => {
                            // find price info
                            const matchingProd = products.find((p) => p.id === item.product_id);
                            const priceText = matchingProd ? `$${matchingProd.price.toFixed(2)}` : "N/A";
                            const subtotal = matchingProd ? matchingProd.price * item.quantity : 0;

                            return (
                              <tr key={i}>
                                <td className="p-2">
                                  <div className="fw-semibold text-dark text-xs">{getProductName(item.product_id)}</div>
                                  <div className="font-monospace text-secondary text-2xs" style={{ fontSize: "0.75rem" }}>
                                    PID: #{item.product_id} • Unit: {priceText}
                                  </div>
                                </td>
                                <td className="p-2 text-center font-monospace fw-bold">
                                  {item.quantity}
                                </td>
                                <td className="p-2 text-end font-monospace text-dark fw-semibold">
                                  {matchingProd ? `$${subtotal.toFixed(2)}` : "—"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Totals Summary */}
                    <div className="border-top pt-3 mt-3 d-flex justify-content-between align-items-center">
                      <div>
                        <span className="badge bg-success-subtle text-success border border-success-subtle small font-sans d-flex align-items-center gap-1">
                          <ShieldCheck size={12} />
                          <span>Paid & Fulfilled</span>
                        </span>
                      </div>
                      <div className="text-end">
                        <span className="text-muted small d-block">Fulfillment Total</span>
                        <span className="fs-4 fw-bold text-dark font-monospace">
                          ${(selectedDetailedOrder.total_amount || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="modal-footer bg-light border-top py-3 justify-content-end">
                <button
                  type="button"
                  className="btn btn-secondary px-4 shadow-sm"
                  onClick={() => setSelectedDetailedOrder(null)}
                  id="btn-close-details-overlay"
                >
                  Close Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
