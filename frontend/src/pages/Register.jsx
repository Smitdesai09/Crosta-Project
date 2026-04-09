import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import RegisterUserForm from "../components/user/RegisterUserForm";
import { createInitialRegisterForm, validateRegisterForm } from "../utils/registerUserForm";

export default function Register() {
  const navigate = useNavigate();
  const { register, user } = useAuth();
  const { showToast } = useToast();

  const isAdmin = user?.role === "admin";

  const [form, setForm] = useState(createInitialRegisterForm);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errs = validateRegisterForm(form);

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await register(form.name, form.email, form.password);

      if (isAdmin) {
        showToast("New user registered successfully!", "success");
        setForm(createInitialRegisterForm());
      } else {
        showToast("Account created! Please sign in.", "success");
        navigate("/login", { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong. Try again.";
      showToast(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 min-h-screen overflow-y-auto">
      <div className="w-full">
        <div className="bg-surface-white border border-border-main rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-2 border-b border-border-light">
            <h1 className="text-2xl font-bold text-text-primary">
              {isAdmin ? "Register New Operator" : "Create Account"}
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              {isAdmin ? "Enter the details for the new staff member" : "Set up your Crosta POS account"}
            </p>
          </div>

          <div className="p-6">
            <RegisterUserForm
              form={form}
              errors={errors}
              isLoading={isLoading}
              onChange={(field, value) => {
                setForm((prev) => ({ ...prev, [field]: value }));
                if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
              }}
              onSubmit={handleSubmit}
              submitLabel="Create Account"
              loadingLabel="Creating Account..."
              showPasswordHints
              passwordGridClassName={isAdmin ? "md:grid-cols-2" : "grid-cols-1"}
              submitButtonClassName="bg-brand hover:bg-brand-hover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
