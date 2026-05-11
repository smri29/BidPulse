import React from 'react';
import { motion } from 'motion/react';
import {
  Database,
  Eye,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Share2,
} from 'lucide-react';
import Reveal from '../components/ui/Reveal';

const sections = [
  {
    icon: <Database size={20} />,
    title: 'Information We Collect',
    text:
      'AuctionPulse stores the information required to run verified auctions, including account details, profile verification data, communication history, listing activity, and payment lifecycle records. Full card numbers are not stored by our platform.',
  },
  {
    icon: <Eye size={20} />,
    title: 'How Information Is Used',
    text:
      'We use your information to manage authentication, protect against abuse, verify listings and identities, send operational emails, process auction transactions, and provide support when issues arise.',
  },
  {
    icon: <Share2 size={20} />,
    title: 'Limited Data Sharing',
    text:
      'We do not sell personal data. Information is shared only when necessary with trusted service providers such as payment, email, cloud media, or hosting partners that help AuctionPulse operate safely and reliably.',
  },
  {
    icon: <LockKeyhole size={20} />,
    title: 'Security Controls',
    text:
      'Turnstile verification, role-based access, protected admin controls, and payment-provider isolation are used to reduce spam, fraud, and unauthorized access. We continue improving safeguards as the platform evolves.',
  },
  {
    icon: <Mail size={20} />,
    title: 'Communication Preferences',
    text:
      'Users may receive transactional, verification, promotional, support, and birthday emails depending on account activity and system rules. Critical security and auction lifecycle communications remain operational by design.',
  },
];

const Privacy = () => {
  return (
    <div className="relative overflow-hidden py-14">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.12),_transparent_34%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.12),_transparent_34%),linear-gradient(180deg,_rgba(248,250,252,0.98),_rgba(239,246,255,0.94))]" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <section className="premium-panel rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/20">
              <ShieldCheck size={28} />
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-extrabold tracking-tight text-bid-dark md:text-5xl">
              Privacy designed around verified marketplace trust
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              AuctionPulse uses personal and transaction data only where it supports trust,
              account security, verified listings, settlement, and support resolution. We keep the
              policy practical, transparent, and grounded in how the product actually works.
            </p>
            <div className="mt-6 inline-flex rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-500 shadow-sm">
              Last updated: May 11, 2026
            </div>
          </section>
        </Reveal>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {sections.map((section, index) => (
            <Reveal key={section.title} delay={index * 60}>
              <motion.section
                whileHover={{ y: -3 }}
                className="surface-card rounded-3xl p-6 sm:p-7"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/20">
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
      </div>
    </div>
  );
};

export default Privacy;
