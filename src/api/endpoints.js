export const ENDPOINTS = {

  AUTH: {
    USER_EXIST: "/auth/user-exist",
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
  },


USER: {
    PROFILE: "/users/profile",
  },

  CAMPAIGN: {
    LIST: "/campaigns",
    DETAILS: (id) => `/campaigns/${id}`,
    CREATE: "/campaigns",
    SAVE: "/campaigns/save",         // toggle save
    MY_CAMPAIGNS: "/campaigns/my",
  },

  WITHDRAWAL: {
    CREATE: "/withdrawals",
    LIST: "/withdrawals",
  },
  
  NOTIFICATION: {
    LIST: "/notifications",
    MARK_READ: (id) => `/notifications/${id}/read`,
  },

};