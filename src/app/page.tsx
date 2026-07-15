import React from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import BannerCarousel from '../components/BannerCarousel';
import AgeGate from '../components/AgeGate';
import NewsletterForm from '../components/NewsletterForm';
import Image from 'next/image';

import { getProducts } from './actions/products';

export const revalidate = 1800;

const customerReviews = [
  {
    id: 1,
    name: "Megha Irani",
    location: "Surat",
    date: "July 7, 2022",
    headline: "Perfect for spicing things up.",
    text: "This was our first couple's toy and it didn't disappoint. The remote feature works well and the vibrations are powerful. We love how it stays in place during intercourse. Amazing for connection and foreplay!",
    initials: "MI",
    color: "#e11d48"
  },
  {
    id: 2,
    name: "Rohan Wani",
    location: "Mumbai",
    date: "Jan 26, 2023",
    headline: "Insanely good for solo sessions.",
    text: "Honestly, I didn't expect this to be so addictive. The open-ended design makes cleaning super easy, and the sensation is way better than using your hand. Great for lazy evenings or when the mood strikes randomly.",
    initials: "RW",
    color: "#2563eb"
  },
  {
    id: 3,
    name: "Neha Joshi",
    location: "Pune",
    date: "Aug 23, 2023",
    headline: "Next level pleasure, wow.",
    text: "Tried this on a recommendation from a friend, and wow. This thing hits perfectly. The remote control is handy, and the dual motors give an intense feeling. If you're curious about trying this, go for it.",
    initials: "NJ",
    color: "#9333ea"
  },
  {
    id: 4,
    name: "Arjun Patel",
    location: "Delhi",
    date: "Feb 14, 2024",
    headline: "A premium experience.",
    text: "The build quality is incredible, feels like a true luxury product. It's whisper quiet and holds a charge for a long time. Shipping was discreet and fast. Highly recommended.",
    initials: "AP",
    color: "#059669"
  },
  {
    id: 5,
    name: "Priya Sharma",
    location: "Bangalore",
    date: "Nov 10, 2023",
    headline: "Completely changed my routine.",
    text: "I was hesitant to spend this much on a toy, but the materials and the intensity levels justify the price completely. The app control feature is mind-blowing. 10/10.",
    initials: "PS",
    color: "#d97706"
  },
  {
    id: 6,
    name: "Vikram Singh",
    location: "Jaipur",
    date: "Mar 5, 2024",
    headline: "Great for long distance.",
    text: "My partner and I use this while we're away on business trips. The remote app control brings us so much closer despite the miles. The silicone is incredibly soft and comfortable.",
    initials: "VS",
    color: "#4f46e5"
  }
];

