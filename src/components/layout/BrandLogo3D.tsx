'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';

interface BrandLogo3DProps {
    src: string;
    alt?: string;
    theme: 'light' | 'dark';
    className?: string;
}

export default function BrandLogo3D({
    src,
    alt = 'Apparel Emporium',
    theme,
    className = '',
}: BrandLogo3DProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const [imgLoaded, setImgLoaded] = useState(false);

    // Interactive 3D tilt tracking
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Normalized: -1 to +1 from center
        const normalX = (x / rect.width - 0.5) * 2;
        const normalY = (y / rect.height - 0.5) * 2;

        // Max rotation degrees: 14deg Y, 12deg X
        setTilt({
            x: -normalY * 12,
            y: normalX * 14,
        });
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setTilt({ x: 0, y: 0 });
    };

    const isDark = theme === 'dark';

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`relative flex items-center select-none cursor-pointer group ${className}`}
            style={{
                perspective: '1200px',
                transformStyle: 'preserve-3d',
            }}
        >
            {/* 3D Animated Core Stage */}
            <div
                className={`relative flex items-center h-10 sm:h-11 md:h-11 max-w-[270px] sm:max-w-[320px] transition-all will-change-transform ${
                    !isHovered ? 'animate-logo-float-3d' : ''
                }`}
                style={{
                    transform: isHovered
                        ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(12px) scale3d(1.04, 1.04, 1.04)`
                        : 'rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)',
                    transformStyle: 'preserve-3d',
                    transition: isHovered
                        ? 'transform 0.1s cubic-bezier(0.2, 0.8, 0.2, 1)'
                        : 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
                }}
            >
                {/* Ambient 3D Neon Backlight in Dark Mode / Soft Diffuse Glow in Light Mode */}
                <div
                    className={`absolute -inset-1 rounded-full blur-md pointer-events-none transition-opacity duration-500 ${
                        isDark
                            ? 'bg-gradient-to-r from-red-600/25 via-rose-500/15 to-blue-500/15'
                            : 'bg-gradient-to-r from-red-500/10 via-amber-500/5 to-slate-500/5'
                    } ${isHovered ? 'opacity-90' : 'opacity-40'}`}
                    style={{ transform: 'translateZ(-10px)' }}
                />

                {/* Primary Transparent 3D Logo Image with Depth Filter */}
                <div
                    className="relative h-full w-auto flex items-center"
                    style={{
                        transform: 'translateZ(10px)',
                        filter: isDark
                            ? 'drop-shadow(0 3px 6px rgba(0,0,0,0.7)) drop-shadow(0 0 14px rgba(225,29,72,0.3))'
                            : 'drop-shadow(0 2px 4px rgba(0,0,0,0.12)) drop-shadow(0 4px 10px rgba(225,29,72,0.12))',
                    }}
                >
                    <img
                        src={src}
                        alt={alt}
                        onLoad={() => setImgLoaded(true)}
                        className={`h-full w-auto object-contain transition-all duration-300 ${
                            imgLoaded ? 'opacity-100 scale-100' : 'opacity-90 scale-98'
                        }`}
                        style={{
                            imageRendering: '-webkit-optimize-contrast',
                        }}
                    />

                    {/* Dynamic 3D Specular Sheen (Shines specifically through the logo silhouette) */}
                    <div
                        className="absolute inset-0 pointer-events-none overflow-hidden rounded-sm"
                        style={{
                            maskImage: `url("${src}")`,
                            WebkitMaskImage: `url("${src}")`,
                            maskSize: 'contain',
                            WebkitMaskSize: 'contain',
                            maskRepeat: 'no-repeat',
                            WebkitMaskRepeat: 'no-repeat',
                            maskPosition: 'center',
                            WebkitMaskPosition: 'center',
                        }}
                    >
                        <div
                            className={`absolute inset-0 w-[200%] h-full pointer-events-none ${
                                isHovered ? 'animate-logo-sheen-fast' : 'animate-logo-sheen-loop'
                            }`}
                            style={{
                                background: isDark
                                    ? 'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.3) 40%, rgba(255,255,255,0.7) 50%, rgba(255,100,120,0.4) 55%, transparent 75%)'
                                    : 'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.4) 40%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0.4) 60%, transparent 80%)',
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
