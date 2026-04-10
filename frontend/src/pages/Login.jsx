import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext"; 
import brandLogo from "../assets/logo.png";
import {
  IconEnvelope,
  IconLock,
  IconEye,
  IconEyeSlash,
} from "../components/icons/AuthIcons";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast(); 

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Invalid email format";
    if (!form.password) errs.password = "Password is required";
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
      await login(form.email.trim().toLowerCase(), form.password.trim());
      showToast("Login successful!", "success"); // <-- TOAST
      navigate("/", { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message || "Something went wrong. Try again.";
      showToast(msg, "error"); // <-- TOAST
    } finally {
      setIsLoading(false);
    }
  };

  const update = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <div className="min-h-screen bg-surface-gray flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img
            src={brandLogo}
            alt="Crosta POS"
            className="object-contain w-36 h-12"
          />
        </div>

        <div className="bg-surface-white border border-border-main rounded-xl shadow-sm p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-text-primary">
              Welcome Back
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="Enter your password"
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

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-brand hover:text-brand-hover transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-brand hover:bg-brand-hover text-surface-white text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
