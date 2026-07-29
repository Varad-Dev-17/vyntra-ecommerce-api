import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ChangePasswordSection = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { changePassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    const result = await changePassword(oldPassword, newPassword);

    if (result.success) {
      setSuccess("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
    } else {
      setError(result.message);
    }

    setIsLoading(false);
  };

  return (
    <div className="max-w-3xl">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Change Password</h2>
      
      <div className="border border-gray-200 rounded-2xl p-6 md:p-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 text-sm font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-green-50 text-green-700 text-sm font-medium">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Current Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Enter current password"
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
              minLength={6}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-full bg-[#4F46E5] text-white font-semibold text-sm hover:bg-[#4338ca] transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordSection;
