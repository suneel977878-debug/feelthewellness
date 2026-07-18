import React from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import TrackOrderClient from './TrackOrderClient';

export default async function TrackOrderPage({ params }: { params: Promise<{ orderId: string }> }) {
  const resolvedParams = await params;
  const orderId = resolvedParams.orderId || '';

  return (
    <>
      <Header />
      <TrackOrderClient orderId={orderId} />
      <Footer />
    </>
  );
}
