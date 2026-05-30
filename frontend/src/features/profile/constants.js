// Shared profile form defaults and option lists live here so the page and modal
// can reuse the same source of truth.
export const initialVerificationForm = {
  dob: '',
  country: '',
  primaryContact: '',
  emergencyContact: '',
  idNumber: '',
  verificationMethod: 'otp',
};

export const BLOOD_GROUP_OPTIONS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
export const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'];
