import React from 'react';
import { 
  HeartHandshake, 
  ShieldCheck, 
  Activity, 
  Sparkles, 
  Globe2, 
  Mic, 
  Scale, 
  PhoneCall, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Wind,
  Layers,
  HeartPulse,
  Volume2,
  Smile,
  HandHeart
} from 'lucide-react';
import { LanguageCode } from '../types';
import { speakText, TRANSLATIONS } from '../services/i18n';

interface LandingPageProps {
  onStartCheckIn: () => void;
  onExploreCounsellor: () => void;
  onOpenGrounding: () => void;
  language: LanguageCode;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartCheckIn,
  onExploreCounsellor,
  onOpenGrounding,
  language,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  return (
    <div className="space-y-16 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 sm:pt-14 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Heading & Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-900 text-xs font-semibold">
              <HandHeart className="w-3.5 h-3.5 text-teal-700" />
              <span>Trauma-Informed Early Warning & Care System</span>
            </div>

            <h1 className="font-display font-bold text-3xl sm:text-5xl lg:text-6xl text-stone-900 tracking-tight leading-[1.15]">
              Bridging the silence with timely support.
            </h1>

            <p className="text-sm sm:text-base text-stone-600 max-w-xl leading-relaxed">
              Continuous multilingual mental-health monitoring and distress prediction for victims of atrocities, with compassionate, human-led intervention.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onStartCheckIn}
                className="px-6 py-3.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center gap-2"
              >
                <span>{t.startCheckIn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onExploreCounsellor}
                className="px-5 py-3.5 rounded-2xl bg-white hover:bg-stone-50 text-stone-800 font-semibold text-sm border border-stone-200 shadow-xs transition-colors cursor-pointer"
              >
                Counsellor Review Hub
              </button>

              <button
                onClick={onOpenGrounding}
                className="px-4 py-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-semibold text-sm border border-emerald-200 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Wind className="w-4 h-4 text-emerald-700" />
                <span>{t.groundingSpace}</span>
              </button>
            </div>

            {/* Trust Markers */}
            <div className="pt-4 border-t border-stone-200/80 grid grid-cols-3 gap-4 text-left">
              <div>
                <span className="font-mono text-xl font-bold text-stone-900 block">8+</span>
                <span className="text-[11px] text-stone-500">Regional Languages</span>
              </div>
              <div>
                <span className="font-mono text-xl font-bold text-teal-800 block">0-10</span>
                <span className="text-[11px] text-stone-500">Dynamic Distress Scale</span>
              </div>
              <div>
                <span className="font-mono text-xl font-bold text-stone-900 block">100%</span>
                <span className="text-[11px] text-stone-500">Human Clinician Review</span>
              </div>
            </div>
          </div>

