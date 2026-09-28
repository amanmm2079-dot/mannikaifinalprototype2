import React from 'react';

/**
 * Editorial Health-Tech SVG Illustrations
 * Clean, modern, friendly vector artwork with White, Teal (#14B8A6), Blue (#3B82F6),
 * Violet (#8B5CF6), and Amber (#F59E0B) palettes.
 */

// 1. Dashboard Header / Welcome Illustration (Human + AI Collaboration)
export const HeroCollaborationIllustration: React.FC<{ className?: string }> = ({ className = 'w-48 h-32' }) => (
  <svg viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="heroTealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#0D9488" stopOpacity="0.9" />
      </linearGradient>
      <linearGradient id="heroBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#2563EB" stopOpacity="0.9" />
      </linearGradient>
      <linearGradient id="heroVioletGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.15" />
        <stop offset="100%" stopColor="#EC4899" stopOpacity="0.05" />
      </linearGradient>
    </defs>

    {/* Soft ambient background glow */}
    <circle cx="120" cy="80" r="64" fill="url(#heroVioletGrad)" filter="blur(8px)" />
    <circle cx="170" cy="60" r="40" fill="#E0F2FE" fillOpacity="0.5" />
    <circle cx="70" cy="100" r="45" fill="#CCFBF1" fillOpacity="0.6" />

    {/* Connecting subtle pulse waves */}
    <path d="M 40 80 Q 80 40, 120 80 T 200 80" stroke="#99F6E4" strokeWidth="2" strokeDasharray="4 4" />
    <path d="M 60 95 Q 110 65, 160 95" stroke="#BFDBFE" strokeWidth="1.5" />

    {/* Human Figure (Counsellor / Caregiver) */}
    <g transform="translate(45, 35)">
      {/* Head */}
      <circle cx="30" cy="22" r="14" fill="#0D9488" />
      {/* Torso */}
      <path d="M 12 65 C 12 44, 48 44, 48 65 Z" fill="url(#heroTealGrad)" />
      {/* Open supportive arm gesture */}
      <path d="M 46 50 C 58 45, 68 55, 78 52" stroke="#14B8A6" strokeWidth="4" strokeLinecap="round" />
    </g>

    {/* Human Figure 2 (Survivor being supported) */}
    <g transform="translate(135, 42)">
      {/* Head */}
      <circle cx="28" cy="20" r="13" fill="#3B82F6" />
      {/* Torso */}
      <path d="M 12 58 C 12 40, 44 40, 44 58 Z" fill="url(#heroBlueGrad)" />
      {/* Hand reaching forward */}
      <path d="M 12 48 C 0 44, -10 52, -18 52" stroke="#60A5FA" strokeWidth="4" strokeLinecap="round" />
    </g>

    {/* Central Shield of Trust & Protection */}
    <g transform="translate(108, 48)">
      <circle cx="12" cy="12" r="16" fill="#FFFFFF" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.06))" />
      <path d="M 12 5 L 20 8 V 14 C 20 18, 16.5 21, 12 22 C 7.5 21, 4 18, 4 14 V 8 Z" fill="#14B8A6" />
      <path d="M 9 13 L 11 15 L 15 10" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>

    {/* Subtle floating digital wellbeing nodes */}
    <circle cx="35" cy="40" r="3" fill="#14B8A6" />
    <circle cx="205" cy="45" r="4" fill="#8B5CF6" />
    <circle cx="195" cy="115" r="3.5" fill="#3B82F6" />
    <circle cx="45" cy="125" r="3" fill="#F59E0B" />
  </svg>
);

