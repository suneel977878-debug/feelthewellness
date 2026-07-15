'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';

export default function Header() {
  const { getCartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Load and apply theme on mount (prevents SSR hydration mismatch)
  useEffect(() => {
    // Anti-theft: prevent right-click on images only
    const handleContextMenu = (e: MouseEvent) => {
      if (e.target && (e.target as HTMLElement).tagName === 'IMG') {
        e.preventDefault();
      }
    };
    document.addEventListener("contextmenu", handleContextMenu);
    
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };

    const savedTheme = localStorage.getItem('feel_the_wellness_theme') as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('feel_the_wellness_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <header className="site-header">
      <div className="container header-container">
        <Link href="/" className="logo">
          FeelThe<span className="logo-accent">Wellness</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="desktop-nav">
          <Link href="/" className="nav-link">Home</Link>
          <Link href="/catalog?category=Women%20Sex%20Toys&subcategory=Vibrators%20%26%20Wands" className="nav-link">Vibrators</Link>
          <Link href="/catalog?category=Men%20Sex%20Toys" className="nav-link">Male Pleasure</Link>
          <Link href="/catalog?category=Couples%20Toys" className="nav-link">Couples</Link>
          <Link href="/catalog" className="nav-link">All Products</Link>
        </nav>

        <div className="header-actions">
          <button 
            className="theme-toggle-btn" 
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>

          <Link href="/cart" className="cart-btn" aria-label="Shopping Cart">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            {getCartCount() > 0 && (
              <span className="cart-badge">{getCartCount()}</span>
            )}
          </Link>

          <button 
            className="mobile-menu-toggle" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <nav className="mobile-nav">
            <Link href="/" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link href="/catalog?category=Women%20Sex%20Toys&subcategory=Vibrators%20%26%20Wands" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Vibrators & Wands</Link>
            <Link href="/catalog?category=Women%20Sex%20Toys&subcategory=Dildos" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Dildos & Realistic</Link>
            <Link href="/catalog?category=Men%20Sex%20Toys" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Male Pleasure</Link>
            <Link href="/catalog?category=Couples%20Toys" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Couple's Play</Link>
            <Link href="/catalog?category=BDSM%20%26%20Bondage" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>BDSM & Bondage</Link>
            <Link href="/catalog?category=Lingerie%20%26%20Clothing" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Lingerie & Wellness</Link>
            <Link href="/cart" className="mobile-nav-link cart-link" onClick={() => setMobileMenuOpen(false)}>
              Cart ({getCartCount()})
            </Link>
          </nav>
        </div>
      )}

      {/* CSS Styles for Header */}
      
    </header>
  );
}
