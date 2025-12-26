import React from 'react';
import { Gavel, Globe, Users, Award } from 'lucide-react';

const About = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            We Are <span className="text-bid-purple">BidPulse</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Revolutionizing the way the world buys and sells unique items through the power of real-time auctions and secure escrow payments.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              At BidPulse, we believe that every item has a story and a value waiting to be discovered. Our mission is to create a transparent, secure, and exciting marketplace where passion meets opportunity.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              We started in 2025 with a simple idea: remove the risk from online auctions. By integrating Escrow payments directly into the flow, we ensure that sellers get paid and buyers get what they promised.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <StatCard icon={<Users size={32} />} number="10k+" label="Active Users" />
            <StatCard icon={<Gavel size={32} />} number="50k+" label="Auctions Closed" />
            <StatCard icon={<Globe size={32} />} number="12" label="Countries" />
            <StatCard icon={<Award size={32} />} number="#1" label="Escrow Platform" />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, number, label }) => (
  <div className="bg-slate-50 p-6 rounded-2xl text-center hover:shadow-lg transition">
    <div className="text-bid-purple flex justify-center mb-3">{icon}</div>
    <div className="text-2xl font-bold text-gray-900">{number}</div>
    <div className="text-sm text-gray-500">{label}</div>
  </div>
);

export default About;