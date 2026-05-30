/**
 * Module: features/profile/hooks/useProfileFormState.js
 * Purpose: Contains the state, effects, and event handlers that drive the use Profile Form State flow.
 */
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import { updateProfile } from '../../../redux/authSlice';
import { createEmptyProfileForm, createProfileFormFromUser } from '../utils/profileForms';

export const useProfileFormState = (user) => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(createEmptyProfileForm);

  useEffect(() => {
    if (!user) return;
    setFormData(createProfileFormFromUser(user));
  }, [user]);

  const handleInput = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialInput = (index, key, value) => {
    setFormData((prev) => ({
      ...prev,
      socialProfiles: prev.socialProfiles.map((profile, profileIndex) =>
        profileIndex === index ? { ...profile, [key]: value } : profile
      ),
    }));
  };

  const handleAddSocialProfile = () => {
    setFormData((prev) => ({
      ...prev,
      socialProfiles: [...prev.socialProfiles, { name: '', link: '' }],
    }));
  };

  const handleRemoveSocialProfile = (index) => {
    setFormData((prev) => ({
      ...prev,
      socialProfiles: prev.socialProfiles.filter((_, profileIndex) => profileIndex !== index),
    }));
  };

  const handleSave = (event) => {
    event.preventDefault();
    dispatch(updateProfile(formData))
      .unwrap()
      .then(() => {
        toast.success('Profile updated', { toastId: 'profile-updated' });
        setIsEditing(false);
      })
      .catch((error) =>
        toast.error(error || 'Failed to update profile', {
          toastId: `profile-update-${error || 'failed'}`,
        })
      );
  };

  return {
    formData,
    isEditing,
    setIsEditing,
    handleInput,
    handleSocialInput,
    handleAddSocialProfile,
    handleRemoveSocialProfile,
    handleSave,
  };
};
