import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Activity, 
  Sparkles, 
  Search, 
  Filter, 
  Clock, 
  Mic, 
  Phone, 
  Calendar, 
  ArrowUpRight, 
  Check, 
  X, 
  Volume2, 
  ChevronDown, 
  Layers, 
  HelpCircle, 
  Eye, 
  Calculator,
  UserCheck,
  HeartHandshake,
  TrendingUp,
  Inbox,
  Sparkle,
  PhoneCall,
  CalendarPlus,
  Send,
  SlidersHorizontal,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react';
import { AtrocityCase, CaseAlert, ScoreTrajectory } from '../types';
import { AppStore } from '../services/storage';
import { SosService } from '../services/sosService';
import { formatDistressScore } from '../services/distressScoring';
import { CalculationDetailsModal } from './CalculationDetailsModal';
import { 
  HeroCollaborationIllustration, 
  PipelineFlowIllustration, 
  HumanSupportCareIllustration 
} from './illustrations/CareIllustrations';
import clinicalTeamCare from '../assets/images/clinical_team_care_1790578984715.jpg';

interface CounsellorDashboardProps {
  cases: AtrocityCase[];
  onSelectCase: (caseId: string) => void;
}

export const CounsellorDashboard: React.FC<CounsellorDashboardProps> = ({
  cases,
  onSelectCase,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterTrajectory, setFilterTrajectory] = useState<string>('all');
  const [filterDistrict, setFilterDistrict] = useState<string>('all');
  const [filterSupportNeeded, setFilterSupportNeeded] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const [selectedAlertForReview, setSelectedAlertForReview] = useState<{
    caseId: string;
    alert: CaseAlert;
  } | null>(null);
  const [selectedCaseForCalculation, setSelectedCaseForCalculation] = useState<AtrocityCase | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Follow-Up modal state
  const [followUpCase, setFollowUpCase] = useState<AtrocityCase | null>(null);
  const [followUpDate, setFollowUpDate] = useState<string>(
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );
  const [followUpNotes, setFollowUpNotes] = useState('');

  // Contact modal state
  const [contactCase, setContactCase] = useState<AtrocityCase | null>(null);
  const [contactMode, setContactMode] = useState<'phone' | 'sms' | 'visit'>('phone');
  const [contactMessage, setContactMessage] = useState('');

  // Unique districts for filter
  const districts = Array.from(new Set(cases.map(c => c.district)));

  // Collect all alerts requiring human review
  const allAlerts = cases.flatMap(c => 
    c.activeAlerts.map(a => ({ caseItem: c, alert: a }))
  );

  const pendingAlerts = allAlerts.filter(item => 
    item.alert.status === 'new' || item.alert.status === 'under_review' || item.alert.status === 'action_required'
  );

  const urgentCases = cases.filter(c => c.riskState === 'urgent');
  const highCases = cases.filter(c => c.riskState === 'high');
  const totalInterventions = cases.reduce((acc, c) => acc + (c.interventions?.length || 0), 0);

  // Helper to determine support needed text
  const getSupportNeeded = (c: AtrocityCase): string => {
    if (c.activeAlerts.some(a => a.status === 'new' || a.priority === 'urgent')) {
      return 'Urgent Clinical Review';
    }
    if (c.interventions.some(i => i.category === 'legal_aid' || i.category === 'witness_protection')) {
      return 'Witness Protection & DLSA';
    }
    if (c.interventions.some(i => i.category === 'financial_assistance')) {
      return 'DBT Compensation Follow-up';
    }
    if (c.consecutiveMissedCheckIns >= 2) {
      return 'Outreach: Missed Check-Ins';
    }
    return 'Routine Monitoring';
  };

  // Helper to get compact human indicator
  const getIndicatorBadge = (score: number) => {
    if (score >= 8.5) return { label: 'Review Needed', color: 'bg-rose-50 text-rose-800 border-rose-200' };
    if (score >= 6.5) return { label: 'Monitoring', color: 'bg-amber-50 text-amber-800 border-amber-200' };
    return { label: 'Stable', color: 'bg-teal-50 text-teal-800 border-teal-200' };
  };

  const filteredCases = cases.filter(c => {
    const matchesSearch = 
      c.victimAlias.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.district.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPriority = filterPriority === 'all' || c.riskState === filterPriority;
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchesTrajectory = filterTrajectory === 'all' || c.trajectory === filterTrajectory;
    const matchesDistrict = filterDistrict === 'all' || c.district === filterDistrict;
    
    let matchesSupport = true;
    if (filterSupportNeeded === 'urgent') {
      matchesSupport = c.riskState === 'urgent' || c.activeAlerts.some(a => a.priority === 'urgent');
    } else if (filterSupportNeeded === 'action_needed') {
      matchesSupport = c.activeAlerts.length > 0 || c.consecutiveMissedCheckIns > 0;
    }

    return matchesSearch && matchesPriority && matchesStatus && matchesTrajectory && matchesDistrict && matchesSupport;
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleValidateAlert = (caseId: string, alertId: string, approveIntervention: boolean = true) => {
    AppStore.updateAlertStatus(
      caseId, 
      alertId, 
      'action_required', 
      reviewNotes || 'Counsellor validated acute distress signals. Escalation protocol confirmed for caseworker assignment.'
    );

    if (approveIntervention) {
      AppStore.addIntervention(caseId, {
        caseId,
        victimAlias: cases.find(c => c.id === caseId)?.victimAlias || 'Victim',
        category: 'counselling',
        title: 'Immediate Trauma Stabilization & Somatic Outreach',
        recommendationReason: 'Human counsellor confirmed acute distress escalation warranting prioritized telehealth session.',
        priority: 'urgent',
        assignedDepartment: 'District Mental Health Programme (DMHP) Trauma Cell',
        status: 'in_progress',
        targetDate: new Date(Date.now() + 86400000).toISOString(),
      });
    }

    showToast('Alert validated and intervention prioritized in human review queue.');
    setSelectedAlertForReview(null);
    setReviewNotes('');
  };

  const handleMarkFalsePositive = (caseId: string, alertId: string) => {
    const reason = reviewNotes || 'Telephone check conducted. Victim confirmed environmental noise or transient event without psychological harm.';
    AppStore.updateAlertStatus(caseId, alertId, 'false_positive', reason);
    showToast('Alert resolved as False Positive. Recorded in audit ledger.');
    setSelectedAlertForReview(null);
    setReviewNotes('');
  };

  const handleScheduleFollowUp = () => {
    if (!followUpCase) return;
    const allCases = AppStore.getCases();
    const target = allCases.find(c => c.id === followUpCase.id);
    if (target) {
      target.nextScheduledCheckIn = new Date(followUpDate).toISOString();
      AppStore.saveCases(allCases);
    }

    AppStore.logAudit({
      actorId: 'usr-counsellor-01',
      actorName: 'Dr. Ananya Sen',
      actorRole: 'counsellor',
      action: 'FOLLOW_UP_SCHEDULED',
      resourceType: 'case',
      resourceId: followUpCase.id,
      details: `Scheduled follow-up contact for ${followUpDate}. Notes: ${followUpNotes || 'Routine follow-up'}`,
    });

    showToast(`Follow-up scheduled for Case ${followUpCase.id} on ${followUpDate}.`);
    setFollowUpCase(null);
    setFollowUpNotes('');
  };

  const handleSendContact = () => {
    if (!contactCase) return;
    AppStore.logAudit({
      actorId: 'usr-counsellor-01',
      actorName: 'Dr. Ananya Sen',
      actorRole: 'counsellor',
      action: 'CASEWORKER_CONTACT_DISPATCHED',
      resourceType: 'case',
      resourceId: contactCase.id,
      details: `Contact initiated via ${contactMode.toUpperCase()}. Note: ${contactMessage || 'Standard wellbeing inquiry'}`,
    });

    showToast(`Outreach initiated to ${contactCase.victimAlias} via ${contactMode.toUpperCase()}.`);
    setContactCase(null);
    setContactMessage('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-7 bg-[#faf9f6] text-stone-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-stone-700 text-xs flex items-center gap-2 animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* DASHBOARD HEADER */}
      <section className="relative overflow-hidden rounded-3xl bg-white p-6 sm:p-8 border border-stone-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Subtle background image gradient overlay */}
        <div className="absolute right-0 top-0 bottom-0 w-full sm:w-1/2 opacity-15 pointer-events-none overflow-hidden">
          <img 
            src={clinicalTeamCare} 
            alt="Supportive multidisciplinary clinical care" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-linear-to-r from-white via-white/80 to-transparent" />
        </div>

        <div className="space-y-3 max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-900 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
            <span>Dedicated Caseworker Workspace</span>
          </div>

          <h1 className="font-display font-bold text-2xl sm:text-3xl text-stone-900 tracking-tight">
            Caseworker Review &amp; Human Intervention Queue
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Monitor assigned cases, validate AI-assisted acoustic and longitudinal signals, coordinate multi-sectoral legal protection, and schedule personal follow-ups.
          </p>

          <div className="flex items-center gap-4 pt-1 text-xs text-stone-500">
            <span className="flex items-center gap-1.5 font-semibold text-rose-700">
              <ShieldAlert className="w-4 h-4" />
              <span>{pendingAlerts.length} Pending Human Reviews</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5 font-semibold text-teal-800">
              <Activity className="w-4 h-4" />
              <span>{cases.length} Total Caseload</span>
            </span>
          </div>
        </div>

        <div className="shrink-0 flex items-center justify-center relative z-10">
          <HeroCollaborationIllustration className="w-48 h-32 drop-shadow-xs" />
        </div>
      </section>

      {/* STATS OVERVIEW CARDS */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">Assigned Caseload</span>
          <span className="text-2xl font-bold font-display text-stone-900 block">{cases.length}</span>
          <span className="text-[11px] text-teal-700 font-medium">+3 new intakes</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">Pending Review</span>
          <span className="text-2xl font-bold font-display text-amber-700 block">{pendingAlerts.length}</span>
          <span className="text-[11px] text-amber-800 font-medium">Human validation required</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">Urgent Cases</span>
          <span className="text-2xl font-bold font-display text-rose-700 block">{urgentCases.length}</span>
          <span className="text-[11px] text-rose-800 font-medium">Active escalation</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">Active Interventions</span>
          <span className="text-2xl font-bold font-display text-teal-800 block">{totalInterventions}</span>
          <span className="text-[11px] text-teal-700 font-medium">Witness protection &amp; relief</span>
        </div>
      </section>

      {/* HUMAN-IN-THE-LOOP CLINICAL REVIEW QUEUE */}
      <section className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold uppercase tracking-wider">
                Action Required
              </span>
              <span className="text-xs text-stone-400">·</span>
              <span className="text-xs text-stone-500 font-medium">{pendingAlerts.length} Pending Review</span>
            </div>
            <h2 className="font-display font-bold text-lg text-stone-900 mt-1">
              Human-in-the-Loop Review Queue
            </h2>
          </div>
          <span className="text-xs text-stone-400">
            Algorithms flag signals; certified clinicians decide actions.
          </span>
        </div>

        {pendingAlerts.length === 0 ? (
          <div className="p-8 text-center bg-stone-50 rounded-2xl border border-stone-200 text-stone-500 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <span className="font-bold text-stone-800 block">All Urgent Alerts Reviewed</span>
            <span>No pending clinical validations currently in queue.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingAlerts.map(({ caseItem, alert }) => (
              <div
                key={alert.id}
                className="p-5 rounded-2xl bg-stone-50/60 border border-stone-200/90 hover:border-stone-300 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-rose-700">
                      {alert.id} · Case {caseItem.id}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] uppercase">
                      {alert.priority}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-stone-900">
                    {caseItem.victimAlias}
                    <span className="text-xs font-normal text-stone-500 ml-2">({caseItem.district}, {caseItem.state})</span>
                  </h3>

                  <p className="text-xs text-stone-700 leading-relaxed bg-white p-3 rounded-xl border border-stone-200/70">
                    {alert.reason}
                  </p>

                  <div className="text-[11px] text-stone-500 space-y-0.5">
                    <span className="font-semibold block text-stone-700">Triggering Factors:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-stone-600">
                      {alert.triggeringFactors.slice(0, 2).map((tf, idx) => (
                        <li key={idx} className="line-clamp-1">{tf}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-stone-200/80">
                  <button
                    onClick={() => {
                      setSelectedAlertForReview({ caseId: caseItem.id, alert });
                      setReviewNotes('');
                    }}
                    className="flex-1 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                  >
                    Conduct Human Review
                  </button>
                  <button
                    onClick={() => setSelectedCaseForCalculation(caseItem)}
                    className="p-2 bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-xl cursor-pointer"
                    title="View Calculation"
                  >
                    <Calculator className="w-4 h-4 text-teal-700" />
                  </button>
                  <button
                    onClick={() => onSelectCase(caseItem.id)}
                    className="p-2 bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-xl cursor-pointer"
                    title="View Full Case"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CASEWORKER SEARCH & MULTI-CRITERIA FILTERS */}
      <section className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-bold text-lg text-stone-900">
              Assigned Cases Directory
            </h2>
            <p className="text-xs text-stone-500">
              Filter by priority, operational status, trajectory, or support requirements
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <div className="p-1 bg-stone-100 rounded-xl flex items-center gap-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                  viewMode === 'cards' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                  viewMode === 'table' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search alias, case ID, district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-teal-700 text-xs text-stone-800 placeholder:text-stone-400 bg-stone-50/50"
            />
          </div>

          {/* Filter Priority */}
          <div>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-teal-700 text-xs text-stone-800 bg-stone-50/50 cursor-pointer"
            >
              <option value="all">Priority: All</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="moderate">Moderate</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Filter Status */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-teal-700 text-xs text-stone-800 bg-stone-50/50 cursor-pointer"
            >
              <option value="all">Status: All</option>
              <option value="active_monitoring">Active Monitoring</option>
              <option value="under_human_review">Under Human Review</option>
              <option value="intervention_active">Intervention Active</option>
              <option value="rehabilitated_stable">Rehabilitated Stable</option>
            </select>
          </div>

          {/* Filter Trajectory */}
          <div>
            <select
              value={filterTrajectory}
              onChange={(e) => setFilterTrajectory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-teal-700 text-xs text-stone-800 bg-stone-50/50 cursor-pointer"
            >
              <option value="all">Trajectory: All</option>
              <option value="acute_spike">Acute Spike</option>
              <option value="gradual_increase">Gradual Increase</option>
              <option value="stable">Stable</option>
              <option value="improving">Improving</option>
            </select>
          </div>

          {/* Filter Support Needed */}
          <div>
            <select
              value={filterSupportNeeded}
              onChange={(e) => setFilterSupportNeeded(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-teal-700 text-xs text-stone-800 bg-stone-50/50 cursor-pointer"
            >
              <option value="all">Support: All</option>
              <option value="urgent">Urgent Support</option>
              <option value="action_needed">Action Needed</option>
            </select>
          </div>
        </div>

        {/* RESULTS SECTION: DEDICATED CASEWORKER CASE CARDS */}
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {filteredCases.map((c) => {
              const indicator = getIndicatorBadge(c.currentDistressScore);
              const supportNeeded = getSupportNeeded(c);
              const lastCheckIn = c.lastCheckInDate ? new Date(c.lastCheckInDate).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Pending';
              const followUpDue = new Date(c.nextScheduledCheckIn).toLocaleDateString([], { month: 'short', day: 'numeric' });

              return (
                <div
                  key={c.id}
                  className="rounded-2xl bg-white border border-stone-200/90 hover:border-stone-300 shadow-2xs hover:shadow-xs transition-all p-5 flex flex-col justify-between space-y-4"
                >
                  {/* Top: Header with Case ID & Priority */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded-lg">
                        {c.id}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                        c.riskState === 'urgent' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                        c.riskState === 'high' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                        'bg-teal-50 text-teal-800 border-teal-200'
                      }`}>
                        {c.riskState}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-stone-900">
                        {c.victimAlias}
                      </h3>
                      <p className="text-xs text-stone-500">
                        {c.district}, {c.state} · <span className="font-mono">{c.incidentType}</span>
                      </p>
                    </div>

                    {/* Compact Indicator & Trajectory */}
                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-200/70 text-xs">
                      <div>
                        <span className="text-[10px] text-stone-400 block font-semibold uppercase">Indicator</span>
                        <span className="font-bold text-stone-900">{indicator.label}</span>
                        <span className="text-[10px] text-stone-400 block font-mono">
                          {c.currentDistressScore.toFixed(1)} / 10.0
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-400 block font-semibold uppercase">Trajectory</span>
                        <span className="font-bold text-stone-900 capitalize">
                          {c.trajectory.replace('_', ' ')}
                        </span>
                        <span className={`text-[10px] block ${c.scoreChange > 0 ? 'text-amber-700' : 'text-teal-700'}`}>
                          {c.scoreChange > 0 ? `+${c.scoreChange}` : c.scoreChange} pts
                        </span>
                      </div>
                    </div>

                    {/* Operational Metadata */}
                    <div className="space-y-1 text-xs text-stone-600 pt-1">
                      <div className="flex justify-between">
                        <span className="text-stone-400 text-[11px]">Last Check-In:</span>
                        <span className="font-medium text-stone-800">{lastCheckIn}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400 text-[11px]">Follow-Up Due:</span>
                        <span className="font-medium text-teal-800">{followUpDue}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400 text-[11px]">Support Needed:</span>
                        <span className="font-semibold text-stone-900 text-right truncate max-w-[150px]">{supportNeeded}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400 text-[11px]">Assigned Counsellor:</span>
                        <span className="text-stone-700 truncate max-w-[150px]">{c.assignedCounsellorName}</span>
                      </div>
                    </div>
                  </div>

                  {/* 5 Required Caseworker Action Buttons */}
                  <div className="pt-2 border-t border-stone-200/80 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onSelectCase(c.id)}
                        className="py-1.5 px-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-[11px] font-bold transition-colors cursor-pointer text-center"
                      >
                        Open Case
                      </button>
                      <button
                        onClick={() => {
                          const topAlert = c.activeAlerts[0] || {
                            id: `ALT-${c.id.slice(-4)}`,
                            caseId: c.id,
                            victimAlias: c.victimAlias,
                            district: c.district,
                            state: c.state,
                            priority: c.riskState,
                            status: 'new',
                            currentDistressScore: c.currentDistressScore,
                            previousScore: c.previousDistressScore,
                            trajectory: c.trajectory,
                            reason: 'Routine clinical verification checkpoint',
                            triggeringFactors: ['Periodic longitudinal review'],
                            assignedCounsellorId: c.assignedCounsellorId,
                            assignedCaseworkerId: c.assignedCaseworkerId,
                            createdAt: new Date().toISOString(),
                          };
                          setSelectedAlertForReview({ caseId: c.id, alert: topAlert });
                        }}
                        className="py-1.5 px-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-[11px] font-bold transition-colors cursor-pointer text-center"
                      >
                        Review
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                      <button
                        onClick={() => setContactCase(c)}
                        className="py-1.5 px-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <PhoneCall className="w-3 h-3 text-stone-600" />
                        <span>Contact</span>
                      </button>

                      <button
                        onClick={() => setFollowUpCase(c)}
                        className="py-1.5 px-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <CalendarPlus className="w-3 h-3 text-teal-700" />
                        <span>Follow-Up</span>
                      </button>

                      <button
                        onClick={() => onSelectCase(c.id)}
                        className="py-1.5 px-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <Eye className="w-3 h-3 text-sky-700" />
                        <span>Timeline</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-y border-stone-200">
                <tr>
                  <th className="py-3 px-4">Case ID</th>
                  <th className="py-3 px-4">Protected Alias</th>
                  <th className="py-3 px-4">District</th>
                  <th className="py-3 px-4">Indicator</th>
                  <th className="py-3 px-4">Trajectory</th>
                  <th className="py-3 px-4">Support Needed</th>
                  <th className="py-3 px-4">Follow-Up Due</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredCases.map(c => {
                  const indicator = getIndicatorBadge(c.currentDistressScore);
                  return (
                    <tr key={c.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-stone-900">{c.id}</td>
                      <td className="py-3 px-4 font-bold text-stone-900">{c.victimAlias}</td>
                      <td className="py-3 px-4 text-stone-600">{c.district}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${indicator.color}`}>
                          {indicator.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 capitalize">{c.trajectory.replace('_', ' ')}</td>
                      <td className="py-3 px-4 text-stone-700">{getSupportNeeded(c)}</td>
                      <td className="py-3 px-4 text-teal-800 font-medium">
                        {new Date(c.nextScheduledCheckIn).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        <button
                          onClick={() => onSelectCase(c.id)}
                          className="px-2 py-1 text-[11px] font-semibold bg-stone-900 text-white rounded-lg cursor-pointer"
                        >
                          Open
                        </button>
                        <button
                          onClick={() => setContactCase(c)}
                          className="px-2 py-1 text-[11px] font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg cursor-pointer"
                        >
                          Contact
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Human Review Modal Dialog */}
      {selectedAlertForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
            <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <div>
                  <h3 className="font-display font-bold text-sm text-white">
                    Conduct Clinical Human Review
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    Case {selectedAlertForReview.caseId} · {selectedAlertForReview.alert.id}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAlertForReview(null)}
                className="p-1 text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-1">
                <span className="font-semibold text-stone-700">Flagged Reason:</span>
                <p className="text-stone-600">{selectedAlertForReview.alert.reason}</p>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-stone-800 block">
                  Clinician Assessment &amp; Action Notes:
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Record verbal observations, telephonic check notes, and justification for welfare dispatch..."
                  rows={3}
                  className="w-full p-3 rounded-xl border border-stone-300 text-xs text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleValidateAlert(selectedAlertForReview.caseId, selectedAlertForReview.alert.id, true)}
                  className="flex-1 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Confirm Escalation &amp; Dispatch Care
                </button>
                <button
                  onClick={() => handleMarkFalsePositive(selectedAlertForReview.caseId, selectedAlertForReview.alert.id)}
                  className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Mark False Positive
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Follow-Up Modal */}
      {followUpCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
            <div className="px-6 py-4 bg-teal-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarPlus className="w-5 h-5 text-teal-300" />
                <h3 className="font-display font-bold text-sm text-white">
                  Schedule Follow-Up ({followUpCase.victimAlias})
                </h3>
              </div>
              <button onClick={() => setFollowUpCase(null)} className="p-1 text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">Follow-Up Target Date:</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-xs text-stone-800"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">Action / Objective Notes:</label>
                <textarea
                  rows={3}
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                  placeholder="e.g. Inquire regarding special court date transportation and DBT second installment..."
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-xs text-stone-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setFollowUpCase(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleScheduleFollowUp}
                  className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl font-bold cursor-pointer"
                >
                  Save Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact / Outreach Modal */}
      {contactCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
            <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-teal-400" />
                <h3 className="font-display font-bold text-sm text-white">
                  Contact Survivor ({contactCase.victimAlias})
                </h3>
              </div>
              <button onClick={() => setContactCase(null)} className="p-1 text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-stone-700 block">Communication Channel:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'phone', label: 'Telephone Call' },
                    { id: 'sms', label: 'Govt SMS Gateway' },
                    { id: 'visit', label: 'In-person Visit' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setContactMode(m.id as any)}
                      className={`p-2 rounded-xl border text-center text-xs font-semibold cursor-pointer ${
                        contactMode === m.id
                          ? 'bg-teal-50 border-teal-700 text-teal-900'
                          : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">Outreach Message / Telephony Cue:</label>
                <textarea
                  rows={3}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Record communication note or SMS payload..."
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-xs text-stone-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setContactCase(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendContact}
                  className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Outreach</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calculation Details Modal */}
      <CalculationDetailsModal
        isOpen={Boolean(selectedCaseForCalculation)}
        onClose={() => setSelectedCaseForCalculation(null)}
        caseItem={selectedCaseForCalculation}
      />
    </div>
  );
};
