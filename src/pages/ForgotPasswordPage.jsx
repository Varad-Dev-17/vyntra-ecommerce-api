import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { ArrowRight, Loader2, Mail, KeyRound, Eye, EyeOff } from "lucide-react";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [providedCode, setProvidedCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState("email"); // "email" | "code" | "success"
  const [isLoading, setIsLoading] = useState(false);

  const { sendForgotPasswordCode, verifyForgotPasswordCode } = useAuth();
  const navigate = useNavigate();

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    const result = await sendForgotPasswordCode(email);

    if (result.success) {
      setSuccess("Verification code sent to your email!");
      setStep("code");
    } else {
      setError(result.message);
    }

    setIsLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    const result = await verifyForgotPasswordCode(
      email,
      providedCode,
      newPassword
    );

    if (result.success) {
      setSuccess("Password reset successfully! Redirecting to sign in...");
      setStep("success");
      setTimeout(() => navigate("/signin"), 2000);
    } else {
      setError(result.message);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-[#fcf8ff]">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className="absolute w-150 h-150 rounded-full opacity-15 blur-[80px]"
          style={{
            background: "rgba(96, 99, 238, 0.15)",
            top: "-100px",
            left: "-100px",
            animation: "move 20s infinite alternate",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-120"
      >
        <div
          className="rounded-4xl p-8 md:p-12 shadow-sm"
          style={{
            background: "rgba(255, 255, 255, 0.4)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.4)",
          }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
              style={{
                background: "linear-gradient(135deg, #4648d4 0%, #6b38d4 100%)",
                boxShadow: "0 10px 40px rgba(70, 72, 212, 0.2)",
              }}
            >
              {step === "success" ? (
                <Mail className="w-8 h-8 text-white" />
              ) : (
                <KeyRound className="w-8 h-8 text-white" />
              )}
            </div>
            <h1
              className="text-[32px] font-bold tracking-tight"
              style={{
                fontFamily: "Manrope, sans-serif",
                color: "#4648d4",
                lineHeight: 1.2,
                letterSpacing: "-0.01em",
              }}
            >
              Vyntra
            </h1>
            <p
              className="mt-2 text-center"
              style={{
                fontFamily: "Be Vietnam Pro, sans-serif",
                fontSize: "16px",
                lineHeight: 1.5,
                color: "#464554",
              }}
            >
              {step === "email"
                ? "Forgot your password? We'll send you a reset code."
                : step === "code"
                ? "Enter the verification code and your new password."
                : "Password reset successfully!"}
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl text-center"
              style={{
                background: "#ffdad6",
                color: "#93000a",
                fontFamily: "Be Vietnam Pro, sans-serif",
                fontSize: "14px",
              }}
            >
              {error}
            </motion.div>
          )}

          {/* Success */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl text-center"
              style={{
                background: "#d4edda",
                color: "#155724",
                fontFamily: "Be Vietnam Pro, sans-serif",
                fontSize: "14px",
              }}
            >
              {success}
            </motion.div>
          )}

          {/* Step 1: Email + Send Code */}
          {step === "email" && (
            <form onSubmit={handleSendCode} className="space-y-5">
              <div className="space-y-2">
                <label
                  className="block ml-1"
                  style={{
                    fontFamily: "Geist, sans-serif",
                    fontSize: "12px",
                    lineHeight: 1,
                    letterSpacing: "0.1em",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    color: "#464554",
                  }}
                >
                  Email Address
                </label>
                <div className="relative">
                  <svg
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                    style={{ color: "#767586" }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hello@vyntra.com"
                    required
                    className="w-full h-14 pl-12 pr-4 rounded-xl transition-all duration-300"
                    style={{
                      fontFamily: "Be Vietnam Pro, sans-serif",
                      fontSize: "16px",
                      color: "#1b1b23",
                      background: "rgba(255, 255, 255, 0.6)",
                      border: "1px solid rgba(30, 41, 59, 0.1)",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#4648d4";
                      e.target.style.background = "rgba(255, 255, 255, 0.9)";
                      e.target.style.boxShadow =
                        "0 0 0 4px rgba(70, 72, 212, 0.1)";
                      e.target.style.outline = "none";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(30, 41, 59, 0.1)";
                      e.target.style.background = "rgba(255, 255, 255, 0.6)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full h-14 rounded-xl text-white font-semibold shadow-lg flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-70"
                style={{
                  background:
                    "linear-gradient(135deg, #4648d4 0%, #6b38d4 100%)",
                  fontFamily: "Manrope, sans-serif",
                  fontSize: "16px",
                  boxShadow: "0 10px 40px rgba(70, 72, 212, 0.25)",
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Code</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>
          )}

          {/* Step 2: Code + New Password */}
          {step === "code" && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              {/* Email (read-only, auto-filled) */}
              <div className="space-y-2">
                <label
                  className="block ml-1"
                  style={{
                    fontFamily: "Geist, sans-serif",
                    fontSize: "12px",
                    lineHeight: 1,
                    letterSpacing: "0.1em",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    color: "#464554",
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full h-14 px-4 rounded-xl transition-all duration-300 bg-gray-100 cursor-not-allowed"
                  style={{
                    fontFamily: "Be Vietnam Pro, sans-serif",
                    fontSize: "16px",
                    color: "#767586",
                    border: "1px solid rgba(30, 41, 59, 0.1)",
                  }}
                />
              </div>

              {/* Verification Code */}
              <div className="space-y-2">
                <label
                  className="block ml-1"
                  style={{
                    fontFamily: "Geist, sans-serif",
                    fontSize: "12px",
                    lineHeight: 1,
                    letterSpacing: "0.1em",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    color: "#464554",
                  }}
                >
                  Verification Code
                </label>
                <input
                  type="text"
                  value={providedCode}
                  onChange={(e) => setProvidedCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  required
                  maxLength={6}
                  className="w-full h-14 px-4 rounded-xl transition-all duration-300 text-center tracking-widest"
                  style={{
                    fontFamily: "Be Vietnam Pro, sans-serif",
                    fontSize: "20px",
                    color: "#1b1b23",
                    background: "rgba(255, 255, 255, 0.6)",
                    border: "1px solid rgba(30, 41, 59, 0.1)",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#4648d4";
                    e.target.style.background = "rgba(255, 255, 255, 0.9)";
                    e.target.style.boxShadow =
                      "0 0 0 4px rgba(70, 72, 212, 0.1)";
                    e.target.style.outline = "none";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(30, 41, 59, 0.1)";
                    e.target.style.background = "rgba(255, 255, 255, 0.6)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label
                  className="block ml-1"
                  style={{
                    fontFamily: "Geist, sans-serif",
                    fontSize: "12px",
                    lineHeight: 1,
                    letterSpacing: "0.1em",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    color: "#464554",
                  }}
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    minLength={6}
                    className="w-full h-14 pl-4 pr-12 rounded-xl transition-all duration-300"
                    style={{
                      fontFamily: "Be Vietnam Pro, sans-serif",
                      fontSize: "16px",
                      color: "#1b1b23",
                      background: "rgba(255, 255, 255, 0.6)",
                      border: "1px solid rgba(30, 41, 59, 0.1)",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#4648d4";
                      e.target.style.background = "rgba(255, 255, 255, 0.9)";
                      e.target.style.boxShadow =
                        "0 0 0 4px rgba(70, 72, 212, 0.1)";
                      e.target.style.outline = "none";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(30, 41, 59, 0.1)";
                      e.target.style.background = "rgba(255, 255, 255, 0.6)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors hover:text-[#4648d4]"
                    style={{ color: "#767586" }}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full h-14 rounded-xl text-white font-semibold shadow-lg flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-70"
                style={{
                  background:
                    "linear-gradient(135deg, #4648d4 0%, #6b38d4 100%)",
                  fontFamily: "Manrope, sans-serif",
                  fontSize: "16px",
                  boxShadow: "0 10px 40px rgba(70, 72, 212, 0.25)",
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Resetting...</span>
                  </>
                ) : (
                  <>
                    <span>Reset Password</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>
          )}

          {/* Step 3: Success - Auto redirect */}
          {step === "success" && (
            <div className="text-center py-8">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ background: "#d4edda" }}
              >
                <svg
                  className="w-8 h-8"
                  style={{ color: "#155724" }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p
                className="text-lg font-semibold mb-2"
                style={{
                  fontFamily: "Manrope, sans-serif",
                  color: "#155724",
                }}
              >
                Password Reset Successful!
              </p>
              <p
                style={{
                  fontFamily: "Be Vietnam Pro, sans-serif",
                  color: "#464554",
                }}
              >
                Redirecting to sign in page...
              </p>
            </div>
          )}

          {/* Back to Sign In */}
          {step !== "success" && (
            <div className="mt-8 text-center">
              <Link
                to="/signin"
                className="font-bold hover:underline transition-all"
                style={{
                  color: "#4648d4",
                  fontFamily: "Be Vietnam Pro, sans-serif",
                }}
              >
                ← Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </motion.div>

      <style>{`
        @keyframes move {
          from { transform: translate(-10%, -10%); }
          to { transform: translate(20%, 20%); }
        }
      `}</style>
    </div>
  );
};

export default ForgotPasswordPage;
