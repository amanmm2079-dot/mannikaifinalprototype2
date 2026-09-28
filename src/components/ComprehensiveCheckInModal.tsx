import React, { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  Heart, 
  Activity, 
  HelpCircle, 
  FileText, 
  Send,
  Save,
  Info
} from 'lucide-react';
import { AtrocityCase, LanguageCode } from '../types';
import { QuestionnaireResponses, StoredAssessmentRecord } from '../types/questionnaire';
import { AppStore } from '../services/storage';
import { calculateDynamicDistressScore } from '../services/aiService';
import { SosService } from '../services/sosService';

interface ComprehensiveCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: AtrocityCase;
  language: LanguageCode;
  onCheckInCompleted?: (score: number, band: string) => void;
}

const TOTAL_STEPS = 6;

const DEFAULT_RESPONSES: QuestionnaireResponses = {
  // Step 1: Emotional Well-being
  emotionalState: 'managing',
  stressLevel: 4,
  feelingOverwhelmed: 'several_days',
  feelingSafe: 'mostly_safe',
  abilityToConcentrate: 'normal',
  sleepQuality: 'interrupted',
  energyLevel: 'moderate',

  // Step 2: Daily Functioning
  performNormalActivities: 'with_effort',
  appetiteRoutine: 'regular',
  socialInteraction: 'limited',
  studyOrWork: 'struggling',
  routineChanges: ['staying_indoors'],

  // Step 3: Case-Related Stress
  caseProceedingsStress: 'moderate',
  stressDueToDelays: 'somewhat',
  difficultyAttendingProceedings: 'no_difficulty',
  feelingSupportedInProcess: 'somewhat_supported',
  caseProcessConcerns: [],

  // Step 4: Safety & Support
  currentlyFeelSafe: 'yes',
  needCounsellorSupport: false,
  needLegalAssistance: false,
  needFinancialRelief: false,
  needRehabilitationSupport: false,
  wantSupportTeamContact: false,
  preferredContactMethod: 'phone_call',

  // Step 5: Additional Context
  optionalTextNotes: '',
};

