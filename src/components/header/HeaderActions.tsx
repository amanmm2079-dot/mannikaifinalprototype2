import React from 'react';
import { 
  HeartHandshake, 
  Globe, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X,
  WifiOff 
} from 'lucide-react';
import { LanguageCode, User, UserRole } from '../../types';
import { LANGUAGES } from '../../services/i18n';
import { USER_ROLES } from '../../services/authRoleSystem';
import { t } from '../../i18n';

interface HeaderActionsProps {
  currentUser: User;
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onOpenGrounding?: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  isOffline?: boolean;
  offlineQueueCount?: number;
  onSyncOffline?: () => void;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const HeaderActions: React.FC<HeaderActionsProps> = ({
  currentUser,
  currentLanguage,
  onLanguageChange,
  onOpenGrounding,
  onOpenLogin,
  onLogout,
  isOffline,
  offlineQueueCount = 0,
  onSyncOffline,
  mobileMenuOpen,
  onToggleMobileMenu,
}) => {
  // Format short display role badge
  const getShortRoleBadge = (role: UserRole) => {
    const roleKey = `roles.${role}`;
    const label = t(currentLanguage, roleKey);
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
        return { label, color: 'bg-stone-100 text-stone-700 border-stone-200' };
    }
  };

  const shortRole = getShortRoleBadge(currentUser.role);
  const firstName = currentUser.name.split(' ')[0] || 'User';

  return (
    <div className="flex items-center gap-2 sm:gap-2.5">
      {/* Offline Status Badge if offline */}
      {isOffline && onSyncOffline && (
        <button
          onClick={onSyncOffline}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-300 text-xs font-semibold cursor-pointer animate-pulse"
          title="Click to sync offline entries"
        >
          <WifiOff className="w-3.5 h-3.5" />
          <span>{t(currentLanguage, 'common.offline')} ({offlineQueueCount})</span>
        </button>
      )}

      {/* 1. Shanti Space Button */}
      {onOpenGrounding && (
        <button
          onClick={onOpenGrounding}
          className="px-3 sm:px-3.5 py-2 rounded-xl border border-[#0F9D8A]/35 text-[#0F9D8A] bg-[#E8F8F5]/60 hover:bg-[#E8F8F5] text-xs sm:text-[13px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs whitespace-nowrap active:scale-[0.98]"
          title="Open Shanti Space"
        >
          <HeartHandshake className="w-4 h-4 text-[#0F9D8A]" />
          <span className="hidden sm:inline">{t(currentLanguage, 'navigation.shantiSpace')}</span>
        </button>
      )}

      {/* 2. Language Selector Dropdown */}
      <div className="relative flex items-center">
        <Globe className="w-3.5 h-3.5 text-[#667085] absolute left-2.5 pointer-events-none" />
        <select
          value={currentLanguage}
          onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
          aria-label={t(currentLanguage, 'navigation.selectLanguage')}
          className="pl-7 pr-3 py-2 bg-white border border-[#E5E7EB] hover:border-stone-300 rounded-xl text-xs sm:text-[13px] font-medium text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#0F9D8A] cursor-pointer shadow-2xs transition-colors appearance-none"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.nativeName} ({lang.name})
            </option>
          ))}
        </select>
      </div>

      {/* 3. Current User / Role Button */}
      <button
        onClick={onOpenLogin}
        className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white border border-[#E5E7EB] hover:border-stone-300 hover:bg-stone-50 text-[#172033] flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
        title="Account: Click to switch user or sign in"
      >
        <div className="w-6 h-6 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-[#172033] font-bold text-xs">
          {firstName.charAt(0)}
        </div>
        <div className="flex flex-col text-left leading-tight">
          <span className="text-xs font-bold text-[#172033] leading-none truncate max-w-[100px] sm:max-w-[120px]">
            {firstName}
          </span>
          <span className={`text-[8.5px] uppercase font-bold tracking-wider px-1 py-0.2 rounded border mt-0.5 whitespace-nowrap leading-none ${shortRole.color}`}>
            {shortRole.label}
          </span>
        </div>
      </button>

      {/* 4. Logout Button */}
      <button
        onClick={onLogout}
        className="p-2 rounded-xl text-[#667085] hover:text-[#172033] hover:bg-stone-100 transition-colors cursor-pointer"
        title={t(currentLanguage, 'navigation.logout')}
        aria-label={t(currentLanguage, 'navigation.logout')}
      >
        <LogOut className="w-4 h-4" />
      </button>

      {/* Mobile Drawer Hamburger Button */}
      <button
        onClick={onToggleMobileMenu}
        className="lg:hidden p-2 text-[#172033] hover:bg-stone-100 rounded-xl cursor-pointer"
        aria-label={t(currentLanguage, 'navigation.menu')}
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>
    </div>
  );
};
