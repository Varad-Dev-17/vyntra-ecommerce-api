import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { ArrowRight, Loader2, Lock, Eye, EyeOff } from "lucide-react";

const ChangePasswordPage = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { changePassword, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    const result = await changePassword(oldPassword, newPassword);

    if (result.success) {
      setSuccess("Password changed successfully! Redirecting...");
      setOldPassword("");
      setNewPassword("");
      setTimeout(() => {
        navigate(user?.isAdmin ? "/admin/dashboard" : "/home");
      }, 2000);
    } else {
      setError(result.message);
    }

    setIsLoading(false);
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
              <Lock className="w-8 h-8 text-white" />
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
              Change your password securely.
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Old Password */}
            <div className="space-y-2">
              <label
                htmlFor="oldPassword"
                className="block ml-1"
                style={labelStyle}
              >
                Current Password
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
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
                <input
                  id="oldPassword"
                  type={showOldPassword ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  className="w-full h-14 pl-12 pr-12 rounded-xl transition-all duration-300"
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors hover:text-[#4648d4]"
                  style={{ color: "#767586" }}
                >
                  {showOldPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label
                htmlFor="newPassword"
                className="block ml-1"
                style={labelStyle}
              >
                New Password
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
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={6}
                  className="w-full h-14 pl-12 pr-12 rounded-xl transition-all duration-300"
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors hover:text-[#4648d4]"
                  style={{ color: "#767586" }}
                >
                  {showNewPassword ? (
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
                background: "linear-gradient(135deg, #4648d4 0%, #6b38d4 100%)",
                fontFamily: "Manrope, sans-serif",
                fontSize: "16px",
                boxShadow: "0 10px 40px rgba(70, 72, 212, 0.25)",
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <span>Change Password</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <Link
              to={user?.isAdmin ? "/admin/dashboard" : "/home"}
              className="font-bold hover:underline transition-all"
              style={{
                color: "#4648d4",
                fontFamily: "Be Vietnam Pro, sans-serif",
              }}
            >
              ← Back to Home
            </Link>
          </div>
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

export default ChangePasswordPage;
