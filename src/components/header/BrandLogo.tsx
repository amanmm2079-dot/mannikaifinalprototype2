import React from 'react';
import { LanguageCode } from '../../types';
import { t } from '../../i18n';

interface BrandLogoProps {
  onNavigateHome: () => void;
  language?: LanguageCode;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ onNavigateHome, language = 'en' }) => {
  return (
    <button
      onClick={onNavigateHome}
      className="flex items-center gap-3 text-left group focus:outline-none cursor-pointer transition-opacity hover:opacity-95"
      aria-label="Mannik AI Care Core - Return to Home"
    >
      {/* Circular/rounded teal logo icon with "M" */}
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F9D8A] to-[#19B6A5] text-white flex items-center justify-center font-display font-bold text-xl shadow-xs shrink-0 select-none group-hover:scale-105 transition-transform duration-150">
        M
      </div>

      {/* Brand typography */}
      <div className="flex flex-col justify-center min-w-0">
        <div className="flex items-center gap-2 flex-nowrap">
          <span className="font-display font-bold text-lg sm:text-[19px] text-[#172033] tracking-tight whitespace-nowrap leading-none">
            {t(language, 'common.appName')}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#0F9D8A] bg-[#E8F8F5] px-1.5 py-0.5 rounded border border-[#0F9D8A]/20 whitespace-nowrap leading-none">
            CARE CORE
          </span>
        </div>
        <span className="text-[11px] text-[#667085] whitespace-nowrap font-medium leading-tight mt-1 hidden sm:block">
          {t(language, 'common.tagline')}
        </span>
      </div>
    </button>
  );
};
