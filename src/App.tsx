/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LanguageCode, 
  UserRole, 
  AtrocityCase,
  User,
  UserProfile
} from './types';
import { AppStore } from './services/storage';
import { useAuth } from './firebase/authContext';
import { subscribeToCases } from './firebase/caseService';
import { DEMO_ACCOUNTS } from './firebase/seedService';
import { 
  USER_ROLES, 
  canAccessView, 
  getDashboardViewForRole, 
  logAuthorizationFailure 
} from './services/authRoleSystem';
import { AppHeader } from './components/AppHeader';
import { RoleSwitcherBar } from './components/RoleSwitcherBar';
import { detectLanguage, saveLanguagePreference, updateDocumentLanguage } from './i18n';
import { LandingPage } from './components/LandingPage';
import { VictimDashboard } from './components/VictimDashboard';
import { CounsellorDashboard } from './components/CounsellorDashboard';
import { DistrictDashboard } from './components/DistrictDashboard';
import { StateNationalDashboard } from './components/StateNationalDashboard';
import { AuditorDashboard } from './components/AuditorDashboard';
import { AdminPanel } from './components/AdminPanel';
import { CaseDetailsModal } from './components/CaseDetailsModal';
import { GroundingModal } from './components/GroundingModal';
import { LoginModal } from './components/LoginModal';
import { AccessDeniedCard } from './components/AccessDeniedCard';
import { ExerciseTutorialModal } from './components/ExerciseTutorialModal';
import { StatutoryRightsModal } from './components/StatutoryRightsModal';
import { FinancialSupportModal } from './components/FinancialSupportModal';
import { OmnichannelIntakeModal } from './components/OmnichannelIntakeModal';
import { DiscreetCamouflage } from './components/DiscreetCamouflage';

export type AppView = 
  | 'home' 
  | 'victim' 
  | 'counsellor' 
  | 'district' 
  | 'state' 
  | 'national' 
  | 'auditor' 
  | 'admin';

