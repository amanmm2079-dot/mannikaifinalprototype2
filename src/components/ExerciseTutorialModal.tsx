import React, { useState, useEffect } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Heart, 
  Sparkles, 
  Clock, 
  Wind,
  Layers,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { LanguageCode, SomaticExercise } from '../types';
import { speakText, TRANSLATIONS } from '../services/i18n';
import { SOMATIC_EXERCISES } from '../services/storage';
import somaticCalmWellness from '../assets/images/somatic_calm_wellness_1790578950019.jpg';

interface ExerciseTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
}

export const ExerciseTutorialModal: React.FC<ExerciseTutorialModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [selectedExercise, setSelectedExercise] = useState<SomaticExercise>(SOMATIC_EXERCISES[0]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepSecondsRemaining, setStepSecondsRemaining] = useState(selectedExercise.steps[0].durationSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [activeHand, setActiveHand] = useState<'left' | 'right'>('left');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(true);

  // Active step pointer
  const step = selectedExercise.steps[currentStepIndex];

  // Timer loop
  useEffect(() => {
    if (!isOpen || !isRunning || isCompleted) return;

    const timer = setInterval(() => {
      setStepSecondsRemaining(prev => {
        if (prev <= 1) {
          // Advance to next step or complete
          if (currentStepIndex < selectedExercise.steps.length - 1) {
            const nextIdx = currentStepIndex + 1;
            setCurrentStepIndex(nextIdx);
            if (isVoiceActive) {
              speakText(selectedExercise.steps[nextIdx].instruction, language);
            }
            return selectedExercise.steps[nextIdx].durationSeconds;
          } else {
            setIsCompleted(true);
            setIsRunning(false);
            return 0;
          }
        }
        return prev - 1;
      });

      // Alternating butterfly tap rhythm
      if (selectedExercise.id === 'butterfly_hug') {
        setActiveHand(h => (h === 'left' ? 'right' : 'left'));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isRunning, currentStepIndex, selectedExercise, isCompleted, isVoiceActive, language]);

  if (!isOpen) return null;

  const handleSelectExercise = (ex: SomaticExercise) => {
    setSelectedExercise(ex);
    setCurrentStepIndex(0);
    setStepSecondsRemaining(ex.steps[0].durationSeconds);
    setIsRunning(false);
    setIsCompleted(false);
  };

  const handleStartPause = () => {
    if (!isRunning && currentStepIndex === 0 && isVoiceActive) {
      speakText(step.instruction, language);
    }
    setIsRunning(!isRunning);
  };

  const handleRestart = () => {
    setCurrentStepIndex(0);
    setStepSecondsRemaining(selectedExercise.steps[0].durationSeconds);
    setIsRunning(false);
    setIsCompleted(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#faf9f6] rounded-3xl overflow-hidden shadow-2xl border border-stone-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              {selectedExercise.icon}
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-stone-900 leading-tight">
                Somatic Healing & Grounding Room
              </h3>
              <p className="text-[11px] text-stone-500">
                Paced trauma recovery and autonomic nervous system regulation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsVoiceActive(!isVoiceActive)}
              className="p-2 rounded-full text-stone-500 hover:text-stone-900 transition-colors"
              title={isVoiceActive ? 'Mute Voice Guide' : 'Enable Voice Guide'}
            >
              {isVoiceActive ? <Volume2 className="w-4 h-4 text-emerald-700" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Calming Somatic Visual Banner */}
          <div className="relative h-28 rounded-2xl overflow-hidden shadow-xs border border-violet-100">
            <img 
              src={somaticCalmWellness} 
              alt="Somatic Butterfly Calming Art" 
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-linear-to-r from-violet-950/80 via-violet-900/60 to-transparent flex items-center px-5">
              <div className="text-white space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-300">
                  Survivor Somatic Trauma Care
                </span>
                <h4 className="font-display font-bold text-lg text-white">
                  Bilateral Grounding &amp; Body Tension Release
                </h4>
                <p className="text-[11px] text-violet-100/80">
                  Sooth the vagal nerve with gentle tactile rhythms
                </p>
              </div>
            </div>
          </div>

          {/* Exercise Selector Carousel / Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {SOMATIC_EXERCISES.map(ex => (
              <button
                key={ex.id}
                onClick={() => handleSelectExercise(ex)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer border ${
                  selectedExercise.id === ex.id
                    ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                }`}
              >
                <span>{ex.icon}</span>
                <span>{ex.title.split('(')[0]}</span>
              </button>
            ))}
          </div>

          {!isCompleted ? (
            /* Interactive Exercise View */
            <div className="space-y-6">
              {/* Exercise Card Header & Artwork */}
              <div className="rounded-3xl bg-white border border-stone-200 overflow-hidden shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center">
                  <div className="sm:col-span-4 h-40 bg-stone-100 overflow-hidden">
                    <img
                      src="/src/assets/images/card_somatic_exercise_1790415603414.jpg"
                      alt={selectedExercise.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="sm:col-span-8 p-5 space-y-1 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {selectedExercise.durationMinutes} Minutes Session
                      </span>
                      <button
                        onClick={() => speakText(selectedExercise.tagline, language)}
                        className="text-stone-400 hover:text-stone-700"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h3 className="font-display font-bold text-lg text-stone-900">
                      {selectedExercise.title}
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {selectedExercise.tagline}
                    </p>
                  </div>
                </div>
              </div>

              {/* Main Visual Animation Box */}
              <div className="p-6 rounded-3xl bg-gradient-to-b from-[#70865a] to-[#596d46] text-white shadow-md text-center space-y-5 relative overflow-hidden select-none">
                {/* Visual Tactile Cue for Butterfly Hug or Box Breathing */}
                {selectedExercise.id === 'butterfly_hug' ? (
                  <div className="flex items-center justify-center gap-8 py-4">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                      activeHand === 'left' && isRunning
                        ? 'bg-white text-stone-900 scale-110 shadow-lg ring-4 ring-white/40'
                        : 'bg-white/20 text-white/80 scale-95'
                    }`}>
                      <span>LEFT TAP</span>
                    </div>

                    <div className="text-3xl animate-pulse">🦋</div>

                    <div className={`w-20 h-20 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                      activeHand === 'right' && isRunning
                        ? 'bg-white text-stone-900 scale-110 shadow-lg ring-4 ring-white/40'
                        : 'bg-white/20 text-white/80 scale-95'
                    }`}>
                      <span>RIGHT TAP</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-4">
                    <div className={`w-24 h-24 mx-auto rounded-3xl bg-white/20 border-2 border-white/40 flex items-center justify-center text-4xl transition-transform duration-1000 ${
                      isRunning ? 'scale-110' : 'scale-95'
                    }`}>
                      {selectedExercise.icon}
                    </div>
                  </div>
                )}

                {/* Step Content */}
                <div className="space-y-1.5 max-w-md mx-auto">
                  <span className="text-xs uppercase tracking-wider text-emerald-200 font-bold block">
                    Step {currentStepIndex + 1} of {selectedExercise.steps.length}: {step.title}
                  </span>
                  <p className="text-sm sm:text-base font-medium text-white/95 leading-relaxed drop-shadow-xs">
                    "{step.instruction}"
                  </p>
                </div>

                {/* Timer & Controls */}
                <div className="flex items-center justify-center gap-4 pt-2">
                  <div className="font-mono text-xl font-bold text-white/90 tabular-nums">
                    00:{stepSecondsRemaining.toString().padStart(2, '0')}
                  </div>
                  <button
                    onClick={handleStartPause}
                    className="w-12 h-12 rounded-full bg-white text-stone-900 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    aria-label={isRunning ? 'Pause' : 'Play'}
                  >
                    {isRunning ? <Pause className="w-5 h-5 fill-stone-900" /> : <Play className="w-5 h-5 fill-stone-900 ml-0.5" />}
                  </button>
                  <button
                    onClick={handleRestart}
                    className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title="Restart exercise"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Steps Progress Checklist */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-2 text-xs">
                <span className="font-semibold text-stone-500 uppercase tracking-wider text-[10px] block">
                  Session Sequence
                </span>
                <div className="space-y-1.5">
                  {selectedExercise.steps.map((st, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl flex items-center justify-between transition-colors ${
                        idx === currentStepIndex
                          ? 'bg-stone-900 text-white font-medium'
                          : idx < currentStepIndex
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'text-stone-500'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-white/20 text-[10px] flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <span>{st.title}</span>
                      </div>
                      <span className="font-mono text-[11px] opacity-80">
                        {st.durationSeconds}s
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Completed Celebration View */
            <div className="p-8 bg-white rounded-3xl border border-stone-200 text-center space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                <Heart className="w-8 h-8 fill-emerald-600" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-bold text-2xl text-stone-900">
                  Peaceful Rest Achieved
                </h3>
                <p className="text-xs text-stone-600">
                  You completed the {selectedExercise.title}. Your somatic tension index has stabilized.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 max-w-sm mx-auto text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-stone-500">Mindful Recovery Minutes</span>
                  <span className="font-mono font-bold text-stone-900">+{selectedExercise.durationMinutes} mins</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Recorded in Wellness Journal</span>
                  <span className="text-emerald-700 font-semibold">Saved Securely</span>
                </div>
              </div>

              <div className="flex gap-3 justify-center pt-2">
                <button
                  onClick={handleRestart}
                  className="px-4 py-2 rounded-xl bg-stone-100 text-stone-800 text-xs font-semibold hover:bg-stone-200 transition-colors"
                >
                  Repeat Exercise
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
