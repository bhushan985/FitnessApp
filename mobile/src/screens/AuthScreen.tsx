import React, { useState, useEffect, useRef } from 'react';
import { Apple, Mail, Phone, Lock, User, ArrowRight, AlertCircle, CheckCircle2, RefreshCw, ShieldCheck, KeyRound } from 'lucide-react';
import { authApi } from '../services/api';
import { User as UserType } from '../types';

interface Props {
  onAuthSuccess: (user: UserType) => void;
  onSkipDemo: () => void;
}

export const AuthScreen: React.FC<Props> = ({ onAuthSuccess, onSkipDemo }) => {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  const [step, setStep] = useState<'input' | 'otp' | 'password_fallback'>('input');

  // Input states
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  
  // OTP 6-Digit input boxes state
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer & UI states
  const [cooldown, setCooldown] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // 30-second Countdown Timer Effect
  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const targetIdentifier = authMethod === 'email' ? email.trim() : phone.trim();

  // Send OTP handler
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setInfoMessage(null);

    if (mode === 'register' && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (authMethod === 'email' && (!email || !email.includes('@'))) {
      setError('Please enter a valid email address.');
      return;
    }

    if (authMethod === 'phone' && (phone.length < 10)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    try {
      setLoading(true);
      const formattedTarget = authMethod === 'phone' && !phone.startsWith('+91') ? `+91${phone.replace(/\D/g, '')}` : targetIdentifier;
      const res = await authApi.sendOtp(formattedTarget, authMethod, mode);

      if (res.success) {
        setStep('otp');
        setCooldown(res.cooldownSeconds || 30);
        setInfoMessage(`OTP sent to ${authMethod === 'email' ? email : formattedTarget}`);
      } else {
        setError(res.message || 'Failed to send OTP.');
      }
    } catch (err: any) {
      console.error('Send OTP Error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP handler
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length < 6) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const formattedTarget = authMethod === 'phone' && !phone.startsWith('+91') ? `+91${phone.replace(/\D/g, '')}` : targetIdentifier;
      const res = await authApi.verifyOtp(formattedTarget, authMethod, fullOtp, name);

      if (res.success && res.data?.user) {
        onAuthSuccess(res.data.user);
      } else {
        setError(res.message || 'Invalid OTP code.');
      }
    } catch (err: any) {
      console.error('Verify OTP Error:', err);
      setError(err.response?.data?.message || err.message || 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Password Login fallback handler
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await authApi.login(email, password);
      if (res.success && res.data?.user) {
        onAuthSuccess(res.data.user);
      } else {
        setError(res.message || 'Invalid credentials.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  // OTP Box Digit Change Handler
  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const updated = [...otpDigits];
    updated[index] = value;
    setOtpDigits(updated);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-12 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="pt-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Apple className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white leading-none">NutriRegion</h1>
            <p className="text-xs text-emerald-400 font-medium mt-0.5">Dual OTP AI Fitness Platform</p>
          </div>
        </div>
        <button
          onClick={onSkipDemo}
          className="text-xs text-slate-400 hover:text-white bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-xl font-semibold transition-all"
        >
          Demo Mode
        </button>
      </div>

      {/* Auth Card Container */}
      <div className="my-auto py-4 z-10 w-full max-w-sm mx-auto space-y-5">
        
        {/* Registration / Login Mode Switcher */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {mode === 'register' ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-slate-400">
            {mode === 'register'
              ? 'Choose verification method to build your unified account'
              : 'Sign in using Mobile OTP or Email OTP'}
          </p>
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div className="bg-slate-800/90 border border-slate-700/80 p-1 rounded-2xl grid grid-cols-2 gap-1">
          <button
            onClick={() => {
              setMode('register');
              setStep('input');
              setError(null);
              setInfoMessage(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'register' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
          <button
            onClick={() => {
              setMode('login');
              setStep('input');
              setError(null);
              setInfoMessage(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'login' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Verification Method Switcher (Mobile OTP vs Email OTP) */}
        {step !== 'password_fallback' && (
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block text-center">
              Choose Verification Method
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('phone');
                  setStep('input');
                  setError(null);
                }}
                className={`py-2.5 px-3 border rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                  authMethod === 'phone'
                    ? 'bg-slate-800 border-emerald-500 text-emerald-400 shadow-md'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Phone className="w-4 h-4" />
                <span>📱 Mobile OTP</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('email');
                  setStep('input');
                  setError(null);
                }}
                className={`py-2.5 px-3 border rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                  authMethod === 'email'
                    ? 'bg-slate-800 border-emerald-500 text-emerald-400 shadow-md'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>✉️ Email OTP</span>
              </button>
            </div>
          </div>
        )}

        {/* Alerts & Error Banner */}
        {error && (
          <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {infoMessage && (
          <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 p-3 rounded-xl text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* STEP 1: TARGET INPUT FORM */}
        {step === 'input' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium block">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            {authMethod === 'phone' ? (
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium block">Mobile Number</label>
                <div className="flex items-center space-x-2">
                  <div className="bg-slate-800 border border-slate-700 px-3 py-3 rounded-xl text-xs font-bold text-slate-300 shrink-0">
                    🇮🇳 +91
                  </div>
                  <div className="relative flex-1">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      placeholder="98765 43210"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono tracking-wider"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium block">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sending OTP...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Send OTP Code</span>
                </>
              )}
            </button>

            {/* Toggle to Password Fallback */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setStep('password_fallback')}
                className="text-[11px] text-slate-400 hover:text-emerald-400 underline font-medium"
              >
                Or sign in with Password instead
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: 6-DIGIT OTP VERIFICATION FORM */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="text-center space-y-1">
              <span className="text-xs font-bold text-slate-300">
                Enter OTP sent to {authMethod === 'email' ? email : `+91 ${phone}`}
              </span>
              <p className="text-[11px] text-slate-400">Check server console or email inbox for 6-digit code</p>
            </div>

            {/* 6 Digit Input Boxes */}
            <div className="flex items-center justify-center space-x-2">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (otpInputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                  className="w-11 h-12 bg-slate-800 border-2 border-slate-700 focus:border-emerald-500 rounded-xl text-center text-lg font-extrabold text-emerald-400 focus:outline-none transition-all shadow-inner"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || otpDigits.join('').length < 6}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying OTP...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify OTP & Continue</span>
                </>
              )}
            </button>

            {/* Resend OTP & Back Action */}
            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setStep('input')}
                className="text-slate-400 hover:text-white"
              >
                ← Edit {authMethod}
              </button>

              <button
                type="button"
                disabled={cooldown > 0 || loading}
                onClick={() => handleSendOtp()}
                className="text-emerald-400 hover:text-emerald-300 font-bold disabled:opacity-50"
              >
                {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP Now'}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: PASSWORD FALLBACK FORM */}
        {step === 'password_fallback' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium block">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium block">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In with Password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setStep('input')}
                className="text-[11px] text-emerald-400 hover:underline font-bold"
              >
                ← Back to Mobile / Email OTP Sign In
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Footer Info */}
      <div className="pb-2 z-10 text-center text-slate-500 text-[11px] flex items-center justify-center space-x-1.5">
        <KeyRound className="w-3.5 h-3.5 text-emerald-500" />
        <span>Unified Account Security • Dual OTP & SHA-256 Hashed Tokens</span>
      </div>
    </div>
  );
};