export default function App() {
  const { 
    userProfile, 
    loading, 
    logout: authLogout, 
    quickDemoLogin, 
    authDiagnostic, 
    refreshIdToken 
  } = useAuth();

  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(() => detectLanguage(userProfile?.preferredLanguage || userProfile?.language));
  const [cases, setCases] = useState<AtrocityCase[]>(AppStore.getCases());
  const [thresholds, setThresholds] = useState(AppStore.getThresholds());
  const [auditLogs, setAuditLogs] = useState(AppStore.getAuditLogs());
  const [offlineQueue, setOfflineQueue] = useState(AppStore.getOfflineQueue());
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Sync document html lang attribute
  useEffect(() => {
    updateDocumentLanguage(currentLanguage);
  }, [currentLanguage]);

  // Synchronize authenticated user profile language preference when loaded
  useEffect(() => {
    if (userProfile?.preferredLanguage || userProfile?.language) {
      const userLang = (userProfile.preferredLanguage || userProfile.language) as LanguageCode;
      setCurrentLanguage(userLang);
      updateDocumentLanguage(userLang);
    }
  }, [userProfile?.preferredLanguage, userProfile?.language]);

  // Derive verified active user strictly from Firebase Auth / Firestore profile
  const activeUser: User = {
    id: userProfile?.uid || 'demo-sunita-uid',
    uid: userProfile?.uid,
    name: userProfile?.name || 'Sunita D. (Protected Alias)',
    email: userProfile?.email || 'sunita.victim@mannik.ai',
    role: userProfile?.role || USER_ROLES.VICTIM,
    language: currentLanguage,
    district: userProfile?.districtId ? userProfile.districtId.charAt(0).toUpperCase() + userProfile.districtId.slice(1) : 'Pune',
    state: userProfile?.stateId ? userProfile.stateId.charAt(0).toUpperCase() + userProfile.stateId.slice(1) : 'Maharashtra',
    districtId: userProfile?.districtId || 'pune',
    stateId: userProfile?.stateId || 'maharashtra',
    credentials: userProfile?.credentials || {
      counsellorCredential: userProfile?.role === USER_ROLES.COUNSELLOR,
      credentialVerified: true,
    },
  };

  // Active view navigation - auto-initialize to the user's authoritative dashboard
  const [activeView, setActiveView] = useState<AppView>(() => {
    return getDashboardViewForRole(userProfile?.role) as AppView;
  });

  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  
  // Modals state
  const [isGroundingOpen, setIsGroundingOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isExercisesOpen, setIsExercisesOpen] = useState(false);
  const [isRightsOpen, setIsRightsOpen] = useState(false);
  const [isFinancialOpen, setIsFinancialOpen] = useState(false);
  const [isOmnichannelOpen, setIsOmnichannelOpen] = useState(false);
  const [isCamouflageActive, setIsCamouflageActive] = useState(false);

  // Automatically update the view when userProfile changes (e.g. login or switch)
  useEffect(() => {
    if (userProfile?.role) {
      const naturalView = getDashboardViewForRole(userProfile.role) as AppView;
      setActiveView(naturalView);
    }
  }, [userProfile?.uid, userProfile?.role]);

  // Subscribe to live Firestore cases when userProfile changes
  useEffect(() => {
    if (!userProfile) return;
    const unsubscribe = subscribeToCases(userProfile, (firestoreCases) => {
      if (firestoreCases && firestoreCases.length > 0) {
        setCases((prev) => {
          return prev.map((c) => {
            const match = firestoreCases.find((fc) => fc.caseId === c.id);
            if (match) {
              return {
                ...c,
                status: (match.status as any) || c.status,
                riskState: (match.priority === 'urgent' ? 'urgent' : match.priority === 'high' ? 'high' : c.riskState),
                currentDistressScore: match.distressScore ?? c.currentDistressScore,
                trajectory: match.trajectory || c.trajectory,
                assignedCounsellorName: match.assignedCounsellorName || c.assignedCounsellorName,
              };
            }
            return c;
          });
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [userProfile]);

  // Synchronize store updates
  useEffect(() => {
    const unsubscribe = AppStore.subscribe(() => {
      setCases([...AppStore.getCases()]);
      setThresholds({ ...AppStore.getThresholds() });
      setAuditLogs([...AppStore.getAuditLogs()]);
      setOfflineQueue([...AppStore.getOfflineQueue()]);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Online / Offline network listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      const synced = AppStore.syncOfflineQueue();
      if (synced > 0) {
        alert(`Network connection restored! ${synced} offline check-ins were encrypted and synchronized to the server.`);
      }
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle Demo Role Change with real Firebase Auth authentication
  const handleRoleChange = async (newRole: UserRole) => {
    const matchingAcc = DEMO_ACCOUNTS.find(a => a.role === newRole) || DEMO_ACCOUNTS[0];
    const authedProfile = await quickDemoLogin(matchingAcc);
    // Auto navigate to the authoritative view for that role
    const destView = getDashboardViewForRole(authedProfile.role) as AppView;
    setActiveView(destView);
  };

  const handleLanguageChange = (newLang: LanguageCode) => {
    setCurrentLanguage(newLang);
    saveLanguagePreference(newLang, userProfile?.uid);
  };

  const handleSyncOffline = () => {
    const count = AppStore.syncOfflineQueue();
    alert(`Manually synchronized ${count} queued check-ins.`);
  };

  const handleLogout = async () => {
    await authLogout();
    setActiveView('home');
  };

  // Find active victim case
  const activeVictimCase = cases.find(c => c.id === 'CASE-MH-2026-109') || cases[0];

  // RBAC Permission Check: strictly check verified activeUser role and credentials
  const hasAccessToCurrentView = canAccessView(activeUser.role, activeView, activeUser.credentials);

  // Log unauthorized access attempts
  useEffect(() => {
    if (!hasAccessToCurrentView) {
      logAuthorizationFailure({
        userUid: activeUser.uid,
        requestedRoute: activeView,
        actualRole: activeUser.role,
        requiredRoleOrPermission: activeView,
        timestamp: new Date().toISOString(),
        reason: `Role "${activeUser.role}" does not have permission to view "${activeView}".`,
      });
    }
  }, [activeView, activeUser.role, hasAccessToCurrentView, activeUser.uid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-stone-900 text-stone-100 flex items-center justify-center font-display font-bold text-2xl shadow-md animate-pulse">
            M
          </div>
          <div className="text-center">
            <h2 className="font-display font-bold text-base text-stone-900">Mannik AI Care Core</h2>
            <p className="text-xs text-stone-500 mt-1">Verifying encrypted session & Firestore authorization...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-900 flex flex-col font-sans selection:bg-teal-700 selection:text-white">
      {/* App Header */}
      <AppHeader
        currentUser={activeUser}
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        onOpenGrounding={() => setIsGroundingOpen(true)}
        onOpenExercises={() => setIsExercisesOpen(true)}
        onOpenRights={() => setIsRightsOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        onToggleCamouflage={() => setIsCamouflageActive(true)}
        isOffline={isOffline}
        offlineQueueCount={offlineQueue.length}
        onSyncOffline={handleSyncOffline}
        activeView={activeView}
        onNavigate={(view) => setActiveView(view as AppView)}
      />

      {/* Role and Scenario Switcher Bar (Clearly marked as Demo Environment) */}
      <RoleSwitcherBar
        currentUser={activeUser}
        language={currentLanguage}
        onSelectRole={handleRoleChange}
        onSelectCase={(caseId) => {
          setSelectedCaseId(caseId);
        }}
        activeCaseId={selectedCaseId || undefined}
        cases={cases}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* RBAC Security Guard: If user doesn't have clearance for this dashboard, show access barrier */}
        {!hasAccessToCurrentView ? (
          <AccessDeniedCard
            currentUser={activeUser}
            requestedView={activeView}
            onOpenLogin={() => setIsLoginOpen(true)}
            onGoToAuthorizedDashboard={() => setActiveView(getDashboardViewForRole(activeUser.role) as AppView)}
            onGoHome={() => setActiveView('home')}
          />
        ) : (
          <>
            {activeView === 'home' && (
              <LandingPage
                onStartCheckIn={() => setActiveView('victim')}
                onExploreCounsellor={() => {
                  if (canAccessView(activeUser.role, 'counsellor')) {
                    setActiveView('counsellor');
                  } else {
                    setIsLoginOpen(true);
                  }
                }}
                onOpenGrounding={() => setIsGroundingOpen(true)}
                language={currentLanguage}
              />
            )}

            {activeView === 'victim' && (
              <VictimDashboard
                caseItem={activeVictimCase}
                currentUser={activeUser}
                language={currentLanguage}
                isOffline={isOffline}
                onOpenExercises={() => setIsExercisesOpen(true)}
                onOpenRights={() => setIsRightsOpen(true)}
                onOpenFinancial={() => setIsFinancialOpen(true)}
                onOpenOmnichannel={() => setIsOmnichannelOpen(true)}
                onOpenCaseDetails={() => setSelectedCaseId(activeVictimCase.id)}
                onToggleCamouflage={() => setIsCamouflageActive(true)}
              />
            )}

            {activeView === 'counsellor' && (
              <CounsellorDashboard
                cases={cases}
                onSelectCase={(caseId) => setSelectedCaseId(caseId)}
              />
            )}

            {activeView === 'district' && (
              <DistrictDashboard
                cases={cases}
                onSelectCase={(caseId) => setSelectedCaseId(caseId)}
              />
            )}

            {activeView === 'state' && (
              <StateNationalDashboard
                cases={cases}
                mode="state"
              />
            )}

            {activeView === 'national' && (
              <StateNationalDashboard
                cases={cases}
                mode="national"
              />
            )}

            {activeView === 'auditor' && (
              <AuditorDashboard
                auditLogs={auditLogs}
              />
            )}

            {activeView === 'admin' && (
              <AdminPanel
                thresholds={thresholds}
                auditLogs={auditLogs}
              />
            )}
          </>
        )}
      </main>

      {/* Modals & Dialogs */}
      <CaseDetailsModal
        caseId={selectedCaseId}
        onClose={() => setSelectedCaseId(null)}
      />

      <GroundingModal
        isOpen={isGroundingOpen}
        onClose={() => setIsGroundingOpen(false)}
        language={currentLanguage}
        victimAlias={activeVictimCase.victimAlias}
      />

      <ExerciseTutorialModal
        isOpen={isExercisesOpen}
        onClose={() => setIsExercisesOpen(false)}
        language={currentLanguage}
      />

      <StatutoryRightsModal
        isOpen={isRightsOpen}
        onClose={() => setIsRightsOpen(false)}
        language={currentLanguage}
      />

      <FinancialSupportModal
        isOpen={isFinancialOpen}
        onClose={() => setIsFinancialOpen(false)}
        currentUser={activeUser}
        caseItem={activeVictimCase}
      />

      <OmnichannelIntakeModal
        isOpen={isOmnichannelOpen}
        onClose={() => setIsOmnichannelOpen(false)}
        caseItem={activeVictimCase}
        language={currentLanguage}
        onCheckInCompleted={(score, channel) => {
          setCases([...AppStore.getCases()]);
        }}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={(authedProfile: UserProfile) => {
          // Immediately route to the authoritative dashboard for that user role
          const targetView = getDashboardViewForRole(authedProfile.role) as AppView;
          setActiveView(targetView);
        }}
      />

      {/* Discreet Camouflage Screen (One-Tap Emergency Screen for Survivor Safety) */}
      <DiscreetCamouflage
        isActive={isCamouflageActive}
        onRestore={() => setIsCamouflageActive(false)}
      />

      {/* Accessible Footer */}
      <footer className="border-t border-stone-200 bg-white/70 py-6 px-4 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-stone-900">Mannik AI</span>
            <span>·</span>
            <span>Continuous Mental Health Monitoring & Trauma-Informed Human Care</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-stone-500">
            <span>Non-clinical Screening Tool</span>
            <span>·</span>
            <span>Zero-PII Privacy Protection</span>
            <span>·</span>
            <span>National Helpline: 181 / 112</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
