import React from 'react';
import { Award, Gavel, Globe, Users } from 'lucide-react';
import Reveal from '../components/ui/Reveal';

const About = () => {
  return (
    <div className="py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <section className="premium-panel rounded-3xl p-8 text-center sm:p-12">
            <p className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">
              About AuctionPulse
            </p>
            <h1 className="mt-4 text-4xl font-extrabold text-bid-dark md:text-5xl">
              Premium Auctions, Built on Trust
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-slate-600">
              AuctionPulse is a verified auction network where every listing is physically checked and every transaction follows transparent, structured auction participation.
            </p>
          </section>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-7 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <section className="surface-card rounded-3xl p-7 sm:p-8">
              <h2 className="text-2xl font-bold text-slate-900">Our Mission</h2>
              <p className="mt-4 leading-relaxed text-slate-600">
                At AuctionPulse, every product has a real market story. Our mission is to run auctions with integrity by verifying listings, validating participants,
                and enabling confident decisions in live auction sessions.
              </p>
              <p className="mt-4 leading-relaxed text-slate-600">
                Since 2025, we have focused on reducing risk in digital auctions through office verification, transparent registration flow, and managed fulfillment
                after successful payment.
              </p>
            </section>
          </Reveal>

          <div className="grid grid-cols-2 gap-4 lg:col-span-5">
            <Reveal delay={40}><StatCard icon={<Users size={28} />} number="10k+" label="Active Users" /></Reveal>
            <Reveal delay={80}><StatCard icon={<Gavel size={28} />} number="50k+" label="Auctions Closed" /></Reveal>
            <Reveal delay={120}><StatCard icon={<Globe size={28} />} number="12" label="Countries" /></Reveal>
            <Reveal delay={160}><StatCard icon={<Award size={28} />} number="#1" label="Verified Auction Network" /></Reveal>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, number, label }) => (
  <div className="surface-card hover-lift rounded-2xl p-5 text-center">
    <div className="mb-3 inline-flex rounded-xl bg-blue-50 p-3 text-bid-purple">{icon}</div>
    <div className="text-2xl font-extrabold text-bid-dark">{number}</div>
    <div className="text-sm text-slate-500">{label}</div>
  </div>
);

export default About;
