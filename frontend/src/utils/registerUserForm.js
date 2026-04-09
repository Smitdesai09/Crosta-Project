export const createInitialRegisterForm = () => ({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
});

export function validateRegisterForm(form) {
  const errors = {};

  if (!form.name.trim()) errors.name = "Name is required";
  else if (form.name.trim().length < 2) errors.name = "Name must be at least 2 characters";

  if (!form.email.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Invalid email format";

  if (!form.password) errors.password = "Password is required";
  else if (form.password.length < 6) errors.password = "Password must be at least 6 characters";

  if (!form.confirmPassword) errors.confirmPassword = "Please confirm your password";
  else if (form.password !== form.confirmPassword) errors.confirmPassword = "Passwords do not match";

  return errors;
}
