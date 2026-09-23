import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  Boxes, 
  Settings, 
  LogOut, 
  Store, 
  Menu, 
  X,
  ChevronRight
} from 'lucide-react';

export default function AdminLayout({ children, activeTitle = 'Operations' }) {
  const { adminUser, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Orders', to: '/admin/orders', icon: ShoppingBag },
    { label: 'Products', to: '/admin/products', icon: Package },
    { label: 'Customers', to: '/admin/customers', icon: Users },
    { label: 'Inventory', to: '/admin/inventory', icon: Boxes },
    { label: 'Settings', to: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAF7] flex flex-col md:flex-row">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:w-64 lg:w-72 bg-white border-r border-gray-200/80 flex-col justify-between p-5 z-20">
        <div className="space-y-6">
          
          {/* Logo Brand Header */}
          <div className="px-1 py-1">
            <Link to="/admin" className="block">
              <img
                src="/logo.png"
                alt="Amsterdam Group - Moving Together"
                className="h-9 w-auto object-contain mb-1"
              />
            </Link>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block pl-0.5">
              Admin Console
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all ${
                      isActive
                        ? 'bg-amsterdam-olive text-white shadow-sm font-semibold'
                        : 'text-gray-600 hover:bg-amsterdam-muted/70 hover:text-amsterdam-dark'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Admin Profile & Storefront Link */}
        <div className="pt-4 border-t border-gray-100 space-y-3">
          
          <Link
            to="/"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gray-50 hover:bg-amsterdam-muted text-gray-700 text-xs font-semibold transition-colors border border-gray-200/60"
          >
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-amsterdam-olive" />
              <span>Back to Storefront</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          </Link>

          {/* User badge */}
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="min-w-0">
              <span className="font-bold text-xs text-amsterdam-dark block truncate">
                {adminUser?.name || 'Administrator'}
              </span>
              <span className="text-[10px] text-gray-400 block truncate">
                {adminUser?.email}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-gray-400 hover:text-amsterdam-red hover:bg-red-50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </aside>

      {/* Mobile Header Bar */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Amsterdam Group"
            className="h-7 w-auto object-contain"
          />
        </div>

        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileSidebarOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 p-4 space-y-2 z-30 shadow-md">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                    isActive ? 'bg-amsterdam-olive text-white' : 'text-gray-700 hover:bg-amsterdam-muted'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <Link to="/" className="text-xs font-semibold text-amsterdam-olive flex items-center gap-1.5">
              <Store className="w-4 h-4" />
              <span>View Storefront</span>
            </Link>
            <button onClick={handleLogout} className="text-xs font-semibold text-red-600 flex items-center gap-1">
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top bar on Desktop */}
        <header className="hidden md:flex h-16 bg-white border-b border-gray-200/80 items-center justify-between px-8 z-10">
          <div>
            <h1 className="font-display font-bold text-lg text-amsterdam-dark">
              {activeTitle}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amsterdam-muted text-amsterdam-olive-dark hover:bg-amsterdam-lime/20 text-xs font-semibold transition-colors"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Live Storefront</span>
            </Link>
            <div className="h-4 w-px bg-gray-200"></div>
            <span className="text-xs text-gray-500 font-medium">
              Tanzania Standard Time (EAT)
            </span>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

      </div>

    </div>
  );
}
