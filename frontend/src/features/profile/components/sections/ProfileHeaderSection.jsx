/**
 * Module: features/profile/components/sections/ProfileHeaderSection.jsx
 * Purpose: Presents the Profile Header Section UI fragment so parent files can stay focused on flow and data.
 */
import React from 'react';
import { motion } from 'motion/react';
import { Mail, ShieldCheck, User } from 'lucide-react';

import Reveal from '../../../../components/ui/Reveal';

const ProfileHeaderSection = ({
  user,
  isUploadingAvatar,
  isVerificationCooldownActive,
  verificationCooldownLabel,
  verificationCountdownText,
  onOpenVerification,
  onAvatarUpload,
}) => (
  <Reveal>
    <section className="premium-panel mb-6 rounded-2xl p-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.04 }}
            className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-100 text-xl font-semibold text-gray-700"
          >
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              user.name?.charAt(0)?.toUpperCase() || 'U'
            )}
          </motion.div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{user.name}</h1>
            <p className="mt-1 flex items-center gap-2 text-sm text-gray-600">
              <Mail size={14} /> {user.email}
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm text-gray-600">
              <ShieldCheck size={14} /> {user.emailVerified ? 'Profile verified' : 'Verification required'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {!user.emailVerified && (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenVerification}
                disabled={isVerificationCooldownActive}
                className="btn-premium inline-flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-70"
                type="button"
              >
                <ShieldCheck size={14} /> {isVerificationCooldownActive ? verificationCooldownLabel : 'Verify'}
              </button>
              {isVerificationCooldownActive && (
                <span className="text-sm font-semibold text-amber-700">{verificationCountdownText}</span>
              )}
            </div>
          )}
          <label className="btn-soft inline-flex cursor-pointer items-center gap-2 px-4 py-2 text-sm text-slate-700">
            <User size={14} /> {isUploadingAvatar ? 'Uploading...' : 'Edit Profile Picture'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                onAvatarUpload(file, () => {
                  event.target.value = '';
                });
              }}
            />
          </label>
        </div>
      </div>
    </section>
  </Reveal>
);

export default ProfileHeaderSection;
