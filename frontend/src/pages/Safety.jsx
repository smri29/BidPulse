import React from 'react';
import { ShieldCheck, Lock, Eye, AlertTriangle } from 'lucide-react';

const Safety = () => {
  return (
    <div className="bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-full mb-4">
                <ShieldCheck className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Trust & Safety</h1>
            <p className="text-xl text-gray-600">Your security is our #1 priority. Here is how we protect you.</p>
        </div>

        <div className="space-y-8">
            <SafetyCard 
                icon={<Lock className="text-blue-500" />}
                title="Escrow Protection"
                desc="We never send money directly to the seller instantly. When you pay, your funds are held in a secure Escrow account. The seller is only paid after YOU confirm that you have received the item."
            />
            <SafetyCard 
                icon={<Eye className="text-purple-500" />}
                title="Verified Transactions"
                desc="Every payment is processed through Stripe, a global leader in payment security. We do not store your credit card details on our servers."
            />
            <SafetyCard 
                icon={<AlertTriangle className="text-orange-500" />}
                title="Dispute Resolution"
                desc="If an item never arrives or isn't as described, our support team steps in. Since we hold the funds, we can refund you if the deal goes wrong."
            />
        </div>
      </div>
    </div>
  );
};

const SafetyCard = ({ icon, title, desc }) => (
    <div className="flex gap-6 p-6 bg-slate-50 rounded-xl border border-slate-100">
        <div className="flex-shrink-0 mt-1">
            <div className="bg-white p-3 rounded-full shadow-sm">{React.cloneElement(icon, { size: 24 })}</div>
        </div>
        <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 leading-relaxed">{desc}</p>
        </div>
    </div>
);

export default Safety;