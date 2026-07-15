'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function PaytmMockContent() {
  const searchParams = useSearchParams();

  // Retrieve parameters from initiate route
  const orderId = searchParams.get('orderId') || 'ORD-UNKNOWN';
  const amount = searchParams.get('amount') || '0';
  const callbackUrl = searchParams.get('callbackUrl') || '/api/paytm/callback';
  const customerName = searchParams.get('customerName') || 'Sahil Sharma';

  // Local payment states
  const [selectedMethod, setSelectedMethod] = useState('qr');
  const [loadingState, setLoadingState] = useState(''); // '', 'processing', 'redirecting'
  const [targetStatus, setTargetStatus] = useState<'SUCCESS' | 'FAILED' | 'CANCELLED'>('SUCCESS');

  const handleSimulatePayment = (status: 'SUCCESS' | 'FAILED' | 'CANCELLED') => {
    setTargetStatus(status);
    setLoadingState('processing');

    const phrases = [
      'Establishing secure connection to Bank servers...',
      'Authorizing transaction amount...',
      'Validating token authentication signatures...',
      'Finalizing transaction status...'
    ];

    let currentPhraseIdx = 0;
    const interval = setInterval(() => {
      if (currentPhraseIdx < phrases.length) {
        setLoadingState(phrases[currentPhraseIdx]);
        currentPhraseIdx++;
      } else {
        clearInterval(interval);
        submitCallback(status);
      }
    }, 1000);
  };

  const submitCallback = (status: 'SUCCESS' | 'FAILED' | 'CANCELLED') => {
    // Generate transaction details
    const txnId = `LP-TXN-${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const statusVal = status === 'SUCCESS' ? 'TXN_SUCCESS' : 'TXN_FAILURE';
    const respCode = status === 'SUCCESS' ? '01' : status === 'CANCELLED' ? '227' : '102';
    const respMsg = status === 'SUCCESS' 
      ? 'Txn Success' 
      : status === 'CANCELLED' 
        ? 'Transaction cancelled by customer' 
        : 'Payment failed due to insufficient credit limit.';

    // Create a form programmatically and submit it via POST to the callback URL
    // This perfectly mimics how Paytm POSTs transaction responses to our merchant endpoint
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = callbackUrl;

    const params: Record<string, string> = {
      ORDERID: orderId,
      TXNAMOUNT: amount,
      TXNID: txnId,
      STATUS: statusVal,
      RESPCODE: respCode,
      RESPMSG: respMsg,
      isMock: 'true'
    };

    Object.entries(params).forEach(([key, val]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = val;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  return (
    <div className="paytm-mock-layout">
      {loadingState ? (
        /* Loader screen */
        <div className="gateway-loader-screen flex-center">
          <div className="gateway-spinner"></div>
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo.JPG" 
            alt="Paytm" 
            className="loader-logo" 
            onError={(e)=>{e.currentTarget.style.display='none'}}
          />
          <h2>Paytm Secure Gateway</h2>
          <p className="loading-status-text">{loadingState}</p>
          <div className="progress-bar-container">
            <div className="progress-bar-fill"></div>
          </div>
        </div>
      ) : (
        /* Gateway Checkout Interface */
        <div className="gateway-card">
          
          {/* Header */}
          <div className="gateway-header">
            <div className="logo-section">
              <span className="paytm-logo-text">paytm</span>
              <span className="gateway-badge">Secure Gateway</span>
            </div>
            <div className="merchant-info">
              <span className="label">Merchant:</span>
              <span className="value">FeelTheWellness Store</span>
            </div>
          </div>

          {/* Billing Ribbon */}
          <div className="billing-ribbon">
            <div className="bill-item">
              <span className="label">Order ID:</span>
              <span className="value">{orderId}</span>
            </div>
            <div className="bill-item amount-item">
              <span className="label">Amount:</span>
              <span className="value price-amount">₹{parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="gateway-body-split">
            {/* Left: Payment options menu */}
            <aside className="payment-options-sidebar">
              <button 
                className={`option-tab ${selectedMethod === 'qr' ? 'active' : ''}`}
                onClick={() => setSelectedMethod('qr')}
              >
                <span className="icon">📸</span>
                UPI QR Code
              </button>
              <button 
                className={`option-tab ${selectedMethod === 'card' ? 'active' : ''}`}
                onClick={() => setSelectedMethod('card')}
              >
                <span className="icon">💳</span>
                Credit / Debit Card
              </button>
              <button 
                className={`option-tab ${selectedMethod === 'wallet' ? 'active' : ''}`}
                onClick={() => setSelectedMethod('wallet')}
              >
                <span className="icon">💼</span>
                Paytm Wallet
              </button>
              <button 
                className={`option-tab ${selectedMethod === 'net' ? 'active' : ''}`}
                onClick={() => setSelectedMethod('net')}
              >
                <span className="icon">🏦</span>
                Net Banking
              </button>
            </aside>

            {/* Right: Active payment method display */}
            <main className="payment-form-area">
              
              {/* QR Code Tab */}
              {selectedMethod === 'qr' && (
                <div className="method-pane flex-center">
                  <h3>Scan QR Code to Pay</h3>
                  <div className="mock-qr-code flex-center">
                    {/* Simulated vector QR layout */}
                    <div className="qr-box-border flex-center">
                      <div className="qr-logo-overlay">LP</div>
                      <div className="qr-dots-pattern"></div>
                    </div>
                  </div>
                  <p className="qr-hint">Scan using Paytm App or any UPI app to pay ₹{amount}</p>
                </div>
              )}

              {/* Card Tab */}
              {selectedMethod === 'card' && (
                <div className="method-pane">
                  <h3>Enter Card Details</h3>
                  <div className="mock-card-form">
                    <div className="form-group">
                      <label className="form-label">Card Number</label>
                      <input type="text" className="form-input mock-input" placeholder="4532 •••• •••• 9812" disabled />
                    </div>
                    <div className="form-row-grid">
                      <div className="form-group">
                        <label className="form-label">Expiry Date</label>
                        <input type="text" className="form-input mock-input" placeholder="MM/YY" disabled />
                      </div>
                      <div className="form-group">
                        <label className="form-label">CVV</label>
                        <input type="password" className="form-input mock-input" placeholder="•••" disabled />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Wallet Tab */}
              {selectedMethod === 'wallet' && (
                <div className="method-pane">
                  <h3>Paytm Wallet Balance</h3>
                  <div className="wallet-balance-box">
                    <div className="balance-info">
                      <span>Available Balance:</span>
                      <strong className="wallet-bal">₹4,250.00</strong>
                    </div>
                    <p className="wallet-warning">Wallet balance is insufficient. Remaining amount will be debited from linked bank account.</p>
                  </div>
                </div>
              )}

              {/* Net banking Tab */}
              {selectedMethod === 'net' && (
                <div className="method-pane">
                  <h3>Select Popular Banks</h3>
                  <div className="banks-grid">
                    <button className="bank-logo-btn" disabled>SBI</button>
                    <button className="bank-logo-btn" disabled>HDFC</button>
                    <button className="bank-logo-btn" disabled>ICICI</button>
                    <button className="bank-logo-btn" disabled>AXIS</button>
                  </div>
                </div>
              )}

              {/* SIMULATION ACTIONS PANEL */}
              <div className="simulation-actions-panel">
                <h4>Payment Sandbox Simulation</h4>
                <p>This is a simulated gateway checkout. Please select a transaction outcome below to test the integration routing:</p>
                
                <div className="simulator-buttons">
                  <button 
                    className="btn-paytm success"
                    onClick={() => handleSimulatePayment('SUCCESS')}
                  >
                    Simulate SUCCESSFUL Payment
                  </button>
                  <button 
                    className="btn-paytm failure"
                    onClick={() => handleSimulatePayment('FAILED')}
                  >
                    Simulate FAILED Payment
                  </button>
                  <button 
                    className="btn-paytm cancel"
                    onClick={() => handleSimulatePayment('CANCELLED')}
                  >
                    Cancel & Return to Cart
                  </button>
                </div>
              </div>

            </main>
          </div>

          <div className="gateway-footer">
            <p>🔒 128-Bit SSL Encrypted Connection. Paytm is PCI-DSS Compliant.</p>
          </div>

        </div>
      )}

      {/* Embedded CSS for Paytm styling */}
      <style jsx global>{`
        .paytm-mock-layout {
          background: #f4f6fa;
          min-height: 100vh;
          color: #333333;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        /* Loader Screen */
        .gateway-loader-screen {
          flex-direction: column;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          padding: 60px 40px;
          text-align: center;
          width: 100%;
          max-width: 480px;
          gap: 20px;
        }

        .gateway-spinner {
          width: 60px;
          height: 60px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #00b9f5;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .loader-logo {
          height: 24px;
          object-fit: contain;
        }

        .loading-status-text {
          font-size: 0.95rem;
          color: #666666;
          font-weight: 500;
        }

        .progress-bar-container {
          width: 100%;
          height: 4px;
          background: #e9eff4;
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          width: 70%;
          background: #00b9f5;
          border-radius: 2px;
          animation: loadProgress 4s ease-out infinite;
        }

        @keyframes loadProgress {
          0% { width: 0%; }
          100% { width: 100%; }
        }

        /* Card Layout */
        .gateway-card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          border: 1px solid #e9eff4;
          width: 100%;
          max-width: 850px;
          overflow: hidden;
        }

        .gateway-header {
          padding: 20px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e9eff4;
        }

        .paytm-logo-text {
          font-weight: 800;
          font-size: 2rem;
          color: #002e6e;
          letter-spacing: -0.05em;
        }

        .paytm-logo-text::after {
          content: '';
          display: inline-block;
          width: 12px;
          height: 12px;
          background: #00b9f5;
          border-radius: 50%;
          margin-left: 2px;
        }

        .gateway-badge {
          font-size: 0.7rem;
          background: #e9eff4;
          color: #002e6e;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 4px;
          text-transform: uppercase;
          margin-left: 12px;
          vertical-align: middle;
        }

        .merchant-info {
          font-size: 0.85rem;
        }

        .merchant-info .label {
          color: #777777;
          margin-right: 6px;
        }

        .merchant-info .value {
          font-weight: 700;
          color: #333;
        }

        /* Billing Ribbon */
        .billing-ribbon {
          background: #f5f9fc;
          padding: 16px 24px;
          border-bottom: 1px solid #e9eff4;
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
        }

        .bill-item {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .bill-item .label {
          color: #666666;
        }

        .bill-item .value {
          font-weight: 600;
          color: #333333;
        }

        .price-amount {
          color: #002e6e !important;
          font-size: 1.15rem;
          font-weight: 700 !important;
        }

        /* Split body */
        .gateway-body-split {
          display: flex;
          flex-direction: column;
          min-height: 400px;
        }

        @media (min-width: 650px) {
          .gateway-body-split {
            flex-direction: row;
          }
        }

        .payment-options-sidebar {
          background: #f8fafc;
          border-right: 1px solid #e9eff4;
          width: 100%;
          display: flex;
          flex-direction: row;
          overflow-x: auto;
        }

        @media (min-width: 650px) {
          .payment-options-sidebar {
            width: 240px;
            flex-direction: column;
            overflow-x: visible;
          }
        }

        .option-tab {
          padding: 16px 20px;
          text-align: left;
          font-weight: 600;
          font-size: 0.9rem;
          color: #555555;
          border-bottom: 1px solid #e9eff4;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .option-tab:hover {
          background: #f1f5f9;
        }

        .option-tab.active {
          background: white;
          color: #00b9f5;
          border-left: 4px solid #00b9f5;
        }

        @media (max-width: 649px) {
          .option-tab.active {
            border-left: none;
            border-bottom: 4px solid #00b9f5;
          }
        }

        .option-tab .icon {
          font-size: 1.1rem;
        }

        /* Form Area */
        .payment-form-area {
          flex: 1;
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
        }

        .method-pane {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 32px;
        }

        .method-pane h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #002e6e;
          margin-bottom: 8px;
        }

        /* QR simulation */
        .mock-qr-code {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
          width: 180px;
          height: 180px;
          margin: 0 auto;
        }

        .qr-box-border {
          width: 140px;
          height: 140px;
          background: repeating-conic-gradient(from 0deg, #111 0deg 90deg, #fff 90deg 180deg) 0 0/14px 14px;
          border: 4px solid #111;
          position: relative;
        }

        .qr-logo-overlay {
          position: absolute;
          background: #00b9f5;
          color: white;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.8rem;
          border: 2px solid white;
        }

        .qr-hint {
          text-align: center;
          font-size: 0.85rem;
          color: #777777;
        }

        /* Input Styles */
        .mock-card-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .mock-input {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          color: #777;
        }

        /* Wallet Styles */
        .wallet-balance-box {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 6px;
          padding: 16px;
        }

        .balance-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.95rem;
          margin-bottom: 8px;
        }

        .wallet-bal {
          color: #166534;
        }

        .wallet-warning {
          font-size: 0.8rem;
          color: #b45309;
        }

        /* Bank Styles */
        .banks-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .bank-logo-btn {
          border: 1px solid #cbd5e1;
          padding: 12px;
          border-radius: 4px;
          font-weight: 700;
          font-size: 0.9rem;
          background: #f8fafc;
          color: #64748b;
        }

        /* Sandbox Simulator Panel */
        .simulation-actions-panel {
          border-top: 1px solid #e9eff4;
          padding-top: 24px;
          margin-top: auto;
        }

        .simulation-actions-panel h4 {
          font-size: 0.95rem;
          font-weight: 700;
          color: #b45309;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .simulation-actions-panel p {
          font-size: 0.85rem;
          color: #666666;
          line-height: 1.5;
          margin-bottom: 16px;
        }

        .simulator-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        @media (min-width: 550px) {
          .simulator-buttons {
            flex-direction: row;
          }
        }

        .btn-paytm {
          flex: 1;
          padding: 12px 20px;
          border-radius: 4px;
          font-weight: 700;
          font-size: 0.88rem;
          cursor: pointer;
          text-align: center;
          transition: transform 0.1s;
        }

        .btn-paytm:active {
          transform: scale(0.98);
        }

        .btn-paytm.success {
          background: #00b9f5;
          color: white;
          border: none;
        }

        .btn-paytm.success:hover {
          background: #00a4db;
        }

        .btn-paytm.failure {
          background: #dc2626;
          color: white;
          border: none;
        }

        .btn-paytm.failure:hover {
          background: #b91c1c;
        }

        .btn-paytm.cancel {
          background: transparent;
          border: 1px solid #cbd5e1;
          color: #475569;
        }

        .btn-paytm.cancel:hover {
          background: #f8fafc;
        }

        .gateway-footer {
          background: #f5f9fc;
          padding: 12px 24px;
          text-align: center;
          font-size: 0.8rem;
          color: #666666;
          border-top: 1px solid #e9eff4;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function PaytmMockPage() {
  return (
    <Suspense fallback={
      <div className="flex-center" style={{ minHeight: '100vh', background: '#f4f6fa', flexDirection: 'column', gap: '20px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #e9eff4', borderTopColor: '#00b9f5', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ color: '#002e6e', fontWeight: 600 }}>Loading Paytm Gateway...</p>
      </div>
    }>
      <PaytmMockContent />
    </Suspense>
  );
}
