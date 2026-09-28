import React from 'react';
import { Mic, Volume2, Sparkles, ChevronRight } from 'lucide-react';
import { LanguageCode } from '../types';

interface VoiceCheckInCardProps {
  onStartVoice: () => void;
  language: LanguageCode;
  className?: string;
}

export const VoiceCheckInCard: React.FC<VoiceCheckInCardProps> = ({
  onStartVoice,
  language,
  className = '',
}) => {
  return (
    <div
      className={`rounded-2xl bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white p-5 shadow-lg border border-teal-700/50 flex flex-col justify-between relative overflow-hidden group ${className}`}
    >
      {/* Decorative background glow */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-teal-400/20 rounded-full blur-2xl group-hover:bg-teal-400/30 transition-all pointer-events-none" />

      <div className="space-y-3 relative z-10">
        <div className="flex items-center justify-between">
          <span className="px-2 py-0.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-200 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
            <Mic className="w-3 h-3 text-teal-300 animate-pulse" />
            <span>Voice Audio</span>
          </span>
          <span className="text-[10px] text-teal-200/70 font-medium">Hands-free</span>
        </div>

        <div>
          <h3 className="font-display font-bold text-base text-white leading-tight">
            Voice Check-In
          </h3>
          <p className="text-xs text-teal-100/80 mt-1 leading-relaxed">
            Speak instead of typing. Share how you feel in your native language.
          </p>
          <p className="text-[11px] text-teal-200/60 mt-0.5">
            बोलकर अपनी बात कहें · Review text before send
          </p>
        </div>
      </div>

      <div className="pt-4 relative z-10">
        <button
          onClick={onStartVoice}
          className="w-full py-2.5 px-4 bg-white text-teal-950 hover:bg-teal-50 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer group-hover:shadow-teal-900/40"
        >
          <Mic className="w-4 h-4 text-teal-800" />
          <span>Start Voice Check-In</span>
          <ChevronRight className="w-3.5 h-3.5 text-teal-600 ml-auto group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
