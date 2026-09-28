import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Activity, 
  Clock, 
  Calendar, 
  FileText, 
  Mic, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Send,
  Building,
  Scale,
  HeartPulse,
  Home,
  Briefcase
} from 'lucide-react';
import { AtrocityCase, InterventionCategory } from '../types';
import { AppStore } from '../services/storage';

interface CaseDetailsModalProps {
  caseId: string | null;
  onClose: () => void;
}

export const CaseDetailsModal: React.FC<CaseDetailsModalProps> = ({
  caseId,
  onClose,
}) => {
  const [newNote, setNewNote] = useState('');
  const [showAddIntervention, setShowAddIntervention] = useState(false);
  const [newCategory, setNewCategory] = useState<InterventionCategory>('legal_aid');
  const [newTitle, setNewTitle] = useState('');
  const [newReason, setNewReason] = useState('');
  const [newDept, setNewDept] = useState('District Legal Services Authority (DLSA)');

  if (!caseId) return null;
  const caseItem = AppStore.getCaseById(caseId);
  if (!caseItem) return null;

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const user = AppStore.getCurrentUser();
    AppStore.logAudit({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: 'CASEWORKER_NOTE_ADDED',
      resourceType: 'case',
      resourceId: caseItem.id,
      details: `Added case management note: "${newNote.slice(0, 40)}..."`,
    });
    setNewNote('');
    alert('Case note recorded in tamper-evident log.');
  };

  const handleCreateIntervention = () => {
    if (!newTitle.trim()) return;
    AppStore.addIntervention(caseItem.id, {
      caseId: caseItem.id,
      victimAlias: caseItem.victimAlias,
      category: newCategory,
      title: newTitle,
      recommendationReason: newReason || 'Recommended by casework team following distress escalation.',
      priority: 'high',
      assignedDepartment: newDept,
      status: 'in_progress',
      targetDate: new Date(Date.now() + 86400000 * 7).toISOString(),
    });
    setShowAddIntervention(false);
    setNewTitle('');
    setNewReason('');
  };

  const getCategoryIcon = (cat: InterventionCategory) => {
    switch (cat) {
      case 'legal_aid': return <Scale className="w-4 h-4 text-indigo-600" />;
      case 'medical_aid': return <HeartPulse className="w-4 h-4 text-rose-600" />;
      case 'witness_protection': return <ShieldCheck className="w-4 h-4 text-amber-600" />;
      case 'relocation': return <Home className="w-4 h-4 text-emerald-600" />;
      case 'rehabilitation': return <Briefcase className="w-4 h-4 text-sky-600" />;
      default: return <Building className="w-4 h-4 text-stone-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-200 max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-800 text-teal-200 flex items-center justify-center font-display font-bold text-sm">
              {caseItem.state.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold text-white">
                  {caseItem.id}
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-white/20 text-white">
                  Alias: {caseItem.victimAlias}
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-400/30">
                  {caseItem.riskState} risk
                </span>
              </div>
              <p className="text-xs text-stone-400">
                {caseItem.district}, {caseItem.state} · {caseItem.incidentType}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] uppercase text-stone-400 tracking-wider block">Dynamic Distress Score</span>
              <span className="font-mono text-xl font-bold text-teal-300">{caseItem.currentDistressScore} / 10</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body (Two Column Desktop Layout) */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs text-stone-800">
          {/* LEFT COLUMN: AI Screening & Timeline (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Distress Score & Longitudinal Trajectory */}
            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-teal-700" />
                  <span>Longitudinal Distress Trajectory</span>
                </span>
                <span className="font-medium text-stone-500 text-[11px] capitalize">
                  Trend: {caseItem.trajectory.replace('_', ' ')}
                </span>
              </div>

              {/* Sparkline & Score comparisons */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-white rounded-xl border border-stone-200 text-center">
                  <span className="text-stone-400 text-[10px] block uppercase">Current</span>
                  <span className="font-mono text-lg font-bold text-stone-900">{caseItem.currentDistressScore}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-stone-200 text-center">
                  <span className="text-stone-400 text-[10px] block uppercase">Previous</span>
                  <span className="font-mono text-lg font-bold text-stone-600">{caseItem.previousDistressScore}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-stone-200 text-center">
                  <span className="text-stone-400 text-[10px] block uppercase">Delta</span>
                  <span className={`font-mono text-lg font-bold ${caseItem.scoreChange > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {caseItem.scoreChange > 0 ? `+${caseItem.scoreChange}` : caseItem.scoreChange}
                  </span>
                </div>
              </div>

              {/* Check-In History List */}
              <div className="space-y-2 pt-2">
                <span className="font-semibold text-stone-700 text-[11px] block">
                  Check-In Submissions Timeline
                </span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {caseItem.historyCheckIns.map((chk) => (
                    <div key={chk.id} className="p-3 bg-white rounded-xl border border-stone-200 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-stone-900 flex items-center gap-1">
                          {chk.channel === 'voice' && <Mic className="w-3.5 h-3.5 text-rose-500" />}
                          <span className="uppercase">{chk.channel} check-in</span>
                        </span>
                        <span className="font-mono text-stone-400">
                          {new Date(chk.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-stone-700 italic">"{chk.textResponse}"</p>
                      
                      {chk.audioFeatures && (
                        <div className="pt-1 flex gap-3 text-[10px] text-stone-500 font-mono">
                          <span>Jitter: {chk.audioFeatures.microTremorJitter}%</span>
                          <span>Pauses: {chk.audioFeatures.pauseDensity}%</span>
                          <span>WPM: {chk.audioFeatures.speechRateWpm}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Explainability Contributing Factors */}
            <div className="p-5 rounded-2xl bg-teal-50/60 border border-teal-200/80 space-y-2">
              <span className="font-semibold text-teal-900 uppercase tracking-wider text-[11px] block">
                Explainable AI Contributing Signals
              </span>
              <p className="text-[11px] text-teal-800">
                The Dynamic Distress Score was calculated from multimodal signals using the Mannik AcousticNLP engine:
              </p>
              <ul className="list-disc list-inside space-y-1 text-stone-700">
                {caseItem.recentAssessments[0]?.contributingFactors.map((fact, idx) => (
                  <li key={idx}>{fact}</li>
                )) || <li>Baseline metrics normal</li>}
              </ul>
              <div className="pt-2 text-[10px] text-stone-400">
                Model: Mannik-AcousticNLP-v2.6 · Screening indicator only · Requires certified human clinician validation
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Human Interventions & Caseworker Actions (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Multi-Sectoral Interventions */}
            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-900 uppercase tracking-wider text-[11px]">
                  Multi-Sectoral Interventions
                </span>
                <button
                  onClick={() => setShowAddIntervention(!showAddIntervention)}
                  className="px-2.5 py-1 rounded-lg bg-stone-900 text-white text-[11px] font-medium flex items-center gap-1 hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add</span>
                </button>
              </div>

              {/* Add Intervention Form Drawer */}
              {showAddIntervention && (
                <div className="p-3 bg-white rounded-xl border border-stone-300 space-y-2 animate-in fade-in">
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as InterventionCategory)}
                    className="w-full p-2 rounded-lg border border-stone-200 text-xs"
                  >
                    <option value="legal_aid">Legal Aid (DLSA Advocate)</option>
                    <option value="witness_protection">Witness Protection Unit</option>
                    <option value="relocation">Safe Relocation & Shelter</option>
                    <option value="counselling">Psychosocial Counselling</option>
                    <option value="medical_aid">Medical Aid Support</option>
                    <option value="financial_assistance">PoA Act Relief Grant</option>
                    <option value="rehabilitation">Economic Rehabilitation</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Intervention Title (e.g. Free DLSA Advocate)"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full p-2 rounded-lg border border-stone-200 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Assigned Department"
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full p-2 rounded-lg border border-stone-200 text-xs"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setShowAddIntervention(false)}
                      className="px-2.5 py-1 text-stone-500 hover:text-stone-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateIntervention}
                      className="px-3 py-1 bg-stone-900 text-white rounded-lg font-medium"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              )}

              {/* Interventions List */}
              <div className="space-y-2">
                {caseItem.interventions.map((intv) => (
                  <div key={intv.id} className="p-3 bg-white rounded-xl border border-stone-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-semibold text-stone-900">
                        {getCategoryIcon(intv.category)}
                        <span className="truncate">{intv.title}</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800">
                        {intv.status}
                      </span>
                    </div>
                    <p className="text-stone-600 text-[11px]">{intv.recommendationReason}</p>
                    <span className="text-stone-400 text-[10px] block">
                      Assigned: {intv.assignedDepartment}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Official Caseworker Notes Log */}
            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <span className="font-semibold text-stone-900 uppercase tracking-wider text-[11px] block">
                Caseworker & Official Action Notes
              </span>
              <div className="space-y-2">
                <textarea
                  rows={2}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Record case notes, coordination with police, or shelter updates..."
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 bg-white"
                />
                <button
                  onClick={handleAddNote}
                  className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-medium transition-colors cursor-pointer"
                >
                  Log Secure Case Note
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-stone-500 text-[11px]">
          <span>Assigned Counsellor: {caseItem.assignedCounsellorName}</span>
          <span>Caseworker: {caseItem.assignedCaseworkerName}</span>
        </div>
      </div>
    </div>
  );
};
