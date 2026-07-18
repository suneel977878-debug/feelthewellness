import React, { Suspense } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CatalogClient from './CatalogClient';
import { getProducts } from '../actions/products';

export const dynamic = 'force-dynamic';

async function CatalogData() {
  const products = await getProducts();
  
  return (
    <>
      <section className="catalog-hero" style={{
        background: 'linear-gradient(180deg, var(--bg-primary) 0%, transparent 100%), url("/hero.webp")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '40px 0',
        borderBottom: '1px solid var(--border-light)',
        textAlign: 'center'
      }}>
        <div className="container">
          <h1 className="glow-text" style={{ fontSize: '2.8rem', marginBottom: '12px', color: 'var(--text-primary)' }}>Ultimate Pleasure Lounge</h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>Explore our premium collection of {products.length} luxury intimacy objects designed for ultimate sexual pleasure and fulfillment.</p>
        </div>
      </section>
      <CatalogClient products={products} />
    </>
  );
}

export default function CatalogPage() {
  return (
    <div className="catalog-layout">
      <Header />
      <CatalogData />
      <Footer />
    </div>
  );
}
