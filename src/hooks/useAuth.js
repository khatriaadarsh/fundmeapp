// src/hooks/useAuth.js
import { useMutation } from '@tanstack/react-query';
import { checkUserByEmail, verifyOtp,
  resetPassword,resendOtp,login } from '../services/authService';
import { getResumeScreen }  from '../services/userService';

export const useVerifyOtp     = () => useMutation({ mutationFn: verifyOtp });
export const useResetPassword = () => useMutation({ mutationFn: resetPassword });
export const useResendOtp     = () => useMutation({ mutationFn: resendOtp });
export const useLogin         = () => useMutation({ mutationFn: login });
export const useCheckUser = () =>
  useMutation({ mutationFn: checkUserByEmail });

export const resolveAuthRoute = (result) => {
  const baseParams = {
    email:   result.email,
    userId:  result.userId,
    prefill: result.profile,
  };

  if (!result.exists) {
    return { screen: 'SignUpScreen', params: { email: result.email } };
  }
  if (result.registrationStatus === 'complete') {
    return { screen: 'Login', params: { email: result.email } };
  }

  const lastCompleted = result.stepStatus === 'COMPLETED'
  ? result.step
  : (result.step ? result.step - 1 : 0);

// 🔥 move to NEXT step
const nextStep = lastCompleted + 1;

const nextScreen = getResumeScreen(nextStep);
  if (!nextScreen) {
    return { screen: 'Login', params: { email: result.email } };
  }
  return { screen: nextScreen, params: baseParams };
};

// export const useForgotPassword = () =>
//   useMutation({ mutationFn: forgotPassword })