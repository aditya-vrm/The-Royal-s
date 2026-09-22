'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useVenue } from './VenueContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { venue } = useVenue();
  const [items, setItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage based on active venue
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && venue) {
        const saved = localStorage.getItem(`theroyals_cart_${venue}`);
        if (saved) {
          setItems(JSON.parse(saved));
        } else {
          setItems([]);
        }
      }
    } catch (e) {
      console.warn('Error reading cart:', e);
    } finally {
      setIsLoaded(true);
    }
  }, [venue]);

  // Persist cart to localStorage whenever it changes
  const saveCart = (newItems) => {
    setItems(newItems);
    if (typeof window !== 'undefined' && venue) {
      localStorage.setItem(`theroyals_cart_${venue}`, JSON.stringify(newItems));
    }
  };

  const addItem = (menuItem) => {
    const effectivePrice = menuItem.discountPrice || menuItem.price;
    const existingIndex = items.findIndex((i) => i.menuItem === menuItem._id);

    let updated;
    if (existingIndex > -1) {
      updated = items.map((item, idx) => {
        if (idx === existingIndex) {
          return { ...item, qty: item.qty + 1 };
        }
        return item;
      });
    } else {
      updated = [
        ...items,
        {
          menuItem: menuItem._id,
          name: menuItem.name,
          price: effectivePrice,
          originalPrice: menuItem.price,
          discountPrice: menuItem.discountPrice,
          qty: 1,
          type: menuItem.type || 'veg',
          image: menuItem.image,
          description: menuItem.description,
          notes: '',
        },
      ];
    }
    saveCart(updated);
  };

  const updateQty = (menuItemId, newQty) => {
    if (newQty <= 0) {
      removeItem(menuItemId);
      return;
    }
    const updated = items.map((item) => {
      if (item.menuItem === menuItemId) {
        return { ...item, qty: newQty };
      }
      return item;
    });
    saveCart(updated);
  };

  const removeItem = (menuItemId) => {
    const updated = items.filter((item) => item.menuItem !== menuItemId);
    saveCart(updated);
  };

  const updateItemNotes = (menuItemId, notes) => {
    const updated = items.map((item) => {
      if (item.menuItem === menuItemId) {
        return { ...item, notes };
      }
      return item;
    });
    saveCart(updated);
  };

  const getItemQty = (menuItemId) => {
    const found = items.find((i) => i.menuItem === menuItemId);
    return found ? found.qty : 0;
  };

  const clearCart = () => {
    saveCart([]);
  };

  const itemCount = items.reduce((acc, item) => acc + item.qty, 0);
  const subtotal = items.reduce((acc, item) => acc + item.price * item.qty, 0);
  const originalSubtotal = items.reduce((acc, item) => acc + (item.originalPrice || item.price) * item.qty, 0);
  const totalSavings = originalSubtotal > subtotal ? originalSubtotal - subtotal : 0;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQty,
        removeItem,
        updateItemNotes,
        getItemQty,
        clearCart,
        itemCount,
        subtotal,
        originalSubtotal,
        totalSavings,
        isLoaded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
