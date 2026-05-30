/**
 * Module: features/register/passwordRules.js
 * Purpose: Supports the password Rules module and keeps its responsibility isolated by file name.
 */
export const getPasswordChecks = (value) => ({
  minLength: value.length >= 8,
  hasNumber: /\d/.test(value),
  hasSpecial: /[^A-Za-z0-9]/.test(value),
  noEdgeWhitespace: value.length > 0 && value === value.trim(),
});

export const PASSWORD_REQUIREMENTS = [
  { key: 'minLength', label: '8 characters minimum' },
  { key: 'hasNumber', label: '1 number minimum' },
  { key: 'hasSpecial', label: '1 special character like $, !, @, %, &' },
  { key: 'noEdgeWhitespace', label: 'No leading or trailing whitespace' },
];
