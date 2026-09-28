import React, { useState } from 'react';
import { LanguageCode, User } from '../types';
import { BrandLogo } from './header/BrandLogo';
import { MainNavigation } from './header/MainNavigation';
import { HeaderActions } from './header/HeaderActions';
import { canAccessView, getDashboardViewForRole, USER_ROLES } from '../services/authRoleSystem';
import { HeartHandshake, Key, LayoutDashboard } from 'lucide-react';
import { t } from '../i18n';

interface AppHeaderProps {
  currentUser: User;
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onOpenGrounding?: () => void;
  onOpenExercises?: () => void;
  onOpenRights?: () => void;
  onOpenFinancial?: () => void;
  onOpenNHAA?: () => void;
  onOpenArchitecture?: () => void;
  onOpenOmnichannel?: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onToggleCamouflage?: () => void;
  isOffline: boolean;
  offlineQueueCount: number;
  onSyncOffline: () => void;
  activeView: string;
  onNavigate: (view: string) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentUser,
  currentLanguage,
  onLanguageChange,
  onOpenGrounding,
  onOpenExercises,
  onOpenRights,
  onOpenFinancial,
  onOpenNHAA,
  onOpenArchitecture,
  onOpenOmnichannel,
  onOpenLogin,
  onLogout,
  onToggleCamouflage,
  isOffline,
  offlineQueueCount,
  onSyncOffline,
  activeView,
  onNavigate,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userPrimaryView = getDashboardViewForRole(currentUser.role);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      {/* Single Main Navigation Bar (Clean, minimal, 74-80px height, centered container) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[74px] flex items-center justify-between gap-4">
        {/* LEFT: Polished Brand Section */}
        <div className="flex items-center shrink-0">
          <BrandLogo onNavigateHome={() => onNavigate('home')} language={currentLanguage} />
        </div>

        {/* CENTER: Role-Aware Rounded Navigation Buttons */}
        <div className="hidden lg:flex items-center justify-center flex-1 px-4">
          <MainNavigation
            currentUser={currentUser}
            activeView={activeView}
            onNavigate={(view) => onNavigate(view)}
            onOpenExercises={onOpenExercises}
            onOpenRights={onOpenRights}
            onOpenFinancial={onOpenFinancial}
            onOpenNHAA={onOpenNHAA}
            onOpenArchitecture={onOpenArchitecture}
            onOpenOmnichannel={onOpenOmnichannel}
          />
        </div>

        {/* RIGHT: Actions (Shanti Space, Language, User/Role, Logout) */}
        <div className="flex items-center shrink-0">
          <HeaderActions
            currentUser={currentUser}
            currentLanguage={currentLanguage}
            onLanguageChange={onLanguageChange}
            onOpenGrounding={onOpenGrounding}
            onOpenLogin={onOpenLogin}
            onLogout={onLogout}
            isOffline={isOffline}
            offlineQueueCount={offlineQueueCount}
            onSyncOffline={onSyncOffline}
            mobileMenuOpen={mobileMenuOpen}
            onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          />
        </div>
      </div>

