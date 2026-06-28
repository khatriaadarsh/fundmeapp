// // src/hooks/useAuth.js
// import { useMutation } from '@tanstack/react-query';
// import { checkUserByEmail, verifyOtp,
//   resetPassword,resendOtp,login } from '../services/authService';
// import { getResumeScreen }  from '../services/userService';

// export const useVerifyOtp     = () => useMutation({ mutationFn: verifyOtp });
// export const useResetPassword = () => useMutation({ mutationFn: resetPassword });
// export const useResendOtp     = () => useMutation({ mutationFn: resendOtp });
// export const useLogin         = () => useMutation({ mutationFn: login });
// export const useCheckUser = () =>
//   useMutation({ mutationFn: checkUserByEmail });

// export const resolveAuthRoute = (result) => {
//   const baseParams = {
//     email:   result.email,
//     userId:  result.userId,
//     prefill: result.profile,
//   };

//   if (!result.exists) {
//     return { screen: 'SignUpScreen', params: { email: result.email } };
//   }
//   if (result.registrationStatus === 'complete') {
//     return { screen: 'Login', params: { email: result.email } };
//   }

//   const lastCompleted = result.stepStatus === 'COMPLETED'
//   ? result.step
//   : (result.step ? result.step - 1 : 0);

// // 🔥 move to NEXT step
// const nextStep = lastCompleted + 1;

// const nextScreen = getResumeScreen(nextStep);
//   if (!nextScreen) {
//     return { screen: 'Login', params: { email: result.email } };
//   }
//   return { screen: nextScreen, params: baseParams };
// };

// // export const useForgotPassword = () =>
// //   useMutation({ mutationFn: forgotPassword })


// src/hooks/useAuth.js
import { useMutation } from '@tanstack/react-query';
import { checkUserByEmail, verifyOtp, resetPassword, resendOtp, login } from '../services/authService';
import { getResumeScreen } from '../services/userService';
import { storeUserId, storeUserData } from '../utils/storage';

export const useVerifyOtp = () => useMutation({ mutationFn: verifyOtp });
export const useResetPassword = () => useMutation({ mutationFn: resetPassword });
export const useResendOtp = () => useMutation({ mutationFn: resendOtp });
export const useCheckUser = () => useMutation({ mutationFn: checkUserByEmail });

// Updated login hook to store userId
export const useLogin = () => {
  return useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      console.log('🟢 [useLogin] Login successful, response:', response);
      
      // Extract userId from login response
      // Assuming response structure: { responseCode: "000", data: { id: 9, ... } }
      const userId = response?.data?.id || response?.data?.userId;
      const userData = response?.data;
      
      if (userId) {
        // Store userId and user data
        storeUserId(userId);
        storeUserData(userData);
        console.log('✅ [useLogin] userId stored:', userId);
      } else {
        console.error('🔴 [useLogin] No userId found in response:', response);
      }
    },
    onError: (error) => {
      console.error('🔴 [useLogin] Login failed:', error);
    },
  });
};

export const resolveAuthRoute = (result) => {
  const baseParams = {
    email: result.email,
    userId: result.userId,
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

  const nextStep = lastCompleted + 1;
  const nextScreen = getResumeScreen(nextStep);
  
  if (!nextScreen) {
    return { screen: 'Login', params: { email: result.email } };
  }
  return { screen: nextScreen, params: baseParams };
};