import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SettingsProvider } from './context/SettingsContext';
import ProtectedRoute from './components/admin/ProtectedRoute';

// Public Storefront
import StorefrontPage from './pages/StorefrontPage';

// Admin Operations
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import OrdersPage from './pages/admin/OrdersPage';
import ProductsPage from './pages/admin/ProductsPage';
import CustomersPage from './pages/admin/CustomersPage';
import InventoryPage from './pages/admin/InventoryPage';
import SettingsPage from './pages/admin/SettingsPage';

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <CartProvider>
          <Routes>
          {/* Customer Storefront (Canva Recreation) */}
          <Route path="/" element={<StorefrontPage />} />

        {/* Administrator Authentication */}
        <Route path="/admin/login" element={<LoginPage />} />

        {/* Protected Administrator Dashboard & Modules */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute>
              <ProductsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/customers"
          element={
            <ProtectedRoute>
              <CustomersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/inventory"
          element={
            <ProtectedRoute>
              <InventoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </CartProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
