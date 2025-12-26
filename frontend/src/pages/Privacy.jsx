import React from 'react';

const Privacy = () => {
  return (
    <div className="bg-white py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last Updated: December 2025</p>

        <div className="prose prose-purple text-gray-600">
            <p>Your privacy matters to us. This policy explains how we handle your data.</p>
            
            <h3 className="text-gray-900 font-bold mt-6 mb-2">1. Information We Collect</h3>
            <p>We collect your name, email, and payment history to facilitate transactions. We do not see or store your full credit card numbers; these are handled by Stripe.</p>

            <h3 className="text-gray-900 font-bold mt-6 mb-2">2. How We Use Data</h3>
            <p>We use your data to:
                <ul className="list-disc pl-5 mt-2">
                    <li>Process transactions and Escrow payments.</li>
                    <li>Verify identities to prevent fraud.</li>
                    <li>Send transaction notifications.</li>
                </ul>
            </p>

            <h3 className="text-gray-900 font-bold mt-6 mb-2">3. Data Sharing</h3>
            <p>We do not sell your personal data. We only share necessary data with our payment processor (Stripe) to complete your purchases.</p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;