// 2. Human-in-the-Loop Pipeline Flow Illustration
export const PipelineFlowIllustration: React.FC<{ className?: string }> = ({ className = 'w-full max-w-xl h-24' }) => (
  <svg viewBox="0 0 540 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    {/* Stage 1: AI Screening */}
    <g transform="translate(20, 15)">
      <rect width="90" height="50" rx="12" fill="#F0FDFA" stroke="#99F6E4" strokeWidth="1.5" />
      <circle cx="24" cy="25" r="10" fill="#CCFBF1" />
      <path d="M 21 25 L 27 25 M 24 22 L 24 28" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" />
      <text x="40" y="24" fill="#134E4A" fontSize="10" fontWeight="bold">AI Screening</text>
      <text x="40" y="36" fill="#0D9488" fontSize="8">Multimodal intake</text>
    </g>

    {/* Arrow 1 */}
    <path d="M 115 40 L 138 40" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="3 3" />
    <polygon points="138,37 144,40 138,43" fill="#94A3B8" />

    {/* Stage 2: Signal Detection */}
    <g transform="translate(148, 15)">
      <rect width="90" height="50" rx="12" fill="#F5F3FF" stroke="#DDD6FE" strokeWidth="1.5" />
      <circle cx="24" cy="25" r="10" fill="#EDE9FE" />
      <path d="M 20 28 L 23 21 L 26 26 L 29 22" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <text x="40" y="24" fill="#4C1D95" fontSize="10" fontWeight="bold">AI Signal</text>
      <text x="40" y="36" fill="#7C3AED" fontSize="8">Distress indicator</text>
    </g>

    {/* Arrow 2 */}
    <path d="M 243 40 L 266 40" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="3 3" />
    <polygon points="266,37 272,40 266,43" fill="#94A3B8" />

    {/* Stage 3: Human Validation (Highlighted Center) */}
    <g transform="translate(276, 12)">
      <rect width="100" height="56" rx="14" fill="#FFFFFF" stroke="#0D9488" strokeWidth="2" filter="drop-shadow(0 4px 6px rgba(13,148,136,0.12))" />
      <circle cx="26" cy="28" r="12" fill="#CCFBF1" />
      <path d="M 22 28 L 25 31 L 31 24" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <text x="44" y="26" fill="#0F172A" fontSize="10" fontWeight="bold">Human Review</text>
      <text x="44" y="38" fill="#0D9488" fontSize="8" fontWeight="600">Decision Authority</text>
    </g>

    {/* Arrow 3 */}
    <path d="M 381 40 L 404 40" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="3 3" />
    <polygon points="404,37 410,40 404,43" fill="#94A3B8" />

    {/* Stage 4: Human Intervention */}
    <g transform="translate(414, 15)">
      <rect width="105" height="50" rx="12" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="1.5" />
      <circle cx="24" cy="25" r="10" fill="#DBEAFE" />
      <path d="M 20 25 C 20 22, 28 22, 28 25 V 29 H 20 Z" fill="#2563EB" />
      <text x="38" y="24" fill="#1E3A8A" fontSize="10" fontWeight="bold">Welfare Action</text>
      <text x="38" y="36" fill="#2563EB" fontSize="8">Legal & Shelter Aid</text>
    </g>
  </svg>
);

// 3. Human Support Care Illustration (Counsellor & Person in Conversation)
export const HumanSupportCareIllustration: React.FC<{ className?: string }> = ({ className = 'w-40 h-32' }) => (
  <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="warmBgGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#F0FDFA" />
        <stop offset="100%" stopColor="#EFF6FF" />
      </linearGradient>
    </defs>
    
    {/* Soft background shape */}
    <rect x="10" y="10" width="180" height="140" rx="24" fill="url(#warmBgGrad)" />

    {/* Table / Surface */}
    <path d="M 40 120 L 160 120" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />

    {/* Warm Tea / Ceramic Bowl on table */}
    <path d="M 94 116 C 94 122, 106 122, 106 116 Z" fill="#14B8A6" />
    <path d="M 98 111 Q 100 106, 99 102" stroke="#99F6E4" strokeWidth="1.5" strokeLinecap="round" />

    {/* Counsellor (Left) */}
    <circle cx="65" cy="65" r="13" fill="#0D9488" />
    <path d="M 50 115 C 50 92, 80 92, 80 115 Z" fill="#14B8A6" />

    {/* Survivor (Right) */}
    <circle cx="135" cy="68" r="12" fill="#3B82F6" />
    <path d="M 120 115 C 120 95, 150 95, 150 115 Z" fill="#60A5FA" />

    {/* Heart Speech Bubble between them */}
    <g transform="translate(88, 38)">
      <rect width="24" height="20" rx="6" fill="#FFFFFF" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.08))" />
      <polygon points="98,20 102,24 104,20" fill="#FFFFFF" />
      <path d="M 96 46 C 93 43, 91 46, 96 50 C 101 46, 99 43, 96 46 Z" fill="#F43F5E" transform="scale(0.8) translate(20, -10)" />
      <circle cx="12" cy="10" r="3" fill="#14B8A6" />
    </g>

    {/* Gentle plant foliage on the side */}
    <path d="M 28 120 Q 22 95, 34 85 Q 32 105, 28 120" fill="#A7F3D0" />
    <path d="M 28 120 Q 36 100, 42 96 Q 36 110, 28 120" fill="#6EE7B7" />
  </svg>
);

