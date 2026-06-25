// src/hooks/useRegistration.js
import { useMutation } from '@tanstack/react-query';
import {
  registerStep1,
  registerStep2,
  registerStep3,
  registerStep4,
  resendOtp,
} from '../services/authService';

export const useRegisterStep1 = () => useMutation({ mutationFn: registerStep1 });
export const useRegisterStep2 = () => useMutation({ mutationFn: registerStep2 });
export const useRegisterStep3 = () => useMutation({ mutationFn: registerStep3 });
export const useRegisterStep4 = () => useMutation({ mutationFn: registerStep4 });
export const useResendOtp     = () => useMutation({ mutationFn: resendOtp });