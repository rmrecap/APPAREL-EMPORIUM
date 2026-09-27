'use client';

import React from 'react';

// ─── 3D GARMENT BUTTON ───
export function GarmentButton3D({ 
    size = 48, 
    className = '', 
    rotation = 0 
}: { 
    size?: number; 
    className?: string; 
    rotation?: number; 
}) {
    return (
        <div 
            style={{ 
                width: size, 
                height: size, 
                transform: `rotate(${rotation}deg)` 
            }}
            className={`relative rounded-full select-none pointer-events-none transition-transform duration-700 ${className}`}
        >
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.12)] dark:drop-shadow-[0_0_16px_rgba(6,182,212,0.55)]">
                <defs>
                    <radialGradient id="btnLight" cx="35%" cy="35%" r="65%">
                        <stop offset="0%" stopColor="#FFFFFF" />
                        <stop offset="50%" stopColor="#E2DDD5" />
                        <stop offset="100%" stopColor="#C4BCB0" />
                    </radialGradient>
                    <radialGradient id="btnDark" cx="35%" cy="35%" r="65%">
                        <stop offset="0%" stopColor="#1E293B" />
                        <stop offset="60%" stopColor="#0B1324" />
                        <stop offset="100%" stopColor="#020617" />
                    </radialGradient>
                    <filter id="btnInset">
                        <feOffset dx="1" dy="2" />
                        <feGaussianBlur stdDeviation="2" result="offset-blur" />
                        <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
                        <feFlood floodColor="black" floodOpacity="0.3" result="color" />
                        <feComposite operator="in" in="color" in2="inverse" result="shadow" />
                        <feComposite operator="over" in="shadow" in2="SourceGraphic" />
                    </filter>
                </defs>

                {/* Outer Rim */}
                <circle 
                    cx="50" 
                    cy="50" 
                    r="46" 
                    className="fill-[url(#btnLight)] dark:fill-[url(#btnDark)] stroke-white/80 dark:stroke-cyan-400/70" 
                    strokeWidth="3"
                />

                {/* Inner Recessed Groove */}
                <circle 
                    cx="50" 
                    cy="50" 
                    r="34" 
                    className="fill-black/5 dark:fill-cyan-950/40 stroke-black/10 dark:stroke-cyan-400/40" 
                    strokeWidth="2"
                />

                {/* 4 Thread Holes */}
                <circle cx="41" cy="41" r="4.5" className="fill-[#8C8375] dark:fill-cyan-400" />
                <circle cx="59" cy="41" r="4.5" className="fill-[#8C8375] dark:fill-cyan-400" />
                <circle cx="41" cy="59" r="4.5" className="fill-[#8C8375] dark:fill-cyan-400" />
                <circle cx="59" cy="59" r="4.5" className="fill-[#8C8375] dark:fill-cyan-400" />

                {/* Thread Cross stitches */}
                <line x1="41" y1="41" x2="59" y2="59" className="stroke-[#FAF8F5]/80 dark:stroke-cyan-200" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="59" y1="41" x2="41" y2="59" className="stroke-[#FAF8F5]/80 dark:stroke-cyan-200" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
        </div>
    );
}

// ─── 3D SCISSORS ───
export function Scissors3D({ 
    size = 72, 
    className = '', 
    rotation = -25 
}: { 
    size?: number; 
    className?: string; 
    rotation?: number; 
}) {
    return (
        <div 
            style={{ 
                width: size, 
                height: size, 
                transform: `rotate(${rotation}deg)` 
            }}
            className={`relative select-none pointer-events-none transition-transform duration-700 ${className}`}
        >
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.12)] dark:drop-shadow-[0_0_18px_rgba(245,158,11,0.5)]">
                {/* Blade 1 */}
                <path 
                    d="M30 65 L65 20 C67 17 72 20 70 23 L45 70 Z" 
                    className="fill-slate-300 dark:fill-slate-700 stroke-slate-400/60 dark:stroke-amber-400/80" 
                    strokeWidth="2" 
                />
                {/* Blade 2 */}
                <path 
                    d="M20 50 L75 40 C78 40 78 45 74 46 L35 75 Z" 
                    className="fill-slate-200 dark:fill-slate-800 stroke-slate-300 dark:stroke-amber-400/80" 
                    strokeWidth="2" 
                />
                {/* Pivot Screw */}
                <circle cx="48" cy="55" r="4" className="fill-slate-500 dark:fill-amber-300 stroke-white/80" strokeWidth="1.5" />
                {/* Handle 1 */}
                <circle cx="24" cy="72" r="14" className="fill-none stroke-slate-400 dark:stroke-amber-400/90" strokeWidth="4.5" />
                {/* Handle 2 */}
                <circle cx="34" cy="82" r="14" className="fill-none stroke-slate-400 dark:stroke-amber-400/90" strokeWidth="4.5" />
            </svg>
        </div>
    );
}

