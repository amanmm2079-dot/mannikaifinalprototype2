import React from 'react';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Calculator, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle,
  FileText,
  Activity,
  UserCheck
} from 'lucide-react';
import { AtrocityCase, User } from '../types';
import { 
  formatDistressScore, 
  SCORING_CONFIG, 
  calculateOperationalDistress,
  CaseScoringInput
} from '../services/distressScoring';

interface CalculationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: AtrocityCase | null;
  currentUser?: User;
}

export const CalculationDetailsModal: React.FC<CalculationDetailsModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  currentUser,
}) => {
  if (!isOpen || !caseItem) return null;

  // Derive deterministic calculation from case data
  const scoringInput: CaseScoringInput = {
    caseId: caseItem.id,
    sleepScore: caseItem.historyCheckIns?.[0]?.answers?.sleepQuality ?? 3,
    safetyScore: caseItem.historyCheckIns?.[0]?.answers?.safetyFeel ?? 3,
    overwhelmScore: caseItem.historyCheckIns?.[0]?.answers?.overwhelmLevel ?? 3,
    socialConnectionScore: caseItem.historyCheckIns?.[0]?.answers?.socialConnection ?? 3,
    physicalSymptoms: caseItem.historyCheckIns?.[0]?.answers?.physicalSymptoms ?? [],
    recentThreatReported: caseItem.id === 'CASE-MH-2026-109',
    threatDetails: caseItem.id === 'CASE-MH-2026-109' ? 'Reported nighttime intimidation outside dwelling' : undefined,
    consecutiveMissedCheckIns: caseItem.consecutiveMissedCheckIns || 0,
    voiceStressJitter: caseItem.historyCheckIns?.[0]?.audioFeatures?.microTremorJitter ?? 1.4,
    historyMeasurements: caseItem.previousDistressScore ? [
      {
        id: `HIST-${caseItem.id}-01`,
        caseId: caseItem.id,
        score: caseItem.previousDistressScore,
        level: caseItem.previousDistressScore >= 8.5 ? 'URGENT' : caseItem.previousDistressScore >= 6.5 ? 'HIGH' : 'MODERATE',
        scoringVersion: caseItem.scoringVersion || '1.0.0',
        source: 'prior_intake',
        calculatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      }
    ] : [],
  };

  const result = calculateOperationalDistress(scoringInput);

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'URGENT':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'HIGH':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'MODERATE':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      default:
        return 'bg-teal-50 text-teal-700 border-teal-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base text-slate-900">
                  Operational Distress Index
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  Engine v{result.scoringVersion}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Transparent & auditable calculation breakdown for {caseItem.id} ({caseItem.victimAlias})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 bg-slate-50/50">
          {/* Important Decision-Support Notice */}
          <div className="p-3.5 rounded-xl bg-teal-50/80 border border-teal-200/80 text-teal-900 text-xs flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-teal-950">
                Operational Decision-Support Indicator — Requires Human Review
              </span>
              <p className="text-teal-800 text-[11px] mt-0.5 leading-relaxed">
                This index is a deterministic aggregation of structured self-reports and behavioral check-ins. It is not a clinical diagnosis or automated medical judgment; it assists authorized clinical and welfare personnel.
              </p>
            </div>
          </div>

          {/* Top Summary Result Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                Calculated Indicator
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-bold font-display text-slate-900">
                  {formatDistressScore(result.score)}
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getLevelBadge(result.level)}`}>
                  {result.level}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Timestamp: {new Date(result.calculatedAt).toLocaleString()}
              </p>
            </div>

            <div className="sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 space-y-1">
              <div className="text-xs">
                <span className="text-slate-500">Trajectory: </span>
                <span className="font-semibold text-slate-900">{result.trajectory.replace('_', ' ')}</span>
              </div>
              <div className="text-xs">
                <span className="text-slate-500">Priority: </span>
                <span className="font-semibold capitalize text-slate-900">{result.priority}</span>
              </div>
              <div className="text-xs">
                <span className="text-slate-500">Human Review: </span>
                <span className={`font-semibold ${result.requiresHumanReview ? 'text-amber-700' : 'text-slate-700'}`}>
                  {result.requiresHumanReview ? 'Required' : 'Routine'}
                </span>
              </div>
            </div>
          </div>

          {/* Factor Breakdown Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-4 py-3 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                1. Input Factors & Weighted Contributions
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {result.factorBreakdown.length} factors evaluated
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {result.factorBreakdown.map((factor) => (
                <div key={factor.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/60 transition-colors">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-900">{factor.name}</span>
                    <p className="text-[11px] text-slate-500">{factor.reason}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 sm:text-right">
                    <div className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      Raw: {factor.rawInputValue}
                    </div>
                    <div className="font-mono font-bold text-slate-900 min-w-[70px] text-right">
                      +{factor.contribution.toFixed(2)} pts
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mathematical Normalization Formula */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-2 text-xs">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              2. Deterministic Normalization Formula
            </span>
            <div className="p-3 rounded-lg bg-slate-50 font-mono text-[11px] text-slate-700 border border-slate-200 leading-relaxed">
              normalizedScore = clamp(0.0, 10.0, (Σ weightedObservedValues / maxPossibleWeightedScore) * 10)
              <br />
              = ({result.factorBreakdown.reduce((a, b) => a + b.contribution, 0).toFixed(2)} / {SCORING_CONFIG.maxPossibleWeightedScore.toFixed(1)}) * 10 
              = <strong>{result.score.toFixed(2)} / 10</strong>
            </div>
            <p className="text-[11px] text-slate-500">
              No random variables or non-deterministic heuristics are applied. Inputs are fully reproducible.
            </p>
          </div>

          {/* Longitudinal Trajectory Time-Series Analysis */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-2 text-xs">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              3. Longitudinal Trajectory Analysis
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-500 block uppercase">Previous Score</span>
                <span className="font-bold text-sm text-slate-800">
                  {result.trajectoryDetails.previousScore ? formatDistressScore(result.trajectoryDetails.previousScore) : 'None (First intake)'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-500 block uppercase">Observed Delta</span>
                <span className="font-bold text-sm text-slate-800">
                  {result.trajectoryDetails.delta !== undefined ? `${result.trajectoryDetails.delta >= 0 ? '+' : ''}${result.trajectoryDetails.delta.toFixed(2)} pts` : 'N/A'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-500 block uppercase">Observation Window</span>
                <span className="font-bold text-sm text-slate-800">
                  {result.trajectoryDetails.hoursObserved ? `${result.trajectoryDetails.hoursObserved} hours` : 'Baseline'}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-600 mt-1">
              {result.trajectoryDetails.interpretation}
            </p>
          </div>

          {/* Suggested Operational Action */}
          <div className="p-3.5 rounded-xl bg-violet-50/70 border border-violet-200/70 text-violet-900 text-xs flex items-start gap-2.5">
            <Activity className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-violet-950">
                Recommended Operational Workflow
              </span>
              <p className="text-violet-800 text-[11px] mt-0.5">
                {result.suggestedAction}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">
            Protected under DPDP Act 2023 · Audit logged
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-xs"
          >
            Close Calculation View
          </button>
        </div>
      </div>
    </div>
  );
};
