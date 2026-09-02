import React, { useState } from 'react';
import { User, MapPin, Edit3, Sliders, Calendar, CheckCircle2, Save, Activity, LogOut, ShieldCheck, Phone, Mail, AlertCircle, X, RefreshCw, Camera, Trash2, Upload } from 'lucide-react';
import { UserProfile, User as UserType, WeeklyDietSchedule } from '../types';
import { profileApi, authApi } from '../services/api';

interface Props {
  user: UserType | null;
  profile: UserProfile | null;
  onEditPreferences: () => void;
  onLogout: () => void;
  onUserUpdate?: (user: UserType) => void;
}

export const ProfileScreen: React.FC<Props> = ({ user: initialUser, profile, onEditPreferences, onLogout, onUserUpdate }) => {
  const [currentUser, setCurrentUser] = useState<UserType | null>(initialUser);

  React.useEffect(() => {
    setCurrentUser(initialUser);
  }, [initialUser]);


  const defaultSchedule: WeeklyDietSchedule = profile?.weeklyDietSchedule || {
    monday: 'veg',
    tuesday: 'non_veg',
    wednesday: 'non_veg',
    thursday: 'veg',
    friday: 'non_veg',
    saturday: 'veg',
    sunday: 'non_veg',
  };

  const [schedule, setSchedule] = useState<WeeklyDietSchedule>(defaultSchedule);
  const [savingSchedule, setSavingSchedule] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Profile Image Upload / Delete State
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  // Account Linking Modal state
  const [linkingModal, setLinkingModal] = useState<{ isOpen: boolean; type: 'email' | 'phone' }>({ isOpen: false, type: 'email' });
  const [linkTarget, setLinkTarget] = useState<string>('');
  const [linkOtp, setLinkOtp] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [linkingLoading, setLinkingLoading] = useState<boolean>(false);
  const [linkingError, setLinkingError] = useState<string | null>(null);
  const [linkingSuccess, setLinkingSuccess] = useState<string | null>(null);

  // BMI Calculation
  const heightM = (profile?.heightCm || 175) / 100;
  const bmiVal = Math.round(((profile?.weightKg || 78) / (heightM * heightM)) * 10) / 10;
  let bmiCategory = profile?.bmiCategory || 'Normal';
  if (bmiVal < 18.5) bmiCategory = 'Underweight';
  else if (bmiVal < 25) bmiCategory = 'Normal';
  else if (bmiVal < 30) bmiCategory = 'Overweight';
  else bmiCategory = 'Obese';

  const days: Array<keyof WeeklyDietSchedule> = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];

  const handleDayDietChange = (day: keyof WeeklyDietSchedule, val: 'veg' | 'non_veg' | 'eggetarian') => {
    setSchedule((prev) => ({
      ...prev,
      [day]: val,
    }));
  };

  const handleSaveSchedule = async () => {
    try {
      setSavingSchedule(true);
      await profileApi.updateDietSchedule(schedule);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed saving diet schedule:', err);
    } finally {
      setSavingSchedule(false);
    }
  };

  // Handle Profile Image Selection & Base64 Upload
  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        setUploadingImage(true);
        const base64Url = reader.result as string;
        const res = await profileApi.updateProfileImage(base64Url);
        if (res.success && res.data) {
          setCurrentUser(res.data);
          if (onUserUpdate) onUserUpdate(res.data);
        }
      } catch (err) {
        console.error('Failed to update profile image:', err);
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Profile Image Removal
  const handleRemoveProfileImage = async () => {
    try {
      setUploadingImage(true);
      const res = await profileApi.removeProfileImage();
      if (res.success && res.data) {
        setCurrentUser(res.data);
        if (onUserUpdate) onUserUpdate(res.data);
      }
    } catch (err) {
      console.error('Failed to remove profile image:', err);
    } finally {
      setUploadingImage(false);
    }
  };


  // Handle Send Link OTP
  const handleSendLinkOtp = async () => {
    if (!linkTarget.trim()) {
      setLinkingError('Please enter a valid target email or mobile number.');
      return;
    }
    try {
      setLinkingLoading(true);
      setLinkingError(null);
      const targetVal = linkingModal.type === 'phone' && !linkTarget.startsWith('+91') ? `+91${linkTarget.replace(/\D/g, '')}` : linkTarget.trim();
      const res = await authApi.sendOtp(targetVal, linkingModal.type, 'link');

      if (res.success) {
        setOtpSent(true);
        setLinkingSuccess(`OTP sent to ${targetVal}. Check server console or inbox.`);
      } else {
        setLinkingError(res.message || 'Failed to send OTP.');
      }
    } catch (err: any) {
      setLinkingError(err.response?.data?.message || err.message || 'Failed to send OTP.');
    } finally {
      setLinkingLoading(false);
    }
  };

  // Handle Verify & Link Account Method
  const handleVerifyLinkOtp = async () => {
    if (linkOtp.length < 6) {
      setLinkingError('Please enter 6-digit OTP code.');
      return;
    }
    try {
      setLinkingLoading(true);
      setLinkingError(null);
      const targetVal = linkingModal.type === 'phone' && !linkTarget.startsWith('+91') ? `+91${linkTarget.replace(/\D/g, '')}` : linkTarget.trim();
      const res = await authApi.linkAuthMethod(targetVal, linkingModal.type, linkOtp);

      if (res.success) {
        setLinkingSuccess(res.message);
        setTimeout(() => {
          setLinkingModal({ isOpen: false, type: 'email' });
          window.location.reload();
        }, 1500);
      } else {
        setLinkingError(res.message || 'Failed to link method.');
      }
    } catch (err: any) {
      setLinkingError(err.response?.data?.message || err.message || 'Account linking failed.');
    } finally {
      setLinkingLoading(false);
    }
  };

  const userObj = currentUser || initialUser;

  return (
    <div className="flex-1 bg-slate-900 text-white overflow-y-auto pb-24 p-5 space-y-5">
      {/* Header Profile Card with Avatar Image Picker & Remover */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-800 to-slate-800 border border-emerald-500/30 p-5 rounded-3xl flex items-center space-x-4 shadow-xl">
        {/* Avatar Image Circle */}
        <div className="relative group">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-slate-950 font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 overflow-hidden border-2 border-emerald-400">
            {userObj?.profileImage ? (
              <img src={userObj.profileImage} alt={userObj.name} className="w-full h-full object-cover" />
            ) : (
              <span>{userObj?.name ? userObj.name.charAt(0).toUpperCase() : 'U'}</span>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            id="profile-image-upload"
            accept="image/*"
            onChange={handleImageFileSelect}
            className="hidden"
          />

          {/* Upload Button overlay */}
          <label
            htmlFor="profile-image-upload"
            className="absolute -bottom-1 -right-1 p-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg cursor-pointer shadow-md transition"
            title="Upload Profile Image"
          >
            {uploadingImage ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
          </label>

          {/* Delete Image button if image exists */}
          {userObj?.profileImage && (
            <button
              onClick={handleRemoveProfileImage}
              className="absolute -top-1 -right-1 p-1 bg-rose-500 hover:bg-rose-400 text-white rounded-lg shadow-md transition"
              title="Remove Profile Image"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-white truncate">{userObj?.name || userObj?.phone || 'Member'}</h2>
          <p className="text-xs text-slate-300 truncate">{userObj?.email || userObj?.phone || userObj?.phoneNumber || ''}</p>
          <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold mt-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{profile?.regionId?.city || 'Pune'}, {profile?.regionId?.state || 'Maharashtra'}</span>
          </div>
        </div>

        <button
          onClick={onEditPreferences}
          className="p-2.5 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-600"
        >
          <Edit3 className="w-4 h-4" />
        </button>
      </div>

      {/* Security & Account Verification Card */}
      <div className="bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Account Verification & Security</span>
          </h3>
          <span className="text-[10px] bg-slate-700 text-slate-300 font-bold px-2 py-0.5 rounded-md">
            Per-User Database Isolation
          </span>
        </div>

        <div className="space-y-2.5 pt-1">
          {/* Mobile Number Item */}
          <div className="bg-slate-900/80 border border-slate-700/70 p-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="truncate">
                <span className="text-xs font-bold text-white block">Mobile Number</span>
                <span className="text-[11px] text-slate-400">
                  {userObj?.phone || userObj?.phoneNumber || 'Not linked'}
                </span>
              </div>
            </div>
            {userObj?.phoneNumberVerified || userObj?.phone ? (
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified</span>
              </span>
            ) : (
              <button
                onClick={() => {
                  setLinkingModal({ isOpen: true, type: 'phone' });
                  setOtpSent(false);
                  setLinkTarget('');
                  setLinkOtp('');
                  setLinkingError(null);
                }}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-lg"
              >
                + Verify Phone
              </button>
            )}
          </div>

          {/* Email Address Item */}
          <div className="bg-slate-900/80 border border-slate-700/70 p-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="truncate">
                <span className="text-xs font-bold text-white block">Email Address</span>
                <span className="text-[11px] text-slate-400">
                  {userObj?.email || 'Not linked'}
                </span>
              </div>
            </div>
            {userObj?.emailVerified || (userObj?.email && userObj.email.includes('@')) ? (
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified</span>
              </span>
            ) : (
              <button
                onClick={() => {
                  setLinkingModal({ isOpen: true, type: 'email' });
                  setOtpSent(false);
                  setLinkTarget('');
                  setLinkOtp('');
                  setLinkingError(null);
                }}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-lg"
              >
                + Verify Email
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Calculated BMI & Body Metrics Card */}
      <div className="bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Body Mass Index (BMI)</span>
          </h3>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-1 rounded-lg uppercase">
            {bmiCategory}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700">
            <span className="text-[9px] text-slate-400 block font-semibold">BMI Score</span>
            <span className="text-base font-extrabold text-emerald-400">{bmiVal}</span>
            <span className="text-[8px] text-slate-500 block">kg/m²</span>
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700">
            <span className="text-[9px] text-slate-400 block font-semibold">Current</span>
            <span className="text-base font-extrabold text-white">{profile?.weightKg || 78}</span>
            <span className="text-[8px] text-slate-500 block">kg</span>
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700">
            <span className="text-[9px] text-slate-400 block font-semibold">Height</span>
            <span className="text-base font-extrabold text-white">{profile?.heightCm || 175}</span>
            <span className="text-[8px] text-slate-500 block">cm</span>
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700">
            <span className="text-[9px] text-slate-400 block font-semibold">Target</span>
            <span className="text-base font-extrabold text-amber-400">{profile?.targetWeightKg || 70}</span>
            <span className="text-[8px] text-slate-500 block">kg</span>
          </div>
        </div>
      </div>

      {/* Target Macros Overview */}
      <div className="bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Target Nutrition Matrix</h3>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-md capitalize">
            {profile?.fitnessGoal ? profile.fitnessGoal.replace('_', ' ') : 'Weight Loss'}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700">
            <span className="text-[9px] text-slate-400 block font-semibold">Calories</span>
            <span className="text-sm font-extrabold text-amber-400">{profile?.dailyCalorieTarget || 2100}</span>
            <span className="text-[8px] text-slate-500 block">kcal/day</span>
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700">
            <span className="text-[9px] text-slate-400 block font-semibold">Protein</span>
            <span className="text-sm font-extrabold text-emerald-400">{profile?.dailyProteinTarget || 130}</span>
            <span className="text-[8px] text-slate-500 block">grams</span>
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700">
            <span className="text-[9px] text-slate-400 block font-semibold">Carbs</span>
            <span className="text-sm font-extrabold text-white">{profile?.dailyCarbsTarget || 220}</span>
            <span className="text-[8px] text-slate-500 block">grams</span>
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700">
            <span className="text-[9px] text-slate-400 block font-semibold">Fat</span>
            <span className="text-sm font-extrabold text-white">{profile?.dailyFatTarget || 60}</span>
            <span className="text-[8px] text-slate-500 block">grams</span>
          </div>
        </div>
      </div>

      {/* Weekly Diet Schedule Manager */}
      <div className="bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Weekly Diet Schedule</span>
          </h3>
          {savedSuccess && (
            <span className="text-[10px] text-emerald-400 font-bold flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Saved!</span>
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-400">Define your recurring diet preference per day (Mon - Sun):</p>

        <div className="space-y-2 pt-1">
          {days.map((day) => {
            const currentDiet = schedule[day] || 'veg';

            return (
              <div key={day} className="flex items-center justify-between py-1.5 border-b border-slate-700/50">
                <span className="text-xs font-bold text-white capitalize">{day}</span>
                <select
                  value={currentDiet}
                  onChange={(e) => handleDayDietChange(day, e.target.value as any)}
                  className="bg-slate-900 text-xs font-bold text-emerald-400 border border-slate-700 rounded-xl px-2.5 py-1 focus:outline-none focus:border-emerald-500"
                >
                  <option value="veg">Vegetarian</option>
                  <option value="non_veg">Non-Veg</option>
                  <option value="eggetarian">Eggetarian</option>
                </select>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleSaveSchedule}
          disabled={savingSchedule}
          className="w-full mt-2 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-500/20 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>{savingSchedule ? 'Saving Schedule...' : 'Save Weekly Schedule'}</span>
        </button>
      </div>

      {/* Actions & Logout */}
      <div className="space-y-2.5 pt-2">
        <button
          onClick={onEditPreferences}
          className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 p-3.5 rounded-2xl flex items-center justify-between text-xs font-bold text-white transition-all"
        >
          <div className="flex items-center space-x-2.5">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>Recalculate Nutrition Goals</span>
          </div>
          <Edit3 className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={onLogout}
          className="w-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 p-3.5 rounded-2xl flex items-center justify-center space-x-2 text-xs font-bold text-rose-400 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout Account</span>
        </button>
      </div>

      {/* Account Linking Modal */}
      {linkingModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white capitalize flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Link & Verify {linkingModal.type}</span>
              </h3>
              <button
                onClick={() => setLinkingModal({ isOpen: false, type: 'email' })}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {linkingError && (
              <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 p-2.5 rounded-xl text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{linkingError}</span>
              </div>
            )}

            {linkingSuccess && (
              <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 p-2.5 rounded-xl text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{linkingSuccess}</span>
              </div>
            )}

            {!otpSent ? (
              <div className="space-y-3">
                <label className="text-xs text-slate-300 font-medium block capitalize">
                  Enter {linkingModal.type === 'phone' ? 'Mobile Number' : 'Email Address'}
                </label>
                <input
                  type={linkingModal.type === 'phone' ? 'tel' : 'email'}
                  placeholder={linkingModal.type === 'phone' ? '9876543210' : 'name@example.com'}
                  value={linkTarget}
                  onChange={(e) => setLinkTarget(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleSendLinkOtp}
                  disabled={linkingLoading}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-500/20"
                >
                  {linkingLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Send Verification OTP</span>}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="text-xs text-slate-300 font-medium block">
                  Enter 6-Digit OTP sent to {linkTarget}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={linkOtp}
                  onChange={(e) => setLinkOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-800 border-2 border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-center text-lg font-mono font-extrabold text-emerald-400 focus:outline-none tracking-widest"
                />
                <button
                  onClick={handleVerifyLinkOtp}
                  disabled={linkingLoading || linkOtp.length < 6}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-500/20"
                >
                  {linkingLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Verify & Link to Account</span>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
