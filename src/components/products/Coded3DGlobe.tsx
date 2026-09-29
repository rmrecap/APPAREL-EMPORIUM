'use client';

import React, { useEffect, useRef, useState } from 'react';

interface Coded3DGlobeProps {
    className?: string;
    size?: number;
}

export default function Coded3DGlobe({ className = '', size = 160 }: Coded3DGlobeProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDark, setIsDark] = useState<boolean>(true);
    const isDraggingRef = useRef(false);
    const lastMouseX = useRef(0);
    const userRotationOffset = useRef(0);
    const velocityRef = useRef(0);

    // Track theme changes
    useEffect(() => {
        const updateTheme = () => {
            const hasDarkClass = document.documentElement.classList.contains('dark');
            setIsDark(hasDarkClass);
        };
        updateTheme();

        const observer = new MutationObserver(updateTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });
        return () => observer.disconnect();
    }, []);

    // 3D Globe Render Engine
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let angle = 0;

        // Hub points across globe (lat, lon in radians)
        const hubCoords = [
            { lat: 0.41, lon: 1.57 },    // Dhaka / S. Asia
            { lat: 0.65, lon: 0.05 },    // London / W. Europe
            { lat: 0.71, lon: -1.29 },   // New York / N. America
            { lat: 0.62, lon: 2.43 },    // Tokyo / E. Asia
            { lat: 0.23, lon: 1.81 },    // Singapore / SE Asia
            { lat: -0.59, lon: 2.64 },   // Sydney / Oceania
            { lat: 0.84, lon: 0.22 },    // Frankfurt / Central Europe
            { lat: 0.44, lon: -2.06 },   // Los Angeles / Pacific
            { lat: 0.52, lon: 0.96 },    // Dubai / Middle East
            { lat: -0.40, lon: -0.76 },  // Sao Paulo / S. America
            { lat: 0.54, lon: 0.45 },    // Milan / S. Europe
            { lat: 0.38, lon: 1.35 },    // Mumbai / India
        ];

        // Connection arcs between hubs
        const arcs = [
            { from: 0, to: 1 },
            { from: 0, to: 2 },
            { from: 0, to: 3 },
            { from: 1, to: 6 },
            { from: 1, to: 10 },
            { from: 2, to: 7 },
            { from: 3, to: 4 },
            { from: 4, to: 5 },
            { from: 8, to: 0 },
            { from: 8, to: 1 },
        ];

        // Handle canvas DPI
        const dpr = window.devicePixelRatio || 1;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        ctx.scale(dpr, dpr);

        const cx = size / 2;
        const cy = size / 2;
        const radius = size * 0.36;
        const pitch = 0.38; // Earth tilt angle in radians (~22 deg)

        // 3D coordinate projection
        function project3D(x: number, y: number, z: number, currentRot: number) {
            // Rotate around Y axis
            const cosR = Math.cos(currentRot);
            const sinR = Math.sin(currentRot);
            const rotX = x * cosR - z * sinR;
            const rotZ = x * sinR + z * cosR;

            // Tilt around X axis (pitch)
            const cosP = Math.cos(pitch);
            const sinP = Math.sin(pitch);
            const tiltedY = y * cosP - rotZ * sinP;
            const tiltedZ = y * sinP + rotZ * cosP;

            return {
                x2d: cx + rotX,
                y2d: cy + tiltedY,
                z3d: tiltedZ,
                visible: tiltedZ > -radius * 0.05
            };
        }

        const render = (timestamp: number) => {
            // Apply inertia / auto-spin
            if (!isDraggingRef.current) {
                velocityRef.current *= 0.95;
                angle += 0.007 + velocityRef.current;
            } else {
                angle += velocityRef.current;
            }

            const currentAngle = angle + userRotationOffset.current;

            ctx.clearRect(0, 0, size, size);

            if (isDark) {
                /* ══════════════════════════════════════════
                   DARK MODE: NEON CYAN HOLOGRAPHIC 3D GLOBE
                ══════════════════════════════════════════════ */
                // 1. Atmospheric Ambient Radial Glow behind globe
                const glowGrad = ctx.createRadialGradient(cx, cy, radius * 0.3, cx, cy, radius * 1.4);
                glowGrad.addColorStop(0, 'rgba(6, 182, 212, 0.28)');
                glowGrad.addColorStop(0.6, 'rgba(56, 189, 248, 0.12)');
                glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = glowGrad;
                ctx.beginPath();
                ctx.arc(cx, cy, radius * 1.4, 0, Math.PI * 2);
                ctx.fill();

                // 2. Translucent Sphere Body
                const bodyGrad = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, 2, cx, cy, radius);
                bodyGrad.addColorStop(0, 'rgba(14, 165, 233, 0.18)');
                bodyGrad.addColorStop(0.7, 'rgba(4, 18, 38, 0.7)');
                bodyGrad.addColorStop(1, 'rgba(2, 8, 20, 0.95)');
                ctx.fillStyle = bodyGrad;
                ctx.beginPath();
                ctx.arc(cx, cy, radius, 0, Math.PI * 2);
                ctx.fill();

                // Outer edge glowing rim
                ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
                ctx.lineWidth = 1.2;
                ctx.shadowColor = '#38bdf8';
                ctx.shadowBlur = 8;
                ctx.stroke();
                ctx.shadowBlur = 0;

                // 3. Latitude Rings (Parallels)
                const latSteps = [-0.65, -0.35, 0, 0.35, 0.65];
                latSteps.forEach(latRad => {
                    const ringY = radius * Math.sin(latRad);
                    const ringR = radius * Math.cos(latRad);
                    ctx.beginPath();
                    let first = true;
                    for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.2) {
                        const px = ringR * Math.cos(a);
                        const pz = ringR * Math.sin(a);
                        const proj = project3D(px, ringY, pz, currentAngle);
                        if (proj.z3d > -radius * 0.1) {
                            if (first) {
                                ctx.moveTo(proj.x2d, proj.y2d);
                                first = false;
                            } else {
                                ctx.lineTo(proj.x2d, proj.y2d);
                            }
                        } else {
                            first = true;
                        }
                    }
                    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                });

                // 4. Longitude Meridians
                const numMeridians = 8;
                for (let m = 0; m < numMeridians; m++) {
                    const lonAngle = (m / numMeridians) * Math.PI;
                    ctx.beginPath();
                    let first = true;
                    for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.15) {
                        const px = radius * Math.cos(a) * Math.sin(lonAngle);
                        const py = radius * Math.sin(a);
                        const pz = radius * Math.cos(a) * Math.cos(lonAngle);
                        const proj = project3D(px, py, pz, currentAngle);
                        if (proj.z3d > -radius * 0.1) {
                            if (first) {
                                ctx.moveTo(proj.x2d, proj.y2d);
                                first = false;
                            } else {
                                ctx.lineTo(proj.x2d, proj.y2d);
                            }
                        } else {
                            first = true;
                        }
                    }
                    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }

                // 5. 3D Connection Arcs
                arcs.forEach((arc, i) => {
                    const c1 = hubCoords[arc.from];
                    const c2 = hubCoords[arc.to];

                    const p1x = radius * Math.cos(c1.lat) * Math.sin(c1.lon);
                    const p1y = radius * Math.sin(c1.lat);
                    const p1z = radius * Math.cos(c1.lat) * Math.cos(c1.lon);

                    const p2x = radius * Math.cos(c2.lat) * Math.sin(c2.lon);
                    const p2y = radius * Math.sin(c2.lat);
                    const p2z = radius * Math.cos(c2.lat) * Math.cos(c2.lon);

                    const proj1 = project3D(p1x, p1y, p1z, currentAngle);
                    const proj2 = project3D(p2x, p2y, p2z, currentAngle);

                    if (proj1.visible || proj2.visible) {
                        // Midpoint elevated in 3D for spherical arc
                        const midX = (p1x + p2x) * 0.65;
                        const midY = (p1y + p2y) * 0.65;
                        const midZ = (p1z + p2z) * 0.65;
                        const projMid = project3D(midX, midY, midZ, currentAngle);

                        ctx.beginPath();
                        ctx.moveTo(proj1.x2d, proj1.y2d);
                        ctx.quadraticCurveTo(projMid.x2d, projMid.y2d, proj2.x2d, proj2.y2d);
                        ctx.strokeStyle = 'rgba(103, 232, 249, 0.45)';
                        ctx.lineWidth = 1;
                        ctx.stroke();

                        // Animated pulse packet traveling on arc
                        const pulseT = ((timestamp * 0.001 + i * 0.3) % 1);
                        const t = pulseT;
                        const curX = (1 - t) * (1 - t) * proj1.x2d + 2 * (1 - t) * t * projMid.x2d + t * t * proj2.x2d;
                        const curY = (1 - t) * (1 - t) * proj1.y2d + 2 * (1 - t) * t * projMid.y2d + t * t * proj2.y2d;

                        ctx.fillStyle = '#67e8f9';
                        ctx.shadowColor = '#38bdf8';
                        ctx.shadowBlur = 6;
                        ctx.beginPath();
                        ctx.arc(curX, curY, 1.8, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.shadowBlur = 0;
                    }
                });

                // 6. Network Hub Dots
                hubCoords.forEach(c => {
                    const px = radius * Math.cos(c.lat) * Math.sin(c.lon);
                    const py = radius * Math.sin(c.lat);
                    const pz = radius * Math.cos(c.lat) * Math.cos(c.lon);
                    const proj = project3D(px, py, pz, currentAngle);

                    if (proj.visible) {
                        const alpha = Math.max(0.2, (proj.z3d + radius) / (radius * 2));
                        // Outer pulse ring
                        ctx.fillStyle = `rgba(56, 189, 248, ${alpha * 0.6})`;
                        ctx.beginPath();
                        ctx.arc(proj.x2d, proj.y2d, 3.2, 0, Math.PI * 2);
                        ctx.fill();

                        // Inner solid glowing node
                        ctx.fillStyle = '#FFFFFF';
                        ctx.shadowColor = '#38bdf8';
                        ctx.shadowBlur = 8;
                        ctx.beginPath();
                        ctx.arc(proj.x2d, proj.y2d, 1.8, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.shadowBlur = 0;
                    }
                });

                // 7. Outer 3D Orbital Rings
                const orbitR = radius * 1.28;
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(-0.35); // tilt orbit
                ctx.beginPath();
                ctx.ellipse(0, 0, orbitR, orbitR * 0.38, 0, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
                ctx.lineWidth = 1.2;
                ctx.setLineDash([4, 4]);
                ctx.stroke();
                ctx.setLineDash([]);

                // Satellite sphere traveling on orbit
                const satAngle = (timestamp * 0.0012) % (Math.PI * 2);
                const satX = orbitR * Math.cos(satAngle);
                const satY = orbitR * 0.38 * Math.sin(satAngle);
                ctx.fillStyle = '#67e8f9';
                ctx.shadowColor = '#38bdf8';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(satX, satY, 2.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.restore();

            } else {
                /* ══════════════════════════════════════════
                   LIGHT MODE: 3D EMBOSSED CLAY SPHERE
                ══════════════════════════════════════════════ */
                // 1. Soft Clay Ground Shadow
                const groundShadow = ctx.createRadialGradient(cx, cy + radius * 0.85, 2, cx, cy + radius * 0.85, radius * 0.95);
                groundShadow.addColorStop(0, 'rgba(150, 142, 130, 0.45)');
                groundShadow.addColorStop(0.6, 'rgba(175, 168, 155, 0.2)');
                groundShadow.addColorStop(1, 'rgba(238, 234, 227, 0)');
                ctx.fillStyle = groundShadow;
                ctx.beginPath();
                ctx.ellipse(cx, cy + radius * 0.85, radius * 0.9, radius * 0.28, 0, 0, Math.PI * 2);
                ctx.fill();

                // 2. Physical 3D Shaded Clay Sphere
                const clayGrad = ctx.createRadialGradient(cx - radius * 0.35, cy - radius * 0.4, 4, cx, cy, radius);
                clayGrad.addColorStop(0, '#FFFFFF');
                clayGrad.addColorStop(0.35, '#F2ECE2');
                clayGrad.addColorStop(0.7, '#DFD8CC');
                clayGrad.addColorStop(1, '#B3ABA0');
                ctx.fillStyle = clayGrad;
                ctx.beginPath();
                ctx.arc(cx, cy, radius, 0, Math.PI * 2);
                ctx.fill();

                // Soft outer clay rim
                ctx.strokeStyle = '#D8D1C5';
                ctx.lineWidth = 1;
                ctx.stroke();

                // 3. Latitude Engraved Lines
                const latSteps = [-0.65, -0.35, 0, 0.35, 0.65];
                latSteps.forEach(latRad => {
                    const ringY = radius * Math.sin(latRad);
                    const ringR = radius * Math.cos(latRad);
                    ctx.beginPath();
                    let first = true;
                    for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.2) {
                        const px = ringR * Math.cos(a);
                        const pz = ringR * Math.sin(a);
                        const proj = project3D(px, ringY, pz, currentAngle);
                        if (proj.z3d > -radius * 0.05) {
                            if (first) {
                                ctx.moveTo(proj.x2d, proj.y2d);
                                first = false;
                            } else {
                                ctx.lineTo(proj.x2d, proj.y2d);
                            }
                        } else {
                            first = true;
                        }
                    }
                    ctx.strokeStyle = 'rgba(168, 158, 144, 0.55)';
                    ctx.lineWidth = 0.9;
                    ctx.stroke();
                });

                // 4. Longitude Meridians
                const numMeridians = 8;
                for (let m = 0; m < numMeridians; m++) {
                    const lonAngle = (m / numMeridians) * Math.PI;
                    ctx.beginPath();
                    let first = true;
                    for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.15) {
                        const px = radius * Math.cos(a) * Math.sin(lonAngle);
                        const py = radius * Math.sin(a);
                        const pz = radius * Math.cos(a) * Math.cos(lonAngle);
                        const proj = project3D(px, py, pz, currentAngle);
                        if (proj.z3d > -radius * 0.05) {
                            if (first) {
                                ctx.moveTo(proj.x2d, proj.y2d);
                                first = false;
                            } else {
                                ctx.lineTo(proj.x2d, proj.y2d);
                            }
                        } else {
                            first = true;
                        }
                    }
                    ctx.strokeStyle = 'rgba(168, 158, 144, 0.55)';
                    ctx.lineWidth = 0.9;
                    ctx.stroke();
                }

                // 5. 3D Connection Arcs
                arcs.forEach(arc => {
                    const c1 = hubCoords[arc.from];
                    const c2 = hubCoords[arc.to];

                    const p1x = radius * Math.cos(c1.lat) * Math.sin(c1.lon);
                    const p1y = radius * Math.sin(c1.lat);
                    const p1z = radius * Math.cos(c1.lat) * Math.cos(c1.lon);

                    const p2x = radius * Math.cos(c2.lat) * Math.sin(c2.lon);
                    const p2y = radius * Math.sin(c2.lat);
                    const p2z = radius * Math.cos(c2.lat) * Math.cos(c2.lon);

                    const proj1 = project3D(p1x, p1y, p1z, currentAngle);
                    const proj2 = project3D(p2x, p2y, p2z, currentAngle);

                    if (proj1.visible || proj2.visible) {
                        const midX = (p1x + p2x) * 0.65;
                        const midY = (p1y + p2y) * 0.65;
                        const midZ = (p1z + p2z) * 0.65;
                        const projMid = project3D(midX, midY, midZ, currentAngle);

                        ctx.beginPath();
                        ctx.moveTo(proj1.x2d, proj1.y2d);
                        ctx.quadraticCurveTo(projMid.x2d, projMid.y2d, proj2.x2d, proj2.y2d);
                        ctx.strokeStyle = 'rgba(145, 136, 122, 0.6)';
                        ctx.lineWidth = 1.1;
                        ctx.stroke();
                    }
                });

                // 6. Embossed Clay Hub Beads
                hubCoords.forEach(c => {
                    const px = radius * Math.cos(c.lat) * Math.sin(c.lon);
                    const py = radius * Math.sin(c.lat);
                    const pz = radius * Math.cos(c.lat) * Math.cos(c.lon);
                    const proj = project3D(px, py, pz, currentAngle);

                    if (proj.visible) {
                        // Drop shadow
                        ctx.fillStyle = 'rgba(135, 125, 112, 0.4)';
                        ctx.beginPath();
                        ctx.arc(proj.x2d + 1, proj.y2d + 1.2, 2.5, 0, Math.PI * 2);
                        ctx.fill();

                        // White clay bead
                        const beadGrad = ctx.createRadialGradient(proj.x2d - 0.7, proj.y2d - 0.7, 0.5, proj.x2d, proj.y2d, 2.2);
                        beadGrad.addColorStop(0, '#FFFFFF');
                        beadGrad.addColorStop(1, '#D8D1C5');
                        ctx.fillStyle = beadGrad;
                        ctx.beginPath();
                        ctx.arc(proj.x2d, proj.y2d, 2.2, 0, Math.PI * 2);
                        ctx.fill();
                    }
                });

                // 7. Outer Clay Orbital Rings
                const orbitR = radius * 1.28;
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(-0.35);
                ctx.beginPath();
                ctx.ellipse(0, 0, orbitR, orbitR * 0.38, 0, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(165, 155, 142, 0.6)';
                ctx.lineWidth = 1.2;
                ctx.stroke();

                // Satellite bead
                const satAngle = (timestamp * 0.001) % (Math.PI * 2);
                const satX = orbitR * Math.cos(satAngle);
                const satY = orbitR * 0.38 * Math.sin(satAngle);

                // Satellite bead shadow
                ctx.fillStyle = 'rgba(140, 130, 118, 0.4)';
                ctx.beginPath();
                ctx.arc(satX + 1, satY + 1.5, 3, 0, Math.PI * 2);
                ctx.fill();

                // Satellite clay bead
                const satGrad = ctx.createRadialGradient(satX - 1, satY - 1, 0.5, satX, satY, 2.8);
                satGrad.addColorStop(0, '#FFFFFF');
                satGrad.addColorStop(1, '#D0C8BC');
                ctx.fillStyle = satGrad;
                ctx.beginPath();
                ctx.arc(satX, satY, 2.8, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [isDark, size]);

    // Mouse drag interaction
    const handleMouseDown = (e: React.MouseEvent) => {
        isDraggingRef.current = true;
        lastMouseX.current = e.clientX;
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDraggingRef.current) return;
        const deltaX = e.clientX - lastMouseX.current;
        lastMouseX.current = e.clientX;
        userRotationOffset.current += deltaX * 0.015;
        velocityRef.current = deltaX * 0.008;
    };

    const handleMouseUp = () => {
        isDraggingRef.current = false;
    };

    return (
        <div
            className={`relative flex items-center justify-center cursor-grab active:cursor-grabbing select-none ${className}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            title="Interactive 3D Global Network - Drag to rotate"
        >
            <canvas
                ref={canvasRef}
                style={{ width: `${size}px`, height: `${size}px` }}
                className="w-full h-auto max-w-full drop-shadow-md"
            />
        </div>
    );
}
