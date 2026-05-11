import React from 'react';
import { motion } from 'motion/react';
import { Award, Globe, Gavel, ShieldCheck, Sparkles, Users } from 'lucide-react';
import Reveal from '../components/ui/Reveal';

const pillars = [
  {
    icon: <ShieldCheck size={20} />,
    title: 'Trust-First Marketplace',
    text:
      'Every major flow is designed to reduce anonymous abuse, improve listing credibility, and give participants more confidence before they commit.',
  },
  {
    icon: <Gavel size={20} />,
    title: 'Managed Auction Flow',
    text:
      'AuctionPulse is not only about live offers. It also manages verification, registration windows, room opening, payment handling, and delivery closure.',
  },
  {
    icon: <Sparkles size={20} />,
    title: 'Operational Transparency',
    text:
      'From notifications and support updates to email confirmation and admin review, the platform aims to make each stage visible and explainable.',
  },
];

const stats = [
  { icon: <Users size={28} />, number: '10k+', label: 'Active Participants' },
  { icon: <Gavel size={28} />, number: '50k+', label: 'Auctions Managed' },
  { icon: <Globe size={28} />, number: '12', label: 'Regions Reached' },
  { icon: <Award size={28} />, number: '#1', label: 'Trust-Led Direction' },
];

const About = () => {
  return (
    <div className="relative overflow-hidden py-14">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.14),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.14),_transparent_30%),linear-gradient(180deg,_rgba(248,250,252,0.98),_rgba(239,246,255,0.94))]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <section className="premium-panel relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
            <div className="absolute right-0 top-0 hidden h-full w-80 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.14),_transparent_70%)] lg:block" />
            <p className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-blue-700">
              About AuctionPulse
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-bid-dark md:text-5xl">
              Verified auctions with structure, safety, and momentum
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              AuctionPulse was built to make digital auctions feel more dependable. Instead of
              relying on open listing chaos, the platform combines verification, controlled
              registration, managed payment flow, and lifecycle visibility from listing to receipt.
            </p>
          </section>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-7 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <section className="surface-card rounded-[2rem] p-7 sm:p-8">
              <h2 className="text-2xl font-bold text-slate-900">Why AuctionPulse exists</h2>
              <p className="mt-4 leading-8 text-slate-600">
                Many auction platforms are good at showing products but weak at controlling trust.
                AuctionPulse focuses on the full marketplace discipline around auctions: who can
                join, how listings are approved, when rooms open, how payments are handled, and how
                disputes are supported after the sale.
              </p>
              <p className="mt-4 leading-8 text-slate-600">
                The result is a more structured marketplace for buyers, sellers, and admins who want
                auction participation to feel premium rather than chaotic.
              </p>
            </section>
          </Reveal>

          <div className="grid grid-cols-2 gap-4 lg:col-span-5">
            {stats.map((item, index) => (
              <Reveal key={item.label} delay={index * 60}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="surface-card rounded-2xl p-5 text-center"
                >
                  <div className="mb-3 inline-flex rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 p-3 text-white shadow-lg shadow-blue-500/20">
                    {item.icon}
                  </div>
                  <div className="text-2xl font-extrabold text-bid-dark">{item.number}</div>
                  <div className="text-sm text-slate-500">{item.label}</div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {pillars.map((pillar, index) => (
            <Reveal key={pillar.title} delay={index * 70}>
              <motion.section
                whileHover={{ y: -4 }}
                className="surface-card rounded-3xl p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 text-white shadow-lg shadow-indigo-500/20">
                  {pillar.icon}
                </div>
                <h3 className="mt-4 text-xl font-bold text-slate-900">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{pillar.text}</p>
              </motion.section>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
