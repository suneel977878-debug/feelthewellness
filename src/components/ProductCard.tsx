'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '../data/products';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}



export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addToCart } = useCart();

  const [isAdded, setIsAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
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

  const imageUrl = product.images?.[0];

  const discountPct = product.discountPercent || 0;
  const originalPrice = discountPct > 0 ? Math.round(product.price / (1 - discountPct / 100)) : product.price;
  const savedAmount = originalPrice - product.price;

  // Render stacked badges — both show if product qualifies for both
  const renderBadges = () => (
    <div className="card-badges-stack">
      {Boolean(product.isBestSeller) && (
        <span className="card-badge-status badge-bestseller">BEST SELLER</span>
      )}
      {Boolean(product.isNew) && (
        <span className="card-badge-status badge-new-status">NEW 💅</span>
      )}
      {!Boolean(product.isBestSeller) && !Boolean(product.isNew) && (
        <span className="card-badge-status badge-hot-deal">HOT DEAL 🔥</span>
      )}
    </div>
  );

  return (
    <Link href={`/product/${product.id}`} className="product-card">
      <div className="product-image-area">
        {/* Top-left discount badge — professional two-line style */}
        {Boolean(product.isOnSale) && discountPct > 0 && (
          <div className="card-badge-discount">
            <span className="discount-save">SAVE ₹{savedAmount.toLocaleString('en-IN')}</span>
            <span className="discount-pct">{discountPct}% OFF</span>
          </div>
        )}

        {/* Top-right stacked status badges */}
        {renderBadges()}

        {/* Realistic image photo wrapper */}
        <div className="product-photo-wrapper">
          <Image
            src={imageUrl || '/hero.webp'}
            alt={product.name || 'Product'}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="product-photo"
            style={{ 
              objectFit: 'contain',
              transform: `scale(${product.defaultZoom || 1.0})`,
              transformOrigin: `${product.defaultZoomX || 50}% ${product.defaultZoomY || 50}%`
            }}
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
          className={`quick-add-icon-btn ${isAdded ? 'added' : ''}`}
          onClick={handleQuickAdd}
          aria-label={`Add ${product.name} to Cart`}
          title="Quick Add to Cart"
        >
          {isAdded ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          )}
        </button>
      </div>

      <div className="product-info-area">
        {/* Brand label in small uppercase letters */}
        <span className="product-brand">FeelTheWellness</span>
        
        {/* Product Title */}
        <h3 className="product-title">{product.name}</h3>
        
        {/* Stars & verified reviews */}
        <div className="product-rating-row">
          <div className="stars-container">{renderStars(product.rating)}</div>
          <span className="reviews-count">{product.reviews}</span>
        </div>

        {/* Pricing Layout: original on left (crossed out), sale price on right (larger, bold) */}
        <div className="product-price-row">
          {Boolean(product.isOnSale) && discountPct > 0 && (
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
