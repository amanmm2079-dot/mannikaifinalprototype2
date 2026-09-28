import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Sparkles, 
  Check, 
  Clock, 
  Compass, 
  Wind,
  ShieldCheck,
  Heart
} from 'lucide-react';
import { LanguageCode } from '../types';
import { TRANSLATIONS } from '../services/i18n';
import zenShantiSanctuary from '../assets/images/zen_shanti_sanctuary_1790578927980.jpg';

interface GroundingModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
  victimAlias?: string;
}

type BreathPhase = 'in' | 'hold' | 'out';

interface Soundscape {
  id: string;
  name: string;
  tagline: string;
  bgHue: string;
  cardColor: string;
  icon: string;
}

const SOUNDSCAPES: Soundscape[] = [
  {
    id: 'bamboo_rain',
    name: 'Bamboo Rain',
    tagline: 'Gentle rain tapping on a bamboo forest canopy',
    bgHue: 'from-emerald-900 to-stone-900',
    cardColor: 'bg-[#7c8f69]', // Olive sage from reference image
    icon: '🎋',
  },
  {
    id: 'morning_breeze',
    name: 'Morning Breeze',
    tagline: 'Cool mountain air rustling through deodar pines',
    bgHue: 'from-amber-950 to-stone-900',
    cardColor: 'bg-[#d96b27]', // Terracotta orange from reference image
    icon: '🍃',
  },
  {
    id: 'temple_peace',
    name: 'Temple Chimes',
    tagline: 'Deep resonant bronze singing bowl & evening calm',
    bgHue: 'from-stone-800 to-stone-900',
    cardColor: 'bg-[#847563]',
    icon: '🔔',
  },
  {
    id: 'river_flow',
    name: 'Narmada Stream',
    tagline: 'Pebbles smoothed by gentle sacred waters',
    bgHue: 'from-teal-950 to-stone-900',
    cardColor: 'bg-[#517a78]',
    icon: '🌊',
  }
];

