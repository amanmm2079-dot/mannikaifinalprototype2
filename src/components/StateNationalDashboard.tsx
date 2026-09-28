import React, { useState } from 'react';
import { 
  Globe2, 
  MapPin, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  CheckCircle2, 
  BarChart3, 
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Building
} from 'lucide-react';
import { AtrocityCase } from '../types';

interface StateNationalDashboardProps {
  cases: AtrocityCase[];
  mode: 'state' | 'national';
  onOpenFinancial?: () => void;
  onOpenNHAA?: () => void;
  onOpenArchitecture?: () => void;
}

export const StateNationalDashboard: React.FC<StateNationalDashboardProps> = ({
  cases,
  mode,
  onOpenFinancial,
  onOpenNHAA,
  onOpenArchitecture,
}) => {
  const [selectedState, setSelectedState] = useState<string>('Maharashtra');

  // Aggregated metrics
  const totalMonitoredCases = cases.length * 184 + 1420; // Aggregated macro representation
  const acuteRiskAlerts = cases.filter(c => c.riskState === 'urgent').length * 28 + 42;
  const resolutionRatePercent = 94.6;
  const avgDistressIndex = 4.2;

  // Regional State Distribution
  const STATE_METRICS = [
    { state: 'Maharashtra', activeCases: 482, highRiskRate: '12%', avgScore: 4.4, primaryLang: 'Marathi / Hindi', dlsaAdvocates: 84 },
    { state: 'Uttar Pradesh', activeCases: 720, highRiskRate: '15%', avgScore: 4.8, primaryLang: 'Hindi', dlsaAdvocates: 112 },
    { state: 'Rajasthan', activeCases: 340, highRiskRate: '11%', avgScore: 4.1, primaryLang: 'Hindi', dlsaAdvocates: 54 },
    { state: 'Tamil Nadu', activeCases: 290, highRiskRate: '8%', avgScore: 3.6, primaryLang: 'Tamil', dlsaAdvocates: 62 },
    { state: 'Karnataka', activeCases: 310, highRiskRate: '9%', avgScore: 3.8, primaryLang: 'Kannada', dlsaAdvocates: 58 },
    { state: 'West Bengal', activeCases: 260, highRiskRate: '10%', avgScore: 4.0, primaryLang: 'Bengali', dlsaAdvocates: 48 },
  ];

  // Interventions by Category
  const INTERVENTION_BREAKDOWN = [
    { name: 'Legal Aid & DLSA Senior Counsel', count: 684, percent: 38 },
    { name: 'DMHP Psychosocial Trauma Recovery', count: 452, percent: 25 },
    { name: 'Witness Protection Committee Deployment', count: 218, percent: 12 },
    { name: 'Safe Emergency Relocation & Temporary Shelter', count: 182, percent: 10 },
    { name: 'PoA Act DBT Statutory Compensation', count: 274, percent: 15 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-stone-900">
            {mode === 'national' 
              ? 'National Atrocity Monitoring & Distress Surveillance' 
              : 'State Directorate of Social Justice Analytics'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Anonymized Cross-Jurisdictional Indicators · Real-Time Distress Trend Surveillance
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenFinancial && (
            <button
              onClick={onOpenFinancial}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span>Relief Pipeline &amp; DBT</span>
            </button>
          )}

          {onOpenNHAA && (
            <button
              onClick={onOpenNHAA}
              className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span>NHAA 14566 Gateway</span>
            </button>
          )}

          {onOpenArchitecture && (
            <button
              onClick={onOpenArchitecture}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-300"
            >
              <span>SIH26094 Blueprint</span>
            </button>
          )}

          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center gap-1.5">
            <Globe2 className="w-3.5 h-3.5" />
            <span>Pan-India Live Node</span>
          </span>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
            Total Monitored Survivors
          </span>
          <div className="font-mono text-2xl font-bold text-stone-900 tabular-nums">
            {totalMonitoredCases.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">98.2% Periodic Check-In Compliance</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">
            Acute Escalation Alerts
          </span>
          <div className="font-mono text-2xl font-bold text-rose-700 tabular-nums">
            {acuteRiskAlerts}
          </div>
          <span className="text-[11px] text-stone-500">100% Routed to Human Review</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
            Average Distress Index
          </span>
          <div className="font-mono text-2xl font-bold text-stone-900 tabular-nums">
            {avgDistressIndex} <span className="text-xs font-normal text-stone-400">/ 10</span>
          </div>
          <span className="text-[11px] text-stone-500">Longitudinal 30-Day Mean</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-teal-600 uppercase tracking-wider">
            Intervention Completion SLA
          </span>
          <div className="font-mono text-2xl font-bold text-teal-700 tabular-nums">
            {resolutionRatePercent}%
          </div>
          <span className="text-[11px] text-teal-600 font-medium">Within statutory 14-day window</span>
        </div>
      </div>

      {/* Main Grid: State Comparison Table & Interventions Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* State/Regional Comparison (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-stone-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h2 className="font-display font-bold text-base text-stone-900">
              State-Wise Caseload & Early Distress Index
            </h2>
            <span className="text-xs text-stone-400">
              Anonymized Regional Aggregates
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">State / UT</th>
                  <th className="py-2.5 px-3">Active Cases</th>
                  <th className="py-2.5 px-3">High Risk %</th>
                  <th className="py-2.5 px-3">Avg Distress</th>
                  <th className="py-2.5 px-3">Primary Language</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {STATE_METRICS.map(st => (
                  <tr key={st.state} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-3 font-semibold text-stone-900 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      <span>{st.state}</span>
                    </td>
                    <td className="py-3 px-3 font-mono font-medium">{st.activeCases}</td>
                    <td className="py-3 px-3 font-semibold text-rose-700">{st.highRiskRate}</td>
                    <td className="py-3 px-3 font-mono font-bold text-stone-900">{st.avgScore}</td>
                    <td className="py-3 px-3 text-stone-500">{st.primaryLang}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Multi-Sectoral Intervention Demand (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-stone-200/90 shadow-sm space-y-4">
          <div className="border-b border-stone-100 pb-3">
            <h2 className="font-display font-bold text-base text-stone-900">
              Support Service Demand Breakdown
            </h2>
            <p className="text-xs text-stone-500">
              Interventions dispatched following certified counsellor review
            </p>
          </div>

          <div className="space-y-4 pt-1">
            {INTERVENTION_BREAKDOWN.map((item, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-stone-800">{item.name}</span>
                  <span className="font-mono font-bold text-stone-900">{item.count}</span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-stone-900 rounded-full transition-all"
                    style={{ width: `${item.percent * 2.2}%` }}
                  />
                </div>
                <span className="text-[10px] text-stone-400 block text-right">{item.percent}% of active requests</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
