// src/utils/apiHandler.js

/** Wrap a service call → returns { success, data } | { success, error } */
export const safeCall = async (promise) => {
  try {
    const data = await promise;
    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
};

/** Unwraps backend envelope `{ data: {...} }` → `{...}` */
export const unwrap = (response) => {
  const body = response?.data;
  if (body && typeof body === 'object' && 'data' in body) return body.data;
  return body;
};