import React from 'react';
import { 
  X, 
  Scale, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  Volume2, 
  Coins, 
  Clock, 
  AlertCircle,
  Building
} from 'lucide-react';
import { LanguageCode } from '../types';
import { speakText, TRANSLATIONS } from '../services/i18n';
import { STATUTORY_COMPENSATION_RIGHTS } from '../services/storage';

interface StatutoryRightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
}

export const StatutoryRightsModal: React.FC<StatutoryRightsModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-800 text-teal-200 flex items-center justify-center font-bold">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">
                Statutory Legal Rights & Relief Fund Guide
              </h3>
              <p className="text-[11px] text-stone-400">
                PoA Act Rights · Free Legal Aid · Financial Relief (कानून व आपके अधिकार)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs text-stone-700">
          {/* Audio introduction for low-literacy users */}
          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200/80 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="font-semibold text-teal-950 block text-xs">
                Listen in Your Native Language (अपनी भाषा में सुनें)
              </span>
              <p className="text-[11px] text-teal-800">
                Tap the speaker to hear your complete statutory compensation rights read aloud.
              </p>
            </div>
            <button
              onClick={() => speakText("You have the right to statutory financial relief, free senior advocate defense, and round the clock witness protection under the law.", language)}
              className="px-3.5 py-2 rounded-xl bg-teal-800 text-white font-semibold text-xs flex items-center gap-1.5 hover:bg-teal-900 transition-colors shrink-0 shadow-sm cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>Read Aloud</span>
            </button>
          </div>

          {/* 3-Stage Statutory Relief Disbursal */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-stone-900 text-sm flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-600" />
              <span>Statutory 3-Stage Direct Benefit Transfer (DBT) Relief</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {STATUTORY_COMPENSATION_RIGHTS.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 inline-block">
                      {item.stage} ({item.percentage}%)
                    </span>
                    <h5 className="font-semibold text-stone-900 text-xs">
                      {item.title}
                    </h5>
                    <p className="text-[11px] text-stone-500 font-mono">
                      {item.amountSample}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-200/60 text-[10px] text-stone-600 space-y-1">
                    <span className="font-semibold text-stone-800 block">Required Docs:</span>
                    <ul className="list-disc list-inside space-y-0.5">
                      {item.documentsNeeded.map((doc, dIdx) => (
                        <li key={dIdx}>{doc}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Core Non-Negotiable Entitlements */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-stone-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <span>Mandatory Legal & Protective Entitlements</span>
            </h4>

            <div className="space-y-2">
              <div className="p-3.5 rounded-2xl bg-white border border-stone-200 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 mt-0.5 shrink-0">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-stone-900 block text-xs">
                    Free Senior Legal Defense (DLSA Advocate)
                  </span>
                  <p className="text-[11px] text-stone-600 mt-0.5">
                    Under the Legal Services Authorities Act, victims of atrocities are entitled to free, qualified senior counsel without any court or lawyer fees.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-stone-200 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700 mt-0.5 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-stone-900 block text-xs">
                    Round-the-Clock Witness Protection
                  </span>
                  <p className="text-[11px] text-stone-600 mt-0.5">
                    Police escort, home security checks, identity shielding, and safe travel allowance to and from court hearings.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-stone-200 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-rose-50 text-rose-700 mt-0.5 shrink-0">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-stone-900 block text-xs">
                    Emergency Relocation & Sustenance
                  </span>
                  <p className="text-[11px] text-stone-600 mt-0.5">
                    If staying in the village or neighborhood is dangerous, the District Magistrate must arrange safe shelter, food, and relocation stipend.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-stone-500 text-[11px]">
          <span>National Legal Helpline: 15100 / 181</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
