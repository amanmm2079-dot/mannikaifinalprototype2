import React from 'react';
import { ShieldAlert, Lock, ArrowLeft, LayoutDashboard, UserCheck, KeyRound } from 'lucide-react';
import { User } from '../types';
import { 
  ROLE_DISPLAY_NAMES, 
  ROLE_DASHBOARDS, 
  checkCredentialsForAction, 
  UserRole 
} from '../services/authRoleSystem';

interface AccessDeniedCardProps {
  currentUser: User;
  requestedView: string;
  onOpenLogin: () => void;
  onGoToAuthorizedDashboard: () => void;
  onGoHome: () => void;
}

export const AccessDeniedCard: React.FC<AccessDeniedCardProps> = ({
  currentUser,
  requestedView,
  onOpenLogin,
  onGoToAuthorizedDashboard,
  onGoHome,
}) => {
  const roleDisplayName = ROLE_DISPLAY_NAMES[currentUser.role as UserRole] || currentUser.role;
  const userAuthorizedDashboard = ROLE_DASHBOARDS[currentUser.role as UserRole];

  // Map requested view to human-friendly title
  const getResourceTitle = (view: string) => {
    switch (view) {
      case 'victim': return 'Victim Check-In Hub';
      case 'counsellor': return 'Lead Counsellor Clinical Queue';
      case 'district': return 'District Welfare Dashboard';
      case 'state': return 'State Administrator Dashboard';
      case 'national': return 'National Administrator Dashboard';
      case 'auditor': return 'System Auditor Dashboard';
      case 'admin': return 'System Administration & Calibration Panel';
      default: return 'Restricted Administrative Area';
    }
  };

  const requestedResourceTitle = getResourceTitle(requestedView);

  // Check if this is a genuine clinical credential issue (counsellor with unverified credential)
  const credCheck = checkCredentialsForAction(currentUser.role, currentUser.credentials, requestedView);
  const isClinicalCredentialIssue = currentUser.role === 'counsellor' && credCheck.status === 'FAIL';

  return (
    <div className="max-w-xl mx-auto my-12 p-8 rounded-3xl bg-white border border-stone-200 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-200">
      {/* Icon */}
      <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center ${
        isClinicalCredentialIssue ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
      }`}>
        <ShieldAlert className={`w-8 h-8 ${isClinicalCredentialIssue ? 'text-amber-700' : 'text-rose-700'}`} />
      </div>

      {/* Header and Details */}
      <div className="space-y-2">
        <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
          isClinicalCredentialIssue 
            ? 'text-amber-800 bg-amber-50 border-amber-200' 
            : 'text-rose-800 bg-rose-50 border-rose-200'
        }`}>
          {isClinicalCredentialIssue ? 'Credential Verification Required' : 'Access Denied · 403 Forbidden'}
        </span>

        <h2 className="font-display font-bold text-2xl text-stone-900">
          {isClinicalCredentialIssue ? 'Clinical Credential Required' : 'Access Denied'}
        </h2>

        {isClinicalCredentialIssue ? (
          <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
            You are signed in as <strong>{currentUser.name}</strong> ({roleDisplayName}).
            This clinical action requires verified <strong>Lead Clinical Counsellor licensing credentials</strong>.
          </p>
        ) : (
          <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
            You are authenticated as <strong>{currentUser.name}</strong> with role{' '}
            <span className="font-semibold text-stone-900 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
              {roleDisplayName}
            </span>.
            <br />
            You do not have authorization to access the <strong>{requestedResourceTitle}</strong>.
          </p>
        )}
      </div>

      {/* Explanation Box */}
      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 text-left text-xs text-stone-600 space-y-1.5">
        <div className="flex items-center gap-2 font-semibold text-stone-900">
          <Lock className="w-3.5 h-3.5 text-stone-700" />
          <span>Strict Role-Based Access Control (RBAC)</span>
        </div>
        <p className="text-[11px] text-stone-500 leading-relaxed">
          Mannik AI enforces strict statutory separation of duties under the DPDP Act 2023. Government administration, clinical trauma counselling, and case auditing operate in separate permission domains.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        {/* Direct Access to Authorized Dashboard */}
        <button
          onClick={onGoToAuthorizedDashboard}
          className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <LayoutDashboard className="w-3.5 h-3.5 text-teal-200" />
          <span>Open {roleDisplayName} Dashboard</span>
        </button>

        {/* Switch Account */}
        <button
          onClick={onOpenLogin}
          className="px-5 py-2.5 rounded-xl bg-stone-900 text-white font-semibold text-xs hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <KeyRound className="w-3.5 h-3.5 text-teal-400" />
          <span>Switch Account</span>
        </button>

        {/* Return Home */}
        <button
          onClick={onGoHome}
          className="px-4 py-2.5 rounded-xl bg-stone-100 text-stone-800 font-semibold text-xs hover:bg-stone-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Hub</span>
        </button>
      </div>
    </div>
  );
};
