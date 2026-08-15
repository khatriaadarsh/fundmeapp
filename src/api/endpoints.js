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
     CREATE: '/create-campaign',
     DETAIL: (campaignId) => `/campaign/detail/${campaignId}`,
     SUBMIT_REVIEW: (campaignId) => `/campaign/${campaignId}/submit-review`,
     RESUBMIT_STEP1: '/campaign/rejected/step-one',
     RESUBMIT_STEP2: '/campaign/rejected/step-two',
     RESUBMIT_STEP3: '/campaign/rejected/step-three',
  },

  CATEGORY: {
    LIST: '/category',
  },
  SAVED_CAMPAIGNS: {
    LIST: (userId) => `/saved/campaign/${userId}`,
    UNSAVE: (favouriteId) => `/unsaved/campaign/${favouriteId}`,
  },
 WITHDRAWAL: {
  CAMPAIGN_SUMMARY: (campaignId) => `/withdrawal/campaign/summary/${campaignId}`,
  REQUEST: '/withdrawal/request',
  USER_SUMMARY: (userId) => `/withdrawal/user/summary/${userId}`,
  MY_WITHDRAWALS: (userId) => `/my/withdrawals/${userId}`,
},
DONATION: {
  INITIATE: '/campaign/donate',
  CONFIRM: '/campaign/donate/confirm',
  HISTORY: (userId) => `/donation/history/${userId}`,
  DETAIL: (donationId, userId) => `/donation/${donationId}/user/${userId}`,
},
  NOTIFICATION: {
  COUNT: '/notification/count',
  LIST: '/notification/list',
  READ: '/notification/read',
  READ_ALL: '/notification/read-all',
  DELETE: '/notification/delete',
},
CREATOR: {
  PROFILE: (creatorId) => `/creator/${creatorId}`,
  ABOUT: (creatorId) => `/creator/${creatorId}/about`,
  CAMPAIGNS: (creatorId) => `/creator/${creatorId}/campaigns`,
  STATISTICS: (userId) => `/creator/statistics/${userId}`,
},
RATING: {
  CREATOR: (creatorId) => `/rating/creator/${creatorId}`,
},
DONOR: {
  RECENT: (campaignId) => `/${campaignId}/recent-donors`,
  PROFILE: (donorId) => `/donor/profile/${donorId}`,
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