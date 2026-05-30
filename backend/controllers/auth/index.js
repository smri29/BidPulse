// ---------------------------------------------------------------------------
// Module: backend/controllers/auth/index.js
// Purpose: module export index
// This file gathers the small auth action modules and exposes the public
// controller contract expected by the rest of the backend.
// ---------------------------------------------------------------------------

module.exports = {
  register: require('./actions/register'),
  login: require('./actions/login'),
  ...require('./actions/legacyVerification'),
  startProfileVerification: require('./actions/startProfileVerification'),
  verifyProfileOtp: require('./actions/verifyProfileOtp'),
  verifyProfileLink: require('./actions/verifyProfileLink'),
  getMe: require('./actions/getMe'),
  updateUserDetails: require('./actions/updateUserDetails'),
  uploadAvatar: require('./actions/uploadAvatar'),
  getUserActivity: require('./actions/getUserActivity'),
  exportUserDataZip: require('./actions/exportUserDataZip'),
  deleteUserAccount: require('./actions/deleteUserAccount'),
  forgotPassword: require('./actions/forgotPassword'),
  resetPassword: require('./actions/resetPassword'),
};


