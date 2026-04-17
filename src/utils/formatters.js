export const formatCNIC = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 13);
  
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
};

export const formatPhone = (value) => {
  return value.replace(/\D/g, '').slice(0, 11);
};

export const formatDateOfBirth = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) {
    return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
  }
  return `${digits.slice(0, 2)} / ${digits.slice(2, 4)} / ${digits.slice(4)}`;
};