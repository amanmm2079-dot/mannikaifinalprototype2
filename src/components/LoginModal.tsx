import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Key, 
  ShieldCheck, 
  UserCheck, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Mail,
  Heart
} from 'lucide-react';
import { User, UserProfile } from '../types';
import { useAuth } from '../firebase/authContext';
import { DEMO_ACCOUNTS, DemoAccount } from '../firebase/seedService';
import { ROLE_DISPLAY_NAMES } from '../services/authRoleSystem';
import { LoginCareIllustration } from './illustrations/CareIllustrations';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (user: UserProfile) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const { login, resetPassword, quickDemoLogin, userProfile } = useAuth();
  const [email, setEmail] = useState('ananya.counsellor@mannik.ai');
  const [password, setPassword] = useState('Password@123');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (isResetMode) {
        await resetPassword(email);
        setSuccessMessage('Password reset link sent to your registered email.');
      } else {
        const authedUser = await login(email, password);
        if (onLoginSuccess && authedUser) {
          onLoginSuccess(authedUser);
        }
        onClose();
      }
    } catch (err: any) {
      console.error('Firebase Auth error:', err);
      let msg = 'Authentication failed. Please check your credentials.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        msg = 'Invalid email or password. Use demo preset buttons below for instant 1-click access.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Access temporarily restricted due to multiple failed attempts. Try again later or use demo accounts.';
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSelect = async (acc: DemoAccount) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const authedUser = await quickDemoLogin(acc);
      if (onLoginSuccess && authedUser) {
        onLoginSuccess(authedUser);
      }
      onClose();
    } catch (err) {
      setErrorMessage('Could not sign into demo account. Please verify network connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col md:flex-row max-h-[94vh]">
        {/* Close Button Mobile/Desktop */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT COLUMN: Modern Branding & Care Illustration */}
        <div className="w-full md:w-5/12 bg-gradient-to-br from-teal-50/70 via-slate-50 to-blue-50/60 p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200/80">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-display font-bold text-lg shadow-sm">
                M
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-bold text-base text-slate-900 tracking-tight">Mannik AI</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-teal-800 bg-teal-100/60 px-1.5 py-0.5 rounded border border-teal-200">
                    Care Core
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Dynamic Distress & Human Intervention
                </p>
              </div>
            </div>

            <div className="pt-2">
              <h2 className="font-display font-bold text-xl text-slate-900 leading-snug">
                "Human care, supported by intelligent technology."
              </h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Authorized access for atrocity survivors, lead clinicians, district welfare officers, and oversight administrators.
              </p>
            </div>
          </div>

          {/* Central Editorial Illustration */}
          <div className="py-6 flex items-center justify-center">
            <LoginCareIllustration className="w-56 h-56 drop-shadow-xs" />
          </div>

          {/* Compliance & Security Footnote */}
          <div className="space-y-1 text-[11px] text-slate-500 border-t border-slate-200/60 pt-4">
            <div className="flex items-center gap-1.5 text-teal-700 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>DPDP Act 2023 & Atrocities Act Compliant</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Role permissions strictly verified against Cloud Firestore security rules.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Modern Clean Login Form & 1-Click Role Accounts */}
        <div className="w-full md:w-7/12 p-8 overflow-y-auto flex flex-col justify-between space-y-6 bg-white">
          <div>
            <div className="mb-6">
              <h3 className="font-display font-bold text-xl text-slate-900">
                {isResetMode ? 'Reset Forgotten Password' : 'Sign in to your account'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter your credentials or select a verified role account below
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 mb-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Official Email or Case Identifier
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.gov.in"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white transition-all"
                  required
                />
              </div>

              {!isResetMode && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">
                      Confidential Password / Passcode
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsResetMode(true)}
                      className="text-[11px] text-teal-600 hover:text-teal-800 font-medium cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white transition-all"
                    required
                  />
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Authenticating with Firebase...</span>
                  ) : isResetMode ? (
                    <>
                      <Mail className="w-4 h-4 text-teal-400" />
                      <span>Send Reset Link</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4 text-teal-400" />
                      <span>Sign In with Verified Role</span>
                    </>
                  )}
                </button>

                {isResetMode && (
                  <button
                    type="button"
                    onClick={() => setIsResetMode(false)}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Back to Login
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Quick 1-Click Verified Role Accounts */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                1-Click Verified Role Login
              </span>
              <span className="text-[10px] text-teal-700 font-medium bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                Pre-configured credentials
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleDemoSelect(acc)}
                  disabled={isLoading}
                  className="p-3 rounded-xl border border-slate-200/90 hover:border-teal-300 bg-slate-50/60 hover:bg-teal-50/40 text-left transition-all cursor-pointer flex flex-col justify-between group disabled:opacity-50 shadow-2xs"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold text-slate-900 group-hover:text-teal-900 truncate">
                      {acc.name.split(' ')[0]}
                    </span>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                      {ROLE_DISPLAY_NAMES[acc.role] || acc.role}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono mt-1 truncate">
                    {acc.email}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
