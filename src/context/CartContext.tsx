'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../data/products';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface PaytmConfig {
  mid: string;
  merchantKey: string;
  website: string;
  channelId: string;
  environment: 'SIMULATED' | 'STAGE' | 'PROD';
}

interface StoreContextType {
  // Cart features
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;

  // Settings & Promos
  paytmConfig: PaytmConfig;
  ageGateEnabled: boolean;
  storeUpiId: string;
  isLoaded: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function CartProvider({ children, initialConfig }: { children: React.ReactNode, initialConfig?: any }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localstorage on mount & sync across tabs
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('feel_the_wellness_cart');
      if (storedCart) setCart(JSON.parse(storedCart));
    } catch (_) {}
    setIsLoaded(true);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'feel_the_wellness_cart') {
        try {
          setCart(e.newValue ? JSON.parse(e.newValue) : []);
        } catch (_) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Sync cart to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('feel_the_wellness_cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  // Cart Functions
  const addToCart = (product: Product, quantity: number = 1) => {
    if (isNaN(quantity) || quantity <= 0) return;
    const cleanQty = Math.floor(quantity);
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + cleanQty }
            : item
        );
      }
      return [...prevCart, { product, quantity: cleanQty }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (isNaN(quantity) || quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const cleanQty = Math.floor(quantity);
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId ? { ...item, quantity: cleanQty } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    const sum = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
    return Math.round(sum * 100) / 100;
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <StoreContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        paytmConfig: initialConfig?.paytmConfig || { mid: '', merchantKey: '', website: 'DEFAULT', channelId: 'WEB', environment: 'SIMULATED' },
        ageGateEnabled: initialConfig?.ageGateEnabled ?? true,
        storeUpiId: initialConfig?.storeUpiId || 'luxurydiscreet@ybl',
        isLoaded
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useCart() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a StoreContext / CartProvider');
  }
  return context;
}
