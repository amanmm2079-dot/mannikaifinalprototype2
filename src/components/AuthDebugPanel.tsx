import React, { useState } from 'react';
import { ShieldCheck, Bug, ChevronDown, ChevronUp, RefreshCw, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { AuthDiagnostic } from '../firebase/authContext';
import { User } from '../types';
import { 
  getDashboardForRole, 
  checkCredentialsForAction, 
  ROLE_DISPLAY_NAMES,
  UserRole
} from '../services/authRoleSystem';

interface AuthDebugPanelProps {
  authDiagnostic: AuthDiagnostic;
  activeView: string;
  activeUser: User;
  isAllowed: boolean;
  onRefreshClaims?: () => void;
}

export const AuthDebugPanel: React.FC<AuthDebugPanelProps> = ({
  authDiagnostic,
  activeView,
  activeUser,
  isAllowed,
  onRefreshClaims,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // In non-dev environments, do not render
  const isDev = process.env.NODE_ENV !== 'production' || true; // Active for testing
  if (!isDev) return null;

  const resolvedDashboard = getDashboardForRole(activeUser.role);
  const credCheck = checkCredentialsForAction(activeUser.role, activeUser.credentials, activeView);

  const handleRefresh = async () => {
    if (onRefreshClaims) {
      setIsRefreshing(true);
      await onRefreshClaims();
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 font-mono text-xs shadow-2xl rounded-2xl border border-stone-800 bg-stone-950/95 text-stone-100 max-w-sm backdrop-blur-md overflow-hidden transition-all">
      {/* Mini Bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-3.5 py-2.5 bg-stone-900 border-b border-stone-800 flex items-center justify-between cursor-pointer hover:bg-stone-850 select-none"
      >
        <div className="flex items-center gap-2">
          <Bug className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-bold tracking-wider text-[11px] text-amber-300 uppercase">
            Auth Diagnostics (Dev)
          </span>
          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
            isAllowed ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
          }`}>
            {isAllowed ? 'ALLOW' : 'DENY (403)'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-stone-400">
          <span className="text-[10px] text-stone-400">
            {activeUser.role}
          </span>
          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-3.5 space-y-2.5 text-[11px] leading-relaxed max-h-96 overflow-y-auto">
          {authDiagnostic.authConfigError && (
            <div className="p-2 bg-rose-950/80 border border-rose-800 rounded-lg text-rose-200 flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
              <span>{authDiagnostic.authConfigError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-stone-300 border-b border-stone-800 pb-2.5">
            <div>
              <span className="text-stone-500 block text-[10px] uppercase">Authenticated:</span>
              <span className={`font-bold ${authDiagnostic.isAuthenticated ? 'text-emerald-400' : 'text-rose-400'}`}>
                {authDiagnostic.isAuthenticated ? 'YES' : 'NO'}
              </span>
            </div>

            <div>
              <span className="text-stone-500 block text-[10px] uppercase">Email Verified:</span>
              <span className={`font-bold ${authDiagnostic.emailVerified ? 'text-emerald-400' : 'text-stone-400'}`}>
                {authDiagnostic.emailVerified ? 'YES' : 'NO'}
              </span>
            </div>

            <div className="col-span-2 truncate">
              <span className="text-stone-500 block text-[10px] uppercase">Firebase UID:</span>
              <span className="text-stone-200 text-[10px] truncate block" title={authDiagnostic.uid}>
                {authDiagnostic.uid}
              </span>
            </div>

            <div className="col-span-2 truncate">
              <span className="text-stone-500 block text-[10px] uppercase">Email:</span>
              <span className="text-teal-300 truncate block">
                {authDiagnostic.email}
              </span>
            </div>

            <div>
              <span className="text-stone-500 block text-[10px] uppercase">Role Claim:</span>
              <span className="text-amber-300 font-semibold">
                {authDiagnostic.roleClaim}
              </span>
            </div>

            <div>
              <span className="text-stone-500 block text-[10px] uppercase">Firestore Role:</span>
              <span className="text-indigo-300 font-semibold">
                {authDiagnostic.firestoreRole}
              </span>
            </div>

            <div>
              <span className="text-stone-500 block text-[10px] uppercase">Active:</span>
              <span className={authDiagnostic.active ? 'text-emerald-400' : 'text-stone-500'}>
                {authDiagnostic.active ? 'YES' : 'NO'}
              </span>
            </div>

            <div>
              <span className="text-stone-500 block text-[10px] uppercase">Current View:</span>
              <span className="text-stone-200 font-semibold">
                {activeView}
              </span>
            </div>
          </div>

          <div className="space-y-1.5 pt-1 text-stone-300">
            <div>
              <span className="text-stone-500 block text-[10px] uppercase">Resolved Dashboard:</span>
              <span className="text-teal-400 font-bold block">
                {resolvedDashboard}
              </span>
            </div>

            <div>
              <span className="text-stone-500 block text-[10px] uppercase">Required Permission:</span>
              <span className="text-stone-300">
                view_{activeView}_dashboard
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-stone-800">
              <span className="text-stone-500 text-[10px] uppercase">Permission Result:</span>
              <span className={`font-bold flex items-center gap-1 ${
                isAllowed ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {isAllowed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {isAllowed ? 'ALLOW' : 'DENY'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-stone-500 text-[10px] uppercase">Credential Check:</span>
              <span className={`font-bold ${
                credCheck.status === 'PASS' 
                  ? 'text-emerald-400' 
                  : credCheck.status === 'NOT_REQUIRED' 
                    ? 'text-sky-300' 
                    : 'text-rose-400'
              }`}>
                {credCheck.status}
              </span>
            </div>
          </div>

          {onRefreshClaims && (
            <div className="pt-2 border-t border-stone-800">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="w-full py-1.5 px-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Force Refresh ID Token (getIdToken(true))</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
