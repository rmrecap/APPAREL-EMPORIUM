'use client';

import React from 'react';
import Image from 'next/image';

interface AtelierDecorations3DProps {
    variant?: 'top-right' | 'bottom-left' | 'all';
    onGenderSelect?: (gender: 'men' | 'women' | 'kids') => void;
    activeGender?: string | null;
}

export default function AtelierDecorations3D({
    variant = 'all',
    onGenderSelect,
    activeGender
}: AtelierDecorations3DProps) {
    return (
        <>
            {/* ── TOP RIGHT 3D SKEUOMORPHIC NEEDLE, THREAD & BUTTON ── */}
            {(variant === 'top-right' || variant === 'all') && (
                <div className="absolute top-2 right-4 sm:right-8 lg:right-12 pointer-events-none select-none z-10 w-64 sm:w-80 lg:w-96 h-48 sm:h-56 overflow-visible opacity-90 transition-all duration-500">
                    <svg
                        className="w-full h-full overflow-visible"
                        viewBox="0 0 380 220"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <defs>
                            {/* Metallic Needle Gradients */}
                            <linearGradient id="needleSteel" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#FFFFFF" />
                                <stop offset="20%" stopColor="#E2E8F0" />
                                <stop offset="45%" stopColor="#94A3B8" />
                                <stop offset="60%" stopColor="#475569" />
                                <stop offset="80%" stopColor="#CBD5E1" />
                                <stop offset="100%" stopColor="#1E293B" />
                            </linearGradient>

                            <linearGradient id="needleEyeHole" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#0F172A" />
                                <stop offset="100%" stopColor="#334155" />
                            </linearGradient>

                            {/* Thread Gradient (Light & Dark Neon) */}
                            <linearGradient id="threadGradientLight" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.4" />
                                <stop offset="30%" stopColor="#2563EB" stopOpacity="0.9" />
                                <stop offset="70%" stopColor="#60A5FA" stopOpacity="0.95" />
                                <stop offset="100%" stopColor="#93C5FD" stopOpacity="0.7" />
                            </linearGradient>

                            <linearGradient id="threadGradientDark" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
                                <stop offset="50%" stopColor="#60A5FA" stopOpacity="1" />
                                <stop offset="80%" stopColor="#818CF8" stopOpacity="0.9" />
                                <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.8" />
                            </linearGradient>

                            {/* Button Mother of Pearl Gradients */}
                            <radialGradient id="buttonPearl" cx="38%" cy="35%" r="65%">
                                <stop offset="0%" stopColor="#FFFFFF" />
                                <stop offset="40%" stopColor="#F1ECE4" />
                                <stop offset="70%" stopColor="#D8D0C5" />
                                <stop offset="90%" stopColor="#B8AEA2" />
                                <stop offset="100%" stopColor="#8C8276" />
                            </radialGradient>

                            <radialGradient id="buttonDarkPearl" cx="38%" cy="35%" r="65%">
                                <stop offset="0%" stopColor="#334155" />
                                <stop offset="50%" stopColor="#1E293B" />
                                <stop offset="85%" stopColor="#0F172A" />
                                <stop offset="100%" stopColor="#020617" />
                            </radialGradient>

                            {/* Filters */}
                            <filter id="needleShadow" x="-20%" y="-20%" width="140%" height="140%">
                                <feDropShadow dx="4" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.25" />
                            </filter>

                            <filter id="buttonShadow" x="-30%" y="-30%" width="160%" height="160%">
                                <feDropShadow dx="3" dy="6" stdDeviation="5" floodColor="#000000" floodOpacity="0.22" />
                            </filter>

                            <filter id="threadGlow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="3" result="blur" />
                                <feMerge>
                                    <feMergeNode in="blur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* ── Realistic 3D Sewing Button (Mother of pearl with 4 holes) ── */}
                        <g transform="translate(60, 80) scale(0.9)" filter="url(#buttonShadow)">
                            {/* Outer Rim */}
                            <circle cx="28" cy="28" r="24" className="fill-[url(#buttonPearl)] dark:fill-[url(#buttonDarkPearl)] stroke-white/40 dark:stroke-cyan-500/30" strokeWidth="1.5" />
                            <circle cx="28" cy="28" r="20" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
                            <circle cx="28" cy="28" r="16" fill="rgba(0,0,0,0.04)" className="dark:fill-black/30" />

                            {/* 4 Stitched Holes */}
                            <ellipse cx="23" cy="23" rx="2.5" ry="2.5" fill="#2D2A26" className="dark:fill-black" />
                            <ellipse cx="33" cy="23" rx="2.5" ry="2.5" fill="#2D2A26" className="dark:fill-black" />
                            <ellipse cx="23" cy="33" rx="2.5" ry="2.5" fill="#2D2A26" className="dark:fill-black" />
                            <ellipse cx="33" cy="33" rx="2.5" ry="2.5" fill="#2D2A26" className="dark:fill-black" />

                            {/* Cross Stitch Thread */}
                            <line x1="23" y1="23" x2="33" y2="33" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" />
                            <line x1="33" y1="23" x2="23" y2="33" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
                        </g>

                        {/* ── Flowing 3D Thread Path (Dynamic Curves) ── */}
                        {/* Light mode thread */}
                        <path
                            d="M 60 120 C 140 180, 240 60, 260 20 C 280 -20, 360 40, 370 110 C 375 140, 330 170, 290 140 C 270 125, 275 80, 305 65 C 335 50, 360 80, 350 115"
                            fill="none"
                            stroke="url(#threadGradientLight)"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            className="dark:hidden"
                            opacity="0.85"
                        />
                        {/* Dark mode glowing neon cyan thread */}
                        <path
                            d="M 60 120 C 140 180, 240 60, 260 20 C 280 -20, 360 40, 370 110 C 375 140, 330 170, 290 140 C 270 125, 275 80, 305 65 C 335 50, 360 80, 350 115"
                            fill="none"
                            stroke="url(#threadGradientDark)"
                            strokeWidth="2.8"
                            strokeLinecap="round"
                            className="hidden dark:block"
                            filter="url(#threadGlow)"
                        />

                        {/* ── Metallic 3D Sewing Needle ── */}
                        <g transform="translate(180, -30) rotate(52)" filter="url(#needleShadow)">
                            {/* Needle Body */}
                            <path
                                d="M 0 0 L 8 4 L 200 8 L 220 7.5 L 220 8.5 L 200 8 L 8 12 L 0 16 Z"
                                fill="url(#needleSteel)"
                            />
                            {/* Needle Point Sharp Tip */}
                            <path
                                d="M 0 0 C -4 4, -8 8, -12 8 C -8 8, -4 12, 0 16 Z"
                                fill="#CBD5E1"
                            />
                            {/* Needle Eyelet */}
                            <rect
                                x="175"
                                y="6"
                                width="30"
                                height="4"
                                rx="2"
                                fill="url(#needleEyeHole)"
                                stroke="#475569"
                                strokeWidth="0.8"
                            />
                            {/* Thread Passing Inside Eyelet */}
                            <line
                                x1="172"
                                y1="8"
                                x2="208"
                                y2="8"
                                stroke="#38BDF8"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                            />
                            {/* Specular Highlight along shaft */}
                            <line
                                x1="10"
                                y1="5.5"
                                x2="195"
                                y2="7"
                                stroke="#FFFFFF"
                                strokeWidth="0.9"
                                strokeLinecap="round"
                                opacity="0.8"
                            />
                        </g>
                    </svg>
                </div>
            )}

            {/* ── BOTTOM LEFT 3D SKEUOMORPHIC ATELIER ARTIFACTS & GENDER CHIPS ── */}
            {(variant === 'bottom-left' || variant === 'all') && (
                <div className="mt-8 pt-6 border-t border-gray-200/60 dark:border-gray-800/80 relative space-y-6">
                    {/* Interactive Gender Silhouette Badges */}
                    <div className="flex items-center justify-between gap-2 px-1">
                        {[
                            { id: 'men', label: 'Men', icon: 'M12 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm-4 9c-1.5 0-3 1-3 2.5V18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4.5c0-1.5-1.5-2.5-3-2.5H8z' },
                            { id: 'women', label: 'Women', icon: 'M12 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm-3.5 8.5C7 11 6 12.5 6 14.5L7.5 20h9L18 14.5c0-2-1-3.5-2.5-4h-7z' },
                            { id: 'kids', label: 'Kids', icon: 'M12 4a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4zm-2.5 6.5c-1 0-2 .8-2 1.8V17a1.5 1.5 0 0 0 1.5 1.5h6A1.5 1.5 0 0 0 16.5 17v-4.7c0-1-1-1.8-2-1.8h-5z' }
                        ].map((gender) => {
                            const isSelected = activeGender === gender.id;
                            return (
                                <button
                                    key={gender.id}
                                    type="button"
                                    onClick={() => onGenderSelect?.(gender.id as any)}
                                    className={`flex-1 flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl transition-all duration-300 ${isSelected
                                        ? 'bg-primary text-white shadow-md shadow-primary/25 scale-105'
                                        : 'bg-[#F2ECE4] dark:bg-[#121A2C] text-slate-700 dark:text-slate-300 hover:bg-[#EAE2D8] dark:hover:bg-[#1A253E] border border-white/60 dark:border-white/5 shadow-[2px_2px_6px_rgba(0,0,0,0.05),-2px_-2px_6px_rgba(255,255,255,0.7)] dark:shadow-none'
                                        }`}
                                >
                                    <svg className="w-5 h-5 mb-1" viewBox="0 0 24 24" fill="currentColor">
                                        <path d={gender.icon} />
                                    </svg>
                                    <span className="text-[10.5px] font-bold tracking-tight">{gender.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Realistic 3D Atelier Graphic Composited with Depth */}
                    <div className="relative h-44 rounded-2xl overflow-hidden bg-gradient-to-b from-[#ECE5DA] to-[#DFD6C9] dark:from-[#0E1627] dark:to-[#070D1A] p-2 border border-[#DFD6C9] dark:border-white/10 shadow-inner flex items-center justify-center">
                        <img
                            src="/images/3d/spool_hanger_tailor.jpg"
                            alt="Atelier Garment Craftsmanship"
                            className="w-full h-full object-cover rounded-xl transition-transform duration-700 hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none rounded-xl" />
                        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] font-extrabold text-white tracking-widest uppercase drop-shadow-md">
                            <span>Dhaka Atelier</span>
                            <span className="text-cyan-300">ISO 9001:2015</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
