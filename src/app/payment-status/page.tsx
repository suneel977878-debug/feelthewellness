'use client';

import React, { useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useCart } from '../../context/CartContext';
import { createOrder } from '../actions/orders';

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const { cart, clearCart } = useCart();

  // Retrieve parameters
  const status = searchParams.get('status') || 'FAILED';
  const orderId = searchParams.get('orderId') || 'N/A';
  const txnId = searchParams.get('txnId') || 'N/A';
  const amount = searchParams.get('amount') || '0';
  const respMsg = searchParams.get('respMsg') || 'The transaction was cancelled or declined by your bank.';

  const isSuccess = status === 'SUCCESS';
  const isPending = status === 'PENDING';
  const utr = searchParams.get('utr') || '';
  const paymentApp = searchParams.get('app') || '';

  const hasSubmitted = React.useRef(false);

  // Record order and clear cart if transaction succeeded or is pending
  useEffect(() => {
    if ((isSuccess || isPending) && cart.length > 0 && !hasSubmitted.current) {
      hasSubmitted.current = true;
      createOrder({
        orderId: orderId,
        amount: parseFloat(amount),
        status: isPending ? 'PENDING' : 'VERIFIED',
        utr: utr,
        paymentApp: paymentApp,
        customer: {
          name: localStorage.getItem('lp_last_customer_name') || 'Guest Customer',
          phone: localStorage.getItem('lp_last_customer_phone') || 'N/A',
          address: localStorage.getItem('lp_last_customer_address') || 'N/A'
        },
        items: cart.map(item => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity
        }))
      });
      clearCart();
    }
  }, [isSuccess, isPending, cart, clearCart, orderId, amount, utr, paymentApp]);

  return (
    <div className="status-page-layout flex-center">
      <div className="container status-container flex-center">
        
        {isSuccess || isPending ? (
          /* SUCCESS OR PENDING STATUS PANE */
          <div className="status-card success-card animate-fade-in">
            <div className="status-icon-wrapper success-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            
            <h1 className="glow-text">{isPending ? 'Payment Verification Pending!' : 'Sensual Desires Confirmed!'}</h1>
            <p className="status-lead">
              {isPending 
                ? 'Your discreet package will be dispatched as soon as our team verifies your UTR Reference Number.' 
                : 'Your payment has been successfully processed via Paytm. Your intimate journey has begun.'}
            </p>

            <div className="receipt-box">
              <h3>Transaction Receipt</h3>
              <div className="receipt-row">
                <span>Order Reference:</span>
                <strong>{orderId}</strong>
              </div>
              {isPending ? (
                <>
                  <div className="receipt-row">
                    <span>Payment App:</span>
                    <strong style={{ textTransform: 'capitalize' }}>{paymentApp}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>UTR Ref Number:</span>
                    <strong>{utr}</strong>
                  </div>
                </>
              ) : (
                <div className="receipt-row">
                  <span>Paytm Txn ID:</span>
                  <strong>{txnId}</strong>
                </div>
              )}
              <div className="receipt-row">
                <span>Amount Paid:</span>
                <strong className="accent-text">₹{parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div className="receipt-row">
                <span>Payment Mode:</span>
                <span>{isPending ? 'Manual UPI' : 'Paytm Secured Gateway'}</span>
              </div>
            </div>

            <div className="discreet-promise-block">
              <h4>🔒 Ultimate Privacy Guarantee</h4>
              <p>
                We value your privacy. Your order will be packed in anonymous brown cartons with no identifiers. The transaction descriptor on your credit card/bank statement will show as <strong>"LP Logistics"</strong>, ensuring 100% confidentiality.
              </p>
            </div>

            <div className="status-actions">
              <Link href="/catalog" className="btn btn-primary">
                Continue Exploring Boutique
              </Link>
              <Link href="/" className="btn btn-secondary">
                Return to Home
              </Link>
            </div>
          </div>
        ) : (
          /* FAILURE STATUS PANE */
          <div className="status-card failure-card animate-fade-in">
            <div className="status-icon-wrapper failure-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </div>

            <h1>Transaction Unsuccessful</h1>
            <p className="status-lead text-error">The transaction could not be processed by Paytm Business.</p>

            <div className="failure-details-box">
              <span className="error-label">Decline Reason:</span>
              <p className="error-message">{respMsg}</p>
            </div>

            <p className="failure-help">
              Don't worry, your intimacy basket items have been preserved. You can return to your cart and attempt checking out again.
            </p>

            <div className="status-actions">
              <Link href="/cart" className="btn btn-primary">
                Return to Cart & Retry
              </Link>
              <Link href="/catalog" className="btn btn-secondary">
                Browse Other Delights
              </Link>
            </div>
          </div>
        )}

      </div>

      <style jsx global>{`
        .status-page-layout {
          min-height: 80vh;
          background: var(--bg-primary);
          padding: 60px 24px 80px;
        }

        .status-container {
          flex-direction: column;
          width: 100%;
        }

        .status-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          padding: 48px 32px;
          max-width: 580px;
          width: 100%;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: var(--shadow-lg);
        }

        .status-card.success-card {
          border-color: rgba(50, 168, 82, 0.2);
          box-shadow: 0 0 30px rgba(50, 168, 82, 0.05);
        }

        .status-card.failure-card {
          border-color: rgba(220, 38, 38, 0.2);
          box-shadow: 0 0 30px rgba(220, 38, 38, 0.05);
        }

        .status-icon-wrapper {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }

        .success-icon {
          background: rgba(50, 168, 82, 0.1);
          color: #32a852;
          border: 2px solid rgba(50, 168, 82, 0.3);
        }

        .failure-icon {
          background: rgba(220, 38, 38, 0.1);
          color: #dc2626;
          border: 2px solid rgba(220, 38, 38, 0.3);
        }

        .status-card h1 {
          font-size: 2.2rem;
          margin-bottom: 12px;
          color: var(--text-primary);
        }

        .status-lead {
          font-size: 1.05rem;
          color: var(--text-secondary);
          max-width: 460px;
          line-height: 1.6;
          margin-bottom: 32px;
        }

        .text-error {
          color: var(--accent-secondary);
        }

        /* Receipt block */
        .receipt-box {
          width: 100%;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-light);
          border-radius: var(--border-radius);
          padding: 24px;
          margin-bottom: 32px;
          text-align: left;
        }

        .receipt-box h3 {
          font-family: var(--font-sans);
          font-size: 0.9rem;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--accent);
          border-bottom: 1px solid var(--border-light);
          padding-bottom: 12px;
          margin-bottom: 16px;
          letter-spacing: 0.05em;
        }

        .receipt-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          margin-bottom: 12px;
          color: var(--text-secondary);
        }

        .receipt-row:last-child {
          margin-bottom: 0;
        }

        .receipt-row strong {
          color: var(--text-primary);
        }

        .accent-text {
          color: var(--accent) !important;
          font-size: 1.1rem;
        }

        /* Failure specifics */
        .failure-details-box {
          background: rgba(220, 38, 38, 0.03);
          border: 1px dashed rgba(220, 38, 38, 0.3);
          border-radius: var(--border-radius);
          padding: 16px 20px;
          width: 100%;
          text-align: left;
          margin-bottom: 24px;
        }

        .error-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          font-weight: 700;
          color: var(--accent-secondary);
          display: block;
          margin-bottom: 4px;
        }

        .error-message {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .failure-help {
          font-size: 0.9rem;
          color: var(--text-muted);
          line-height: 1.5;
          margin-bottom: 32px;
          max-width: 440px;
        }

        /* Discreet Promise Block */
        .discreet-promise-block {
          background: rgba(212, 175, 55, 0.02);
          border: 1px dashed var(--border-color);
          border-radius: var(--border-radius);
          padding: 20px 24px;
          width: 100%;
          text-align: left;
          margin-bottom: 32px;
        }

        .discreet-promise-block h4 {
          font-family: var(--font-sans);
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--accent);
          margin-bottom: 8px;
        }

        .discreet-promise-block p {
          font-size: 0.85rem;
          line-height: 1.6;
          color: var(--text-secondary);
        }

        /* Actions */
        .status-actions {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
        }

        @media (min-width: 480px) {
          .status-actions {
            flex-direction: row;
            justify-content: center;
          }
          .status-actions :global(.btn) {
            flex: 1;
            max-width: 240px;
          }
        }
      `}</style>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <>
      <Header />
      <Suspense fallback={
        <div className="flex-center" style={{ minHeight: '80vh', flexDirection: 'column', gap: '20px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(212, 175, 55, 0.1)', borderTopColor: 'var(--accent)', animation: 'spin 1s linear infinite' }}></div>
          <p>Verifying transaction receipt...</p>
        </div>
      }>
        <PaymentStatusContent />
      </Suspense>
      <Footer />
    </>
  );
}
