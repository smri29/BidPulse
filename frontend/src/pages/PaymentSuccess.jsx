import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const PaymentSuccess = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <div className="bg-green-100 p-6 rounded-full mb-6">
        <CheckCircle className="h-16 w-16 text-green-600" />
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
      <p className="text-xl text-gray-600 max-w-md mb-8">
        Your payment has been securely processed and is currently held in escrow. 
        The seller has been notified to ship your item.
      </p>
      <Link 
        to="/" 
        className="bg-bid-purple text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
      >
        Continue Shopping
      </Link>
    </div>
  );
};

export default PaymentSuccess;