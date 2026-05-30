import {
  deleteAccount,
  fetchCurrentUser,
  getMyActivity,
  login,
  logout,
  register,
  sendVerificationOtp,
  startProfileVerification,
  updateProfile,
  uploadAvatar,
  verifyEmailOtp,
  verifyProfileOtp,
} from './authThunks';

export const buildAuthExtraReducers = (builder) => {
  builder
    .addCase(fetchCurrentUser.pending, (state) => { state.isLoading = true; })
    .addCase(fetchCurrentUser.fulfilled, (state, action) => { state.isLoading = false; state.user = action.payload; })
    .addCase(fetchCurrentUser.rejected, (state, action) => {
      state.isLoading = false;
      if (action.payload?.shouldLogout) {
        state.user = null;
        state.isError = true;
        state.message = action.payload?.message || 'Session expired. Please log in again.';
      } else {
        state.message = '';
      }
    })
    .addCase(register.pending, (state) => { state.isLoading = true; })
    .addCase(register.fulfilled, (state, action) => { state.isLoading = false; state.isSuccess = true; state.user = null; state.message = action.payload?.warning || ''; })
    .addCase(register.rejected, (state, action) => { state.isLoading = false; state.isError = true; state.message = action.payload; state.user = null; })
    .addCase(login.pending, (state) => { state.isLoading = true; })
    .addCase(login.fulfilled, (state, action) => { state.isLoading = false; state.isSuccess = true; state.user = action.payload; })
    .addCase(login.rejected, (state, action) => { state.isLoading = false; state.isError = true; state.message = action.payload; state.user = null; })
    .addCase(updateProfile.pending, (state) => { state.isLoading = true; })
    .addCase(updateProfile.fulfilled, (state, action) => { state.isLoading = false; state.isSuccess = true; state.user = action.payload; })
    .addCase(updateProfile.rejected, (state, action) => { state.isLoading = false; state.isError = true; state.message = action.payload; })
    .addCase(verifyEmailOtp.pending, (state) => { state.isLoading = true; })
    .addCase(verifyEmailOtp.fulfilled, (state, action) => { state.isLoading = false; state.isSuccess = true; state.user = action.payload.user; })
    .addCase(verifyEmailOtp.rejected, (state, action) => { state.isLoading = false; state.isError = true; state.message = action.payload; })
    .addCase(startProfileVerification.pending, (state) => { state.isLoading = true; })
    .addCase(startProfileVerification.fulfilled, (state) => { state.isLoading = false; state.isSuccess = true; })
    .addCase(startProfileVerification.rejected, (state, action) => { state.isLoading = false; state.isError = true; state.message = action.payload; })
    .addCase(verifyProfileOtp.pending, (state) => { state.isLoading = true; })
    .addCase(verifyProfileOtp.fulfilled, (state, action) => { state.isLoading = false; state.isSuccess = true; state.user = action.payload.user; })
    .addCase(verifyProfileOtp.rejected, (state, action) => { state.isLoading = false; state.isError = true; state.message = action.payload; })
    .addCase(sendVerificationOtp.fulfilled, (state) => { state.isSuccess = true; })
    .addCase(sendVerificationOtp.rejected, (state, action) => { state.isError = true; state.message = action.payload; })
    .addCase(uploadAvatar.fulfilled, (state, action) => { state.user = action.payload.user; })
    .addCase(getMyActivity.fulfilled, (state, action) => { state.activity = action.payload; })
    .addCase(deleteAccount.pending, (state) => { state.isLoading = true; })
    .addCase(deleteAccount.fulfilled, (state) => { state.isLoading = false; state.user = null; state.isSuccess = true; })
    .addCase(deleteAccount.rejected, (state, action) => { state.isLoading = false; state.isError = true; state.message = action.payload; })
    .addCase(logout.fulfilled, (state) => { state.user = null; });
};
