import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Scale, 
  HeartPulse, 
  Home, 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Filter, 
  Plus, 
  ChevronRight,
  UserCheck,
  Send,
  Calendar
} from 'lucide-react';
import { AtrocityCase, Intervention, InterventionCategory, InterventionStatus } from '../types';
import { AppStore } from '../services/storage';

interface DistrictDashboardProps {
  cases: AtrocityCase[];
  onSelectCase: (caseId: string) => void;
  onOpenFinancial?: () => void;
  onOpenNHAA?: () => void;
}

export const DistrictDashboard: React.FC<DistrictDashboardProps> = ({
  cases,
  onSelectCase,
  onOpenFinancial,
  onOpenNHAA,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [updatingInterventionId, setUpdatingInterventionId] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState('');

  // Collect all interventions across district cases
  const allInterventions: Array<{ caseItem: AtrocityCase; intervention: Intervention }> = [];
  cases.forEach(c => {
    c.interventions.forEach(i => {
      allInterventions.push({ caseItem: c, intervention: i });
    });
  });

  const filteredInterventions = allInterventions.filter(item => {
    const matchesCat = filterCategory === 'all' || item.intervention.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || item.intervention.status === filterStatus;
    return matchesCat && matchesStatus;
  });

  const handleUpdateStatus = (caseId: string, interventionId: string, newStatus: InterventionStatus) => {
    AppStore.updateInterventionStatus(caseId, interventionId, newStatus, statusNote || `Status updated to ${newStatus} by District Welfare Officer.`);
    setUpdatingInterventionId(null);
    setStatusNote('');
  };

  const getCategoryIcon = (cat: InterventionCategory) => {
    switch (cat) {
      case 'legal_aid': return <Scale className="w-4 h-4 text-indigo-600" />;
      case 'medical_aid': return <HeartPulse className="w-4 h-4 text-rose-600" />;
      case 'witness_protection': return <ShieldCheck className="w-4 h-4 text-amber-600" />;
      case 'relocation': return <Home className="w-4 h-4 text-emerald-600" />;
      case 'rehabilitation': return <Briefcase className="w-4 h-4 text-sky-600" />;
      default: return <Building2 className="w-4 h-4 text-stone-600" />;
    }
  };

  const highRiskCount = cases.filter(c => c.riskState === 'urgent' || c.riskState === 'high').length;
  const inProgressInterventions = allInterventions.filter(i => i.intervention.status === 'in_progress').length;
  const completedInterventions = allInterventions.filter(i => i.intervention.status === 'completed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-stone-900">
            District Welfare & Support Coordination
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Pune District Social Welfare Office · Inter-Departmental Relief & Protection Dispatch
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenFinancial && (
            <button
              onClick={onOpenFinancial}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span>Relief Sanctions &amp; DBT</span>
            </button>
          )}

          {onOpenNHAA && (
            <button
              onClick={onOpenNHAA}
              className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span>NHAA 14566 Gateway</span>
            </button>
          )}

          <span className="px-3 py-1.5 rounded-xl bg-stone-100 border border-stone-200 text-stone-700 text-xs font-medium">
            Officer Rajesh Deshmukh (Welfare Officer)
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
            Total Monitored Cases
          </span>
          <div className="font-mono text-2xl font-bold text-stone-900 tabular-nums">
            {cases.length}
          </div>
          <span className="text-[11px] text-stone-500">Across 14 talukas in Pune</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">
            High Distress / Escalations
          </span>
          <div className="font-mono text-2xl font-bold text-rose-700 tabular-nums">
            {highRiskCount}
          </div>
          <span className="text-[11px] text-rose-600 font-medium">Priority safety queue</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">
            Active Interventions
          </span>
          <div className="font-mono text-2xl font-bold text-amber-700 tabular-nums">
            {inProgressInterventions}
          </div>
          <span className="text-[11px] text-stone-500">Legal, Shelter & DMHP</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
            Relief & Rehab Completed
          </span>
          <div className="font-mono text-2xl font-bold text-emerald-700 tabular-nums">
            {completedInterventions}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">DBT Compensation credited</span>
        </div>
      </div>

      {/* Inter-Departmental Workflow Dashboard */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div className="space-y-0.5">
            <h2 className="font-display font-bold text-lg text-stone-900">
              Intervention Management & Department Dispatch
            </h2>
            <p className="text-xs text-stone-500">
              Track SLA deadlines, assign state departments, and record field casework actions
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-700"
            >
              <option value="all">All Service Categories</option>
              <option value="witness_protection">Witness Protection</option>
              <option value="legal_aid">Legal Aid</option>
              <option value="relocation">Safe Relocation</option>
              <option value="counselling">Psychosocial Counselling</option>
              <option value="rehabilitation">Economic Rehabilitation</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-700"
            >
              <option value="all">All Statuses</option>
              <option value="recommended">Recommended</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Interventions List */}
        <div className="space-y-3">
          {filteredInterventions.map(({ caseItem, intervention }) => (
            <div
              key={intervention.id}
              className="p-5 rounded-2xl bg-stone-50/70 border border-stone-200 hover:border-stone-300 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-white border border-stone-200 shadow-2xs">
                    {getCategoryIcon(intervention.category)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-900 text-sm">
                      {intervention.title}
                    </h3>
                    <p className="text-xs text-stone-500">
                      Case: <span className="font-mono font-medium text-stone-700">{caseItem.id}</span> ({caseItem.victimAlias}) · {caseItem.district}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                    intervention.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                    intervention.status === 'in_progress' ? 'bg-amber-100 text-amber-800' : 'bg-stone-200 text-stone-800'
                  }`}>
                    {intervention.status.replace('_', ' ')}
                  </span>
                  <button
                    onClick={() => onSelectCase(caseItem.id)}
                    className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-white transition-colors"
                    title="View Case Details"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-stone-700 leading-relaxed">
                {intervention.recommendationReason}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-200/60 text-[11px] text-stone-500">
                <span className="font-medium text-stone-700">
                  Assigned: {intervention.assignedDepartment}
                </span>

                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3 text-stone-400" />
                    Target: {new Date(intervention.targetDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>

                  {updatingInterventionId !== intervention.id ? (
                    <button
                      onClick={() => setUpdatingInterventionId(intervention.id)}
                      className="px-2.5 py-1 rounded-lg bg-stone-900 text-white font-medium hover:bg-stone-800 transition-colors cursor-pointer"
                    >
                      Update Status
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-stone-300">
                      <input
                        type="text"
                        placeholder="Action note..."
                        value={statusNote}
                        onChange={(e) => setStatusNote(e.target.value)}
                        className="px-2 py-1 text-xs border border-stone-200 rounded-lg w-40"
                      />
                      <button
                        onClick={() => handleUpdateStatus(caseItem.id, intervention.id, 'in_progress')}
                        className="px-2 py-1 bg-amber-600 text-white rounded text-[11px] font-medium"
                      >
                        In Progress
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(caseItem.id, intervention.id, 'completed')}
                        className="px-2 py-1 bg-emerald-600 text-white rounded text-[11px] font-medium"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => setUpdatingInterventionId(null)}
                        className="text-stone-400 hover:text-stone-600"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
