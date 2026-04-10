import { useState } from "react";
import {
  IconUser,
  IconEnvelope,
  IconLock,
  IconEye,
  IconEyeSlash,
  IconCheck,
} from "../icons/AuthIcons";

const RegisterUserForm = ({
  form,
  errors,
  isLoading,
  onChange,
  onSubmit,
  submitLabel,
  loadingLabel,
  showPasswordHints = true,
  passwordGridClassName = "grid-cols-1",
  submitButtonClassName = "",
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordChecks = [
    { label: "At least 6 characters", met: form.password.length >= 6 },
    {
      label: "Passwords match",
      met: form.password === form.confirmPassword && form.confirmPassword.length > 0,
    },
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">Full Name</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-placeholder">
            <IconUser />
          </span>
          <input
            type="text"
            value={form.name}
            onChange={(event) => onChange("name", event.target.value)}
            placeholder="John Doe"
            className={`w-full pl-10 pr-4 py-2.5 bg-surface-gray border rounded-lg text-sm text-text-primary placeholder:text-text-placeholder focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition-colors ${
              errors.name ? "border-red-400 focus:ring-red-100" : "border-border-main"
            }`}
          />
        </div>
        {errors.name ? <p className="text-xs text-red-600 mt-1 pl-1">{errors.name}</p> : null}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">Email Address</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-placeholder">
            <IconEnvelope />
          </span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => onChange("email", event.target.value)}
            placeholder="you@example.com"
            className={`w-full pl-10 pr-4 py-2.5 bg-surface-gray border rounded-lg text-sm text-text-primary placeholder:text-text-placeholder focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition-colors ${
              errors.email ? "border-red-400 focus:ring-red-100" : "border-border-main"
            }`}
          />
        </div>
        {errors.email ? <p className="text-xs text-red-600 mt-1 pl-1">{errors.email}</p> : null}
      </div>

      <div className={`grid gap-5 ${passwordGridClassName}`}>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Password</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-placeholder">
              <IconLock />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(event) => onChange("password", event.target.value)}
              placeholder="Min. 6 chars"
              className={`w-full pl-10 pr-10 py-2.5 bg-surface-gray border rounded-lg text-sm text-text-primary placeholder:text-text-placeholder focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition-colors ${
                errors.password ? "border-red-400 focus:ring-red-100" : "border-border-main"
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
          {errors.password ? <p className="text-xs text-red-600 mt-1 pl-1">{errors.password}</p> : null}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Confirm Password</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-placeholder">
              <IconLock />
            </span>
            <input
              type={showConfirm ? "text" : "password"}
              value={form.confirmPassword}
              onChange={(event) => onChange("confirmPassword", event.target.value)}
              placeholder="Re-enter password"
              className={`w-full pl-10 pr-10 py-2.5 bg-surface-gray border rounded-lg text-sm text-text-primary placeholder:text-text-placeholder focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition-colors ${
                errors.confirmPassword ? "border-red-400 focus:ring-red-100" : "border-border-main"
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
          {errors.confirmPassword ? (
            <p className="text-xs text-red-600 mt-1 pl-1">{errors.confirmPassword}</p>
          ) : null}
        </div>
      </div>

      {showPasswordHints && form.password.length > 0 ? (
        <div className="space-y-1.5 bg-surface-gray/50 p-3 rounded-lg">
          {passwordChecks.map((check) => (
            <div key={check.label} className="flex items-center gap-2 text-xs">
              <span className={check.met ? "text-emerald-500" : "text-text-placeholder"}>
                <IconCheck className="w-3.5 h-3.5" />
              </span>
              <span className={check.met ? "text-emerald-600 font-medium" : "text-text-secondary"}>
                {check.label}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-2.5 text-surface-white text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2 ${submitButtonClassName}`}
      >
        {isLoading ? loadingLabel : submitLabel}
      </button>
    </form>
  );
};

export default RegisterUserForm;
