import React from 'react';
import { 
  Network, 
  Cpu, 
  ShieldCheck, 
  Users, 
  ArrowRight, 
  Database, 
  Lock, 
  HeartHandshake, 
  IndianRupee, 
  Scale, 
  X,
  FileCheck,
  Activity,
  Layers
} from 'lucide-react';

interface SystemArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemArchitectureModal: React.FC<SystemArchitectureModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full border border-stone-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="bg-stone-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600/30 border border-teal-500/40 flex items-center justify-center text-teal-300">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-lg text-white">
                  SIH26094 System Architecture &amp; Complete Workflow Blueprint
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-700/60">
                  Ministry of Social Justice &amp; Empowerment
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                AI-Powered Dynamic Distress Monitoring, Human-in-the-Loop Intervention &amp; Longitudinal Care
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8 max-h-[78vh] overflow-y-auto text-stone-800">
          {/* Section 1: End-to-End Chronological Workflow */}
          <div className="space-y-4">
            <h4 className="font-display font-bold text-base text-stone-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-700" />
              <span>1. Complete Chronological System Workflow</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {/* Step 1 */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded border border-teal-200 inline-block">
                  Stage 1: Multi-Channel Intake
                </span>
                <h5 className="font-bold text-stone-900 text-sm">Grievance Sync &amp; Case Ingestion</h5>
                <p className="text-stone-600 leading-relaxed">
                  Pulls registered complaints from NHAA 14566, Web Portal, IVRS voice, or Mobile App. Idempotent gateway ensures zero duplication.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider bg-sky-50 px-2 py-0.5 rounded border border-sky-200 inline-block">
                  Stage 2: Consent &amp; Pulse Outreach
                </span>
                <h5 className="font-bold text-stone-900 text-sm">Periodic Multilingual Check-ins</h5>
                <p className="text-stone-600 leading-relaxed">
                  Scheduled low-friction pulse queries in survivor's regional language via Web, WhatsApp, SMS, or automated telephone IVRS.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 inline-block">
                  Stage 3: AI Feature Extraction
                </span>
                <h5 className="font-bold text-stone-900 text-sm">NLP &amp; Acoustic Analysis</h5>
                <p className="text-stone-600 leading-relaxed">
                  Analyzes sentiment, sleep disruption, fear signals, and voice jitter without clinical diagnostic labels.
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
                  Stage 4: Longitudinal Trajectory
                </span>
                <h5 className="font-bold text-stone-900 text-sm">Trend &amp; Escalation Engine</h5>
                <p className="text-stone-600 leading-relaxed">
                  Compares current response against personal baseline. Stratifies into Stable, Gradual Rise, or Acute Spike.
                </p>
              </div>

              {/* Step 5 */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded border border-rose-200 inline-block">
                  Stage 5: Human-in-the-Loop
                </span>
                <h5 className="font-bold text-stone-900 text-sm">Clinical &amp; Welfare Review</h5>
                <p className="text-stone-600 leading-relaxed">
                  Lead Clinical Counsellor reviews flagged cases, validates evidence, and dispatches structured human care.
                </p>
              </div>

              {/* Step 6 */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                  Stage 6: Statutory Relief &amp; Rehab
                </span>
                <h5 className="font-bold text-stone-900 text-sm">Financial &amp; Legal Support</h5>
                <p className="text-stone-600 leading-relaxed">
                  Tracks DBT relief installments under SC/ST PoA rules, DLSA free legal aid, safe housing relocation, and audits.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Core Tech Stack */}
          <div className="space-y-4 border-t border-stone-200 pt-6">
            <h4 className="font-display font-bold text-base text-stone-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-teal-700" />
              <span>2. Core Technology Stack &amp; Governance</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-1">
                <span className="text-[10px] text-stone-400 uppercase font-bold">Frontend Interface</span>
                <span className="font-bold text-stone-900 block text-sm">React 19 + TypeScript</span>
                <span className="text-stone-500 text-[11px] block">Tailwind CSS · Lucide · Zero-PII masking</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-1">
                <span className="text-[10px] text-stone-400 uppercase font-bold">Identity &amp; Database</span>
                <span className="font-bold text-stone-900 block text-sm">Firebase Auth &amp; Firestore</span>
                <span className="text-stone-500 text-[11px] block">Role-based security rules · Granular data scoping</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-1">
                <span className="text-[10px] text-stone-400 uppercase font-bold">Deterministic AI Engine</span>
                <span className="font-bold text-stone-900 block text-sm">Mathematical Baseline Engine</span>
                <span className="text-stone-500 text-[11px] block">Deterministic 0-10 scoring · Explainable factors</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-1">
                <span className="text-[10px] text-stone-400 uppercase font-bold">Statutory Compliance</span>
                <span className="font-bold text-stone-900 block text-sm">DPDP Act 2023 &amp; PoA 1995</span>
                <span className="text-stone-500 text-[11px] block">Immutable audit logs · Survivor pseudonymity</span>
              </div>
            </div>
          </div>

          {/* Section 3: Safe Integration Commitment */}
          <div className="p-5 rounded-2xl bg-teal-50/80 border border-teal-200/90 text-xs text-teal-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-teal-900">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <span>Transparent Integration Architecture Ready for Government Deployment</span>
            </div>
            <p className="leading-relaxed text-teal-900/90">
              Mannik AI CARE CORE uses a modular Integration Gateway. Currently operating in Sandbox/Demo mode with simulated NHAA 14566 and multi-channel records. Upon allocation of official Ministry API credentials and OAuth endpoints, the connector switches seamlessly to production mode without modifying underlying case management or clinical intervention logic.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
