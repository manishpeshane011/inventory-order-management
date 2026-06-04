import React, { useState, useEffect } from 'react';
import {
  Plus,
  ShoppingCart,
  X,
  PlusCircle,
  Trash2,
  Calendar,
  DollarSign,
  User,
  Package,
  Eye,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import useOrders from '../hooks/useOrders';
import useCustomers from '../hooks/useCustomers';
import useProducts from '../hooks/useProducts';
import { Order, OrderItem, Product, Customer } from '../types';

interface OrderLineDraft {
  product_id: number;
  quantity: number;
  price: number;
  name: string;
  stock_quantity: number;
}

export const Orders: React.FC = () => {
  const { orders, loading: loadingOrds, fetchOrders, createOrder } = useOrders();
  const { customers, fetchCustomers, loading: loadingCusts } = useCustomers();
  const { products, fetchProducts, loading: loadingProds } = useProducts();

  // Modal Open togglers
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Selected for View-Details
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Form State drafts
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | string>('');
  const [orderLines, setOrderLines] = useState<OrderLineDraft[]>([
    { product_id: 0, quantity: 1, price: 0, name: '', stock_quantity: 0 }
  ]);
  const [formError, setFormError] = useState<string | null>(null);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Hydrate everything on mount
  useEffect(() => {
    fetchOrders();
    fetchCustomers();
    fetchProducts();
  }, []);

  // Recalculates draft totals dynamically
  const totalAmount = orderLines.reduce((sum, line) => sum + (line.price * line.quantity), 0);

  // Handle adding an order item row
  const addOrderLine = () => {
    setOrderLines(prev => [
      ...prev,
      { product_id: 0, quantity: 1, price: 0, name: '', stock_quantity: 0 }
    ]);
  };

  // Handle removing an order item row
  const removeOrderLine = (index: number) => {
    if (orderLines.length === 1) return; // Keep at least one line
    setOrderLines(prev => prev.filter((_, i) => i !== index));
  };

  // Handle changing an item row values
  const handleLineChange = (index: number, productId: number) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    setOrderLines(prev => prev.map((line, i) => {
      if (i === index) {
        return {
          product_id: productId,
          quantity: 1, // Reset to 1 on select
          price: prod.price,
          name: prod.name,
          stock_quantity: prod.stock_quantity,
        };
      }
      return line;
    }));
  };

  // Handle changing quantity on a row
  const handleQuantityChange = (index: number, quantity: number) => {
    setOrderLines(prev => prev.map((line, i) => {
      if (i === index) {
        return { ...line, quantity: Math.max(1, quantity) };
      }
      return line;
    }));
  };

  // Form Submission
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedCustomerId) {
      setFormError('Please select a customer profile for this shipment.');
      return;
    }

    // Filter invalid product lines
    const validLines = orderLines.filter(lines => lines.product_id > 0);
    if (validLines.length === 0) {
      setFormError('Please add at least one catalog item line to the order.');
      return;
    }

    // Double-check stock limit client-side before submission
    for (const line of validLines) {
      if (line.stock_quantity < line.quantity) {
        // MATCH EXACT INSUFFICIENT STOCK TRIGGER
        const stockErr = 'Insufficient stock for product';
        setFormError(`${stockErr}: "${line.name}" only has ${line.stock_quantity} units remaining.`);
        return;
      }
    }

    setSubmittingOrder(true);
    const payloadItems = validLines.map(line => ({
      product_id: line.product_id,
      quantity: line.quantity,
    }));

    const result = await createOrder(Number(selectedCustomerId), payloadItems);
    setSubmittingOrder(false);

    if (result.success) {
      // Re-hydrate components & close Dialog
      setIsCreateOpen(false);
      setSelectedCustomerId('');
      setOrderLines([{ product_id: 0, quantity: 1, price: 0, name: '', stock_quantity: 0 }]);
    } else {
      // If error occurs from API (e.g. insufficient stock because product depleted elsewhere)
      setFormError(result.message);
    }
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'June 4, 2026';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Purchase & Sales Orders</h2>
          <p className="text-sm text-slate-500 mt-1">Manage purchase orders and generate invoices instantly.</p>
        </div>
        <button
          id="btn-new-order"
          onClick={() => {
            setFormError(null);
            setIsCreateOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Order
        </button>
      </div>

      {/* Main Table Screen */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
        {loadingOrds && orders.length === 0 ? (
          <div className="py-24 text-center flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm font-medium text-slate-400">Loading sales journal logs...</p>
          </div>
        ) : orders.length === 0 ? (
          <div id="orders-empty-state" className="py-20 text-center flex flex-col items-center max-w-sm mx-auto">
            <div className="w-14 h-14 bg-indigo-50 flex items-center justify-center rounded-2xl text-indigo-500 mb-4">
              <ShoppingCart className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No Sales Orders Logs</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              No orders have been recorded in this sequence system. Go ahead and generate an order!
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="mt-6 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl text-xs font-semibold cursor-pointer transition-all"
            >
              Place First Order
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 font-semibold tracking-wider text-xs">
                  <th className="px-6 py-4">Invoice Ledger</th>
                  <th className="px-6 py-4">Client Representative</th>
                  <th className="px-6 py-4">Items Subtotal Log</th>
                  <th className="px-6 py-4">Placement Date</th>
                  <th className="px-6 py-4">Fulfillment Status</th>
                  <th className="px-6 py-4 text-right pr-8">Grand Total</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium text-xs text-slate-700">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                    <td id={`order-id-${o.id}`} className="px-6 py-4 font-mono text-slate-500 font-bold">#ORD-0{o.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 text-sm">{o.customer_name || `Business Client #${o.customer_id}`}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium text-[11px] max-w-xs truncate">
                      {(o.items || []).map(it => `${it.name || `Prod #${it.product_id}`} (x${it.quantity})`).join(', ')}
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-normal">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-slate-300shrink-0" />
                        <span>{formatDate(o.order_date)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3 text-indigo-550" />
                        {o.status || 'PLACED'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right pr-8 text-sm font-bold text-slate-800">
                      {formatPrice(o.total_amount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        id={`btn-view-order-${o.id}`}
                        onClick={() => {
                          setSelectedOrder(o);
                          setIsDetailOpen(true);
                        }}
                        className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-850 rounded-lg cursor-pointer transition-all"
                        title="Review Packing Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DIALOG SHEET: NEW ORDER */}
      {isCreateOpen && (
        <div id="create-order-modal" className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh]">
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-indigo-600 animate-pulse" />
                Draft New Invoice Order Placement
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePlaceOrder} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs font-semibold">
              
              {/* Form Failure Alert Box */}
              {formError && (
                <div id="order-error-toast" className="bg-rose-50 border border-rose-100 text-rose-800 p-3.5 rounded-xl flex items-start gap-2.5 animate-bounce">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <p className="font-semibold text-rose-750 text-[11px] leading-relaxed">{formError}</p>
                </div>
              )}

              {/* Customer selection dropdown */}
              <div className="space-y-1.5">
                <label className="text-slate-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Purchaser / Customer Profile Coordinates *
                </label>
                <select
                  id="form-order-customer-select"
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg bg-slate-50/50 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-700"
                >
                  <option value="">-- Choose registered customer representative --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Multiple Item List Builder */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                  <label className="text-slate-500 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-slate-400" />
                    Specify Ordered Item Lines *
                  </label>
                  <button
                    id="btn-add-item-row"
                    type="button"
                    onClick={addOrderLine}
                    className="inline-flex items-center gap-1 text-indigo-650 hover:text-indigo-800 text-[11px] font-bold cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Add Item Line
                  </button>
                </div>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {orderLines.map((line, idx) => (
                    <div key={idx} className="flex gap-3 items-end p-3 bg-slate-50 rounded-xl border border-slate-100 flex-wrap sm:flex-nowrap">
                      
                      {/* Product Selector */}
                      <div className="space-y-1 w-full sm:flex-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Article</span>
                        <select
                          id={`form-order-product-select-${idx}`}
                          value={line.product_id || ''}
                          onChange={(e) => handleLineChange(idx, Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none text-slate-705 text-xs"
                        >
                          <option value="">-- Choose catalog item --</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({formatPrice(p.price)}) - Stock: {p.stock_quantity}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity display */}
                      <div className="space-y-1 w-24">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Quantity</span>
                        <input
                          id={`form-order-quantity-input-${idx}`}
                          type="number"
                          value={line.product_id > 0 ? line.quantity : ''}
                          disabled={line.product_id === 0}
                          onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                          min={1}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none text-slate-800 text-xs disabled:bg-slate-100"
                        />
                      </div>

                      {/* Line subtotal */}
                      <div className="space-y-1 w-32 hidden sm:block">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Line Subtotal</span>
                        <div className="py-1.5 font-bold text-slate-755 text-right font-mono text-xs">
                          {formatPrice(line.price * line.quantity)}
                        </div>
                      </div>

                      {/* Line dynamic stock remaining alert indicators */}
                      {line.product_id > 0 && line.stock_quantity < line.quantity && (
                        <div className="w-full text-rose-600 text-[10px] font-bold flex items-center gap-1 mt-1 shrink-0">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Insufficient stock! Only {line.stock_quantity} units left.</span>
                        </div>
                      )}

                      {/* Delete Line buttons */}
                      <button
                        type="button"
                        onClick={() => removeOrderLine(idx)}
                        disabled={orderLines.length === 1}
                        className="p-1.5 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg shrink-0 disabled:opacity-30 disabled:pointer-events-none cursor-pointer mb-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                    </div>
                  ))}
                </div>
              </div>

              {/* Summary calculations card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 text-slate-600 space-y-2 font-medium shrink-0">
                <div className="flex justify-between text-[11px]">
                  <span>Items Subtotal:</span>
                  <span className="font-mono">{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>CGST & SGST (Inclusive):</span>
                  <span className="font-mono">₹0</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-800 text-sm">
                  <span>Grand Total Payable:</span>
                  <span className="font-mono text-indigo-650 text-base">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 flex-row shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-order"
                  type="submit"
                  disabled={submittingOrder}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer shadow-xs hover:shadow-md transition-all flex items-center gap-2"
                >
                  {submittingOrder && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Place Order Invoice
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* DIALOG SHEET: REVIEW ORDER INVOICE */}
      {isDetailOpen && selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Review Packing Packing ID: ORD-0{selectedOrder.id}</h3>
                <span className="text-[10px] text-slate-400 font-medium">Placed on {formatDate(selectedOrder.order_date)}</span>
              </div>
              <button onClick={() => {
                setIsDetailOpen(false);
                setSelectedOrder(null);
              }} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs font-medium text-slate-600">
              
              {/* Customer Coordinates */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 font-semibold">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Client Recipient Coordinates</div>
                <p className="text-sm font-bold text-slate-800 leading-none">{selectedOrder.customer_name || 'Business Partner'}</p>
                <div className="text-[11px] text-slate-500 font-normal space-y-0.5">
                  <p>Customer ID Reference: #CL-{selectedOrder.customer_id}</p>
                  <p>Invoiced Status: {selectedOrder.status || 'PLACED'}</p>
                </div>
              </div>

              {/* Items Table details */}
              <div className="space-y-2">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Invoiced Packing Slips</div>
                <div className="border border-slate-100 rounded-xl overflow-hidden bg-white">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] uppercase font-bold px-4 py-2.5">
                        <th className="px-4 py-2.5">Product Name</th>
                        <th className="px-4 py-2.5 text-center">Qty</th>
                        <th className="px-4 py-2.5 text-right">Unit Price</th>
                        <th className="px-4 py-2.5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(selectedOrder.items || []).map((it, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/20 text-xs text-slate-700">
                          <td className="px-4 py-2.5 font-bold text-slate-800">{it.name || `Product ID ${it.product_id}`}</td>
                          <td className="px-4 py-2.5 text-center font-bold">{it.quantity}</td>
                          <td className="px-4 py-2.5 text-right text-slate-500">{formatPrice(it.price || 0)}</td>
                          <td className="px-4 py-2.5 text-right font-bold text-slate-850">
                            {formatPrice((it.price || 0) * it.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total calculations display */}
              <div className="flex justify-between items-baseline border-t border-slate-100 pt-4 px-1 flex-row">
                <span className="text-slate-500 text-xs font-semibold">Grand Total:</span>
                <span className="text-base font-bold font-mono text-indigo-650">{formatPrice(selectedOrder.total_amount)}</span>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => {
                  setIsDetailOpen(false);
                  setSelectedOrder(null);
                }}
                className="px-4 py-1.5 bg-white border border-slate-200 text-slate-600 font-semibold rounded-lg cursor-pointer hover:bg-slate-50 transition-all shadow-2xs"
              >
                Close Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
