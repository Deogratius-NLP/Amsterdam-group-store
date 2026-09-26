import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'amsterdam_cart_items';

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load cart from storage', e);
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartAnimationTrigger, setCartAnimationTrigger] = useState(0);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to storage', e);
    }
  }, [cartItems]);

  const getItemPrice = (product, pricingMode, selectedPackage = null) => {
    const isWholesale = (pricingMode || '').toUpperCase() === 'WHOLESALE';
    if (selectedPackage) {
      if (isWholesale) {
        return parseFloat(selectedPackage.wholesale_price) || parseFloat(selectedPackage.retail_price) || 0;
      }
      return parseFloat(selectedPackage.retail_price) || 0;
    }
    if (isWholesale) {
      return parseFloat(product.wholesale_price) || parseFloat(product.price) || 0;
    }
    return parseFloat(product.retail_price) || parseFloat(product.price) || 0;
  };

  const addToCart = (product, quantity = 1, pricingMode = 'RETAIL', selectedPackage = null) => {
    if (!product || product.stock_quantity <= 0) return false;

    const isWholesale = (pricingMode || '').toUpperCase() === 'WHOLESALE';
    const wholesaleMin = product.wholesale_minimum_quantity || 10;
    const initialQty = isWholesale ? Math.max(quantity, wholesaleMin) : Math.max(1, quantity);

    const packageId = selectedPackage?.id || null;
    const packageName = selectedPackage?.package_name || null;

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => 
          item.product.id === product.id && 
          item.pricingMode === pricingMode && 
          (item.package_id || null) === packageId
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        const existingItem = updated[existingIndex];
        const newQty = Math.min(product.stock_quantity, existingItem.quantity + quantity);
        updated[existingIndex] = {
          ...existingItem,
          quantity: newQty,
          product, // refresh product metadata
          selectedPackage: selectedPackage || existingItem.selectedPackage,
          package_id: packageId,
          package_name: packageName,
        };
        return updated;
      } else {
        return [
          ...prevItems,
          {
            product,
            quantity: Math.min(product.stock_quantity, initialQty),
            pricingMode,
            selectedPackage,
            package_id: packageId,
            package_name: packageName,
            addedAt: Date.now(),
          },
        ];
      }
    });

    // Trigger bounce animation on FAB
    setCartAnimationTrigger((prev) => prev + 1);
    return true;
  };

  const updateQuantity = (productId, pricingMode, packageIdOrQty, maybeQty) => {
    const packageId = maybeQty !== undefined ? packageIdOrQty : null;
    const newQuantity = maybeQty !== undefined ? maybeQty : packageIdOrQty;

    setCartItems((prevItems) => {
      return prevItems
        .map((item) => {
          const matchPkg = packageId !== null ? (item.package_id || null) === packageId : true;
          if (item.product.id === productId && item.pricingMode === pricingMode && matchPkg) {
            const isWholesale = (pricingMode || '').toUpperCase() === 'WHOLESALE';
            const minQty = isWholesale ? (item.product.wholesale_minimum_quantity || 10) : 1;
            const maxQty = item.product.stock_quantity || 9999;

            if (newQuantity <= 0) {
              return null; // marked for deletion
            }

            const clampedQty = Math.min(maxQty, Math.max(minQty, newQuantity));
            return {
              ...item,
              quantity: clampedQty,
            };
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const removeFromCart = (productId, pricingMode, packageId = null) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => {
        if (item.product.id !== productId || item.pricingMode !== pricingMode) return true;
        if (packageId !== null && (item.package_id || null) !== packageId) return true;
        return false;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  // Totals calculations
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalUniqueItems = cartItems.length;

  const totalAmount = cartItems.reduce((acc, item) => {
    const price = getItemPrice(item.product, item.pricingMode, item.selectedPackage);
    return acc + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        openCart,
        closeCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItemsCount,
        totalUniqueItems,
        totalAmount,
        getItemPrice,
        cartAnimationTrigger,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
