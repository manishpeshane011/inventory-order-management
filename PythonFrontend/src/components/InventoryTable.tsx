/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { InventoryItem } from "../types";
import { Search, AlertTriangle, ArrowUpDown, ServerCrash } from "lucide-react";

interface InventoryTableProps {
  inventory: InventoryItem[];
  isLoading: boolean;
}

type SortField = "product_id" | "product_name" | "stock_quantity";
type SortOrder = "asc" | "desc";

export default function InventoryTable({ inventory, isLoading }: InventoryTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("product_id");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Filter items matching search
  const filtered = inventory.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.product_name.toLowerCase().includes(term) ||
      item.product_id.toString().includes(term)
    );
  });

  // Sort items
  const sorted = [...filtered].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (typeof valA === "string" && typeof valB === "string") {
      return sortOrder === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    } else {
      // numbers
      return sortOrder === "asc"
        ? (valA as number) - (valB as number)
        : (valB as number) - (valA as number);
    }
  });

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="card shadow-sm border-0" id="inventory-table-container">
      <div className="card-header bg-white py-3 border-bottom d-flex flex-column flex-md-row gap-3 align-items-md-center justify-content-between">
        <h5 className="card-title mb-0 fw-bold text-dark">📊 Active Inventory Stock</h5>
        <div className="input-group max-w-md" style={{ maxWidth: "350px" }}>
          <span className="input-group-text bg-white border-end-0 text-muted">
            <Search size={18} />
          </span>
          <input
            type="text"
            className="form-control border-start-0 ps-0"
            placeholder="Search by ID or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            id="input-inventory-search"
          />
        </div>
      </div>
      <div className="card-body p-0">
        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading inventory...</span>
            </div>
            <p className="text-muted mt-2 mb-0">Fetching stock details...</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-5 px-3">
            <div className="mb-3">
              <AlertTriangle size={48} className="text-warning" />
            </div>
            <h6 className="fw-bold text-dark">No Inventory Records Found</h6>
            <p className="text-secondary small mb-0">
              {inventory.length > 0
                ? "No products match your current search terms."
                : "Create products first in the Products tab to view their live stack levels here."}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" id="inventory-table">
              <thead className="table-light text-uppercase font-sans font-medium text-xs tracking-wider">
                <tr>
                  <th
                    style={{ cursor: "pointer", width: "15%" }}
                    onClick={() => toggleSort("product_id")}
                    className="p-3"
                  >
                    <div className="d-flex align-items-center gap-1">
                      <span>Product ID</span>
                      <ArrowUpDown size={14} className="text-muted" />
                    </div>
                  </th>
                  <th style={{ cursor: "pointer" }} onClick={() => toggleSort("product_name")} className="p-3">
                    <div className="d-flex align-items-center gap-1">
                      <span>Product Name</span>
                      <ArrowUpDown size={14} className="text-muted" />
                    </div>
                  </th>
                  <th
                    style={{ cursor: "pointer", width: "25%" }}
                    onClick={() => toggleSort("stock_quantity")}
                    className="p-3 text-end"
                  >
                    <div className="d-flex align-items-center gap-1 justify-content-end">
                      <span>Stock Quantity</span>
                      <ArrowUpDown size={14} className="text-muted" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((item) => {
                  const isLow = item.stock_quantity <= 3;
                  const isOut = item.stock_quantity === 0;

                  return (
                    <tr key={item.product_id} id={`inventory-row-${item.product_id}`}>
                      <td className="p-3 font-monospace fw-semibold text-secondary">
                        #{item.product_id}
                      </td>
                      <td className="p-3">
                        <span className="fw-semibold text-dark">{item.product_name}</span>
                      </td>
                      <td className="p-3 text-end">
                        <span
                          className={`badge rounded-pill font-monospace py-2 px-3 ${
                            isOut
                              ? "bg-danger text-white shadow-xs"
                              : isLow
                              ? "bg-warning text-dark fw-bold"
                              : "bg-success-subtle text-success fw-bold"
                          }`}
                        >
                          {item.stock_quantity} {isOut ? "OUT" : isLow ? "LOW" : "OK"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="card-footer bg-white border-top py-3 px-4 text-secondary small d-flex flex-column flex-sm-row justify-content-between gap-2">
        <span>Showing {sorted.length} of {inventory.length} active entries</span>
        <span className="d-flex align-items-center gap-1 text-primary">
          <span className="bg-success rounded-circle d-inline-block" style={{ width: "8px", height: "8px" }} />
          Live system connection
        </span>
      </div>
    </div>
  );
}
