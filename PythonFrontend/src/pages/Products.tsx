import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Package,
  AlertCircle,
  Eye,
  Loader2,
} from 'lucide-react';
import useProducts from '../hooks/useProducts';
import { Product } from '../types';

interface ProductFormInput {
  name: string;
  description: string;
  sku: string;
  price: number;
  stock_quantity: number;
}

export const Products: React.FC = () => {
  const {
    products,
    loading,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProducts();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Focus resource
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form initializations
  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    reset: resetAdd,
    formState: { errors: errorsAdd, isSubmitting: isSubmittingAdd },
  } = useForm<ProductFormInput>();

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit, isSubmitting: isSubmittingEdit },
  } = useForm<ProductFormInput>();

  // Fetch items on mount and on search trigger
  useEffect(() => {
    fetchProducts(searchQuery);
  }, [searchQuery]);

  // Sync edit form fields when product is selected
  useEffect(() => {
    if (selectedProduct) {
      resetEdit({
        name: selectedProduct.name,
        description: selectedProduct.description,
        sku: selectedProduct.sku,
        price: selectedProduct.price,
        stock_quantity: selectedProduct.stock_quantity,
      });
    }
  }, [selectedProduct, resetEdit]);

  // Add Product Submit Handlers
  const onAddSubmit = async (data: ProductFormInput) => {
    const payload = {
      ...data,
      price: Number(data.price),
      stock_quantity: Number(data.stock_quantity),
    };
    const success = await createProduct(payload);
    if (success) {
      resetAdd();
      setIsAddOpen(false);
    }
  };

  // Edit Product Submit Handlers
  const onEditSubmit = async (data: ProductFormInput) => {
    if (!selectedProduct) return;
    const payload = {
      ...data,
      price: Number(data.price),
      stock_quantity: Number(data.stock_quantity),
    };
    const success = await updateProduct(selectedProduct.id, payload);
    if (success) {
      setIsEditOpen(false);
      setSelectedProduct(null);
    }
  };

  // Delete Confirm
  const onDeleteConfirm = async () => {
    if (!selectedProduct) return;
    const success = await deleteProduct(selectedProduct.id);
    if (success) {
      setIsDeleteOpen(false);
      setSelectedProduct(null);
    }
  };

  // Pagination bounds
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Catalogs & Products</h2>
          <p className="text-sm text-slate-500 mt-1">Manage and update warehouse catalog stocks.</p>
        </div>
        <button
          id="btn-add-product"
          onClick={() => {
            resetAdd();
            setIsAddOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Filter Options & Search bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs">
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            id="product-search-input"
            type="text"
            placeholder="Search by name, SKU or brand..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset page on filter
            }}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-700"
          />
        </div>
        
        <div className="text-xs text-slate-400 font-medium whitespace-nowrap self-stretch sm:self-auto flex items-center justify-end">
          Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, products.length)} of {products.length} records
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
        {loading && products.length === 0 ? (
          /* Loading Indicator */
          <div className="py-24 text-center flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm font-medium text-slate-400">Fetching products catalog...</p>
          </div>
        ) : products.length === 0 ? (
          /* Empty Catalog screen */
          <div id="products-empty-state" className="py-20 text-center flex flex-col items-center max-w-sm mx-auto">
            <div className="w-14 h-14 bg-indigo-50 flex items-center justify-center rounded-2xl text-indigo-500 mb-4">
              <Package className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No Catalog Products Available</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              No inventories match this criteria. Try adding a new product item or adjusting your keywords.
            </p>
            <button
              onClick={() => setIsAddOpen(true)}
              className="mt-6 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl text-xs font-semibold cursor-pointer transition-all"
            >
              Add First Product
            </button>
          </div>
        ) : (
          /* Results Table Grid */
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 font-semibold tracking-wider text-xs">
                  <th className="px-6 py-4">SKU Code</th>
                  <th className="px-6 py-4">Product Attributes</th>
                  <th className="px-6 py-4 text-right">Cost Price</th>
                  <th className="px-6 py-4 text-center">Remaining Stock</th>
                  <th className="px-6 py-4 text-right pr-8">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium text-xs text-slate-700">
                {currentProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td id={`product-sku-${p.sku}`} className="px-6 py-4 font-mono text-slate-500 font-semibold uppercase">{p.sku}</td>
                    <td className="px-6 py-4 max-w-xs">
                      <div id={`product-name-${p.id}`} className="font-bold text-slate-800 text-sm">{p.name}</div>
                      <div className="text-slate-400 mt-0.5 line-clamp-1 font-normal text-[11px]">{p.description}</div>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-800 font-bold">{formatPrice(p.price)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        p.stock_quantity > 10
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                          : p.stock_quantity >= 5
                          ? 'bg-amber-50 text-amber-800 border border-amber-100'
                          : 'bg-rose-50 text-rose-800 border border-rose-100'
                      }`}>
                        {p.stock_quantity} units
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right pr-8">
                      <div className="flex items-center justify-end gap-2">
                        {/* View Specifications */}
                        <button
                          onClick={() => {
                            setSelectedProduct(p);
                            setIsViewOpen(true);
                          }}
                          className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-750 transition-all rounded-lg cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {/* Edit Action */}
                        <button
                          id={`btn-edit-product-${p.id}`}
                          onClick={() => {
                            setSelectedProduct(p);
                            setIsEditOpen(true);
                          }}
                          className="p-1.5 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-all rounded-lg cursor-pointer"
                          title="Edit Specs"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {/* Delete Action */}
                        <button
                          id={`btn-delete-product-${p.id}`}
                          onClick={() => {
                            setSelectedProduct(p);
                            setIsDeleteOpen(true);
                          }}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all rounded-lg cursor-pointer"
                          title="Delete Catalog Item"
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

        {/* Pagination Container */}
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

      {/* MODAL: ADD PRODUCT */}
      {isAddOpen && (
        <div id="add-product-modal" className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600" />
                Add New Catalog Product
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAdd(onAddSubmit)} className="p-6 space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-slate-500">Product Name *</label>
                <input
                  id="form-add-product-name"
                  type="text"
                  placeholder="e.g. Dell Inspiron"
                  {...registerAdd('name', { required: 'Product name is required' })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg bg-slate-50/50 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800"
                />
                {errorsAdd.name && <p className="text-rose-500 text-[10px] font-bold mt-0.5">{errorsAdd.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-500">Universal SKU Code *</label>
                  <input
                    id="form-add-product-sku"
                    type="text"
                    placeholder="e.g. LAP001"
                    {...registerAdd('sku', { required: 'SKU code is required' })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg bg-slate-50/50 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800"
                  />
                  {errorsAdd.sku && <p className="text-rose-500 text-[10px] font-bold mt-0.5">{errorsAdd.sku.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-500">Base Unit Price (₹) *</label>
                  <input
                    id="form-add-product-price"
                    type="number"
                    placeholder="e.g. 50000"
                    {...registerAdd('price', {
                      required: 'Cost price is required',
                      min: { value: 0.1, message: 'Price must be greater than 0' }
                    })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg bg-slate-50/50 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800"
                  />
                  {errorsAdd.price && <p className="text-rose-500 text-[10px] font-bold mt-0.5">{errorsAdd.price.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-500">Starting On-Hand Inventory *</label>
                <input
                  id="form-add-product-qty"
                  type="number"
                  placeholder="e.g. 10"
                  {...registerAdd('stock_quantity', {
                    required: 'Stock count is required',
                    min: { value: 0, message: 'Quantity cannot be negative' }
                  })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg bg-slate-50/50 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800"
                />
                {errorsAdd.stock_quantity && <p className="text-rose-500 text-[10px] font-bold mt-0.5">{errorsAdd.stock_quantity.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-500">Spec / Description</label>
                <textarea
                  id="form-add-product-desc"
                  rows={3}
                  placeholder="Provide technical attributes and features..."
                  {...registerAdd('description')}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg bg-slate-50/50 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800"
                />
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
                  id="btn-submit-add-product"
                  type="submit"
                  disabled={isSubmittingAdd}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer shadow-xs hover:shadow-md transition-all flex items-center gap-2"
                >
                  {isSubmittingAdd && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Register Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PRODUCT */}
      {isEditOpen && selectedProduct && (
        <div id="edit-product-modal" className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-indigo-500 animate-pulse" />
                Modify Product Specs: {selectedProduct.sku}
              </h3>
              <button onClick={() => {
                setIsEditOpen(false);
                setSelectedProduct(null);
              }} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit(onEditSubmit)} className="p-6 space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-slate-500">Product Name *</label>
                <input
                  id="form-edit-product-name"
                  type="text"
                  {...registerEdit('name', { required: 'Product name is required' })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg bg-slate-50/50 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800"
                />
                {errorsEdit.name && <p className="text-rose-500 text-[10px] font-bold mt-0.5">{errorsEdit.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-500">Universal SKU Code *</label>
                  <input
                    id="form-edit-product-sku"
                    type="text"
                    {...registerEdit('sku', { required: 'SKU code is required' })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg bg-slate-50/50 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800"
                  />
                  {errorsEdit.sku && <p className="text-rose-500 text-[10px] font-bold mt-0.5">{errorsEdit.sku.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-500">Base Unit Price (₹) *</label>
                  <input
                    id="form-edit-product-price"
                    type="number"
                    {...registerEdit('price', {
                      required: 'Cost price is required',
                      min: { value: 0.1, message: 'Price must be greater than 0' }
                    })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg bg-slate-50/50 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800"
                  />
                  {errorsEdit.price && <p className="text-rose-500 text-[10px] font-bold mt-0.5">{errorsEdit.price.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-500">Adjust Stock Level *</label>
                <input
                  id="form-edit-product-qty"
                  type="number"
                  {...registerEdit('stock_quantity', {
                    required: 'Stock count is required',
                    min: { value: 0, message: 'Stock quantity cannot be less than 0' }
                  })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg bg-slate-50/50 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800"
                />
                {errorsEdit.stock_quantity && <p className="text-rose-500 text-[10px] font-bold mt-0.5">{errorsEdit.stock_quantity.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-500">Spec / Description</label>
                <textarea
                  id="form-edit-product-desc"
                  rows={3}
                  {...registerEdit('description')}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg bg-slate-50/50 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditOpen(false);
                    setSelectedProduct(null);
                  }}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-edit-product"
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
      {isDeleteOpen && selectedProduct && (
        <div id="delete-product-modal" className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-rose-50 text-rose-650 flex items-center justify-center rounded-2xl mx-auto mb-2">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Confirm Catalog Deletion</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Are you absolutely sure you want to remove <span className="font-bold text-slate-700">"{selectedProduct.name}"</span> from the catalog database? This action is irreversible.
              </p>
            </div>

            <div className="px-6 py-4.5 bg-slate-50 flex items-center justify-end gap-3 flex-row">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteOpen(false);
                  setSelectedProduct(null);
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
                Archive Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VIEW SPEC DETAILS */}
      {isViewOpen && selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-slate-405" />
                Product Specification Sheet
              </h3>
              <button onClick={() => {
                setIsViewOpen(false);
                setSelectedProduct(null);
              }} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4.5 text-xs font-medium text-slate-600">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Product Name</span>
                <p className="text-sm font-bold text-slate-800">{selectedProduct.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">SKU Code</span>
                  <p className="text-xs font-mono font-bold text-slate-700">{selectedProduct.sku}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Catalog Reference ID</span>
                  <p className="text-xs font-bold text-slate-800">#{selectedProduct.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Suggested Retail Price</span>
                  <p className="text-sm font-bold text-indigo-600">{formatPrice(selectedProduct.price)}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">In Stock status</span>
                  <p className="text-xs font-bold text-slate-800">{selectedProduct.stock_quantity} units on hand</p>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Specifications & Scope</span>
                <p className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed text-slate-700 font-normal">
                  {selectedProduct.description || 'No descriptive information currently provided.'}
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => {
                  setIsViewOpen(false);
                  setSelectedProduct(null);
                }}
                className="px-4 py-1.5 bg-white border border-slate-200 text-slate-600 font-semibold rounded-lg cursor-pointer hover:bg-slate-50 transition-all"
              >
                Close Specs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
