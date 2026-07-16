'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProductCard from '../../components/ProductCard';
import { useCart, PromoCode } from '../../context/CartContext';
import { createOrder } from '../actions/orders';

export default function CartPage() {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, getCartTotal, getCartCount, paytmConfig, storeUpiId, promos, isLoaded } = useCart();

  // Checkout shipping states
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [zipCode, setZipCode] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Manual UPI States
  const [paymentApp, setPaymentApp] = useState<'paytm' | 'gpay' | 'phonepe'>('phonepe');
  const [utrNumber, setUtrNumber] = useState('');

  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState('');

  const shippingFee = getCartTotal() >= 3000 ? 0 : 150;
  const discountAmount = appliedPromo ? Math.round((getCartTotal() * appliedPromo.discountPct) / 100) : 0;
  const orderTotal = getCartTotal() - discountAmount + shippingFee;

  const handleApplyPromo = () => {
    setPromoError('');
    const promo = promos.find(p => p.code === promoInput.trim().toUpperCase());
    if (promo && promo.isActive) {
      setAppliedPromo(promo);
      setPromoInput('');
    } else {
      setPromoError('Invalid or inactive promo code.');
    }
  };

  const getAppDeepLink = () => {
    const params = `?pa=${storeUpiId}&pn=FeelTheWellness&am=${orderTotal}&cu=INR`;
    if (paymentApp === 'phonepe') return `phonepe://pay${params}`;
    if (paymentApp === 'paytm') return `paytmmp://pay${params}`;
    if (paymentApp === 'gpay') return `tez://upi/pay${params}`;
    return `upi://pay${params}`;
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validations
    if (!fullName || !phoneNumber || !address || !city || !stateName || !zipCode) {
      setErrorMsg('Please fill in all shipping details before proceeding.');
      return;
    }

    if (!/^\d{10}$/.test(phoneNumber.trim())) {
      setErrorMsg('Please enter a valid 10-digit phone number.');
      return;
    }

    if (!/^\d{6}$/.test(zipCode.trim())) {
      setErrorMsg('Please enter a valid 6-digit Indian PIN/ZIP code.');
      return;
    }

    if (!/^\d{12}$/.test(utrNumber.trim())) {
      setErrorMsg('Please enter a valid 12-digit UTR or Reference Number from your UPI App.');
      return;
    }

    setIsSubmitting(true);

    try {
      // We create the order in the database immediately as PENDING.
      // This prevents data loss if localStorage is cleared.
      const orderId = `LP-ORD-REG-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      await createOrder({
        orderId: orderId,
        amount: orderTotal,
        status: 'PENDING',
        utr: utrNumber.trim(),
        paymentApp: paymentApp,
        customer: {
          name: fullName,
          phone: phoneNumber,
          address: `${address}, ${city}, ${stateName} - ${zipCode}`
        },
        items: cart.map(item => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity
        }))
      });

      // Pass the PENDING status directly to the success page
      const queryParams = new URLSearchParams({
        orderId: orderId,
        amount: orderTotal.toString(),
        status: 'PENDING',
        method: 'UPI',
        utr: utrNumber.trim(),
        app: paymentApp
      });

      router.push(`/payment-status?${queryParams.toString()}`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred during payment processing. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <div className="cart-page-layout">
        <section className="cart-section-main">
          <div className="container">
            <h1 className="cart-page-title glow-text">Your Intimacy Basket</h1>
            
            {!isLoaded ? (
              <div className="flex-center" style={{ minHeight: '40vh', flexDirection: 'column', gap: '20px' }}>
                <div className="spinner"></div>
              </div>
            ) : cart.length > 0 ? (
              <div className="cart-flex-container">
                {/* Left: Cart Items list */}
                <div className="cart-items-column">
                  <div className="cart-card">
                    <div className="cart-card-header">
                      <span>Products ({getCartCount()})</span>
                      <Link href="/catalog" className="continue-shopping">➔ Continue Shopping</Link>
                    </div>

                    <div className="cart-items-list">
                      {cart.map((item) => (
                        <div key={item.product.id} className="cart-item-row">
                          {/* Item visual */}
                          <div className="cart-item-visual" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img 
                              src={item.product.images?.[0] || '/hero.webp'} 
                              alt={item.product.name} 
                              style={{ 
                                width: '64px', 
                                height: '64px', 
                                objectFit: 'contain',
                                borderRadius: '4px'
                              }}
                            />
                          </div>

                          {/* Item Details */}
                          <div className="cart-item-details">
                            <Link href={`/product/${item.product.id}`} className="cart-item-name">
                              {item.product.name}
                            </Link>
                            <span className="cart-item-category">{item.product.category}</span>
                            <span className="cart-item-unit-price">₹{item.product.price.toLocaleString('en-IN')} each</span>
                          </div>

                          {/* Item Quantity control */}
                          <div className="cart-item-qty">
                            <div className="qty-selector mini-qty">
                              <button className="qty-btn" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>−</button>
                              <span className="qty-val">{item.quantity}</span>
                              <button className="qty-btn" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>+</button>
                            </div>
                          </div>

                          {/* Total Price & Delete */}
                          <div className="cart-item-actions">
                            <span className="cart-item-total-price">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</span>
                            <button className="delete-item-btn" onClick={() => removeFromCart(item.product.id)} aria-label="Remove item">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Discreet delivery message */}
                  <div className="delivery-promise-card">
                    <div className="promise-title-row">
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                      </svg>
                      <h3>Hygiene & Delivery Guarantee</h3>
                    </div>
                    <p>
                      All purchases are processed with absolute confidentiality. Products are enclosed in soft, protective layers and packed in brown corrugated outer cartons. The shipping label lists "LP Logistics" as sender, with no mention of sex toys. We guarantee 100% hygiene: items are vacuum sealed and non-returnable once opened.
                    </p>
                  </div>
                </div>

                {/* Right: Checkout Address Form & Summary */}
                <div className="checkout-summary-column">
                  {/* Shipping Form */}
                  <div className="checkout-card form-card">
                    <h3>Discreet Shipping Address</h3>
                    {errorMsg && <div className="checkout-error">{errorMsg}</div>}
                    
                    <form onSubmit={handleCheckoutSubmit}>
                      <div className="form-group">
                        <label className="form-label" htmlFor="fullname">Full Name</label>
                        <input
                          id="fullname"
                          type="text"
                          className="form-input"
                          placeholder="e.g. Sahil Sharma"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="phone">Phone Number</label>
                        <input
                          id="phone"
                          type="tel"
                          className="form-input"
                          placeholder="10-digit mobile number"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          maxLength={10}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="street">Street Address</label>
                        <input
                          id="street"
                          type="text"
                          className="form-input"
                          placeholder="House No, Apartment, Locality"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-row-grid">
                        <div className="form-group">
                          <label className="form-label" htmlFor="city">City</label>
                          <input
                            id="city"
                            type="text"
                            className="form-input"
                            placeholder="e.g. New Delhi"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label" htmlFor="state">State</label>
                          <input
                            id="state"
                            type="text"
                            className="form-input"
                            placeholder="e.g. Delhi"
                            value={stateName}
                            onChange={(e) => setStateName(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="zip">ZIP / PIN Code</label>
                        <input
                          id="zip"
                          type="text"
                          className="form-input"
                          placeholder="6-digit ZIP code"
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          maxLength={6}
                          required
                        />
                      </div>

                      {/* Manual UPI Payment Section */}
                      <div className="upi-payment-section">
                        <h4>1. Select your UPI App</h4>
                        <div className="upi-app-selectors">
                          <label className={`upi-app-card ${paymentApp === 'phonepe' ? 'selected' : ''}`}>
                            <input type="radio" name="paymentApp" value="phonepe" checked={paymentApp === 'phonepe'} onChange={() => setPaymentApp('phonepe')} />
                            <span className="app-icon phonepe">पे</span>
                            <span className="app-name">PhonePe</span>
                          </label>
                          <label className={`upi-app-card ${paymentApp === 'gpay' ? 'selected' : ''}`}>
                            <input type="radio" name="paymentApp" value="gpay" checked={paymentApp === 'gpay'} onChange={() => setPaymentApp('gpay')} />
                            <span className="app-icon gpay">G</span>
                            <span className="app-name">GPay</span>
                          </label>
                          <label className={`upi-app-card ${paymentApp === 'paytm' ? 'selected' : ''}`}>
                            <input type="radio" name="paymentApp" value="paytm" checked={paymentApp === 'paytm'} onChange={() => setPaymentApp('paytm')} />
                            <span className="app-icon paytm">₹</span>
                            <span className="app-name">Paytm</span>
                          </label>
                        </div>
                        
                        <div className="upi-app-action-btn" style={{ marginBottom: '24px' }}>
                          <a href={getAppDeepLink()} className="btn btn-primary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                            Open {paymentApp === 'phonepe' ? 'PhonePe' : paymentApp === 'gpay' ? 'GPay' : 'Paytm'} & Pay ₹{orderTotal.toLocaleString('en-IN')}
                          </a>
                          <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                            (If you are on a mobile device, tapping this button will autofill the details in your app)
                          </p>
                        </div>
                        
                        <div className="upi-payment-instructions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                          <h4>2. Or Scan QR / Send via UPI ID</h4>
                          <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', margin: '16px 0', display: 'inline-block', border: '2px solid var(--accent-gold)' }}>
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${storeUpiId}&pn=FeelTheWellness&am=${orderTotal}&cu=INR`)}`} 
                              alt="Scan to pay" 
                              style={{ width: '180px', height: '180px', display: 'block' }} 
                            />
                          </div>
                          <p style={{ margin: '8px 0 16px', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>UPI ID:</p>
                          <div className="upi-id-box" style={{ width: '100%', maxWidth: '350px' }}>
                            <span className="upi-id-text">{storeUpiId}</span>
                            <button type="button" className="copy-btn" onClick={(e) => {
                              e.preventDefault();
                              navigator.clipboard.writeText(storeUpiId);
                              alert('UPI ID Copied!');
                            }}>Copy</button>
                          </div>
                        </div>

                        <div className="upi-utr-section">
                          <h4>3. Verify Payment</h4>
                          <label className="form-label" htmlFor="utr">Enter 12-digit UTR / Reference Number</label>
                          <input
                            id="utr"
                            type="text"
                            className="form-input utr-input"
                            placeholder="e.g. 325419472918"
                            value={utrNumber}
                            onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, '').substring(0, 12))}
                            required
                          />
                        </div>
                      </div>

                      {/* Promo Code Section */}
                      <div className="promo-code-section" style={{ marginTop: '24px', padding: '16px 0', borderTop: '1px solid var(--border-light)' }}>
                        <h4 style={{ marginBottom: '12px', fontSize: '0.95rem' }}>Apply Promo Code</h4>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input 
                            type="text" 
                            className="form-input" 
                            style={{ textTransform: 'uppercase' }} 
                            placeholder="Enter code" 
                            value={promoInput}
                            onChange={(e) => setPromoInput(e.target.value)}
                          />
                          <button type="button" className="btn btn-secondary" onClick={handleApplyPromo}>Apply</button>
                        </div>
                        {promoError && <p style={{ color: '#ff3366', fontSize: '0.8rem', marginTop: '8px' }}>{promoError}</p>}
                        {appliedPromo && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', padding: '8px 12px', background: 'rgba(212, 175, 55, 0.1)', border: '1px solid var(--accent)', borderRadius: '4px' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>Code <strong>{appliedPromo.code}</strong> applied! ({appliedPromo.discountPct}% OFF)</span>
                            <button type="button" onClick={() => setAppliedPromo(null)} style={{ background: 'none', border: 'none', color: '#ff3366', cursor: 'pointer', fontSize: '0.8rem' }}>Remove</button>
                          </div>
                        )}
                      </div>

                      {/* Total calculations */}
                      <div className="order-summary-box">
                        <div className="summary-row">
                          <span>Basket Subtotal</span>
                          <span>₹{getCartTotal().toLocaleString('en-IN')}</span>
                        </div>
                        {appliedPromo && (
                          <div className="summary-row" style={{ color: 'var(--accent)' }}>
                            <span>Discount ({appliedPromo.discountPct}%)</span>
                            <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        <div className="summary-row">
                          <span>Discreet Shipping</span>
                          <span>{shippingFee === 0 ? <strong className="free-text">FREE</strong> : `₹${shippingFee}`}</span>
                        </div>
                        <div className="summary-row divider">
                          <span>Total Amount</span>
                          <span className="final-price">₹{orderTotal.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        className="btn btn-primary checkout-btn" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-mini"></span>
                            Verifying...
                          </>
                        ) : (
                          <>
                            Place Order
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty Cart state */
              <div className="empty-cart-card flex-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="empty-cart-icon">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <h2>Your Intimacy Basket is Empty</h2>
                <p>Indulge yourself by browsing our selection of luxury vibrators, realistic dildos, strokers, and BDSM restraints.</p>
                <Link href="/catalog" className="btn btn-primary">
                  Explore Intimate Catalog
                </Link>
              </div>
            )}

          </div>
        </section>
      </div>
      <Footer />

      <style jsx global>{`
        .cart-page-layout {
          background: var(--bg-primary);
          min-height: 80vh;
        }

        .cart-section-main {
          padding: 48px 0 80px;
        }

        .cart-page-title {
          font-size: 2.2rem;
          margin-bottom: 32px;
          text-align: center;
        }

        /* Cart Grid Layout */
        .cart-flex-container {
          display: flex;
          flex-direction: column;
          gap: 32px;
          align-items: start;
        }

        @media (min-width: 992px) {
          .cart-flex-container {
            flex-direction: row;
          }
        }

        .cart-items-column {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        @media (min-width: 992px) {
          .cart-items-column {
            flex: 1.4;
          }
        }

        .checkout-summary-column {
          width: 100%;
        }

        @media (min-width: 992px) {
          .checkout-summary-column {
            flex: 1;
            position: sticky;
            top: 100px;
          }
        }

        /* Cart card list */
        .cart-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          overflow: hidden;
        }

        .cart-card-header {
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-light);
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 600;
          color: var(--text-primary);
        }

        .continue-shopping {
          color: var(--accent);
          font-size: 0.85rem;
          font-weight: 500;
        }

        .continue-shopping:hover {
          text-decoration: underline;
        }

        .cart-items-list {
          display: flex;
          flex-direction: column;
        }

        .cart-item-row {
          display: grid;
          grid-template-columns: 80px 1fr;
          gap: 20px;
          padding: 24px;
          border-bottom: 1px solid var(--border-light);
          align-items: center;
        }

        @media (min-width: 600px) {
          .cart-item-row {
            grid-template-columns: 80px 2fr 1.2fr 1fr;
          }
        }

        .cart-item-row:last-child {
          border-bottom: none;
        }

        .cart-item-visual {
          background: rgba(10, 5, 13, 0.4);
          border-radius: var(--border-radius);
          display: flex;
          align-items: center;
          justify-content: center;
          height: 80px;
          border: 1px solid var(--border-light);
        }

        .cart-item-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .cart-item-name {
          font-size: 1.05rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .cart-item-name:hover {
          color: var(--accent);
        }

        .cart-item-category {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }

        .cart-item-unit-price {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .mini-qty {
          border-color: var(--border-light);
        }

        .mini-qty .qty-btn {
          width: 28px;
          height: 28px;
        }

        .mini-qty .qty-val {
          font-size: 0.9rem;
          width: 24px;
        }

        .cart-item-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        @media (min-width: 600px) {
          .cart-item-actions {
            justify-content: flex-end;
            gap: 24px;
          }
        }

        .cart-item-total-price {
          font-family: var(--font-serif);
          font-size: 1.15rem;
          color: var(--accent);
          font-weight: 500;
        }

        .delete-item-btn {
          color: var(--text-muted);
          transition: var(--transition-fast);
          padding: 6px;
          display: flex;
        }

        .delete-item-btn:hover {
          color: var(--accent-secondary);
          background: rgba(255, 255, 255, 0.03);
          border-radius: 50%;
        }

        /* Delivery promise card */
        .delivery-promise-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          padding: 24px;
        }

        .promise-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .promise-title-row h3 {
          font-family: var(--font-sans);
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .delivery-promise-card p {
          font-size: 0.85rem;
          line-height: 1.6;
          color: var(--text-secondary);
        }

        /* Checkout shipping card */
        .checkout-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          padding: 32px 24px;
        }

        .checkout-card h3 {
          font-family: var(--font-sans);
          font-size: 1.1rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--accent);
          margin-bottom: 24px;
          border-bottom: 1px solid var(--border-light);
          padding-bottom: 12px;
        }

        .checkout-error {
          background: rgba(240, 128, 128, 0.15);
          border: 1px solid rgba(240, 128, 128, 0.3);
          color: var(--accent-secondary);
          padding: 12px 16px;
          border-radius: var(--border-radius);
          font-size: 0.85rem;
          margin-bottom: 20px;
        }

        .form-row-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        @media (min-width: 768px) {
          .form-row-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .payment-method-badge {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-light);
          padding: 12px;
          border-radius: 8px;
          font-size: 0.82rem;
          color: var(--text-secondary);
          margin: 24px 0 20px;
        }

        .order-summary-box {
          border-top: 1px solid var(--border-light);
          padding-top: 20px;
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .free-text {
          color: #8ce09c;
        }

        .summary-row.divider {
          border-top: 1px solid var(--border-light);
          padding-top: 16px;
          margin-top: 4px;
          color: var(--text-primary);
          font-weight: 600;
        }

        .final-price {
          font-family: var(--font-serif);
          font-size: 1.5rem;
          color: var(--accent);
        }

        .checkout-btn {
          width: 100%;
          padding: 16px 28px;
          font-size: 1rem;
          letter-spacing: 0.08em;
        }

        .spinner-mini {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          display: inline-block;
          margin-right: 8px;
        }

        /* Empty Cart State */
        .empty-cart-card {
          flex-direction: column;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          padding: 80px 24px;
          text-align: center;
          gap: 20px;
          max-width: 600px;
          margin: 0 auto;
        }

        .empty-cart-icon {
          color: var(--text-muted);
        }

        .empty-cart-card h2 {
          font-size: 1.8rem;
          color: var(--text-primary);
        }

        .empty-cart-card p {
          max-width: 440px;
          margin-bottom: 12px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(212, 175, 55, 0.1);
          border-radius: 50%;
          border-top-color: var(--accent);
          animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
