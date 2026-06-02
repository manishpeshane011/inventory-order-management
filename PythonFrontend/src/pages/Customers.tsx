/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { customerAPI } from "../services/api";
import { Customer } from "../types";
import CustomerForm from "../components/CustomerForm";
import { Search, Edit, Trash, AlertCircle, Users, RefreshCw, X, Mail } from "lucide-react";

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Edit / Delete tracking states
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  const fetchCustomers = async (emailQuery = "") => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await customerAPI.getCustomers(emailQuery);
      setCustomers(data);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        "Failed to load customers from API backend. Please ensure the backend server is running and accessible."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced effect for email search block
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCustomers(searchEmail.trim());
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchEmail]);

  const handleCreateOrUpdate = async (customerData: Customer) => {
    setSubmitLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      if (customerData.id !== undefined) {
        // Update Action
        await customerAPI.updateCustomer(customerData.id, customerData);
        setSuccessMessage(`Customer "${customerData.name}" updated successfully!`);
        setEditingCustomer(null);
      } else {
        // Create Action
        await customerAPI.createCustomer(customerData);
        setSuccessMessage(`Customer "${customerData.name}" created successfully!`);
      }
      fetchCustomers(searchEmail);
    } catch (err: any) {
      console.error(err);
      const apiErr = err.response?.data?.detail || err.response?.data?.message || err.message || "Failed to process customer.";
      setErrorMessage(apiErr);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCustomer || deletingCustomer.id === undefined) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await customerAPI.deleteCustomer(deletingCustomer.id);
      setSuccessMessage(`Customer "${deletingCustomer.name}" removed successfully.`);
      setDeletingCustomer(null);
      fetchCustomers(searchEmail);
    } catch (err: any) {
      console.error(err);
      const apiErr = err.response?.data?.detail || err.response?.data?.message || err.message || "Failed to delete customer.";
      setErrorMessage(apiErr);
      setDeletingCustomer(null);
    }
  };

  return (
    <div className="container py-4" id="customers-root">
      {/* Feedback Messages */}
      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show border-0 shadow-sm d-flex justify-content-between align-items-center mb-4" role="alert" id="customer-alert-success">
          <div>🎉 {successMessage}</div>
          <button type="button" className="btn-close shadow-none" onClick={() => setSuccessMessage(null)} aria-label="Close" />
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-danger alert-dismissible fade show border-0 shadow-sm d-flex justify-content-between align-items-center mb-4" role="alert" id="customer-alert-error">
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
          <h2 className="fw-bold text-dark font-sans tracking-tight mb-1">👥 Customer Accounts</h2>
          <p className="text-secondary mb-0">Record customer profiles, modify physical addresses, lookup emails, and delete records cleanly.</p>
        </div>
        <div>
          <button
            onClick={() => fetchCustomers(searchEmail)}
            className="btn btn-outline-secondary d-flex align-items-center gap-2"
            disabled={isLoading}
            id="btn-customers-force-refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            <span>Reload Accounts</span>
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* LEFT COLUMN: CUSTOMER FORM PANEL */}
        <div className="col-lg-4 col-12 order-lg-2">
          <CustomerForm
            customerToEdit={editingCustomer}
            onSubmit={handleCreateOrUpdate}
            onCancel={() => setEditingCustomer(null)}
            isLoading={submitLoading}
          />
        </div>

        {/* RIGHT COLUMN: SEARCH FILTER AND CUSTOMER RECORDS LIST */}
        <div className="col-lg-8 col-12 order-lg-1">
          <div className="card shadow-sm border-0 bg-white">
            <div className="card-header bg-white py-3 border-bottom d-flex flex-column flex-md-row gap-3 align-items-md-center justify-content-between">
              <h5 className="card-title mb-0 fw-bold d-flex align-items-center gap-2">
                <Users size={18} className="text-primary" />
                <span>Active Customer Accounts</span>
              </h5>
              <div className="input-group" style={{ maxWidth: "320px" }}>
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <Mail size={16} />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0 text-sm"
                  placeholder="Lookup exact email address..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  id="search-customers-field"
                />
              </div>
            </div>

            <div className="card-body p-0">
              {isLoading && customers.length === 0 ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status" />
                  <p className="text-muted mt-2 mb-0">Querying directory databases...</p>
                </div>
              ) : customers.length === 0 ? (
                <div className="text-center py-5">
                  <Users size={48} className="text-secondary opacity-50 mb-3" />
                  <h6 className="fw-bold">No Accounts Found</h6>
                  <p className="text-muted small mb-0">
                    {searchEmail ? "No customers registered with that email filter." : "Click the panel on the side to create user accounts and directories."}
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0" id="customers-table">
                    <thead className="table-light text-uppercase font-sans font-medium text-xs tracking-wider">
                      <tr>
                        <th className="p-3" style={{ width: "8%" }}>ID</th>
                        <th className="p-3">Customer Profile</th>
                        <th className="p-3">Contact</th>
                        <th className="p-3">Address</th>
                        <th className="p-3 text-center" style={{ width: "15%" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((c) => (
                        <tr key={c.id} id={`customer-row-${c.id}`} className={editingCustomer?.id === c.id ? "table-primary-subtle" : ""}>
                          <td className="p-3 font-monospace fw-semibold text-secondary">
                            #{c.id}
                          </td>
                          <td className="p-3">
                            <div className="fw-bold text-dark">{c.name}</div>
                          </td>
                          <td className="p-3">
                            <div className="text-primary fw-medium font-monospace small mb-1">{c.email}</div>
                            <div className="text-secondary font-monospace text-xs">{c.phone}</div>
                          </td>
                          <td className="p-3 text-secondary small">
                            <div className="text-truncate" style={{ maxWidth: "200px" }} title={c.address}>
                              {c.address || <em className="text-muted">No address provided</em>}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="d-flex align-items-center justify-content-center gap-1">
                              <button
                                className="btn btn-outline-secondary border-0 p-1"
                                onClick={() => setEditingCustomer(c)}
                                title="Edit profile entries"
                                id={`btn-edit-cust-${c.id}`}
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                className="btn btn-outline-danger border-0 p-1"
                                onClick={() => setDeletingCustomer(c)}
                                title="Delete profile permanently"
                                id={`btn-delete-cust-${c.id}`}
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
              Registry: {customers.length} business accounts registered
            </div>
          </div>
        </div>
      </div>

      {/* DELETE CUSTOMER CONFIRMATION POPUP DIALOG */}
      {deletingCustomer && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }} role="dialog" id="customer-delete-confirmation">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-danger text-white py-3">
                <h5 className="modal-title fw-bold">⚠️ Delete Customer Profile</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white shadow-none"
                  onClick={() => setDeletingCustomer(null)}
                  aria-label="Close"
                />
              </div>
              <div className="modal-body p-4">
                <p className="mb-2">Are you sure you want to permanently delete the following customer profile?</p>
                <div className="p-3 bg-light rounded font-monospace text-sm mb-3 border">
                  <strong>Name:</strong> {deletingCustomer.name} <br />
                  <strong>Email:</strong> {deletingCustomer.email} <br />
                  <strong>Phone:</strong> {deletingCustomer.phone}
                </div>
                <p className="text-secondary small mb-0">Deletes are immediate. Note that deleting customers might orphan historical sales orders registered under this client profile.</p>
              </div>
              <div className="modal-footer bg-light py-3 border-top gap-2">
                <button
                  type="button"
                  className="btn btn-light border"
                  onClick={() => setDeletingCustomer(null)}
                  id="btn-cancel-cust-delete"
                >
                  Keep Account
                </button>
                <button
                  type="button"
                  className="btn btn-danger px-4"
                  onClick={handleDeleteConfirm}
                  id="btn-confirm-cust-delete"
                >
                  Permanently Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