      {/* MOBILE / TABLET COLLAPSIBLE DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E5E7EB] bg-white px-4 py-4 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-150">
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider px-2">
              {t(currentLanguage, 'common.navigationMenu')}
            </span>

            {/* Home */}
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] font-medium transition-colors border ${
                activeView === 'home'
                  ? 'bg-[#E8F8F5] text-[#0F9D8A] font-semibold border-[#0F9D8A]/40'
                  : 'bg-white text-[#172033] border-[#E5E7EB] hover:bg-stone-50'
              }`}
            >
              {t(currentLanguage, 'navigation.home')}
            </button>

            {/* Check-In Hub (for victim or preview) */}
            {canAccessView(currentUser.role, 'victim') && (
              <button
                onClick={() => {
                  onNavigate('victim');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] font-medium transition-colors border ${
                  activeView === 'victim'
                    ? 'bg-[#E8F8F5] text-[#0F9D8A] font-semibold border-[#0F9D8A]/40'
                    : 'bg-white text-[#172033] border-[#E5E7EB] hover:bg-stone-50'
                }`}
              >
                {t(currentLanguage, 'navigation.checkInHub')}
              </button>
            )}

            {/* Counsellor Review */}
            {canAccessView(currentUser.role, 'counsellor') && (
              <button
                onClick={() => {
                  onNavigate('counsellor');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] font-medium transition-colors border ${
                  activeView === 'counsellor'
                    ? 'bg-[#E8F8F5] text-[#0F9D8A] font-semibold border-[#0F9D8A]/40'
                    : 'bg-white text-[#172033] border-[#E5E7EB] hover:bg-stone-50'
                }`}
              >
                {t(currentLanguage, 'navigation.counsellorReview')}
              </button>
            )}

            {/* District Welfare */}
            {canAccessView(currentUser.role, 'district') && (
              <button
                onClick={() => {
                  onNavigate('district');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] font-medium transition-colors border ${
                  activeView === 'district'
                    ? 'bg-[#E8F8F5] text-[#0F9D8A] font-semibold border-[#0F9D8A]/40'
                    : 'bg-white text-[#172033] border-[#E5E7EB] hover:bg-stone-50'
                }`}
              >
                {t(currentLanguage, 'navigation.districtWelfare')}
              </button>
            )}

            {/* State Directorate */}
            {canAccessView(currentUser.role, 'state') && currentUser.role === USER_ROLES.STATE_ADMIN && (
              <button
                onClick={() => {
                  onNavigate('state');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] font-medium transition-colors border ${
                  activeView === 'state'
                    ? 'bg-[#E8F8F5] text-[#0F9D8A] font-semibold border-[#0F9D8A]/40'
                    : 'bg-white text-[#172033] border-[#E5E7EB] hover:bg-stone-50'
                }`}
              >
                {t(currentLanguage, 'navigation.stateDirectorate')}
              </button>
            )}

            {/* National Analytics */}
            {canAccessView(currentUser.role, 'national') && currentUser.role === USER_ROLES.NATIONAL_ADMIN && (
              <button
                onClick={() => {
                  onNavigate('national');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] font-medium transition-colors border ${
                  activeView === 'national'
                    ? 'bg-[#E8F8F5] text-[#0F9D8A] font-semibold border-[#0F9D8A]/40'
                    : 'bg-white text-[#172033] border-[#E5E7EB] hover:bg-stone-50'
                }`}
              >
                {t(currentLanguage, 'navigation.nationalAnalytics')}
              </button>
            )}

            {/* Security Audit */}
            {canAccessView(currentUser.role, 'auditor') && currentUser.role === USER_ROLES.AUDITOR && (
              <button
                onClick={() => {
                  onNavigate('auditor');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] font-medium transition-colors border ${
                  activeView === 'auditor'
                    ? 'bg-[#E8F8F5] text-[#0F9D8A] font-semibold border-[#0F9D8A]/40'
                    : 'bg-white text-[#172033] border-[#E5E7EB] hover:bg-stone-50'
                }`}
              >
                {t(currentLanguage, 'navigation.securityAudit')}
              </button>
            )}

            {/* Admin */}
            {canAccessView(currentUser.role, 'admin') && (
              <button
                onClick={() => {
                  onNavigate('admin');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] font-medium transition-colors border ${
                  activeView === 'admin'
                    ? 'bg-[#E8F8F5] text-[#0F9D8A] font-semibold border-[#0F9D8A]/40'
                    : 'bg-white text-[#172033] border-[#E5E7EB] hover:bg-stone-50'
                }`}
              >
                {t(currentLanguage, 'navigation.admin')}
              </button>
            )}

            {/* Relief & Financial Compensation */}
            {onOpenFinancial && (
              <button
                onClick={() => {
                  onOpenFinancial();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] font-medium bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                {t(currentLanguage, 'navigation.reliefFinance')}
              </button>
            )}

            {/* NHAA Intake Hub */}
            {onOpenNHAA && (
              <button
                onClick={() => {
                  onOpenNHAA();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] font-medium bg-teal-50 text-teal-900 border border-teal-200 hover:bg-teal-100 transition-colors"
              >
                {t(currentLanguage, 'navigation.nhaaHub')}
              </button>
            )}

            {/* Omnichannel Simulator */}
            {onOpenOmnichannel && (
              <button
                onClick={() => {
                  onOpenOmnichannel();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] font-medium bg-sky-50 text-sky-900 border border-sky-200 hover:bg-sky-100 transition-colors"
              >
                {t(currentLanguage, 'navigation.ivrSms')}
              </button>
            )}

            {/* SIH26094 Blueprint */}
            {onOpenArchitecture && (
              <button
                onClick={() => {
                  onOpenArchitecture();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] font-medium bg-stone-100 text-stone-900 border border-stone-200 hover:bg-stone-200 transition-colors"
              >
                {t(currentLanguage, 'navigation.blueprint')}
              </button>
            )}

            {/* Legal Rights */}
            {onOpenRights && (
              <button
                onClick={() => {
                  onOpenRights();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] font-medium bg-white text-[#172033] border border-[#E5E7EB] hover:bg-stone-50 transition-colors"
              >
                {t(currentLanguage, 'navigation.legalRights')}
              </button>
            )}
          </div>

          <div className="pt-2 border-t border-[#E5E7EB] flex flex-col gap-2">
            {onOpenGrounding && (
              <button
                onClick={() => {
                  onOpenGrounding();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-3.5 rounded-xl border border-[#0F9D8A]/35 text-[#0F9D8A] bg-[#E8F8F5] text-xs font-semibold flex items-center justify-center gap-2"
              >
                <HeartHandshake className="w-4 h-4 text-[#0F9D8A]" />
                <span>{t(currentLanguage, 'navigation.shantiSpace')}</span>
              </button>
            )}

            <button
              onClick={() => {
                onOpenLogin();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-3.5 rounded-xl bg-[#172033] text-white text-xs font-semibold flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4 text-[#19B6A5]" />
              <span>Switch User or Sign In</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
