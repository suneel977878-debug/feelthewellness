'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProductSilhouette from '../../components/ProductSilhouette';
import { useCart } from '../../context/CartContext';
import { Product, categoryTree } from '../../data/products';
import { logout } from '../actions/auth';

export default function AdminPage() {
  const {
    paytmConfig: contextPaytmConfig,
    promos: contextPromos,
    ageGateEnabled: contextAgeGateEnabled,
    storeUpiId: contextStoreUpiId,
  } = useCart();

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [promos, setPromos] = useState<any[]>(contextPromos);
  const [paytmConfig, setContextPaytmConfig] = useState<any>(contextPaytmConfig);
  const [ageGateEnabled, setAgeGateEnabledState] = useState<boolean>(contextAgeGateEnabled);
  const [storeUpiId, setStoreUpiIdState] = useState<string>(contextStoreUpiId);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Fetch initial data
  React.useEffect(() => {
    async function loadData() {
      const [ProductsAction, OrdersAction] = await Promise.all([
        import('../actions/products'),
        import('../actions/orders')
      ]);
      const fetchedProducts = await ProductsAction.getProducts();
      const fetchedOrders = await OrdersAction.getOrders();
      setProducts(fetchedProducts);
      setOrders(fetchedOrders);
      setIsLoadingData(false);
    }
    if (isAuthorized) {
      loadData();
    }
  }, [isAuthorized]);

  // Actions wrappers
  const addProduct = async (product: Omit<Product, 'id'>) => {
    const { createProduct } = await import('../actions/products');
    const newProduct = await createProduct(product);
    setProducts(prev => [newProduct, ...prev]);
  };

  const updateProduct = async (product: Product) => {
    const { updateProduct: updateP } = await import('../actions/products');
    const updated = await updateP(product);
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const deleteProduct = async (productId: number) => {
    const { deleteProduct: delP } = await import('../actions/products');
    await delP(productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const bulkUpdatePrices = async (productIds: number[], type: 'increase' | 'decrease', unit: 'amount' | 'percentage', value: number) => {
    const { bulkUpdatePrices: bulkP, getProducts } = await import('../actions/products');
    await bulkP(productIds, type, unit, value);
    const refreshed = await getProducts();
    setProducts(refreshed);
  };

  const updatePaytmConfig = async (config: any) => {
    const { updatePaytmConfig: updateConfig } = await import('../actions/config');
    await updateConfig(config);
    setContextPaytmConfig(config);
  };

  const updateOrderStatus = async (orderId: string, status: 'VERIFIED' | 'FAILED') => {
    const { updateOrderStatus: updateStatus } = await import('../actions/orders');
    const updated = await updateStatus(orderId, status);
    setOrders(prev => prev.map(o => o.orderId === updated.orderId ? updated : o));
  };

  const updateDeliveryTracking = async (orderId: string, status: 'PROCESSING' | 'SHIPPED' | 'DELIVERED', note: string) => {
    const { updateDeliveryTracking: updateTracking } = await import('../actions/orders');
    const updated = await updateTracking(orderId, status, note);
    setOrders(prev => prev.map(o => o.orderId === updated.orderId ? updated : o));
  };

  const clearOrders = async () => {
    const { clearOrders: clearO } = await import('../actions/orders');
    await clearO();
    setOrders([]);
  };

  const setAgeGateEnabled = async (enabled: boolean) => {
    const { updateAgeGate } = await import('../actions/config');
    await updateAgeGate(enabled);
    setAgeGateEnabledState(enabled);
  };

  const setStoreUpiId = async (id: string) => {
    const { updateStoreUpiId } = await import('../actions/config');
    await updateStoreUpiId(id);
    setStoreUpiIdState(id);
  };

  const addPromo = async (promo: Omit<any, 'id'>) => {
    const { addPromo: addP } = await import('../actions/config');
    const newPromo = await addP(promo.code, promo.discountPct);
    setPromos(prev => [...prev, newPromo]);
  };

  const togglePromo = async (id: string, isActive: boolean) => {
    const { togglePromo: toggleP } = await import('../actions/config');
    await toggleP(id, isActive);
    setPromos(prev => prev.map(p => p.id === id ? { ...p, isActive } : p));
  };

  const deletePromo = async (id: string) => {
    const { deletePromo: delP } = await import('../actions/config');
    await delP(id);
    setPromos(prev => prev.filter(p => p.id !== id));
  };

  // Authentication state
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');

  // Active tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'promotions' | 'customers' | 'storefront' | 'reviews' | 'paytm' | 'settings'>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Search and page states for products management
  const [productSearch, setProductSearch] = useState('');
  const [productsPage, setProductsPage] = useState(1);
  const itemsPerPage = 8;

  // Bulk update states
  const [bulkType, setBulkType] = useState<'increase' | 'decrease'>('decrease');
  const [bulkUnit, setBulkUnit] = useState<'percentage' | 'amount'>('percentage');
  const [bulkValue, setBulkValue] = useState<string>('');

  // Product Add/Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Product Form states
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCategory, setFormCategory] = useState('Women Sex Toys');
  const [formSubcategory, setFormSubcategory] = useState('All Toys');
  const [formDescription, setFormDescription] = useState('');
  const [formSilhouette, setFormSilhouette] = useState<string>('wand');
  const [formColor, setFormColor] = useState('#ff2a85');
  const [formFeatures, setFormFeatures] = useState('');
  const [formIsNew, setFormIsNew] = useState(false);
  const [formIsBestSeller, setFormIsBestSeller] = useState(false);
  const [formIsOnSale, setFormIsOnSale] = useState(false);
  const [formDiscountPercent, setFormDiscountPercent] = useState('');
  const [formRating, setFormRating] = useState('4.8');
  const [formReviews, setFormReviews] = useState('1');
  const [formImages, setFormImages] = useState<string[]>(['/products/prod_1_0.jpg']);

  // Promo Form states
  const [promoCode, setPromoCode] = useState('');
  const [promoPct, setPromoPct] = useState('');

  // Paytm Config Form states
  const [paytmMid, setPaytmMid] = useState(paytmConfig.mid);
  const [paytmKey, setPaytmKey] = useState(paytmConfig.merchantKey);
  const [paytmEnv, setPaytmEnv] = useState<'SIMULATED' | 'STAGE' | 'PROD'>(paytmConfig.environment);

  // Handle Login
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'Sunil@2026') {
      setIsAuthorized(true);
      setAuthError('');
      // Sync form states with context loaded configs
      setPaytmMid(paytmConfig.mid);
      setPaytmKey(paytmConfig.merchantKey);
      setPaytmEnv(paytmConfig.environment);
    } else {
      setAuthError('Invalid administrator passcode. Please try again.');
    }
  };

  // Handle Save Paytm Config
  const handleSavePaytm = (e: React.FormEvent) => {
    e.preventDefault();
    updatePaytmConfig({
      mid: paytmMid.trim(),
      merchantKey: paytmKey.trim(),
      website: 'DEFAULT',
      channelId: 'WEB',
      environment: paytmEnv
    });
    alert('Paytm Business gateway configuration saved successfully!');
  };

  // Open Add Modal
  const openAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormPrice('');
    setFormCategory('Vibrators & Wands');
    setFormDescription('');
    setFormSilhouette('wand');
    setFormColor('#ff2a85');
    setFormFeatures('Rechargeable, Water-resistant, Whisper quiet');
    setFormIsNew(true);
    setFormIsBestSeller(false);
    setFormIsOnSale(false);
    setFormDiscountPercent('');
    setFormRating('4.8');
    setFormReviews('1');
    setFormImages(['/products/prod_1_0.jpg']);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormPrice(product.price.toString());
    setFormCategory(product.category);
    setFormSubcategory(product.subcategory || 'All Toys');
    setFormDescription(product.description);
    setFormSilhouette(product.silhouetteType);
    setFormColor(product.color);
    setFormFeatures(product.features.join(', '));
    setFormIsNew(!!product.isNew);
    setFormIsBestSeller(!!product.isBestSeller);
    setFormIsOnSale(!!product.isOnSale);
    setFormDiscountPercent(product.discountPercent ? product.discountPercent.toString() : '');
    setFormRating(product.rating ? product.rating.toString() : '4.8');
    setFormReviews(product.reviews ? product.reviews.toString() : '1');
    setFormImages(product.images && product.images.length > 0 ? product.images : ['/products/prod_1_0.jpg']);
    setIsModalOpen(true);
  };

  // Submit Product Form
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice.trim() || !formDescription.trim()) {
      alert('Please fill out all required product fields.');
      return;
    }

    const priceNum = parseInt(formPrice, 10);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Please enter a valid price amount.');
      return;
    }

    const featuresArray = formFeatures
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

    const productPayload = {
      name: formName.trim(),
      price: priceNum,
      category: formCategory,
      subcategory: formSubcategory,
      description: formDescription.trim(),
      silhouetteType: formSilhouette,
      color: formColor,
      features: featuresArray.length > 0 ? featuresArray : ['Premium Medical Grade Silicone'],
      isNew: formIsNew,
      isBestSeller: formIsBestSeller,
      isOnSale: formIsOnSale,
      discountPercent: parseFloat(formDiscountPercent) || undefined,
      rating: parseFloat(formRating) || 5.0,
      reviews: parseInt(formReviews, 10) || 0,
      images: formImages.length > 0 ? formImages : ['/products/prod_1_0.jpg'],
    };

    if (editingProduct) {
      // Edit
      updateProduct({
        ...productPayload,
        id: editingProduct.id,
      });
      alert(`Product "${formName}" updated successfully!`);
    } else {
      // Add
      addProduct(productPayload);
      alert(`Product "${formName}" added successfully!`);
    }

    setIsModalOpen(false);
    setEditingProduct(null);
  };

  // Filter products for admin view
  const filteredProductsList = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  const paginatedProductsList = filteredProductsList.slice(
    (productsPage - 1) * itemsPerPage,
    productsPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredProductsList.length / itemsPerPage);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/portal_ad';
  };

  if (!isAuthorized) {
    return (
      <div className="admin-app-container flex-center" style={{ minHeight: '100vh', flexDirection: 'column' }}>
        <Header />
        <div className="admin-login-card flex-center" style={{ flex: 1 }}>
          <div className="admin-logo">FeelThe<span style={{ color: 'var(--accent)' }}>Wellness</span></div>
          <h2>Administration Portal</h2>
          <p>This area is restricted to authorized store staff. Please enter your passcode to access the portal.</p>
          <form className="admin-login-form" onSubmit={handleLoginSubmit}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <input 
                type="password"
                className="input-field passcode-input"
                placeholder="••••••••••"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                autoFocus
              />
            </div>
            {authError && <div className="admin-auth-error" style={{ marginBottom: '16px', padding: '12px', borderRadius: '4px' }}>{authError}</div>}
            <button type="submit" className="btn btn-primary login-btn">ACCESS PORTAL</button>
          </form>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="admin-app-container">
      {/* Mobile Top Bar */}
      <div className="admin-mobile-topbar">
        <button className="hamburger-btn" onClick={() => setIsSidebarOpen(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <span className="mobile-logo glow-text">Luxe Admin</span>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="mobile-sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Left Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="glow-text">Luxe Admin</h2>
          <button className="close-sidebar-btn" onClick={() => setIsSidebarOpen(false)}>✕</button>
        </div>
        <nav className="dashboard-tabs vertical-tabs">
                <button 
                  className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  📊 Sales & Analytics
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                  onClick={() => setActiveTab('orders')}
                >
                  📥 Orders Log ({orders.length})
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
                  onClick={() => setActiveTab('products')}
                >
                  💄 Catalog Manager ({products.length})
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'promotions' ? 'active' : ''}`}
                  onClick={() => setActiveTab('promotions')}
                >
                  🏷️ Discounts & Promos
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
                  onClick={() => setActiveTab('customers')}
                >
                  👥 Customer CRM
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'storefront' ? 'active' : ''}`}
                  onClick={() => setActiveTab('storefront')}
                >
                  🖼️ Homepage Content
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                  onClick={() => setActiveTab('reviews')}
                >
                  ⭐ Reviews Moderation
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'paytm' ? 'active' : ''}`}
                  onClick={() => setActiveTab('paytm')}
                >
                  💳 Paytm PG Config
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                  onClick={() => setActiveTab('settings')}
                >
                  ⚙ Settings Controls
                </button>
        </nav>
        <div className="sidebar-footer">
          <button className="btn btn-secondary logout-btn" onClick={handleLogout}>
            Lock Console
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main-content">
        <div className="dashboard-content-area">
              {isLoadingData ? (
                <div className="flex-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: '20px' }}>
                  <div className="spinner"></div>
                  <p>Loading administration data...</p>
                </div>
              ) : (
                <>
              {/* TAB CONTENT: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="tab-body animate-fade-in">
                  <h2>Sales & Analytics Overview</h2>
                  <p className="tab-section-desc">A high-level summary of your boutique's performance.</p>
                  
                  <div className="kpi-grid">
                    <div className="kpi-card">
                      <h4>Total Revenue</h4>
                      <div className="kpi-val">₹{(orders.reduce((sum, o) => sum + o.amount, 0)).toLocaleString('en-IN')}</div>
                      <span className="kpi-trend positive">+12% vs last week</span>
                    </div>
                    <div className="kpi-card">
                      <h4>Total Orders</h4>
                      <div className="kpi-val">{orders.length}</div>
                      <span className="kpi-trend positive">+5% vs last week</span>
                    </div>
                    <div className="kpi-card">
                      <h4>Avg Order Value</h4>
                      <div className="kpi-val">₹{orders.length > 0 ? (Math.round(orders.reduce((sum, o) => sum + o.amount, 0) / orders.length)).toLocaleString('en-IN') : 0}</div>
                      <span className="kpi-trend neutral">0% vs last week</span>
                    </div>
                  </div>

                  <div className="analytics-chart-placeholder">
                    <div className="chart-title">Revenue (Last 7 Days)</div>
                    <div className="mock-bars">
                      <div className="bar" style={{ height: '40%' }}></div>
                      <div className="bar" style={{ height: '60%' }}></div>
                      <div className="bar" style={{ height: '30%' }}></div>
                      <div className="bar" style={{ height: '80%' }}></div>
                      <div className="bar" style={{ height: '50%' }}></div>
                      <div className="bar" style={{ height: '90%' }}></div>
                      <div className="bar" style={{ height: '100%', background: 'var(--accent)' }}></div>
                    </div>
                    <div className="mock-days">
                      <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                  </div>
                </div>
              )}
                {/* TAB CONTENT: ORDERS */}
              {activeTab === 'orders' && (
                <div className="tab-body animate-fade-in">
                  <div className="tab-header-row">
                    <h2>Received Customer Orders</h2>
                    {orders.length > 0 && (
                      <button className="btn btn-secondary clear-history-btn" onClick={() => { if(confirm('Clear all stored order history?')) clearOrders(); }}>
                        Clear Order Logs
                      </button>
                    )}
                  </div>

                  {orders.length > 0 ? (
                    <div className="orders-timeline">
                      {orders.map((order) => (
                        <div key={order.id} className="order-log-card">
                          <div className="order-log-header">
                            <div>
                              <span className="order-log-id">Order ID: <strong>{order.orderId}</strong></span>
                              <span className="order-log-date">{order.date}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span className="order-log-price">₹{order.amount.toLocaleString('en-IN')}</span>
                              {order.status === 'PENDING' && <span className="status-badge pending-badge" style={{ background: '#f5a623', color: '#000', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>PENDING</span>}
                              {order.status === 'VERIFIED' && <span className="status-badge verified-badge" style={{ background: '#27ae60', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>VERIFIED</span>}
                              {order.status === 'SUCCESS' && <span className="status-badge verified-badge" style={{ background: '#27ae60', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>GATEWAY PAID</span>}
                            </div>
                          </div>

                          <div className="order-log-split">
                            <div className="shipping-block">
                              <h4>Discreet Shipping Address</h4>
                              <p><strong>Name:</strong> {order.customer.name}</p>
                              <p><strong>Phone:</strong> {order.customer.phone}</p>
                              <p><strong>Address:</strong> {order.customer.address}</p>
                              {(order.utr || order.paymentApp) && (
                                <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(212, 175, 55, 0.1)', border: '1px solid #d4af37', borderRadius: '6px' }}>
                                  <p><strong>Payment Mode:</strong> <span style={{ textTransform: 'capitalize' }}>{order.paymentApp}</span></p>
                                  <p><strong>UTR Ref:</strong> {order.utr}</p>
                                  {order.status === 'PENDING' && (
                                    <button 
                                      className="btn btn-primary" 
                                      style={{ marginTop: '10px', padding: '6px 12px', fontSize: '12px', width: 'auto' }}
                                      onClick={() => updateOrderStatus(order.orderId, 'VERIFIED')}
                                    >
                                      Verify Payment
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="items-block">
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <h4>Purchased Items</h4>
                                <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => window.print()}>🖨️ Print Order</button>
                              </div>
                              <table className="order-items-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                <thead>
                                  <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left' }}>
                                    <th style={{ paddingBottom: '8px' }}>Product</th>
                                    <th style={{ paddingBottom: '8px' }}>Qty</th>
                                    <th style={{ paddingBottom: '8px', textAlign: 'right' }}>Total</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {order.items.map((item: any, idx: number) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                      <td style={{ padding: '8px 0' }}>{item.name}</td>
                                      <td style={{ padding: '8px 0' }}>x{item.quantity}</td>
                                      <td style={{ padding: '8px 0', textAlign: 'right' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                          
                          {/* Delivery Tracking Section */}
                          <div className="delivery-tracking-block" style={{ marginTop: '16px', padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <h4 style={{ marginBottom: '12px' }}>Delivery Tracking (In-House)</h4>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                              <select 
                                className="form-input" 
                                style={{ width: 'auto', minWidth: '150px' }}
                                value={order.deliveryStatus || 'PROCESSING'}
                                onChange={(e) => updateDeliveryTracking(order.orderId, e.target.value as any, order.deliveryNote || '')}
                              >
                                <option value="PROCESSING">Processing</option>
                                <option value="SHIPPED">Shipped / Out for Delivery</option>
                                <option value="DELIVERED">Delivered</option>
                              </select>
                              
                              <input 
                                type="text" 
                                className="form-input" 
                                style={{ flex: 1, minWidth: '200px' }}
                                placeholder="Add tracking note (e.g. Driver arriving in 30 mins)"
                                defaultValue={order.deliveryNote || ''}
                                onBlur={(e) => updateDeliveryTracking(order.orderId, order.deliveryStatus || 'PROCESSING', e.target.value)}
                              />
                              
                              <Link href={`/track/${order.orderId}`} target="_blank" className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '13px' }}>
                                View Public Tracking Page
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state-box flex-center">
                      <span className="empty-icon">📥</span>
                      <h3>No Orders Logged</h3>
                      <p>Completed customer transactions will appear here. Go through the checkout page and complete mock purchases to log entries.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB CONTENT: PRODUCTS */}
              {activeTab === 'products' && (
                <div className="tab-body animate-fade-in">
                  <div className="tab-header-row">
                    <h2>Catalog Management</h2>
                    <button className="btn btn-primary add-product-trigger" onClick={openAddModal}>
                      + Add New Product
                    </button>
                  </div>

                  <div className="search-filter-row">
                    <input
                      type="text"
                      className="form-input search-input"
                      placeholder="Search catalog by name or category..."
                      value={productSearch}
                      onChange={(e) => { setProductSearch(e.target.value); setProductsPage(1); }}
                    />
                  </div>
                  
                  <div className="bulk-update-card" style={{ padding: '16px', background: 'rgba(255,42,133,0.05)', borderRadius: '12px', border: '1px solid rgba(255,42,133,0.2)', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div>
                      <strong style={{ display: 'block', marginBottom: '8px', color: 'var(--accent-color)' }}>Bulk Price Adjustment</strong>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Applies to {filteredProductsList.length} currently filtered product(s)</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1, minWidth: '300px' }}>
                      <select className="form-input" style={{ width: 'auto' }} value={bulkType} onChange={(e) => setBulkType(e.target.value as any)}>
                        <option value="decrease">Decrease Price</option>
                        <option value="increase">Increase Price</option>
                      </select>
                      <span style={{ color: 'var(--text-secondary)' }}>by</span>
                      <select className="form-input" style={{ width: 'auto' }} value={bulkUnit} onChange={(e) => setBulkUnit(e.target.value as any)}>
                        <option value="percentage">Percentage (%)</option>
                        <option value="amount">Amount (₹)</option>
                      </select>
                      <input 
                        type="number" 
                        className="form-input" 
                        placeholder="Value..." 
                        style={{ width: '100px' }}
                        value={bulkValue}
                        onChange={(e) => setBulkValue(e.target.value)}
                        min="1"
                      />
                      <button 
                        className="btn btn-primary" 
                        disabled={!bulkValue || Number(bulkValue) <= 0}
                        onClick={() => {
                          const val = Number(bulkValue);
                          if (val > 0 && confirm(`Are you sure you want to ${bulkType} prices of ${filteredProductsList.length} products by ${val}${bulkUnit === 'percentage' ? '%' : '₹'}?`)) {
                            bulkUpdatePrices(filteredProductsList.map(p => p.id), bulkType, bulkUnit, val);
                            setBulkValue('');
                          }
                        }}
                      >
                        Apply Bulk Update
                      </button>
                    </div>
                  </div>

                  {paginatedProductsList.length > 0 ? (
                    <div className="admin-products-list">
                      <div className="products-table-wrapper">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Visual</th>
                              <th>Product Details</th>
                              <th>Category</th>
                              <th>Price</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedProductsList.map((p) => (
                              <tr key={p.id}>
                                <td>
                                  <div className="table-visual-box flex-center">
                                    <ProductSilhouette type={p.silhouetteType as any} color={p.color} size={45} />
                                  </div>
                                </td>
                                <td>
                                  <div className="table-product-info">
                                    <strong className="p-name">{p.name}</strong>
                                    <span className="p-id">ID: {p.id}</span>
                                  </div>
                                </td>
                                <td>{p.category}</td>
                                <td className="table-p-price">₹{p.price.toLocaleString('en-IN')}</td>
                                <td>
                                  <div className="table-badges-row">
                                    {p.isBestSeller && <span className="badge badge-accent">Bestseller</span>}
                                    {p.isNew && <span className="badge badge-new">New</span>}
                                  </div>
                                </td>
                                <td>
                                  <div className="table-actions-row">
                                    <button className="btn-table edit-btn" onClick={() => openEditModal(p)}>Edit</button>
                                    <button className="btn-table delete-btn" onClick={() => { if(confirm(`Delete product "${p.name}"?`)) deleteProduct(p.id); }}>Delete</button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="admin-pagination flex-center">
                          <button className="page-nav-btn" disabled={productsPage === 1} onClick={() => setProductsPage(p => p - 1)}>◀</button>
                          <span>Page {productsPage} of {totalPages}</span>
                          <button className="page-nav-btn" disabled={productsPage === totalPages} onClick={() => setProductsPage(p => p + 1)}>▶</button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="empty-state-box flex-center">
                      <span className="empty-icon">🔍</span>
                      <h3>No Matching Products</h3>
                      <p>We couldn't find any products matching "{productSearch}" in your local inventory.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB CONTENT: PROMOTIONS */}
              {activeTab === 'promotions' && (
                <div className="tab-body animate-fade-in">
                  <h2>Discounts & Promos</h2>
                  <p className="tab-section-desc">Manage active coupon codes that customers can apply at checkout.</p>

                  <div className="config-card-form" style={{ marginBottom: '32px' }}>
                    <h3 style={{ marginBottom: '16px' }}>Create New Promo Code</h3>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      if (!promoCode.trim() || !promoPct) return;
                      addPromo({
                        code: promoCode.trim().toUpperCase(),
                        discountPct: parseInt(promoPct, 10),
                        isActive: true
                      });
                      setPromoCode('');
                      setPromoPct('');
                      alert('Promo Code created successfully!');
                    }}>
                      <div className="form-row-grid">
                        <div className="form-group">
                          <label className="form-label" htmlFor="pcode">Promo Code</label>
                          <input
                            id="pcode"
                            type="text"
                            className="form-input"
                            placeholder="e.g. SUMMER20"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="ppct">Discount Percentage (%)</label>
                          <input
                            id="ppct"
                            type="number"
                            className="form-input"
                            placeholder="e.g. 20"
                            min="1"
                            max="99"
                            value={promoPct}
                            onChange={(e) => setPromoPct(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <button type="submit" className="btn btn-primary" style={{ marginTop: '16px' }}>
                        + Add Promo Code
                      </button>
                    </form>
                  </div>

                  <h3>Active Promos</h3>
                  {promos.length > 0 ? (
                    <div className="admin-products-list">
                      <div className="products-table-wrapper">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Code</th>
                              <th>Discount</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {promos.map(p => (
                              <tr key={p.id}>
                                <td><strong style={{ letterSpacing: '0.1em' }}>{p.code}</strong></td>
                                <td>{p.discountPct}% OFF</td>
                                <td>
                                  <div className="toggle-switch">
                                    <input 
                                      type="checkbox" 
                                      id={`promo-${p.id}`}
                                      checked={p.isActive}
                                      onChange={(e) => togglePromo(p.id, e.target.checked)}
                                    />
                                    <label htmlFor={`promo-${p.id}`}></label>
                                  </div>
                                </td>
                                <td>
                                  <button className="btn-table delete-btn" onClick={() => { if(confirm(`Delete promo code ${p.code}?`)) deletePromo(p.id); }}>Delete</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-muted)' }}>No promo codes currently created.</p>
                  )}
                </div>
              )}

              {/* TAB CONTENT: CUSTOMERS */}
              {activeTab === 'customers' && (
                <div className="tab-body animate-fade-in">
                  <h2>Customer CRM</h2>
                  <p className="tab-section-desc">Manage your customer relationships and view lifetime values derived from order history.</p>

                  {orders.length > 0 ? (
                    <div className="admin-products-list">
                      <div className="products-table-wrapper">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Customer Details</th>
                              <th>Contact Information</th>
                              <th>Total Orders</th>
                              <th>Lifetime Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Array.from(new Map(orders.map(o => [o.customer.phone, o])).values()).map(customerOrder => {
                              const customerOrders = orders.filter(o => o.customer.phone === customerOrder.customer.phone);
                              const lifetimeValue = customerOrders.reduce((sum, o) => sum + o.amount, 0);
                              return (
                                <tr key={customerOrder.customer.phone}>
                                  <td>
                                    <strong>{customerOrder.customer.name}</strong>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{customerOrder.customer.address}</div>
                                  </td>
                                  <td>{customerOrder.customer.phone}</td>
                                  <td>{customerOrders.length}</td>
                                  <td style={{ color: 'var(--accent)', fontWeight: 'bold' }}>₹{lifetimeValue.toLocaleString('en-IN')}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="empty-state-box flex-center">
                      <span className="empty-icon">👥</span>
                      <h3>No Customers Yet</h3>
                      <p>Once orders are placed, customer profiles will automatically populate here.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB CONTENT: STOREFRONT */}
              {activeTab === 'storefront' && (
                <div className="tab-body animate-fade-in">
                  <h2>Homepage Content Management</h2>
                  <p className="tab-section-desc">Manage the hero banners, promotional text, and featured collections on the landing page.</p>

                  <div className="settings-controls-grid">
                    <div className="settings-card-ctrl">
                      <div className="ctrl-header">
                        <h4>Hero Banners</h4>
                        <button className="btn btn-primary" onClick={() => alert('Banner upload module is simulated.')}>Upload Image</button>
                      </div>
                      <p>Currently active: <strong>Banner_Lustful_1.jpg</strong></p>
                      <div style={{ marginTop: '12px', height: '100px', background: 'url(/banner_sale_lustful_1_fixed_1783878924690.jpg) center/cover', borderRadius: '8px' }}></div>
                    </div>

                    <div className="settings-card-ctrl">
                      <div className="ctrl-header">
                        <h4>SEO & Meta Details</h4>
                        <button className="btn btn-secondary" onClick={() => alert('Saved!')}>Save SEO</button>
                      </div>
                      <div className="form-group" style={{ marginTop: '16px' }}>
                        <label className="form-label">Homepage Title Tag</label>
                        <input type="text" className="form-input" defaultValue="Feel The Wellness | India's Premium Adult Store" />
                      </div>
                    </div>

                    <div className="settings-card-ctrl">
                      <div className="ctrl-header">
                        <h4>Featured Collection</h4>
                        <button className="btn btn-secondary" onClick={() => alert('Saved!')}>Update</button>
                      </div>
                      <div className="form-group" style={{ marginTop: '16px' }}>
                        <label className="form-label">Select Category</label>
                        <select className="form-input" defaultValue="Bestsellers">
                          <option value="Bestsellers">Store Bestsellers</option>
                          <option value="New">New Arrivals</option>
                          <option value="Sale">Clearance Sale</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: REVIEWS */}
              {activeTab === 'reviews' && (
                <div className="tab-body animate-fade-in">
                  <h2>Review Moderation</h2>
                  <p className="tab-section-desc">Approve or reject customer reviews before they appear on product pages.</p>

                  <div className="admin-products-list">
                    <div className="products-table-wrapper">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Customer & Product</th>
                            <th>Rating</th>
                            <th>Review Content</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>
                              <strong>Sarah J.</strong>
                              <div style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>Venus Rose Flutter Massager</div>
                            </td>
                            <td style={{ color: 'var(--accent)' }}>★★★★★</td>
                            <td>"Absolutely incredible! The discreet shipping was greatly appreciated, and the product itself is high-quality medical grade silicone."</td>
                            <td>
                              <div className="table-actions-row">
                                <button className="btn-table edit-btn" onClick={() => alert('Review Approved and published!')}>Approve</button>
                                <button className="btn-table delete-btn" onClick={() => alert('Review Rejected.')}>Reject</button>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <strong>Anonymous Customer</strong>
                              <div style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>Luxury Leather Hand Cuffs</div>
                            </td>
                            <td style={{ color: 'var(--accent)' }}>★★★★☆</td>
                            <td>"Very soft lining and durable. Only taking off one star because I wish they came in more colors."</td>
                            <td>
                              <div className="table-actions-row">
                                <button className="btn-table edit-btn" onClick={() => alert('Review Approved and published!')}>Approve</button>
                                <button className="btn-table delete-btn" onClick={() => alert('Review Rejected.')}>Reject</button>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <strong>M.K.</strong>
                              <div style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>Dual-Motor Rabbit Vibe</div>
                            </td>
                            <td style={{ color: 'var(--accent)' }}>★★★★★</td>
                            <td>"Best purchase I've made all year. Fast shipping to Mumbai too!"</td>
                            <td>
                              <div className="table-actions-row">
                                <button className="btn-table edit-btn" onClick={() => alert('Review Approved and published!')}>Approve</button>
                                <button className="btn-table delete-btn" onClick={() => alert('Review Rejected.')}>Reject</button>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: PAYTM CONFIG */}
              {activeTab === 'paytm' && (
                <div className="tab-body animate-fade-in">
                  <h2>Paytm Business Settings</h2>
                  <p className="tab-section-desc">Manage API credentials and switch sandbox layers for credit checkouts.</p>

                  <div className="config-card-form">
                    <form onSubmit={handleSavePaytm}>
                      <div className="form-group">
                        <label className="form-label" htmlFor="paytmenv">Gateway Mode</label>
                        <select
                          id="paytmenv"
                          className="form-input"
                          value={paytmEnv}
                          onChange={(e) => setPaytmEnv(e.target.value as any)}
                        >
                          <option value="SIMULATED">(Recommended) Simulated Paytm Sandbox (Offline)</option>
                          <option value="STAGE">Paytm Staging / Testing API (Online keys required)</option>
                          <option value="PROD">Paytm Live Production Environment (Live keys required)</option>
                        </select>
                      </div>

                      <div className="form-row-grid">
                        <div className="form-group">
                          <label className="form-label" htmlFor="paytmmid">Merchant ID (MID)</label>
                          <input
                            id="paytmmid"
                            type="text"
                            className="form-input"
                            placeholder="Enter your Paytm MID"
                            value={paytmMid}
                            onChange={(e) => setPaytmMid(e.target.value)}
                            disabled={paytmEnv === 'SIMULATED'}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label" htmlFor="paytmkey">Merchant Key</label>
                          <input
                            id="paytmkey"
                            type="password"
                            className="form-input"
                            placeholder="Enter your Merchant Key"
                            value={paytmKey}
                            onChange={(e) => setPaytmKey(e.target.value)}
                            disabled={paytmEnv === 'SIMULATED'}
                          />
                        </div>
                      </div>

                      {paytmEnv === 'SIMULATED' ? (
                        <div className="paytm-info-box alert-info">
                          💡 <strong>Simulation Mode Active:</strong> You do not need any Paytm credentials. The checkout will redirect to our simulated checkout portal matching Paytm's exact callback schemas. Ideal for presentation and local evaluations.
                        </div>
                      ) : (
                        <div className="paytm-info-box alert-warning">
                          ⚠️ <strong>Keys Required:</strong> To test Staging or Production checkout flow online, you must enter valid merchant credentials. Ensure your callback URLs are configured on the Paytm Developer dashboard.
                        </div>
                      )}

                      <button type="submit" className="btn btn-primary save-paytm-btn">
                        Apply Gateway Settings
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: SETTINGS */}
              {activeTab === 'settings' && (
                <div className="tab-body animate-fade-in">
                  <h2>General Store Settings</h2>
                  <p className="tab-section-desc">Manage site behaviors, legal modal displays, and shipping parameters.</p>

                  <div className="settings-controls-grid">
                    <div className="settings-card-ctrl">
                      <div className="ctrl-header">
                        <h4>18+ Age Gate Protection</h4>
                        <div className="toggle-switch">
                          <input 
                            type="checkbox" 
                            id="agegate-check"
                            checked={ageGateEnabled}
                            onChange={(e) => setAgeGateEnabled(e.target.checked)}
                          />
                          <label htmlFor="agegate-check"></label>
                        </div>
                      </div>
                      <p>Toggles the full-screen age verification modal warning on the landing page. We recommend leaving this active to comply with adult content laws.</p>
                    </div>

                    <div className="settings-card-ctrl">
                      <div className="ctrl-header">
                        <h4>Store UPI ID</h4>
                      </div>
                      <p>The UPI ID where payments will be collected manually via QR code.</p>
                      <div className="form-group" style={{ marginTop: '16px' }}>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={storeUpiId}
                          onChange={(e) => setStoreUpiId(e.target.value)}
                          placeholder="e.g. yourname@ybl"
                        />
                      </div>
                    </div>

                    <div className="settings-card-ctrl">
                      <div className="ctrl-header">
                        <h4>Local Inventory Reset</h4>
                        <button className="btn btn-secondary danger-btn" onClick={() => { if(confirm('Reset all catalog modifications back to initial 99 products?')) { localStorage.removeItem('feel_the_wellness_products'); window.location.reload(); } }}>
                          Restore Default Catalog
                        </button>
                      </div>
                      <p>Deletes all product additions and reverts edits back to the initial 99 sensual products database.</p>
                    </div>
                  </div>
                </div>
              )}
              </>
              )}
              </div> {/* End dashboard-content-area */}
      </main>

      {/* ================= ADD/EDIT PRODUCT MODAL ================= */}
      {isModalOpen && (
        <div className="modal-overlay flex-center">
          <div className="admin-modal">
            <div className="modal-header">
              <h2>{editingProduct ? 'Edit Intimate Product' : 'Add New Intimate Product'}</h2>
              <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            
            <form onSubmit={handleProductSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label" htmlFor="modal-name">Product Name *</label>
                <input
                  id="modal-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Venus Rose Flutter Massager"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>

              <div className="form-row-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="modal-price">Price (INR) *</label>
                  <input
                    id="modal-price"
                    type="number"
                    className="form-input"
                    placeholder="e.g. 4500"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="modal-cat">Category *</label>
                  <select
                    id="modal-cat"
                    className="form-input"
                    value={formCategory}
                    onChange={(e) => {
                      setFormCategory(e.target.value);
                      const cat = categoryTree.find(c => c.name === e.target.value);
                      if (cat) {
                        setFormSubcategory(cat.subcategories[0]);
                      }
                    }}
                  >
                    {categoryTree.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="modal-subcat">Subcategory *</label>
                  <select
                    id="modal-subcat"
                    className="form-input"
                    value={formSubcategory}
                    onChange={(e) => setFormSubcategory(e.target.value)}
                  >
                    {categoryTree.find(c => c.name === formCategory)?.subcategories.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="modal-desc">Sensual Copywriting Description *</label>
                <textarea
                  id="modal-desc"
                  rows={3}
                  className="form-input text-area"
                  placeholder="Describe the sensations this pleasure object provides..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  required
                />
              </div>

              <div className="form-row-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="modal-sil">Visual Silhouette *</label>
                  <select
                    id="modal-sil"
                    className="form-input"
                    value={formSilhouette}
                    onChange={(e) => setFormSilhouette(e.target.value as any)}
                  >
                    <option value="wand">Massage Wand</option>
                    <option value="rabbit">Rabbit Dual-Vibe</option>
                    <option value="bullet">Sleek Bullet Vibe</option>
                    <option value="dildo">Realistic Dildo</option>
                    <option value="butt-plug">Butt Plug (Jeweled)</option>
                    <option value="cup">Stroker Sleeve Cup</option>
                    <option value="ring">Intimacy Vibe C-Ring</option>
                    <option value="whip">Whip Flogger</option>
                    <option value="cuffs">Hand Cuffs Set</option>
                    <option value="blindfold">Blindfold Mask</option>
                    <option value="lube">Wellness Pump Bottle</option>
                    <option value="lingerie">Lace Bodice Lingerie</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="modal-col">Design Color Highlight</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      id="modal-col"
                      type="color"
                      className="form-input color-input"
                      value={formColor}
                      onChange={(e) => setFormColor(e.target.value)}
                    />
                    <div className="visual-preview-circle flex-center">
                      <ProductSilhouette type={formSilhouette as any} color={formColor} size={40} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="modal-features">Features (Comma-separated)</label>
                <input
                  id="modal-features"
                  type="text"
                  className="form-input"
                  placeholder="e.g. 10 speeds, Waterproof, Medical-grade silicone"
                  value={formFeatures}
                  onChange={(e) => setFormFeatures(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Product Images</label>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {formImages.map((img, index) => (
                    <div key={index} style={{ position: 'relative', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', width: '80px', height: '80px' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="Product Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button 
                        type="button" 
                        style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.7)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px' }}
                        onClick={() => setFormImages(prev => prev.filter((_, i) => i !== index))}
                        title="Remove Image"
                      >✕</button>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    id="new-image-url"
                    type="text"
                    className="form-input"
                    placeholder="Enter new image URL..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        if (input.value.trim()) {
                          setFormImages(prev => [...prev, input.value.trim()]);
                          input.value = '';
                        }
                      }
                    }}
                  />
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    style={{ padding: '8px 16px' }}
                    onClick={() => {
                      const input = document.getElementById('new-image-url') as HTMLInputElement;
                      if (input && input.value.trim()) {
                        setFormImages(prev => [...prev, input.value.trim()]);
                        input.value = '';
                      }
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="form-row-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="modal-rating">Rating</label>
                  <input
                    id="modal-rating"
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={formRating}
                    onChange={(e) => setFormRating(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="modal-reviews">Reviews</label>
                  <input
                    id="modal-reviews"
                    type="number"
                    className="form-input"
                    value={formReviews}
                    onChange={(e) => setFormReviews(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="modal-discount">Discount %</label>
                  <input
                    id="modal-discount"
                    type="number"
                    className="form-input"
                    value={formDiscountPercent}
                    onChange={(e) => setFormDiscountPercent(e.target.value)}
                  />
                </div>
              </div>

              <div className="checkboxes-form-row">
                <label className="chk-container">
                  <input type="checkbox" checked={formIsNew} onChange={(e) => setFormIsNew(e.target.checked)} />
                  <span>Mark as "New Release"</span>
                </label>
                <label className="chk-container">
                  <input type="checkbox" checked={formIsBestSeller} onChange={(e) => setFormIsBestSeller(e.target.checked)} />
                  <span>Mark as "Bestseller"</span>
                </label>
                <label className="chk-container">
                  <input type="checkbox" checked={formIsOnSale} onChange={(e) => setFormIsOnSale(e.target.checked)} />
                  <span>On Sale</span>
                </label>
              </div>

              <button type="submit" className="btn btn-primary modal-save-btn">
                Save Pleasure Object
              </button>
            </form>
          </div>
        </div>
      )}
      {isSidebarOpen && <div className="mobile-sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}
      <style jsx global>{`
        .admin-app-container {
          display: flex;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          background: var(--bg-primary);
          position: relative;
        }

        .admin-mobile-topbar {
          display: none;
          height: 60px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
          align-items: center;
          padding: 0 16px;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
        }

        .hamburger-btn {
          background: none;
          border: none;
          color: var(--text-primary);
          margin-right: 16px;
          cursor: pointer;
        }

        .admin-sidebar {
          width: 280px;
          background: #060308;
          border-right: 1px solid var(--border-light);
          display: flex;
          flex-direction: column;
          transition: transform 0.3s ease;
          z-index: 200;
        }

        .sidebar-header {
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-light);
          margin-bottom: 16px;
        }

        .close-sidebar-btn {
          display: none;
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 1.2rem;
          cursor: pointer;
        }

        .admin-main-content {
          flex: 1;
          height: 100vh;
          overflow-y: auto;
          background: #0f0a14;
          padding: 32px;
        }

        .sidebar-footer {
          margin-top: auto;
          padding: 24px;
          border-top: 1px solid var(--border-light);
        }

        .sidebar-footer .logout-btn {
          width: 100%;
        }

        @media (max-width: 991px) {
          .admin-mobile-topbar {
            display: flex;
          }
          
          .admin-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            transform: translateX(-100%);
          }

          .admin-sidebar.open {
            transform: translateX(0);
          }

          .close-sidebar-btn {
            display: block;
          }

          .mobile-sidebar-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            backdrop-filter: blur(2px);
            z-index: 150;
          }

          .admin-main-content {
            padding-top: 92px; /* 60px topbar + 32px padding */
            padding-left: 16px;
            padding-right: 16px;
          }
        }

        /* Passcode gate card */
        .admin-login-card {
          flex-direction: column;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          max-width: 480px;
          margin: 40px auto;
          padding: 48px 32px;
          text-align: center;
          gap: 20px;
          box-shadow: var(--shadow-lg);
        }

        .admin-logo {
          font-family: var(--font-serif);
          font-size: 2.2rem;
          color: var(--text-primary);
        }

        .admin-login-card h2 {
          font-size: 1.3rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--accent);
          font-weight: 600;
        }

        .admin-login-card p {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .admin-login-form {
          width: 100%;
          text-align: left;
        }

        .passcode-input {
          text-align: center;
          font-size: 1.2rem;
          letter-spacing: 0.2em;
        }

        .login-btn {
          width: 100%;
          margin-top: 10px;
        }

        .admin-auth-error {
          background: rgba(220, 38, 38, 0.15);
          border: 1px solid rgba(220, 38, 38, 0.3);
          color: var(--accent-secondary);
          font-size: 0.85rem;
          padding: 10px;
          border-radius: 8px;
          width: 100%;
        }

        .gate-hint {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        /* Dashboard Panel */
        .admin-dashboard-panel {
          animation: fadeIn 0.4s ease-out;
        }

        .dashboard-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-light);
          padding-bottom: 24px;
          margin-bottom: 32px;
          gap: 16px;
        }

        .dashboard-title-row h1 {
          font-size: 2.2rem;
          color: var(--text-primary);
          margin-bottom: 6px;
        }

        .logout-btn {
          padding: 8px 16px;
          font-size: 0.8rem;
          flex-shrink: 0;
        }

        .admin-dashboard-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
        }

        @media (min-width: 992px) {
          .admin-dashboard-layout {
            grid-template-columns: 280px 1fr;
            align-items: start;
          }
        }

        .dashboard-tabs.vertical-tabs {
          display: flex;
          flex-direction: column;
          gap: 8px;
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 24px;
          overflow-x: visible;
          overflow-y: auto;
          flex: 1;
        }

        .dashboard-tabs.vertical-tabs .tab-btn {
          padding: 16px 20px;
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.95rem;
          border-radius: 8px;
          transition: var(--transition-fast);
          text-align: left;
          border: 1px solid transparent;
          background: rgba(255, 255, 255, 0.02);
        }

        .dashboard-tabs.vertical-tabs .tab-btn:hover {
          color: var(--text-primary);
          background: rgba(255,255,255,0.05);
        }

        .dashboard-tabs.vertical-tabs .tab-btn.active {
          color: var(--accent);
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.3);
        }

        .dashboard-content-area {
          background: rgba(255,255,255,0.01);
          border-radius: 12px;
          border: 1px solid var(--border-light);
          padding: 32px;
          min-height: 500px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
          backdrop-filter: blur(10px);
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .kpi-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-light);
          padding: 20px;
          border-radius: 12px;
        }

        .kpi-card h4 {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin-bottom: 8px;
        }

        .kpi-val {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .kpi-trend {
          font-size: 0.8rem;
          font-weight: 600;
        }
        .kpi-trend.positive { color: #4caf50; }
        .kpi-trend.negative { color: #f44336; }
        .kpi-trend.neutral { color: var(--text-muted); }

        .analytics-chart-placeholder {
          background: rgba(255,255,255,0.02);
          border: 1px dashed var(--border-light);
          border-radius: 12px;
          padding: 30px;
          display: flex;
          flex-direction: column;
          height: 300px;
        }

        .chart-title {
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: auto;
        }

        .mock-bars {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          height: 150px;
          margin-bottom: 12px;
          gap: 10px;
        }

        .bar {
          background: rgba(212, 175, 55, 0.4);
          width: 100%;
          border-radius: 4px 4px 0 0;
          transition: height 1s ease-in-out;
        }

        .mock-days {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .tab-btn.active {
          color: var(--accent);
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-bottom-color: var(--bg-primary);
          position: relative;
        }

        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 1px;
          background: var(--bg-primary);
        }

        .tab-body h2 {
          font-size: 1.5rem;
          color: var(--text-primary);
          margin-bottom: 12px;
        }

        .tab-section-desc {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin-bottom: 32px;
        }

        .tab-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        /* Order Log Cards */
        .orders-timeline {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .order-log-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          padding: 24px;
        }

        .order-log-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-light);
          padding-bottom: 16px;
          margin-bottom: 20px;
        }

        .order-log-id {
          font-size: 1.05rem;
          color: var(--text-primary);
          margin-right: 16px;
        }

        .order-log-date {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .order-log-price {
          font-family: var(--font-serif);
          font-size: 1.4rem;
          color: var(--accent);
          font-weight: 500;
        }

        .order-log-split {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
        }

        @media (min-width: 768px) {
          .order-log-split {
            grid-template-columns: 1fr 1.2fr;
          }
        }

        .order-log-split h4 {
          font-family: var(--font-sans);
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--accent-secondary);
          margin-bottom: 12px;
          letter-spacing: 0.05em;
        }

        .shipping-block p {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 6px;
        }

        .items-block ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .items-block li {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          color: var(--text-secondary);
          border-bottom: 1px dashed rgba(255,255,255,0.05);
          padding-bottom: 6px;
        }

        /* Products Tab Table */
        .search-filter-row {
          margin-bottom: 24px;
        }

        .products-table-wrapper {
          overflow-x: auto;
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          background: var(--bg-secondary);
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.9rem;
        }

        .admin-table th, .admin-table td {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-light);
        }

        .admin-table th {
          font-family: var(--font-sans);
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.8rem;
          letter-spacing: 0.05em;
          color: var(--accent);
          background: rgba(0, 0, 0, 0.15);
        }

        .admin-table tr:hover {
          background: rgba(255,255,255,0.01);
        }

        .table-visual-box {
          background: rgba(10,5,13,0.5);
          border-radius: 6px;
          width: 48px;
          height: 48px;
          border: 1px solid var(--border-light);
        }

        .table-product-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .table-product-info .p-name {
          color: var(--text-primary);
        }

        .table-product-info .p-id {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .table-p-price {
          font-family: var(--font-serif);
          font-weight: 500;
          color: var(--accent-light);
        }

        .table-badges-row {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .table-actions-row {
          display: flex;
          gap: 12px;
        }

        .btn-table {
          padding: 6px 14px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .edit-btn {
          border: 1px solid rgba(255, 42, 133, 0.3);
          color: var(--accent);
        }

        .edit-btn:hover {
          background: rgba(255, 42, 133, 0.08);
          border-color: var(--accent);
        }

        .delete-btn {
          border: 1px solid rgba(220, 38, 38, 0.3);
          color: var(--accent-secondary);
        }

        .delete-btn:hover {
          background: rgba(220, 38, 38, 0.08);
          border-color: #dc2626;
        }

        .admin-pagination {
          margin-top: 24px;
          gap: 16px;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .page-nav-btn {
          background: var(--bg-secondary);
          border: 1px solid var(--border-light);
          color: var(--text-primary);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .page-nav-btn:hover:not(:disabled) {
          border-color: var(--accent);
          color: var(--accent);
        }

        .page-nav-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        /* Config Paytm tab */
        .config-card-form {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          padding: 32px;
          max-width: 700px;
        }

        .paytm-info-box {
          padding: 16px 20px;
          border-radius: 8px;
          font-size: 0.85rem;
          line-height: 1.5;
          margin: 24px 0;
        }

        .alert-info {
          background: rgba(255, 42, 133, 0.04);
          border: 1px dashed var(--border-color);
          color: var(--text-secondary);
        }

        .alert-warning {
          background: rgba(168, 51, 255, 0.05);
          border: 1px dashed var(--border-hover);
          color: var(--text-secondary);
        }

        .save-paytm-btn {
          padding: 12px 24px;
        }

        /* Settings Tab */
        .settings-controls-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-width: 700px;
        }

        .settings-card-ctrl {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          padding: 24px;
        }

        .ctrl-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .ctrl-header h4 {
          font-family: var(--font-sans);
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .settings-card-ctrl p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .danger-btn {
          padding: 8px 16px;
          font-size: 0.8rem;
          border-color: rgba(220,38,38,0.4);
          color: var(--accent-secondary);
        }

        .danger-btn:hover {
          background: rgba(220,38,38,0.1);
          border-color: red;
        }

        /* Checkbox slider toggler toggle-switch */
        .toggle-switch {
          position: relative;
          width: 50px;
          height: 24px;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-switch label {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--bg-tertiary);
          transition: .4s;
          border-radius: 24px;
          border: 1px solid var(--border-light);
        }

        .toggle-switch label:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 3px;
          bottom: 3px;
          background-color: var(--text-muted);
          transition: .4s;
          border-radius: 50%;
        }

        .toggle-switch input:checked + label {
          background-color: rgba(255, 42, 133, 0.2);
          border-color: var(--accent);
        }

        .toggle-switch input:checked + label:before {
          transform: translateX(26px);
          background-color: var(--accent);
        }

        /* Empty states */
        .empty-state-box {
          flex-direction: column;
          background: rgba(0,0,0,0.1);
          border: 1px dashed var(--border-light);
          padding: 64px 32px;
          border-radius: var(--border-radius);
          text-align: center;
          gap: 12px;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 8px;
        }

        .empty-state-box h3 {
          font-size: 1.25rem;
          color: var(--text-primary);
        }

        .empty-state-box p {
          max-width: 440px;
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        /* Modal styling */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(5, 2, 7, 0.85);
          z-index: 1000;
          padding: 24px;
          backdrop-filter: blur(8px);
        }

        .admin-modal {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          max-width: 600px;
          width: 100%;
          padding: 32px;
          box-shadow: var(--shadow-lg);
          max-height: 90vh;
          overflow-y: auto;
          animation: fadeIn 0.3s ease-out;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-light);
          padding-bottom: 16px;
          margin-bottom: 24px;
        }

        .modal-header h2 {
          font-size: 1.35rem;
          color: var(--accent);
        }

        .close-modal-btn {
          font-size: 1.2rem;
          color: var(--text-muted);
          cursor: pointer;
        }

        .close-modal-btn:hover {
          color: var(--text-primary);
        }

        .modal-form {
          display: flex;
          flex-direction: column;
        }

        .text-area {
          resize: vertical;
        }

        .color-input {
          padding: 4px;
          height: 48px;
          width: 64px;
          cursor: pointer;
        }

        .visual-preview-circle {
          background: rgba(10,5,13,0.5);
          border-radius: 50%;
          width: 48px;
          height: 48px;
          border: 1px solid var(--border-color);
        }

        .checkboxes-form-row {
          display: flex;
          gap: 24px;
          margin: 16px 0 24px;
        }

        .chk-container {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          color: var(--text-secondary);
          cursor: pointer;
        }

        .chk-container input {
          width: 16px;
          height: 16px;
          accent-color: var(--accent);
        }

        .modal-save-btn {
          width: 100%;
          padding: 14px 28px;
        }
      `}</style>
    </div>
  );

  // Helper workaround for compiler naming mismatch inside callback trigger
  function handleLoginSubmit(e: React.FormEvent) {
    handleAuthSubmit(e);
  }
}
