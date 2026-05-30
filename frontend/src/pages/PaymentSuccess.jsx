/**
 * Module: pages/PaymentSuccess.jsx
 * Purpose: Supports the Payment Success module and keeps its responsibility isolated by file name.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import axios from '../utils/axiosConfig';

// Stripe redirects here after checkout. The page attempts a final confirmation sync with the backend.
const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [isConfirming, setIsConfirming] = useState(true);
  const [confirmMessage, setConfirmMessage] = useState('Finalizing your order...');

  const sessionId = useMemo(() => searchParams.get('session_id') || '', [searchParams]);
  const auctionId = useMemo(() => searchParams.get('auction_id') || '', [searchParams]);

  useEffect(() => {
    const confirmPayment = async () => {
      if (!sessionId || !auctionId) {
        setConfirmMessage('Payment completed. Open auction details to continue delivery tracking.');
        setIsConfirming(false);
        return;
      }

      try {
        const { data } = await axios.post('/payment/confirm-success', { sessionId, auctionId });
        setConfirmMessage(data?.message || 'Payment confirmed. Shipping is now in progress.');
      } catch (error) {
        setConfirmMessage(error.response?.data?.message || 'Payment is successful, but status sync is pending. Please open auction details and refresh once.');
      } finally {
        setIsConfirming(false);
      }
    };

    confirmPayment();
  }, [sessionId, auctionId]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <div className="bg-green-100 p-6 rounded-full mb-6">
        <CheckCircle className="h-16 w-16 text-green-600" />
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
      <p className="text-xl text-gray-600 max-w-md mb-8">
        {isConfirming
          ? 'We are confirming your payment and switching your order to delivery flow...'
          : 'Your payment has been processed. AuctionPulse has started fulfillment and will deliver the product within 7-14 days.'}
      </p>
      <p className="text-sm text-gray-500 max-w-xl mb-6">{confirmMessage}</p>
      <div className="flex items-center gap-3">
        <Link
          to={auctionId ? `/auction/${auctionId}` : '/'}
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition"
        >
          Open Order
        </Link>
        <Link 
          to="/" 
          className="bg-bid-purple text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;

