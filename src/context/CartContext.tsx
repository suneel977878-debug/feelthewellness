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

export interface PromoCode {
  id: string;
  code: string;
  discountPct: number;
  isActive: boolean;
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
  promos: PromoCode[];
  ageGateEnabled: boolean;
  storeUpiId: string;
  isLoaded: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function CartProvider({ children, initialConfig, initialPromos }: { children: React.ReactNode, initialConfig?: any, initialPromos?: PromoCode[] }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localstorage on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('feel_the_wellness_cart');
      if (storedCart) setCart(JSON.parse(storedCart));
    } catch (_) {}
    setIsLoaded(true);
  }, []);

  // Sync cart to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('feel_the_wellness_cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  // Cart Functions
  const addToCart = (product: Product, quantity: number = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { product, quantity }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
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
        promos: initialPromos || [],
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
