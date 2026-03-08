import React from 'react';
import { AlertTriangle, Eye, Lock, ShieldCheck } from 'lucide-react';
import Reveal from '../components/ui/Reveal';

const Safety = () => {
  return (
    <div className="py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-emerald-100 p-3">
            <ShieldCheck className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-extrabold text-bid-dark">Trust & Safety</h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Security is core to every BidPulse transaction. Here is how we protect buyers and sellers.
          </p>
        </Reveal>

        <div className="mt-10 space-y-5">
          <Reveal delay={40}>
            <SafetyCard
              icon={<Lock className="text-blue-500" />}
              title="Managed Settlement"
              desc="When payment is completed, BidPulse settles seller payout and takes direct shipping responsibility for the verified product."
            />
          </Reveal>
          <Reveal delay={90}>
            <SafetyCard
              icon={<Eye className="text-indigo-500" />}
              title="Verified Transactions"
              desc="All payments are processed by Stripe. Card data is never stored on BidPulse servers."
            />
          </Reveal>
          <Reveal delay={130}>
            <SafetyCard
              icon={<AlertTriangle className="text-amber-500" />}
              title="Dispute Resolution"
              desc="If delivery fails or a listing mismatch occurs, our support team investigates with verification and fulfillment records."
            />
          </Reveal>
        </div>
      </div>
    </div>
  );
};

const SafetyCard = ({ icon, title, desc }) => (
  <div className="surface-card hover-lift flex gap-5 rounded-2xl p-6">
    <div className="mt-1 flex-shrink-0">
      <div className="rounded-full bg-white p-3 shadow-sm">{React.cloneElement(icon, { size: 24 })}</div>
    </div>
    <div>
      <h3 className="mb-2 text-xl font-bold text-slate-900">{title}</h3>
      <p className="leading-relaxed text-slate-600">{desc}</p>
    </div>
  </div>
);

export default Safety;
