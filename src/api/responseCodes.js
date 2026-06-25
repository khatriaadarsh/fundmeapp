// src/api/responseCodes.js
//
// Only THREE codes drive app decisions. Everything else = error to display.
//
//   000 → success
//   041 → registration draft  (used by checkUser for routing)
//   010 → user not found      (used by checkUser for routing)

export const RESPONSE_CODES = {
  SUCCESS:   '000',
  DRAFT:     '041',
  NOT_FOUND: '010',
};

export const isSuccessCode = (code) => code === RESPONSE_CODES.SUCCESS;