// 4. Empty State Illustration (Checklist / Caught Up)
export const EmptyStateIllustration: React.FC<{ className?: string }> = ({ className = 'w-32 h-32' }) => (
  <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <circle cx="80" cy="80" r="60" fill="#F0FDFA" />
    <circle cx="80" cy="80" r="45" fill="#CCFBF1" fillOpacity="0.5" />
    
    {/* Clipboard / Card */}
    <rect x="50" y="45" width="60" height="75" rx="10" fill="#FFFFFF" stroke="#99F6E4" strokeWidth="2" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.05))" />
    
    {/* Top Clip */}
    <rect x="68" y="38" width="24" height="12" rx="4" fill="#0D9488" />

    {/* Checked item 1 */}
    <circle cx="64" cy="65" r="5" fill="#14B8A6" />
    <path d="M 62 65 L 63.5 66.5 L 66 63.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
    <rect x="74" y="63" width="26" height="4" rx="2" fill="#E2E8F0" />

    {/* Checked item 2 */}
    <circle cx="64" cy="80" r="5" fill="#14B8A6" />
    <path d="M 62 80 L 63.5 81.5 L 66 78.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
    <rect x="74" y="78" width="22" height="4" rx="2" fill="#E2E8F0" />

    {/* Checked item 3 */}
    <circle cx="64" cy="95" r="5" fill="#14B8A6" />
    <path d="M 62 95 L 63.5 96.5 L 66 93.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
    <rect x="74" y="93" width="28" height="4" rx="2" fill="#E2E8F0" />

    {/* Sparkle */}
    <path d="M 120 45 L 122 50 L 127 52 L 122 54 L 120 59 L 118 54 L 113 52 L 118 50 Z" fill="#F59E0B" />
  </svg>
);

// 5. Login Branding Illustration (Care + Intelligent Shield)
export const LoginCareIllustration: React.FC<{ className?: string }> = ({ className = 'w-72 h-72' }) => (
  <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="loginTealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#14B8A6" />
        <stop offset="100%" stopColor="#0D9488" />
      </linearGradient>
      <linearGradient id="loginBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#1D4ED8" />
      </linearGradient>
      <linearGradient id="loginBlobGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F0FDFA" />
        <stop offset="100%" stopColor="#EFF6FF" />
      </linearGradient>
    </defs>

    {/* Soft organic background circles */}
    <circle cx="150" cy="150" r="120" fill="url(#loginBlobGrad)" />
    <circle cx="210" cy="110" r="60" fill="#E0F2FE" fillOpacity="0.5" />
    <circle cx="90" cy="190" r="70" fill="#CCFBF1" fillOpacity="0.6" />

    {/* Concentric ripple rings representing calm & safety */}
    <circle cx="150" cy="150" r="95" stroke="#99F6E4" strokeWidth="1.5" strokeDasharray="6 6" />
    <circle cx="150" cy="150" r="75" stroke="#BFDBFE" strokeWidth="1.5" />

    {/* Central Shield with Heart & Star of Care */}
    <g transform="translate(110, 90)">
      <path d="M 40 10 L 72 22 V 55 C 72 75, 58 92, 40 98 C 22 92, 8 75, 8 55 V 22 Z" fill="#FFFFFF" stroke="#14B8A6" strokeWidth="3" filter="drop-shadow(0 10px 15px rgba(13,148,136,0.15))" />
      <path d="M 40 18 L 66 28 V 53 C 66 69, 54 84, 40 89 C 26 84, 14 69, 14 53 V 28 Z" fill="url(#loginTealGrad)" />

      {/* Heart inside shield */}
      <path d="M 40 42 C 34 34, 25 38, 25 47 C 25 57, 36 64, 40 68 C 44 64, 55 57, 55 47 C 55 38, 46 34, 40 42 Z" fill="#FFFFFF" />
    </g>

    {/* Surrounding Human & Node connections */}
    <circle cx="70" cy="110" r="16" fill="#3B82F6" />
    <path d="M 50 160 C 50 135, 90 135, 90 160 Z" fill="url(#loginBlueGrad)" />

    <circle cx="230" cy="170" r="15" fill="#8B5CF6" />
    <path d="M 212 215 C 212 192, 248 192, 248 215 Z" fill="#7C3AED" />

    {/* Connecting tech dots */}
    <circle cx="100" cy="70" r="4" fill="#14B8A6" />
    <circle cx="220" cy="80" r="5" fill="#F59E0B" />
    <circle cx="150" cy="245" r="4" fill="#3B82F6" />
  </svg>
);
