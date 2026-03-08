import React from 'react';
import {
  Search,
  Gavel,
  CreditCard,
  Package,
  CheckCircle,
  Upload,
  TrendingUp,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
import Reveal from '../components/ui/Reveal';

const buyerSteps = [
  {
    icon: <Search />,
    title: 'Discover',
    desc: 'Browse verified listings with filters, transparent pricing, and trust indicators.',
    tone: 'from-blue-600 to-cyan-500',
  },
  {
    icon: <Gavel />,
    title: 'Register First',
    desc: 'Join Future Bids during fixed registration windows and secure your queue position.',
    tone: 'from-indigo-600 to-blue-500',
  },
  {
    icon: <CreditCard />,
    title: 'Secure Pay',
    desc: 'Checkout with Stripe. BidPulse settles seller payout after successful payment.',
    tone: 'from-emerald-600 to-teal-500',
  },
  {
    icon: <CheckCircle />,
    title: 'Confirm Receipt',
    desc: 'BidPulse ships in 7-14 days; winner confirms product receipt to close the order.',
    tone: 'from-green-600 to-emerald-500',
  },
];

const sellerSteps = [
  {
    icon: <Upload />,
    title: 'Submit Product',
    desc: 'Submit listing data and bring the product for office verification.',
    tone: 'from-violet-600 to-indigo-600',
  },
  {
    icon: <TrendingUp />,
    title: 'Open Registration',
    desc: 'After approval, listing appears in Future Bids for bidder registration.',
    tone: 'from-blue-700 to-indigo-600',
  },
  {
    icon: <Package />,
    title: 'Complete Sale',
    desc: 'Winner pays, seller receives net amount, and BidPulse handles shipment.',
    tone: 'from-amber-500 to-orange-500',
  },
  {
    icon: <DollarSign />,
    title: 'Get Payout',
    desc: 'BidPulse keeps 5% commission and settles seller payout immediately after payment.',
    tone: 'from-emerald-600 to-lime-500',
  },
];

const HowItWorks = () => {
  return (
    <div className="py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <h1 className="text-4xl font-extrabold text-bid-dark md:text-5xl">How BidPulse Works</h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            One secure auction engine for buyers, sellers, and admins with confidence at every stage.
          </p>
        </Reveal>

        <Reveal delay={80} className="mt-12">
          <Workflow title="Buyer Workflow" badge="B" badgeClass="bg-bid-purple" steps={buyerSteps} />
        </Reveal>

        <Reveal delay={120} className="mt-14">
          <Workflow title="Seller Workflow" badge="S" badgeClass="bg-bid-green" steps={sellerSteps} />
        </Reveal>
      </div>
    </div>
  );
};

const Workflow = ({ title, badge, badgeClass, steps }) => (
  <section>
    <div className="mb-7 flex items-center gap-3">
      <span className={`animate-float flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white ${badgeClass}`}>{badge}</span>
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
    </div>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:gap-6">
      {steps.map((step, index) => (
        <div key={step.title} className="relative">
          <StepCard step={step} delay={index * 110} index={index + 1} />
          {index < steps.length - 1 && (
            <ArrowRight className="absolute -right-4 top-1/2 hidden -translate-y-1/2 text-slate-300 md:block" size={18} />
          )}
        </div>
      ))}
    </div>
  </section>
);

const StepCard = ({ step, delay, index }) => (
  <div className="surface-card hover-lift h-full rounded-2xl p-5" style={{ animationDelay: `${delay}ms` }}>
    <div className="mb-3 text-xs font-bold tracking-widest text-slate-500">STEP {index}</div>
    <div className={`animate-pulse-glow mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white ${step.tone}`}>
      {step.icon}
    </div>
    <h3 className="mb-2 text-lg font-bold text-slate-900">{step.title}</h3>
    <p className="text-sm leading-relaxed text-slate-600">{step.desc}</p>
  </div>
);

export default HowItWorks;
