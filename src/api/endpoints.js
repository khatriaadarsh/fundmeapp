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
    PROFILE_DETAILS: '/profileDetails',        // POST - Get profile
    UPDATE_PROFILE: '/update/profileDetails',  // POST - Update profile
 
  },
  PROFILE: {
    DETAILS: '/profileDetails',
    UPDATE:  '/update/profileDetails',
  },
   LOCATION: {
    PROVINCES: '/province',
    CITIES:    (provinceId) => `/city/${provinceId}`,
  },
  
  CAMPAIGNS: {
    URGENT: '/urgent-campaigns',
    MY_CAMPAIGNS: '/my/campaigns',
  },

  CATEGORY: {
    LIST: '/category',
  },
  SAVED_CAMPAIGNS: {
    LIST: (userId) => `/saved/campaign/${userId}`,
    UNSAVE: (favouriteId) => `/unsaved/campaign/${favouriteId}`,
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