import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Users,
  ShoppingCart,
  Layers,
  ArrowUpRight,
  AlertTriangle,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import useProducts from '../hooks/useProducts';
import useCustomers from '../hooks/useCustomers';
import useOrders from '../hooks/useOrders';
import useInventory from '../hooks/useInventory';

export const Dashboard: React.FC = () => {
  const { products, fetchProducts, loading: loadingProds } = useProducts();
  const { customers, fetchCustomers, loading: loadingCusts } = useCustomers();
  const { orders, fetchOrders, loading: loadingOrds } = useOrders();
  const { inventory, fetchInventory, loading: loadingInv } = useInventory();

  // Load everything on initial render
  useEffect(() => {
    fetchProducts();
    fetchCustomers();
    fetchOrders();
    fetchInventory();
  }, []);

  const totalProducts = (products || []).length;
  const totalCustomers = (customers || []).length;
  const totalOrders = (orders || []).length;
  const totalInventoryCount = (inventory || []).reduce((acc, curr) => acc + curr.stock_quantity, 0);

  // Deriving visual stats and financial valuations
  const totalValuation = (products || []).reduce((acc, p) => acc + (p.price * p.stock_quantity), 0);
  const formattedValuation = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(totalValuation);

  // Get Low Stock Items list
  const lowStockItems = (inventory || []).filter(item => item.stock_quantity < 5);

  // Prepare chart data for Inventory Levels
  // Pull top 6 items to make the chart look pristine
  const inventoryChartData = (inventory || []).slice(0, 6).map(item => ({
    name: item.name.length > 15 ? `${item.name.substring(0, 15)}...` : item.name,
    Quantity: item.stock_quantity,
  }));

  // Prepare order data for visual charts
  const ordersChartData = (orders || []).map((o, idx) => ({
    order: `Order #${o.id}`,
    Value: o.total_amount,
  })).reverse();

  const loading = loadingProds || loadingCusts || loadingOrds || loadingInv;

  // Render Skeletons during initial state fetches
  if (loading && totalProducts === 0) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div>
          <div className="h-7 w-48 bg-slate-200 rounded-md"></div>
          <div className="h-4 w-64 bg-slate-100 rounded-md mt-2"></div>
        </div>
        {/* Stat Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-2xl h-32 border border-slate-100"></div>
          ))}
        </div>
        {/* Visual Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl h-80 border border-slate-100"></div>
          <div className="bg-white rounded-2xl h-80 border border-slate-100"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Dynamic Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Enterprise Overview</h2>
        <p className="text-sm text-slate-500 mt-1">
          Monitor your real-time performance indicators and inventory health.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Products Card */}
        <div id="stat-card-products" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Products</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-800">{totalProducts}</span>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center bg-emerald-50 px-1.5 py-0.5 rounded-md">
                +12%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Distinct catalog items</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Total Customers Card */}
        <div id="stat-card-customers" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Customers</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-800">{totalCustomers}</span>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center bg-emerald-50 px-1.5 py-0.5 rounded-md">
                +4%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Registered business partners</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-all duration-300">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Total Orders Card */}
        <div id="stat-card-orders" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Orders</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-800">{totalOrders}</span>
              <span className="text-[10px] text-indigo-600 font-semibold flex items-center bg-indigo-50 px-1.5 py-0.5 rounded-md">
                Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Customer purchase orders</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
            <ShoppingCart className="w-6 h-6" />
          </div>
        </div>

        {/* Inventory Items Count Card */}
        <div id="stat-card-inventory" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Inventory Count</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-800">{totalInventoryCount}</span>
              <span className="text-[10px] text-amber-600 font-semibold flex items-center bg-amber-50 px-1.5 py-0.5 rounded-md">
                In Stock
              </span>
            </div>
            <div className="flex items-center gap-1 font-mono text-[10px] text-indigo-600 mt-0.5">
              <span>Valued at</span>
              <span className="font-semibold">{formattedValuation}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Side: Stock Level Chart */}
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Critical Stock Health</h3>
              <p className="text-xs text-slate-400">Total volume remaining per catalog product</p>
            </div>
            <Link to="/inventory" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              Analyze Inventory
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-64" style={{ minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Bar dataKey="Quantity" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={34} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Side: Order Value Area Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Order Revenue Flow</h3>
              <p className="text-xs text-slate-400">Volume distribution of historic placements</p>
            </div>
            <Link to="/orders" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              All Orders
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-64" style={{ minWidth: 0 }}>
            {ordersChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ordersChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="order" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  />
                  <Area type="monotone" dataKey="Value" stroke="#10B981" fillOpacity={0.12} fill="url(#colorValue)" strokeWidth={2} />
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <span>No order data available</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Low Stock Alerts & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Side: Shortage Alerts */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Shortage Alerts (Stock &lt; 5)
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                {lowStockItems.length} Warnings
              </span>
            </div>
            
            {lowStockItems.length > 0 ? (
              <div className="divide-y divide-slate-50 max-h-56 overflow-y-auto pr-1">
                {lowStockItems.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-700">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Prod ID: #{item.product_id}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center justify-center text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.stock_quantity === 0 
                          ? 'bg-rose-100 text-rose-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.stock_quantity === 0 ? 'Out of Stock' : `${item.stock_quantity} Left`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-xs font-medium text-slate-400">All inventory items are healthy!</p>
              </div>
            )}
          </div>

          <Link
            to="/inventory"
            className="w-full text-center mt-4 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 py-2.5 rounded-xl transition-all border border-slate-100 cursor-pointer"
          >
            Manage Inventory
          </Link>
        </div>

        {/* Right Side: Recent Orders Summary list */}
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">Latest Shipments & Orders</h3>
            <span className="text-xs text-slate-400">Showing last 4 logs</span>
          </div>

          {(orders || []).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-50 text-slate-400 font-semibold tracking-wider pb-2">
                    <th className="pb-3 pt-0">Order ID</th>
                    <th className="pb-3 pt-0">Purchaser</th>
                    <th className="pb-3 pt-0">Items</th>
                    <th className="pb-3 pt-0 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50/50">
                  {(orders || []).slice(0, 4).map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-2.5 font-mono font-medium text-slate-600">#{order.id}</td>
                      <td className="py-2.5 font-medium text-slate-800">{order.customer_name || 'Business Partner'}</td>
                      <td className="py-2.5 text-slate-500">
                        {(order.items || []).map(it => `${it.name || 'Product'} (x${it.quantity})`).join(', ')}
                      </td>
                      <td className="py-2.5 text-right font-semibold text-slate-800">
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(order.total_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-xs font-medium text-slate-400">No orders logged.</p>
              <Link to="/orders" className="text-indigo-600 font-semibold text-xs mt-2 inline-block cursor-pointer">Place an order</Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
