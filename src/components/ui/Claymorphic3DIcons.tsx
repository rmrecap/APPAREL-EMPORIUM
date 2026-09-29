'use client';

import React from 'react';

/* ─────────────────────────────────────────────────────────────
   Shared 3D Clay & Neon Filter Definitions Component
───────────────────────────────────────────────────────────────── */
export function ClayFiltersDefs({ idPrefix = 'clay' }: { idPrefix?: string }) {
    return (
        <defs>
            {/* Light Mode: Realistic Dual-Drop Clay Shadows */}
            <filter id={`${idPrefix}_shadow`} x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="3" dy="4" stdDeviation="2.8" floodColor="#A39B8D" floodOpacity="0.55" />
                <feDropShadow dx="-2" dy="-2" stdDeviation="1.8" floodColor="#FFFFFF" floodOpacity="0.95" />
            </filter>
            <filter id={`${idPrefix}_emboss`} x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="1.5" dy="2" stdDeviation="1.2" floodColor="#968E80" floodOpacity="0.5" />
                <feDropShadow dx="-1.2" dy="-1.2" stdDeviation="1" floodColor="#FFFFFF" floodOpacity="0.9" />
            </filter>
            <linearGradient id={`${idPrefix}_grad`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F7F2E9" />
                <stop offset="100%" stopColor="#D8D1C3" />
            </linearGradient>
            <linearGradient id={`${idPrefix}_gold_grad`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF8E7" />
                <stop offset="100%" stopColor="#E2D4B7" />
            </linearGradient>

            {/* Dark Mode: Radiant Neon Cyan Holographic Glow */}
            <filter id={`${idPrefix}_neon`} x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#38BDF8" floodOpacity="0.85" />
                <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#67E8F9" floodOpacity="0.95" />
            </filter>
            <linearGradient id={`${idPrefix}_dark_grad`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0E2442" />
                <stop offset="100%" stopColor="#071426" />
            </linearGradient>
        </defs>
    );
}

/* ─────────────────────────────────────────────────────────────
   1. 3D FLOWCHART DIAGRAM (Exact match to Screenshot 2)
───────────────────────────────────────────────────────────────── */
export function Flowchart3DIcon({ className = 'w-full max-w-sm' }: { className?: string }) {
    return (
        <div className={`select-none transition-transform duration-500 hover:scale-[1.02] ${className}`}>
            {/* Light Mode SVG */}
            <svg viewBox="0 0 250 165" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto dark:hidden drop-shadow-sm">
                <ClayFiltersDefs idPrefix="fc_light" />

                {/* Top Node: Processing */}
                <rect x="90" y="6" width="70" height="24" rx="7" fill="url(#fc_light_grad)" stroke="#CCC4B5" strokeWidth="1.2" filter="url(#fc_light_shadow)" />
                <text x="125" y="21" fill="#2D2A26" fontSize="8" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">Processing</text>

                {/* Line down to Manufacturing */}
                <path d="M125 30 L125 47" stroke="#9E9688" strokeWidth="1.8" strokeLinecap="round" filter="url(#fc_light_emboss)" />
                <path d="M122.5 44 L125 48 L127.5 44" stroke="#9E9688" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />

                {/* Left Branch: Order */}
                <rect x="8" y="50" width="56" height="24" rx="7" fill="url(#fc_light_grad)" stroke="#CCC4B5" strokeWidth="1.2" filter="url(#fc_light_shadow)" />
                <text x="36" y="65" fill="#2D2A26" fontSize="8" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">Order</text>

                {/* Arrow to Manufacturing */}
                <path d="M64 62 L87 62" stroke="#9E9688" strokeWidth="1.8" strokeLinecap="round" filter="url(#fc_light_emboss)" />
                <path d="M84 59.5 L88 62 L84 64.5" stroke="#9E9688" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />

                {/* Center Node: Manufacturing */}
                <rect x="90" y="50" width="70" height="24" rx="7" fill="url(#fc_light_grad)" stroke="#CCC4B5" strokeWidth="1.2" filter="url(#fc_light_shadow)" />
                <text x="125" y="65" fill="#2D2A26" fontSize="8" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">Manufacturing</text>

                {/* Line down to Distribution */}
                <path d="M125 74 L125 91" stroke="#9E9688" strokeWidth="1.8" strokeLinecap="round" filter="url(#fc_light_emboss)" />
                <path d="M122.5 88 L125 92 L127.5 88" stroke="#9E9688" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />

                {/* Center Node: Distribution */}
                <rect x="90" y="94" width="70" height="24" rx="7" fill="url(#fc_light_grad)" stroke="#CCC4B5" strokeWidth="1.2" filter="url(#fc_light_shadow)" />
                <text x="125" y="109" fill="#2D2A26" fontSize="8" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">Distribution</text>

                {/* Right Branch: Diamond Quality Decision */}
                <path d="M160 62 L176 62" stroke="#9E9688" strokeWidth="1.8" strokeLinecap="round" filter="url(#fc_light_emboss)" />
                <path d="M173 59.5 L177 62 L173 64.5" stroke="#9E9688" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />

                <polygon points="198,49 220,62 198,75 176,62" fill="url(#fc_light_grad)" stroke="#CCC4B5" strokeWidth="1.2" filter="url(#fc_light_shadow)" />
                <text x="198" y="64" fill="#2D2A26" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">QC Pass</text>

                {/* Down from Diamond to Shipping */}
                <path d="M198 75 L198 116 L188 116" stroke="#9E9688" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" filter="url(#fc_light_emboss)" />
                <path d="M191 113.5 L187 116 L191 118.5" stroke="#9E9688" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />

                {/* Final Node: Shipping */}
                <rect x="135" y="104" width="52" height="24" rx="7" fill="url(#fc_light_grad)" stroke="#CCC4B5" strokeWidth="1.2" filter="url(#fc_light_shadow)" />
                <text x="161" y="119" fill="#2D2A26" fontSize="8" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">Shipping</text>
            </svg>

            {/* Dark Mode SVG */}
            <svg viewBox="0 0 250 165" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto hidden dark:block">
                <ClayFiltersDefs idPrefix="fc_dark" />

                {/* Top Node: Processing */}
                <rect x="90" y="6" width="70" height="24" rx="7" fill="rgba(8, 24, 48, 0.85)" stroke="#38BDF8" strokeWidth="1.5" filter="url(#fc_dark_neon)" />
                <text x="125" y="21" fill="#E0F2FE" fontSize="8" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">Processing</text>

                {/* Line down to Manufacturing */}
                <path d="M125 30 L125 47" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round" filter="url(#fc_dark_neon)" />
                <path d="M122.5 44 L125 48 L127.5 44" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />

                {/* Left Branch: Order */}
                <rect x="8" y="50" width="56" height="24" rx="7" fill="rgba(8, 24, 48, 0.85)" stroke="#38BDF8" strokeWidth="1.5" filter="url(#fc_dark_neon)" />
                <text x="36" y="65" fill="#E0F2FE" fontSize="8" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">Order</text>

                {/* Arrow to Manufacturing */}
                <path d="M64 62 L87 62" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round" filter="url(#fc_dark_neon)" />
                <path d="M84 59.5 L88 62 L84 64.5" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />

                {/* Center Node: Manufacturing */}
                <rect x="90" y="50" width="70" height="24" rx="7" fill="rgba(12, 32, 60, 0.9)" stroke="#38BDF8" strokeWidth="1.5" filter="url(#fc_dark_neon)" />
                <text x="125" y="65" fill="#E0F2FE" fontSize="8" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">Manufacturing</text>

                {/* Line down to Distribution */}
                <path d="M125 74 L125 91" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round" filter="url(#fc_dark_neon)" />
                <path d="M122.5 88 L125 92 L127.5 88" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />

                {/* Center Node: Distribution */}
                <rect x="90" y="94" width="70" height="24" rx="7" fill="rgba(8, 24, 48, 0.85)" stroke="#38BDF8" strokeWidth="1.5" filter="url(#fc_dark_neon)" />
                <text x="125" y="109" fill="#E0F2FE" fontSize="8" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">Distribution</text>

                {/* Right Branch: Diamond Quality Decision */}
                <path d="M160 62 L176 62" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round" filter="url(#fc_dark_neon)" />
                <path d="M173 59.5 L177 62 L173 64.5" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />

                <polygon points="198,49 220,62 198,75 176,62" fill="rgba(14, 165, 233, 0.25)" stroke="#67E8F9" strokeWidth="1.6" filter="url(#fc_dark_neon)" />
                <text x="198" y="64" fill="#E0F2FE" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">QC Pass</text>

                {/* Down from Diamond to Shipping */}
                <path d="M198 75 L198 116 L188 116" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" filter="url(#fc_dark_neon)" />
                <path d="M191 113.5 L187 116 L191 118.5" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />

                {/* Final Node: Shipping */}
                <rect x="135" y="104" width="52" height="24" rx="7" fill="rgba(8, 24, 48, 0.85)" stroke="#38BDF8" strokeWidth="1.5" filter="url(#fc_dark_neon)" />
                <text x="161" y="119" fill="#E0F2FE" fontSize="8" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">Shipping</text>
            </svg>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   2. 3D CLAY QUALITY INSPECTION SHIELD (QC Standard)
───────────────────────────────────────────────────────────────── */
export function QCShield3DIcon({ size = 56, className = '' }: { size?: number; className?: string }) {
    return (
        <div style={{ width: size, height: size }} className={`select-none flex items-center justify-center transition-transform duration-300 hover:scale-110 ${className}`}>
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full dark:hidden">
                <ClayFiltersDefs idPrefix="qc_light" />
                {/* Shield Body */}
                <path d="M32 6 L52 14 C52 36 32 54 32 58 C32 54 12 36 12 14 Z" fill="url(#qc_light_grad)" stroke="#CCC4B5" strokeWidth="1.5" filter="url(#qc_light_shadow)" />
                {/* Inner Bevel */}
                <path d="M32 11 L47 17 C47 34 32 48 32 51 C32 48 17 34 17 17 Z" fill="#E8E2D6" stroke="#DDD7CB" strokeWidth="1" />
                {/* Central Verified Check */}
                <path d="M25 31 L29 35 L39 24" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#qc_light_emboss)" />
            </svg>

            {/* Dark Mode */}
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full hidden dark:block">
                <ClayFiltersDefs idPrefix="qc_dark" />
                <path d="M32 6 L52 14 C52 36 32 54 32 58 C32 54 12 36 12 14 Z" fill="rgba(8, 24, 48, 0.85)" stroke="#38BDF8" strokeWidth="1.6" filter="url(#qc_dark_neon)" />
                <path d="M32 11 L47 17 C47 34 32 48 32 51 C32 48 17 34 17 17 Z" fill="rgba(14, 165, 233, 0.2)" stroke="#67E8F9" strokeWidth="1" />
                <path d="M25 31 L29 35 L39 24" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   3. 3D CLAY TECH-PACK & SAMPLING CLIPBOARD
───────────────────────────────────────────────────────────────── */
export function TechPack3DIcon({ size = 56, className = '' }: { size?: number; className?: string }) {
    return (
        <div style={{ width: size, height: size }} className={`select-none flex items-center justify-center transition-transform duration-300 hover:scale-110 ${className}`}>
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full dark:hidden">
                <ClayFiltersDefs idPrefix="tp_light" />
                {/* Board */}
                <rect x="14" y="12" width="36" height="46" rx="6" fill="url(#tp_light_grad)" stroke="#CCC4B5" strokeWidth="1.5" filter="url(#tp_light_shadow)" />
                {/* Clip */}
                <rect x="24" y="6" width="16" height="10" rx="3" fill="#D3CBC0" stroke="#B8AF9F" strokeWidth="1.2" filter="url(#tp_light_emboss)" />
                <circle cx="32" cy="11" r="2" fill="#FAF7F2" />
                {/* Specs Measurement Lines */}
                <line x1="20" y1="24" x2="44" y2="24" stroke="#9E9688" strokeWidth="2" strokeLinecap="round" />
                <line x1="20" y1="32" x2="38" y2="32" stroke="#9E9688" strokeWidth="2" strokeLinecap="round" />
                <line x1="20" y1="40" x2="42" y2="40" stroke="#9E9688" strokeWidth="2" strokeLinecap="round" />
                <line x1="20" y1="48" x2="34" y2="48" stroke="#9E9688" strokeWidth="2" strokeLinecap="round" />
                {/* Checkmark dot */}
                <circle cx="43" cy="48" r="3" fill="#059669" />
            </svg>

            {/* Dark Mode */}
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full hidden dark:block">
                <ClayFiltersDefs idPrefix="tp_dark" />
                <rect x="14" y="12" width="36" height="46" rx="6" fill="rgba(8, 24, 48, 0.85)" stroke="#38BDF8" strokeWidth="1.6" filter="url(#tp_dark_neon)" />
                <rect x="24" y="6" width="16" height="10" rx="3" fill="rgba(14, 165, 233, 0.3)" stroke="#67E8F9" strokeWidth="1.2" />
                <line x1="20" y1="24" x2="44" y2="24" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
                <line x1="20" y1="32" x2="38" y2="32" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
                <line x1="20" y1="40" x2="42" y2="40" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
                <line x1="20" y1="48" x2="34" y2="48" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
                <circle cx="43" cy="48" r="3" fill="#34D399" />
            </svg>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   4. 3D CLAY SOURCING & TEXTILE PLIES (Factory Merchandising)
───────────────────────────────────────────────────────────────── */
export function SourcingLayers3DIcon({ size = 56, className = '' }: { size?: number; className?: string }) {
    return (
        <div style={{ width: size, height: size }} className={`select-none flex items-center justify-center transition-transform duration-300 hover:scale-110 ${className}`}>
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full dark:hidden">
                <ClayFiltersDefs idPrefix="sl_light" />
                {/* Bottom Layer */}
                <polygon points="32,38 54,48 32,58 10,48" fill="url(#sl_light_grad)" stroke="#CCC4B5" strokeWidth="1.2" filter="url(#sl_light_shadow)" />
                {/* Middle Layer */}
                <polygon points="32,26 54,36 32,46 10,36" fill="url(#sl_light_grad)" stroke="#CCC4B5" strokeWidth="1.2" filter="url(#sl_light_shadow)" />
                {/* Top Layer */}
                <polygon points="32,14 54,24 32,34 10,24" fill="#F8F4ED" stroke="#CCC4B5" strokeWidth="1.4" filter="url(#sl_light_shadow)" />
                {/* Vertical Loom Needle Accent */}
                <line x1="32" y1="4" x2="32" y2="34" stroke="#D97706" strokeWidth="2" strokeLinecap="round" filter="url(#sl_light_emboss)" />
                <circle cx="32" cy="4" r="2.5" fill="#F59E0B" />
            </svg>

            {/* Dark Mode */}
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full hidden dark:block">
                <ClayFiltersDefs idPrefix="sl_dark" />
                <polygon points="32,38 54,48 32,58 10,48" fill="rgba(8, 24, 48, 0.7)" stroke="#0284C7" strokeWidth="1.4" filter="url(#sl_dark_neon)" />
                <polygon points="32,26 54,36 32,46 10,36" fill="rgba(8, 24, 48, 0.85)" stroke="#38BDF8" strokeWidth="1.5" filter="url(#sl_dark_neon)" />
                <polygon points="32,14 54,24 32,34 10,24" fill="rgba(14, 165, 233, 0.3)" stroke="#67E8F9" strokeWidth="1.6" filter="url(#sl_dark_neon)" />
                <line x1="32" y1="4" x2="32" y2="34" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
                <circle cx="32" cy="4" r="2.5" fill="#FBBF24" />
            </svg>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   5. 3D CLAY LOGISTICS & EXPORT DISPATCH TRUCK
───────────────────────────────────────────────────────────────── */
export function LogisticsTruck3DIcon({ size = 56, className = '' }: { size?: number; className?: string }) {
    return (
        <div style={{ width: size, height: size }} className={`select-none flex items-center justify-center transition-transform duration-300 hover:scale-110 ${className}`}>
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full dark:hidden">
                <ClayFiltersDefs idPrefix="lt_light" />
                {/* Cargo Container Body */}
                <rect x="8" y="16" width="34" height="28" rx="5" fill="url(#lt_light_grad)" stroke="#CCC4B5" strokeWidth="1.4" filter="url(#lt_light_shadow)" />
                <line x1="18" y1="20" x2="18" y2="40" stroke="#B8AF9F" strokeWidth="1.5" />
                <line x1="28" y1="20" x2="28" y2="40" stroke="#B8AF9F" strokeWidth="1.5" />
                {/* Driver Cabin */}
                <path d="M42 24 L52 24 L56 34 L56 44 L42 44 Z" fill="url(#lt_light_grad)" stroke="#CCC4B5" strokeWidth="1.4" filter="url(#lt_light_shadow)" />
                <rect x="46" y="27" width="7" height="6" rx="1.5" fill="#93C5FD" stroke="#60A5FA" strokeWidth="1" />
                {/* Wheels */}
                <circle cx="18" cy="47" r="5" fill="#374151" stroke="#E5E7EB" strokeWidth="1.5" />
                <circle cx="18" cy="47" r="2" fill="#E5E7EB" />
                <circle cx="48" cy="47" r="5" fill="#374151" stroke="#E5E7EB" strokeWidth="1.5" />
                <circle cx="48" cy="47" r="2" fill="#E5E7EB" />
            </svg>

            {/* Dark Mode */}
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full hidden dark:block">
                <ClayFiltersDefs idPrefix="lt_dark" />
                <rect x="8" y="16" width="34" height="28" rx="5" fill="rgba(8, 24, 48, 0.85)" stroke="#38BDF8" strokeWidth="1.6" filter="url(#lt_dark_neon)" />
                <line x1="18" y1="20" x2="18" y2="40" stroke="#0284C7" strokeWidth="1.5" />
                <line x1="28" y1="20" x2="28" y2="40" stroke="#0284C7" strokeWidth="1.5" />
                <path d="M42 24 L52 24 L56 34 L56 44 L42 44 Z" fill="rgba(12, 32, 60, 0.9)" stroke="#38BDF8" strokeWidth="1.6" />
                <rect x="46" y="27" width="7" height="6" rx="1.5" fill="rgba(56, 189, 248, 0.4)" />
                <circle cx="18" cy="47" r="5" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" />
                <circle cx="18" cy="47" r="2" fill="#38BDF8" />
                <circle cx="48" cy="47" r="5" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" />
                <circle cx="48" cy="47" r="2" fill="#38BDF8" />
            </svg>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   6. 3D CLAY VISION HORIZON (Telescope & Global Meridian)
───────────────────────────────────────────────────────────────── */
export function Vision3DIcon({ size = 56, className = '' }: { size?: number; className?: string }) {
    return (
        <div style={{ width: size, height: size }} className={`select-none flex items-center justify-center transition-transform duration-300 hover:scale-110 ${className}`}>
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full dark:hidden">
                <ClayFiltersDefs idPrefix="vis_light" />
                {/* Base Pedestal Ring */}
                <ellipse cx="32" cy="48" rx="20" ry="7" fill="url(#vis_light_grad)" stroke="#CCC4B5" strokeWidth="1.4" filter="url(#vis_light_shadow)" />
                {/* Eyepiece Sphere */}
                <circle cx="32" cy="28" r="16" fill="url(#vis_light_grad)" stroke="#CCC4B5" strokeWidth="1.4" filter="url(#vis_light_shadow)" />
                {/* Iris Optics */}
                <circle cx="32" cy="28" r="9" fill="#0284C7" stroke="#38BDF8" strokeWidth="1.5" />
                <circle cx="35" cy="25" r="3" fill="#FFFFFF" opacity="0.8" />
                {/* Orbital Ray Arc */}
                <path d="M12 28 C12 18 52 18 52 28" stroke="#D97706" strokeWidth="1.6" strokeDasharray="3 3" />
            </svg>

            {/* Dark Mode */}
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full hidden dark:block">
                <ClayFiltersDefs idPrefix="vis_dark" />
                <ellipse cx="32" cy="48" rx="20" ry="7" fill="rgba(8, 24, 48, 0.7)" stroke="#0284C7" strokeWidth="1.4" />
                <circle cx="32" cy="28" r="16" fill="rgba(8, 24, 48, 0.9)" stroke="#38BDF8" strokeWidth="1.6" filter="url(#vis_dark_neon)" />
                <circle cx="32" cy="28" r="9" fill="#0369A1" stroke="#67E8F9" strokeWidth="1.5" />
                <circle cx="35" cy="25" r="3" fill="#FFFFFF" opacity="0.9" />
                <path d="M12 28 C12 18 52 18 52 28" stroke="#F59E0B" strokeWidth="1.6" strokeDasharray="3 3" />
            </svg>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   7. 3D CLAY MISSION TARGET (Precision Bullseye & Compass)
───────────────────────────────────────────────────────────────── */
export function Mission3DIcon({ size = 56, className = '' }: { size?: number; className?: string }) {
    return (
        <div style={{ width: size, height: size }} className={`select-none flex items-center justify-center transition-transform duration-300 hover:scale-110 ${className}`}>
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full dark:hidden">
                <ClayFiltersDefs idPrefix="mis_light" />
                {/* Outer Ring */}
                <circle cx="32" cy="32" r="24" fill="url(#mis_light_grad)" stroke="#CCC4B5" strokeWidth="1.4" filter="url(#mis_light_shadow)" />
                {/* Inner Ring */}
                <circle cx="32" cy="32" r="15" fill="#E8E2D6" stroke="#CCC4B5" strokeWidth="1.2" />
                {/* Bullseye Core */}
                <circle cx="32" cy="32" r="6" fill="#DC2626" stroke="#EF4444" strokeWidth="1" filter="url(#mis_light_emboss)" />
                {/* Precision Crosshair Lines */}
                <line x1="32" y1="4" x2="32" y2="12" stroke="#9E9688" strokeWidth="2" strokeLinecap="round" />
                <line x1="32" y1="52" x2="32" y2="60" stroke="#9E9688" strokeWidth="2" strokeLinecap="round" />
                <line x1="4" y1="32" x2="12" y2="32" stroke="#9E9688" strokeWidth="2" strokeLinecap="round" />
                <line x1="52" y1="32" x2="60" y2="32" stroke="#9E9688" strokeWidth="2" strokeLinecap="round" />
            </svg>

            {/* Dark Mode */}
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full hidden dark:block">
                <ClayFiltersDefs idPrefix="mis_dark" />
                <circle cx="32" cy="32" r="24" fill="rgba(8, 24, 48, 0.85)" stroke="#38BDF8" strokeWidth="1.6" filter="url(#mis_dark_neon)" />
                <circle cx="32" cy="32" r="15" fill="rgba(14, 165, 233, 0.2)" stroke="#67E8F9" strokeWidth="1.2" />
                <circle cx="32" cy="32" r="6" fill="#EF4444" stroke="#F87171" strokeWidth="1" />
                <line x1="32" y1="4" x2="32" y2="12" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
                <line x1="32" y1="52" x2="32" y2="60" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
                <line x1="4" y1="32" x2="12" y2="32" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
                <line x1="52" y1="32" x2="60" y2="32" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
            </svg>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   8. 3D CLAY VALUES (Ethical Gemstone / Heart of Trust)
───────────────────────────────────────────────────────────────── */
export function Values3DIcon({ size = 56, className = '' }: { size?: number; className?: string }) {
    return (
        <div style={{ width: size, height: size }} className={`select-none flex items-center justify-center transition-transform duration-300 hover:scale-110 ${className}`}>
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full dark:hidden">
                <ClayFiltersDefs idPrefix="val_light" />
                {/* 3D Diamond / Jewel Outline */}
                <polygon points="32,8 52,22 42,54 22,54 12,22" fill="url(#val_light_grad)" stroke="#CCC4B5" strokeWidth="1.4" filter="url(#val_light_shadow)" />
                {/* Facets */}
                <polygon points="32,8 42,22 22,22" fill="#FAF6EE" stroke="#DDD7CB" strokeWidth="1" />
                <polygon points="22,22 42,22 32,54" fill="#EAE4D8" stroke="#DDD7CB" strokeWidth="1" />
                <polygon points="12,22 22,22 22,54" fill="#DCD5C6" stroke="#CCC4B5" strokeWidth="1" />
                <polygon points="52,22 42,22 42,54" fill="#DCD5C6" stroke="#CCC4B5" strokeWidth="1" />
                {/* Center Sparkle */}
                <circle cx="32" cy="22" r="3" fill="#D97706" />
            </svg>

            {/* Dark Mode */}
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full hidden dark:block">
                <ClayFiltersDefs idPrefix="val_dark" />
                <polygon points="32,8 52,22 42,54 22,54 12,22" fill="rgba(8, 24, 48, 0.85)" stroke="#38BDF8" strokeWidth="1.6" filter="url(#val_dark_neon)" />
                <polygon points="32,8 42,22 22,22" fill="rgba(14, 165, 233, 0.35)" stroke="#67E8F9" strokeWidth="1" />
                <polygon points="22,22 42,22 32,54" fill="rgba(14, 165, 233, 0.2)" stroke="#67E8F9" strokeWidth="1" />
                <circle cx="32" cy="22" r="3" fill="#F59E0B" />
            </svg>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   9. 3D CLAY CONTACT MAP PIN (Address)
───────────────────────────────────────────────────────────────── */
export function MapPin3DIcon({ size = 36, className = '' }: { size?: number; className?: string }) {
    return (
        <div style={{ width: size, height: size }} className={`select-none flex items-center justify-center transition-transform duration-300 hover:scale-115 ${className}`}>
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full dark:hidden">
                <ClayFiltersDefs idPrefix="pin_light" />
                {/* Radar Ground Shadow */}
                <ellipse cx="24" cy="44" rx="10" ry="3" fill="#A39B8D" opacity="0.4" />
                {/* Pin Head */}
                <path d="M24 4 C15 4 8 11 8 20 C8 31 24 44 24 44 C24 44 40 31 40 20 C40 11 33 4 24 4 Z" fill="url(#pin_light_grad)" stroke="#CCC4B5" strokeWidth="1.4" filter="url(#pin_light_shadow)" />
                {/* Inner Core */}
                <circle cx="24" cy="18" r="6" fill="#EA580C" stroke="#F97316" strokeWidth="1" />
            </svg>

            {/* Dark Mode */}
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full hidden dark:block">
                <ClayFiltersDefs idPrefix="pin_dark" />
                <path d="M24 4 C15 4 8 11 8 20 C8 31 24 44 24 44 C24 44 40 31 40 20 C40 11 33 4 24 4 Z" fill="rgba(8, 24, 48, 0.9)" stroke="#38BDF8" strokeWidth="1.6" filter="url(#pin_dark_neon)" />
                <circle cx="24" cy="18" r="6" fill="#F97316" stroke="#FB923C" strokeWidth="1" />
            </svg>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   10. 3D CLAY EMAIL ENVELOPE (Email Icon)
───────────────────────────────────────────────────────────────── */
export function Mail3DIcon({ size = 36, className = '' }: { size?: number; className?: string }) {
    return (
        <div style={{ width: size, height: size }} className={`select-none flex items-center justify-center transition-transform duration-300 hover:scale-115 ${className}`}>
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full dark:hidden">
                <ClayFiltersDefs idPrefix="mail_light" />
                <rect x="6" y="10" width="36" height="28" rx="5" fill="url(#mail_light_grad)" stroke="#CCC4B5" strokeWidth="1.4" filter="url(#mail_light_shadow)" />
                <path d="M8 12 L24 26 L40 12" stroke="#9E9688" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="24" cy="27" r="3.5" fill="#2563EB" />
            </svg>

            {/* Dark Mode */}
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full hidden dark:block">
                <ClayFiltersDefs idPrefix="mail_dark" />
                <rect x="6" y="10" width="36" height="28" rx="5" fill="rgba(8, 24, 48, 0.9)" stroke="#38BDF8" strokeWidth="1.6" filter="url(#mail_dark_neon)" />
                <path d="M8 12 L24 26 L40 12" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="24" cy="27" r="3.5" fill="#60A5FA" />
            </svg>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   11. 3D CLAY TELEPHONE RECEIVER (Phone Icon)
───────────────────────────────────────────────────────────────── */
export function Phone3DIcon({ size = 36, className = '' }: { size?: number; className?: string }) {
    return (
        <div style={{ width: size, height: size }} className={`select-none flex items-center justify-center transition-transform duration-300 hover:scale-115 ${className}`}>
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full dark:hidden">
                <ClayFiltersDefs idPrefix="ph_light" />
                <rect x="12" y="6" width="24" height="36" rx="6" fill="url(#ph_light_grad)" stroke="#CCC4B5" strokeWidth="1.4" filter="url(#ph_light_shadow)" />
                <rect x="16" y="12" width="16" height="20" rx="2" fill="#E8E2D6" stroke="#CCC4B5" strokeWidth="1" />
                <circle cx="24" cy="37" r="2.5" fill="#10B981" />
                <line x1="20" y1="9" x2="28" y2="9" stroke="#9E9688" strokeWidth="1.5" strokeLinecap="round" />
            </svg>

            {/* Dark Mode */}
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full hidden dark:block">
                <ClayFiltersDefs idPrefix="ph_dark" />
                <rect x="12" y="6" width="24" height="36" rx="6" fill="rgba(8, 24, 48, 0.9)" stroke="#38BDF8" strokeWidth="1.6" filter="url(#ph_dark_neon)" />
                <rect x="16" y="12" width="16" height="20" rx="2" fill="rgba(14, 165, 233, 0.25)" stroke="#67E8F9" strokeWidth="1" />
                <circle cx="24" cy="37" r="2.5" fill="#34D399" />
                <line x1="20" y1="9" x2="28" y2="9" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        </div>
    );
}
