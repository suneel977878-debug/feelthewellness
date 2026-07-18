'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '../../components/ProductCard';
import { categoryTree, Product } from '../../data/products';

export default function CatalogClient({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get active filters from URL parameters
  const initialCategory = searchParams?.get('category') || 'All';
  const initialSubcategory = searchParams?.get('subcategory') || 'All';
  const initialSearch = searchParams?.get('search') || '';

  // State variables
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSubcategory, setSelectedSubcategory] = useState(initialSubcategory);
  const [expandedCategory, setExpandedCategory] = useState(initialCategory === 'All' ? '' : initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const sortOptionInit = 'popular';
  const initialMaxPrice = products.reduce((max, p) => Math.max(max, p.price), 10000);
  const [sortOption, setSortOption] = useState(sortOptionInit);
  const [priceRange, setPriceRange] = useState(initialMaxPrice);
  const [maxPrice] = useState(initialMaxPrice);
  const [showSaleOnly, setShowSaleOnly] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  // Sync state with URL params when they change
  useEffect(() => {
    const cat = searchParams?.get('category') || 'All';
    setSelectedCategory(cat);
    if (cat !== 'All') setExpandedCategory(cat);
    setSelectedSubcategory(searchParams?.get('subcategory') || 'All');
    const urlSearch = searchParams?.get('search') || '';
    if (!searchTimeoutRef.current && urlSearch !== searchQuery) {
      setSearchQuery(urlSearch);
    }
    const urlSort = searchParams?.get('sort');
    if (urlSort) {
      setSortOption(urlSort);
    }
  }, [searchParams]);

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, selectedSubcategory, searchQuery, sortOption, priceRange, showSaleOnly]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  // Update URL parameters helper
  const updateUrl = (category: string, subcategory: string, search: string) => {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.set('category', category);
    if (subcategory && subcategory !== 'All') params.set('subcategory', subcategory);
    if (search) params.set('search', search);
    router.push(`/catalog?${params.toString()}`);
  };

  const handleCategoryChange = (category: string) => {
    if (category === 'All') {
      setSelectedCategory('All');
      setSelectedSubcategory('All');
      setExpandedCategory('');
      updateUrl('All', 'All', searchQuery);
    } else {
      setExpandedCategory(expandedCategory === category ? '' : category);
      setSelectedCategory(category);
      setSelectedSubcategory('All');
      updateUrl(category, 'All', searchQuery);
    }
  };

  const handleSubcategoryChange = (category: string, subcategory: string) => {
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory);
    updateUrl(category, subcategory, searchQuery);
  };

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    setPage(1);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      searchTimeoutRef.current = null;
      updateUrl(selectedCategory, selectedSubcategory, val);
    }, 400);
  };

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setSortOption('popular');
    setPriceRange(maxPrice);
    setShowSaleOnly(false);
    router.push('/catalog');
  };

  // Filter and Sort Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Category Filter
        const matchesCategory =
          selectedCategory === 'All' || product.category === selectedCategory;

        // Subcategory Filter
        const matchesSubcategory = 
          selectedSubcategory === 'All' || selectedSubcategory === 'All Toys' || product.subcategory === selectedSubcategory;

        // Search Filter
        const matchesSearch =
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase());

        // Price Filter
        const matchesPrice = product.price <= priceRange;

        // Sale Filter
        const matchesSale = !showSaleOnly || product.isOnSale;

        return matchesCategory && matchesSubcategory && matchesSearch && matchesPrice && matchesSale;
      })
      .sort((a, b) => {
        // Dolls Priority
        if (sortOption === 'popular' || sortOption === 'newest') {
          const aIsDoll = a.subcategory === 'Sex Dolls' ? 1 : 0;
          const bIsDoll = b.subcategory === 'Sex Dolls' ? 1 : 0;
          if (aIsDoll !== bIsDoll) return bIsDoll - aIsDoll;
        }

        // Sorting Logic
        if (sortOption === 'newest') return b.id - a.id;
        if (sortOption === 'price-low') return a.price - b.price;
        if (sortOption === 'price-high') return b.price - a.price;
        if (sortOption === 'rating') return (b.rating || 0) - (a.rating || 0);
        
        // default: lustiest (highest rating first, then by most reviews, then bestsellers)
        const aScore = (a.isBestSeller ? 2 : 0) + (a.isNew ? 1 : 0);
        const bScore = (b.isBestSeller ? 2 : 0) + (b.isNew ? 1 : 0);
        if (bScore !== aScore) return bScore - aScore;
        
        if (b.rating !== a.rating) return (b.rating || 0) - (a.rating || 0);
        if (b.reviews !== a.reviews) return (b.reviews || 0) - (a.reviews || 0);
        
        // Fallback: newly added items on top
        return b.id - a.id;
      });
  }, [products, selectedCategory, selectedSubcategory, searchQuery, sortOption, priceRange, showSaleOnly]);

  // Paginated Products
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(0, page * itemsPerPage);
  }, [filteredProducts, page]);

  const hasMore = paginatedProducts.length < filteredProducts.length;

  return (
    <section className="catalog-section">
      <div className="container catalog-container">
        
        <button 
          className="mobile-filter-toggle"
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
          Filter & Sort Products
        </button>

        {/* Sidebar Filters */}
        <aside className={`filters-sidebar ${mobileFilterOpen ? 'open' : ''}`}>
          <div className="filter-card">
            <h3>Search Selection</h3>
            <div className="search-box">
              <input
                type="text"
                placeholder="What are you craving?..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="form-input search-input"
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); updateUrl(selectedCategory, selectedSubcategory, ''); }} className="search-clear-btn">
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="filter-card">
            <h3>Filter By Price</h3>
            <div className="price-slider-group">
              <input
                type="range"
                min="500"
                max={maxPrice}
                step="500"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="price-range"
              />
              <div className="price-range-labels">
                <span>Up to</span>
                <span className="price-limit">₹{priceRange.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="filter-card">
            <h3>Promotions</h3>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
              <input 
                type="checkbox" 
                checked={showSaleOnly} 
                onChange={(e) => setShowSaleOnly(e.target.checked)} 
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent)', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Sale Items Only (70% OFF)</span>
            </label>
          </div>

          <div className="filter-card">
            <h3>Categories</h3>
            <div className="categories-list">
              <button
                className={`category-filter-btn ${selectedCategory === 'All' ? 'active' : ''}`}
                onClick={() => handleCategoryChange('All')}
              >
                All Collections <span className="cat-count">{products.length}</span>
              </button>
              {categoryTree.map((cat) => {
                const count = products.filter((p) => p.category === cat.name).length;
                const isExpanded = expandedCategory === cat.name;
                return (
                  <div key={cat.id} className="category-accordion-group">
                    <button
                      className={`category-filter-btn ${selectedCategory === cat.name || isExpanded ? 'active' : ''}`}
                      onClick={() => handleCategoryChange(cat.name)}
                    >
                      {cat.name} 
                      <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                        <span className="cat-count" style={{ marginRight: '8px' }}>{count}</span>
                        <span style={{ fontSize: '12px' }}>{isExpanded ? '▼' : '▶'}</span>
                      </span>
                    </button>
                    
                    {isExpanded && (
                      <div className="subcategories-list">
                        {cat.subcategories.map(sub => {
                          const subCount = products.filter(p => p.category === cat.name && (sub === 'All Toys' || sub === 'All' || sub.startsWith('All ') || p.subcategory === sub || (!p.subcategory && sub === 'All Toys'))).length;
                          return (
                            <button
                              key={sub}
                              className={`subcategory-filter-btn ${selectedSubcategory === sub ? 'active-sub' : ''}`}
                              onClick={() => handleSubcategoryChange(cat.name, sub)}
                            >
                              {sub} <span className="cat-count">{subCount}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button className="btn btn-secondary reset-filters-btn" onClick={handleResetFilters}>
            Reset Filters
          </button>
        </aside>

        {/* Catalog Grid */}
        <main className="catalog-grid-area">
          {/* Toolbar */}
          <div className="catalog-toolbar">
            <p className="results-count">
              Showing <strong>{filteredProducts.length}</strong> luxurious pleasures
            </p>
            
            <div className="sort-box">
              <label htmlFor="sort-select">Sort By</label>
              <select
                id="sort-select"
                className="form-input sort-select"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="popular">Bestsellers & Popular</option>
                <option value="newest">New Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {paginatedProducts.length > 0 ? (
            <>
              <div className="products-grid">
                {paginatedProducts.map((product) => (
                  <div key={product.id} className="grid-item-fade">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {hasMore && (
                <div className="load-more-container flex-center">
                  <button 
                    className="btn btn-secondary load-more-btn" 
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Reveal More Pleasures
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-results-box flex-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="no-results-icon">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              <h2>No Pleasures Found</h2>
              <p>We couldn't find any products matching your specific filters. Try expanding your search criteria.</p>
              <button className="btn btn-primary" onClick={handleResetFilters}>
                Show All Collections
              </button>
            </div>
          )}
        </main>
      </div>
      
      <style jsx global>{`
        .catalog-section {
          padding: 48px 0 80px;
        }

        .catalog-container {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          align-items: start;
        }

        @media (min-width: 992px) {
          .catalog-container {
            grid-template-columns: 280px 1fr;
          }
        }

        /* Sidebar Filters */
        .filters-sidebar {
          display: none;
          flex-direction: column;
          gap: 24px;
        }
        
        .filters-sidebar.open {
          display: flex;
        }

        .mobile-filter-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          padding: 12px;
          border-radius: var(--border-radius);
          font-family: var(--font-sans);
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          margin-bottom: 20px;
        }
        
        @media (min-width: 992px) {
          .mobile-filter-toggle {
            display: none;
          }
          .filters-sidebar {
            display: flex;
          }
        }

        .filter-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          padding: 24px;
        }

        .filter-card h3 {
          font-family: var(--font-sans);
          font-size: 0.9rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--accent);
          margin-bottom: 16px;
          border-bottom: 1px solid var(--border-light);
          padding-bottom: 12px;
        }

        .search-box {
          position: relative;
        }

        .search-clear-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          background: none;
          font-size: 0.85rem;
          border: none;
        }

        .search-clear-btn:hover {
          color: var(--accent);
        }

        .price-slider-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .price-range {
          -webkit-appearance: none;
          width: 100%;
          height: 4px;
          border-radius: 2px;
          background: var(--bg-tertiary);
          outline: none;
        }

        .price-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--accent);
          cursor: pointer;
          box-shadow: 0 0 8px rgba(212, 175, 55, 0.4);
          transition: var(--transition-fast);
        }

        .price-range::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }

        .price-range-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .price-limit {
          color: var(--accent);
          font-weight: 600;
        }

        .categories-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .category-filter-btn {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;
          border-radius: 6px;
          font-size: 0.9rem;
          text-align: left;
          color: var(--text-secondary);
          transition: var(--transition-fast);
        }

        .category-filter-btn:hover {
          background: rgba(255, 255, 255, 0.02);
          color: var(--text-primary);
        }

        .category-filter-btn.active {
          background: rgba(212, 175, 55, 0.08);
          color: var(--accent);
          font-weight: 500;
          border-left: 3px solid var(--accent);
        }

        .cat-count {
          font-size: 0.75rem;
          background: var(--bg-tertiary);
          color: var(--text-muted);
          padding: 2px 6px;
          border-radius: 10px;
        }

        .category-filter-btn.active .cat-count {
          background: var(--accent);
          color: var(--bg-primary);
        }

        .subcategories-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding-left: 12px;
          margin-top: 4px;
          border-left: 1px solid var(--border-color);
        }

        .subcategory-filter-btn {
          width: 100%;
          text-align: left;
          background: none;
          border: none;
          padding: 6px 12px;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 0.9rem;
          border-radius: 6px;
          transition: var(--transition-fast);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .subcategory-filter-btn:hover {
          color: var(--text-primary);
          background: var(--bg-tertiary);
        }

        .subcategory-filter-btn.active-sub {
          color: var(--accent);
          font-weight: 500;
        }

        .reset-filters-btn {
          width: 100%;
        }

        /* Toolbar */
        .catalog-toolbar {
          display: flex;
          flex-direction: column;
          gap: 16px;
          justify-content: space-between;
          align-items: flex-start;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          padding: 16px 24px;
          margin-bottom: 32px;
        }

        @media (min-width: 768px) {
          .catalog-toolbar {
            flex-direction: row;
            align-items: center;
          }
        }

        .results-count {
          font-size: 0.95rem;
          color: var(--text-secondary);
        }

        .sort-box {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .sort-box label {
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .sort-select {
          padding: 8px 16px;
          font-size: 0.9rem;
          width: 220px;
          border-radius: 6px;
        }

        /* Product Grid */
        .products-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        @media (min-width: 480px) {
          .products-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1200px) {
          .products-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .grid-item-fade {
          animation: fadeIn 0.5s ease-out forwards;
        }

        .load-more-container {
          margin-top: 48px;
        }

        .load-more-btn {
          padding: 14px 40px;
          letter-spacing: 0.08em;
        }

        /* No Results */
        .no-results-box {
          flex-direction: column;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          padding: 64px 32px;
          text-align: center;
          gap: 16px;
        }

        .no-results-icon {
          color: var(--text-muted);
          margin-bottom: 8px;
        }

        .no-results-box h2 {
          font-size: 1.8rem;
          color: var(--text-primary);
        }

        .no-results-box p {
          max-width: 460px;
          margin-bottom: 12px;
        }
      `}</style>
    </section>
  );
}
