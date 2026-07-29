import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Pencil, Trash2, Loader2, X, Check } from 'lucide-react';

const ProfileSection = () => {
  const { user, updateProfilePhoto, removeProfilePhoto, updateProfileInfo, verifyEmailChange } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    mobileNo: user?.mobileNo || '',
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
    gender: user?.gender || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        mobileNo: user.mobileNo || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        gender: user.gender || '',
      });
    }
  }, [user]);

  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size before uploading
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    const result = await updateProfilePhoto(file);
    setIsUploading(false);
    
    if (!result.success) {
      alert(result.message || 'Failed to upload photo');
    }
    // clear input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemovePhoto = async () => {
    if (!window.confirm('Are you sure you want to remove your profile photo?')) return;
    
    setIsUploading(true);
    const result = await removeProfilePhoto();
    setIsUploading(false);

    if (!result.success) {
      alert(result.message || 'Failed to remove photo');
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    const result = await updateProfileInfo(formData);
    setIsSaving(false);
    if (result.success) {
      setIsEditing(false);
      if (result.emailChanged) {
        setShowVerification(true);
      }
    } else {
      alert(result.message || 'Failed to update profile');
    }
  };

  const handleVerifyEmail = async () => {
    if (!verificationCode) return;
    setIsVerifying(true);
    const result = await verifyEmailChange(formData.email || user?.email, verificationCode);
    setIsVerifying(false);
    if (result.success) {
      setShowVerification(false);
      setVerificationCode('');
      alert('Email verified successfully!');
    } else {
      alert(result.message || 'Invalid verification code.');
    }
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-xl font-bold text-gray-900 mb-6">My Profile</h2>
      
      <div className="space-y-6">
        {/* Header Card */}
        <div className="border border-gray-200 rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-5">
            <div 
              className="relative w-20 h-20 rounded-full bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center text-gray-400 text-2xl font-bold border-2 border-white shadow-sm group cursor-pointer"
              onClick={() => !isUploading && fileInputRef.current?.click()}
            >
              {isUploading ? (
                <Loader2 className="w-6 h-6 animate-spin text-[#4F46E5]" />
              ) : user?.profileImage?.url ? (
                <>
                  <img src={user.profileImage.url} alt="Profile" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Pencil size={18} className="text-white" />
                  </div>
                </>
              ) : (
                <>
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Pencil size={18} className="text-white" />
                  </div>
                </>
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{user?.username || 'User'}</h3>
              <p className="text-gray-500 text-[15px] mt-0.5">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user?.profileImage?.url && (
              <button 
                onClick={handleRemovePhoto}
                disabled={isUploading}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <span>Remove</span>
                <Trash2 size={14} />
              </button>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/jpeg, image/png, image/webp, image/jpg" 
              className="hidden" 
            />
          </div>
        </div>

        {/* Personal Info Card */}
        <div className="border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <span>Edit</span>
                <Pencil size={14} />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      username: user?.username || '',
                      email: user?.email || '',
                      mobileNo: user?.mobileNo || '',
                      dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
                      gender: user?.gender || '',
                    });
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <span>Cancel</span>
                  <X size={14} />
                </button>
                <button 
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#4F46E5] text-white text-sm font-medium hover:bg-[#4338ca] transition-colors disabled:opacity-70"
                >
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  <span>Save</span>
                </button>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
            <div>
              <p className="text-sm text-gray-500 mb-1">Username</p>
              {isEditing ? (
                <input 
                  type="text" 
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-[#4F46E5]"
                />
              ) : (
                <p className="font-medium text-gray-900">{user?.username || '-'}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Email address</p>
              {isEditing ? (
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-[#4F46E5]"
                />
              ) : (
                <p className="font-medium text-gray-900">
                  {user?.email || '-'}
                  {user?.verified === false && (
                    <span 
                      className="text-red-500 text-xs ml-2 cursor-pointer hover:underline" 
                      onClick={() => {
                        setFormData({...formData, email: user.email});
                        setShowVerification(true);
                      }}
                    >
                      (Unverified - click to verify)
                    </span>
                  )}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Mobile Number</p>
              {isEditing ? (
                <input 
                  type="tel" 
                  value={formData.mobileNo}
                  onChange={(e) => setFormData({...formData, mobileNo: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-[#4F46E5]"
                  placeholder="e.g. +1234567890"
                />
              ) : (
                <p className="font-medium text-gray-900">{user?.mobileNo || '-'}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Date of Birth</p>
              {isEditing ? (
                <input 
                  type="date" 
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-[#4F46E5]"
                />
              ) : (
                <p className="font-medium text-gray-900">
                  {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : '-'}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Gender</p>
              {isEditing ? (
                <select 
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-[#4F46E5]"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <p className="font-medium text-gray-900">{user?.gender || '-'}</p>
              )}
            </div>
          </div>
        </div>

      </div>
      {/* Email Verification Modal */}
      {showVerification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Verify New Email</h3>
            <p className="text-sm text-gray-500 mb-6">
              We sent a 6-digit verification code to <strong>{formData.email || user?.email}</strong>.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Verification Code</label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-center tracking-[0.5em] text-lg font-bold focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
                />
              </div>
              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={() => setShowVerification(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyEmail}
                  disabled={isVerifying || verificationCode.length !== 6}
                  className="flex-1 py-3 rounded-xl bg-[#4F46E5] text-white font-medium hover:bg-[#4338ca] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isVerifying ? <Loader2 size={18} className="animate-spin" /> : null}
                  Verify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSection;
