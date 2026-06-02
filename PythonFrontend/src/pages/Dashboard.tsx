/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { productAPI, customerAPI, orderAPI, inventoryAPI } from "../services/api";
import { Product, Customer, Order, InventoryItem } from "../types";
import {
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ServerCrash,
} from "lucide-react";

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [backendError, setBackendError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setBackendError(null);
    try {
      // Run parallel fetches
      const [prods, custs, ords, inv] = await Promise.all([
        productAPI.getProducts().catch((err) => {
          console.error("Products error:", err);
          return [] as Product[];
        }),
        customerAPI.getCustomers().catch((err) => {
          console.error("Customers error:", err);
          return [] as Customer[];
        }),
        orderAPI.getOrders().catch((err) => {
          console.error("Orders error:", err);
          return [] as Order[];
        }),
        inventoryAPI.getInventory().catch((err) => {
          console.error("Inventory error:", err);
          return [] as InventoryItem[];
        }),
      ]);

      const normalizedInventory = Array.isArray(inv) ? inv : [];

      if (!Array.isArray(inv)) {
        console.warn("Dashboard: inventory API returned unexpected payload shape, defaulting to empty inventory list.", inv);
      }

      console.debug("Dashboard fetchDashboardData result", {
        products: prods,
        customers: custs,
        orders: ords,
        inventory: normalizedInventory,
      });

      setProducts(prods);
      setCustomers(custs);
      setOrders(ords);
      setInventory(normalizedInventory);
    } catch (err: any) {
      console.error(err);
      setBackendError(
        "Could not load dashboard metrics from backend APIs. Please make sure the backend server (FastAPI/Express) is running locally at http://127.0.0.1:8000."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Compute metrics fallback (in case inventory or product fetches fails but others succeeded)
  const totalProducts = Array.isArray(products) ? products.length : 0;
  const totalCustomers = Array.isArray(customers) ? customers.length : 0;
  const totalOrders = Array.isArray(orders) ? orders.length : 0;

  // Let's count inventory items with stock_quantity > 0 as "Available Items" per user requirements
  const availableInventoryItems = Array.isArray(inventory)
    ? inventory.reduce(
        (total, item) => total + (item?.stock_quantity > 0 ? 1 : 0),
        0
      )
    : 0;

  // Total investment volume
  const totalStockSum = Array.isArray(products)
    ? products.reduce(
        (total, p) => total + (typeof p?.stock_quantity === "number" ? p.stock_quantity : 0),
        0
      )
    : 0;
  const totalInventoryValuation = Array.isArray(products)
    ? products.reduce(
        (total, p) =>
          total +
          (typeof p?.stock_quantity === "number" ? p.stock_quantity : 0) *
          (typeof p?.price === "number" ? p.price : 0),
        0
      )
    : 0;

  return (
    <div className="container py-4" id="dashboard-root">
      {/* Header and Sync */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-4 border-bottom pb-3">
        <div>
          <h2 className="fw-bold text-dark font-sans tracking-tight mb-1">
            👋 Welcome Back, Administrator
          </h2>
          <p className="text-secondary mb-0">
            Real-time status overview of your store inventory, client accounts, and purchase sales.
          </p>
        </div>
        <div>
          <button
            onClick={fetchDashboardData}
            className="btn btn-outline-dark d-flex align-items-center gap-2"
            disabled={isLoading}
            id="btn-refresh-dashboard"
          >
            {isLoading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            ) : (
              "🔄 Sync Feed"
            )}
          </button>
        </div>
      </div>

      {backendError && (
        <div className="alert alert-warning mb-4 shadow-sm border-0 d-flex flex-column flex-md-row align-items-md-center gap-3 p-4" role="alert" id="dashboard-api-warning">
          <ServerCrash size={36} className="text-warning flex-shrink-0" />
          <div>
            <h6 className="fw-bold mb-1">API Backend Unreachable (http://127.0.0.1:8000)</h6>
            <p className="mb-0 small text-secondary">
              The application couldn't connect to your local server. To resolve this, run your Inventory & Order backend app on port 8000 with CORS enabled.
            </p>
          </div>
        </div>
      )}

      {/* METRIC CARDS */}
      <div className="row g-3 mb-4" id="metric-cards-container">
        {/* TOTAL PRODUCTS */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100 bg-white">
            <div className="card-body d-flex align-items-center gap-3 p-4">
              <div className="bg-primary-subtle p-3 rounded-circle text-primary">
                <Package size={28} />
              </div>
              <div>
                <span className="text-uppercase text-secondary font-monospace tracking-wider small d-block">
                  Total Products
                </span>
                <span className="fs-3 fw-bold text-dark font-monospace">
                  {isLoading ? "..." : totalProducts}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* TOTAL CUSTOMERS */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100 bg-white">
            <div className="card-body d-flex align-items-center gap-3 p-4">
              <div className="bg-success-subtle p-3 rounded-circle text-success">
                <Users size={28} />
              </div>
              <div>
                <span className="text-uppercase text-secondary font-monospace tracking-wider small d-block">
                  Total Customers
                </span>
                <span className="fs-3 fw-bold text-dark font-monospace">
                  {isLoading ? "..." : totalCustomers}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* TOTAL ORDERS */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100 bg-white">
            <div className="card-body d-flex align-items-center gap-3 p-4">
              <div className="bg-info-subtle p-3 rounded-circle text-info">
                <ShoppingCart size={28} />
              </div>
              <div>
                <span className="text-uppercase text-secondary font-monospace tracking-wider small d-block">
                  Total Orders
                </span>
                <span className="fs-3 fw-bold text-dark font-monospace">
                  {isLoading ? "..." : totalOrders}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AVAILABLE INVENTORY ITEMS */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100 bg-white">
            <div className="card-body d-flex align-items-center gap-3 p-4">
              <div className="bg-warning-subtle p-3 rounded-circle text-warning">
                <TrendingUp size={28} />
              </div>
              <div>
                <span className="text-uppercase text-secondary font-monospace tracking-wider small d-block">
                  Available In Stock
                </span>
                <span className="fs-3 fw-bold text-dark font-monospace">
                  {isLoading ? "..." : availableInventoryItems} <span className="text-muted fs-6 font-sans">items</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading Metrics...</span>
          </div>
          <p className="text-muted mt-3">Compiling reports...</p>
        </div>
      ) : (
        <div className="row g-4 mb-4">
          {/* Recent Orders Overview */}
          <div className="col-lg-8">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
                <h5 className="card-title mb-0 fw-bold d-flex align-items-center gap-2">
                  <Clock size={18} className="text-primary" />
                  <span>Recent Sales Activity</span>
                </h5>
                <Link to="/orders" className="btn btn-sm btn-link text-decoration-none d-flex align-items-center gap-1 font-sans fw-semibold">
                  <span>View All Orders</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>
              <div className="card-body p-0">
                {orders.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-secondary mb-2 small">No active transaction records on record.</p>
                    <Link to="/orders" className="btn btn-sm btn-primary">
                      Place First Order
                    </Link>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light text-xs text-uppercase font-sans font-medium text-secondary">
                        <tr>
                          <th className="p-3">Order ID</th>
                          <th className="p-3">Customer ID</th>
                          <th className="p-3">Created Date</th>
                          <th className="p-3 text-end">Total Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(-5).reverse().map((order) => (
                          <tr key={order.id}>
                            <td className="p-3 font-monospace fw-semibold text-primary">
                              #{order.id}
                            </td>
                            <td className="p-3 font-monospace text-secondary">
                              #{order.customer_id}
                            </td>
                            <td className="p-3 text-secondary small">
                              {order.created_date ? new Date(order.created_date).toLocaleDateString() : "2026-06-01"}
                            </td>
                            <td className="p-3 text-end font-monospace fw-bold text-dark">
                              ${(order.total_amount || 0).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Valuation Stats */}
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 h-100 bg-white">
              <div className="card-header bg-white py-3 border-bottom">
                <h5 className="card-title mb-0 fw-bold">📈 Stock Insights</h5>
              </div>
              <div className="card-body d-flex flex-column justify-content-between p-4">
                <div className="mb-4">
                  <span className="text-muted small d-block mb-1">Stock Items Total Volume</span>
                  <div className="d-flex align-items-baseline gap-2">
                    <span className="fs-2 fw-bold font-monospace text-dark">{totalStockSum}</span>
                    <span className="text-secondary small">units across all catalogues</span>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-muted small d-block mb-1">Financial Valuation</span>
                  <div className="d-flex align-items-baseline gap-2">
                    <span className="fs-2 fw-bold font-monospace text-success">${totalInventoryValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span className="text-secondary small">potential proceeds</span>
                  </div>
                </div>

                <div className="pt-3 border-top">
                  <p className="small text-secondary mb-3">
                    Running low on items? Quick-access the products catalogue to view items requiring immediate replenishment.
                  </p>
                  <Link to="/inventory" className="btn btn-outline-primary w-full d-block text-center py-2">
                    Open Stock Control
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
