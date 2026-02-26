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

const buyerSteps = [
  {
    icon: <Search />,
    title: 'Discover',
    desc: 'Browse premium listings with filters, live pricing, and seller trust signals.',
    tone: 'from-blue-500 to-cyan-500',
  },
  {
    icon: <Gavel />,
    title: 'Bid Smart',
    desc: 'Place competitive bids with real-time updates and anti-sniping extensions.',
    tone: 'from-indigo-500 to-blue-600',
  },
  {
    icon: <CreditCard />,
    title: 'Secure Pay',
    desc: 'Checkout via Stripe and hold funds safely in escrow until delivery.',
    tone: 'from-emerald-500 to-teal-500',
  },
  {
    icon: <CheckCircle />,
    title: 'Confirm Receipt',
    desc: 'Validate item delivery and release funds only when satisfied.',
    tone: 'from-green-500 to-emerald-600',
  },
];

const sellerSteps = [
  {
    icon: <Upload />,
    title: 'List Item',
    desc: 'Upload product details and launch a timed auction in minutes.',
    tone: 'from-purple-500 to-fuchsia-500',
  },
  {
    icon: <TrendingUp />,
    title: 'Track Momentum',
    desc: 'Monitor bid growth and winner movement in real-time dashboards.',
    tone: 'from-violet-500 to-indigo-500',
  },
  {
    icon: <Package />,
    title: 'Ship Fast',
    desc: 'Receive buyer shipping details right after escrow payment.',
    tone: 'from-amber-500 to-orange-500',
  },
  {
    icon: <DollarSign />,
    title: 'Get Paid',
    desc: 'Funds release on buyer confirmation, with transparent commission split.',
    tone: 'from-emerald-500 to-lime-500',
  },
];

const HowItWorks = () => {
  return (
    <div className="min-h-screen py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 animate-fade-up">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">How BidPulse Works</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            One secure auction engine for buyers, sellers, and admins with real-time confidence at every step.
          </p>
        </div>

        <Workflow title="Buyer Workflow" badge="B" badgeClass="bg-bid-purple" steps={buyerSteps} />
        <Workflow title="Seller Workflow" badge="S" badgeClass="bg-emerald-600" steps={sellerSteps} />
      </div>
    </div>
  );
};

const Workflow = ({ title, badge, badgeClass, steps }) => (
  <section className="mb-16 animate-fade-up">
    <div className="flex items-center gap-3 mb-7">
      <span className={`w-9 h-9 rounded-full text-white flex items-center justify-center font-bold ${badgeClass} animate-float`}>{badge}</span>
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
      {steps.map((step, index) => (
        <div key={step.title} className="relative">
          <StepCard step={step} delay={index * 120} index={index + 1} />
          {index < steps.length - 1 && (
            <ArrowRight className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
          )}
        </div>
      ))}
    </div>
  </section>
);

const StepCard = ({ step, delay, index }) => (
  <div
    className="bg-white/85 border border-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition duration-300 h-full"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="text-xs text-gray-500 font-bold mb-3 tracking-widest">STEP {index}</div>
    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.tone} text-white flex items-center justify-center mb-4 animate-pulse-glow`}>
      {step.icon}
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
    <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
  </div>
);

export default HowItWorks;
