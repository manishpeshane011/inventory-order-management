import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import manishImage from "../assets/images/manish.jpg";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  ShoppingCart,
  Layers,
  Search,
  Bell,
  Menu,
  ChevronLeft,
  ChevronRight,
  Database,
  Wifi,
  WifiOff,
  Clock,
} from 'lucide-react';
import { useAppState } from '../context/AppContext';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { isOfflineMode, toast } = useAppState();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const location = useLocation();

  // Run a clock in top header
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Products', path: '/products', icon: ShoppingBag },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Orders', path: '/orders', icon: ShoppingCart },
    { name: 'Inventory', path: '/inventory', icon: Layers },
  ];

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#334155] font-sans flex flex-col antialiased">
      {/* Toast Alert Banner */}
      {toast && (
        <div 
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl transition-all duration-300 max-w-md animate-bounce ${
            toast.type === 'error' 
              ? 'bg-rose-50 text-rose-800 border border-rose-100' 
              : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      )}

      {/* Top Header Navbar */}
      <header id="top-navbar" className="sticky top-0 z-40 bg-white border-b border-slate-100 px-6 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-4">
          <button
            id="sidebar-toggle"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-500 transition-colors cursor-pointer"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              I
            </div>
            <div>
              <h1 className="text-base font-semibold text-slate-800 tracking-tight leading-none">Inventory </h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide mt-0.5 uppercase">Order Management System</p>
            </div>
          </div>

          {/* Connection Pill */}
          <div className="ml-4 hidden sm:flex">
            {isOfflineMode ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-100">
                <WifiOff className="w-3.5 h-3.5" />
                Demo Mode (Offline)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-100">
                <Wifi className="w-3.5 h-3.5" />
                Connected API
              </span>
            )}
          </div>
        </div>

        {/* Search Bar & Clock & Profile */}
        <div className="flex items-center gap-6">
          <div className="relative w-64 hidden md:block">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search everything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-700"
            />
          </div>

          {/* Time & Day Info */}
          <div className="hidden lg:flex items-center gap-2 text-slate-500 text-xs font-medium">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>{formattedDate}</span>
            <span className="text-slate-300">|</span>
            <span className="font-mono text-slate-600">{formattedTime}</span>
          </div>

          {/* User Profile Info */}
          <div className="flex items-center gap-3 border-l border-slate-100 pl-4">
            <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-xs font-semibold text-slate-800">Manish Peshan</span>
              <span className="text-[10px] text-slate-400 font-medium">Administrator</span>
            </div>
            <div className="relative">
             <img
  src={manishImage}
  alt="User Avatar"
  className="w-9 h-9 rounded-xl object-cover ring-2 ring-indigo-50"
/>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
          </div>
        </div>
      </header>

      {/* Frame Wrapper */}
      <div className="flex-1 flex overflow-hidden">
        {/* Responsive Sidebar */}
        <aside
          id="collapsible-sidebar"
          className={`bg-white border-r border-slate-100 flex flex-col justify-between transition-all duration-300 ease-in-out z-30 ${
            isSidebarOpen ? 'w-64' : 'w-20'
          }`}
        >
          {/* Navigation Links */}
          <nav className="p-4 flex flex-col gap-1.5">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <NavLink
                  id={`nav-item-${item.name.toLowerCase()}`}
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all group relative cursor-pointer ${
                      isActive
                        ? 'bg-indigo-50/70 text-indigo-700 font-semibold border-l-3 border-indigo-600 pl-2.5'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`
                  }
                >
                  <IconComponent
                    className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                      isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span className={`transition-opacity duration-300 whitespace-nowrap ${
                    isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
                  }`}>
                    {item.name}
                  </span>

                  {/* Tooltip in collapsed state */}
                  {!isSidebarOpen && (
                    <div className="absolute left-16 bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 shadow-md">
                      {item.name}
                    </div>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Lower Panel stats or toggle */}
          <div className="p-4 border-t border-slate-50">
            <div className={`p-3 bg-slate-50 rounded-xl ${isSidebarOpen ? 'block' : 'hidden'}`}>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-slate-400" />
                <span className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase">System Sync</span>
              </div>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium">
                {isOfflineMode 
                  ? 'Offline data sandbox. Changes stored locally.' 
                  : 'API sync active. Writing live database entries.'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="w-full text-center mt-3 cursor-pointer text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold py-1 border border-indigo-100 rounded-lg bg-white hover:bg-indigo-50/50 transition-all shadow-2xs"
              >
                Sync Reload
              </button>
            </div>
            
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors mt-2 cursor-pointer"
            >
              {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </aside>

        {/* Main Content Workspace Layout */}
        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
