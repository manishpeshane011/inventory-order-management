import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Users,
  AlertCircle,
  Loader2,
  Mail,
  Phone,
  MapPin,
  FileSpreadsheet,
} from 'lucide-react';
import useCustomers from '../hooks/useCustomers';
import { Customer } from '../types';

interface CustomerFormInput {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export const Customers: React.FC = () => {
  const {
    customers,
    loading,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  } = useCustomers();

  const [searchEmail, setSearchEmail] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Selected for focus or action
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Forms setup
  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    reset: resetAdd,
    formState: { errors: errorsAdd, isSubmitting: isSubmittingAdd },
  } = useForm<CustomerFormInput>();

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit, isSubmitting: isSubmittingEdit },
  } = useForm<CustomerFormInput>();

  // Fetch when search variable alters
  useEffect(() => {
    fetchCustomers(searchEmail);
  }, [searchEmail]);

  // Handle edit initializations
  useEffect(() => {
    if (selectedCustomer) {
      resetEdit({
        name: selectedCustomer.name,
        email: selectedCustomer.email,
        phone: selectedCustomer.phone,
        address: selectedCustomer.address,
      });
    }
  }, [selectedCustomer, resetEdit]);

  // Submit new customer handlers
  const onAddSubmit = async (data: CustomerFormInput) => {
    const success = await createCustomer(data);
    if (success) {
      resetAdd();
      setIsAddOpen(false);
    }
  };

  // Submit updated customer specs
  const onEditSubmit = async (data: CustomerFormInput) => {
    if (!selectedCustomer) return;
    const success = await updateCustomer(selectedCustomer.id, data);
    if (success) {
      setIsEditOpen(false);
      setSelectedCustomer(null);
    }
  };

  // Confirm delete customer
  const onDeleteConfirm = async () => {
    if (!selectedCustomer) return;
    const success = await deleteCustomer(selectedCustomer.id);
    if (success) {
      setIsDeleteOpen(false);
      setSelectedCustomer(null);
    }
  };

  // Pagination offsets
  const totalPages = Math.ceil(customers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCustomers = customers.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6">
      {/* Header section with count */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Enterprise Client Database</h2>
          <p className="text-sm text-slate-500 mt-1">Manage corporate clients, addresses, and CRM accounts.</p>
        </div>
        <button
          id="btn-add-customer"
          onClick={() => {
            resetAdd();
            setIsAddOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      {/* Filter and search box panel */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs">
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            id="customer-email-search-input"
            type="text"
            placeholder="Search explicitly by email address..."
            value={searchEmail}
            onChange={(e) => {
              setSearchEmail(e.target.value);
              setCurrentPage(1); // Reset page numbers
            }}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-700"
          />
        </div>

        <div className="text-xs text-slate-400 font-medium whitespace-nowrap self-stretch sm:self-auto flex items-center justify-end">
          Total: {customers.length} business representatives
        </div>
      </div>

      {/* Main Table Screen */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
        {loading && customers.length === 0 ? (
          <div className="py-24 text-center flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm font-medium text-slate-400">Loading partners database records...</p>
          </div>
        ) : customers.length === 0 ? (
          <div id="customers-empty-state" className="py-20 text-center flex flex-col items-center max-w-sm mx-auto">
            <div className="w-14 h-14 bg-indigo-50 flex items-center justify-center rounded-2xl text-indigo-500 mb-4">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No CRM Customers found</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              No matching client addresses are logged yet. Get started by entering your first customer coordinate profile!
            </p>
            <button
              onClick={() => setIsAddOpen(true)}
              className="mt-6 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl text-xs font-semibold cursor-pointer transition-all"
            >
              Add Business Partner
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 font-semibold tracking-wider text-xs">
                  <th className="px-6 py-4">ID Coordinates</th>
                  <th className="px-6 py-4">Client Representative Name</th>
                  <th className="px-6 py-4">Email Coordinates</th>
                  <th className="px-6 py-4">Corporate Telephone</th>
                  <th className="px-6 py-4">Headquarters Address</th>
                  <th className="px-6 py-4 text-right pr-8">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium text-xs text-slate-700">
                {currentCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-slate-400 text-[11px]">#CL-{c.id}</td>
                    <td id={`customer-name-${c.id}`} className="px-6 py-4">
                      <div className="font-bold text-slate-800 text-sm">{c.name}</div>
                    </td>
                    <td id={`customer-email-${c.id}`} className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 text-[11px] font-mono">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{c.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{c.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-normal">
                      <div className="flex items-center gap-1.5 text-[11px] max-w-xs truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{c.address}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right pr-8">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit Action Button */}
                        <button
                          id={`btn-edit-customer-${c.id}`}
                          onClick={() => {
                            setSelectedCustomer(c);
                            setIsEditOpen(true);
                          }}
                          className="p-1.5 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-all rounded-lg cursor-pointer"
                          title="Modify Partner coordinates"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {/* Delete Action Button */}
                        <button
                          id={`btn-delete-customer-${c.id}`}
                          onClick={() => {
                            setSelectedCustomer(c);
                            setIsDeleteOpen(true);
                          }}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all rounded-lg cursor-pointer"
                          title="Archive Customer Profile"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination indicator pane */}
        {totalPages > 1 && (
          <div className="border-t border-slate-100 px-6 py-4.5 flex items-center justify-between bg-white text-xs">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 font-semibold cursor-pointer disabled:opacity-50 disabled:pointer-events-none transition-all"
            >
              Previous
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`w-8 h-8 rounded-lg font-bold transition-all cursor-pointer ${
                    currentPage === index + 1
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 font-semibold cursor-pointer disabled:opacity-50 disabled:pointer-events-none transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* MODAL: ADD CUSTOMER */}
      {isAddOpen && (
        <div id="add-customer-modal" className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                Register New Customer Profile
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAdd(onAddSubmit)} className="p-6 space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-slate-500">Representative Corporate Name *</label>
                <input
                  id="form-add-customer-name"
                  type="text"
                  placeholder="e.g. Manish Kumar"
                  {...registerAdd('name', { required: 'Customer full name is required' })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg bg-slate-50/50 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800"
                />
                {errorsAdd.name && <p className="text-rose-500 text-[10px] font-bold mt-0.5">{errorsAdd.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-500">Email Address Address *</label>
                <input
                  id="form-add-customer-email"
                  type="email"
                  placeholder="e.g. manish@gmail.com"
                  {...registerAdd('email', {
                    required: 'Email address is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address syntax'
                    }
                  })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg bg-slate-50/50 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800"
                />
                {errorsAdd.email && <p className="text-rose-500 text-[10px] font-bold mt-0.5">{errorsAdd.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-500">Corporate Phone Number *</label>
                <input
                  id="form-add-customer-phone"
                  type="text"
                  placeholder="e.g. 9876543210"
                  {...registerAdd('phone', {
                    required: 'Phone number is required',
                    minLength: { value: 10, message: 'Minimum 10 digits required' }
                  })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg bg-slate-50/50 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800"
                />
                {errorsAdd.phone && <p className="text-rose-500 text-[10px] font-bold mt-0.5">{errorsAdd.phone.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-500">Headquarters Address Location *</label>
                <textarea
                  id="form-add-customer-address"
                  rows={2.5}
                  placeholder="e.g. Hyderabad, India"
                  {...registerAdd('address', { required: 'Location coordinate is required' })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg bg-slate-50/50 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800"
                />
                {errorsAdd.address && <p className="text-rose-500 text-[10px] font-bold mt-0.5">{errorsAdd.address.message}</p>}
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 flex-row">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-add-customer"
                  type="submit"
                  disabled={isSubmittingAdd}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer shadow-xs hover:shadow-md transition-all flex items-center gap-2"
                >
                  {isSubmittingAdd && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Register Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT CUSTOMER */}
      {isEditOpen && selectedCustomer && (
        <div id="edit-customer-modal" className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-indigo-500 animate-pulse" />
                Modify Profile: CL-{selectedCustomer.id}
              </h3>
              <button onClick={() => {
                setIsEditOpen(false);
                setSelectedCustomer(null);
              }} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit(onEditSubmit)} className="p-6 space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-slate-500">Representative Corporate Name *</label>
                <input
                  id="form-edit-customer-name"
                  type="text"
                  {...registerEdit('name', { required: 'Customer name is required' })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg bg-slate-50/50 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800"
                />
                {errorsEdit.name && <p className="text-rose-500 text-[10px] font-bold mt-0.5">{errorsEdit.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-500">Email Address Coordinates *</label>
                <input
                  id="form-edit-customer-email"
                  type="email"
                  {...registerEdit('email', {
                    required: 'Email address is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address syntax'
                    }
                  })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg bg-slate-50/50 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800"
                />
                {errorsEdit.email && <p className="text-rose-500 text-[10px] font-bold mt-0.5">{errorsEdit.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-500">Corporate Phone Number *</label>
                <input
                  id="form-edit-customer-phone"
                  type="text"
                  {...registerEdit('phone', {
                    required: 'Phone number is required',
                    minLength: { value: 10, message: 'Minimum 10 digits required' }
                  })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg bg-slate-50/50 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800"
                />
                {errorsEdit.phone && <p className="text-rose-500 text-[10px] font-bold mt-0.5">{errorsEdit.phone.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-500">Headquarters Address Location *</label>
                <textarea
                  id="form-edit-customer-address"
                  rows={2.5}
                  {...registerEdit('address', { required: 'Location coordinate is required' })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg bg-slate-50/50 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800"
                />
                {errorsEdit.address && <p className="text-rose-500 text-[10px] font-bold mt-0.5">{errorsEdit.address.message}</p>}
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditOpen(false);
                    setSelectedCustomer(null);
                  }}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-edit-customer"
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer shadow-xs hover:shadow-md transition-all flex items-center gap-2"
                >
                  {isSubmittingEdit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Metrics
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {isDeleteOpen && selectedCustomer && (
        <div id="delete-customer-modal" className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-rose-50 text-rose-650 flex items-center justify-center rounded-2xl mx-auto mb-2">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Confirm Customer Removal</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Confirm removing <span className="font-bold text-slate-700">"{selectedCustomer.name}"</span> from active business clients directory? Past orders registered to this ID will be detached.
              </p>
            </div>

            <div className="px-6 py-4.5 bg-slate-50 flex items-center justify-end gap-3 flex-row">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteOpen(false);
                  setSelectedCustomer(null);
                }}
                className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-delete"
                onClick={onDeleteConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Deactivate Partner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
