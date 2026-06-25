// src/utils/formatters.js

/**
 * Format CNIC
 * 42101-1234567-1
 */
export const formatCNIC = (value = '') => {
  const digits = value.replace(/\D/g, '').slice(0, 13);

  if (digits.length <= 5) return digits;

  if (digits.length <= 12) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }

  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
};

/**
 * Format Phone Number
 * 03001234567
 */
export const formatPhone = (value = '') => {
  return value.replace(/\D/g, '').slice(0, 11);
};

/**
 * Format DOB for UI
 * Input: 01012000
 * Output: 01 / 01 / 2000
 */
export const formatDateOfBirth = (value = '') => {
  const digits = value.replace(/\D/g, '').slice(0, 8);

  if (digits.length <= 2) return digits;

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)} / ${digits.slice(2, 4)} / ${digits.slice(4)}`;
};

/**
 * Convert UI DOB to API format
 * Input: 01 / 01 / 2000
 * Output: 2000-01-01
 */
export const dobUiToApi = (dob = '') => {
  if (!dob) return '';

  const cleaned = dob.replace(/\s/g, '');
  const parts = cleaned.split('/');

  if (parts.length !== 3) return '';

  const [day, month, year] = parts;

  if (!day || !month || !year) return '';

  return `${year}-${month}-${day}`;
};

/**
 * Convert API DOB to UI format
 * Input: 2000-01-01
 * Output: 01 / 01 / 2000
 */
export const dobApiToUi = (dob = '') => {
  if (!dob) return '';

  const cleaned = dob.replace(/\s/g, '');
  const [day, month, year] = cleaned.split('/');

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr',
    'May', 'Jun', 'Jul', 'Aug',
    'Sep', 'Oct', 'Nov', 'Dec',
  ];

  return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
};

/**
 * Remove formatting from CNIC
 * Input: 42101-1234567-1
 * Output: 4210112345671
 */
export const unformatCNIC = (value = '') => {
  return value.replace(/\D/g, '');
};

/**
 * Remove formatting from phone
 * Input: 0300-1234567
 * Output: 03001234567
 */
export const unformatPhone = (value = '') => {
  return value.replace(/\D/g, '');
};