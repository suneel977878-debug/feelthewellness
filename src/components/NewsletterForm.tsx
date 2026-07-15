'use client';
import React, { useState } from 'react';

export default function NewsletterForm() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setNewsletterEmail('');
        setSubscribed(false);
      }, 4000);
    }
  };

  if (subscribed) {
    return (
      <div className="subscribe-success animate-fade-in">
        <span>✔ Check your inbox! Your 10% discount code has been dispatched.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubscribe} className="newsletter-form">
      <input
        type="email"
        placeholder="Enter your anonymous email address..."
        className="form-input newsletter-input"
        value={newsletterEmail}
        onChange={(e) => setNewsletterEmail(e.target.value)}
        required
      />
      <button type="submit" className="btn btn-primary newsletter-btn">
        Join The Club
      </button>
    </form>
  );
}
