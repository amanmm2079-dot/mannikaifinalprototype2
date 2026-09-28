import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { User, UserRole } from '../../types';
import { USER_ROLES, canAccessView } from '../../services/authRoleSystem';
import { t } from '../../i18n';

interface NavItem {
  id: string;
  label: string;
  view?: string;
  onClick?: () => void;
  isActive?: boolean;
}

interface MainNavigationProps {
  currentUser: User;
  activeView: string;
  onNavigate: (view: string) => void;
  onOpenExercises?: () => void;
  onOpenRights?: () => void;
  onOpenFinancial?: () => void;
  onOpenNHAA?: () => void;
  onOpenArchitecture?: () => void;
  onOpenOmnichannel?: () => void;
}

export const MainNavigation: React.FC<MainNavigationProps> = ({
  currentUser,
  activeView,
  onNavigate,
  onOpenExercises,
  onOpenRights,
  onOpenFinancial,
  onOpenNHAA,
  onOpenArchitecture,
  onOpenOmnichannel,
}) => {
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const lang = currentUser.language;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMoreDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine authorized items based on user role
  const allNavItems: NavItem[] = [
    {
      id: 'home',
      label: t(lang, 'navigation.home'),
      view: 'home',
      onClick: () => onNavigate('home'),
      isActive: activeView === 'home',
    },
  ];

  // 1. Check-In Hub (Always for victim; or if authorized to preview)
  if (canAccessView(currentUser.role, 'victim')) {
    allNavItems.push({
      id: 'victim',
      label: t(lang, 'navigation.checkInHub'),
      view: 'victim',
      onClick: () => onNavigate('victim'),
      isActive: activeView === 'victim',
    });
  }

  // 2. Counsellor Review (Counsellor or National Admin)
  if (canAccessView(currentUser.role, 'counsellor')) {
    allNavItems.push({
      id: 'counsellor',
      label: t(lang, 'navigation.counsellorReview'),
      view: 'counsellor',
      onClick: () => onNavigate('counsellor'),
      isActive: activeView === 'counsellor',
    });
  }

  // 3. District Welfare (District Officer or Admin)
  if (canAccessView(currentUser.role, 'district')) {
    allNavItems.push({
      id: 'district',
      label: t(lang, 'navigation.districtWelfare'),
      view: 'district',
      onClick: () => onNavigate('district'),
      isActive: activeView === 'district',
    });
  }

  // 4. State Directorate (State Admin)
  if (canAccessView(currentUser.role, 'state') && currentUser.role === USER_ROLES.STATE_ADMIN) {
    allNavItems.push({
      id: 'state',
      label: t(lang, 'navigation.stateDirectorate'),
      view: 'state',
      onClick: () => onNavigate('state'),
      isActive: activeView === 'state',
    });
  }

  // 5. National Analytics (National Admin)
  if (canAccessView(currentUser.role, 'national') && currentUser.role === USER_ROLES.NATIONAL_ADMIN) {
    allNavItems.push({
      id: 'national',
      label: t(lang, 'navigation.nationalAnalytics'),
      view: 'national',
      onClick: () => onNavigate('national'),
      isActive: activeView === 'national',
    });
  }

  // 6. Auditor view
  if (canAccessView(currentUser.role, 'auditor') && currentUser.role === USER_ROLES.AUDITOR) {
    allNavItems.push({
      id: 'auditor',
      label: t(lang, 'navigation.securityAudit'),
      view: 'auditor',
      onClick: () => onNavigate('auditor'),
      isActive: activeView === 'auditor',
    });
  }

  // 7. System Admin (National Admin or Auditor)
  if (canAccessView(currentUser.role, 'admin') && currentUser.role === USER_ROLES.NATIONAL_ADMIN) {
    allNavItems.push({
      id: 'admin',
      label: t(lang, 'navigation.admin'),
      view: 'admin',
      onClick: () => onNavigate('admin'),
      isActive: activeView === 'admin',
    });
  }

  // 8. Relief & Financial Compensation
  if (onOpenFinancial) {
    allNavItems.push({
      id: 'financial',
      label: t(lang, 'navigation.reliefFinance'),
      onClick: onOpenFinancial,
      isActive: activeView === 'financial',
    });
  }

  // 9. NHAA Integration Gateway
  if (onOpenNHAA) {
    allNavItems.push({
      id: 'nhaa',
      label: t(lang, 'navigation.nhaaHub'),
      onClick: onOpenNHAA,
      isActive: activeView === 'nhaa',
    });
  }

  // 10. Multi-Channel Outreach Simulator
  if (onOpenOmnichannel) {
    allNavItems.push({
      id: 'omnichannel',
      label: t(lang, 'navigation.ivrSms'),
      onClick: onOpenOmnichannel,
      isActive: false,
    });
  }

  // 11. Legal Rights (Open to all)
  if (onOpenRights) {
    allNavItems.push({
      id: 'rights',
      label: t(lang, 'navigation.legalRights'),
      onClick: onOpenRights,
      isActive: activeView === 'rights',
    });
  }

  // 12. System Architecture & Workflow Blueprint
  if (onOpenArchitecture) {
    allNavItems.push({
      id: 'architecture',
      label: t(lang, 'navigation.blueprint'),
      onClick: onOpenArchitecture,
      isActive: false,
    });
  }

  // Divide into Primary and Overflow (More) to avoid horizontal crowding on laptops
  const MAX_PRIMARY_VISIBLE = 5;
  const primaryItems = allNavItems.slice(0, MAX_PRIMARY_VISIBLE);
  const overflowItems = allNavItems.slice(MAX_PRIMARY_VISIBLE);
  const isOverflowActive = overflowItems.some((item) => item.isActive);

  return (
    <nav className="hidden lg:flex items-center gap-2">
      {/* Primary Navigation Buttons */}
      {primaryItems.map((item) => {
        const isActive = item.isActive;
        return (
          <button
            key={item.id}
            onClick={item.onClick}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-[13px] font-medium transition-all duration-150 cursor-pointer whitespace-nowrap select-none border ${
              isActive
                ? 'bg-[#E8F8F5] text-[#0F9D8A] font-semibold border-[#0F9D8A]/40 shadow-xs'
                : 'bg-white text-[#172033] border-[#E5E7EB] hover:bg-stone-50 hover:border-stone-300'
            }`}
          >
            {item.label}
          </button>
        );
      })}

      {/* Overflow "More" Dropdown if items exceed threshold */}
      {overflowItems.length > 0 && (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
            className={`px-3 py-2 rounded-xl text-xs sm:text-[13px] font-medium transition-all duration-150 cursor-pointer flex items-center gap-1 border whitespace-nowrap select-none ${
              isOverflowActive
                ? 'bg-[#E8F8F5] text-[#0F9D8A] font-semibold border-[#0F9D8A]/40 shadow-xs'
                : 'bg-white text-[#172033] border-[#E5E7EB] hover:bg-stone-50 hover:border-stone-300'
            }`}
            aria-expanded={moreDropdownOpen}
          >
            <span>{t(lang, 'navigation.more')}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${moreDropdownOpen ? 'rotate-180 text-[#0F9D8A]' : 'text-[#667085]'}`} />
          </button>

          {moreDropdownOpen && (
            <div className="absolute top-full mt-2 left-0 w-48 bg-white border border-[#E5E7EB] rounded-2xl shadow-lg py-1.5 z-50 animate-in fade-in-50 zoom-in-95 duration-100">
              {overflowItems.map((item) => {
                const isActive = item.isActive;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.onClick) item.onClick();
                      setMoreDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs sm:text-[13px] font-medium transition-colors cursor-pointer flex items-center justify-between ${
                      isActive
                        ? 'bg-[#E8F8F5] text-[#0F9D8A] font-semibold'
                        : 'text-[#172033] hover:bg-stone-50'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0F9D8A]" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
