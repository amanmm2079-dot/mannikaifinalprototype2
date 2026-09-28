import React, { useState } from 'react';
import { 
  PhoneCall, 
  MessageSquare, 
  Smartphone, 
  Globe, 
  Volume2, 
  CheckCircle2, 
  Send, 
  X,
  Sparkles,
  Shield,
  HelpCircle
} from 'lucide-react';
import { AtrocityCase, LanguageCode } from '../types';
import { speakText, TRANSLATIONS } from '../services/i18n';
import { AppStore } from '../services/storage';

interface OmnichannelIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: AtrocityCase;
  language: LanguageCode;
  onCheckInCompleted: (score: number, channel: string) => void;
}

export const OmnichannelIntakeModal: React.FC<OmnichannelIntakeModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  language,
  onCheckInCompleted,
}) => {
  const [activeChannel, setActiveChannel] = useState<'ivrs' | 'sms' | 'whatsapp'>('ivrs');
  const [ivrStep, setIvrStep] = useState<number>(1);
  const [ivrKeypress, setIvrKeypress] = useState<number | null>(null);
  const [smsAnswer, setSmsAnswer] = useState<string>('');
  const [smsHistory, setSmsHistory] = useState<Array<{ sender: 'system' | 'user'; text: string; time: string }>>([
    {
      sender: 'system',
      text: 'Mannik AI Care: Namaste. Aapka saaptahik suraksha va swasthya check-in. Kripya 1 se 5 mein batayein, aaj aap kitna surakshit mehsoos kar rahe hain? (1=Bohot darr, 5=Surakshit)',
      time: '10:00 AM',
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSuccess, setCompletedSuccess] = useState(false);

  if (!isOpen) return null;

  // IVRS telephone simulation logic
  const handleIvrKey = (key: number) => {
    setIvrKeypress(key);
    // Play audio feedback
    if (key <= 2) {
      speakText('Aapne chuna do ya kam. Hum samajhte hain ki aap chintit hain. Sahayata uplabdh hai.', language);
    } else {
      speakText('Dhanyawad. Aapka uttar surakshit darj ho gaya hai.', language);
    }

    setTimeout(() => {
      if (ivrStep === 1) {
        setIvrStep(2);
        setIvrKeypress(null);
      } else {
        finishIvrCheckIn(key);
      }
    }, 1200);
  };

  const finishIvrCheckIn = (secondAnswer: number) => {
    setIsSubmitting(true);
    // Map to distress score (lower safety = higher distress)
    const calculatedScore = Math.max(1.0, Math.min(9.5, Number((10 - (ivrKeypress || 3) * 1.5).toFixed(1))));

    setTimeout(() => {
      AppStore.recordCheckIn(caseItem.id, {
        channel: 'ivrs',
        language,
        textResponse: `[IVRS Automated Phone Response: Safety Key=${ivrKeypress}, Sleep Key=${secondAnswer}]`,
        answers: {
          safetyFeel: ivrKeypress || 3,
          sleepQuality: secondAnswer,
          overwhelmLevel: 5 - (ivrKeypress || 3),
        },
      });

      setIsSubmitting(false);
      setCompletedSuccess(true);
      onCheckInCompleted(calculatedScore, 'IVRS Telephone Gateway');
    }, 800);
  };

  // SMS simulation logic
  const handleSendSms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsAnswer.trim()) return;

    const userText = smsAnswer.trim();
    const newHistory = [
      ...smsHistory,
      { sender: 'user' as const, text: userText, time: 'Just now' },
    ];
    setSmsHistory(newHistory);
    setSmsAnswer('');
    setIsSubmitting(true);

    setTimeout(() => {
      setSmsHistory((prev) => [
        ...prev,
        {
          sender: 'system',
          text: 'Dhanyawad. Aapka uttar Mannik AI CARE CORE mein encrypted roop se darj kar liya gaya hai. Aapke assigned counsellor ko soochit kar diya gaya hai.',
          time: 'Just now',
        },
      ]);

      AppStore.recordCheckIn(caseItem.id, {
        channel: 'sms',
        language,
        textResponse: userText,
        answers: {
          safetyFeel: 3,
          overwhelmLevel: 3,
        },
      });

      setIsSubmitting(false);
      setCompletedSuccess(true);
      onCheckInCompleted(4.2, 'SMS Gateway (Govt 14566)');
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-stone-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-stone-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-600/40 border border-teal-500/50 flex items-center justify-center text-teal-300">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base text-white">
                  Multi-Channel Outreach Simulator
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider text-teal-300 bg-teal-950/80 px-1.5 py-0.5 rounded border border-teal-700/60">
                  SIH26094 Omnichannel
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Low-friction communication for survivors without smartphones or internet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Channel Switcher Tabs */}
        <div className="grid grid-cols-3 bg-stone-100 p-1.5 border-b border-stone-200 text-xs font-semibold text-stone-600">
          <button
            onClick={() => { setActiveChannel('ivrs'); setCompletedSuccess(false); setIvrStep(1); }}
            className={`py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              activeChannel === 'ivrs' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'hover:text-stone-900'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5 text-teal-700" />
            <span>IVRS Toll-Free Call</span>
          </button>

          <button
            onClick={() => { setActiveChannel('sms'); setCompletedSuccess(false); }}
            className={`py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              activeChannel === 'sms' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'hover:text-stone-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-sky-700" />
            <span>SMS 14566 Gateway</span>
          </button>

          <button
            onClick={() => { setActiveChannel('whatsapp'); setCompletedSuccess(false); }}
            className={`py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              activeChannel === 'whatsapp' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'hover:text-stone-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
            <span>WhatsApp Business</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {completedSuccess ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-700" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-bold text-lg text-stone-900">
                  Pulse Check-in Successfully Ingested!
                </h4>
                <p className="text-xs text-stone-600 max-w-sm mx-auto">
                  Response processed through NLP feature extractor and longitudinal distress comparison engine.
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  View Updated Case Dashboard
                </button>
              </div>
            </div>
          ) : activeChannel === 'ivrs' ? (
            <div className="space-y-5">
              {/* Simulated Telephone Banner */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="font-semibold">Simulated IVR Call in Progress: +91 14566</span>
                </div>
                <span className="text-[11px] font-mono text-amber-800">Language: {language.toUpperCase()}</span>
              </div>

              {/* Voice Question Prompt */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-2 text-stone-800">
                <div className="flex items-center gap-2 text-teal-800 text-xs font-bold uppercase tracking-wider">
                  <Volume2 className="w-4 h-4 text-teal-700" />
                  <span>IVR Voice Prompt (Step {ivrStep} of 2)</span>
                </div>
                <p className="text-sm font-medium leading-relaxed">
                  {ivrStep === 1
                    ? '“Namaste. Yeh Mannik AI aur Samajik Nyay Vibhag ka suraksha call hai. Aaj aap apne gaon mein kitna surakshit mehsoos kar rahe hain? Dialpad par 1 se 5 tak ka button dabayein.”'
                    : '“Kripya batayein, kya pichhle teen dinon mein aapko neend ya ghabrahat ki samasya hui hai? 1 dabayein agar bohot samasya hai, 5 dabayein agar sab theek hai.”'}
                </p>
                <div className="text-[11px] text-stone-500 italic">
                  (Automated Voice synthesizer plays in selected native regional dialect)
                </div>
              </div>

              {/* Simulated Dialpad Keypress */}
              <div className="space-y-2 text-center">
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                  Simulate Survivor Keypress on Phone Keypad
                </span>
                <div className="grid grid-cols-5 gap-2 max-w-sm mx-auto">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleIvrKey(num)}
                      disabled={isSubmitting}
                      className="py-3 rounded-xl bg-white border border-stone-300 hover:border-teal-600 hover:bg-teal-50 active:bg-teal-100 font-mono font-bold text-lg text-stone-900 transition-all shadow-xs cursor-pointer flex flex-col items-center justify-center disabled:opacity-50"
                    >
                      <span>{num}</span>
                      <span className="text-[8px] text-stone-400 font-sans font-normal">
                        {num === 1 ? 'Low' : num === 5 ? 'Good' : ''}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* SMS / WhatsApp View */
            <div className="space-y-4">
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 h-60 overflow-y-auto space-y-3 font-sans text-xs">
                {smsHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                        msg.sender === 'user'
                          ? 'bg-teal-700 text-white rounded-br-xs'
                          : 'bg-white text-stone-800 border border-stone-200 rounded-bl-xs shadow-2xs'
                      }`}
                    >
                      <p className="leading-relaxed">{msg.text}</p>
                    </div>
                    <span className="text-[9px] text-stone-400 mt-1 px-1">{msg.time}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendSms} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type simulated SMS response (e.g. 'Aaj thoda darr lag raha hai...')"
                  value={smsAnswer}
                  onChange={(e) => setSmsAnswer(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-teal-700 bg-white"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !smsAnswer.trim()}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
