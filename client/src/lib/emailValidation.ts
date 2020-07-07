const emailRegex = new RegExp(process.env.REACT_APP_EMAIL_REGEX ?? '').compile();

export const validateEmail = (email: string): boolean => {
  return emailRegex.test(email);
};
