import React from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function GlobalNotFound() {
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
        
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(212, 175, 55, 0.1)',
          color: 'var(--text-muted)',
          border: '2px dashed rgba(212, 175, 55, 0.3)',
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>

        <h1 style={{ fontSize: '2.8rem', color: 'var(--text-primary)', marginBottom: '4px', letterSpacing: '0.05em' }}>
          404 Not Found
        </h1>
        
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '480px', lineHeight: '1.6' }}>
          The sensual delight you are seeking has been misplaced or no longer exists in our collection.
        </p>

        <div style={{ marginTop: '20px' }}>
          <Link href="/catalog" className="btn btn-primary" style={{ padding: '14px 36px', fontSize: '1.05rem' }}>
            Explore Our Premium Catalog
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
