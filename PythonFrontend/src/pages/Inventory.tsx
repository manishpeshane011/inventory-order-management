import React, { useState, useEffect } from 'react';
import {
  Layers,
  Search,
  TrendingUp,
  AlertTriangle,
  FileSpreadsheet,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import useInventory from '../hooks/useInventory';

export const Inventory: React.FC = () => {
  const { inventory, loading, fetchInventory } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'healthy' | 'warning' | 'critical'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Re-fetch on mount
  useEffect(() => {
    fetchInventory();
  }, []);

  // Filter dynamic inventory items local-bound
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          String(item.product_id).includes(searchQuery);
    
    if (!matchesSearch) return false;

    if (activeFilter === 'healthy') {
      return item.stock_quantity > 10;
    }
    if (activeFilter === 'warning') {
      return item.stock_quantity >= 5 && item.stock_quantity <= 10;
    }
    if (activeFilter === 'critical') {
      return item.stock_quantity < 5;
    }
    return true; // 'all'
  });

  // Derived dashboard metrics
  const totalItems = inventory.length;
  const totalStockVolume = inventory.reduce((sum, item) => sum + item.stock_quantity, 0);
  const criticalItemsCount = inventory.filter(item => item.stock_quantity < 5).length;
  const warningItemsCount = inventory.filter(item => item.stock_quantity >= 5 && item.stock_quantity <= 10).length;
  const healthyItemsCount = inventory.filter(item => item.stock_quantity > 10).length;

  // Pagination calculations
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInventory.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6">
      {/* Page Title & Refresher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Stock & On-Hand Inventory</h2>
          <p className="text-sm text-slate-500 mt-1">Review active quantities, stock levels, and critical depletion alarms.</p>
        </div>
        <button
          onClick={() => fetchInventory()}
          className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Registry
        </button>
      </div>

      {/* Stock Health Overview Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Total Stock Volume */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total On-Hand Units</span>
            <p className="text-xl font-bold text-slate-800">{totalStockVolume}</p>
          </div>
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Healthy Level Count */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Healthy Stocks (&gt; 10)</span>
            <p className="text-xl font-bold text-emerald-700">{healthyItemsCount}</p>
          </div>
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Warning Level Count */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Low Stock Warnings (5-10)</span>
            <p className="text-xl font-bold text-amber-700">{warningItemsCount}</p>
          </div>
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Critical Level Count */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Critical / Depleted (&lt; 5)</span>
            <p className="text-xl font-bold text-rose-700">{criticalItemsCount}</p>
          </div>
          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Filter and search box deck */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs">
        {/* Left Side: Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            id="inventory-search-input"
            type="text"
            placeholder="Search explicitly by Product name or ID..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset page numbers
            }}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-700"
          />
        </div>

        {/* Right Side: Categorized Tabs */}
        <div className="flex bg-slate-100/80 p-0.5 rounded-lg text-[11px] font-bold text-slate-500 w-full md:w-auto overflow-x-auto shrink-0">
          <button
            onClick={() => { setActiveFilter('all'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition-all whitespace-nowrap ${activeFilter === 'all' ? 'bg-white text-slate-800 shadow-3xs' : 'hover:text-slate-750'}`}
          >
            All Stocks ({totalItems})
          </button>
          <button
            onClick={() => { setActiveFilter('healthy'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition-all whitespace-nowrap ${activeFilter === 'healthy' ? 'bg-white text-emerald-800 shadow-3xs' : 'hover:text-slate-750'}`}
          >
            Healthy ({healthyItemsCount})
          </button>
          <button
            onClick={() => { setActiveFilter('warning'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition-all whitespace-nowrap ${activeFilter === 'warning' ? 'bg-white text-amber-800 shadow-3xs' : 'hover:text-slate-750'}`}
          >
            Low Warning ({warningItemsCount})
          </button>
          <button
            onClick={() => { setActiveFilter('critical'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition-all whitespace-nowrap ${activeFilter === 'critical' ? 'bg-white text-rose-800 shadow-3xs' : 'hover:text-slate-750'}`}
          >
            Critical ({criticalItemsCount})
          </button>
        </div>
      </div>

      {/* Main Table Screen */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
        {loading && inventory.length === 0 ? (
          <div className="py-24 text-center flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm font-medium text-slate-400">Loading live warehouse catalogs...</p>
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center max-w-sm mx-auto">
            <div className="w-14 h-14 bg-indigo-50 flex items-center justify-center rounded-2xl text-indigo-500 mb-4">
              <Layers className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No Inventory Items</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              No product entries match the selected filters or search terms. Try adjusting your query bounds!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 font-semibold tracking-wider text-xs">
                  <th className="px-6 py-4">Product ID Reference</th>
                  <th className="px-6 py-4">Catalog Product Name</th>
                  <th className="px-6 py-4 text-center">Color Status Warning</th>
                  <th className="px-6 py-4 text-right pr-12">Stock Volume Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium text-xs text-slate-700">
                {currentItems.map((item) => (
                  <tr key={item.product_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-slate-500 font-semibold">#PROD-0{item.product_id}</td>
                    <td id={`inventory-item-name-${item.product_id}`} className="px-6 py-4">
                      <div className="font-bold text-slate-800 text-sm">{item.name}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {/* COLOR INDICATORS as requested */}
                      {/* Green: Stock > 10 */}
                      {/* Yellow: Stock 5 to 10 */}
                      {/* Red: Stock < 5 */}
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border capitalize ${
                        item.stock_quantity > 10
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                          : item.stock_quantity >= 5
                          ? 'bg-amber-50 text-amber-850 border-amber-100'
                          : 'bg-rose-50 text-rose-800 border-rose-100'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          item.stock_quantity > 10 
                            ? 'bg-emerald-500' 
                            : item.stock_quantity >= 5 
                            ? 'bg-amber-500' 
                            : 'bg-rose-500'
                        }`} />
                        {item.stock_quantity > 10 ? 'Healthy Stock' : item.stock_quantity >= 5 ? 'Warning Level' : 'Depletion Alarm'}
                      </span>
                    </td>
                    <td id={`inventory-item-qty-${item.product_id}`} className="px-6 py-4 text-right pr-12 font-mono font-bold text-sm text-slate-805">
                      {item.stock_quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination indicators footer */}
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
    </div>
  );
};

export default Inventory;
