'use client';
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

export default function AgeGate() {
  const { ageGateEnabled } = useCart();
  const [showAgeGate, setShowAgeGate] = useState(false);

  useEffect(() => {
    const ageConfirmed = localStorage.getItem('lp_age_confirmed');
    if (!ageConfirmed && ageGateEnabled) {
      setShowAgeGate(true);
    } else {
      setShowAgeGate(false);
    }
  }, [ageGateEnabled]);

  const handleConfirmAge = () => {
    localStorage.setItem('lp_age_confirmed', 'true');
    setShowAgeGate(false);
  };

  if (!showAgeGate) return null;

  return (
    <div className="age-gate-overlay">
      <div className="age-gate-modal">
        <span className="age-gate-logo">FeelThe<span className="logo-accent">Wellness</span></span>
        <h2>Adults Only (18+)</h2>
        <p>
          This website contains products of a highly sensual nature, designed for intimacy, wellness, and the ultimate sexual pleasure. You must be 18 years of age or older to enter.
        </p>
        <div className="age-gate-actions">
          <button className="btn btn-primary gate-btn" onClick={handleConfirmAge}>
            I am 18 or Older
          </button>
          <button 
            className="btn btn-secondary gate-btn" 
            onClick={() => { window.location.href = 'https://www.google.com'; }}
          >
            Exit
          </button>
        </div>
        <span className="gate-footer">By entering, you agree to our Terms of Use and Privacy Policy.</span>
      </div>
      <style jsx>{`
        .age-gate-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(5, 2, 7, 0.98);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
        }

        .age-gate-modal {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          padding: 48px 32px;
          max-width: 500px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          box-shadow: var(--shadow-lg), 0 0 40px rgba(212, 175, 55, 0.1);
        }

        .age-gate-logo {
          font-family: var(--font-serif);
          font-size: 2.5rem;
          color: var(--text-primary);
        }

        .age-gate-modal h2 {
          font-size: 1.6rem;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .age-gate-modal p {
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--text-secondary);
        }

        .age-gate-actions {
          display: flex;
          gap: 16px;
          width: 100%;
          margin-top: 10px;
        }

        .gate-btn {
          flex: 1;
        }

        .gate-footer {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
