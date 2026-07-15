'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Banner {
  id: string;
  src: string;
  alt: string;
  link: string;
  headline: string;
  subtext: string;
  cta: string;
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

export default function BannerCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisibleRef = useRef(true);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (isVisibleRef.current) {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }
    }, 5000);
  }, []);

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
    setCurrentIndex((prev) => (prev + 1) % banners.length);
    startTimer();
  };
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
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
        {banners.map((banner, index) => (
          <div key={banner.id} className="carousel-slide">
            <Link href={banner.link} className="carousel-link">
              <Image
                src={banner.src}
                alt={banner.alt}
                fill
                priority={index === 0}          // Only first slide gets priority
                loading={index === 0 ? undefined : 'lazy'} // Others lazy-load
                sizes="(max-width: 768px) 100vw, 1100px"
                className="carousel-image"
              />
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
        {banners.map((_, index) => (
          <button
            key={index}
            className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
