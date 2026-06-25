// src/utils/errorHandler.js

/**
 * Extracts the most relevant message from a backend response body.
 * Backend may put validation messages in:
 *   - body.responseMessage              (generic)
 *   - body.data                         (string)  → e.g. "City not found"
 *   - body.data.message                 (string)  → e.g. { message: "..." }
 *   - body.data = { field: "error" }    (object)  → field-level errors
 *
 * Returns: { message, fieldErrors }
 */
const extractMessage = (body) => {
  if (!body || typeof body !== 'object') {
    return { message: 'Something went wrong', fieldErrors: null };
  }

  const { responseMessage, data } = body;

  // Case 1: data is a plain string → it IS the message
  if (typeof data === 'string' && data.trim()) {
    return { message: data, fieldErrors: null };
  }

  // Case 2: data is an object
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    // 2a: explicit message field
    if (typeof data.message === 'string' && data.message.trim()) {
      return { message: data.message, fieldErrors: null };
    }

    // 2b: field-level errors → { email: "Invalid", password: "Short" }
    const stringEntries = Object.entries(data).filter(
      ([, v]) => typeof v === 'string' && v.trim(),
    );
    if (stringEntries.length > 0) {
      const fieldErrors = Object.fromEntries(stringEntries);
      const combined    = stringEntries.map(([, v]) => v).join('\n');
      return {
        message: responseMessage || combined,
        fieldErrors,
      };
    }
  }

  // Case 3: data is an array of strings
  if (Array.isArray(data) && data.length > 0) {
    const msgs = data.filter(x => typeof x === 'string');
    if (msgs.length) {
      return { message: responseMessage || msgs.join('\n'), fieldErrors: null };
    }
  }

  // Case 4: fall back to responseMessage
  return {
    message: responseMessage || 'Something went wrong',
    fieldErrors: null,
  };
};

/**
 * Standardised error shape thrown everywhere:
 *   { status, code, message, fieldErrors, raw, isBusiness }
 *
 *   isBusiness = true  → backend returned HTTP 200 with non-success responseCode
 *   isBusiness = false → HTTP/network failure
 */
export const parseApiError = (error) => {
  // Network / timeout
  if (!error.response) {
    return {
      status: 0,
      code:   'NETWORK_ERROR',
      message:
        error.code === 'ECONNABORTED'
          ? 'Request timed out. Please try again.'
          : 'No internet connection. Please check your network.',
      fieldErrors: null,
      raw:         null,
      isBusiness:  false,
    };
  }

  const { status, data: body } = error.response;
  const { message, fieldErrors } = extractMessage(body);

  return {
    status,
    code:        body?.responseCode || body?.code || `HTTP_${status}`,
    message,
    fieldErrors,
    raw:         body,
    isBusiness:  false,
  };
};

/**
 * Build a business error from HTTP 200 with non-success responseCode.
 * Always uses backend's message as-is (from wherever it lives).
 */
export const buildBusinessError = (responseBody) => {
  const { message, fieldErrors } = extractMessage(responseBody);
  return {
    status:      200,
    code:        responseBody?.responseCode || 'UNKNOWN',
    message,
    fieldErrors,
    raw:         responseBody,
    isBusiness:  true,
  };
};