export const GroundingModal: React.FC<GroundingModalProps> = ({
  isOpen,
  onClose,
  language,
  victimAlias = 'Survivor Friend',
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [isActive, setIsActive] = useState(true);
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('in');
  const [secondsRemaining, setSecondsRemaining] = useState(600); // 10 minutes session
  const [phaseSeconds, setPhaseSeconds] = useState(4);
  const [selectedSoundscape, setSelectedSoundscape] = useState<Soundscape>(SOUNDSCAPES[0]);
  const [isMuted, setIsMuted] = useState(false);
  const [totalCompletedMinutes, setTotalCompletedMinutes] = useState(25);
  const [isCompleted, setIsCompleted] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Breath rhythm: 4s Breathe In, 4s Hold, 4s Breathe Out
  useEffect(() => {
    if (!isOpen || !isActive || isCompleted) return;

    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          setIsCompleted(true);
          setTotalCompletedMinutes(m => m + 10);
          return 0;
        }
        return prev - 1;
      });

      setPhaseSeconds(prev => {
        if (prev <= 1) {
          // Switch phase
          if (breathPhase === 'in') {
            setBreathPhase('hold');
            return 4;
          } else if (breathPhase === 'hold') {
            setBreathPhase('out');
            return 6;
          } else {
            setBreathPhase('in');
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isActive, breathPhase, isCompleted]);

  // Gentle synthesized pink ambient drone for relaxation
  useEffect(() => {
    if (!isOpen || isMuted || !isActive) {
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.linearRampToValueAtTime(0.001, (audioCtxRef.current?.currentTime || 0) + 0.5);
      }
      return;
    }

    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }

      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      // Generate a warm peaceful chord
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Gentle frequency corresponding to soundscape
      osc.frequency.setValueAtTime(selectedSoundscape.id === 'bamboo_rain' ? 174 : selectedSoundscape.id === 'morning_breeze' ? 216 : 144, ctx.currentTime);
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 1.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      oscillatorRef.current = osc;
      gainNodeRef.current = gain;

      return () => {
        try {
          osc.stop();
          osc.disconnect();
        } catch (e) { /* ignore */ }
      };
    } catch (err) {
      // Audio not permitted or supported; silent fallback
    }
  }, [isOpen, isMuted, isActive, selectedSoundscape]);

  if (!isOpen) return null;

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseText = () => {
    switch (breathPhase) {
      case 'in': return t.breatheIn;
      case 'hold': return t.holdBreath;
      case 'out': return t.breatheOut;
    }
  };

  const getPhaseTheme = () => {
    if (breathPhase === 'in') {
      return {
        bg: 'bg-[#70865a]', // Olive sage from reference image
        scale: 'scale-110',
        ringClass: 'scale-125 opacity-40',
      };
    }
    if (breathPhase === 'hold') {
      return {
        bg: 'bg-[#8c7853]', // Warm ochre
        scale: 'scale-105',
        ringClass: 'scale-110 opacity-30',
      };
    }
    return {
      bg: 'bg-[#d96b27]', // Terracotta orange from reference image
      scale: 'scale-90',
      ringClass: 'scale-95 opacity-20',
    };
  };

  const theme = getPhaseTheme();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#faf8f5] rounded-3xl overflow-hidden shadow-2xl border border-stone-200 flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-white/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
              <Wind className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-stone-900 text-base leading-tight">
                {t.groundingSpace}
              </h3>
              <p className="text-xs text-stone-500">
                Paced Grounding & Somatic De-escalation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              title={isMuted ? 'Unmute Ambient Tone' : 'Mute Tone'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-700" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              title="Close Grounding Space"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Calming Visual Header Banner */}
          <div className="relative h-28 rounded-2xl overflow-hidden shadow-xs border border-stone-200">
            <img 
              src={zenShantiSanctuary} 
              alt="Zen Sanctuary Water Lotus" 
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-linear-to-r from-emerald-950/80 via-emerald-900/60 to-transparent flex items-center px-5">
              <div className="text-white space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                  Mindful Grounding Sanctuary
                </span>
                <h4 className="font-display font-bold text-lg text-white">
                  Paced Breath &amp; Sensory De-escalation
                </h4>
                <p className="text-[11px] text-emerald-100/80">
                  Inhale safety · Hold presence · Exhale tension
                </p>
              </div>
            </div>
          </div>

          {!isCompleted ? (
            <>
              {/* Central Serene Breathing Card (Faithful to reference image) */}
              <div 
                className={`relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-3xl ${theme.bg} text-white flex flex-col items-center justify-center p-6 transition-colors duration-1000 shadow-lg overflow-hidden select-none`}
              >
                {/* Concentric ripples from reference image */}
                <div 
                  className={`absolute w-72 h-72 rounded-full bg-white/10 border border-white/20 transition-all duration-1000 ease-in-out ${theme.ringClass}`} 
                />
                <div 
                  className={`absolute w-52 h-52 rounded-full bg-white/15 transition-all duration-1000 ease-in-out ${theme.ringClass}`} 
                />

                {/* Soundscape pill tag in top-right */}
                <div className="absolute top-4 right-5 px-3 py-1 rounded-full bg-black/20 backdrop-blur-sm text-[11px] font-medium tracking-wide flex items-center gap-1.5 text-white/90">
                  <span>{selectedSoundscape.icon}</span>
                  <span>{selectedSoundscape.name}</span>
                </div>

                {/* Breathing Cue Text */}
                <div className="relative z-10 text-center space-y-2">
                  <h2 className="font-display font-semibold text-3xl sm:text-4xl text-white tracking-tight drop-shadow-sm transition-all duration-500">
                    {getPhaseText()}
                  </h2>
                  <p className="text-white/80 text-sm font-medium">
                    {breathPhase === 'in' ? 'Feel gentle air fill your chest' : breathPhase === 'hold' ? 'Soft stillness, you are safe here' : 'Release tension with your breath'}
                  </p>
                </div>

                {/* Bottom Timer & Play/Pause Controls */}
                <div className="absolute bottom-6 flex items-center gap-4 z-10">
                  <div className="font-mono text-lg font-bold tracking-wider text-white/90 tabular-nums">
                    {formatTimer(secondsRemaining)}
                  </div>
                  <button
                    onClick={() => setIsActive(!isActive)}
                    className="w-12 h-12 rounded-full bg-white text-stone-900 flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    aria-label={isActive ? 'Pause Breathing' : 'Resume Breathing'}
                  >
                    {isActive ? <Pause className="w-5 h-5 fill-stone-900" /> : <Play className="w-5 h-5 fill-stone-900 ml-0.5" />}
                  </button>
                </div>
              </div>

              {/* Soundscape Options Selector (from reference image) */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Select Calming Soundscape
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {SOUNDSCAPES.map(scape => (
                    <button
                      key={scape.id}
                      onClick={() => setSelectedSoundscape(scape)}
                      className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        selectedSoundscape.id === scape.id
                          ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                          : 'bg-white text-stone-800 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <span className="text-2xl">{scape.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs">{scape.name}</span>
                          {selectedSoundscape.id === scape.id && (
                            <Check className="w-3.5 h-3.5 text-teal-400" />
                          )}
                        </div>
                        <p className={`text-[11px] mt-0.5 line-clamp-1 ${selectedSoundscape.id === scape.id ? 'text-stone-300' : 'text-stone-500'}`}>
                          {scape.tagline}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Completed Session Card (Faithful to "Good job, Shinomiya!" from reference image) */
            <div className="p-6 bg-white rounded-3xl border border-stone-200 text-center space-y-5 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                <Heart className="w-8 h-8 fill-emerald-600" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-bold text-2xl text-stone-900">
                  Good Job, {victimAlias}!
                </h3>
                <p className="text-stone-600 text-sm">
                  You completed your 10-minute grounding and breathing session.
                </p>
              </div>

              {/* Key Metrics grid (matching reference image) */}
              <div className="bg-stone-50 rounded-2xl p-4 text-left border border-stone-200/60 divide-y divide-stone-200/60 text-xs">
                <div className="flex items-center justify-between py-2">
                  <span className="text-stone-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Total Mindful Minutes
                  </span>
                  <span className="font-bold text-stone-900 font-mono">
                    {totalCompletedMinutes} min
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-stone-500">Selected Soundscape</span>
                  <span className="font-medium text-stone-900">
                    {selectedSoundscape.name}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-stone-500">Somatic Disruption Trend</span>
                  <span className="font-semibold text-emerald-700 font-mono">
                    -18% Stress Reduction
                  </span>
                </div>
              </div>

              <div className="flex gap-3 justify-center pt-2">
                <button
                  onClick={() => {
                    setIsCompleted(false);
                    setSecondsRemaining(600);
                    setIsActive(true);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-100 text-stone-800 hover:bg-stone-200 transition-colors cursor-pointer"
                >
                  Breathe Again
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="px-6 py-3 bg-stone-100/80 border-t border-stone-200 text-center">
          <p className="text-[11px] text-stone-500">
            {t.wellnessTip} · Non-clinical somatic regulation tool
          </p>
        </div>
      </div>
    </div>
  );
};
