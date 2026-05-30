import React from 'react';
import { BadgeCheck, Fingerprint, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const FeaturePill = ({ icon: Icon, title, text }) => (
  <div className="rounded-2xl border border-white/12 bg-white/8 p-4">
    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12 text-sky-100">
      <Icon className="h-5 w-5" />
    </div>
    <p className="text-sm font-semibold text-white">{title}</p>
    <p className="mt-1 text-sm leading-6 text-slate-100/90">{text}</p>
  </div>
);

const RegisterHero = () => (
  <section
    className="relative overflow-hidden rounded-[2rem] border border-slate-950/20 p-8 text-white shadow-[0_24px_60px_-28px_rgba(15,23,42,0.9)] md:p-9 lg:min-h-[520px] lg:p-10"
    style={{ background: 'linear-gradient(160deg, #111827 0%, #0f172a 52%, #164e63 100%)' }}
  >
    <div
      className="absolute inset-0 opacity-100"
      style={{
        backgroundImage:
          'radial-gradient(circle at 16% 18%, rgba(59,130,246,0.18), transparent 22%), radial-gradient(circle at 82% 24%, rgba(34,211,238,0.12), transparent 18%), linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: 'auto, auto, 38px 38px, 38px 38px',
      }}
    />
    <div className="relative z-10 flex h-full flex-col justify-between">
      <div className="max-w-xl">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-4 py-2 text-xs font-bold tracking-[0.18em] text-sky-50">
          <Sparkles className="h-4 w-4" /> MODERN ACCOUNT ACCESS
        </div>
        <h1 className="max-w-sm text-4xl font-bold leading-[1.04] text-white md:text-[2.55rem] xl:text-[2.9rem]">
          Join AuctionPulse with a faster, cleaner signup flow.
        </h1>
        <p className="mt-5 max-w-md text-lg leading-8 text-slate-100">
          Create your account with the essentials now. Profile verification details can be completed later, without slowing down onboarding.
        </p>

        <div className="mt-7 grid gap-4">
          <FeaturePill icon={ShieldCheck} title="Security-first onboarding" text="Email verification and human checks keep access trusted from the first step." />
          <FeaturePill icon={Fingerprint} title="Reduced signup friction" text="Only the fields needed to create the account are shown here." />
        </div>
      </div>

      <div className="mt-7 rounded-[1.75rem] border border-white/12 bg-white/8 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-100">After Signup</p>
            <p className="mt-2 max-w-md text-sm leading-7 text-slate-100">
              Additional identity information will live in the profile section so users can get started immediately.
            </p>
          </div>
          <BadgeCheck className="hidden h-10 w-10 shrink-0 text-sky-200 md:block" />
        </div>
        <p className="mt-4 text-sm text-slate-100">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-white hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  </section>
);

export default RegisterHero;
