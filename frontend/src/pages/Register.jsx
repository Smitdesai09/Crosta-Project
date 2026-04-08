import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    else if (form.name.trim().length < 2) errs.name = "Name must be at least 2 characters";
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
    setServerError("");
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setIsLoading(true);

    try {
      await register(form.name, form.email, form.password);
      navigate("/login", { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message || "Something went wrong. Try again.";
      setServerError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const update = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    if (serverError) setServerError("");
  };

  const passwordChecks = [
    { label: "At least 6 characters", met: form.password.length >= 6 },
    { label: "Passwords match", met: form.password === form.confirmPassword && form.confirmPassword.length > 0 },
  ];

  return (
    <div className="min-h-screen bg-surface-gray flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src={brandLogo}
            alt="Crosta POS"
            className="object-contain w-36 h-12"
          />
        </div>

        {/* Card */}
        <div className="bg-surface-white border border-border-main rounded-xl shadow-sm p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-text-primary">
              Create Account
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Set up your Crosta POS account
            </p>
          </div>

          {/* Server Error */}
          {serverError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {serverError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                    errors.name ? "border-red-400" : "border-border-main"
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-red-600 mt-1">{errors.name}</p>
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
                    errors.email ? "border-red-400" : "border-border-main"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600 mt-1">{errors.email}</p>
              )}
            </div>

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
                  placeholder="Min. 6 characters"
                  className={`w-full pl-10 pr-10 py-2.5 bg-surface-gray border rounded-lg text-sm text-text-primary placeholder:text-text-placeholder focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition-colors ${
                    errors.password ? "border-red-400" : "border-border-main"
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
                <p className="text-xs text-red-600 mt-1">{errors.password}</p>
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
                  placeholder="Re-enter your password"
                  className={`w-full pl-10 pr-10 py-2.5 bg-surface-gray border rounded-lg text-sm text-text-primary placeholder:text-text-placeholder focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition-colors ${
                    errors.confirmPassword
                      ? "border-red-400"
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
                <p className="text-xs text-red-600 mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Password Strength Hints */}
            {form.password.length > 0 && (
              <div className="space-y-1.5">
                {passwordChecks.map((check) => (
                  <div
                    key={check.label}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span
                      className={
                        check.met ? "text-emerald-500" : "text-text-placeholder"
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

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-brand hover:bg-brand-hover text-surface-white text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        </div>

        {/* Login Link */}
        <p className="text-center text-sm text-text-secondary mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-brand hover:text-brand-hover font-semibold transition-colors"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}