import React from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  CheckCircle,
  CreditCard,
  DollarSign,
  Gavel,
  Package,
  Search,
  TrendingUp,
  Upload,
} from 'lucide-react';
import Reveal from '../components/ui/Reveal';

// These step arrays split the marketplace explanation into buyer and seller journeys.
const buyerSteps = [
  {
    icon: <Search size={22} />,
    title: 'Discover Verified Listings',
    desc: 'Browse upcoming auctions with category labels, price visibility, and listing details that have already passed admin review.',
    tone: 'from-blue-600 to-cyan-500',
  },
  {
    icon: <Gavel size={22} />,
    title: 'Register Before Close',
    desc: 'Join the registration window before it ends. This secures your place for the auction room and live participation flow.',
    tone: 'from-indigo-600 to-blue-500',
  },
  {
    icon: <CreditCard size={22} />,
    title: 'Win and Complete Payment',
    desc: 'If you finish as the winner, payment is completed through Stripe and the auction moves into the managed fulfillment stage.',
    tone: 'from-emerald-600 to-teal-500',
  },
  {
    icon: <CheckCircle size={22} />,
    title: 'Confirm Receipt',
    desc: 'After delivery, confirm receipt so the lifecycle closes cleanly and the order history reflects the completed outcome.',
    tone: 'from-green-600 to-emerald-500',
  },
];

const sellerSteps = [
  {
    icon: <Upload size={22} />,
    title: 'Submit Product for Review',
    desc: 'Create a listing, provide the required details, and bring the product through the verification path before it goes live.',
    tone: 'from-violet-600 to-indigo-600',
  },
  {
    icon: <TrendingUp size={22} />,
    title: 'Open Registration Window',
    desc: 'Once approved, your listing appears in upcoming auctions so participants can register ahead of the live session.',
    tone: 'from-blue-700 to-indigo-600',
  },
  {
    icon: <Package size={22} />,
    title: 'Let the Auction Run',
    desc: 'AuctionPulse manages registration close, room activation, turn-based participation, and winner transition.',
    tone: 'from-amber-500 to-orange-500',
  },
  {
    icon: <DollarSign size={22} />,
    title: 'Receive Managed Settlement',
    desc: 'After the winner pays successfully, platform fees are applied and seller payout follows the managed closing flow.',
    tone: 'from-emerald-600 to-lime-500',
  },
];

// How-it-works is the public process explainer for both sides of the marketplace.
const HowItWorks = () => {
  return (
    <div className="relative overflow-hidden py-14">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(79,70,229,0.12),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.12),_transparent_30%),linear-gradient(180deg,_rgba(248,250,252,0.98),_rgba(241,245,249,0.96))]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <p className="inline-flex rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-indigo-700">
            Process Overview
          </p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-bid-dark md:text-5xl">
            How AuctionPulse moves from listing to completion
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-slate-600">
            The platform uses one structured flow for buyers, sellers, and admins. Registration,
            live participation, payment, and delivery are connected so each stage feels deliberate.
          </p>
        </Reveal>

        <Reveal delay={80} className="mt-12">
          <Workflow
            title="Buyer Journey"
            badge="B"
            badgeClass="from-blue-700 to-cyan-500"
            steps={buyerSteps}
          />
        </Reveal>

        <Reveal delay={120} className="mt-14">
          <Workflow
            title="Seller Journey"
            badge="S"
            badgeClass="from-emerald-600 to-lime-500"
            steps={sellerSteps}
          />
        </Reveal>
      </div>
    </div>
  );
};

const Workflow = ({ title, badge, badgeClass, steps }) => (
  <section>
    <div className="mb-7 flex items-center gap-3">
      <motion.span
        animate={{ y: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
        className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white shadow-lg ${badgeClass}`}
      >
        {badge}
      </motion.span>
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
    </div>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:gap-6">
      {steps.map((step, index) => (
        <div key={step.title} className="relative">
          <StepCard step={step} index={index + 1} />
          {index < steps.length - 1 && (
            <ArrowRight
              className="absolute -right-4 top-1/2 hidden -translate-y-1/2 text-slate-300 md:block"
              size={18}
            />
          )}
        </div>
      ))}
    </div>
  </section>
);

const StepCard = ({ step, index }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="surface-card h-full rounded-3xl p-5"
  >
    <div className="mb-3 text-xs font-bold tracking-[0.22em] text-slate-500">STEP {index}</div>
    <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg ${step.tone}`}>
      {step.icon}
    </div>
    <h3 className="mb-2 text-lg font-bold text-slate-900">{step.title}</h3>
    <p className="text-sm leading-7 text-slate-600">{step.desc}</p>
  </motion.div>
);

export default HowItWorks;
