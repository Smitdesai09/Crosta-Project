import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import brandLogo from "../assets/logo.png";
import {
  IconUser,
  IconEnvelope,
  IconLock,
  IconEye,
  IconEyeSlash,
  IconCheck,
} from "../components/icons/AuthIcons";

export default function Register() {
  const navigate = useNavigate();
  const { register, user } = useAuth();
  const { showToast } = useToast();

  // Detect if we are in Admin Mode
  const isAdmin = user?.role === "admin";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    else if (form.name.trim().length < 2)
      errs.name = "Name must be at least 2 characters";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Invalid email format";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 6)
      errs.password = "Password must be at least 6 characters";
    if (!form.confirmPassword)
      errs.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setIsLoading(true);

    try {
      await register(form.name, form.email, form.password);

      // Logic for Admin vs User
      if (isAdmin) {
        showToast("New user registered successfully!", "success");
        // Clear the form so admin can register another user immediately
        setForm({ name: "", email: "", password: "", confirmPassword: "" });
      } else {
        // Normal user self-registration goes to login
        showToast("Account created! Please sign in.", "success");
        navigate("/login", { replace: true });
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || "Something went wrong. Try again.";
      showToast(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const update = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const passwordChecks = [
    { label: "At least 6 characters", met: form.password.length >= 6 },
    {
      label: "Passwords match",
      met:
        form.password === form.confirmPassword &&
        form.confirmPassword.length > 0,
    },
  ];

  return (
    // CONTAINER: Switches layout based on Admin vs Public
    <div
      className={"w-full max-w-2xl mx-auto px-4  min-h-screen overflow-y-auto"}
    >
      <div className="w-full">
        {/* LOGO: Only show if NOT in Admin Dashboard (to avoid duplicate logos) */}
        {/* {!isAdmin && (
          <div className="flex justify-center mb-8">
            <img
              src={brandLogo}
              alt="Crosta POS"
              className="object-contain w-36 h-12"
            />
          </div>
        )} */}

        {/* CARD */}
        <div className="bg-surface-white border border-border-main rounded-xl shadow-sm overflow-hidden">
          {/* HEADER SECTION */}
          <div className="px-6 py-2 border-b border-border-light">
            <h1 className="text-2xl font-bold text-text-primary">
              {isAdmin ? "Register New Operator" : "Create Account"}
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              {isAdmin
                ? "Enter the details for the new staff member"
                : "Set up your Crosta POS account"}
            </p>
          </div>

          {/* FORM SECTION */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-placeholder">
                    <IconUser />
                  </span>
                  <input
                    type="text"
                    value={form.name}
                    onChange={update("name")}
                    placeholder="John Doe"
                    className={`w-full pl-10 pr-4 py-2.5 bg-surface-gray border rounded-lg text-sm text-text-primary placeholder:text-text-placeholder focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition-colors ${
                      errors.name
                        ? "border-red-400 focus:ring-red-100"
                        : "border-border-main"
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-red-600 mt-1 pl-1">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-placeholder">
                    <IconEnvelope />
                  </span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={update("email")}
                    placeholder="you@example.com"
                    className={`w-full pl-10 pr-4 py-2.5 bg-surface-gray border rounded-lg text-sm text-text-primary placeholder:text-text-placeholder focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition-colors ${
                      errors.email
                        ? "border-red-400 focus:ring-red-100"
                        : "border-border-main"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1 pl-1">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Row (Side by Side on larger screens for Admin) */}
              <div
                className={`grid gap-5 ${isAdmin ? "md:grid-cols-2" : "grid-cols-1"}`}
              >
                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-placeholder">
                      <IconLock />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={update("password")}
                      placeholder="Min. 6 chars"
                      className={`w-full pl-10 pr-10 py-2.5 bg-surface-gray border rounded-lg text-sm text-text-primary placeholder:text-text-placeholder focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition-colors ${
                        errors.password
                          ? "border-red-400 focus:ring-red-100"
                          : "border-border-main"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-placeholder hover:text-text-secondary transition-colors"
                    >
                      {showPassword ? <IconEyeSlash /> : <IconEye />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-600 mt-1 pl-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-placeholder">
                      <IconLock />
                    </span>
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={update("confirmPassword")}
                      placeholder="Re-enter password"
                      className={`w-full pl-10 pr-10 py-2.5 bg-surface-gray border rounded-lg text-sm text-text-primary placeholder:text-text-placeholder focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition-colors ${
                        errors.confirmPassword
                          ? "border-red-400 focus:ring-red-100"
                          : "border-border-main"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-placeholder hover:text-text-secondary transition-colors"
                    >
                      {showConfirm ? <IconEyeSlash /> : <IconEye />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-600 mt-1 pl-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Password Strength Hints */}
              {form.password.length > 0 && (
                <div className="space-y-1.5 bg-surface-gray/50 p-3 rounded-lg">
                  {passwordChecks.map((check) => (
                    <div
                      key={check.label}
                      className="flex items-center gap-2 text-xs"
                    >
                      <span
                        className={
                          check.met
                            ? "text-emerald-500"
                            : "text-text-placeholder"
                        }
                      >
                        <IconCheck className="w-3.5 h-3.5" />
                      </span>
                      <span
                        className={
                          check.met
                            ? "text-emerald-600 font-medium"
                            : "text-text-secondary"
                        }
                      >
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-brand hover:bg-brand-hover text-surface-white text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
