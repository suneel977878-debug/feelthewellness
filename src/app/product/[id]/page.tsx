import React from 'react';
import Link from 'next/link';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import ProductDetailClient from './ProductDetailClient';
import { getProductById, getRelatedProducts } from '../../actions/products';

export const revalidate = 1800;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const productId = parseInt(resolvedParams.id, 10);
  
  if (isNaN(productId)) return {};

  const product = await getProductById(productId);
  
  if (!product) return {};

  return {
    title: `${product.name} | Feel the Wellness`,
    description: product.description.substring(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.substring(0, 160),
      images: [
        {
          url: product.image,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const productId = parseInt(resolvedParams.id, 10);
  
  if (isNaN(productId)) {
    return <NotFoundView />;
  }

  const product = await getProductById(productId);

  if (!product) {
    return <NotFoundView />;
  }

  const relatedProducts = await getRelatedProducts(product.category, product.id, 4);

  return (
    <>
      <Header />
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
      <Footer />
    </>
  );
}

function NotFoundView() {
  return (
    <>
      <Header />
      <div className="container error-container flex-center" style={{ flexDirection: 'column', minHeight: '60vh', textAlign: 'center', gap: '20px', padding: '40px 24px' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="error-icon" style={{ color: 'var(--text-muted)' }}>
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        <h1>Intimate Object Not Found</h1>
        <p>The product you are searching for is unavailable or has been relocated to another secret collection.</p>
        <Link href="/catalog" className="btn btn-primary">
          Return to Intimate Catalog
        </Link>
      </div>
      <Footer />
    </>
  );
}