export const ComprehensiveCheckInModal: React.FC<ComprehensiveCheckInModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  language,
  onCheckInCompleted,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [responses, setResponses] = useState<QuestionnaireResponses>(DEFAULT_RESPONSES);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState<StoredAssessmentRecord | null>(null);
  const [saveToast, setSaveToast] = useState(false);

  if (!isOpen) return null;

  const updateResponse = <K extends keyof QuestionnaireResponses>(
    key: K,
    value: QuestionnaireResponses[K]
  ) => {
    setResponses((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayItem = (key: 'routineChanges' | 'caseProcessConcerns', item: string) => {
    setResponses((prev) => {
      const currentList = prev[key] || [];
      const updated = currentList.includes(item)
        ? currentList.filter((i) => i !== item)
        : [...currentList, item];
      return { ...prev, [key]: updated };
    });
  };

  const handleSaveDraft = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`mannik_draft_checkin_${caseItem.id}`, JSON.stringify(responses));
    }
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);

    // Map responses into numeric answers for the deterministic AI engine
    const answers = {
      sleepQuality:
        responses.sleepQuality === 'restful' ? 5 :
        responses.sleepQuality === 'interrupted' ? 3 :
        responses.sleepQuality === 'nightmares_insomnia' ? 2 : 1,
      safetyFeel:
        responses.feelingSafe === 'completely_safe' ? 5 :
        responses.feelingSafe === 'mostly_safe' ? 4 :
        responses.feelingSafe === 'somewhat_unsafe' ? 2 : 1,
      overwhelmLevel: Math.max(1, Math.min(5, Math.round(responses.stressLevel / 2))),
      socialConnection:
        responses.socialInteraction === 'connected' ? 5 :
        responses.socialInteraction === 'limited' ? 3 : 1,
      physicalSymptoms: responses.routineChanges,
    };

    const textPayload = `Emotional State: ${responses.emotionalState}. Stress: ${responses.stressLevel}/10. Case Stress: ${responses.caseProceedingsStress}. ${responses.optionalTextNotes || ''}`;

    const { score, contributingFactors } = calculateDynamicDistressScore(
      answers,
      textPayload,
      undefined,
      caseItem.consecutiveMissedCheckIns || 0
    );

    const riskBand: 'low' | 'moderate' | 'high' | 'urgent' =
      score >= 8.5 ? 'urgent' :
      score >= 6.5 ? 'high' :
      score > 3.5 ? 'moderate' : 'low';

    const assessmentId = `ASM-${Date.now().toString().slice(-6)}`;
    const record: StoredAssessmentRecord = {
      assessmentId,
      caseId: caseItem.id,
      userId: 'usr-victim-01',
      responses,
      submittedAt: new Date().toISOString(),
      language,
      completionPercentage: 100,
      source: 'web_questionnaire',
      version: 'v2.1-comprehensive',
      calculatedDistressScore: score,
      riskBand,
      contributingFactors,
    };

    // Persist to AppStore
    AppStore.submitComprehensiveAssessment(record);

    // If victim explicitly requested human support in Step 4, route support request
    if (responses.wantSupportTeamContact || responses.needCounsellorSupport || responses.needLegalAssistance) {
      SosService.createSupportRequest({
        caseId: caseItem.id,
        userId: 'usr-victim-01',
        userName: caseItem.victimAlias,
        type: responses.needLegalAssistance ? 'legal' : responses.needCounsellorSupport ? 'counsellor' : 'general',
        urgency: riskBand === 'urgent' || riskBand === 'high' ? 'urgent' : 'priority',
        notes: `Requested via Personal Check-In (${record.assessmentId}). Preferred contact: ${responses.preferredContactMethod || 'phone_call'}. Notes: ${responses.optionalTextNotes || 'None'}`,
      });
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedRecord(record);
      if (onCheckInCompleted) {
        onCheckInCompleted(score, riskBand);
      }
    }, 600);
  };

  const completionPercent = Math.round(((currentStep - 1) / (TOTAL_STEPS - 1)) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-teal-500/30 text-teal-200 text-[10px] font-bold uppercase tracking-wider">
                Support Purposes Only
              </span>
              <span className="text-teal-200/60 text-xs">·</span>
              <span className="text-teal-200/80 text-xs flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>Est. 3-4 mins</span>
              </span>
            </div>
            <h2 className="font-display font-bold text-xl text-white mt-1">
              Personal Well-being Check-In
            </h2>
            <p className="text-[11px] text-teal-100/70 mt-0.5">
              AI-assisted monitoring for support purposes; not a medical diagnosis.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="bg-teal-50/80 px-6 py-2.5 border-b border-teal-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-900">
            <span>Step {currentStep} of {TOTAL_STEPS}:</span>
            <span className="text-teal-700">
              {currentStep === 1 && 'Emotional Well-being'}
              {currentStep === 2 && 'Daily Functioning'}
              {currentStep === 3 && 'Case-Related Stress'}
              {currentStep === 4 && 'Safety & Support Needs'}
              {currentStep === 5 && 'Additional Context'}
              {currentStep === 6 && 'Review & Submit'}
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-teal-800">
            {completionPercent}%
          </span>
        </div>
        <div className="w-full bg-teal-100 h-1">
          <div
            className="bg-teal-600 h-1 transition-all duration-300"
            style={{ width: `${completionPercent}%` }}
          />
        </div>

        {/* Save Draft Toast */}
        {saveToast && (
          <div className="mx-6 mt-3 p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Progress saved locally. You can resume anytime.</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-slate-800">
          {submittedRecord ? (
            /* Success confirmation */
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="font-display font-bold text-2xl text-slate-900">
                  Well-Being Check-In Recorded
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Your responses have been encrypted and connected to your case file ({caseItem.id}). Your assigned counsellor ({caseItem.assignedCounsellorName}) has been notified.
                </p>
              </div>

              <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Assessment ID:</span>
                  <span className="font-mono font-bold text-slate-800">{submittedRecord.assessmentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Well-Being Band:</span>
                  <span className="font-bold text-teal-800 uppercase">{submittedRecord.riskBand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Support Routing:</span>
                  <span className="font-semibold text-slate-800">
                    {responses.wantSupportTeamContact ? 'Human Follow-up Queued' : 'Routine Active Monitoring'}
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* STEP 1: EMOTIONAL WELL-BEING */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-900">
                      Section A: Emotional Well-being
                    </h3>
                    <p className="text-xs text-slate-500">
                      Take your time. Reflect on how your thoughts and feelings have been over the past few days.
                    </p>
                  </div>

                  {/* Emotional State */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 block">
                      1. How would you describe your overall emotional state right now?
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        { val: 'peaceful', label: 'Peaceful / Calm', sub: 'शांत व सुरक्षित' },
                        { val: 'managing', label: 'Managing Okay', sub: 'सब ठीक है' },
                        { val: 'anxious', label: 'Worried / Anxious', sub: 'चिंता या भारीपन' },
                        { val: 'distressed', label: 'Highly Distressed', sub: 'बहुत बेचैनी' },
                        { val: 'overwhelmed', label: 'Overwhelmed', sub: 'सहन से बाहर' },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => updateResponse('emotionalState', item.val as any)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            responses.emotionalState === item.val
                              ? 'bg-teal-50 border-teal-500 text-teal-950 font-bold ring-1 ring-teal-500'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="text-xs block">{item.label}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{item.sub}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Stress Level Slider */}
                  <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-slate-700">
                        2. Current stress level (1 = Very Low, 10 = Severe)
                      </label>
                      <span className="font-mono text-sm font-bold text-teal-800 bg-teal-100/80 px-2.5 py-0.5 rounded-full">
                        {responses.stressLevel} / 10
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={responses.stressLevel}
                      onChange={(e) => updateResponse('stressLevel', Number(e.target.value))}
                      className="w-full accent-teal-700 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                      <span>Low / Relaxed</span>
                      <span>Moderate</span>
                      <span>High / Acute</span>
                    </div>
                  </div>

                  {/* Feeling Overwhelmed */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 block">
                      3. Over the past week, how often have you felt overwhelmed?
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { val: 'not_at_all', label: 'Not at all' },
                        { val: 'several_days', label: 'Several days' },
                        { val: 'more_than_half', label: 'More than half' },
                        { val: 'nearly_every_day', label: 'Nearly every day' },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => updateResponse('feelingOverwhelmed', item.val as any)}
                          className={`p-2.5 rounded-xl border text-center text-xs transition-all cursor-pointer ${
                            responses.feelingOverwhelmed === item.val
                              ? 'bg-teal-50 border-teal-500 text-teal-950 font-bold'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Feeling Safe */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 block">
                      4. Do you feel physically and emotionally safe in your dwelling?
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      {[
                        { val: 'completely_safe', label: 'Completely safe' },
                        { val: 'mostly_safe', label: 'Mostly safe' },
                        { val: 'somewhat_unsafe', label: 'Somewhat unsafe' },
                        { val: 'in_danger', label: 'Feel in danger' },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => updateResponse('feelingSafe', item.val as any)}
                          className={`p-2.5 rounded-xl border text-center text-xs transition-all cursor-pointer ${
                            responses.feelingSafe === item.val
                              ? 'bg-teal-50 border-teal-500 text-teal-950 font-bold'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sleep Quality */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 block">
                      5. How has your sleep been over the last few nights?
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { val: 'restful', label: 'Restful and uninterrupted' },
                        { val: 'interrupted', label: 'Light sleep or waking frequently' },
                        { val: 'nightmares_insomnia', label: 'Disturbing nightmares / delayed sleep' },
                        { val: 'severe_sleep_loss', label: 'Severe insomnia / unable to sleep' },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => updateResponse('sleepQuality', item.val as any)}
                          className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                            responses.sleepQuality === item.val
                              ? 'bg-teal-50 border-teal-500 text-teal-950 font-bold'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: DAILY FUNCTIONING */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-900">
                      Section B: Daily Functioning & Routine
                    </h3>
                    <p className="text-xs text-slate-500">
                      Understanding changes in your routine helps us evaluate support requirements.
                    </p>
                  </div>

                  {/* Normal Activities */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 block">
                      1. Ability to manage your household chores and personal care:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        { val: 'easily', label: 'Able to do them easily' },
                        { val: 'with_effort', label: 'Doing them with effort' },
                        { val: 'unable_to_do_most', label: 'Struggling / Unable to do most' },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => updateResponse('performNormalActivities', item.val as any)}
                          className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                            responses.performNormalActivities === item.val
                              ? 'bg-teal-50 border-teal-500 text-teal-950 font-bold'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Appetite */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 block">
                      2. Appetite and regular meals:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        { val: 'regular', label: 'Eating regular meals' },
                        { val: 'skipped_meals', label: 'Irregular / Skipping meals' },
                        { val: 'loss_of_appetite', label: 'Complete loss of appetite' },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => updateResponse('appetiteRoutine', item.val as any)}
                          className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                            responses.appetiteRoutine === item.val
                              ? 'bg-teal-50 border-teal-500 text-teal-950 font-bold'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Social Connection */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 block">
                      3. Interaction with trusted friends, relatives, or neighbors:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { val: 'connected', label: 'In touch with supportive people' },
                        { val: 'limited', label: 'Limited contact with others' },
                        { val: 'avoiding_everyone', label: 'Hesitating / Avoiding meeting people' },
                        { val: 'isolated', label: 'Completely isolated' },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => updateResponse('socialInteraction', item.val as any)}
                          className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                            responses.socialInteraction === item.val
                              ? 'bg-teal-50 border-teal-500 text-teal-950 font-bold'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Routine Changes (Multi-select) */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 block">
                      4. Are you noticing any of these changes? (Select all that apply)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { id: 'staying_indoors', label: 'Staying indoors most of the day' },
                        { id: 'fear_of_leaving_home', label: 'Fear of stepping out alone' },
                        { id: 'crying_spells', label: 'Frequent crying or sudden tears' },
                        { id: 'easily_startled', label: 'Jumpiness or easily startled by noise' },
                      ].map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleArrayItem('routineChanges', tag.id)}
                          className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                            responses.routineChanges.includes(tag.id)
                              ? 'bg-teal-50 border-teal-500 text-teal-950 font-semibold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span>{tag.label}</span>
                          {responses.routineChanges.includes(tag.id) && (
                            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: CASE-RELATED STRESS */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-900">
                      Section C: Case-Related Stress & Legal Process
                    </h3>
                    <p className="text-xs text-slate-500">
                      Your legal rights and safety during proceedings are statutory obligations of the state.
                    </p>
                  </div>

                  {/* Ongoing Proceedings Stress */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 block">
                      1. How much stress do the ongoing police or court proceedings cause you?
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { val: 'none', label: 'None' },
                        { val: 'moderate', label: 'Moderate' },
                        { val: 'high', label: 'High' },
                        { val: 'severe', label: 'Severe Stress' },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => updateResponse('caseProceedingsStress', item.val as any)}
                          className={`p-2.5 rounded-xl border text-center text-xs transition-all cursor-pointer ${
                            responses.caseProceedingsStress === item.val
                              ? 'bg-teal-50 border-teal-500 text-teal-950 font-bold'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Delay Stress */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 block">
                      2. Do procedural delays or dates cause you heightened anxiety?
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { val: 'yes', label: 'Yes, heavily' },
                        { val: 'somewhat', label: 'Somewhat' },
                        { val: 'no', label: 'No' },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => updateResponse('stressDueToDelays', item.val as any)}
                          className={`p-2.5 rounded-xl border text-center text-xs transition-all cursor-pointer ${
                            responses.stressDueToDelays === item.val
                              ? 'bg-teal-50 border-teal-500 text-teal-950 font-bold'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Attending Proceedings */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 block">
                      3. Any difficulty in attending hearings or police station inquiries?
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { val: 'no_difficulty', label: 'No significant difficulty' },
                        { val: 'financial_difficulty', label: 'Travel expense / financial hardship' },
                        { val: 'intimidation_fear', label: 'Intimidation fear by other party' },
                        { val: 'travel_distance', label: 'Long distance or physical health limits' },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => updateResponse('difficultyAttendingProceedings', item.val as any)}
                          className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                            responses.difficultyAttendingProceedings === item.val
                              ? 'bg-teal-50 border-teal-500 text-teal-950 font-bold'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Process Concerns (Multi-select) */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 block">
                      4. Specific concerns regarding your case: (Select all that apply)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { id: 'perpetrator_bail', label: 'Anxiety over perpetrator bail' },
                        { id: 'witness_threat', label: 'Retaliatory threats to witnesses or family' },
                        { id: 'lawyer_gap', label: 'Lack of legal representation updates' },
                        { id: 'compensation_delay', label: 'Delay in DBT statutory compensation' },
                      ].map((concern) => (
                        <button
                          key={concern.id}
                          type="button"
                          onClick={() => toggleArrayItem('caseProcessConcerns', concern.id)}
                          className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                            responses.caseProcessConcerns.includes(concern.id)
                              ? 'bg-teal-50 border-teal-500 text-teal-950 font-semibold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span>{concern.label}</span>
                          {responses.caseProcessConcerns.includes(concern.id) && (
                            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: SAFETY & SUPPORT NEEDS */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-900">
                      Section D: Safety & Support Needs
                    </h3>
                    <p className="text-xs text-slate-500">
                      Tell us what assistance you would like our human support team to coordinate.
                    </p>
                  </div>

                  {/* Currently Feel Safe */}
                  <div className="space-y-2 bg-rose-50/50 p-4 rounded-2xl border border-rose-200/60">
                    <label className="text-xs font-semibold text-rose-950 block">
                      1. Do you currently feel safe in your environment?
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { val: 'yes', label: 'Yes, I feel safe' },
                        { val: 'unsure', label: 'Unsure / Anxious' },
                        { val: 'no', label: 'No, I feel unsafe' },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => updateResponse('currentlyFeelSafe', item.val as any)}
                          className={`p-2.5 rounded-xl border text-center text-xs transition-all cursor-pointer ${
                            responses.currentlyFeelSafe === item.val
                              ? 'bg-rose-600 border-rose-600 text-white font-bold'
                              : 'bg-white border-rose-200 text-rose-900 hover:bg-rose-50'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4 Support Checkboxes */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 block">
                      2. Which types of support do you need right now?
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        { key: 'needCounsellorSupport', title: 'Counsellor / Psychological Support', desc: '1-on-1 trauma counselling with certified specialist' },
                        { key: 'needLegalAssistance', title: 'Legal Assistance (DLSA)', desc: 'Free legal aid advocate & special court witness defense' },
                        { key: 'needFinancialRelief', title: 'Financial & DBT Relief', desc: 'Status check on mandatory Atrocity Act compensation' },
                        { key: 'needRehabilitationSupport', title: 'Rehabilitation & Shelter', desc: 'Livelihood grants, safe relocation, or skill support' },
                      ].map((sup) => (
                        <div
                          key={sup.key}
                          onClick={() => updateResponse(sup.key as any, !responses[sup.key as keyof QuestionnaireResponses])}
                          className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-3 ${
                            responses[sup.key as keyof QuestionnaireResponses]
                              ? 'bg-teal-50 border-teal-500 text-teal-950 font-semibold ring-1 ring-teal-500'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={!!responses[sup.key as keyof QuestionnaireResponses]}
                            onChange={() => {}}
                            className="mt-0.5 w-4 h-4 accent-teal-700 rounded-sm cursor-pointer"
                          />
                          <div>
                            <span className="text-xs block font-bold">{sup.title}</span>
                            <span className="text-[11px] text-slate-500 font-normal">{sup.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Direct Contact request */}
                  <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-teal-950 block">
                          3. Would you like a member of your support team to contact you?
                        </span>
                        <span className="text-[11px] text-teal-700">
                          Your assigned caseworker or counsellor will reach out discreetly.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateResponse('wantSupportTeamContact', !responses.wantSupportTeamContact)}
                        className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-all ${
                          responses.wantSupportTeamContact
                            ? 'bg-teal-700 text-white'
                            : 'bg-white text-slate-700 border border-slate-300'
                        }`}
                      >
                        {responses.wantSupportTeamContact ? 'Yes, Contact Me' : 'No Need Now'}
                      </button>
                    </div>

                    {responses.wantSupportTeamContact && (
                      <div className="space-y-1.5 pt-2 border-t border-teal-200/60">
                        <label className="text-[11px] font-semibold text-teal-900 block">
                          Preferred contact method:
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { val: 'phone_call', label: 'Direct Phone' },
                            { val: 'sms', label: 'SMS Text' },
                            { val: 'in_person', label: 'In-person Visit' },
                            { val: 'app_message', label: 'App Portal' },
                          ].map((opt) => (
                            <button
                              key={opt.val}
                              type="button"
                              onClick={() => updateResponse('preferredContactMethod', opt.val as any)}
                              className={`p-2 rounded-lg text-xs text-center border cursor-pointer ${
                                responses.preferredContactMethod === opt.val
                                  ? 'bg-teal-700 text-white font-bold border-teal-700'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 5: ADDITIONAL CONTEXT */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-900">
                      Section E: Additional Context
                    </h3>
                    <p className="text-xs text-slate-500">
                      Optional space to write anything else you want your counsellor or welfare officer to know.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Anything else you want your support team to know? (Optional)
                    </label>
                    <textarea
                      rows={5}
                      value={responses.optionalTextNotes || ''}
                      onChange={(e) => updateResponse('optionalTextNotes', e.target.value)}
                      placeholder="Share your feelings, specific difficulties with travel, health concerns, or questions about the case proceedings..."
                      className="w-full p-4 rounded-2xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 text-xs text-slate-800 placeholder:text-slate-400"
                    />
                    <span className="text-[11px] text-slate-400 block text-right">
                      {(responses.optionalTextNotes || '').length} characters · Encrypted on send
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800 block">Confidentiality Guarantee</span>
                      <span>
                        Under Section 15A of the SC/ST (PoA) Act and DPDP 2023, personal details and statements submitted in this portal are protected and only accessible to certified caseworkers.
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: REVIEW & SUBMIT */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-900">
                      Section F: Review & Submit
                    </h3>
                    <p className="text-xs text-slate-500">
                      Verify your check-in details before sending to your support team.
                    </p>
                  </div>

                  <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700">
                    <div className="flex justify-between pb-2 border-b border-slate-200">
                      <span className="text-slate-500">Emotional State:</span>
                      <span className="font-bold capitalize text-slate-900">{responses.emotionalState.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-slate-200">
                      <span className="text-slate-500">Self-Reported Stress:</span>
                      <span className="font-bold text-slate-900">{responses.stressLevel} / 10</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-slate-200">
                      <span className="text-slate-500">Perceived Safety:</span>
                      <span className="font-bold capitalize text-slate-900">{responses.feelingSafe.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-slate-200">
                      <span className="text-slate-500">Sleep Pattern:</span>
                      <span className="font-bold capitalize text-slate-900">{responses.sleepQuality.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-slate-200">
                      <span className="text-slate-500">Case Proceedings Stress:</span>
                      <span className="font-bold capitalize text-slate-900">{responses.caseProceedingsStress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Human Callback Requested:</span>
                      <span className={`font-bold ${responses.wantSupportTeamContact ? 'text-teal-700' : 'text-slate-600'}`}>
                        {responses.wantSupportTeamContact ? `Yes (${responses.preferredContactMethod})` : 'No'}
                      </span>
                    </div>
                  </div>

                  {/* Non-clinical disclaimer notice */}
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Important Notice:</span>
                      <span>
                        This check-in is an AI-assisted monitoring tool designed to support ongoing care coordination. It is not a clinical psychological or psychiatric diagnosis. If you are experiencing an immediate emergency, please use the SOS feature or call 181 / 112.
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        {!submittedRecord && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer px-3 py-2 rounded-xl hover:bg-slate-200/60 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save &amp; Continue Later</span>
            </button>

            <div className="flex items-center gap-2">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
              )}

              {currentStep < TOTAL_STEPS ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Encrypting &amp; Submitting...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Check-In</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
