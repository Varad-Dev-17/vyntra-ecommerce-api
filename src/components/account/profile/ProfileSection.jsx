import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Pencil, Trash2, Loader2, X, Check, User, Mail, Phone, Calendar, UserCheck, ShieldCheck, Lock, MapPin, UploadCloud } from 'lucide-react';

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
    <div className="w-full">
      {/* Page Title */}
      <div className="mb-2">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-700 tracking-tight">Your Profile</h2>
      </div>
      
      {/* Slightly Left-Aligned Content Container */}
      <div className="w-full max-w-[1200px] mr-auto">
        {/* Profile Photo & Identity */}
        <div className="mb-6 flex flex-col items-center justify-center text-center">
        {/* Profile Image Circle */}
        <div 
          className="relative w-32 h-32 rounded-full bg-[#EEF2FF] border-[3px] border-[#4F46E5] shrink-0 overflow-hidden flex items-center justify-center font-bold text-[#4F46E5] text-4xl mb-4 cursor-pointer group shadow-md"
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          {isUploading ? (
            <Loader2 className="w-8 h-8 animate-spin text-[#4F46E5]" />
          ) : user?.profileImage?.url ? (
            <>
              <img src={user.profileImage.url} alt="Profile" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Pencil size={24} className="text-white" />
              </div>
            </>
          ) : (
            <>
              {user?.username?.charAt(0).toUpperCase() || 'U'}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Pencil size={24} className="text-white" />
              </div>
            </>
          )}
        </div>

        {/* Guidance Text */}
        <div className="mb-3.5 space-y-1">
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-700 tracking-tight">Your Photo</h3>
          <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto font-medium">
            Recommended: Square PNG or JPG image under 5MB.
          </p>
        </div>

        {/* Action Buttons (Upload & Remove Side by Side) */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button 
            onClick={() => !isUploading && fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-7 py-2.5 bg-[#4F46E5] text-white hover:bg-[#4338ca] text-[13px] font-bold uppercase tracking-wider transition-colors disabled:opacity-70 cursor-pointer shadow-2xs flex items-center gap-2"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Photo</span>
          </button>
          <button 
            onClick={handleRemovePhoto}
            disabled={isUploading || !user?.profileImage?.url}
            className="px-7 py-2.5 bg-white border border-gray-300 text-gray-700 hover:text-red-600 text-[13px] font-bold uppercase tracking-wider transition-colors disabled:opacity-40 cursor-pointer shadow-2xs flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
            <span>Remove</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/jpeg, image/png, image/webp, image/jpg" 
            className="hidden" 
          />
        </div>
      </div>

      {/* 3. Top Summary Stat Tiles (Moved below avatar as requested) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 p-4 sm:p-5 text-center transition-all hover:border-gray-300 shadow-2xs">
          <div className="flex justify-center mb-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-base sm:text-lg font-bold text-slate-700 mb-0.5">Verified</p>
          <p className="text-[11px] sm:text-[12px] text-gray-500 font-medium">Account Status</p>
        </div>
        <div className="bg-white border border-gray-200 p-4 sm:p-5 text-center transition-all hover:border-gray-300 shadow-2xs">
          <div className="flex justify-center mb-2">
            <Lock className="w-5 h-5 text-[#4F46E5]" />
          </div>
          <p className="text-base sm:text-lg font-bold text-slate-700 mb-0.5">Protected</p>
          <p className="text-[11px] sm:text-[12px] text-gray-500 font-medium">Security Level</p>
        </div>
        <div className="bg-white border border-gray-200 p-4 sm:p-5 text-center transition-all hover:border-gray-300 shadow-2xs">
          <div className="flex justify-center mb-2">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-base sm:text-lg font-bold text-slate-700 mb-0.5">Active</p>
          <p className="text-[11px] sm:text-[12px] text-gray-500 font-medium">Saved Addresses</p>
        </div>
        <div className="bg-white border border-gray-200 p-4 sm:p-5 text-center transition-all hover:border-gray-300 shadow-2xs">
          <div className="flex justify-center mb-2">
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-base sm:text-lg font-bold text-slate-700 mb-0.5">2026</p>
          <p className="text-[11px] sm:text-[12px] text-gray-500 font-medium">Member Since</p>
        </div>
      </div>

      {/* 4. Structured Column Grid Layout for Personal Info */}
      <div>
        <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
          <h3 className="text-base sm:text-lg font-bold text-slate-700 tracking-tight">Personal Information</h3>
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-2xs"
            >
              <span>Edit Details</span>
              <Pencil size={13} className="text-gray-500" />
            </button>
          ) : (
            <div className="flex items-center gap-3">
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
                className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 text-xs font-bold transition-colors uppercase tracking-wider cursor-pointer"
              >
                <span>Cancel</span>
                <X size={13} />
              </button>
              <button 
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-5 py-2 bg-[#4F46E5] text-white hover:bg-[#4338ca] text-xs font-bold transition-colors disabled:opacity-70 uppercase tracking-wider cursor-pointer shadow-2xs"
              >
                {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                <span>Save Changes</span>
              </button>
            </div>
          )}
        </div>
        
        <div className="border border-gray-200 bg-white p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8">
            {/* Username Column */}
            <div className="flex flex-col space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-[#4F46E5]" />
                Username
              </span>
              {isEditing ? (
                <input 
                  type="text" 
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full border border-gray-300 px-3 py-2 text-sm text-slate-700 font-bold focus:outline-none focus:border-[#4F46E5]"
                />
              ) : (
                <span className="text-[15px] sm:text-[16px] font-bold text-slate-700">{user?.username || '-'}</span>
              )}
            </div>

            {/* Email Address Column */}
            <div className="flex flex-col space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#4F46E5]" />
                Email Address
              </span>
              {isEditing ? (
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full border border-gray-300 px-3 py-2 text-sm text-slate-700 font-bold focus:outline-none focus:border-[#4F46E5]"
                />
              ) : (
                <div className="flex items-center flex-wrap gap-2">
                  <span className="text-[15px] sm:text-[16px] font-bold text-slate-700">{user?.email || '-'}</span>
                  {user?.verified !== false ? (
                    <span className="inline-flex items-center px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold uppercase tracking-wider">
                      Verified
                    </span>
                  ) : (
                    <span 
                      className="text-red-600 text-[11px] font-bold cursor-pointer hover:underline uppercase tracking-wider px-1.5 py-0.5 bg-red-50 border border-red-200" 
                      onClick={() => {
                        setFormData({...formData, email: user?.email});
                        setShowVerification(true);
                      }}
                    >
                      Verify
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Number Column */}
            <div className="flex flex-col space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#4F46E5]" />
                Mobile Number
              </span>
              {isEditing ? (
                <input 
                  type="tel" 
                  value={formData.mobileNo}
                  onChange={(e) => setFormData({...formData, mobileNo: e.target.value})}
                  className="w-full border border-gray-300 px-3 py-2 text-sm text-slate-700 font-bold focus:outline-none focus:border-[#4F46E5]"
                  placeholder="e.g. +91 9922055257"
                />
              ) : (
                <span className="text-[15px] sm:text-[16px] font-bold text-slate-700">{user?.mobileNo || '-'}</span>
              )}
            </div>

            {/* Date of Birth Column */}
            <div className="flex flex-col space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#4F46E5]" />
                Date of Birth
              </span>
              {isEditing ? (
                <input 
                  type="date" 
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                  className="w-full border border-gray-300 px-3 py-2 text-sm text-slate-700 font-bold focus:outline-none focus:border-[#4F46E5]"
                />
              ) : (
                <span className="text-[15px] sm:text-[16px] font-bold text-slate-700">
                  {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                </span>
              )}
            </div>

            {/* Gender Column */}
            <div className="flex flex-col space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <UserCheck className="w-3.5 h-3.5 text-[#4F46E5]" />
                Gender
              </span>
              {isEditing ? (
                <select 
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="w-full border border-gray-300 px-3 py-2 text-sm text-slate-700 font-bold focus:outline-none focus:border-[#4F46E5]"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <span className="text-[15px] sm:text-[16px] font-bold text-slate-700">{user?.gender || '-'}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    
      {/* Email Verification Modal */}
      {showVerification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white p-8 w-full max-w-md shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-extrabold text-slate-700 mb-2">Verify New Email</h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              We sent a 6-digit verification code to <strong className="text-slate-700">{formData.email || user?.email}</strong>.
            </p>
            <div className="space-y-5">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Verification Code</label>
                <input 
                  type="text" 
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code" 
                  maxLength={6}
                  className="w-full border border-gray-300 px-4 py-3 text-lg font-bold tracking-widest text-center uppercase focus:outline-none focus:border-[#4F46E5]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  onClick={() => setShowVerification(false)}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 font-bold text-xs uppercase tracking-wider hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleVerifyEmail}
                  disabled={isVerifying || !verificationCode}
                  className="px-6 py-2.5 bg-[#4F46E5] hover:bg-[#4338ca] text-white font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>Verify Email</span>
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
