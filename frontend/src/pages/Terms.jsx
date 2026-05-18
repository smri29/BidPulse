import React from 'react';
import { motion } from 'motion/react';
import {
  BadgeDollarSign,
  FileCheck,
  Gavel,
  Scale,
  ShieldAlert,
} from 'lucide-react';
import Reveal from '../components/ui/Reveal';

// Terms page groups the most important platform rules into readable topic sections.
const sections = [
  {
    icon: <FileCheck size={20} />,
    title: 'Account Eligibility',
    text:
      'You must provide accurate account information, protect your credentials, and be at least 18 years old to use AuctionPulse. Access can be restricted if identity, payment, or conduct checks fail.',
  },
  {
    icon: <Gavel size={20} />,
    title: 'Auction Participation',
    text:
      'Auction registration and live offers are treated as intentional actions. When you win, you are expected to complete payment within the required timeline. Repeated non-payment or disruptive conduct may limit future participation.',
  },
  {
    icon: <BadgeDollarSign size={20} />,
    title: 'Fees and Platform Charges',
    text:
      'AuctionPulse applies a 5% commission to completed seller transactions. If an auction receives no registrants, applicable withdrawal or relisting charges may apply according to the current platform policy.',
  },
  {
    icon: <ShieldAlert size={20} />,
    title: 'Restricted Listings',
    text:
      'Illegal goods, weapons, hazardous materials, stolen property, counterfeit products, and misleading submissions are prohibited. AuctionPulse may remove listings and suspend related accounts without prior notice.',
  },
  {
    icon: <Scale size={20} />,
    title: 'Enforcement and Disputes',
    text:
      'We may pause listings, limit account access, or request additional verification when trust or safety risks appear. Support disputes are reviewed against platform records, listing verification details, and delivery confirmation history.',
  },
];

const Terms = () => {
  return (
    <div className="relative overflow-hidden py-14">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.14),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(20,184,166,0.14),_transparent_30%),linear-gradient(180deg,_rgba(248,250,252,0.98),_rgba(241,245,249,0.96))]" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <section className="premium-panel relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
            <div className="absolute inset-y-0 right-0 hidden w-72 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.12),_transparent_68%)] lg:block" />
            <p className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-blue-700">
              Terms of Service
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-bid-dark md:text-5xl">
              Clear operating rules for verified auctions
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              These terms explain how AuctionPulse manages accounts, auction participation, listing
              quality, seller fees, and platform enforcement. Using the marketplace means you agree
              to participate in good faith and follow the verified-auction process.
            </p>
            <div className="mt-6 inline-flex rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-500 shadow-sm">
              Last updated: May 11, 2026
            </div>
          </section>
        </Reveal>

        <div className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_320px]">
          <div className="space-y-5">
            {sections.map((section, index) => (
              <Reveal key={section.title} delay={index * 60}>
                <motion.section
                  whileHover={{ y: -3 }}
                  className="surface-card rounded-3xl p-6 sm:p-7"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20">
                      {section.icon}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{section.title}</h2>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{section.text}</p>
                    </div>
                  </div>
                </motion.section>
              </Reveal>
            ))}
          </div>

          <Reveal delay={90}>
            <aside className="surface-card rounded-3xl p-6 sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                Quick Summary
              </p>
              <ul className="mt-5 space-y-4 text-sm leading-6 text-slate-600">
                <li className="rounded-2xl border border-slate-100 bg-white/90 px-4 py-3">
                  Accounts must be genuine, secure, and tied to accurate information.
                </li>
                <li className="rounded-2xl border border-slate-100 bg-white/90 px-4 py-3">
                  Auction winners are expected to complete payment and follow the closing process.
                </li>
                <li className="rounded-2xl border border-slate-100 bg-white/90 px-4 py-3">
                  Listing abuse, counterfeit items, or harmful submissions can lead to removal or suspension.
                </li>
              </ul>
            </aside>
          </Reveal>
        </div>
      </div>
    </div>
  );
};

export default Terms;
