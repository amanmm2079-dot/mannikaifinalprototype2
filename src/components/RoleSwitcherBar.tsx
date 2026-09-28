import React from 'react';
import { 
  RotateCcw, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  MapPin
} from 'lucide-react';
import { AtrocityCase, LanguageCode, User, UserRole } from '../types';
import { AppStore } from '../services/storage';
import { USER_ROLES } from '../services/authRoleSystem';
import { t } from '../i18n';

interface RoleSwitcherBarProps {
  currentUser: User;
  language: LanguageCode;
  onSelectRole: (role: UserRole) => void;
  onSelectCase: (caseId: string) => void;
  activeCaseId?: string;
  cases: AtrocityCase[];
}

export const RoleSwitcherBar: React.FC<RoleSwitcherBarProps> = ({
  currentUser,
  language,
  onSelectRole,
  onSelectCase,
  activeCaseId,
  cases,
}) => {
  const handleReset = () => {
    if (window.confirm('Reset all synthetic demo cases and thresholds to default state?')) {
      AppStore.resetDemoData();
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const roleKey = `roles.${role}`;
    const label = t(language, roleKey);
    switch (role) {
      case USER_ROLES.VICTIM:
        return { label, color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case USER_ROLES.COUNSELLOR:
        return { label, color: 'bg-sky-50 text-sky-800 border-sky-200' };
      case USER_ROLES.DISTRICT_OFFICER:
        return { label, color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case USER_ROLES.STATE_ADMIN:
        return { label, color: 'bg-purple-50 text-purple-800 border-purple-200' };
      case USER_ROLES.NATIONAL_ADMIN:
        return { label, color: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
      case USER_ROLES.AUDITOR:
        return { label, color: 'bg-stone-100 text-stone-800 border-stone-300' };
      default:
        return { label, color: 'bg-stone-100 text-stone-800 border-stone-200' };
    }
  };

  const currentBadge = getRoleBadge(currentUser.role);

  return (
    <aside 
      aria-label="Demo Environment Status and Scenario Controls" 
      className="bg-[#F8FAFC] border-b border-[#E5E7EB] px-4 sm:px-6 lg:px-8 py-2 text-xs text-[#172033]"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        {/* LEFT: Identity, Role & Location */}
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className="font-bold text-[#667085] uppercase tracking-wider text-[10px] bg-stone-200/70 px-2 py-0.5 rounded-md select-none shrink-0">
            {t(language, 'common.demoEnvironment')}
          </span>

          <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${currentBadge.color} shrink-0`}>
            {currentBadge.label}
          </span>

          <span className="font-semibold text-[#172033] text-xs truncate">
            {currentUser.name}
          </span>

          {currentUser.district && (
            <span className="text-[#667085] text-[11px] flex items-center gap-1 shrink-0">
              <MapPin className="w-3 h-3 text-[#667085]" />
              <span>({currentUser.district}, {currentUser.state})</span>
            </span>
          )}
        </div>

        {/* RIGHT: Scenario Preset Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[#667085] text-[11px] font-medium mr-1 hidden sm:inline select-none">
            {t(language, 'common.loadScenario')}
          </span>

          {/* Scenario 1: Acute Crisis */}
          <button
            onClick={() => onSelectCase('CASE-MH-2026-109')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5 border shadow-2xs select-none ${
              activeCaseId === 'CASE-MH-2026-109'
                ? 'bg-rose-50 text-rose-800 border-rose-300 font-semibold ring-1 ring-rose-300'
                : 'bg-white text-[#172033] border-[#E5E7EB] hover:bg-stone-50 hover:border-stone-300'
            }`}
            title="Load Acute Escalation Spike (Sunita D., 9.1/10)"
          >
            <ShieldAlert className="w-3 h-3 text-rose-600" />
            <span>{t(language, 'common.acuteCrisis')}</span>
          </button>

          {/* Scenario 2: Gradual Rise */}
          <button
            onClick={() => onSelectCase('CASE-MH-2026-042')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5 border shadow-2xs select-none ${
              activeCaseId === 'CASE-MH-2026-042'
                ? 'bg-amber-50 text-amber-800 border-amber-300 font-semibold ring-1 ring-amber-300'
                : 'bg-white text-[#172033] border-[#E5E7EB] hover:bg-stone-50 hover:border-stone-300'
            }`}
            title="Load Gradual Distress Escalation (Ramesh K., 6.8/10)"
          >
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>{t(language, 'common.gradualRise')}</span>
          </button>

          {/* Scenario 3: Stable Low */}
          <button
            onClick={() => onSelectCase('CASE-MH-2026-001')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5 border shadow-2xs select-none ${
              activeCaseId === 'CASE-MH-2026-001'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold ring-1 ring-emerald-300'
                : 'bg-white text-[#172033] border-[#E5E7EB] hover:bg-stone-50 hover:border-stone-300'
            }`}
            title="Load Stable Case (Pooja R., 2.2/10)"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>{t(language, 'common.stableLow')}</span>
          </button>

          {/* Scenario 4: Missed Check-ins */}
          <button
            onClick={() => onSelectCase('CASE-RJ-2026-088')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5 border shadow-2xs select-none ${
              activeCaseId === 'CASE-RJ-2026-088'
                ? 'bg-orange-50 text-orange-800 border-orange-300 font-semibold ring-1 ring-orange-300'
                : 'bg-white text-[#172033] border-[#E5E7EB] hover:bg-stone-50 hover:border-stone-300'
            }`}
            title="Load 3 Missed Check-ins Case (Vikram S.)"
          >
            <Clock className="w-3 h-3 text-orange-600" />
            <span>{t(language, 'common.missedCheckins')}</span>
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={handleReset}
            className="p-1.5 text-[#667085] hover:text-[#172033] hover:bg-white rounded-lg transition-colors border border-transparent hover:border-[#E5E7EB] cursor-pointer ml-0.5"
            title="Reset synthetic demo data to default initial state"
            aria-label="Reset synthetic demo data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
