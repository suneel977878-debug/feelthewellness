'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { Product } from '../data/products';

interface Banner {
  id: string;
  src: string;
  alt: string;
  link: string;
  headline: string;
  subtext: string;
  cta: string;
  isProduct?: boolean;
}

const banners: Banner[] = [
  {
    id: 'sale_1',
    src: '/banners/banner_sale_new_1.webp',
    alt: 'Flash Sale - Up to 60% Off',
    link: '/catalog',
    headline: 'Sensual Summer Sale',
    subtext: 'Up to 60% Off Premium Toys',
    cta: 'Shop Sale',
  },
  {
    id: 'sale_2',
    src: '/banners/banner_sale_2.webp',
    alt: 'Midnight Indulgence Sale - Up to 50% Off',
    link: '/catalog',
    headline: 'Midnight Indulgence',
    subtext: 'Discover Your New Obsession',
    cta: 'Explore Now',
  },
  {
    id: 'sale_3',
    src: '/banners/banner_sale_3.webp',
    alt: 'Massive Adult Boutique Sale',
    link: '/catalog?category=Women%20Sex%20Toys',
    headline: 'For Her Pleasure',
    subtext: 'Luxury Vibrators & Dildos',
    cta: 'Shop Women',
  },
  {
    id: 'sale_4',
    src: '/banners/banner_sale_4.webp',
    alt: 'Intimate Couples Mega Discount',
    link: '/catalog?category=Couple%27s%20Play',
    headline: 'Better Together',
    subtext: 'Couples Toys & Kits',
    cta: 'Shop Couples',
  }
];

export default function BannerCarousel({ heroProducts }: { heroProducts?: Product[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const displayBanners: Banner[] = React.useMemo(() => {
    const productBanners: Banner[] = (heroProducts || []).map((p) => ({
      id: `hero_prod_${p.id}`,
      src: p.images && p.images.length > 0 ? p.images[0] : '/hero.webp',
      alt: p.name,
      link: `/product/${p.id}`,
      headline: p.name,
      subtext: `₹${p.price.toLocaleString('en-IN')} • ${p.category}`,
      cta: 'Shop Now',
      isProduct: true
    }));
    return productBanners.length > 0 ? [...productBanners, ...banners] : banners;
  }, [heroProducts]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisibleRef = useRef(true);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (isVisibleRef.current) {
        setCurrentIndex((prev) => (prev + 1) % displayBanners.length);
      }
    }, 5000);
  }, [displayBanners.length]);

  // IntersectionObserver: pause auto-slide when carousel is off-screen
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.3 }
    );
    const el = containerRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, []);

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTimer]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    startTimer();
  };
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % displayBanners.length);
    startTimer();
  };
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? displayBanners.length - 1 : prev - 1));
    startTimer();
  };

  // Touch handlers
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) nextSlide();
    if (distance < -minSwipeDistance) prevSlide();
  };

  return (
    <div
      ref={containerRef}
      className="banner-carousel-container"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="carousel-slides" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
        {displayBanners.map((banner, index) => (
          <div key={banner.id} className="carousel-slide">
            <Link href={banner.link} className={`carousel-link ${banner.isProduct ? 'hero-product-slide' : ''}`}>
              <Image
                src={banner.src}
                alt={banner.alt}
                fill
                priority={index === 0}          // Only first slide gets priority
                fetchPriority={index === 0 ? 'high' : 'auto'} // Optimize LCP
                loading={index === 0 ? undefined : 'lazy'} // Others lazy-load
                sizes="(max-width: 768px) 100vw, 1100px"
                className={banner.isProduct ? 'carousel-product-image' : 'carousel-image'}
              />
              {banner.isProduct && (
                <div className="hero-product-overlay">
                  <span className="hero-badge">⭐ HERO FEATURED</span>
                  <h2 className="hero-product-title">{banner.headline}</h2>
                  <p className="hero-product-subtext">{banner.subtext}</p>
                  <span className="hero-cta-btn">{banner.cta} →</span>
                </div>
              )}
            </Link>
          </div>
        ))}
      </div>

      <button className="carousel-control prev" onClick={prevSlide} aria-label="Previous banner">
        &#10094;
      </button>
      <button className="carousel-control next" onClick={nextSlide} aria-label="Next banner">
        &#10095;
      </button>

      <div className="carousel-indicators">
        {displayBanners.map((_, index) => (
          <button
            key={index}
            className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <style jsx>{`
        .hero-product-slide {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          background: radial-gradient(circle at 75% 50%, rgba(255, 42, 133, 0.15) 0%, rgba(15, 15, 20, 0.95) 70%), #0f0f14;
          position: relative;
          overflow: hidden;
          width: 100%;
          height: 100%;
        }
        .hero-product-slide :global(.carousel-product-image) {
          object-fit: contain !important;
          object-position: right center !important;
          max-width: 55% !important;
          padding: 20px 40px !important;
          right: 0 !important;
          left: auto !important;
          top: 0 !important;
          bottom: 0 !important;
          height: 100% !important;
          width: 55% !important;
          filter: drop-shadow(-10px 10px 25px rgba(0,0,0,0.7));
        }
        .hero-product-overlay {
          position: absolute;
          left: 5%;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          max-width: 480px;
          background: rgba(18, 18, 24, 0.85);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 32px 36px;
          border-radius: 20px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(255, 42, 133, 0.2);
        }
        .hero-badge {
          display: inline-block;
          background: linear-gradient(135deg, #ff2a85 0%, #ff6a00 100%);
          color: #fff;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 999px;
          letter-spacing: 1px;
          margin-bottom: 14px;
          text-transform: uppercase;
          box-shadow: 0 4px 15px rgba(255, 42, 133, 0.4);
        }
        .hero-product-title {
          font-size: 2.2rem;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.15;
          margin: 0 0 12px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .hero-product-subtext {
          font-size: 1.15rem;
          color: #e2e8f0;
          margin: 0 0 24px 0;
          font-weight: 500;
        }
        .hero-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          color: #0f0f14;
          font-weight: 700;
          font-size: 1rem;
          padding: 14px 28px;
          border-radius: 12px;
          transition: all 0.25s ease;
          box-shadow: 0 8px 20px rgba(255, 255, 255, 0.2);
        }
        .hero-product-slide:hover .hero-cta-btn {
          background: #ff2a85;
          color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(255, 42, 133, 0.5);
        }
        @media (max-width: 768px) {
          .hero-product-slide {
            justify-content: center;
          }
          .hero-product-slide :global(.carousel-product-image) {
            max-width: 100% !important;
            width: 100% !important;
            opacity: 0.35;
            padding: 10px !important;
            object-position: center !important;
          }
          .hero-product-overlay {
            position: relative;
            left: auto;
            top: auto;
            transform: none;
            width: 90%;
            margin: 0 auto;
            padding: 24px;
            text-align: center;
          }
          .hero-product-title {
            font-size: 1.6rem;
          }
        }
      `}</style>
    </div>
  );
}
