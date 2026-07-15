'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '../data/products';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

// Map products to realistic brand labels based on id/category
export const getProductBrand = (id: number, category: string) => {
  const brands = ['SATISFYER', 'FEELTHEWELLNESS', 'FIFTY SHADES OF GREY', 'ROCKS OFF', 'LELO', 'SANGYA'];
  if (category === 'Vibrators & Wands') return brands[id % 2 === 0 ? 0 : 4];
  if (category === 'Dildos & Realistic') return brands[1];
  if (category === 'Male Pleasure') return brands[id % 2 === 0 ? 3 : 1];
  if (category === "Couple's Play") return brands[4];
  if (category === 'BDSM & Bondage') return brands[2];
  return brands[id % brands.length];
};

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const floor = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      if (i <= floor) {
        stars.push(<span key={i} className="star filled">★</span>);
      } else if (i - rating < 1) {
        stars.push(<span key={i} className="star half">★</span>);
      } else {
        stars.push(<span key={i} className="star empty">★</span>);
      }
    }
    return stars;
  };

  const imageUrl = product.images[0];
  const brandName = getProductBrand(product.id, product.category);
  
  // Original crossed out price calculation
  const originalPrice = Math.round(product.price / (1 - (product.discountPercent || 0) / 100));

  // Determine top-right label
  const getBadgeStatus = () => {
    if (product.isBestSeller) return <span className="card-badge-status badge-bestseller">BEST SELLER</span>;
    if (product.isNew) return <span className="card-badge-status badge-new-status">NEW 💅</span>;
    return <span className="card-badge-status badge-hot-deal">HOT DEAL 🔥</span>;
  };

  return (
    <Link href={`/product/${product.id}`} className="product-card">
      <div className="product-image-area">
        {/* Top-left negative discount pill */}
        {Boolean(product.isOnSale) && (
          <span className="card-badge-discount">-{product.discountPercent}%</span>
        )}
        
        {/* Top-right status badge */}
        {getBadgeStatus()}
        
        {/* Realistic image photo wrapper */}
        <div className="product-photo-wrapper">
          <Image 
            src={imageUrl || '/hero.png'} 
            alt={product.name || 'Product'} 
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="product-photo"
          />
          <div className="premium-vignette"></div>
          <div className="premium-watermark">
            <span className="watermark-text">FeelTheWellness</span>
            <span className="watermark-sub">PRO COLLECTION</span>
          </div>
        </div>
        
        {/* Bottom pink slide overlay */}
        <div className="view-product-overlay">
          VIEW PRODUCT
        </div>

        {/* Floating Quick Add Icon Button */}
        <button 
          type="button"
          className="quick-add-icon-btn" 
          onClick={handleQuickAdd}
          aria-label={`Add ${product.name} to Cart`}
          title="Quick Add to Cart"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>

      <div className="product-info-area">
        {/* Brand label in small uppercase letters */}
        <span className="product-brand">{brandName}</span>
        
        {/* Product Title */}
        <h3 className="product-title">{product.name}</h3>
        
        {/* Stars & verified reviews */}
        <div className="product-rating-row">
          <div className="stars-container">{renderStars(product.rating)}</div>
          <span className="reviews-count">{product.reviews}</span>
        </div>

        {/* Pricing Layout: original on left (crossed out), sale price on right (larger, bold) */}
        <div className="product-price-row">
          {Boolean(product.isOnSale) && (
            <span className="product-original-price">
              ₹{originalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          )}
          <span className="product-price">
            ₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Shipping details footer */}
        <div className="shipping-row">
          <span className="shipping-origin">Ships from 🇮🇳</span>
          <span className="shipping-eta">🕒 2-3 Days Delivery</span>
        </div>
      </div>

      
    </Link>
  );
}