export default async function HomePage() {
  const products = await getProducts();

  // Select 4 attractive/lustful products for display (Top Featured)
  const featuredBestsellers = products
    .filter(p => p.isBestSeller || p.category === 'Lingerie & Clothing' || p.name.includes('Vibrating') || p.name.includes('Wand'))
    .sort((a, b) => b.id - a.id)
    .slice(0, 4);

  // New Arrivals
  const newArrivals = [...products]
    .sort((a, b) => b.id - a.id)
    .slice(0, 8);

  // Map category images
  const categoryImages: Record<string, string> = {
    'Women Sex Toys': '/categories/circ_cat_vibrator_1783348478935.webp',
    'Men Sex Toys': '/categories/circ_cat_male_1783348503157.webp',
    'Couples Toys': '/categories/circ_cat_couples_1783348542596.webp',
    'BDSM & Bondage': '/categories/circ_cat_bdsm_1783348555589.webp',
    'Lingerie & Clothing': '/categories/circ_cat_lingerie.webp',
    'Supplements & Condoms': '/categories/circ_cat_supplements.webp'
  };

  return (
    <>
      <AgeGate />
      <Header />

      <main className="home-layout">
        {/* Flash Sale Ticker */}
        <div className="ticker-wrap">
          <div className="ticker">
            <span className="ticker-item">🔥 FLASH SALE — 20% OFF ALL TOYS</span>
            <span className="ticker-item">🚀 FREE DISCREET SHIPPING OVER ₹999</span>
            <span className="ticker-item">🆕 69 NEW PREMIUM ARRIVALS</span>
            <span className="ticker-item">🔥 FLASH SALE — 20% OFF ALL TOYS</span>
            <span className="ticker-item">🚀 FREE DISCREET SHIPPING OVER ₹999</span>
            <span className="ticker-item">🆕 69 NEW PREMIUM ARRIVALS</span>
          </div>
        </div>

        {/* Quick Nav Circular Categories */}
        <section className="quick-nav-section">
          <div className="quick-nav-scroll">
            {[
              { id: 'men', dbName: 'Men Sex Toys', displayName: "MEN'S TOYS" },
              { id: 'women', dbName: 'Women Sex Toys', displayName: "WOMEN'S TOYS" },
              { id: 'couples', dbName: 'Couples Toys', displayName: 'COUPLES' },
              { id: 'bdsm', dbName: 'BDSM & Bondage', displayName: 'BDSM' },
              { id: 'lingerie', dbName: 'Lingerie & Clothing', displayName: 'LINGERIE' },
              { id: 'supplements', dbName: 'Supplements & Condoms', displayName: 'WELLNESS' }
            ].map((cat, index) => {
              const imgSrc = categoryImages[cat.dbName] || '/hero.webp';
              return (
                <Link href={`/catalog?category=${encodeURIComponent(cat.dbName)}`} key={`quick-${cat.id}`} className="circular-category-item">
                  <div className="circular-image-wrapper">
                    <Image 
                      src={imgSrc}
                      alt={cat.displayName}
                      fill
                      sizes="110px"
                      className="category-image"
                    />
                  </div>
                  <span className="quick-category-label">{cat.displayName}</span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Banner Carousel replacing Hero Section */}
        <BannerCarousel />

        {/* Category Carousel Grid */}
        <section className="home-categories-section">
          <div className="container">
            <h2 className="section-title">Sensual Collections</h2>
            <div className="categories-grid-home">
              {[
                { name: 'Luxury Vibrators', category: 'Women Sex Toys', subcategory: 'Vibrators & Wands', image: '/categories/category_vibrators_1783346594785.webp' },
                { name: 'Male Strokers', category: 'Men Sex Toys', subcategory: 'Male Masturbators', image: '/categories/category_male_1783346614292.webp' },
                { name: 'Premium Dildos', category: 'Women Sex Toys', subcategory: 'Dildos', image: '/categories/category_dildos_1783346665693.webp' },
                { name: 'Couples Kits', category: 'Couples Toys', subcategory: 'All Toys', image: '/categories/category_couples_1783346624063.webp' },
                { name: 'BDSM Restraints', category: 'BDSM & Bondage', subcategory: 'Bondage & BDSM', image: '/categories/category_bdsm_1783346633974.webp' },
                { name: 'Intimate Wellness', category: 'Supplements & Condoms', subcategory: 'Lubricants', image: '/categories/category_wellness_1783346643070.webp' }
              ].map((subcat, idx) => {
                const count = products.filter(p => p.category === subcat.category && (subcat.subcategory === 'All Toys' || p.subcategory === subcat.subcategory)).length;
                return (
                  <Link href={`/catalog?category=${encodeURIComponent(subcat.category)}&subcategory=${encodeURIComponent(subcat.subcategory)}`} key={`subcat-${idx}`} className="vibrant-category-card">
                    <Image 
                      src={subcat.image}
                      alt={subcat.name}
                      fill
                      className="cat-bg-image"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="cat-content">
                      <h3>{subcat.name}</h3>
                      <span>{count > 0 ? `${count} Products` : 'Explore'} ➔</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured Bestsellers */}
        <section id="bestsellers" className="home-bestsellers-section">
          <div className="container">
            <div className="section-header-row">
              <h2 className="section-title-left">Bestsellers In Pleasure</h2>
              <Link href="/catalog" className="view-all-link">View All Catalog ➔</Link>
            </div>
            
            <div className="bestsellers-grid">
              {featuredBestsellers.map((product) => (
                <div key={product.id} className="grid-item-fade">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* New Arrivals Section */}
        <section className="featured-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">New Arrivals</h2>
              <Link href="/catalog?sort=new" className="view-all-link">
                View All →
              </Link>
            </div>
            <div className="bestsellers-grid">
              {newArrivals.map((product) => (
                <div key={product.id} className="grid-item-fade">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sensory wellness Banner */}
        <section className="cta-banner-section">
          <div className="container cta-container flex-center">
            <div className="cta-text-content">
              <h2>A Secret Shared in Confidence</h2>
              <p>
                From billing to delivery, your pleasure remains your secret. We pack all orders in double-sealed plain boxes with a neutral sender name. Secure payments are processed via Paytm's encrypted gateway.
              </p>
              <div className="discreet-badges">
                <span>📦 Plain Outer Carton</span>
                <span>🔒 Paytm Secured</span>
                <span>🤫 No Brand Labeling</span>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Reviews Section */}
        <section className="reviews-section">
          <div className="container">
            <h2 className="section-title">Real Talk: Reviews That Matter</h2>
            <div className="reviews-grid">
              {customerReviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-avatar" style={{ backgroundColor: review.color }}>
                    {review.initials}
                  </div>
                  <div className="review-stars">
                    ★★★★★
                  </div>
                  <h4 className="review-headline">{review.headline}</h4>
                  <p className="review-text">"{review.text}"</p>
                  <span className="review-author">{review.name}, {review.location}</span>
                  <span className="review-date">{review.date}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="newsletter-section">
          <div className="container newsletter-container">
            <h2>Unlock Secret Promos & Expert Tips</h2>
            <p>Subscribe to our confidential newsletter. Receive 10% off your first checkout, exclusive tips, and priority launches.</p>
            <NewsletterForm />
            <span className="newsletter-disclaimer">We respect your absolute privacy. Unsubscribe at any time.</span>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