// ─── 3D NEEDLE WITH THREAD LOOP ───
export function NeedleWithThread3D({ 
    size = 80, 
    className = '', 
    rotation = 45 
}: { 
    size?: number; 
    className?: string; 
    rotation?: number; 
}) {
    return (
        <div 
            style={{ 
                width: size, 
                height: size, 
                transform: `rotate(${rotation}deg)` 
            }}
            className={`relative select-none pointer-events-none transition-transform duration-700 ${className}`}
        >
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-[0_10px_20px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_0_18px_rgba(6,182,212,0.7)]">
                {/* Flowing Organic Thread Loop */}
                <path 
                    d="M 25 75 C 5 95, -5 50, 20 40 C 45 30, 40 60, 60 45 C 75 32, 60 15, 75 18" 
                    fill="none" 
                    className="stroke-slate-400/70 dark:stroke-cyan-400" 
                    strokeWidth="2.5" 
                    strokeLinecap="round"
                    strokeDasharray="4 2"
                />
                {/* Needle Body */}
                <path 
                    d="M 68 22 L 95 3 L 88 30 Z" 
                    className="fill-slate-300 dark:fill-slate-200 stroke-slate-400 dark:stroke-cyan-300" 
                    strokeWidth="1.5" 
                />
                {/* Eyelet hole */}
                <ellipse cx="85" cy="18" rx="2" ry="4" transform="rotate(45 85 18)" className="fill-slate-600 dark:fill-cyan-950" />
            </svg>
        </div>
    );
}

// ─── 3D CLOTHES HANGER ───
export function Hanger3D({ 
    size = 76, 
    className = '', 
    rotation = -12 
}: { 
    size?: number; 
    className?: string; 
    rotation?: number; 
}) {
    return (
        <div 
            style={{ 
                width: size, 
                height: size, 
                transform: `rotate(${rotation}deg)` 
            }}
            className={`relative select-none pointer-events-none transition-transform duration-700 ${className}`}
        >
            <svg viewBox="0 0 100 80" className="w-full h-full drop-shadow-[0_12px_20px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_0_18px_rgba(6,182,212,0.6)]">
                {/* Hook */}
                <path 
                    d="M 50 25 C 44 25, 42 16, 48 10 C 54 4, 62 10, 58 18 L 50 25" 
                    fill="none" 
                    className="stroke-amber-700/60 dark:stroke-cyan-300" 
                    strokeWidth="3.5" 
                    strokeLinecap="round" 
                />
                {/* Triangular Wood / Neon Frame */}
                <path 
                    d="M 50 25 L 90 55 C 92 57, 90 60, 86 60 L 14 60 C 10 60, 8 57, 10 55 Z" 
                    className="fill-[#E6DFD3]/80 dark:fill-transparent stroke-[#BAAF9E] dark:stroke-cyan-400" 
                    strokeWidth="3.5" 
                    strokeLinejoin="round" 
                />
            </svg>
        </div>
    );
}

// ─── 3D THREAD SPOOL ───
export function ThreadSpool3D({ 
    size = 54, 
    className = '', 
    rotation = 15,
    threadColor = '#3B82F6'
}: { 
    size?: number; 
    className?: string; 
    rotation?: number; 
    threadColor?: string;
}) {
    return (
        <div 
            style={{ 
                width: size, 
                height: size, 
                transform: `rotate(${rotation}deg)` 
            }}
            className={`relative select-none pointer-events-none transition-transform duration-700 ${className}`}
        >
            <svg viewBox="0 0 80 80" className="w-full h-full drop-shadow-[0_10px_18px_rgba(0,0,0,0.12)] dark:drop-shadow-[0_0_16px_rgba(6,182,212,0.5)]">
                {/* Top Wooden Flange */}
                <ellipse cx="40" cy="18" rx="28" ry="10" className="fill-[#C5B49D] dark:fill-slate-700 stroke-[#A8967E] dark:stroke-cyan-400/60" strokeWidth="2" />
                <ellipse cx="40" cy="18" rx="10" ry="4" className="fill-[#7A6B56] dark:fill-cyan-950" />

                {/* Thread Body with Winding Lines */}
                <rect x="20" y="24" width="40" height="32" rx="4" style={{ fill: threadColor }} className="opacity-85 dark:opacity-75" />
                <line x1="20" y1="28" x2="60" y2="28" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                <line x1="20" y1="36" x2="60" y2="36" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                <line x1="20" y1="44" x2="60" y2="44" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                <line x1="20" y1="52" x2="60" y2="52" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />

                {/* Bottom Wooden Flange */}
                <ellipse cx="40" cy="62" rx="28" ry="10" className="fill-[#C5B49D] dark:fill-slate-700 stroke-[#A8967E] dark:stroke-cyan-400/60" strokeWidth="2" />
            </svg>
        </div>
    );
}

