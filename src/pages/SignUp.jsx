import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Eye,
  EyeOff,
  Diamond,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Mail,
  User,
  Lock,
  ShieldCheck,
} from "lucide-react";

const api = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
});

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState("form");
  const [verificationCode, setVerificationCode] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.post("/auth/signup", formData);

      if (response.data.success) {
        setStep("verify");
      } else {
        setError(response.data.message || "Sign up failed");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.patch("/auth/verify-verification-code", {
        email: formData.email,
        codeProvided: verificationCode,
      });

      if (response.data.success) {
        setStep("success");
        setTimeout(() => {
          navigate("/signin");
        }, 2000);
      } else {
        setError(response.data.message || "Verification failed");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid code. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    fontFamily: "Be Vietnam Pro, sans-serif",
    fontSize: "16px",
    color: "#1b1b23",
    background: "rgba(255, 255, 255, 0.6)",
    border: "1px solid rgba(30, 41, 59, 0.1)",
  };

  const labelStyle = {
    fontFamily: "Geist, sans-serif",
    fontSize: "12px",
    lineHeight: 1,
    letterSpacing: "0.1em",
    fontWeight: 600,
    textTransform: "uppercase",
    color: "#464554",
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = "#4648d4";
    e.target.style.background = "rgba(255, 255, 255, 0.9)";
    e.target.style.boxShadow = "0 0 0 4px rgba(70, 72, 212, 0.1)";
    e.target.style.outline = "none";
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = "rgba(30, 41, 59, 0.1)";
    e.target.style.background = "rgba(255, 255, 255, 0.6)";
    e.target.style.boxShadow = "none";
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
        <div
          className="absolute w-150 h-150 rounded-full opacity-10 blur-[80px]"
          style={{
            background: "rgba(107, 56, 212, 0.1)",
            bottom: "-200px",
            right: "-100px",
            animation: "move 20s infinite alternate-reverse",
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
              <Diamond className="w-8 h-8 text-white" fill="white" />
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
              {step === "form" && "Begin your premium journey"}
              {step === "verify" && "Verify your email"}
              {step === "success" && "Welcome aboard!"}
            </p>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
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
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {/* FORM */}
            {step === "form" && (
              <motion.form
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSignUp}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <label
                    htmlFor="username"
                    className="block ml-1"
                    style={labelStyle}
                  >
                    Username
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                      style={{ color: "#767586" }}
                    />
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="johndoe"
                      required
                      className="w-full h-14 pl-12 pr-4 rounded-xl transition-all duration-300"
                      style={inputStyle}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block ml-1"
                    style={labelStyle}
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                      style={{ color: "#767586" }}
                    />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="hello@vyntra.com"
                      required
                      className="w-full h-14 pl-12 pr-4 rounded-xl transition-all duration-300"
                      style={inputStyle}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block ml-1"
                    style={labelStyle}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                      style={{ color: "#767586" }}
                    />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      className="w-full h-14 pl-12 pr-12 rounded-xl transition-all duration-300"
                      style={inputStyle}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
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
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </motion.form>
            )}

            {/* VERIFY */}
            {step === "verify" && (
              <motion.form
                key="verify"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleVerify}
                className="space-y-5"
              >
                <div className="text-center mb-6">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: "#e1e0ff" }}
                  >
                    <Mail className="w-7 h-7" style={{ color: "#4648d4" }} />
                  </div>
                  <p
                    style={{
                      fontFamily: "Be Vietnam Pro, sans-serif",
                      fontSize: "14px",
                      color: "#464554",
                      lineHeight: 1.5,
                    }}
                  >
                    We sent a 6-digit code to{" "}
                    <span
                      className="font-semibold"
                      style={{ color: "#1b1b23" }}
                    >
                      {formData.email}
                    </span>
                  </p>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="code"
                    className="block ml-1"
                    style={labelStyle}
                  >
                    Verification Code
                  </label>
                  <input
                    id="code"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    required
                    className="w-full h-14 px-4 rounded-xl transition-all duration-300 text-center tracking-[0.5em] text-lg font-bold"
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
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
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify Email</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>

                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="w-full text-center py-2 transition-colors hover:text-[#4648d4]"
                  style={{
                    fontFamily: "Be Vietnam Pro, sans-serif",
                    fontSize: "14px",
                    color: "#767586",
                  }}
                >
                  Back to sign up
                </button>
              </motion.form>
            )}

            {/* SUCCESS */}
            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, type: "spring" }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ background: "#e1e0ff" }}
                >
                  <CheckCircle2
                    className="w-10 h-10"
                    style={{ color: "#4648d4" }}
                  />
                </motion.div>
                <h2
                  className="text-2xl font-bold mb-3"
                  style={{
                    fontFamily: "Manrope, sans-serif",
                    color: "#1b1b23",
                  }}
                >
                  Email Verified!
                </h2>
                <p
                  style={{
                    fontFamily: "Be Vietnam Pro, sans-serif",
                    fontSize: "16px",
                    color: "#464554",
                    lineHeight: 1.5,
                  }}
                >
                  Your account is ready. Redirecting to sign in...
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sign In Link */}
          {step === "form" && (
            <div className="mt-8 text-center">
              <p
                style={{
                  fontFamily: "Be Vietnam Pro, sans-serif",
                  fontSize: "16px",
                  lineHeight: 1.5,
                  color: "#464554",
                }}
              >
                Already have an account?{" "}
                <Link
                  to="/signin"
                  className="font-bold hover:underline transition-all"
                  style={{ color: "#4648d4" }}
                >
                  Sign In
                </Link>
              </p>
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

export default SignUp;
