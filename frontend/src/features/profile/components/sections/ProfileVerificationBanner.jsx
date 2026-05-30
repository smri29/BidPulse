import React from 'react';
import { BadgeAlert } from 'lucide-react';

import Reveal from '../../../../components/ui/Reveal';

const ProfileVerificationBanner = ({
  isVisible,
  isVerificationCooldownActive,
  verificationCooldownLabel,
  verificationCountdownText,
  onOpenVerification,
}) => {
  if (!isVisible) return null;

  return (
    <Reveal delay={60}>
      <section className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-800">
              <BadgeAlert size={16} /> Verify your profile before joining auctions or creating listings
            </p>
            <p className="text-sm text-amber-700">
              Complete your identity details, then verify through OTP or email link sent to your primary email address.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenVerification}
              disabled={isVerificationCooldownActive}
              className="inline-flex items-center justify-center rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-70"
              type="button"
            >
              {isVerificationCooldownActive ? verificationCooldownLabel : 'Start Verification'}
            </button>
            {isVerificationCooldownActive && (
              <span className="text-sm font-semibold text-amber-700">{verificationCountdownText}</span>
            )}
          </div>
        </div>
      </section>
    </Reveal>
  );
};

export default ProfileVerificationBanner;
