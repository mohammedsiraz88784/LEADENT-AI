import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  Mail,
  Lock,
  User as UserIcon,
  Building,
  GraduationCap,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  UserPlus,
  LogIn,
  X,
  RefreshCw,
  KeyRound,
  ArrowLeft,
  Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose?: () => void;
}

type AuthTab = 'login' | 'register' | 'otp-login';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, initialMode, onClose }) => {
  const {
    loginWithCredentials,
    register,
    loginDemo,
    authModalInitialMode,
    setUser
  } = useAuth();

  // Tab & Step state
  const [tab, setTab] = useState<AuthTab>('login');
  const [inOtpVerification, setInOtpVerification] = useState(false);
  const [otpPurpose, setOtpPurpose] = useState<'registration' | 'login' | 'verification'>('registration');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [semester, setSemester] = useState('Semester 4 (CS)');
  const [college, setCollege] = useState('Department of Computer Science & Engineering');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP Verification state
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [expiresRemaining, setExpiresRemaining] = useState(300);
  const [emailDeliveryConfigured, setEmailDeliveryConfigured] = useState<boolean | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Sync mode whenever opened or when initial mode changes
  useEffect(() => {
    if (isOpen) {
      const mode = initialMode || authModalInitialMode || 'login';
      setTab(mode === 'register' ? 'register' : 'login');
      setInOtpVerification(false);
      setError(null);
      setSuccessNotice(null);
      setOtpDigits(['', '', '', '', '', '']);
    }
  }, [isOpen, initialMode, authModalInitialMode]);

  // Timers for cooldown & expiration
  useEffect(() => {
    if (!inOtpVerification) return;

    const timer = setInterval(() => {
      setCooldownRemaining(prev => Math.max(0, prev - 1));
      setExpiresRemaining(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [inOtpVerification]);

  if (!isOpen) return null;

  const validateEmail = (emailStr: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr.trim());
  };

  const handleQuickDemo = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginDemo();
      if (onClose) onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to initialize demo session.');
    } finally {
      setLoading(false);
    }
  };

  // Submit password login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!validateEmail(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your LEADENT AI password.');
      return;
    }

    setLoading(true);
    try {
      await loginWithCredentials(cleanEmail, password);
      if (onClose) onClose();
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Request OTP for Email-Only Login
  const handleRequestOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !validateEmail(cleanEmail)) {
      setError('Please enter a valid email address (e.g. student@gmail.com or university email).');
      return;
    }

    setLoading(true);
    try {
      const res = await api.auth.sendOtp(cleanEmail, 'login');
      setEmailDeliveryConfigured(res.emailDeliveryConfigured);
      setCooldownRemaining(res.cooldownSeconds || 30);
      setExpiresRemaining(res.expiresInSeconds || 300);
      setOtpPurpose('login');
      setInOtpVerification(true);
      setOtpDigits(['', '', '', '', '', '']);
      setSuccessNotice(
        res.emailDeliveryConfigured
          ? `Verification code dispatched to ${cleanEmail}`
          : 'Dynamic OTP generated server-side. SMTP service pending.'
      );
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setError(err.message || 'Failed to generate verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Begin Registration -> Send OTP to verify email
  const handleStartRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanEmail = email.trim().toLowerCase();

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!cleanEmail || !validateEmail(cleanEmail)) {
      setError('Please enter a valid university or personal email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.auth.sendOtp(cleanEmail, 'registration');
      setEmailDeliveryConfigured(res.emailDeliveryConfigured);
      setCooldownRemaining(res.cooldownSeconds || 30);
      setExpiresRemaining(res.expiresInSeconds || 300);
      setOtpPurpose('registration');
      setInOtpVerification(true);
      setOtpDigits(['', '', '', '', '', '']);
      setSuccessNotice(
        res.emailDeliveryConfigured
          ? `Verification code sent to ${cleanEmail}`
          : 'Dynamic OTP generated server-side. SMTP service pending.'
      );
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (cooldownRemaining > 0 || loading) return;
    setError(null);
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      const res = await api.auth.sendOtp(cleanEmail, otpPurpose);
      setEmailDeliveryConfigured(res.emailDeliveryConfigured);
      setCooldownRemaining(res.cooldownSeconds || 30);
      setExpiresRemaining(res.expiresInSeconds || 300);
      setOtpDigits(['', '', '', '', '', '']);
      setSuccessNotice('A new verification code has been generated.');
      setTimeout(() => otpInputRefs.current[0]?.focus(), 50);
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP digit inputs with auto-advance and backspace
  const handleDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    if (!clean) {
      const copy = [...otpDigits];
      copy[index] = '';
      setOtpDigits(copy);
      return;
    }

    if (clean.length > 1) {
      // Paste handling
      const digits = clean.slice(0, 6).split('');
      const copy = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        copy[i] = digits[i] || '';
      }
      setOtpDigits(copy);
      const nextIndex = Math.min(digits.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    const copy = [...otpDigits];
    copy[index] = clean;
    setOtpDigits(copy);

    if (index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Complete OTP Verification
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const enteredOtp = otpDigits.join('');

    if (enteredOtp.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    setLoading(true);

    try {
      if (otpPurpose === 'registration') {
        // Complete registration atomically with verified OTP
        const newUser = await register({
          name: name.trim(),
          email: cleanEmail,
          password,
          semester: semester.trim() || '4th Semester (Computer Science)',
          college: college.trim() || 'Department of Computer Science & Engineering',
          otp: enteredOtp
        });
        if (onClose) onClose();
      } else {
        // Login / Verification via OTP
        const res = await api.auth.verifyOtp(cleanEmail, enteredOtp, otpPurpose);
        if (res.user) {
          setUser(res.user);
          if (onClose) onClose();
        } else {
          setError('Email verified. Please sign in with your credentials.');
          setInOtpVerification(false);
          setTab('login');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format seconds into MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 pb-3 bg-slate-50 border-b border-slate-100 text-center relative">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="mx-auto w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100 mb-2.5">
            <Compass className="w-6 h-6" />
          </div>

          <h2 className="text-lg font-bold text-slate-900">
            {inOtpVerification
              ? 'Verify Your Email'
              : tab === 'register'
              ? 'New Student Registration'
              : tab === 'otp-login'
              ? 'Sign In with Email OTP'
              : 'Student Sign In'}
          </h2>

          <p className="text-xs text-slate-500 mt-0.5">
            {inOtpVerification
              ? 'Enter the 6-digit code sent to your email to confirm your identity.'
              : tab === 'register'
              ? 'Create your personal LEADENT AI account to track your syllabus mastery.'
              : tab === 'otp-login'
              ? 'Receive a secure 6-digit verification code in your email.'
              : 'Sign in to access your calibrated syllabus mastery & AI tutor.'}
          </p>

          {/* Tab Switcher (hidden when in OTP verification view) */}
          {!inOtpVerification && (
            <div className="mt-4 grid grid-cols-2 p-1 bg-slate-200/70 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setError(null);
                  setSuccessNotice(null);
                }}
                className={`py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  tab === 'login' || tab === 'otp-login'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('register');
                  setError(null);
                  setSuccessNotice(null);
                }}
                className={`py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  tab === 'register'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </button>
            </div>
          )}
        </div>

        <div className="p-6 space-y-4">
          {/* Error Notification */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="flex-1 min-w-0">
                <span className="font-semibold">Notice:</span> {error}
              </div>
            </div>
          )}

          {/* Success / Status Notification */}
          {successNotice && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <div className="flex-1 min-w-0 font-medium">{successNotice}</div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW: OTP Verification Step */}
          {/* ======================================================== */}
          {inOtpVerification ? (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-indigo-700">Recipient Email</div>
                  <div className="text-xs font-bold text-slate-900 truncate">{email}</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setInOtpVerification(false);
                    setError(null);
                    setSuccessNotice(null);
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Change</span>
                </button>
              </div>

              {/* Realistic Email Service Notice */}
              {emailDeliveryConfigured === false ? (
                <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Real Email Delivery Service Pending</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-800/90">
                    SMTP environment variables (<code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-[10px]">SMTP_HOST</code>, <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-[10px]">SMTP_USER</code>, <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-[10px]">SMTP_PASS</code>) are not configured. The secure dynamic 6-digit OTP has been generated server-side and recorded in the server console for testing.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Please check your inbox or spam folder for the 6-digit code.</span>
                </div>
              )}

              {/* 6 Digit Inputs */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2 text-center">
                  Enter 6-Digit Verification Code
                </label>
                <div className="flex items-center justify-center gap-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={el => (otpInputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={e => handleDigitChange(idx, e.target.value)}
                      onKeyDown={e => handleDigitKeyDown(idx, e)}
                      className="w-11 h-12 text-center font-mono text-xl font-bold rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 bg-slate-50/50 shadow-2xs"
                    />
                  ))}
                </div>
              </div>

              {/* Expiration & Resend Controls */}
              <div className="flex items-center justify-between text-xs pt-1">
                <div className="text-slate-500 font-medium">
                  Expires in:{' '}
                  <span className={`font-bold ${expiresRemaining < 60 ? 'text-rose-600' : 'text-slate-700'}`}>
                    {formatTime(expiresRemaining)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={cooldownRemaining > 0 || loading}
                  className="font-semibold text-indigo-600 hover:text-indigo-800 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                  <span>
                    {cooldownRemaining > 0 ? `Resend in ${cooldownRemaining}s` : 'Resend Code'}
                  </span>
                </button>
              </div>

              {/* Verify Action Button */}
              <button
                type="submit"
                disabled={loading || otpDigits.join('').length !== 6}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-3"
              >
                {loading ? (
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>{otpPurpose === 'registration' ? 'Verify & Create Account' : 'Verify & Continue'}</span>
                  </>
                )}
              </button>
            </form>
          ) : tab === 'otp-login' ? (
            /* ======================================================== */
            /* VIEW: Sign In with Email OTP Request                     */
            /* ======================================================== */
            <form onSubmit={handleRequestOtpLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registered Student Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="student@university.edu"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  We will send a 6-digit authentication code to verify your identity.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Verification Code</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setTab('login');
                    setError(null);
                  }}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
                >
                  Return to Email + Password Login
                </button>
              </div>
            </form>
          ) : (
            /* ======================================================== */
            /* VIEW: Standard Login & Registration Form                 */
            /* ======================================================== */
            <>
              {/* Quick Demo Access Button (Prominently featured in Login mode) */}
              {tab === 'login' && (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleQuickDemo}
                    disabled={loading}
                    className="w-full py-2.5 px-3 rounded-xl border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 active:bg-indigo-200/70 text-indigo-900 text-xs font-semibold transition flex items-center justify-between cursor-pointer disabled:opacity-50 group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px] font-bold shrink-0 shadow-xs group-hover:scale-105 transition">
                        AC
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-slate-900 leading-tight">Use Demo Account</div>
                        <div className="text-[10px] text-slate-500">Alex Chen • Computer Science Demo</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-700 bg-white px-2.5 py-1 rounded-md border border-indigo-200 shadow-2xs group-hover:border-indigo-300 transition">
                      Launch Demo
                    </span>
                  </button>

                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      <span className="bg-white px-2">Or Sign In With Student Credentials</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Email / Password Form */}
              <form onSubmit={tab === 'register' ? handleStartRegistration : handlePasswordLogin} className="space-y-3.5">
                {tab === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Maya Lin"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="student@university.edu or student@gmail.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {tab === 'register'
                      ? 'A 6-digit verification code will be sent to this email to verify your account.'
                      : 'Enter your registered email address.'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {tab === 'register' ? 'Create LEADENT AI Password' : 'LEADENT AI Password'} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder={tab === 'register' ? 'At least 6 characters' : 'Enter your password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full pl-9 pr-9 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {tab === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full pl-9 pr-9 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {tab === 'register' && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Semester / Term</label>
                      <div className="relative">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        <input
                          type="text"
                          value={semester}
                          onChange={e => setSemester(e.target.value)}
                          className="w-full pl-8 pr-2 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">College / Dept</label>
                      <div className="relative">
                        <Building className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        <input
                          type="text"
                          value={college}
                          onChange={e => setCollege(e.target.value)}
                          className="w-full pl-8 pr-2 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {loading ? (
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <span>{tab === 'register' ? 'Continue with Email Verification' : 'Sign In'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                {/* Passwordless OTP Sign In option */}
                {tab === 'login' && (
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setTab('otp-login');
                        setError(null);
                      }}
                      className="text-xs font-medium text-slate-600 hover:text-indigo-600 flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Sign in with Email OTP instead</span>
                    </button>
                  </div>
                )}

                {/* In Register mode, also show quick demo access */}
                {tab === 'register' && (
                  <div className="pt-1 text-center">
                    <button
                      type="button"
                      onClick={handleQuickDemo}
                      className="text-[11px] text-slate-500 hover:text-indigo-600 underline font-medium cursor-pointer"
                    >
                      Or explore immediately with Demo Account (Alex Chen)
                    </button>
                  </div>
                )}

                <div className="text-center pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setTab(tab === 'register' ? 'login' : 'register');
                      setError(null);
                      setPassword('');
                      setConfirmPassword('');
                    }}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
                  >
                    {tab === 'register'
                      ? 'Already have an account? Sign in here'
                      : "Don't have an account? Create Account"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
