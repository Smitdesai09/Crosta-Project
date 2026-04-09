import { useState } from "react";
import { Link } from "react-router-dom";
import authService from "../services/authService";
import brandLogo from "../assets/logo.png";
import {
  IconArrowLeft,
  IconEnvelope,
  IconKey,
} from "../components/icons/AuthIcons";
import { useToast } from "../context/ToastContext";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  // REMOVED: const [error, setError] = useState(""); 
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
      // REMOVED: setError(validationError);
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
      // REMOVED: setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-gray flex items-center justify-center px-4">
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
          {!isSent ? (
            <>
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-brand-pale flex items-center justify-center">
                  <span className="text-brand">
                    <IconKey className="w-7 h-7" />
                  </span>
                </div>
              </div>

              {/* Header */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-text-primary">
                  Forgot Password?
                </h1>
                <p className="text-sm text-text-secondary mt-1.5">
                  Enter your email and we&apos;ll send you a reset link
                </p>
              </div>

              {/* REMOVED: The Error Block (Red Box) is now gone */}

              {/* Form */}
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
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        // REMOVED: if (error) setError("");
                      }}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-surface-gray border border-border-main rounded-lg text-sm text-text-primary placeholder:text-text-placeholder focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-brand hover:bg-brand-hover text-surface-white text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            </>
          ) : (
            /* Success State */
            <>
              <div className="flex flex-col items-center py-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                  <span className="text-emerald-500">
                    <IconEnvelope className="w-7 h-7" />
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-text-primary mb-2">
                  Check Your Email
                </h1>
                <p className="text-sm text-text-secondary text-center leading-relaxed">
                  We&apos;ve sent a password reset link to
                  <br />
                  <span className="font-semibold text-text-primary">
                    {email}
                  </span>
                </p>
                <p className="text-xs text-text-secondary text-center mt-3">
                  The link will expire in 15 minutes.
                </p>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={() => {
                    setIsSent(false);
                    setEmail("");
                  }}
                  className="w-full py-2.5 bg-surface-white border border-border-main text-text-primary text-sm font-medium rounded-lg hover:bg-surface-gray transition-colors"
                >
                  Try a Different Email
                </button>
              </div>
            </>
          )}

          {/* Back to Login */}
          <div className="mt-6 pt-4 border-t border-border-light">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
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

// import { useState } from "react";
// import { Link } from "react-router-dom";
// import authService from "../services/authService";
// import brandLogo from "../assets/logo.png";
// import {
//   IconArrowLeft,
//   IconEnvelope,
//   IconKey,
// } from "../components/icons/AuthIcons";
// import { useToast } from "../context/ToastContext"; // <-- 1. ADD THIS IMPORT

// export default function ForgotPassword() {
//   const [email, setEmail] = useState("");
//   const [error, setError] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [isSent, setIsSent] = useState(false);

//   const { showToast } = useToast(); // <-- 2. INITIALIZE THE HOOK

//   const validate = () => {
//     if (!email.trim()) return "Email is required";
//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
//       return "Invalid email format";
//     return "";
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     const validationError = validate();
    
//     // 3. TOAST ON VALIDATION ERROR (Empty email)
//     if (validationError) {
//       setError(validationError);
//       showToast(validationError, "error"); 
//       return;
//     }

//     setIsLoading(true);

//     try {
//       await authService.forgotPassword({ email: email.trim() });
      
//       // 4. TOAST ON SUCCESS
//       showToast("Reset link sent successfully!", "success");
      
//       setIsSent(true);
//     } catch (err) {
//       const msg =
//         err.response?.data?.message || "Something went wrong. Try again.";
      
//       // 5. TOAST ON API ERROR
//       showToast(msg, "error");
      
//       setError(msg);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-surface-gray flex items-center justify-center px-4">
//       <div className="w-full max-w-md">
//         {/* Logo */}
//         <div className="flex justify-center mb-8">
//           <img
//             src={brandLogo}
//             alt="Crosta POS"
//             className="object-contain w-36 h-12"
//           />
//         </div>

//         {/* Card */}
//         <div className="bg-surface-white border border-border-main rounded-xl shadow-sm p-6">
//           {!isSent ? (
//             <>
//               {/* Icon */}
//               <div className="flex justify-center mb-4">
//                 <div className="w-14 h-14 rounded-full bg-brand-pale flex items-center justify-center">
//                   <span className="text-brand">
//                     <IconKey className="w-7 h-7" />
//                   </span>
//                 </div>
//               </div>

//               {/* Header */}
//               <div className="text-center mb-6">
//                 <h1 className="text-2xl font-bold text-text-primary">
//                   Forgot Password?
//                 </h1>
//                 <p className="text-sm text-text-secondary mt-1.5">
//                   Enter your email and we&apos;ll send you a reset link
//                 </p>
//               </div>

//               {/* Error Block (Kept for UI consistency, but Toast will also appear) */}
//               {error && (
//                 <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
//                   {error}
//                 </div>
//               )}

//               {/* Form */}
//               <form onSubmit={handleSubmit} className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-text-primary mb-1.5">
//                     Email Address
//                   </label>
//                   <div className="relative">
//                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-placeholder">
//                       <IconEnvelope />
//                     </span>
//                     <input
//                       type="email"
//                       value={email}
//                       onChange={(e) => {
//                         setEmail(e.target.value);
//                         if (error) setError("");
//                       }}
//                       placeholder="you@example.com"
//                       className="w-full pl-10 pr-4 py-2.5 bg-surface-gray border border-border-main rounded-lg text-sm text-text-primary placeholder:text-text-placeholder focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition-colors"
//                     />
//                   </div>
//                 </div>

//                 <button
//                   type="submit"
//                   disabled={isLoading}
//                   className="w-full py-2.5 bg-brand hover:bg-brand-hover text-surface-white text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
//                 >
//                   {isLoading ? "Sending..." : "Send Reset Link"}
//                 </button>
//               </form>
//             </>
//           ) : (
//             /* Success State */
//             <>
//               <div className="flex flex-col items-center py-4">
//                 <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
//                   <span className="text-emerald-500">
//                     <IconEnvelope className="w-7 h-7" />
//                   </span>
//                 </div>
//                 <h1 className="text-2xl font-bold text-text-primary mb-2">
//                   Check Your Email
//                 </h1>
//                 <p className="text-sm text-text-secondary text-center leading-relaxed">
//                   We&apos;ve sent a password reset link to
//                   <br />
//                   <span className="font-semibold text-text-primary">
//                     {email}
//                   </span>
//                 </p>
//                 <p className="text-xs text-text-secondary text-center mt-3">
//                   The link will expire in 15 minutes.
//                 </p>
//               </div>

//               <div className="mt-6 space-y-3">
//                 <button
//                   onClick={() => {
//                     setIsSent(false);
//                     setEmail("");
//                   }}
//                   className="w-full py-2.5 bg-surface-white border border-border-main text-text-primary text-sm font-medium rounded-lg hover:bg-surface-gray transition-colors"
//                 >
//                   Try a Different Email
//                 </button>
//               </div>
//             </>
//           )}

//           {/* Back to Login */}
//           <div className="mt-6 pt-4 border-t border-border-light">
//             <Link
//               to="/login"
//               className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
//             >
//               <IconArrowLeft className="w-4 h-4" />
//               Back to Sign In
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
