import React, { useState } from 'react';
import { 
  Heart, 
  Mic, 
  MessageSquare, 
  Clock, 
  PhoneCall, 
  ShieldCheck, 
  Volume2, 
  ChevronRight, 
  CheckCircle,
  Wind,
  Scale,
  Calculator,
  ShieldAlert,
  FileText,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { AtrocityCase, LanguageCode, User } from '../types';
import { t, speakText } from '../i18n';
import { GroundingModal } from './GroundingModal';
import { ComprehensiveCheckInModal } from './ComprehensiveCheckInModal';
import { VoiceCheckInModal } from './VoiceCheckInModal';
import { UrgentSupportModal } from './UrgentSupportModal';
import { FloatingVictimChatbot } from './FloatingVictimChatbot';
import { CalculationDetailsModal } from './CalculationDetailsModal';
import { ExerciseTutorialModal } from './ExerciseTutorialModal';
import { AppStore } from '../services/storage';
import { formatScoreNumber } from '../services/distressScoring';

// Aesthetic image assets
import careSupportBanner from '../assets/images/care_support_banner_1790578968337.jpg';
import zenShantiSanctuary from '../assets/images/zen_shanti_sanctuary_1790578927980.jpg';
import somaticCalmWellness from '../assets/images/somatic_calm_wellness_1790578950019.jpg';

interface VictimDashboardProps {
  caseItem: AtrocityCase;
  currentUser?: User;
  language: LanguageCode;
  isOffline: boolean;
  onOpenExercises?: () => void;
  onOpenRights?: () => void;
  onOpenFinancial?: () => void;
  onOpenOmnichannel?: () => void;
  onToggleCamouflage?: () => void;
  onOpenCaseDetails?: () => void;
}

export const VictimDashboard: React.FC<VictimDashboardProps> = ({
  caseItem,
  currentUser = {
    id: 'usr-victim-01',
    name: 'Sunita D. (Protected Alias)',
    role: 'victim',
    language: 'hi',
  },
  language,
  isOffline,
  onOpenExercises,
  onOpenRights,
  onOpenFinancial,
  onOpenOmnichannel,
  onOpenCaseDetails,
}) => {
  const tr = (key: string, params?: Record<string, string | number | undefined>) => t(language, key, params);
  
  // Modals & Floating Chatbot states
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isVoiceCheckInOpen, setIsVoiceCheckInOpen] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isGroundingOpen, setIsGroundingOpen] = useState(false);
  const [isExercisesInternalOpen, setIsExercisesInternalOpen] = useState(false);
  const [isCalculationOpen, setIsCalculationOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [quickFeelingLogged, setQuickFeelingLogged] = useState<string | null>(null);

  // Derive simple human-centered non-clinical indicator
  const getSimpleWellnessStatus = (score: number) => {
    if (score >= 8.5) {
      return { 
        label: tr('common.reviewNeeded'), 
        subtext: tr('dashboard.decisionSupportNotice'),
        badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
        dotColor: 'bg-rose-500' 
      };
    }
    if (score >= 6.5) {
      return { 
        label: tr('common.monitoring'), 
        subtext: tr('dashboard.decisionSupportNotice'),
        badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
        dotColor: 'bg-amber-500' 
      };
    }
    return { 
      label: tr('common.stable'), 
      subtext: tr('dashboard.decisionSupportNotice'),
      badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
      dotColor: 'bg-teal-500' 
    };
  };

  const wellnessStatus = getSimpleWellnessStatus(caseItem.currentDistressScore);

  // Quick 1-tap feeling buttons for low-literacy users
  const handleQuickFeeling = (level: number, label: string, voiceCue: string) => {
    speakText(voiceCue, language);
    setQuickFeelingLogged(label);

    AppStore.submitCheckIn(caseItem.id, {
      caseId: caseItem.id,
      channel: 'touch',
      language,
      textResponse: `One-touch emotion check: ${label}`,
      answers: {
        sleepQuality: level >= 4 ? 2 : 4,
        safetyFeel: level >= 4 ? 1 : level === 3 ? 3 : 5,
        overwhelmLevel: level,
        socialConnection: level >= 4 ? 1 : 4,
      },
    }, isOffline);

    setTimeout(() => {
      setQuickFeelingLogged(null);
    }, 4000);
  };

  const handleOpenSomatic = () => {
    if (onOpenExercises) {
      onOpenExercises();
    } else {
      setIsExercisesInternalOpen(true);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-7 bg-[#FAF9F6] text-stone-900 relative">
      
      {/* 1. WELCOME & CASE STATUS HEADER BANNER WITH AESTHETIC ART */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-xs relative overflow-hidden">
        {/* Subtle background image gradient overlay */}
        <div className="absolute right-0 top-0 bottom-0 w-full sm:w-1/2 opacity-15 sm:opacity-20 pointer-events-none overflow-hidden">
          <img 
            src={careSupportBanner} 
            alt="Uplifting healing sunrise" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-linear-to-r from-white via-white/80 to-transparent" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${wellnessStatus.dotColor} animate-pulse`} />
                <span>{wellnessStatus.label}</span>
              </span>
              <span className="text-stone-300 text-xs">·</span>
              <span className="text-xs text-stone-600 font-mono font-semibold bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
                {tr('common.caseLabel')} {caseItem.id}
              </span>
              <span className="text-stone-300 text-xs">·</span>
              <span className="text-xs text-teal-800 font-semibold bg-teal-50/80 px-2 py-0.5 rounded-md border border-teal-200/60">
                {caseItem.district}, {caseItem.state}
              </span>
            </div>

            <h1 className="font-display font-bold text-2xl sm:text-3xl text-stone-900 tracking-tight">
              {tr('dashboard.welcomeBack')}, {caseItem.victimAlias}
            </h1>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {tr('dashboard.portalSubtitle')}
            </p>
          </div>

          {/* SOS Urgent Support Trigger Control */}
          <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-2.5 shrink-0">
            <button
              onClick={() => setIsSosOpen(true)}
              className="px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-xs shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer border border-rose-500"
            >
              <ShieldAlert className="w-4 h-4 animate-bounce" />
              <span>{tr('common.sos')}</span>
            </button>
            <span className="text-[11px] text-stone-500 text-center md:text-right">
              {tr('common.callHelpline')}
            </span>
          </div>
        </div>
      </section>

      {/* 2. PRIMARY ACTION CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Primary Action 1: Start Check-In */}
        <button
          onClick={() => setIsCheckInOpen(true)}
          className="p-5 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-between group cursor-pointer border border-teal-700"
        >
          <div className="text-left space-y-1">
            <span className="px-2 py-0.5 rounded-full bg-teal-600/50 text-teal-100 text-[10px] font-bold uppercase tracking-wider">
              {tr('common.stepByStep')}
            </span>
            <h3 className="font-display font-bold text-base text-white">
              {tr('common.startCheckIn')}
            </h3>
            <p className="text-xs text-teal-100/80">
              {tr('common.checkInDesc')}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center text-white shrink-0 group-hover:translate-x-1 transition-all">
            <ChevronRight className="w-5 h-5" />
          </div>
        </button>

        {/* Primary Action 2: Talk to Support (Expands the permanent bottom-right chatbot) */}
        <button
          onClick={() => setIsChatbotOpen(true)}
          className="p-5 rounded-2xl bg-white hover:bg-stone-50 text-stone-900 border border-stone-200/90 shadow-xs hover:shadow-sm transition-all flex items-center justify-between group cursor-pointer"
        >
          <div className="text-left space-y-1">
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
              {tr('common.liveAssistant')}
            </span>
            <h3 className="font-display font-bold text-base text-stone-900">
              {tr('common.talkToSupport')}
            </h3>
            <p className="text-xs text-stone-500">
              {tr('common.talkToSupportDesc')}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0 group-hover:translate-x-1 transition-all">
            <MessageSquare className="w-5 h-5 text-emerald-700" />
          </div>
        </button>

        {/* Primary Action 3: View My Case */}
        <button
          onClick={() => {
            if (onOpenCaseDetails) {
              onOpenCaseDetails();
            } else {
              const statusEl = document.getElementById('case-status-section');
              statusEl?.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="p-5 rounded-2xl bg-white hover:bg-stone-50 text-stone-900 border border-stone-200/90 shadow-xs hover:shadow-sm transition-all flex items-center justify-between group cursor-pointer"
        >
          <div className="text-left space-y-1">
            <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 text-[10px] font-bold uppercase tracking-wider border border-sky-200">
              {tr('common.authoritativeFile')}
            </span>
            <h3 className="font-display font-bold text-base text-stone-900">
              {tr('common.viewCase')}
            </h3>
            <p className="text-xs text-stone-500">
              {tr('common.viewCaseDesc')}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-sky-50 group-hover:bg-sky-100 flex items-center justify-center text-sky-800 shrink-0 group-hover:translate-x-1 transition-all">
            <FileText className="w-5 h-5 text-sky-700" />
          </div>
        </button>
      </section>

      {/* 3. PROMINENT UPFRONT GROUNDING SANCTUARY & SOMATIC EXERCISES */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {tr('common.traumaReliefBadge')}
              </span>
            </div>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-stone-900 mt-1">
              {tr('common.shantiHealingHeading')}
            </h2>
          </div>
          <span className="text-xs text-stone-500 hidden sm:inline">
            {tr('dashboard.freeConfidential')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card A: Shanti Grounding Sanctuary */}
          <div 
            onClick={() => setIsGroundingOpen(true)}
            className="group bg-white rounded-3xl border-2 border-emerald-100 hover:border-emerald-300 shadow-sm hover:shadow-xl transition-all duration-200 overflow-hidden cursor-pointer flex flex-col justify-between"
          >
            {/* Aesthetic Image Header */}
            <div className="h-44 sm:h-48 w-full relative overflow-hidden bg-emerald-950">
              <img 
                src={zenShantiSanctuary} 
                alt="Shanti Sanctuary Lotus Meditation" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
              
              {/* Floating Big Icon on the image */}
              <div className="absolute bottom-4 left-4 flex items-center gap-3.5">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-600/90 backdrop-blur-md text-white flex items-center justify-center shadow-lg border border-emerald-300/40 shrink-0 group-hover:rotate-6 transition-transform">
                  <Wind className="w-8 h-8 sm:w-9 sm:h-9 text-emerald-100" />
                </div>
                <div className="text-white drop-shadow-md">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/80 text-[10px] font-bold uppercase tracking-wider text-white">
                    {tr('common.pacedBreathing')}
                  </span>
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-white mt-0.5">
                    {tr('dashboard.shantiSpaceTitle')}
                  </h3>
                </div>
              </div>
            </div>

            {/* Content & Action */}
            <div className="p-5 sm:p-6 space-y-4 bg-white flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                    {tr('dashboard.shantiSpaceTitle')} · Nature Soundscapes
                  </span>
                  <span className="text-xs text-stone-400">·</span>
                  <span className="text-xs text-stone-500">4-7-8 Breathing Circle</span>
                </div>
                <p className="text-sm text-stone-600 leading-relaxed">
                  {tr('common.shantiDesc')}
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsGroundingOpen(true);
                  }}
                  className="w-full py-3 px-5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Wind className="w-4 h-4" />
                  <span>{tr('common.openSanctuary')}</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Card B: Somatic Trauma Exercises (Strictly for Victims) */}
          <div 
            onClick={handleOpenSomatic}
            className="group bg-white rounded-3xl border-2 border-violet-100 hover:border-violet-300 shadow-sm hover:shadow-xl transition-all duration-200 overflow-hidden cursor-pointer flex flex-col justify-between"
          >
            {/* Aesthetic Image Header */}
            <div className="h-44 sm:h-48 w-full relative overflow-hidden bg-violet-950">
              <img 
                src={somaticCalmWellness} 
                alt="Somatic Butterfly Hug Trauma Calming" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
              
              {/* Floating Big Icon on the image */}
              <div className="absolute bottom-4 left-4 flex items-center gap-3.5">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-violet-600/90 backdrop-blur-md text-white flex items-center justify-center shadow-lg border border-violet-300/40 shrink-0 group-hover:rotate-6 transition-transform">
                  <Heart className="w-8 h-8 sm:w-9 sm:h-9 text-violet-100" />
                </div>
                <div className="text-white drop-shadow-md">
                  <span className="px-2 py-0.5 rounded-md bg-violet-500/80 text-[10px] font-bold uppercase tracking-wider text-white">
                    {tr('common.traumaHealing')}
                  </span>
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-white mt-0.5">
                    {tr('dashboard.somaticTitle')}
                  </h3>
                </div>
              </div>
            </div>

            {/* Content & Action */}
            <div className="p-5 sm:p-6 space-y-4 bg-white flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-violet-900 bg-violet-50 px-2.5 py-1 rounded-xl border border-violet-200">
                    {tr('dashboard.somaticTitle')} · Body Grounding
                  </span>
                  <span className="text-xs text-stone-400">·</span>
                  <span className="text-xs text-stone-500">Butterfly Hug &amp; 5-4-3-2-1</span>
                </div>
                <p className="text-sm text-stone-600 leading-relaxed">
                  {tr('common.somaticDesc')}
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenSomatic();
                  }}
                  className="w-full py-3 px-5 rounded-2xl bg-violet-700 hover:bg-violet-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Heart className="w-4 h-4" />
                  <span>{tr('common.startExercises')}</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. YOUR SUPPORT SNAPSHOT (Personalized Single-Source Insights) */}
      <section className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
              {tr('dashboard.overview')}
            </span>
            <h2 className="font-display font-bold text-lg text-stone-900 mt-1">
              {tr('dashboard.supportSnapshot')}
            </h2>
          </div>
          <span className="text-xs text-stone-500 flex items-center gap-1 font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>{tr('common.today')}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Item 1: Current Check-In */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 space-y-1">
            <span className="text-[10px] text-emerald-800 uppercase font-semibold block">{tr('dashboard.checkInStatus')}</span>
            <span className="font-bold text-xs text-emerald-950 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>{tr('dashboard.upToDate')}</span>
            </span>
            <span className="text-[10px] text-emerald-700 block font-mono">
              {caseItem.lastCheckInDate ? new Date(caseItem.lastCheckInDate).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Logged'}
            </span>
          </div>

          {/* Item 2: Trajectory Trend */}
          <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200/70 space-y-1">
            <span className="text-[10px] text-teal-800 uppercase font-semibold block">{tr('dashboard.trend')}</span>
            <span className="font-bold text-xs text-teal-950 capitalize flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
              <span>{caseItem.trajectory.replace('_', ' ')}</span>
            </span>
            <span className="text-[10px] text-teal-700 block">{tr('dashboard.sevenDayBaseline')}</span>
          </div>

          {/* Item 3: Next Follow-Up */}
          <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-200/70 space-y-1">
            <span className="text-[10px] text-sky-800 uppercase font-semibold block">{tr('dashboard.nextFollowUp')}</span>
            <span className="font-bold text-xs text-sky-950 block">
              {new Date(caseItem.nextScheduledCheckIn).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </span>
            <span className="text-[10px] text-sky-700 block">{tr('dashboard.assignedTelehealth')}</span>
          </div>

          {/* Item 4: Pending Support */}
          <div className="p-3.5 rounded-2xl bg-violet-50/60 border border-violet-200/70 space-y-1">
            <span className="text-[10px] text-violet-800 uppercase font-semibold block">{tr('dashboard.pendingSupport')}</span>
            <span className="font-bold text-xs text-violet-950 block">
              {caseItem.interventions.length > 0 ? `${caseItem.interventions.length} Active` : tr('common.normal')}
            </span>
            <span className="text-[10px] text-violet-700 block">{tr('dashboard.humanReviewQueue')}</span>
          </div>

          {/* Item 5: Financial Support */}
          <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-1">
            <span className="text-[10px] text-amber-800 uppercase font-semibold block">{tr('dashboard.dbtRelief')}</span>
            <span className="font-bold text-xs text-amber-950 block">
              ₹1,00,000
            </span>
            <span className="text-[10px] text-amber-700 block">{tr('dashboard.stage2InQueue')}</span>
          </div>

          {/* Item 6: Case Status */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200/70 space-y-1">
            <span className="text-[10px] text-indigo-800 uppercase font-semibold block">{tr('dashboard.caseStatus')}</span>
            <span className="font-bold text-xs text-indigo-950 block truncate">
              {caseItem.status === 'active_monitoring' ? tr('common.monitoring') : caseItem.status}
            </span>
            <span className="text-[10px] text-indigo-700 block font-mono">Sec 3(1)(r)</span>
          </div>
        </div>
      </section>

      {/* 5. CURRENT WELL-BEING SUMMARY & 1-TAP EXPRESSION */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 inline-block">
              {tr('dashboard.personalWellbeing')}
            </span>
            <h2 className="font-display font-bold text-xl text-stone-900 mt-1">
              {tr('dashboard.personalWellbeing')}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              {tr('dashboard.decisionSupportNotice')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCalculationOpen(true)}
              className="text-xs font-semibold text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-xl border border-teal-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>{tr('dashboard.viewCalculation')}</span>
            </button>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${wellnessStatus.badgeColor}`}>
              {wellnessStatus.label}
            </span>
          </div>
        </div>

        {/* Status explanation */}
        <div className="p-4 rounded-2xl bg-[#FAFAF9] border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${wellnessStatus.dotColor}`} />
              <span className="font-bold text-sm text-stone-900">
                {wellnessStatus.subtext}
              </span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed max-w-xl">
              {tr('dashboard.counsellorQuote')}
            </p>
          </div>

          <div className="text-right shrink-0">
            <div className="flex items-baseline justify-end gap-1.5">
              <span className="font-mono text-3xl font-bold text-stone-900 tabular-nums">
                {formatScoreNumber(caseItem.currentDistressScore)}
              </span>
              <span className="text-stone-400 text-xs font-medium">/ 10.0</span>
            </div>
            <span className={`text-[11px] font-semibold ${caseItem.scoreChange > 0 ? 'text-amber-700' : 'text-teal-700'}`}>
              {caseItem.scoreChange > 0 ? `+${caseItem.scoreChange}` : caseItem.scoreChange} {tr('dashboard.ptsVsPrior')}
            </span>
          </div>
        </div>

        {/* One-Tap Emotion Buttons for Low-Literacy / Quick Touch */}
        <div className="pt-2 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <span>🌸 {tr('dashboard.quickFeelingTitle')}</span>
              <span className="text-stone-500 font-normal">({tr('dashboard.quickFeelingHint')})</span>
            </span>
            <button
              onClick={() => speakText(tr('dashboard.quickFeelingTitle'), language)}
              className="p-1 text-stone-500 hover:text-stone-800 cursor-pointer"
              title="Listen in your language"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => handleQuickFeeling(1, tr('dashboard.peaceful'), tr('dashboard.peacefulSub'))}
              className="p-3.5 rounded-2xl bg-teal-50/80 hover:bg-teal-100 border border-teal-200 flex flex-col items-center gap-1.5 transition-all active:scale-95 cursor-pointer text-center group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">🕊️</span>
              <span className="font-bold text-xs text-teal-950">{tr('dashboard.peaceful')}</span>
              <span className="text-[10px] text-teal-700">{tr('dashboard.peacefulSub')}</span>
            </button>

            <button
              onClick={() => handleQuickFeeling(2, tr('dashboard.okay'), tr('dashboard.okaySub'))}
              className="p-3.5 rounded-2xl bg-sky-50/80 hover:bg-sky-100 border border-sky-200 flex flex-col items-center gap-1.5 transition-all active:scale-95 cursor-pointer text-center group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">🙂</span>
              <span className="font-bold text-xs text-sky-950">{tr('dashboard.okay')}</span>
              <span className="text-[10px] text-sky-700">{tr('dashboard.okaySub')}</span>
            </button>

            <button
              onClick={() => handleQuickFeeling(3, tr('dashboard.worried'), tr('dashboard.worriedSub'))}
              className="p-3.5 rounded-2xl bg-amber-50/80 hover:bg-amber-100 border border-amber-200 flex flex-col items-center gap-1.5 transition-all active:scale-95 cursor-pointer text-center group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">😟</span>
              <span className="font-bold text-xs text-amber-950">{tr('dashboard.worried')}</span>
              <span className="text-[10px] text-amber-700">{tr('dashboard.worriedSub')}</span>
            </button>

            <button
              onClick={() => handleQuickFeeling(5, tr('dashboard.needHelp'), tr('dashboard.needHelpSub'))}
              className="p-3.5 rounded-2xl bg-rose-50/90 hover:bg-rose-100 border border-rose-200 flex flex-col items-center gap-1.5 transition-all active:scale-95 cursor-pointer text-center group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">🆘</span>
              <span className="font-bold text-xs text-rose-950">{tr('dashboard.needHelp')}</span>
              <span className="text-[10px] text-rose-700">{tr('dashboard.needHelpSub')}</span>
            </button>
          </div>

          {quickFeelingLogged && (
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 text-xs flex items-center justify-between animate-in fade-in">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-teal-600" />
                <span>{tr('common.success')}: <strong>{quickFeelingLogged}</strong>.</span>
              </span>
              <span className="text-[11px] text-teal-700 font-mono">{tr('common.encrypted')}</span>
            </div>
          )}
        </div>
      </section>

      {/* 6. SUPPORT TEAM & COMPACT VOICE CHECK-IN CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Support Clinician & Chat Assistant Link */}
        <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
                {tr('dashboard.assignedSupportTeam')}
              </span>
              <ShieldCheck className="w-4 h-4 text-teal-700" />
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-800 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                AS
              </div>
              <div className="space-y-0.5 text-xs">
                <span className="font-bold text-sm text-stone-900 block">{caseItem.assignedCounsellorName}</span>
                <span className="text-xs text-teal-800 font-semibold block">{tr('dashboard.leadCounsellorBadge')}</span>
                <span className="text-[11px] text-stone-500 block">{tr('dashboard.welfareOfficer')}: {caseItem.assignedCaseworkerName}</span>
              </div>
            </div>

            <p className="text-xs text-stone-600 italic bg-[#FAF9F6] p-3 rounded-2xl border border-stone-200/80 leading-relaxed">
              "{tr('dashboard.counsellorQuote')}"
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={() => setIsChatbotOpen(true)}
              className="flex-1 py-2.5 px-4 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <MessageSquare className="w-4 h-4 text-emerald-300" />
              <span>{tr('dashboard.askAssistantBtn')}</span>
            </button>
          </div>
        </div>

        {/* Compact Voice Check-In with Aesthetic Card */}
        <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden">
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-indigo-800 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
                {tr('dashboard.handsFreeCheckIn')}
              </span>
              <Mic className="w-4 h-4 text-indigo-700" />
            </div>

            <h3 className="font-display font-bold text-base text-stone-900">
              {tr('voice.title')}
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              {tr('dashboard.voiceCheckInDesc')}
            </p>
          </div>

          <div className="pt-2 relative z-10">
            <button
              onClick={() => setIsVoiceCheckInOpen(true)}
              className="w-full py-2.5 px-4 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs active:scale-98"
            >
              <Mic className="w-4 h-4 text-indigo-200" />
              <span>{tr('dashboard.startVoiceCheckInBtn')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 7. SUPPORT / FINANCIAL / LEGAL / REHABILITATION COMPACT SUMMARIES */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4" id="case-status-section">
        {/* Card A: Financial & Statutory DBT Relief */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                {tr('dashboard.dbtRelief')}
              </span>
              <span className="text-xs font-bold text-amber-950">₹3,00,000 Total</span>
            </div>
            <h4 className="font-display font-bold text-sm text-stone-900">
              {tr('dashboard.statutoryCompensation')}
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              {tr('dashboard.compensationDesc')}
            </p>
          </div>

          {onOpenFinancial && (
            <button
              onClick={onOpenFinancial}
              className="w-full py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>{tr('dashboard.viewReliefRecords')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Card B: Legal Rights & Defense */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-sky-900 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                {tr('dashboard.legalDefense')}
              </span>
              <Scale className="w-4 h-4 text-sky-700" />
            </div>
            <h4 className="font-display font-bold text-sm text-stone-900">
              {tr('dashboard.dlsaLegalAid')}
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              {tr('dashboard.dlsaDesc')}
            </p>
          </div>

          {onOpenRights && (
            <button
              onClick={onOpenRights}
              className="w-full py-2 bg-sky-800 hover:bg-sky-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>{tr('dashboard.viewStatutoryRights')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Card C: Multi-Channel Automated Outreach */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-teal-900 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                {tr('dashboard.lowTechAccess')}
              </span>
              <PhoneCall className="w-4 h-4 text-teal-700" />
            </div>
            <h4 className="font-display font-bold text-sm text-stone-900">
              {tr('dashboard.ivrSmsOutreach')}
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              {tr('dashboard.ivrSmsDesc')}
            </p>
          </div>

          {onOpenOmnichannel && (
            <button
              onClick={onOpenOmnichannel}
              className="w-full py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>{tr('dashboard.simulateIvrBtn')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </section>

      {/* 8. PERMANENT FLOATING CHATBOT DOCKED IN RIGHT BOTTOM CORNER FOR VICTIMS */}
      <FloatingVictimChatbot
        currentUser={currentUser}
        caseItem={caseItem}
        language={language}
        onOpenCheckIn={() => setIsCheckInOpen(true)}
        onOpenFinancial={onOpenFinancial}
        onOpenCaseDetails={onOpenCaseDetails}
        isOpen={isChatbotOpen}
        onToggleOpen={(open) => setIsChatbotOpen(open)}
      />

      {/* Modals */}
      <ComprehensiveCheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        caseItem={caseItem}
        language={language}
      />

      <VoiceCheckInModal
        isOpen={isVoiceCheckInOpen}
        onClose={() => setIsVoiceCheckInOpen(false)}
        caseItem={caseItem}
        initialLanguage={language}
      />

      <UrgentSupportModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
        caseItem={caseItem}
        currentUser={currentUser}
      />

      <GroundingModal
        isOpen={isGroundingOpen}
        onClose={() => setIsGroundingOpen(false)}
        language={language}
        victimAlias={caseItem.victimAlias}
      />

      <ExerciseTutorialModal
        isOpen={isExercisesInternalOpen}
        onClose={() => setIsExercisesInternalOpen(false)}
        language={language}
      />

      <CalculationDetailsModal
        isOpen={isCalculationOpen}
        onClose={() => setIsCalculationOpen(false)}
        caseItem={caseItem}
      />
    </div>
  );
};