          {/* Right Column: Serene Therapeutic Visual Hero */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-stone-200 aspect-[4/3] bg-stone-100">
              <img
                src="/src/assets/images/mannik_hero_wellness_1790414677443.jpg"
                alt="Mannik AI Therapeutic Wellness Ambiance"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/20 to-transparent flex items-end p-6">
                <div className="text-white space-y-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-300 block">
                    Trauma-Informed Design
                  </span>
                  <p className="text-xs text-white/90 leading-relaxed">
                    Designed for low-literacy survivors with voice interaction, acoustic prosody screening, and offline automatic synchronization.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DISTINCT VISUAL SECTIONS (Easy for any user / illiterate-friendly) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-500">
            <span>Built For Everyone</span>
            <button
              onClick={() => speakText("Simple touch and voice features for everyone", language)}
              className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              title="Listen to description"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-stone-900">
            Four Simple Ways to Express Yourself & Receive Care
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            No complex reading or writing required. Big visual icons, voice playback in your language, and immediate human attention.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Speak Your Heart */}
          <div className="rounded-3xl bg-white border border-stone-200/90 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
            <div className="aspect-[4/3] bg-stone-100 relative overflow-hidden">
              <img
                src="/src/assets/images/card_voice_speak_1790415180330.jpg"
                alt="Voice Check-in"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-rose-700 text-[11px] font-bold flex items-center gap-1 shadow-xs">
                <Mic className="w-3 h-3" />
                <span>Just Speak</span>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-lg text-stone-900">
                    Voice & Speech Check-In
                  </h3>
                  <button
                    onClick={() => speakText("Voice and speech check in. Just speak freely in your language", language)}
                    className="p-1 text-stone-400 hover:text-stone-800"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Hold the big button and speak in Hindi, Marathi, Bengali, Tamil, Telugu, Gujarati, Kannada, or English. Our system listens to voice stress cues and feelings safely.
                </p>
              </div>
              <button
                onClick={onStartCheckIn}
                className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-900 hover:text-white text-stone-800 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>Try Voice Check-In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Shanti Grounding Sanctuary */}
          <div className="rounded-3xl bg-white border border-stone-200/90 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
            <div className="aspect-[4/3] bg-stone-100 relative overflow-hidden">
              <img
                src="/src/assets/images/card_grounding_peace_1790415199922.jpg"
                alt="Shanti Grounding Room"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-emerald-800 text-[11px] font-bold flex items-center gap-1 shadow-xs">
                <Wind className="w-3 h-3 text-emerald-600" />
                <span>Breathe In / Out</span>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-lg text-stone-900">
                    Shanti Breathing & Soundscapes
                  </h3>
                  <button
                    onClick={() => speakText("Shanti breathing room. Paced circles to calm the mind and body.", language)}
                    className="p-1 text-stone-400 hover:text-stone-800"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Tactile breathing circles that expand and gently contract. Soothing ambient nature soundscapes including bamboo rain, temple bells, and morning breeze.
                </p>
              </div>
              <button
                onClick={onOpenGrounding}
                className="w-full py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-700 hover:text-white text-emerald-800 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>Open Shanti Room</span>
                <Wind className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 3: Protection & Human Care */}
          <div className="rounded-3xl bg-white border border-stone-200/90 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
            <div className="aspect-[4/3] bg-stone-100 relative overflow-hidden">
              <img
                src="/src/assets/images/card_safety_shield_1790415213169.jpg"
                alt="Protection & Human Care"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-teal-800 text-[11px] font-bold flex items-center gap-1 shadow-xs">
                <ShieldCheck className="w-3 h-3 text-teal-600" />
                <span>Protected</span>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-lg text-stone-900">
                    Human Protection & Relief
                  </h3>
                  <button
                    onClick={() => speakText("Human protection and legal aid. Certified counsellors help you immediately.", language)}
                    className="p-1 text-stone-400 hover:text-stone-800"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Every alert routes to qualified counsellors and welfare officers. We coordinate witness protection, safe shelter relocation, free legal advocates, and financial compensation.
                </p>
              </div>
              <button
                onClick={onExploreCounsellor}
                className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-900 hover:text-white text-stone-800 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>View Counsellor Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CORE 4-STAGE MONITORING LOOP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
            System Operating Procedure
          </span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-stone-900">
            Continuous Mental Health Monitoring Loop
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            Moving beyond one-time questionnaires to ongoing, longitudinal distress surveillance and human protection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Stage 1 */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-stone-100 text-stone-900 flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h3 className="font-display font-bold text-base text-stone-900">
              Multilingual Check-In
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Survivors check in via voice, empathetic chat, or touch icons across 8 Indian languages, online or offline via PWA.
            </p>
          </div>

          {/* Stage 2 */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h3 className="font-display font-bold text-base text-stone-900">
              Multimodal AI Analysis
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Acoustic micro-tremor, vocal pause density, text sentiment, and longitudinal score trajectories generate a 0–10 score.
            </p>
          </div>

          {/* Stage 3 */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-800 flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h3 className="font-display font-bold text-base text-stone-900">
              Predictive Alert Escalation
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Before severe crisis occurs, configurable thresholds dispatch prioritized alerts directly to certified clinical counsellors.
            </p>
          </div>

          {/* Stage 4 */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-sm">
              04
            </div>
            <h3 className="font-display font-bold text-base text-stone-900">
              Human-Led Support
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Authorized caseworkers validate alerts and dispatch tailored interventions: Legal Aid, Medical Care, Relocation, and DBT Relief.
            </p>
          </div>
        </div>
      </section>

      {/* CORE CAPABILITIES & ETHICAL SAFETY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-stone-900 text-white p-8 sm:p-12 space-y-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
              Ethical Governance & Safety Guarantee
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-4xl text-white">
              AI Never Acts Alone. Certified Humans Make All Determinations.
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Mannik AI strictly enforces non-clinical operational screening. The system never diagnoses mental disorders, never initiates police action autonomously, and never closes a case without human clinician review.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-stone-800">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-teal-300 font-semibold text-sm">
                <Lock className="w-4 h-4" />
                <span>DPDP 2023 Compliance</span>
              </div>
              <p className="text-xs text-stone-400">
                End-to-end data encryption in transit and at rest. Personally identifiable victim identities are replaced with protective aliases.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-teal-300 font-semibold text-sm">
                <Scale className="w-4 h-4" />
                <span>Inter-Agency Sync</span>
              </div>
              <p className="text-xs text-stone-400">
                Integrates directly with the National Atrocity Portal, District Legal Services Authorities (DLSA), and DMHP trauma units.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-teal-300 font-semibold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>Tamper-Sealed Audit Trails</span>
              </div>
              <p className="text-xs text-stone-400">
                Every sensitive case view, risk computation, alert resolution, and intervention dispatch is logged to an immutable ledger.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
