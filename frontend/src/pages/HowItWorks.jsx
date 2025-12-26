import React from 'react';
import { Search, Gavel, CreditCard, Package, CheckCircle, Upload, TrendingUp, DollarSign } from 'lucide-react';

const HowItWorks = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h1>
          <p className="text-xl text-gray-600">Your journey to safe, exciting trading starts here.</p>
        </div>

        {/* FOR BUYERS */}
        <div className="mb-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                <span className="bg-bid-purple text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">B</span>
                For Buyers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <Step 
                    icon={<Search />} 
                    title="1. Discover" 
                    desc="Browse thousands of unique items. Filter by category, price, or popularity." 
                />
                <Step 
                    icon={<Gavel />} 
                    title="2. Bid Smart" 
                    desc="Place your bids in real-time. Our system updates instantly so you never miss out." 
                />
                <Step 
                    icon={<CreditCard />} 
                    title="3. Secure Pay" 
                    desc="Win? Pay via Stripe. Your money is held safely in Escrow until you receive the item." 
                />
                <Step 
                    icon={<CheckCircle />} 
                    title="4. Confirm" 
                    desc="Receive the item, inspect it, and click 'Confirm Receipt' to release funds." 
                />
            </div>
        </div>

        {/* FOR SELLERS */}
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                <span className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">S</span>
                For Sellers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <Step 
                    icon={<Upload />} 
                    title="1. List Item" 
                    desc="Upload photos, set a starting price, and choose an end time for your auction." 
                />
                <Step 
                    icon={<TrendingUp />} 
                    title="2. Watch Bids" 
                    desc="Watch as users compete for your item. The price goes up in real-time!" 
                />
                <Step 
                    icon={<Package />} 
                    title="3. Ship It" 
                    desc="Auction ends? The winner pays into Escrow. You ship the item with confidence." 
                />
                <Step 
                    icon={<DollarSign />} 
                    title="4. Get Paid" 
                    desc="Once the buyer confirms receipt, funds are instantly released to your account." 
                />
            </div>
        </div>
      </div>
    </div>
  );
};

const Step = ({ icon, title, desc }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition text-bid-purple transform scale-150">
            {React.cloneElement(icon, { size: 64 })}
        </div>
        <div className="text-bid-purple mb-4 bg-purple-50 w-12 h-12 rounded-lg flex items-center justify-center">
            {icon}
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
    </div>
);

export default HowItWorks;