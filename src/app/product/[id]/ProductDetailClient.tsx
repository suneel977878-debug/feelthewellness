'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProductCard, { getProductBrand } from '../../../components/ProductCard';
import { useCart } from '../../../context/CartContext';
import { Product } from '../../../data/products';

export default function ProductDetailClient({ product, relatedProducts }: { product: Product, relatedProducts: Product[] }) {
  const router = useRouter();
  const { addToCart } = useCart();
  
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [addedNotification, setAddedNotification] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [isSafetyExpanded, setIsSafetyExpanded] = useState(false);

  // Generate the 4 gallery images for the product dynamically
  const galleryImages = useMemo(() => {
    if (!product || !product.images) return [];

    return product.images.map((imgUrl, idx) => ({
      src: imgUrl,
      style: {},
      label: idx === 0 ? 'Main View' : `View ${idx + 1}`
    }));
  }, [product]);

  // Reset active image index when product ID changes
  React.useEffect(() => {
    setActiveImageIndex(0);
  }, [product.id]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedNotification(true);
    setTimeout(() => {
      setAddedNotification(false);
    }, 3000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    router.push('/cart');
  };

  const incrementQty = () => setQuantity((q) => q + 1);
  const decrementQty = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const renderStars = (rating: number) => {
    const stars = [];
    const floor = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      if (i <= floor) {
        stars.push(<span key={i} className="star">★</span>);
      } else if (i - rating < 1) {
        stars.push(<span key={i} className="star half">★</span>);
      } else {
        stars.push(<span key={i} className="star empty">★</span>);
      }
    }
    return stars;
  };

  const descParts = product?.description ? product.description.split('\n\n') : [''];
  const shortDescription = descParts[0];

  return (
    <>
    <div className="product-detail-layout">
      
      {/* Breadcrumb */}
      <div className="breadcrumb-bar">
          <div className="container">
            <Link href="/" className="bread-link">Home</Link>
            <span className="bread-divider">/</span>
            <Link href="/catalog" className="bread-link">Catalog</Link>
            <span className="bread-divider">/</span>
            <Link href={`/catalog?category=${encodeURIComponent(product.category)}`} className="bread-link">{product.category}</Link>
            <span className="bread-divider">/</span>
            <span className="bread-current">{product.name}</span>
          </div>
        </div>

        {/* Main Product Showcase */}
        <section className="product-showcase-section">
          <div className="container showcase-grid">
            
            {/* Left: Product Visual & Gallery Viewport */}
            <div className="showcase-visual-area">
              {product.isBestSeller && <span className="badge badge-accent visual-badge">Bestseller</span>}
              {product.isNew && <span className="badge badge-new visual-badge">New</span>}
              {product.isOnSale && <span className="badge card-badge-sale visual-badge-sale">-{product.discountPercent}%</span>}
              
              {/* Main Viewport */}
              <div className="detail-photo-viewport flex-center">
                {galleryImages[activeImageIndex] && (
                  <div className="premium-image-wrapper">
                    <img 
                      src={galleryImages[activeImageIndex].src} 
                      alt={`${product.name} - ${galleryImages[activeImageIndex].label}`}
                      className="product-photo"
                        style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'contain',
                        mixBlendMode: 'multiply',
                        transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        ...galleryImages[activeImageIndex].style
                      }}
                    />
                    <div className="premium-vignette"></div>
                    <div className="premium-watermark">
                      <span className="watermark-text">FeelTheWellness</span>
                      <span className="watermark-sub">PRO COLLECTION</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Thumbnails Row */}
              <div className="gallery-thumbnails">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    className={`thumb-btn ${activeImageIndex === idx ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(idx)}
                    aria-label={`View ${img.label}`}
                  >
                    <div className="thumb-crop flex-center">
                      <img 
                        src={img.src} 
                        alt={img.label}
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'contain',
                          mixBlendMode: 'multiply'
                        }} 
                      />
                    </div>
                    <span className="thumb-label">{img.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Product Info & Actions */}
            <div className="showcase-details-area">
              <span className="detail-brand" style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--accent)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '8px',
                display: 'block'
              }}>{getProductBrand(product.id, product.category)}</span>
              <span className="detail-category">{product.category}</span>
              <h1 className="detail-title">{product.name}</h1>
              
              {/* Rating row */}
              <div className="detail-rating-row">
                <div className="detail-stars">{renderStars(product.rating)}</div>
                <span className="rating-value">{product.rating}</span>
                <span className="rating-divider">|</span>
                <span className="reviews-count">{product.reviews} verified reviews</span>
              </div>

              {/* Price */}
              <div className="detail-price-row">
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                  <span className="detail-price">₹{product.price.toLocaleString('en-IN')}</span>
                  {product.isOnSale && (
                    <span className="detail-original-price">
                      ₹{Math.round(product.price / (1 - (product.discountPercent || 0) / 100)).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                <span className="tax-inclusive">Inclusive of all local taxes</span>
              </div>

              {/* Specs bullet preview */}
              <div className="detail-preview-specs">
                <h3>Key Features</h3>
                <ul>
                  {product.features.map((feature, idx) => (
                    <li key={idx}>
                      <span className="bullet-bullet">✔</span> {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="detail-tagline" style={{ marginTop: '24px', lineHeight: '1.5' }}>{shortDescription}</p>

              {/* Quantity Selector & Add to Cart */}
              <div className="purchase-actions-area">
                <div className="qty-selector">
                  <button className="qty-btn" onClick={decrementQty} aria-label="Decrease quantity">−</button>
                  <span className="qty-val">{quantity}</span>
                  <button className="qty-btn" onClick={incrementQty} aria-label="Increase quantity">+</button>
                </div>

                <div className="add-to-cart-btn-group">
                  <button className="btn btn-primary add-to-cart-btn" onClick={handleAddToCart} style={{ flex: 1 }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="cart-add-icon">
                      <circle cx="9" cy="21" r="1"></circle>
                      <circle cx="20" cy="21" r="1"></circle>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    Add to Cart
                  </button>
                  
                  <button className="btn btn-secondary buy-now-btn" onClick={handleBuyNow} style={{ flex: 1, background: '#fff', color: '#000', border: 'none' }}>
                    Buy Now
                  </button>
                </div>
              </div>

              {/* Success Notification Banner */}
              {addedNotification && (
                <div className="added-banner">
                  <div className="added-content">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="tick-icon">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Item successfully added to cart.</span>
                  </div>
                  <Link href="/cart" className="view-cart-link" style={{ background: '#fff', color: '#000', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold', textDecoration: 'none' }}>
                    Checkout Now ➔
                  </Link>
                </div>
              )}

              {/* Discreet shipping promise */}
              <div className="shipping-promise-box">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="promise-icon">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="2" y1="10" x2="22" y2="10"></line>
                </svg>
                <div>
                  <strong>100% Privacy Guaranteed:</strong> Shipped in standard brown cardboard boxes with no mention of brand or products. Deliveries are discreetly handled by courier.
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Tabs section for detailed info */}
        <section className="product-tabs-section">
          <div className="container">
            <div className="tabs-header">
              <button 
                className={`tab-title-btn ${activeTab === 'description' ? 'active' : ''}`}
                onClick={() => setActiveTab('description')}
              >
                Intimate Care & Detail
              </button>
              <button 
                className={`tab-title-btn ${activeTab === 'safety' ? 'active' : ''}`}
                onClick={() => setActiveTab('safety')}
              >
                Hygiene & Safety Guide
              </button>
            </div>

            <div className="tab-content-area">
              {activeTab === 'description' && (
                <div className="tab-pane animate-fade-in">
                  <div style={{
                    maxHeight: isDescExpanded ? 'none' : '180px',
                    overflow: 'hidden',
                    position: 'relative',
                    maskImage: isDescExpanded ? 'none' : 'linear-gradient(to bottom, black 50%, transparent 100%)',
                    WebkitMaskImage: isDescExpanded ? 'none' : 'linear-gradient(to bottom, black 50%, transparent 100%)'
                  }}>
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', fontSize: '0.95rem', color: '#e0e0e0' }}>
                      {product.description}
                    </div>
                    <table className="specs-table">
                      <tbody>
                        <tr>
                          <th>Material</th>
                          <td>Medical-grade soft-touch silicone, ABS plastic core</td>
                        </tr>
                        <tr>
                          <th>Waterproof Rating</th>
                          <td>100% Waterproof (IPX7 rated, safe for bath and shower)</td>
                        </tr>
                        <tr>
                          <th>Charging Details</th>
                          <td>USB Magnetic rechargeable, 60 minutes run-time</td>
                        </tr>
                        <tr>
                          <th>Acoustics</th>
                          <td>Whisper quiet (under 45 decibels at max setting)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <button 
                    onClick={() => setIsDescExpanded(!isDescExpanded)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 'bold', marginTop: '15px', padding: 0 }}
                  >
                    {isDescExpanded ? 'Read Less ▲' : 'Read More ▼'}
                  </button>
                </div>
              )}

              {activeTab === 'safety' && (
                <div className="tab-pane animate-fade-in">
                  <div style={{
                    maxHeight: isSafetyExpanded ? 'none' : '130px',
                    overflow: 'hidden',
                    position: 'relative',
                    maskImage: isSafetyExpanded ? 'none' : 'linear-gradient(to bottom, black 40%, transparent 100%)',
                    WebkitMaskImage: isSafetyExpanded ? 'none' : 'linear-gradient(to bottom, black 40%, transparent 100%)'
                  }}>
                    <div className="safety-grid">
                      <div className="safety-card">
                        <h4>Intimate Lubricants</h4>
                        <p>Always pair silicone adult toys with premium water-based lubricants. Do not use silicone-based lubricants, as they will degrade the velvety satin coating of the product.</p>
                      </div>
                      <div className="safety-card">
                        <h4>Sanitization</h4>
                        <p>Clean thoroughly before and after every use. Use lukewarm water and mild antibacterial soap, or a specialized alcohol-free adult toy cleaning spray.</p>
                      </div>
                      <div className="safety-card">
                        <h4>Storage Conditions</h4>
                        <p>Store in a cool, dust-free place, away from direct sunlight. To preserve the hygiene of the item, store it in its original silk dust bag or separate from other toys.</p>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsSafetyExpanded(!isSafetyExpanded)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 'bold', marginTop: '15px', padding: 0 }}
                  >
                    {isSafetyExpanded ? 'Read Less ▲' : 'Read More ▼'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Related Products Collection */}
        {relatedProducts.length > 0 && (
          <section className="related-products-section">
            <div className="container">
              <h2 className="section-title">Related Intimate Delights</h2>
              <div className="related-grid">
                {relatedProducts.map((p) => (
                  <div key={p.id} className="related-item">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

      </div>

      <style jsx global>{`
        .product-detail-layout {
          background-color: var(--bg-primary);
        }

        .premium-image-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          border-radius: 12px;
          box-shadow: 0 0 25px rgba(255, 42, 133, 0.15);
          background: #fce4ec; /* Soft lustful pink to cover white bg */
        }
        
        .premium-vignette {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(circle at center, transparent 30%, rgba(200, 20, 100, 0.2) 100%);
          z-index: 2;
          border-radius: 12px;
        }

        .product-photo {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
          transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .premium-vignette {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 2;
          border-radius: 12px;
        }

        .premium-watermark {
          position: absolute;
          bottom: 20px;
          right: 20px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          pointer-events: none;
          z-index: 3;
          opacity: 0.65;
          text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }

        .watermark-text {
          font-family: var(--font-sans);
          font-size: 1.2rem;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.9);
          letter-spacing: 0.05em;
          line-height: 1.1;
        }

        .watermark-sub {
          font-family: var(--font-sans);
          font-size: 0.6rem;
          font-weight: 700;
          color: var(--accent);
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        .breadcrumb-bar {
          background: var(--bg-secondary);
          padding: 16px 0;
          font-size: 0.85rem;
          color: var(--text-muted);
          border-bottom: 1px solid var(--border-light);
        }

        .bread-link:hover {
          color: var(--accent);
        }

        .bread-divider {
          margin: 0 10px;
          opacity: 0.5;
        }

        .bread-current {
          color: var(--text-primary);
          font-weight: 500;
        }

        /* Showcase Grid */
        .product-showcase-section {
          padding: 48px 0;
        }

        .showcase-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 48px;
          align-items: start;
        }

        @media (min-width: 992px) {
          .showcase-grid {
            grid-template-columns: 1.1fr 1fr;
          }
        }

        .showcase-visual-area {
          display: flex;
          flex-direction: column;
          gap: 16px;
          position: relative;
          width: 100%;
        }

        .detail-photo-viewport {
          border: 1px solid rgba(255, 42, 133, 0.2);
          border-radius: var(--border-radius-lg);
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          width: 100%;
          padding: 0;
          background: #fce4ec;
          box-shadow: 0 0 30px rgba(255, 42, 133, 0.1);
        }
        
        @media (min-width: 768px) {
          .detail-photo-viewport {
            height: 400px;
          }
        }

        .visual-badge {
          position: absolute;
          top: 24px;
          left: 24px;
          z-index: 5;
        }

        .visual-badge-sale {
          position: absolute;
          top: 24px;
          right: 24px;
          z-index: 5;
          background: var(--accent);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 0 12px rgba(255, 42, 133, 0.4);
        }

        .gallery-thumbnails {
          display: flex;
          gap: 10px;
          justify-content: start;
          flex-wrap: wrap;
          width: 100%;
        }

        .thumb-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          padding: 6px;
          cursor: pointer;
          transition: var(--transition-smooth);
          width: 74px;
        }

        .thumb-btn:hover, .thumb-btn.active {
          border-color: var(--accent);
          box-shadow: 0 0 10px rgba(255, 42, 133, 0.2);
          background: var(--bg-tertiary);
        }

        .thumb-crop {
          width: 54px;
          height: 54px;
          overflow: hidden;
          border-radius: 4px;
          background: #fce4ec;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .thumb-crop img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scale(1.1);
        }

        .thumb-label {
          font-size: 0.55rem;
          color: var(--text-muted);
          text-align: center;
          white-space: nowrap;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 700;
        }

        .thumb-btn.active .thumb-label {
          color: var(--accent);
        }

        .showcase-details-area {
          display: flex;
          flex-direction: column;
        }

        .detail-category {
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--accent);
          letter-spacing: 0.08em;
          margin-bottom: 12px;
        }

        .detail-title {
          font-size: 2.2rem;
          font-weight: 400;
          line-height: 1.2;
          color: var(--text-primary);
          margin-bottom: 16px;
        }

        .detail-rating-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .detail-stars {
          color: #d4af37;
          font-size: 1.1rem;
        }

        .rating-value {
          font-weight: 600;
          color: var(--text-primary);
        }

        .rating-divider {
          color: var(--border-color);
        }

        .detail-price-row {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 24px;
          border-top: 1px solid var(--border-light);
          border-bottom: 1px solid var(--border-light);
          padding: 16px 0;
        }

        .detail-price {
          font-family: var(--font-serif);
          font-size: 2rem;
          font-weight: 400;
          color: var(--accent);
        }

        .detail-original-price {
          font-size: 1.1rem;
          color: var(--text-muted);
          text-decoration: line-through;
          font-family: var(--font-sans);
        }

        .tax-inclusive {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .detail-tagline {
          font-size: 1.05rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 28px;
          white-space: pre-wrap;
        }

        .detail-preview-specs {
          margin-bottom: 32px;
        }

        .detail-preview-specs h3 {
          font-family: var(--font-sans);
          font-size: 0.9rem;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--text-primary);
          margin-bottom: 12px;
          letter-spacing: 0.05em;
        }

        .detail-preview-specs ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .detail-preview-specs li {
          font-size: 0.9rem;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .bullet-bullet {
          color: var(--accent);
          font-size: 0.8rem;
        }

        /* Purchase Actions */
        .purchase-actions-area {
          display: flex;
          gap: 16px;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .add-to-cart-btn-group {
          display: flex;
          gap: 12px;
          flex-grow: 1;
          width: 100%;
          min-width: 250px;
        }

        .qty-selector {
          display: flex;
          align-items: center;
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
          border-radius: 30px;
          padding: 4px;
        }

        .qty-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition-fast);
          color: var(--text-secondary);
        }

        .qty-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--accent);
        }

        .qty-val {
          font-weight: 600;
          font-size: 1rem;
          width: 32px;
          text-align: center;
        }

        .add-to-cart-btn {
          flex-grow: 1;
          padding: 14px 28px;
          max-width: 320px;
        }

        /* Added Banner Notification */
        .added-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(50, 168, 82, 0.15);
          border: 1px solid rgba(50, 168, 82, 0.3);
          border-radius: var(--border-radius);
          padding: 14px 20px;
          margin-bottom: 24px;
          font-size: 0.9rem;
          animation: fadeIn 0.4s ease-out;
        }

        .added-content {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #8ce09c;
        }

        .tick-icon {
          flex-shrink: 0;
        }

        .view-cart-link {
          color: var(--accent);
          font-weight: 600;
        }

        .view-cart-link:hover {
          text-decoration: underline;
        }

        /* Shipping Box */
        .shipping-promise-box {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          border: 1px dashed var(--border-color);
          background: rgba(212, 175, 55, 0.02);
          border-radius: var(--border-radius);
          padding: 16px 20px;
          font-size: 0.82rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .promise-icon {
          color: var(--accent);
          flex-shrink: 0;
          margin-top: 2px;
        }

        /* Tabs Section */
        .product-tabs-section {
          padding: 64px 0;
          border-top: 1px solid var(--border-light);
          border-bottom: 1px solid var(--border-light);
          background: #08040a;
        }

        .tabs-header {
          display: flex;
          gap: 32px;
          border-bottom: 1px solid var(--border-light);
          margin-bottom: 32px;
        }

        .tab-title-btn {
          font-family: var(--font-serif);
          font-size: 1.25rem;
          color: var(--text-muted);
          padding-bottom: 16px;
          position: relative;
          transition: var(--transition-fast);
        }

        .tab-title-btn:hover, .tab-title-btn.active {
          color: var(--accent);
        }

        .tab-title-btn.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: var(--accent);
        }

        .tab-content-area {
          line-height: 1.8;
          font-size: 0.95rem;
          color: var(--text-secondary);
        }

        .tab-content-area p {
          margin-bottom: 20px;
        }

        .specs-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 32px;
          max-width: 600px;
        }

        .specs-table th, .specs-table td {
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid var(--border-light);
          font-size: 0.9rem;
        }

        .specs-table th {
          color: var(--text-primary);
          font-weight: 600;
          width: 200px;
          background: rgba(255, 255, 255, 0.01);
        }

        .specs-table td {
          color: var(--text-secondary);
        }

        .safety-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }

        @media (min-width: 768px) {
          .safety-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .safety-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          padding: 24px;
        }

        .safety-card h4 {
          font-family: var(--font-sans);
          font-size: 1rem;
          font-weight: 600;
          color: var(--accent);
          margin-bottom: 12px;
        }

        .safety-card p {
          font-size: 0.85rem;
          line-height: 1.6;
        }

        /* Related products */
        .related-products-section {
          padding: 64px 0 80px;
        }

        .section-title {
          font-size: 1.8rem;
          text-align: center;
          margin-bottom: 40px;
          color: var(--text-primary);
        }

        .related-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }

        @media (min-width: 480px) {
          .related-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 992px) {
          .related-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}</style>
    </>
  );
}
