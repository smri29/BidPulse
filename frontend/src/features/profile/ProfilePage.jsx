/**
 * Module: features/profile/ProfilePage.jsx
 * Purpose: Renders the Profile Page screen by composing smaller feature-specific sections.
 */
import React from 'react';
import { Save, ShieldCheck } from 'lucide-react';

import Reveal from '../../components/ui/Reveal';
import ProfileVerificationModal from './components/ProfileVerificationModal';
import ProfileActivitySection from './components/sections/ProfileActivitySection';
import ProfileEditForm from './components/sections/ProfileEditForm';
import ProfileHeaderSection from './components/sections/ProfileHeaderSection';
import ProfileReadOnlyDetails from './components/sections/ProfileReadOnlyDetails';
import ProfileSidebar from './components/sections/ProfileSidebar';
import ProfileVerificationBanner from './components/sections/ProfileVerificationBanner';
import { formatCountdown } from './formatters';
import { useProfilePage } from './useProfilePage';

const ProfilePage = () => {
  const {
    user,
    isLoading,
    activity,
    stats,
    isEditing,
    setIsEditing,
    isVerificationModalOpen,
    verificationCooldownLabel,
    verificationCountdown,
    otpCountdown,
    verificationStep,
    otp,
    setOtp,
    verificationForm,
    verificationAvatarPreview,
    isUploadingAvatar,
    formData,
    isVerificationCooldownActive,
    isVerificationBusy,
    handleInput,
    handleSocialInput,
    handleAddSocialProfile,
    handleRemoveSocialProfile,
    handleSave,
    openVerificationModal,
    closeVerificationModal,
    handleVerificationFormChange,
    handleVerificationAvatarChange,
    handleStartVerification,
    handleVerifyOtp,
    handleAvatarUpload,
  } = useProfilePage();

  if (!user) return <div className="p-10 text-center">Please log in.</div>;

  const verificationCountdownText = formatCountdown(verificationCountdown);
  const otpCountdownText = formatCountdown(otpCountdown);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <ProfileHeaderSection
        user={user}
        isUploadingAvatar={isUploadingAvatar}
        isVerificationCooldownActive={isVerificationCooldownActive}
        verificationCooldownLabel={verificationCooldownLabel}
        verificationCountdownText={verificationCountdownText}
        onOpenVerification={openVerificationModal}
        onAvatarUpload={handleAvatarUpload}
      />

      <ProfileVerificationBanner
        isVisible={!user.emailVerified}
        isVerificationCooldownActive={isVerificationCooldownActive}
        verificationCooldownLabel={verificationCooldownLabel}
        verificationCountdownText={verificationCountdownText}
        onOpenVerification={openVerificationModal}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Reveal delay={90}>
          <section className="premium-panel rounded-2xl p-6">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Profile Details</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {user.emailVerified ? 'Manage your verified account details.' : 'Complete your account details before verification.'}
                </p>
              </div>
              <button
                onClick={() => setIsEditing((prev) => !prev)}
                className="btn-soft inline-flex items-center gap-2 px-4 py-2 text-sm text-slate-700"
                type="button"
              >
                <Save size={14} /> {isEditing ? 'Cancel Editing' : 'Edit Details'}
              </button>
            </div>

            {isEditing ? (
              <ProfileEditForm
                formData={formData}
                isLoading={isLoading}
                onSubmit={handleSave}
                onInput={handleInput}
                onSocialInput={handleSocialInput}
                onAddSocialProfile={handleAddSocialProfile}
                onRemoveSocialProfile={handleRemoveSocialProfile}
              />
            ) : user.emailVerified ? (
              <ProfileReadOnlyDetails user={user} />
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <ShieldCheck className="mx-auto mb-3 text-slate-400" size={28} />
                <p className="text-sm font-semibold text-slate-800">Your profile verification is pending</p>
                <p className="mt-2 text-sm text-slate-600">
                  Complete your identity details to unlock auction participation and selling on AuctionPulse.
                </p>
              </div>
            )}
          </section>
        </Reveal>

        <ProfileSidebar user={user} stats={stats} />
      </div>

      <ProfileActivitySection activity={activity} />

      {isVerificationModalOpen && (
        <ProfileVerificationModal
          isLoading={isVerificationBusy}
          step={verificationStep}
          otpCountdownText={otpCountdownText}
          otp={otp}
          onOtpChange={setOtp}
          verificationForm={verificationForm}
          onChange={handleVerificationFormChange}
          avatarPreview={verificationAvatarPreview}
          onAvatarChange={handleVerificationAvatarChange}
          onClose={closeVerificationModal}
          onSubmit={handleStartVerification}
          onVerifyOtp={handleVerifyOtp}
        />
      )}
    </div>
  );
};

export default ProfilePage;
