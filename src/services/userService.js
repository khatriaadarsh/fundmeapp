// src/services/userService.js
import apiClient from '../api/client';
// import { ENDPOINTS } from '../api/endpoint';
import { ENDPOINTS } from '../api/endpoints';

/**
 * Signup flow order:
 *   index 0 → step 1 → SignUpScreen
 *   index 1 → step 2 → OTPVerificationScreen
 *   index 2 → step 3 → CNICUploadScreen
 *   index 3 → step 4 → ProfileCompletionScreen
 */
export const SIGNUP_STEPS = [
  'SignUpScreen',
  'OTPVerificationScreen',
  'CNICUploadScreen',
  'ProfileCompletionScreen',
];

export const TOTAL_SIGNUP_STEPS = SIGNUP_STEPS.length;

/**
 * Given last COMPLETED step number, returns the NEXT screen name.
 *   0 / null → 'SignUpScreen'
 *   1        → 'OTPVerificationScreen'
 *   2        → 'CNICUploadScreen'
 *   3        → 'ProfileCompletionScreen'
 *   4+       → null (all done)
 */
export const getResumeScreen = (lastCompletedStep) => {
  const step = Number(lastCompletedStep) || 0;
  if (step <= 0)                  return SIGNUP_STEPS[0];
  if (step >= TOTAL_SIGNUP_STEPS) return null;
  return SIGNUP_STEPS[step];
};

// ─── Profile APIs (real endpoints later) ─────────────────────
export const getProfile = async () => {
  const res = await apiClient.get(ENDPOINTS.USER.PROFILE);
  return res.data?.data ?? res.data;
};