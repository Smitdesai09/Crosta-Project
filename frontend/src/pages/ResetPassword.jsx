import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";
import brandLogo from "../assets/logo.png";
import {
  IconLock,
  IconEye,
  IconEyeSlash,
  IconCheck,
  IconArrowLeft,
  IconKey,
} from "../components/icons/AuthIcons";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    if (!form.password) return "New password is required";
    if (form.password.length < 6)
      return "Password must be at least 6 characters";
    if (!form.confirmPassword) return "Please confirm your password";
    if (form.password !== form.confirmPassword)
      return "Passwords do not match";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword(token, {
        password: form.password,
      });
      setIsSuccess(true);
    } catch (err) {
      const msg =
        err.response?.data?.message || "Something went wrong. Try again.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const update = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (error) setError("");
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
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
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          {!isSuccess ? (
            <>
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                  <span className="text-red-500">
                    <IconKey className="w-7 h-7" />
                  </span>
                </div>
              </div>

              {/* Header */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  Reset Password
                </h1>
                <p className="text-sm text-gray-500 mt-1.5">
                  Enter your new password below
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <IconLock />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={update("password")}
                      placeholder="Min. 6 characters"
                      className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500 transition-colors"
                    >
                      {showPassword ? <IconEyeSlash /> : <IconEye />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <IconLock />
                    </span>
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={update("confirmPassword")}
                      placeholder="Re-enter your password"
                      className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500 transition-colors"
                    >
                      {showConfirm ? <IconEyeSlash /> : <IconEye />}
                    </button>
                  </div>
                </div>

                {/* Password Hints */}
                {form.password.length > 0 && (
                  <div className="space-y-1.5">
                    {passwordChecks.map((check) => (
                      <div
                        key={check.label}
                        className="flex items-center gap-2 text-xs"
                      >
                        <span
                          className={
                            check.met
                              ? "text-green-500"
                              : "text-gray-400"
                          }
                        >
                          <IconCheck className="w-3.5 h-3.5" />
                        </span>
                        <span
                          className={
                            check.met
                              ? "text-green-600 font-medium"
                              : "text-gray-500"
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
                  className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </>
          ) : (
            /* Success State */
            <div className="flex flex-col items-center py-6">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-4">
                <span className="text-green-500">
                  <IconCheck className="w-7 h-7" />
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Password Reset Successful
              </h1>
              <p className="text-sm text-gray-500 text-center leading-relaxed">
                Your password has been updated. You can now sign in with your
                new password.
              </p>
              <button
                onClick={() => navigate("/login", { replace: true })}
                className="mt-6 w-full py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
              >
                Go to Sign In
              </button>
            </div>
          )}

          {/* Back to Login */}
          {!isSuccess && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                <IconArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}