/**
 * Module: pages/Safety.jsx
 * Purpose: Supports the Safety module and keeps its responsibility isolated by file name.
 */
import React from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  Eye,
  Lock,
  MailCheck,
  ShieldCheck,
  UserRoundCheck,
} from 'lucide-react';
import Reveal from '../components/ui/Reveal';

// Safety page highlights the trust controls that sit around auctions and payments.
const safeguards = [
  {
    icon: <UserRoundCheck className="text-blue-500" />,
    title: 'Layered Verification',
    desc:
      'Turnstile protection, profile verification, age checks, and email-based confirmation help reduce spam, bots, and low-trust participation.',
  },
  {
    icon: <Lock className="text-indigo-500" />,
    title: 'Managed Settlement',
    desc:
      'Payment and fulfillment are not left loose. AuctionPulse manages verified listing closure, payment state, and order completion in a more controlled flow.',
  },
  {
    icon: <Eye className="text-cyan-500" />,
    title: 'Verified Listing Oversight',
    desc:
      'Listings pass through review before they become upcoming auctions, helping prevent misleading or unsafe products from appearing publicly.',
  },
  {
    icon: <MailCheck className="text-emerald-500" />,
    title: 'Traceable Communication',
    desc:
      'Critical events such as verification, support updates, shipping progress, and promotional messaging follow structured notification and email systems.',
  },
  {
    icon: <AlertTriangle className="text-amber-500" />,
    title: 'Dispute Support',
    desc:
      'If delivery fails or listing quality becomes questionable, support can review records tied to registration, payment, and fulfillment activity.',
  },
];

// This page is communication-focused, so grouped safeguard cards are the main structure.
const Safety = () => {
  return (
    <div className="relative overflow-hidden py-16">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.12),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.12),_transparent_30%),linear-gradient(180deg,_rgba(248,250,252,0.98),_rgba(236,253,245,0.92))]" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4.8, ease: 'easeInOut' }}
            className="mb-4 inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 p-4 text-white shadow-xl shadow-emerald-500/20"
          >
            <ShieldCheck className="h-9 w-9" />
          </motion.div>
          <h1 className="text-4xl font-extrabold tracking-tight text-bid-dark md:text-5xl">
            Safety designed into the auction flow
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-slate-600">
            AuctionPulse combines identity checks, listing review, payment isolation, and support
            traceability so both buyers and sellers move through a more disciplined marketplace.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {safeguards.map((item, index) => (
            <Reveal key={item.title} delay={index * 55}>
              <motion.section
                whileHover={{ y: -4 }}
                className="surface-card flex h-full gap-4 rounded-3xl p-6"
              >
                <div className="mt-1 flex-shrink-0">
                  <div className="rounded-2xl bg-white p-3 shadow-sm">
                    {React.cloneElement(item.icon, { size: 24 })}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.desc}</p>
                </div>
              </motion.section>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Safety;
