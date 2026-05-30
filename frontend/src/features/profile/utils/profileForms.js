export const createEmptyProfileForm = () => ({
  name: '',
  address: '',
  emergencyContact: '',
  bloodGroup: '',
  cityState: '',
  postalCode: '',
  gender: '',
  occupation: '',
  preferredDeliveryAddress: '',
  secondaryEmail: '',
  medicalNotes: '',
  socialProfiles: [],
});

export const createProfileFormFromUser = (user) => ({
  name: user?.name || '',
  address: user?.address || '',
  emergencyContact: user?.emergencyContact || '',
  bloodGroup: user?.bloodGroup || '',
  cityState: user?.cityState || '',
  postalCode: user?.postalCode || '',
  gender: user?.gender || '',
  occupation: user?.occupation || '',
  preferredDeliveryAddress: user?.preferredDeliveryAddress || '',
  secondaryEmail: user?.secondaryEmail || '',
  medicalNotes: user?.medicalNotes || '',
  socialProfiles: Array.isArray(user?.socialProfiles) ? user.socialProfiles : [],
});

export const createVerificationFormFromUser = (user) => ({
  dob: user?.dob ? new Date(user.dob).toISOString().slice(0, 10) : '',
  country: user?.location && user.location !== 'Not set' ? user.location : '',
  primaryContact: user?.mobile || '',
  emergencyContact: user?.emergencyContact || '',
  idNumber: user?.idNumber || '',
  verificationMethod: 'otp',
});
