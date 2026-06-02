/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { LayoutDashboard, Box, Users, ShoppingCart, BarChart3, Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNavbar = () => setIsOpen(!isOpen);
  const closeNavbar = () => setIsOpen(false);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm py-3" id="main-navbar">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold" to="/dashboard">
          <BarChart3 size={24} className="text-primary" />
          <span>EZManage <span className="text-primary font-monospace" style={{ fontSize: "0.8rem" }}>v1.0</span></span>
        </Link>
        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={toggleNavbar}
          aria-controls="navbarNav"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
          id="btn-navbar-toggle"
        >
          {isOpen ? <X size={24} className="text-light" /> : <Menu size={24} className="text-light" />}
        </button>
        <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`} id="navbarNav">
          <ul className="navbar-nav ms-auto gap-1 gap-lg-3 mt-3 mt-lg-0">
            <li className="nav-item">
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `nav-link d-flex align-items-center gap-2 px-3 py-2 rounded ${isActive ? "active bg-primary text-white fw-medium shadow-sm" : ""}`}
                onClick={closeNavbar}
                id="link-nav-dashboard"
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/products"
                className={({ isActive }) => `nav-link d-flex align-items-center gap-2 px-3 py-2 rounded ${isActive ? "active bg-primary text-white fw-medium shadow-sm" : ""}`}
                onClick={closeNavbar}
                id="link-nav-products"
              >
                <Box size={18} />
                <span>Products</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/customers"
                className={({ isActive }) => `nav-link d-flex align-items-center gap-2 px-3 py-2 rounded ${isActive ? "active bg-primary text-white fw-medium shadow-sm" : ""}`}
                onClick={closeNavbar}
                id="link-nav-customers"
              >
                <Users size={18} />
                <span>Customers</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/orders"
                className={({ isActive }) => `nav-link d-flex align-items-center gap-2 px-3 py-2 rounded ${isActive ? "active bg-primary text-white fw-medium shadow-sm" : ""}`}
                onClick={closeNavbar}
                id="link-nav-orders"
              >
                <ShoppingCart size={18} />
                <span>Orders</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/inventory"
                className={({ isActive }) => `nav-link d-flex align-items-center gap-2 px-3 py-2 rounded ${isActive ? "active bg-primary text-white fw-medium shadow-sm" : ""}`}
                onClick={closeNavbar}
                id="link-nav-inventory"
              >
                <BarChart3 size={18} />
                <span>Inventory</span>
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
