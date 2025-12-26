import React from 'react';

const Terms = () => {
  return (
    <div className="bg-white py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-gray-500 mb-8">Last Updated: December 2025</p>

        <div className="prose prose-purple text-gray-600">
            <p>Welcome to BidPulse. By using our website, you agree to these terms.</p>
            
            <h3 className="text-gray-900 font-bold mt-6 mb-2">1. User Accounts</h3>
            <p>You are responsible for maintaining the security of your account. You must be at least 18 years old to use this service.</p>

            <h3 className="text-gray-900 font-bold mt-6 mb-2">2. Bidding & Buying</h3>
            <p>All bids are binding. If you win an auction, you are legally obligated to complete the purchase.</p>

            <h3 className="text-gray-900 font-bold mt-6 mb-2">3. Fees</h3>
            <p>BidPulse charges a commission of 8% on the final sale price of completed auctions. This fee is automatically deducted before funds are released to the seller.</p>
            
            <h3 className="text-gray-900 font-bold mt-6 mb-2">4. Prohibited Items</h3>
            <p>We do not allow the sale of illegal goods, weapons, hazardous materials, or counterfeit items.</p>
        </div>
      </div>
    </div>
  );
};

export default Terms;