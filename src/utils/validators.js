// Name validation - Min 3 characters
export const validateName = (name) => {
  return name && name.trim().length >= 3;
};

export const validateNameWithMessage = (name, fieldName = 'Name') => {
  if (!name || !name.trim()) {
    return `${fieldName} is required`;
  }
  if (name.trim().length < 3) {
    return `${fieldName} must be at least 3 characters`;
  }
  if (name.trim().length > 50) {
    return `${fieldName} must not exceed 50 characters`;
  }
  if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
    return `${fieldName} must contain only letters`;
  }
  return null;
};

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateEmailWithMessage = (email) => {
  if (!email || !email.trim()) {
    return 'Email is required';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email (e.g., user@example.com)';
  }
  return null;
};

// Phone validation - Exactly 11 digits
export const validatePhone = (phone) => {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length === 11;
};

export const validatePhoneWithMessage = (phone) => {
  if (!phone || !phone.trim()) {
    return 'Phone number is required';
  }
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length === 0) {
    return 'Phone number is required';
  }
  if (cleanPhone.length < 11) {
    return `Phone number must be 11 digits (${cleanPhone.length}/11)`;
  }
  if (cleanPhone.length > 11) {
    return 'Phone number cannot exceed 11 digits';
  }
  return null;
};

// Password validation - Min 8 characters
export const validatePassword = (password) => {
  return password && password.length >= 8;
};

export const validatePasswordWithMessage = (password) => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 8) {
    return `Password must be at least 8 characters (${password.length}/8)`;
  }
  return null;
};

// Password strength indicator
export const getPasswordStrength = (password) => {
  if (!password) return null;
  
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  
  if (strength <= 2) return { level: 'weak', color: '#EF4444', text: 'Weak' };
  if (strength <= 4) return { level: 'medium', color: '#F59E0B', text: 'Medium' };
  return { level: 'strong', color: '#22C55E', text: 'Strong' };
};

// Confirm Password validation
export const validatePasswordMatch = (password, confirmPassword) => {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return null;
};

// CNIC validation - Exactly 13 digits
export const validateCNIC = (cnic) => {
  const cleanCNIC = cnic.replace(/-/g, '');
  return cleanCNIC.length === 13 && /^\d+$/.test(cleanCNIC);
};

export const validateCNICWithMessage = (cnic) => {
  if (!cnic || !cnic.trim()) {
    return 'CNIC number is required';
  }
  const cleanCNIC = cnic.replace(/-/g, '');
  if (cleanCNIC.length < 13) {
    return `CNIC must be 13 digits (${cleanCNIC.length}/13)`;
  }
  if (cleanCNIC.length > 13) {
    return 'CNIC cannot exceed 13 digits';
  }
  if (!/^\d+$/.test(cleanCNIC)) {
    return 'CNIC must contain only numbers';
  }
  return null;
};

// Role validation
export const validateRoleWithMessage = (role) => {
  if (!role) {
    return 'Please select your role (Donor, Creator, or User)';
  }
  return null;
};

// Date of Birth validation
export const validateDOBWithMessage = (dob) => {
  if (!dob || !dob.trim()) {
    return 'Date of birth is required';
  }
  const cleanDOB = dob.replace(/\s/g, '').replace(/\//g, '');
  if (cleanDOB.length < 8) {
    return `Date must be in DD/MM/YYYY format (${cleanDOB.length}/8 digits)`;
  }
  return null;
};

// Gender validation
export const validateGenderWithMessage = (gender) => {
  if (!gender) {
    return 'Please select your gender';
  }
  return null;
};

// Province validation
export const validateProvinceWithMessage = (province) => {
  if (!province) {
    return 'Please select your province';
  }
  return null;
};

// City validation
export const validateCityWithMessage = (city) => {
  if (!city) {
    return 'Please select your city';
  }
  return null;
};