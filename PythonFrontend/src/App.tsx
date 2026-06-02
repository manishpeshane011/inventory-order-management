/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css"; // Load Bootstrap 5 Stylesheets globally

import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import Orders from "./pages/Orders";
import Inventory from "./pages/Inventory";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-vh-100 bg-light d-flex flex-column" id="app-root" style={{ fontFamily: "'Inter', sans-serif" }}>
        {/* Responsive Navbar present on all routes */}
        <Navbar />

        {/* Core Screen Canvas Wrapper */}
        <main className="flex-grow-1">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/inventory" element={<Inventory />} />
            
            {/* Redirect root link to dashboard by default */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            {/* Catch unexpected route requests */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>

        {/* Minimalist Professional Footer */}
        <footer className="bg-white border-top py-3 mt-auto" id="app-footer">
          <div className="container">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
              <span className="text-secondary small">
                © {new Date().getFullYear()} EZManage Inc. All rights reserved.
              </span>
              <span className="text-secondary small font-monospace">
                Connection Status: <span className="bg-success rounded-circle d-inline-block shadow-sm" style={{ width: "8px", height: "8px", marginRight: "4px" }} /> Online
              </span>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
