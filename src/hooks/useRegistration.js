// src/hooks/useRegistration.js
import { useMutation } from '@tanstack/react-query';
import {
  registerStep1,
  registerStep2,
  registerStep3,
  registerStep4,
  resendOtp,
} from '../services/authService';

const unwrapStep = async (fn, payload) => {
  const body = await fn(payload);
  const code = String(body?.responseCode ?? '');

  if (code && code !== '000') {
    const err = new Error(
      body?.responseMessage || 'Request failed. Please try again.',
    );
    err.code = code;
    err.raw = body;
    throw err;
  }

  return body;
};

export const useRegisterStep1 = () =>
  useMutation({ mutationFn: (p) => unwrapStep(registerStep1, p) });

export const useRegisterStep2 = () =>
  useMutation({ mutationFn: (p) => unwrapStep(registerStep2, p) });

export const useRegisterStep3 = () =>
  useMutation({ mutationFn: (p) => unwrapStep(registerStep3, p) });

export const useRegisterStep4 = () =>
  useMutation({ mutationFn: (p) => unwrapStep(registerStep4, p) });

export const useResendOtp = () =>
  useMutation({ mutationFn: (email) => unwrapStep(resendOtp, email) });