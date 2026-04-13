import { useState } from "react";
import { Link } from "react-router-dom";
import authService from "../services/authService";
import brandLogo from "../assets/logo.png";
import {
  IconArrowLeft,
  IconEnvelope,
  IconKey,
} from "../components/icons/AuthIcons";
import { useToast } from "../lib/ToastContext";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const { showToast } = useToast();

  const validate = () => {
    if (!email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Invalid email format";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();
    
    if (validationError) {
      showToast(validationError, "error"); 
      return;
    }

    setIsLoading(true);

    try {
      await authService.forgotPassword({ email: email.trim() });
      showToast("Reset link sent successfully!", "success");
      setIsSent(true);
    } catch (err) {
      const msg =
        err.response?.data?.message || "Something went wrong. Try again.";
      showToast(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

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
          {!isSent ? (
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
                  Forgot Password?
                </h1>
                <p className="text-sm text-gray-500 mt-1.5">
                  Enter your email and we&apos;ll send you a reset link
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <IconEnvelope />
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            </>
          ) : (
            /* Success State */
            <>
              <div className="flex flex-col items-center py-4">
                <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-4">
                  <span className="text-green-500">
                    <IconEnvelope className="w-7 h-7" />
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Check Your Email
                </h1>
                <p className="text-sm text-gray-500 text-center leading-relaxed">
                  We&apos;ve sent a password reset link to
                  <br />
                  <span className="font-semibold text-gray-900">
                    {email}
                  </span>
                </p>
                <p className="text-xs text-gray-500 text-center mt-3">
                  The link will expire in 15 minutes.
                </p>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={() => {
                    setIsSent(false);
                    setEmail("");
                  }}
                  className="w-full py-2.5 bg-white border border-gray-300 text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Try a Different Email
                </button>
              </div>
            </>
          )}

          {/* Back to Login */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              <IconArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;