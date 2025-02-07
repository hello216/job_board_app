export const validateEmail = (email) => {
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
    return "Invalid email format";
  }
  return null;
};

export const validatePassword = (password) => {
  if (password.length < 12) {
    return "Password should be at least 12 characters long";
  }
  if (password.length > 128) {
    return "Password cannot be longer than 128 characters";
  }
  return null;
};