'use client';
import React, { useState, useEffect } from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { verifyAndGetOrder, Order } from '../../actions/orders';

export default function TrackOrderPage({ params }: { params: Promise<{ orderId: string }> }) {
  const [orderId, setOrderId] = useState<string>('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    params.then(p => setOrderId(p.orderId));
  }, [params]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const verifiedOrder = await verifyAndGetOrder(orderId, phone);
      if (verifiedOrder) {
        setOrder(verifiedOrder);
        setIsAuthenticated(true);
      } else {
        setError('Invalid phone number or order ID.');
      }
    } catch (err) {
      setError('An error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  if (!orderId) return null;

  if (!isAuthenticated || !order) {
    return (
      <>
        <Header />
        <div className="flex-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: '16px', padding: '24px' }}>
          <h2 className="glow-text" style={{ textAlign: 'center' }}>Secure Order Tracking</h2>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '400px' }}>
            To protect your privacy, please enter the phone number associated with order <strong>{orderId}</strong>.
          </p>
          
          <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '320px', marginTop: '24px' }}>
            <div>
              <input 
                type="text" 
                placeholder="Enter Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem'
                }}
                required
              />
            </div>
            {error && <div style={{ color: 'var(--error)', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Verifying...' : 'View Order Details'}
            </button>
          </form>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="track-page-container container animate-fade-in" style={{ padding: '60px 24px', minHeight: '70vh' }}>
        <h1 className="glow-text" style={{ textAlign: 'center', marginBottom: '8px' }}>Track Your Order</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '40px' }}>Order: <strong>{order.orderId}</strong></p>
        
        <div className="order-details-card" style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '32px',
          maxWidth: '600px',
          margin: '0 auto',
          boxShadow: 'var(--shadow-lg)'
        }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '24px', marginBottom: '24px' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Date Placed</p>
              <p>{new Date(order.date).toLocaleDateString()}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Total Amount</p>
              <p className="glow-text" style={{ fontSize: '1.2rem', fontWeight: 600 }}>₹{order.amount.toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ marginBottom: '16px', color: 'var(--accent)' }}>Delivery Status</h3>
            
            <div className="status-timeline">
              <div className={`timeline-step ${order.status === 'VERIFIED' ? 'active' : ''}`}>
                <div className="step-icon">💳</div>
                <div className="step-text">Payment {order.status === 'PENDING' ? 'Pending' : order.status === 'VERIFIED' ? 'Verified' : 'Failed'}</div>
              </div>
              
              <div className={`timeline-step ${order.deliveryStatus === 'PROCESSING' ? 'active' : ''}`}>
                <div className="step-icon">📦</div>
                <div className="step-text">Processing</div>
              </div>

              <div className={`timeline-step ${order.deliveryStatus === 'SHIPPED' ? 'active' : ''}`}>
                <div className="step-icon">🚚</div>
                <div className="step-text">Dispatched in discreet packaging</div>
              </div>

              <div className={`timeline-step ${order.deliveryStatus === 'DELIVERED' ? 'active' : ''}`}>
                <div className="step-icon">✨</div>
                <div className="step-text">Delivered</div>
              </div>
            </div>
            
            {order.deliveryNote && (
              <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '8px', fontSize: '0.9rem' }}>
                <strong>Note from Admin:</strong> {order.deliveryNote}
              </div>
            )}
          </div>

          <div>
            <h3 style={{ marginBottom: '16px', color: 'var(--accent)' }}>Order Items</h3>
            <div className="items-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {order.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-primary)', padding: '12px 16px', borderRadius: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 500, marginBottom: '4px' }}>{item.name}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Qty: {item.quantity}</p>
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