// ─── MINIMALIST GENDER SILHOUETTE (Male / Female) ───
export function GenderSilhouette3D({ 
    gender = 'male', 
    size = 42, 
    className = '' 
}: { 
    gender?: 'male' | 'female' | 'family'; 
    size?: number; 
    className?: string; 
}) {
    return (
        <div 
            style={{ width: size, height: size * 1.5 }}
            className={`relative select-none pointer-events-none opacity-60 hover:opacity-100 transition-opacity duration-300 ${className}`}
        >
            {gender === 'male' && (
                <svg viewBox="0 0 40 60" className="w-full h-full drop-shadow-sm dark:drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]">
                    <circle cx="20" cy="10" r="7" className="fill-none stroke-slate-500 dark:stroke-cyan-400" strokeWidth="3" />
                    <path d="M 8 26 C 8 22, 14 20, 20 20 C 26 20, 32 22, 32 26 L 32 38 L 26 38 L 26 56 L 14 56 L 14 38 L 8 38 Z" 
                        className="fill-none stroke-slate-500 dark:stroke-cyan-400" 
                        strokeWidth="3" 
                        strokeLinejoin="round" 
                    />
                </svg>
            )}
            {gender === 'female' && (
                <svg viewBox="0 0 40 60" className="w-full h-full drop-shadow-sm dark:drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]">
                    <circle cx="20" cy="10" r="7" className="fill-none stroke-slate-500 dark:stroke-cyan-400" strokeWidth="3" />
                    <path d="M 12 24 C 12 21, 16 20, 20 20 C 24 20, 28 21, 28 24 L 34 44 L 24 44 L 24 56 L 16 56 L 16 44 L 6 44 Z" 
                        className="fill-none stroke-slate-500 dark:stroke-cyan-400" 
                        strokeWidth="3" 
                        strokeLinejoin="round" 
                    />
                </svg>
            )}
            {gender === 'family' && (
                <svg viewBox="0 0 60 50" className="w-full h-full drop-shadow-sm dark:drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]">
                    {/* Dad */}
                    <circle cx="16" cy="8" r="5" className="fill-none stroke-slate-500 dark:stroke-cyan-400" strokeWidth="2.5" />
                    <path d="M 8 20 C 8 17, 12 16, 16 16 C 20 16, 24 17, 24 20 L 24 30 L 20 30 L 20 46 L 12 46 L 12 30 L 8 30 Z" className="fill-none stroke-slate-500 dark:stroke-cyan-400" strokeWidth="2.5" />
                    {/* Mom */}
                    <circle cx="34" cy="8" r="5" className="fill-none stroke-slate-500 dark:stroke-cyan-400" strokeWidth="2.5" />
                    <path d="M 28 20 C 28 17, 31 16, 34 16 C 37 16, 40 17, 40 20 L 44 34 L 37 34 L 37 46 L 31 46 L 31 34 L 24 34 Z" className="fill-none stroke-slate-500 dark:stroke-cyan-400" strokeWidth="2.5" />
                    {/* Child */}
                    <circle cx="50" cy="18" r="4" className="fill-none stroke-slate-500 dark:stroke-cyan-400" strokeWidth="2" />
                    <path d="M 44 28 C 44 26, 47 25, 50 25 C 53 25, 56 26, 56 28 L 56 36 L 53 36 L 53 46 L 47 46 L 47 36 L 44 36 Z" className="fill-none stroke-slate-500 dark:stroke-cyan-400" strokeWidth="2" />
                </svg>
            )}
        </div>
    );
}
