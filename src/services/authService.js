// src/services/authService.js
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { RESPONSE_CODES } from '../api/responseCodes';
import { buildFormData } from '../utils/formData';
import { getDeviceInfo } from '../config/device';

// ─── User Exist ──────────────────────────────────────────────
// Decision codes handled here:
//   000 → fully registered
//   041 → draft (still valid, not an error)
//   010 → not found (still valid, not an error)
// Anything else → propagates as error (toast).
export const checkUserByEmail = async (email) => {
  const normalised = email.trim().toLowerCase();

  try {
    const res = await apiClient.post(ENDPOINTS.AUTH.USER_EXIST, {
      email: normalised,
    });
    return buildUserResult(res.data, 'complete', normalised);
  } catch (err) {
    if (err?.code === RESPONSE_CODES.DRAFT) {
      return buildUserResult(err.raw, 'draft', normalised);
    }
    if (err?.code === RESPONSE_CODES.NOT_FOUND) {
      return buildUserResult(err.raw, null, normalised);
    }
    throw err;
  }
};

const buildUserResult = (body, status, fallbackEmail) => {
  const data = body?.data || {};
  return {
    exists:             status === 'complete' || status === 'draft',
    registrationStatus: status,
    step:       data.step ?? null,
    stepStatus: data.stepStatus ?? null,
    userId:     data.userId ?? null,
    email:      data.email || fallbackEmail,
    profile:    data,
    raw:        body,
  };
};

// ─── Registration (multipart) ────────────────────────────────
// Only "000" reaches success branch — interceptor handles the rest.
const postRegistrationStep = async (fields) => {
  const formData = buildFormData(fields);
  const res = await apiClient.post(ENDPOINTS.AUTH.USER_REGISTRATION, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    transformRequest: (data) => data,
  });
  return res.data;
};

export const resendOtp = async (email) => {
  const res = await apiClient.post(ENDPOINTS.AUTH.RESEND_OTP, {
    email: email.trim().toLowerCase(),
  });
  return res.data;
};

// ─── Forgot Password — Step 2: Verify OTP ───────────────────
export const verifyOtp = async ({ email, otp }) => {
  const res = await apiClient.post(ENDPOINTS.AUTH.VERIFY_OTP, {
    email: email.trim().toLowerCase(),
    otp,
  });
  return res.data;
};

// ─── Forgot Password — Step 3: Set New Password ─────────────
export const resetPassword = async ({ email, password }) => {
  const res = await apiClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, {
    email: email.trim().toLowerCase(),
    password,
  });
  return res.data;
};


// ─── Login ──────────────────────────────────────────────────
export const login = async ({ email, password }) => {
  const device = await getDeviceInfo();

  const payload = {
    email: email.trim().toLowerCase(),
    password,
    deviceRequestDto: {
      deviceId:   device.deviceId,
      fcmToken:   device.fcmToken || '',
      deviceType: device.deviceType,
      deviceName: device.deviceName,
    },
  };

  // console.log('🔵 login payload:', payload);
  const res = await apiClient.post(ENDPOINTS.AUTH.LOGIN, payload);
  // console.log('🟢 login response:', res.data);
  return res.data;
};

export const registerStep1 = (p) => postRegistrationStep({
  step: 1,
  firstName:       p.firstName,
  lastName:        p.lastName,
  email:           p.email,
  mobileNumber:    p.mobileNumber,
  password:        p.password,
  confirmPassword: p.confirmPassword,
  userRole:        p.userRole || 'user',
});

export const registerStep2 = (p) => postRegistrationStep({
  step:  2,
  email: p.email,
  otp:   p.otp,
});

export const registerStep3 = (p) => {
  const fields = {
    step:      3,
    email:     p.email,
    nicNumber: p.nicNumber,
    nicFront:  p.nicFront,
    nicBack:   p.nicBack,
  };

  if (p.notificationType) {
    fields.notificationType = p.notificationType;
  }
  if (p.status) {
    fields.status = p.status;
  }

  return postRegistrationStep(fields);
};


export const registerStep4 = (p) => postRegistrationStep({
  step:         4,
  email:        p.email,
  profileImage: p.profileImage,
  bio:          p.bio,
  dateOfBirth:  p.dateOfBirth,
  gender:       p.gender,
  province:     p.province,
  city:         p.city,
});