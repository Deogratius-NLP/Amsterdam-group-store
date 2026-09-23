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

  const getItemPrice = (product, pricingMode) => {
    const isWholesale = (pricingMode || '').toUpperCase() === 'WHOLESALE';
    if (isWholesale) {
      return parseFloat(product.wholesale_price) || parseFloat(product.price) || 0;
    }
    return parseFloat(product.retail_price) || parseFloat(product.price) || 0;
  };

  const addToCart = (product, quantity = 1, pricingMode = 'RETAIL') => {
    if (!product || product.stock_quantity <= 0) return false;

    const isWholesale = (pricingMode || '').toUpperCase() === 'WHOLESALE';
    const wholesaleMin = product.wholesale_minimum_quantity || 10;
    const initialQty = isWholesale ? Math.max(quantity, wholesaleMin) : Math.max(1, quantity);

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.product.id === product.id && item.pricingMode === pricingMode
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        const existingItem = updated[existingIndex];
        const newQty = Math.min(product.stock_quantity, existingItem.quantity + quantity);
        updated[existingIndex] = {
          ...existingItem,
          quantity: newQty,
          product, // refresh product metadata
        };
        return updated;
      } else {
        return [
          ...prevItems,
          {
            product,
            quantity: Math.min(product.stock_quantity, initialQty),
            pricingMode,
            addedAt: Date.now(),
          },
        ];
      }
    });

    // Trigger bounce animation on FAB
    setCartAnimationTrigger((prev) => prev + 1);
    return true;
  };

  const updateQuantity = (productId, pricingMode, newQuantity) => {
    setCartItems((prevItems) => {
      return prevItems
        .map((item) => {
          if (item.product.id === productId && item.pricingMode === pricingMode) {
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

  const removeFromCart = (productId, pricingMode) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.product.id === productId && item.pricingMode === pricingMode)
      )
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
    const price = getItemPrice(item.product, item.pricingMode);
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
