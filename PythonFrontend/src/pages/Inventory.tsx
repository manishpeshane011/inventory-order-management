/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { inventoryAPI } from "../services/api";
import { InventoryItem } from "../types";
import InventoryTable from "../components/InventoryTable";
import { BarChart3, RefreshCw, AlertCircle } from "lucide-react";

export default function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchInventory = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await inventoryAPI.getInventory();
      setInventory(data);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        "Could not load physical stock levels from backend. Make sure your inventory service backend at http://127.0.0.1:8000 is active."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  return (
    <div className="container py-4" id="inventory-root">
      {errorMessage && (
        <div className="alert alert-danger alert-dismissible fade show border-0 shadow-sm d-flex justify-content-between align-items-center mb-4" role="alert" id="inventory-alert-error">
          <div className="d-flex align-items-center gap-2">
            <AlertCircle size={20} className="text-danger flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button type="button" className="btn-close shadow-none" onClick={() => setErrorMessage(null)} />
        </div>
      )}

      {/* Header section */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark font-sans tracking-tight mb-1">📊 Inventory Tracker</h2>
          <p className="text-secondary mb-0">Track real-time stock balances, detect depleted items, and check available sales assets.</p>
        </div>
        <div>
          <button
            onClick={fetchInventory}
            className="btn btn-outline-secondary d-flex align-items-center gap-2"
            disabled={isLoading}
            id="btn-inventory-force-refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            <span>Sync Inventory</span>
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <InventoryTable inventory={inventory} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
