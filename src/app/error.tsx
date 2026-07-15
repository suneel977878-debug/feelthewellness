'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service in the future
    console.error('Global application error:', error);
  }, [error]);

  return (
    <div className="catalog-layout">
      <Header />
      
      <div className="container error-container flex-center" style={{ 
        flexDirection: 'column', 
        minHeight: '70vh', 
        textAlign: 'center', 
        gap: '24px', 
        padding: '60px 24px' 
      }}>
        
        <div className="status-icon-wrapper failure-icon" style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(220, 38, 38, 0.1)',
          color: '#dc2626',
          border: '2px solid rgba(220, 38, 38, 0.3)',
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          </svg>
        </div>

        <h1 style={{ fontSize: '2.5rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
          An Unexpected Interruption
        </h1>
        
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '500px', lineHeight: '1.6' }}>
          We sincerely apologize. A temporary disturbance occurred while retrieving your discreet desires.
        </p>

        <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={() => reset()} className="btn btn-primary" style={{ padding: '12px 30px' }}>
            Try Again
          </button>
          <Link href="/catalog" className="btn btn-secondary" style={{ padding: '12px 30px' }}>
            Return to Catalog
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
