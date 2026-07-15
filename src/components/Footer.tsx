'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      {/* Trust Badges Bar */}
      <div className="trust-bar">
        <div className="container trust-container">
          <div className="trust-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="trust-icon">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="2" y1="10" x2="22" y2="10"></line>
              <line x1="12" y1="10" x2="12" y2="21"></line>
            </svg>
            <div>
              <h4>100% Discreet Shipping</h4>
              <p>Shipped in unmarked, plain packaging with neutral sender details.</p>
            </div>
          </div>

          <div className="trust-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="trust-icon">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <div>
              <h4>Paytm Secured Checkout</h4>
              <p>Encrypted transactions via Paytm Business gateway.</p>
            </div>
          </div>

          <div className="trust-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="trust-icon">
              <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zM9 7a3 3 0 0 1 6 0v3H9V7z"></path>
            </svg>
            <div>
              <h4>Body Safe & Certified</h4>
              <p>100% medical-grade silicone, hypoallergenic, phthalate-free.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="footer-main">
        <div className="container footer-grid">
          <div className="footer-brand-col">
            <span className="footer-logo">FeelThe<span className="logo-accent">Wellness</span></span>
            <div className="footer-pitch-container">
              <span className="footer-pitch-tag">Sophisticated Intimacy</span>
              <h4 className="footer-pitch-title">Designed for Absolute Gratification</h4>
              <p className="brand-pitch">
                We believe that pleasure is an art form. Our selection represents the pinnacle of technology and elegance: whisper-quiet motors, deep rumbling frequencies, medical-grade materials, and shapes that fit you perfectly. Indulge your body in a symphony of sensations.
              </p>
            </div>
            <div className="adult-warning">
              <span className="warning-badge">18+</span>
              <span>Intended for adult audiences only. Play responsibly.</span>
            </div>
          </div>

          <div className="footer-links-col">
            <h3>Intimate Collections</h3>
            <ul>
              <li><Link href="/catalog?category=Women%20Sex%20Toys&subcategory=Vibrators%20%26%20Wands">Vibrators & Wands</Link></li>
              <li><Link href="/catalog?category=Women%20Sex%20Toys&subcategory=Dildos">Dildos & Realistic</Link></li>
              <li><Link href="/catalog?category=Men%20Sex%20Toys">Male Pleasure & Strokers</Link></li>
              <li><Link href="/catalog?category=Couples%20Toys">Couple's Intimacy</Link></li>
              <li><Link href="/catalog?category=Couples%20Toys&subcategory=Bondage%20%26%20BDSM">Bondage & BDSM</Link></li>
              <li><Link href="/catalog?category=Lingerie%20%26%20Clothing">Lingerie & Oils</Link></li>
              <li><Link href="/catalog?category=Supplements%20%26%20Condoms">Supplements & Condoms</Link></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h3>Customer Service</h3>
            <ul>
              <li><Link href="/support/delivery">Discreet Delivery Guide</Link></li>
              <li><Link href="/support/returns">Return Policy (Hygiene Guaranteed)</Link></li>
              <li><Link href="/support/product-care">Product Care & Hygiene</Link></li>
              <li><Link href="/support/faq">FAQ</Link></li>
              <li><Link href="/support/contact">Contact Intimacy Experts</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Bottom copyright */}
      <div className="footer-bottom">
        <div className="container footer-bottom-container">
          <p>&copy; {new Date().getFullYear()} FeelTheWellness. All rights reserved.</p>
          <div className="footer-legal-links">
            <Link href="/support/privacy">Privacy Policy</Link>
            <Link href="/support/terms">Terms & Conditions</Link>
            <Link href="/support/disclaimer">Disclaimer</Link>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .site-footer {
          background: var(--bg-primary);
          border-top: 1px solid var(--border-color);
          margin-top: auto;
        }

        .trust-bar {
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-light);
          padding: 32px 0;
        }

        .trust-container {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
        }

        @media (min-width: 768px) {
          .trust-container {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .trust-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .trust-icon {
          color: var(--accent);
          flex-shrink: 0;
        }

        .trust-item h4 {
          font-family: var(--font-sans);
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 4px;
          color: var(--text-primary);
        }

        .trust-item p {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .footer-main {
          padding: 64px 0 48px;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 48px;
        }

        @media (min-width: 768px) {
          .footer-grid {
            grid-template-columns: 2fr 1fr 1fr;
          }
        }

        .footer-brand-col {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .footer-logo {
          font-family: var(--font-serif);
          font-size: 1.8rem;
          color: var(--text-primary);
        }
        @media (min-width: 768px) {
          .footer-logo { font-size: 2.2rem; }
        }

        .footer-pitch-container {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .footer-pitch-tag {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--accent);
          font-weight: 600;
        }

        .footer-pitch-title {
          font-size: 1.15rem;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .brand-pitch {
          font-size: 0.95rem;
          color: var(--text-secondary);
          max-width: 440px;
          line-height: 1.6;
        }

        .adult-warning {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.8rem;
          color: var(--text-muted);
          border: 1px solid var(--border-light);
          padding: 10px 16px;
          border-radius: var(--border-radius);
          background: var(--bg-secondary);
        }

        .warning-badge {
          background: #8b0000;
          color: white;
          font-weight: bold;
          font-size: 0.75rem;
          padding: 3px 6px;
          border-radius: 4px;
          border: 1px solid red;
        }

        .footer-links-col h3 {
          font-size: 1.1rem;
          font-weight: 500;
          margin-bottom: 24px;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .footer-links-col ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .footer-links-col a {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .footer-links-col a:hover {
          color: var(--accent);
          padding-left: 4px;
        }

        .footer-bottom {
          border-top: 1px solid var(--border-light);
          padding: 24px 0;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .footer-bottom-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          text-align: center;
        }

        @media (min-width: 768px) {
          .footer-bottom-container {
            flex-direction: row;
            justify-content: space-between;
            text-align: left;
          }
        }

        .footer-legal-links {
          display: flex;
          gap: 20px;
        }

        .footer-legal-links a:hover {
          color: var(--accent);
        }
      `}</style>
    </footer>
  );
}
