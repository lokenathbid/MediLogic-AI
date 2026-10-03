import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  KeyRound,
  Eye,
  EyeOff,
  RotateCcw,
  Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { insforge } from '../lib/insforge';

export default function AuthPage({ setActivePage }) {
  const { signIn, signUp, authError, setAuthError, setUser, refreshProfile } = useAuth();
  
  // Modes: 'signin' | 'signup' | 'verify' | 'forgot'
  const [mode, setMode] = useState('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Check URL params for email verification callback (in case link method was triggered)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('insforge_status');
    const type = params.get('insforge_type');
    const errorMsg = params.get('insforge_error');

    if (type === 'verify_email') {
      if (status === 'success') {
        setFeedbackMessage('Email verified successfully! Please sign in with your password.');
        setMode('signin');
      } else if (status === 'error') {
        setAuthError(errorMsg || 'Email verification link expired or invalid.');
      }
    }
  }, []);

  // Cooldown countdown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedbackMessage(null);
    setAuthError(null);

    try {
      if (mode === 'signin') {
        const res = await signIn(email, password);
        if (res.success) {
          if (res.role === 'admin') {
            setActivePage('admin');
          } else {
            setActivePage('dashboard');
          }
        }
      } else if (mode === 'signup') {
        if (!name.trim()) {
          setAuthError('Please enter your full name');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setAuthError('Password must be at least 6 characters long');
          setLoading(false);
          return;
        }
        
        const res = await signUp(email, password, name);
        if (res.success) {
          if (res.requireVerification) {
            setMode('verify');
            setFeedbackMessage(`A 6-digit verification code has been sent to ${email}. Please check your inbox.`);
          } else {
            setActivePage('dashboard');
          }
        }
      } else if (mode === 'verify') {
        if (!otpCode || otpCode.trim().length < 4) {
          setAuthError('Please enter the verification code sent to your email.');
          setLoading(false);
          return;
        }

        const { data, error } = await insforge.auth.verifyEmail({
          email: email.trim(),
          otp: otpCode.trim()
        });

        if (error) {
          setAuthError(error.message || 'Invalid or expired verification code. Please check or request a new code.');
        } else {
          setFeedbackMessage('Email successfully verified! Welcome to MediLogic AI.');
          if (data?.user) {
            setUser(data.user);
            await refreshProfile();
            setActivePage('dashboard');
          } else {
            setMode('signin');
          }
        }
      } else if (mode === 'forgot') {
        const { data, error } = await insforge.auth.sendResetPasswordEmail({
          email: email.trim(),
          redirectTo: window.location.origin
        });
        if (error) {
          setAuthError(error.message || 'Failed to send reset email');
        } else {
          setFeedbackMessage('If an account exists with this email, password reset instructions have been sent.');
        }
      }
    } catch (err) {
      setAuthError(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || !email) return;
    setResending(true);
    setAuthError(null);
    try {
      const { data, error } = await insforge.auth.resendVerificationEmail({
        email: email.trim(),
        redirectTo: window.location.origin
      });
      if (error) {
        setAuthError(error.message || 'Failed to resend verification email.');
      } else {
        setFeedbackMessage('New verification code sent! Please check your inbox and spam folder.');
        setResendCooldown(45);
      }
    } catch (err) {
      setAuthError(err.message || 'Error requesting verification code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-600/20 border border-teal-500/40 text-teal-400 mb-2">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            {mode === 'signin' && 'Sign in to MediLogic'}
            {mode === 'signup' && 'Create your Medical Account'}
            {mode === 'verify' && 'Verify your Email Address'}
            {mode === 'forgot' && 'Reset your Password'}
          </h2>
          <p className="text-xs text-slate-400">
            {mode === 'signin' && 'Access your persistent patient history and diagnostic records.'}
            {mode === 'signup' && 'Store your health assessments and customized clinical profiles.'}
            {mode === 'verify' && `We sent an email verification code to ${email || 'your email'}.`}
            {mode === 'forgot' && 'Enter your email to receive recovery instructions.'}
          </p>
        </div>

        {/* Card Container */}
        <div className="glass-panel rounded-2xl p-8 border border-slate-800 shadow-2xl space-y-6">
          {/* Mode Switch Tabs (Only when not verifying or forgot) */}
          {(mode === 'signin' || mode === 'signup') && (
            <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setMode('signin'); setAuthError(null); setFeedbackMessage(null); }}
                className={`py-2 rounded-lg transition-all ${
                  mode === 'signin'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setAuthError(null); setFeedbackMessage(null); }}
                className={`py-2 rounded-lg transition-all ${
                  mode === 'signup'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Register
              </button>
            </div>
          )}

          {/* Error Alert */}
          {authError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* Success / Feedback Alert */}
          {feedbackMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{feedbackMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mode: Verify Email Code */}
            {mode === 'verify' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 text-xs text-teal-200 space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-teal-300">
                    <Mail className="w-4 h-4 text-teal-400" />
                    <span>Check your Inbox</span>
                  </div>
                  <p className="text-slate-300">
                    InsForge has dispatched a verification code to <strong className="text-white">{email}</strong>.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">6-Digit Verification Code</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <KeyRound className="w-4 h-4 text-teal-400" />
                    </div>
                    <input
                      type="text"
                      required
                      autoFocus
                      maxLength={8}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.trim())}
                      placeholder="123456"
                      className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 text-center font-mono tracking-widest text-lg font-bold focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resending || resendCooldown > 0}
                    className="text-teal-400 hover:text-teal-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend verification email'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('signin'); setAuthError(null); setFeedbackMessage(null); }}
                    className="text-slate-400 hover:text-white"
                  >
                    Back to Sign In
                  </button>
                </div>
              </div>
            )}

            {/* Name input (SignUp only) */}
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dr. Alex Morgan"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email input (for signin, signup, forgot) */}
            {mode !== 'verify' && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="patient@example.com"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Password input */}
            {(mode === 'signin' || mode === 'signup') && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300">Password</label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setAuthError(null); setFeedbackMessage(null); }}
                      className="text-[11px] text-teal-400 hover:text-teal-300 font-medium"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-semibold text-sm shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'signin' && 'Sign In to Dashboard'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'verify' && 'Verify & Activate Account'}
                  {mode === 'forgot' && 'Send Reset Code'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Bottom helper links */}
          {mode === 'forgot' && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setMode('signin'); setAuthError(null); setFeedbackMessage(null); }}
                className="text-xs text-teal-400 hover:text-teal-300 font-medium"
              >
                Back to Sign In
              </button>
            </div>
          )}

          {/* InsForge badge */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>Secured via InsForge Authentication & JWT</span>
          </div>
        </div>
      </div>
    </div>
  );
}
