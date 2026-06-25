// src/api/endpoint.js
export const ENDPOINTS = {
  AUTH: {
    USER_EXIST:         `/user/exist`,
    USER_REGISTRATION: '/user-registration',
    LOGIN:             '/user/login',
    RESEND_OTP:        '/resend-otp',
    VERIFY_OTP:        '/otp/verify',
    FORGOT_PASSWORD:   '/forgot-password',
  
    LOGOUT:            '/auth/logout',
  },
  USER: {
    PROFILE: '/users/profile',
  },
   LOCATION: {
    PROVINCES: '/province',
    CITIES:    (provinceId) => `/city/${provinceId}`,
  },
  
  CAMPAIGN: {
    LIST:         '/campaigns',
    DETAILS:      (id) => `/campaigns/${id}`,
    CREATE:       '/campaigns',
    SAVE:         '/campaigns/save',
    MY_CAMPAIGNS: '/campaigns/my',
  },
  WITHDRAWAL: {
    CREATE: '/withdrawals',
    LIST:   '/withdrawals',
  },
  NOTIFICATION: {
    LIST:      '/notifications',
    MARK_READ: (id) => `/notifications/${id}/read`,
  },
};

/**
 * Backend response codes (single source of truth)
 *   041 → registration in progress (draft)
 *   000 → user fully registered
 *   010 → user not found
 */
export const RESPONSE_CODES = {
  DRAFT:     '041',
  COMPLETE:  '000',
  NOT_FOUND: '010',
};