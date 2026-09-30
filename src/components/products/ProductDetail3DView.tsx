'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { 
    Download, MessageSquare, CheckCircle2, X, ZoomIn, ZoomOut, Maximize2, Sparkles, ShieldCheck
} from 'lucide-react';
import RecordProductVisit from './RecordProductVisit';
import Coded3DGlobe from './Coded3DGlobe';
import { useSettings } from '@/context/SettingsContext';
import { extractProductImages, DEFAULT_PRODUCT_IMAGE } from '@/lib/utils';

interface ProductDetail3DViewProps {
    product: any;
    relatedProducts: any[];
    fallbackRecent: any[];
}

/* ─────────────────────────────────────────────────────────────
   3D Vertical / Branching Flowchart for Manufacturing Details
   100% Coded SVG with Photorealistic 3D Clay & Neon Glow Filters
───────────────────────────────────────────────────────────────── */
function ManufacturingFlowchart3D() {
    return (
        <div className="w-full max-w-sm mx-auto select-none py-2">
            {/* Light Mode: 3D Clay Neumorphic Extruded Flowchart */}
            <svg viewBox="0 0 250 185" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto dark:hidden">
                <defs>
                    <filter id="mfgClayShadow" x="-30%" y="-30%" width="160%" height="160%">
                        <feDropShadow dx="3" dy="4" stdDeviation="2.8" floodColor="#A39B8D" floodOpacity="0.5" />
                        <feDropShadow dx="-2" dy="-2" stdDeviation="1.8" floodColor="#FFFFFF" floodOpacity="0.95" />
                    </filter>
                    <filter id="mfgClayLine" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="1.5" dy="2" stdDeviation="1.2" floodColor="#A39B8D" floodOpacity="0.4" />
                        <feDropShadow dx="-1" dy="-1" stdDeviation="0.8" floodColor="#FFFFFF" floodOpacity="0.8" />
                    </filter>
                    <linearGradient id="clayNodeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#F5EFE6" />
                        <stop offset="100%" stopColor="#DDD7CB" />
                    </linearGradient>
                </defs>

                {/* Top Node: Processing */}
                <rect x="90" y="8" width="70" height="24" rx="7" fill="url(#clayNodeGrad)" stroke="#CCC4B5" strokeWidth="1.2" filter="url(#mfgClayShadow)" />
                <text x="125" y="23" fill="#2D2A26" fontSize="8" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">Processing</text>

                {/* Line down from Processing to Manufacturing */}
                <path d="M125 32 L125 49" stroke="#9E9688" strokeWidth="1.8" strokeLinecap="round" filter="url(#mfgClayLine)" />
                <path d="M122.5 46 L125 50 L127.5 46" stroke="#9E9688" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />

                {/* Left Branch: Order */}
                <rect x="8" y="52" width="56" height="24" rx="7" fill="url(#clayNodeGrad)" stroke="#CCC4B5" strokeWidth="1.2" filter="url(#mfgClayShadow)" />
                <text x="36" y="67" fill="#2D2A26" fontSize="8" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">Order</text>

                {/* Arrow from Order to Manufacturing */}
                <path d="M64 64 L87 64" stroke="#9E9688" strokeWidth="1.8" strokeLinecap="round" filter="url(#mfgClayLine)" />
                <path d="M84 61.5 L88 64 L84 66.5" stroke="#9E9688" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />

                {/* Center Node: Manufacturing */}
                <rect x="90" y="52" width="70" height="24" rx="7" fill="url(#clayNodeGrad)" stroke="#CCC4B5" strokeWidth="1.2" filter="url(#mfgClayShadow)" />
                <text x="125" y="67" fill="#2D2A26" fontSize="8" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">Manufacturing</text>

                {/* Line down to Distribution */}
                <path d="M125 76 L125 93" stroke="#9E9688" strokeWidth="1.8" strokeLinecap="round" filter="url(#mfgClayLine)" />
                <path d="M122.5 90 L125 94 L127.5 90" stroke="#9E9688" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />

                {/* Center Node: Distribution */}
                <rect x="90" y="96" width="70" height="24" rx="7" fill="url(#clayNodeGrad)" stroke="#CCC4B5" strokeWidth="1.2" filter="url(#mfgClayShadow)" />
                <text x="125" y="111" fill="#2D2A26" fontSize="8" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">Distribution</text>

                {/* Right Branch: Diamond Quality Decision */}
                <path d="M160 64 L176 64" stroke="#9E9688" strokeWidth="1.8" strokeLinecap="round" filter="url(#mfgClayLine)" />
                <path d="M173 61.5 L177 64 L173 66.5" stroke="#9E9688" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />

                <polygon points="198,51 220,64 198,77 176,64" fill="url(#clayNodeGrad)" stroke="#CCC4B5" strokeWidth="1.2" filter="url(#mfgClayShadow)" />
                <text x="198" y="66" fill="#2D2A26" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">QC Pass</text>

                {/* Down from Diamond to Shipping */}
                <path d="M198 77 L198 120 L188 120" stroke="#9E9688" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" filter="url(#mfgClayLine)" />
                <path d="M191 117.5 L187 120 L191 122.5" stroke="#9E9688" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />

                {/* Final Node: Shipping */}
                <rect x="135" y="108" width="52" height="24" rx="7" fill="url(#clayNodeGrad)" stroke="#CCC4B5" strokeWidth="1.2" filter="url(#mfgClayShadow)" />
                <text x="161" y="123" fill="#2D2A26" fontSize="8" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">Shipping</text>
            </svg>

            {/* Dark Mode: Radiant Neon Cyan Holographic Flowchart */}
            <svg viewBox="0 0 250 185" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto hidden dark:block">
                <defs>
                    <filter id="mfgNeonCyan" x="-30%" y="-30%" width="160%" height="160%">
                        <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#38BDF8" floodOpacity="0.85" />
                        <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#67E8F9" floodOpacity="0.95" />
                    </filter>
                </defs>

                {/* Top Node: Processing */}
                <rect x="90" y="8" width="70" height="24" rx="7" fill="rgba(8, 24, 48, 0.85)" stroke="#38BDF8" strokeWidth="1.6" filter="url(#mfgNeonCyan)" />
                <text x="125" y="23" fill="#E0F2FE" fontSize="8" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">Processing</text>

                {/* Line down to Manufacturing */}
                <path d="M125 32 L125 49" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round" filter="url(#mfgNeonCyan)" />
                <path d="M122.5 46 L125 50 L127.5 46" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />

                {/* Left Branch: Order */}
                <rect x="8" y="52" width="56" height="24" rx="7" fill="rgba(8, 24, 48, 0.85)" stroke="#38BDF8" strokeWidth="1.6" filter="url(#mfgNeonCyan)" />
                <text x="36" y="67" fill="#E0F2FE" fontSize="8" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">Order</text>

                {/* Arrow to Manufacturing */}
                <path d="M64 64 L87 64" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round" filter="url(#mfgNeonCyan)" />
                <path d="M84 61.5 L88 64 L84 66.5" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />

                {/* Center Node: Manufacturing */}
                <rect x="90" y="52" width="70" height="24" rx="7" fill="rgba(12, 32, 60, 0.9)" stroke="#38BDF8" strokeWidth="1.6" filter="url(#mfgNeonCyan)" />
                <text x="125" y="67" fill="#E0F2FE" fontSize="8" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">Manufacturing</text>

                {/* Line down to Distribution */}
                <path d="M125 76 L125 93" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round" filter="url(#mfgNeonCyan)" />
                <path d="M122.5 90 L125 94 L127.5 90" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />

                {/* Center Node: Distribution */}
                <rect x="90" y="96" width="70" height="24" rx="7" fill="rgba(8, 24, 48, 0.85)" stroke="#38BDF8" strokeWidth="1.6" filter="url(#mfgNeonCyan)" />
                <text x="125" y="111" fill="#E0F2FE" fontSize="8" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">Distribution</text>

                {/* Right Branch: Diamond Quality Decision */}
                <path d="M160 64 L176 64" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round" filter="url(#mfgNeonCyan)" />
                <path d="M173 61.5 L177 64 L173 66.5" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />

                <polygon points="198,51 220,64 198,77 176,64" fill="rgba(14, 165, 233, 0.25)" stroke="#67E8F9" strokeWidth="1.6" filter="url(#mfgNeonCyan)" />
                <text x="198" y="66" fill="#E0F2FE" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">QC Pass</text>

                {/* Down from Diamond to Shipping */}
                <path d="M198 77 L198 120 L188 120" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" filter="url(#mfgNeonCyan)" />
                <path d="M191 117.5 L187 120 L191 122.5" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />

                {/* Final Node: Shipping */}
                <rect x="135" y="108" width="52" height="24" rx="7" fill="rgba(8, 24, 48, 0.85)" stroke="#38BDF8" strokeWidth="1.6" filter="url(#mfgNeonCyan)" />
                <text x="161" y="123" fill="#E0F2FE" fontSize="8" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">Shipping</text>
            </svg>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   3D Horizontal Pipeline Flowchart for Recently Viewed Section
   100% Coded SVG with Photorealistic 3D Clay & Neon Glow Filters
───────────────────────────────────────────────────────────────── */
function PipelineFlowchart3D() {
    return (
        <div className="w-full select-none py-1">
            {/* Light Mode: 3D Clay Horizontal Pipeline */}
            <svg viewBox="0 0 280 92" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto dark:hidden">
                <defs>
                    <filter id="pipeClayShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="2" dy="3" stdDeviation="2.2" floodColor="#A39B8D" floodOpacity="0.45" />
                        <feDropShadow dx="-1.5" dy="-1.5" stdDeviation="1.2" floodColor="#FFFFFF" floodOpacity="0.9" />
                    </filter>
                    <linearGradient id="pipeClayNodeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#F5EFE6" />
                        <stop offset="100%" stopColor="#DDD7CB" />
                    </linearGradient>
                </defs>

                {/* Node 1: Order */}
                <rect x="6" y="34" width="48" height="24" rx="6" fill="url(#pipeClayNodeGrad)" stroke="#CCC4B5" strokeWidth="1.2" filter="url(#pipeClayShadow)" />
                <text x="30" y="49" fill="#2D2A26" fontSize="7.5" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">Order</text>

                {/* Arrow to Packing */}
                <path d="M54 46 L73 46" stroke="#9E9688" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M70 43.5 L74 46 L70 48.5" stroke="#9E9688" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

                {/* Node 2: Packing */}
                <rect x="75" y="34" width="52" height="24" rx="6" fill="url(#pipeClayNodeGrad)" stroke="#CCC4B5" strokeWidth="1.2" filter="url(#pipeClayShadow)" />
                <text x="101" y="49" fill="#2D2A26" fontSize="7.5" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">Packing</text>

                {/* Arrow to Shipping */}
                <path d="M127 46 L146 46" stroke="#9E9688" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M143 43.5 L147 46 L143 48.5" stroke="#9E9688" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

                {/* Node 3: Shipping */}
                <rect x="148" y="34" width="54" height="24" rx="6" fill="url(#pipeClayNodeGrad)" stroke="#CCC4B5" strokeWidth="1.2" filter="url(#pipeClayShadow)" />
                <text x="175" y="49" fill="#2D2A26" fontSize="7.5" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">Shipping</text>

                {/* Top Branch: Sourcing supply-chain */}
                <path d="M101 34 L101 16 L145 16" stroke="#9E9688" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M142 13.5 L146 16 L142 18.5" stroke="#9E9688" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="148" y="5" width="62" height="22" rx="6" fill="url(#pipeClayNodeGrad)" stroke="#CCC4B5" strokeWidth="1.2" filter="url(#pipeClayShadow)" />
                <text x="179" y="19" fill="#2D2A26" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">Supply Chain</text>

                {/* Bottom Branch: Inventory */}
                <path d="M175 58 L175 72 L200 72" stroke="#9E9688" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M197 69.5 L201 72 L197 74.5" stroke="#9E9688" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="203" y="61" width="58" height="22" rx="6" fill="url(#pipeClayNodeGrad)" stroke="#CCC4B5" strokeWidth="1.2" filter="url(#pipeClayShadow)" />
                <text x="232" y="75" fill="#2D2A26" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">Inventory</text>
            </svg>

            {/* Dark Mode: Radiant Neon Cyan Horizontal Pipeline */}
            <svg viewBox="0 0 280 92" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto hidden dark:block">
                <defs>
                    <filter id="pipeNeonCyan" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#38BDF8" floodOpacity="0.85" />
                    </filter>
                </defs>

                {/* Node 1: Order */}
                <rect x="6" y="34" width="48" height="24" rx="6" fill="rgba(8, 24, 48, 0.85)" stroke="#38BDF8" strokeWidth="1.5" filter="url(#pipeNeonCyan)" />
                <text x="30" y="49" fill="#E0F2FE" fontSize="7.5" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">Order</text>

                {/* Arrow to Packing */}
                <path d="M54 46 L73 46" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M70 43.5 L74 46 L70 48.5" stroke="#38BDF8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />

                {/* Node 2: Packing */}
                <rect x="75" y="34" width="52" height="24" rx="6" fill="rgba(12, 32, 60, 0.9)" stroke="#38BDF8" strokeWidth="1.5" filter="url(#pipeNeonCyan)" />
                <text x="101" y="49" fill="#E0F2FE" fontSize="7.5" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">Packing</text>

                {/* Arrow to Shipping */}
                <path d="M127 46 L146 46" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M143 43.5 L147 46 L143 48.5" stroke="#38BDF8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />

                {/* Node 3: Shipping */}
                <rect x="148" y="34" width="54" height="24" rx="6" fill="rgba(8, 24, 48, 0.85)" stroke="#38BDF8" strokeWidth="1.5" filter="url(#pipeNeonCyan)" />
                <text x="175" y="49" fill="#E0F2FE" fontSize="7.5" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">Shipping</text>

                {/* Top Branch: Supply Chain */}
                <path d="M101 34 L101 16 L145 16" stroke="#38BDF8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M142 13.5 L146 16 L142 18.5" stroke="#38BDF8" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="148" y="5" width="62" height="22" rx="6" fill="rgba(8, 24, 48, 0.85)" stroke="#38BDF8" strokeWidth="1.4" filter="url(#pipeNeonCyan)" />
                <text x="179" y="19" fill="#E0F2FE" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">Supply Chain</text>

                {/* Bottom Branch: Inventory */}
                <path d="M175 58 L175 72 L200 72" stroke="#38BDF8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M197 69.5 L201 72 L197 74.5" stroke="#38BDF8" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="203" y="61" width="58" height="22" rx="6" fill="rgba(8, 24, 48, 0.85)" stroke="#38BDF8" strokeWidth="1.4" filter="url(#pipeNeonCyan)" />
                <text x="232" y="75" fill="#E0F2FE" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">Inventory</text>
            </svg>
        </div>
    );
}

export default function ProductDetail3DView({
    product,
    relatedProducts = [],
    fallbackRecent = []
}: ProductDetail3DViewProps) {
    // Parse specs safely
    let specs: Record<string, string> = {};
    try {
        if (typeof product.specifications === 'string') {
            const p = JSON.parse(product.specifications);
            if (p && typeof p === 'object') specs = p;
        } else if (product.specifications && typeof product.specifications === 'object') {
            specs = product.specifications;
        }
    } catch { }

    // Parse image list safely
    const images = extractProductImages(product.images, DEFAULT_PRODUCT_IMAGE);

    const { settings } = useSettings();
    const showB2bBanner = settings['product_detail_show_b2b_banner'] !== 'false';
    const showMetrics = settings['product_detail_show_metrics'] !== 'false';
    const showSpecsTable = settings['product_detail_show_specs'] !== 'false';
    const showGlobe = settings['product_detail_show_globe'] !== 'false';
    const showFlowchart = settings['product_detail_show_flowchart'] !== 'false';

    const [activeImage, setActiveImage] = useState<string>(images[0] || DEFAULT_PRODUCT_IMAGE);

    React.useEffect(() => {
        if (images.length > 0 && !images.includes(activeImage)) {
            setActiveImage(images[0]);
        }
    }, [product.images]);
    const [isQuoteOpen, setIsQuoteOpen] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [formSuccess, setFormSuccess] = useState(false);
    const [formError, setFormError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        targetQuantity: 'Flexible / As per requirement',
        message: `Inquiry regarding custom production for: ${product.name}`
    });

    // ── Amazon-style Fabric Zoom State ──
    const [isZooming, setIsZooming] = useState(false);
    const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
    const [isFullscreenZoom, setIsFullscreenZoom] = useState(false);
    const [lightboxZoomLevel, setLightboxZoomLevel] = useState(2);
    const imgContainerRef = useRef<HTMLDivElement | null>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setZoomPos({
            x: Math.max(0, Math.min(100, x)),
            y: Math.max(0, Math.min(100, y))
        });
    };

    const handleQuoteSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError('');
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    productInterest: product.name,
                    message: `[Product Inquiry: ${product.name} | Target Quantity: ${formData.targetQuantity}]\n${formData.message}`
                })
            });
            if (!res.ok) throw new Error('Failed to submit quote');
            setFormSuccess(true);
            setTimeout(() => {
                setFormSuccess(false);
                setIsQuoteOpen(false);
            }, 3000);
        } catch {
            setFormError('Submission failed. Please try again.');
        } finally {
            setFormLoading(false);
        }
    };

    // ── Universal, buyer-centric specifications matching global demand ──
    const specRows = [
        { 
            label: 'Order Volume', 
            val: 'Flexible (Custom as per Buyer Request)' 
        },
        { 
            label: 'Fabric Type', 
            val: specs['Fabric'] || '100% Combed / Ring-Spun Cotton, CVC, Poly Blends (As Required)' 
        },
        { 
            label: 'Weight (GSM)', 
            val: 'Custom GSM (140 - 280+ GSM / Tailored by Region & Season)' 
        },
        { 
            label: 'Dyeing & Wash', 
            val: 'Reactive Eco-Friendly / OEKO-TEX Certified / Pantone Matching' 
        },
        { 
            label: 'Fit & Sizing', 
            val: 'US, EU, Asian or Custom Tech Pack Fit' 
        },
        { 
            label: 'Customization', 
            val: 'Screen Print, Embroidery, DTG, Custom Woven Labels' 
        },
    ];

    // Background 3D assets for viewport framing
    const blazerLight = '/images/contact/blazer_light.jpg';
    const blazerDark = '/images/contact/blazer_dark.jpg';

    return (
        <div className="product-3d-canvas min-h-screen relative overflow-hidden transition-colors duration-500">
            {/* Record visit in localStorage */}
            <RecordProductVisit id={product.id} />

            {/* Dark mode ambient glowing fogs */}
            <div className="dark:block hidden pointer-events-none absolute inset-0 overflow-hidden z-0">
                <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-cyan-500/10 blur-[130px]" />
                <div className="absolute top-1/2 right-0 w-[540px] h-[540px] rounded-full bg-blue-600/10 blur-[160px]" />
                <div className="absolute bottom-20 left-1/3 w-80 h-80 rounded-full bg-teal-400/8 blur-[110px]" />
            </div>

            {/* ═══════════════════════ FLOATING 3D BLAZERS ON VIEWPORT MARGINS ═══════════════════════ */}
            {/* Right Margin Blazer Sleeve (Aligned with Specs Card) */}
            <div className="hidden lg:block absolute -right-6 top-36 pointer-events-none z-0 w-24 h-48 sm:w-28 sm:h-56 overflow-hidden select-none floating-reverse">
                <img
                    src={blazerLight}
                    alt="Tailored Blazer Accent"
                    className="w-full h-full object-cover dark:hidden opacity-90 drop-shadow-[0_12px_24px_rgba(150,145,135,0.4)]"
                />
                <img
                    src={blazerDark}
                    alt="Tailored Blazer Accent Dark"
                    className="w-full h-full object-cover hidden dark:block opacity-90 drop-shadow-[0_0_24px_rgba(6,182,212,0.4)]"
                />
            </div>

            {/* Left Margin Blazer Sleeve (Positioned lower so it NEVER collides with the product stage or thumbnail row) */}
            <div className="hidden lg:block absolute -left-8 top-[920px] pointer-events-none z-0 w-24 h-48 sm:w-28 sm:h-56 overflow-hidden select-none floating-slow opacity-60">
                <img
                    src={blazerLight}
                    alt="Tailored Blazer Left Accent"
                    className="w-full h-full object-cover dark:hidden opacity-90 drop-shadow-[0_12px_24px_rgba(150,145,135,0.4)] transform -scale-x-100"
                />
                <img
                    src={blazerDark}
                    alt="Tailored Blazer Left Accent Dark"
                    className="w-full h-full object-cover hidden dark:block opacity-90 drop-shadow-[0_0_24px_rgba(6,182,212,0.4)] transform -scale-x-100"
                />
            </div>

            <div className="container mx-auto max-w-6xl px-4 sm:px-6 pt-24 sm:pt-28 pb-24 relative z-10 space-y-12 sm:space-y-16">

                {/* ═══════════════════════ TOP SECTION: PRODUCT SHOWCASE & PRIMARY INFO ═══════════════════════ */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

                    {/* Left Column: Spacious Open Product Showcase & Horizontal Thumbnails Row (Matching Reference Layout) */}
                    <div className="lg:col-span-7 flex flex-col w-full">
                        {/* Breadcrumb Navigation Above Showcase Stage (Matching Reference Screenshot 4: HOME / KNIT / KIDSWEAR) */}
                        <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-2 text-[11px] sm:text-xs font-bold tracking-widest uppercase mb-3.5 text-slate-500 dark:text-slate-400">
                            <Link href="/" className="hover:text-primary dark:hover:text-cyan-400 transition-colors">HOME</Link>
                            <span className="text-slate-400 dark:text-slate-600 font-normal">/</span>
                            <Link 
                                href={product.category?.slug ? `/products?category=${encodeURIComponent(product.category.slug)}` : '/products'} 
                                className="hover:text-primary dark:hover:text-cyan-400 transition-colors"
                            >
                                {(product.category?.name || 'GARMENTS').toUpperCase()}
                            </Link>
                            {(product.subcategory || product.name) && (
                                <>
                                    <span className="text-slate-400 dark:text-slate-600 font-normal">/</span>
                                    <span className="text-primary dark:text-cyan-400 font-black truncate max-w-[260px]">
                                        {(product.subcategory || product.name).toUpperCase()}
                                    </span>
                                </>
                            )}
                        </nav>

                        <div className="relative w-full">
                            {/* Ambient Top Spotlight Beam in Dark Mode */}
                            <div className="hidden dark:block pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-72 bg-gradient-to-b from-cyan-400/25 via-cyan-500/10 to-transparent blur-2xl [clip-path:polygon(25%_0%,75%_0%,100%_100%,0%_100%)] z-0" />

                            {/* Main Product Showcase Stage - Open, generous, unrestrained by cramped box */}
                            <div className="prod-stage-bezel rounded-[28px] sm:rounded-[36px] p-3 sm:p-5 relative z-10 flex flex-col items-center justify-center min-h-[380px] sm:min-h-[460px] md:min-h-[500px]">
                                
                                {/* Amazon-Style Interactive Zoom Container */}
                                <div 
                                    ref={imgContainerRef}
                                    className="w-full h-full min-h-[350px] sm:min-h-[430px] md:min-h-[470px] flex items-center justify-center overflow-hidden rounded-[20px] sm:rounded-[28px] relative cursor-crosshair select-none p-3 group bg-black/[0.02] dark:bg-white/[0.02]"
                                    onMouseEnter={() => setIsZooming(true)}
                                    onMouseLeave={() => setIsZooming(false)}
                                    onMouseMove={handleMouseMove}
                                    onClick={() => setIsFullscreenZoom(true)}
                                    title="Click to open Fullscreen HD Zoom Inspector"
                                >
                                    {/* The Product Image with Smooth Pan-Zoom */}
                                    <img
                                        src={activeImage}
                                        alt={`${product.name} - B2B Export Garment Specification`}
                                        width={800}
                                        height={800}
                                        style={{
                                            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                                            transform: isZooming ? 'scale(2.8)' : 'scale(1)',
                                            transition: isZooming ? 'transform 0.08s ease-out' : 'transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                        }}
                                        className="w-full h-auto max-h-[340px] sm:max-h-[420px] md:max-h-[460px] object-contain select-none pointer-events-none drop-shadow-[0_16px_30px_rgba(150,145,135,0.35)] dark:drop-shadow-[0_0_28px_rgba(56,189,248,0.45)]"
                                    />

                                    {/* Optical Crosshair Reticle on Zoom */}
                                    {isZooming && (
                                        <div 
                                            className="pointer-events-none absolute w-16 h-16 rounded-full border border-primary/50 dark:border-cyan-400/60 shadow-[0_0_15px_rgba(56,189,248,0.3)] -translate-x-1/2 -translate-y-1/2"
                                            style={{
                                                left: `${zoomPos.x}%`,
                                                top: `${zoomPos.y}%`,
                                            }}
                                        />
                                    )}

                                    {/* Fullscreen Expand Action Button */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsFullscreenZoom(true);
                                        }}
                                        className="absolute top-3 right-3 p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900/90 text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 shadow-md cursor-pointer"
                                        title="Inspect Fabric in Fullscreen"
                                    >
                                        <Maximize2 size={15} />
                                    </button>

                                    {/* Amazon-Style Tooltip Pill Badge */}
                                    <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 px-3.5 py-1.5 rounded-full text-[10.5px] font-bold tracking-wider uppercase transition-all duration-300 pointer-events-none flex items-center gap-1.5 shadow-sm ${
                                        isZooming 
                                            ? 'bg-slate-900 text-white dark:bg-cyan-500 dark:text-slate-950 opacity-95 scale-95' 
                                            : 'bg-black/50 text-white/90 backdrop-blur-sm opacity-80 group-hover:opacity-100'
                                    }`}>
                                        <ZoomIn size={12} />
                                        <span>{isZooming ? 'Pan to inspect fabric (2.8x)' : 'Roll over image to zoom'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Clean Centered Row of 3D Extruded Thumbnail Cards Directly Underneath (No Scrollbar, Cross-Browser) */}
                            {images.length > 1 && (
                                <div className="flex items-center justify-center flex-wrap sm:flex-nowrap gap-3 sm:gap-4 mt-5 py-2 px-1 w-full overflow-x-auto no-scrollbar">
                                    {images.map((img, idx) => {
                                        const isSelected = activeImage === img;
                                        return (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setActiveImage(img)}
                                                className={`thumb-stage-card relative w-20 h-20 sm:w-22 sm:h-22 md:w-24 md:h-24 rounded-2xl overflow-hidden p-2 transition-all duration-300 shrink-0 cursor-pointer ${
                                                    isSelected ? 'active-thumb-stage' : 'inactive-thumb-stage'
                                                }`}
                                                title={`View angle ${idx + 1}`}
                                            >
                                                <img
                                                    src={img}
                                                    alt={`${product.name} thumbnail ${idx + 1}`}
                                                    width={96}
                                                    height={96}
                                                    className="w-full h-full object-contain pointer-events-none select-none transition-transform duration-300"
                                                />
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* 100% CODED INTERACTIVE 3D GLOBE UNDERNEATH PRODUCT STAGE */}
                            {showGlobe && (
                                <div className="floating-slow flex items-center justify-center mt-6 w-36 h-36 sm:w-40 sm:h-40 mx-auto">
                                    <Coded3DGlobe size={160} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Product Title, Custom Sourcing Plaque, Flexible Metrics & Actions */}
                    <div className="lg:col-span-5 flex flex-col justify-start space-y-5 relative">
                        {/* Title & Short Tagline */}
                        <div className="relative z-10">
                            <h1 className="prod-title text-2xl sm:text-3xl md:text-4xl font-black tracking-tight uppercase font-heading">
                                {product.name}
                            </h1>
                            <p className="prod-subtext text-xs sm:text-[13px] leading-relaxed font-medium mt-1.5 max-w-lg">
                                {product.shortDescription || 'Clean, modern typography with responsive architecture, global export manufacturing and realistic soft 3D textures.'}
                            </p>
                        </div>

                        {/* Custom Manufacturing & OEM Sourcing Plaque (Universal for all buyers) */}
                        {showB2bBanner && (
                            <div className="pricing-plaque rounded-2xl p-4 sm:p-5 relative z-10">
                                <div className="text-[11.5px] font-black uppercase tracking-wider pricing-heading mb-1 flex items-center justify-between">
                                    <span className="flex items-center gap-1.5">
                                        <Sparkles size={14} className="text-amber-600 dark:text-cyan-400" />
                                        <span>CUSTOM MANUFACTURING & OEM SOURCING</span>
                                    </span>
                                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-900/10 dark:bg-cyan-500/20 text-slate-800 dark:text-cyan-300 border border-slate-400/30 dark:border-cyan-400/40">
                                        ON-DEMAND QUOTATION
                                    </span>
                                </div>
                                <p className="text-[11px] leading-relaxed pricing-subtext font-medium">
                                    Tailored manufacturing configured to your custom tech pack, yarn specifications, target order volume, and destination export timelines.
                                </p>
                            </div>
                        )}

                        {/* 3 Key Metric Pills: Universal, Flexible & Buyer-Centric */}
                        {showMetrics && (
                            <div className="grid grid-cols-3 gap-3 relative z-10">
                                <div className="metric-pill rounded-2xl p-3 text-center flex flex-col justify-center">
                                    <span className="metric-label text-[10px] font-bold uppercase tracking-wider mb-0.5">BATCH SIZE</span>
                                    <span className="metric-val text-xs sm:text-sm font-black">Flexible (Custom)</span>
                                </div>
                                <div className="metric-pill rounded-2xl p-3 text-center flex flex-col justify-center">
                                    <span className="metric-label text-[10px] font-bold uppercase tracking-wider mb-0.5">TIMELINE</span>
                                    <span className="metric-val text-xs sm:text-sm font-black">Agile / On-Demand</span>
                                </div>
                                <div className="metric-pill rounded-2xl p-3 text-center flex flex-col justify-center">
                                    <span className="metric-label text-[10px] font-bold uppercase tracking-wider mb-0.5">QUALITY TIER</span>
                                    <span className="metric-val text-xs sm:text-sm font-black">Buyer QC Standard</span>
                                </div>
                            </div>
                        )}

                        {/* Product Specifications Card & Table */}
                        {showSpecsTable && (
                            <div className="specs-card rounded-[24px] p-5 sm:p-6 relative z-10 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="specs-heading text-sm sm:text-base font-black uppercase tracking-tight">
                                        Product Specifications
                                    </h3>
                                    <span className="text-[10.5px] font-bold text-slate-500 dark:text-cyan-300 flex items-center gap-1">
                                        <ShieldCheck size={13} />
                                        <span>Export Ready</span>
                                    </span>
                                </div>
                                <div className="rounded-xl overflow-hidden border border-slate-300/50 dark:border-cyan-400/20">
                                    <table className="w-full text-xs text-left">
                                        <thead>
                                            <tr className="table-header-row border-b border-slate-300/60 dark:border-cyan-400/20">
                                                <th className="py-2.5 px-4 font-bold uppercase tracking-wider text-[11px] w-2/5">Parameter</th>
                                                <th className="py-2.5 px-4 font-bold uppercase tracking-wider text-[11px]">Volume</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-300/40 dark:divide-white/5">
                                            {specRows.map((row, idx) => (
                                                <tr key={idx} className="table-row-hover transition-colors">
                                                    <td className="py-2.5 px-4 font-bold text-slate-700 dark:text-slate-300">{row.label}</td>
                                                    <td className="py-2.5 px-4 font-medium text-slate-600 dark:text-slate-400">{row.val}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons: Request Quotation & Download PDF */}
                        <div className="flex items-center gap-3.5 pt-2 relative z-10">
                            <button
                                type="button"
                                onClick={() => setIsQuoteOpen(true)}
                                className="action-btn-primary flex-1 py-3.5 px-6 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 hover:scale-105 active:scale-95 text-center cursor-pointer shadow-md flex items-center justify-center gap-2"
                            >
                                <MessageSquare size={14} />
                                <span>Request Quotation</span>
                            </button>

                            <a
                                href="/api/company-profile/pdf?download=true"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="action-btn-secondary flex-1 py-3.5 px-6 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 hover:scale-105 active:scale-95 text-center cursor-pointer shadow-md flex items-center justify-center gap-2"
                            >
                                <Download size={14} />
                                <span>Download PDF</span>
                            </a>
                        </div>
                    </div>
                </section>


                {/* ═══════════════════════ SECTION 2: PRODUCT OVERVIEW & MANUFACTURING DETAILS ═══════════════════════ */}
                <section className="relative pt-6 sm:pt-8 border-t border-slate-300/50 dark:border-white/10">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
                        {/* Left: Detailed Narrative */}
                        <div className={showFlowchart ? "md:col-span-7 space-y-4" : "md:col-span-12 space-y-4"}>
                            <h2 className="section-heading text-xl sm:text-2xl font-black uppercase tracking-tight font-heading">
                                Product Overview & Manufacturing Details
                            </h2>
                            <div className="section-text text-xs sm:text-[13px] leading-relaxed font-medium space-y-3.5">
                                <p>
                                    {product.description ||
                                        'The production process is engineered for executive compliance and production in center to control unit. Make sure the quality, the production protection and expertise suited for global distribution and its production position products.'}
                                </p>
                                <p>
                                    The overview is seamless in inspection and maintain-track of the finishing production stages to ensure premium standards and discretion of this plant. Every garment undergoes a four-stage quality assurance protocol aligned strictly with buyer specifications and international inspection standards.
                                </p>
                            </div>
                        </div>

                        {/* Right: 100% Coded 3D Flowchart Diagram */}
                        {showFlowchart && (
                            <div className="md:col-span-5 flex justify-center">
                                <ManufacturingFlowchart3D />
                            </div>
                        )}
                    </div>
                </section>


                {/* ═══════════════════════ SECTION 3: RELATED PRODUCTS (3 Cards with Radiant Glow) ═══════════════════════ */}
                <section className="pt-6 sm:pt-8 border-t border-slate-300/50 dark:border-white/10 space-y-6">
                    <h2 className="section-heading text-xl sm:text-2xl font-black uppercase tracking-tight font-heading">
                        Related Products
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {relatedProducts.slice(0, 3).map((rel) => {
                            const relImgs = extractProductImages(rel.images, DEFAULT_PRODUCT_IMAGE);
                            const relImg = relImgs[0] || DEFAULT_PRODUCT_IMAGE;

                            return (
                                <div
                                    key={rel.id}
                                    className="related-card rounded-[28px] p-4 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02]"
                                >
                                    <div>
                                        {/* Recessed 3D Image Bezel */}
                                        <div className="related-img-frame rounded-[20px] p-2.5 h-44 sm:h-48 flex items-center justify-center overflow-hidden mb-3">
                                            <img
                                                src={relImg}
                                                alt={rel.name}
                                                className="w-full h-full object-contain transition-transform duration-500 hover:scale-105"
                                            />
                                        </div>

                                        <h4 className="related-title text-sm font-black uppercase tracking-tight mb-2 truncate">
                                            {rel.name}
                                        </h4>

                                        {/* 3 Mini Badges: Universal B2B */}
                                        <div className="flex items-center gap-1.5 flex-wrap mb-4">
                                            <span className="mini-badge px-2 py-0.5 rounded-md text-[9.5px] font-bold">
                                                Flexible Batch
                                            </span>
                                            <span className="mini-badge px-2 py-0.5 rounded-md text-[9.5px] font-bold">
                                                Custom Fabric
                                            </span>
                                            <span className="mini-badge px-2 py-0.5 rounded-md text-[9.5px] font-bold">
                                                Export Quality
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action button */}
                                    <Link
                                        href={`/products/${rel.slug || rel.id}`}
                                        className="related-btn block w-full py-2.5 rounded-full text-center text-[10.5px] font-black uppercase tracking-wider transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
                                    >
                                        CTA now
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </section>


                {/* ═══════════════════════ SECTION 4: RECENTLY VIEWED ITEMS & PIPELINE FLOWCHART ═══════════════════════ */}
                <section className="pt-6 sm:pt-8 border-t border-slate-300/50 dark:border-white/10 space-y-6">
                    <h2 className="section-heading text-xl sm:text-2xl font-black uppercase tracking-tight font-heading">
                        Recently Viewed Items
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                        {/* Left: Compact Horizontal Product Pill Card */}
                        <div className="md:col-span-5">
                            {fallbackRecent.slice(0, 1).map((item) => {
                                const itemImgs = extractProductImages(item.images, DEFAULT_PRODUCT_IMAGE);
                                const itemImg = itemImgs[0] || DEFAULT_PRODUCT_IMAGE;

                                return (
                                    <div
                                        key={item.id}
                                        className="recent-pill-card rounded-[24px] p-3.5 flex items-center gap-4 transition-all duration-200 hover:scale-[1.02]"
                                    >
                                        <div className="w-16 h-16 rounded-xl overflow-hidden recent-thumb-box flex items-center justify-center p-1 shrink-0">
                                            <img src={itemImg} alt={item.name} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="text-xs sm:text-sm font-black uppercase tracking-tight truncate recent-title mb-1.5">
                                                {item.name}
                                            </h4>
                                            <Link
                                                href={`/products/${item.slug || item.id}`}
                                                className="recent-btn inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all hover:scale-105"
                                            >
                                                CTA
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Right: 100% Coded Horizontal Pipeline Flowchart */}
                        <div className="md:col-span-7">
                            <PipelineFlowchart3D />
                        </div>
                    </div>
                </section>

            </div>

            {/* ═══════════════════════ FULLSCREEN HD FABRIC INSPECTOR MODAL (3D CLAY & DARK SKEUOMORPHIC) ═══════════════════════ */}
            {isFullscreenZoom && (
                <div 
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-black/75 dark:bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
                    onClick={() => setIsFullscreenZoom(false)}
                >
                    <div 
                        className="relative max-w-5xl w-full h-[88vh] bg-[#F3EFE8] dark:bg-[#0B1324] border border-white/80 dark:border-cyan-500/40 rounded-[32px] overflow-hidden flex flex-col shadow-[0_30px_90px_rgba(0,0,0,0.35),inset_0_2px_4px_rgba(255,255,255,0.9)] dark:shadow-[0_0_60px_rgba(6,182,212,0.25),0_30px_90px_rgba(0,0,0,0.85)] z-10"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* 3D Header Controls */}
                        <div className="p-4 sm:p-5 px-6 border-b border-[#D8D2C5]/70 dark:border-cyan-500/20 bg-gradient-to-r from-[#FAF7F2] to-[#ECE6DC] dark:from-[#091120] dark:to-[#0D1829] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white font-heading truncate max-w-sm sm:max-w-md">
                                    {product.name} — Fabric Inspector
                                </h4>
                                <span className="text-[11px] px-3 py-1 rounded-full bg-[#E5DFD4] dark:bg-cyan-500/20 text-slate-800 dark:text-cyan-300 font-extrabold border border-[#D0C8B8] dark:border-cyan-400/40 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] shrink-0">
                                    {lightboxZoomLevel}x Magnification
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setLightboxZoomLevel(prev => Math.max(1, prev - 0.5))}
                                    className="p-2 sm:p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-white/10 border border-[#DDD6C8] dark:border-cyan-500/30 text-slate-700 dark:text-cyan-300 hover:bg-[#EAE4D9] dark:hover:bg-cyan-500/20 shadow-sm transition-all cursor-pointer"
                                    title="Zoom Out"
                                >
                                    <ZoomOut size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setLightboxZoomLevel(prev => Math.min(4, prev + 0.5))}
                                    className="p-2 sm:p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-white/10 border border-[#DDD6C8] dark:border-cyan-500/30 text-slate-700 dark:text-cyan-300 hover:bg-[#EAE4D9] dark:hover:bg-cyan-500/20 shadow-sm transition-all cursor-pointer"
                                    title="Zoom In"
                                >
                                    <ZoomIn size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsFullscreenZoom(false)}
                                    className="p-2 sm:p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-white/10 border border-[#DDD6C8] dark:border-white/10 text-slate-500 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/20 shadow-sm transition-all ml-1.5 cursor-pointer"
                                    title="Close Inspector"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Interactive Centered Pan/Zoom Image Canvas */}
                        <div 
                            className="flex-1 w-full h-full overflow-hidden flex items-center justify-center p-6 sm:p-10 relative cursor-grab active:cursor-grabbing select-none bg-gradient-to-b from-[#FAF7F2]/50 to-[#EAE4D9]/40 dark:from-[#070D18]/90 dark:to-[#0A1424]/90"
                            onMouseMove={handleMouseMove}
                        >
                            <img
                                src={activeImage}
                                alt={product.name}
                                style={{
                                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                                    transform: `scale(${lightboxZoomLevel})`,
                                    transition: 'transform 0.1s ease-out'
                                }}
                                className="max-w-full max-h-[64vh] object-contain pointer-events-none drop-shadow-[0_20px_45px_rgba(150,145,135,0.4)] dark:drop-shadow-[0_0_40px_rgba(6,182,212,0.35)]"
                            />
                        </div>

                        {/* 3D Footer Tips & Thumbnails */}
                        <div className="p-3.5 px-6 border-t border-[#D8D2C5]/70 dark:border-cyan-500/20 bg-gradient-to-r from-[#FAF7F2] to-[#ECE6DC] dark:from-[#091120] dark:to-[#0D1829] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400 font-medium">
                            <span className="hidden sm:inline">Move cursor to pan across stitches, collar, and fabric grain</span>
                            {images.length > 1 && (
                                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                                    {images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImage(img)}
                                            className={`w-11 h-11 rounded-xl overflow-hidden p-1 transition-all cursor-pointer ${
                                                activeImage === img 
                                                    ? 'bg-white dark:bg-[#12223D] border-2 border-primary dark:border-cyan-400 shadow-md scale-105' 
                                                    : 'bg-[#FAF7F2] dark:bg-white/5 border border-[#DDD6C8] dark:border-white/10 opacity-70 hover:opacity-100 hover:scale-102'
                                            }`}
                                        >
                                            <img src={img} alt={`Angle ${idx + 1}`} className="w-full h-full object-contain pointer-events-none" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════ DIRECT RFQ QUOTATION MODAL ═══════════════════════ */}
            {isQuoteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="modal-glass-card rounded-[32px] p-6 sm:p-8 max-w-md w-full relative shadow-2xl">
                        <button
                            type="button"
                            onClick={() => setIsQuoteOpen(false)}
                            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                        >
                            <X size={18} />
                        </button>
                        <h3 className="modal-heading text-lg sm:text-xl font-black mb-1 uppercase font-heading">
                            Request Quotation
                        </h3>
                        <p className="modal-subtext text-xs mb-5 font-medium">
                            Direct factory pricing for <span className="font-bold text-primary dark:text-cyan-300">{product.name}</span>.
                        </p>
                        {formSuccess ? (
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-2xl flex items-center gap-3 text-xs font-bold">
                                <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                                <span>Inquiry submitted! Our merchandising team will reach out promptly.</span>
                            </div>
                        ) : (
                            <form onSubmit={handleQuoteSubmit} className="space-y-3.5">
                                {formError && (
                                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 rounded-xl text-xs font-bold">{formError}</div>
                                )}
                                <input
                                    type="text"
                                    placeholder="Your Full Name"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl modal-input text-xs font-medium focus:outline-none"
                                />
                                <input
                                    type="email"
                                    placeholder="Corporate Email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl modal-input text-xs font-medium focus:outline-none"
                                />
                                <input
                                    type="tel"
                                    placeholder="Phone / WhatsApp Number"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl modal-input text-xs font-medium focus:outline-none"
                                />
                                <input
                                    type="text"
                                    placeholder="Target Quantity (e.g. 300, 1000, 5000+ pcs)"
                                    value={formData.targetQuantity}
                                    onChange={e => setFormData({ ...formData, targetQuantity: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl modal-input text-xs font-medium focus:outline-none"
                                />
                                <textarea
                                    rows={3}
                                    placeholder="Additional requirements (Fabric GSM, custom tech pack, target delivery)..."
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl modal-input text-xs font-medium focus:outline-none resize-none"
                                />
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="w-full py-3 rounded-xl action-btn-primary text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {formLoading ? 'Submitting...' : 'Submit RFQ'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* ═══════════════════════ EXACT NEUMORPHIC & GLOW STYLING ═══════════════════════ */}
            <style jsx global>{`
                /* ── Canvas Background: Matches reference soft warm clay canvas ── */
                .product-3d-canvas {
                    background-color: #DDD8CF;
                }

                /* ── Left Product Stage 3D Bezel ── */
                .prod-stage-bezel {
                    background-color: #EDE9E1;
                    box-shadow: 
                        16px 16px 32px rgba(160, 155, 145, 0.45),
                        -14px -14px 28px rgba(255, 255, 255, 0.95),
                        inset 2px 2px 4px rgba(255, 255, 255, 0.8),
                        inset -2px -2px 4px rgba(0, 0, 0, 0.05);
                    border: 1.5px solid rgba(255, 255, 255, 0.7);
                }

                /* ── Cross-Browser Scrollbar Elimination ── */
                .no-scrollbar::-webkit-scrollbar {
                    display: none !important;
                    width: 0 !important;
                    height: 0 !important;
                }
                .no-scrollbar {
                    -ms-overflow-style: none !important;
                    scrollbar-width: none !important;
                }

                /* ── 3D Extruded Thumbnails (Light Mode) ── */
                .thumb-stage-card {
                    background: #FAF7F2;
                    transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
                }
                .inactive-thumb-stage {
                    border: 1.5px solid #DDD6C8;
                    box-shadow: 
                        0 4px 10px rgba(150, 145, 135, 0.18),
                        inset 0 1px 2px rgba(255, 255, 255, 0.9);
                    opacity: 0.82;
                }
                .inactive-thumb-stage:hover {
                    opacity: 1;
                    transform: translateY(-2px) scale(1.03);
                    border-color: #B5ACA0;
                    box-shadow: 
                        0 8px 18px rgba(150, 145, 135, 0.28),
                        inset 0 1px 2px rgba(255, 255, 255, 1);
                }
                .active-thumb-stage {
                    border: 2px solid #1E3A8A;
                    box-shadow: 
                        0 0 0 3px rgba(30, 58, 138, 0.2),
                        0 8px 18px rgba(150, 145, 135, 0.35),
                        inset 0 1px 3px rgba(255, 255, 255, 1);
                    transform: scale(1.05);
                    background: #FFFFFF;
                }

                /* ── Typography ── */
                .prod-title {
                    color: #1A1D20;
                }
                .prod-subtext {
                    color: #4B5563;
                }
                .section-heading {
                    color: #1A1D20;
                }
                .section-text {
                    color: #4B5563;
                }

                /* ── Golden Pricing Plaque ── */
                .pricing-plaque {
                    background: linear-gradient(135deg, #F4EEE2 0%, #E6DDCE 100%);
                    box-shadow: 
                        8px 8px 18px rgba(160, 155, 145, 0.4),
                        -6px -6px 14px rgba(255, 255, 255, 0.85),
                        inset 1px 1px 2px rgba(255, 255, 255, 0.7);
                    border: 1px solid rgba(255, 255, 255, 0.6);
                }
                .pricing-heading {
                    color: #2F2A22;
                }
                .pricing-subtext {
                    color: #554F44;
                }

                /* ── 3 Key Metric Pills ── */
                .metric-pill {
                    background-color: #EDE8DF;
                    box-shadow: 
                        6px 6px 14px rgba(160, 155, 145, 0.4),
                        -5px -5px 12px rgba(255, 255, 255, 0.9),
                        inset 1px 1px 2px rgba(255, 255, 255, 0.7);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                }
                .metric-label {
                    color: #6B7280;
                }
                .metric-val {
                    color: #1A1D20;
                }

                /* ── Product Specifications Card ── */
                .specs-card {
                    background-color: #E8E3DA;
                    box-shadow: 
                        12px 12px 24px rgba(160, 155, 145, 0.45),
                        -10px -10px 20px rgba(255, 255, 255, 0.95),
                        inset 1px 1px 2px rgba(255, 255, 255, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.6);
                }
                .specs-heading {
                    color: #1A1D20;
                }
                .table-header-row {
                    background-color: #EDE8DF;
                    color: #1A1D20;
                }
                .table-row-hover:hover {
                    background-color: rgba(255, 255, 255, 0.4);
                }

                /* ── Action Buttons ── */
                .action-btn-primary {
                    background-color: #151D2A;
                    color: #FFFFFF;
                    box-shadow: 
                        6px 6px 14px rgba(160, 155, 145, 0.5),
                        -4px -4px 10px rgba(255, 255, 255, 0.85);
                }
                .action-btn-primary:hover {
                    background-color: #0E141E;
                }
                .action-btn-secondary {
                    background-color: #EDE8DF;
                    color: #1A1D20;
                    box-shadow: 
                        6px 6px 14px rgba(160, 155, 145, 0.4),
                        -5px -5px 12px rgba(255, 255, 255, 0.9),
                        inset 1px 1px 2px rgba(255, 255, 255, 0.7);
                    border: 1px solid rgba(255, 255, 255, 0.6);
                }
                .action-btn-secondary:hover {
                    background-color: #E4DFD5;
                }

                /* ── Related Product Cards ── */
                .related-card {
                    background-color: #E8E3DA;
                    box-shadow: 
                        12px 12px 24px rgba(160, 155, 145, 0.4),
                        -10px -10px 20px rgba(255, 255, 255, 0.95),
                        inset 1px 1px 2px rgba(255, 255, 255, 0.5);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                }
                .related-img-frame {
                    background-color: #EDE8DF;
                    box-shadow: 
                        inset 3px 3px 6px rgba(150, 145, 135, 0.4),
                        inset -3px -3px 6px rgba(255, 255, 255, 0.85);
                }
                .related-title {
                    color: #1A1D20;
                }
                .mini-badge {
                    background-color: #EDE8DF;
                    color: #4B5563;
                    border: 1px solid rgba(255, 255, 255, 0.6);
                }
                .related-btn {
                    background-color: #151D2A;
                    color: #FFFFFF;
                }
                .related-btn:hover {
                    background-color: #0E141E;
                }

                /* ── Recently Viewed Pill Card ── */
                .recent-pill-card {
                    background-color: #E8E3DA;
                    box-shadow: 
                        8px 8px 18px rgba(160, 155, 145, 0.4),
                        -6px -6px 14px rgba(255, 255, 255, 0.9);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                }
                .recent-thumb-box {
                    background-color: #EDE8DF;
                    box-shadow: inset 1px 1px 3px rgba(150, 145, 135, 0.35);
                }
                .recent-title {
                    color: #1A1D20;
                }
                .recent-btn {
                    background-color: #151D2A;
                    color: #FFFFFF;
                }

                /* ── Modal ── */
                .modal-glass-card {
                    background-color: #EDE8DF;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.6);
                }
                .modal-heading {
                    color: #1A1D20;
                }
                .modal-subtext {
                    color: #4B5563;
                }
                .modal-input {
                    background-color: #E4DFD5;
                    color: #1A1D20;
                    border: 1px solid rgba(160, 155, 145, 0.4);
                }

                /* ═══════════════════════ DARK MODE STYLES ═══════════════════════ */
                .dark .product-3d-canvas {
                    background-color: #060913;
                }

                /* Dark Product Stage with Cyan Outline & Glow */
                .dark .prod-stage-bezel {
                    background: rgba(10, 22, 42, 0.88);
                    border: 1.5px solid rgba(56, 189, 248, 0.48);
                    box-shadow: 
                        0 0 35px rgba(6, 182, 212, 0.25),
                        inset 0 0 18px rgba(6, 182, 212, 0.12),
                        0 20px 40px rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(16px);
                }

                /* ── 3D Extruded Thumbnails (Dark Mode) ── */
                .dark .thumb-stage-card {
                    background: rgba(10, 22, 42, 0.85);
                }
                .dark .inactive-thumb-stage {
                    border: 1.5px solid rgba(56, 189, 248, 0.25);
                    box-shadow: 
                        0 4px 12px rgba(0, 0, 0, 0.5),
                        inset 0 1px 2px rgba(255, 255, 255, 0.05);
                    opacity: 0.75;
                }
                .dark .inactive-thumb-stage:hover {
                    opacity: 1;
                    border-color: rgba(56, 189, 248, 0.65);
                    box-shadow: 
                        0 0 18px rgba(6, 182, 212, 0.3),
                        0 8px 20px rgba(0, 0, 0, 0.6);
                    transform: translateY(-2px) scale(1.03);
                }
                .dark .active-thumb-stage {
                    border: 2px solid #38BDF8;
                    box-shadow: 
                        0 0 0 3px rgba(56, 189, 248, 0.3),
                        0 0 25px rgba(6, 182, 212, 0.45),
                        0 8px 20px rgba(0, 0, 0, 0.7);
                    transform: scale(1.05);
                    background: rgba(14, 30, 56, 0.95);
                }

                /* Dark Titles with Radiant Cyan Neon Glow */
                .dark .prod-title {
                    color: #38BDF8;
                    text-shadow: 0 0 16px rgba(56, 189, 248, 0.75), 0 0 32px rgba(6, 182, 212, 0.5);
                }
                .dark .prod-subtext {
                    color: #94A3B8;
                }
                .dark .section-heading {
                    color: #FFFFFF;
                    text-shadow: 0 0 14px rgba(56, 189, 248, 0.5);
                }
                .dark .section-text {
                    color: #94A3B8;
                }

                /* Dark Pricing Plaque */
                .dark .pricing-plaque {
                    background: rgba(8, 26, 48, 0.8);
                    border: 1.5px solid rgba(56, 189, 248, 0.55);
                    box-shadow: 
                        0 0 22px rgba(6, 182, 212, 0.22),
                        inset 0 0 14px rgba(6, 182, 212, 0.1);
                }
                .dark .pricing-heading {
                    color: #38BDF8;
                    text-shadow: 0 0 8px rgba(56, 189, 248, 0.6);
                }
                .dark .pricing-subtext {
                    color: #94A3B8;
                }

                /* Dark Metric Pills */
                .dark .metric-pill {
                    background: rgba(10, 24, 45, 0.85);
                    border: 1.2px solid rgba(56, 189, 248, 0.4);
                    box-shadow: 
                        0 0 15px rgba(6, 182, 212, 0.16),
                        inset 0 0 8px rgba(6, 182, 212, 0.08);
                }
                .dark .metric-label {
                    color: #64748B;
                }
                .dark .metric-val {
                    color: #E0F2FE;
                }

                /* Dark Specs Card */
                .dark .specs-card {
                    background: rgba(8, 20, 36, 0.85);
                    border: 1.5px solid rgba(56, 189, 248, 0.45);
                    box-shadow: 
                        0 0 28px rgba(6, 182, 212, 0.18),
                        inset 0 0 16px rgba(6, 182, 212, 0.08),
                        0 15px 35px rgba(0, 0, 0, 0.65);
                    backdrop-filter: blur(16px);
                }
                .dark .specs-heading {
                    color: #FFFFFF;
                }
                .dark .table-header-row {
                    background: rgba(14, 30, 54, 0.85);
                    color: #38BDF8;
                }
                .dark .table-row-hover:hover {
                    background: rgba(56, 189, 248, 0.06);
                }

                /* Dark Action Buttons: Radiant Intense Glow for Request Quotation */
                .dark .action-btn-primary {
                    background: linear-gradient(135deg, #0284C7 0%, #38BDF8 100%);
                    color: #FFFFFF;
                    border: 1.5px solid rgba(103, 232, 249, 0.85);
                    box-shadow: 
                        0 0 25px rgba(14, 165, 233, 0.75),
                        0 0 50px rgba(56, 189, 248, 0.4),
                        inset 0 0 12px rgba(255, 255, 255, 0.4);
                }
                .dark .action-btn-primary:hover {
                    background: linear-gradient(135deg, #0369A1 0%, #0284C7 100%);
                    box-shadow: 
                        0 0 35px rgba(14, 165, 233, 0.9),
                        0 0 65px rgba(56, 189, 248, 0.6);
                }
                .dark .action-btn-secondary {
                    background: rgba(10, 24, 45, 0.85);
                    border: 1.5px solid rgba(56, 189, 248, 0.5);
                    color: #FFFFFF;
                    box-shadow: 0 0 18px rgba(6, 182, 212, 0.2);
                }
                .dark .action-btn-secondary:hover {
                    background: rgba(14, 32, 60, 0.95);
                    border-color: rgba(56, 189, 248, 0.8);
                }

                /* Dark Related Product Cards: Ambient Backlight Cyan Glow */
                .dark .related-card {
                    background: rgba(8, 20, 36, 0.85);
                    border: 1.5px solid rgba(56, 189, 248, 0.45);
                    box-shadow: 
                        0 0 32px rgba(6, 182, 212, 0.25),
                        0 15px 35px rgba(0, 0, 0, 0.65);
                    backdrop-filter: blur(16px);
                }
                .dark .related-img-frame {
                    background: rgba(5, 14, 28, 0.9);
                    box-shadow: inset 0 0 16px rgba(6, 182, 212, 0.25);
                }
                .dark .related-title {
                    color: #E0F2FE;
                }
                .dark .mini-badge {
                    background: rgba(10, 24, 45, 0.85);
                    border-color: rgba(56, 189, 248, 0.35);
                    color: #94A3B8;
                }
                .dark .related-btn {
                    background: linear-gradient(135deg, #0284C7 0%, #38BDF8 100%);
                    color: #FFFFFF;
                    box-shadow: 0 0 18px rgba(14, 165, 233, 0.45);
                }

                /* Dark Recently Viewed */
                .dark .recent-pill-card {
                    background: rgba(8, 20, 36, 0.85);
                    border: 1.5px solid rgba(56, 189, 248, 0.45);
                    box-shadow: 0 0 22px rgba(6, 182, 212, 0.18);
                }
                .dark .recent-thumb-box {
                    background: rgba(5, 14, 28, 0.9);
                }
                .dark .recent-title {
                    color: #E0F2FE;
                }
                .dark .recent-btn {
                    background: linear-gradient(135deg, #0284C7 0%, #38BDF8 100%);
                    color: #FFFFFF;
                }

                /* Dark Modal */
                .dark .modal-glass-card {
                    background: rgba(10, 22, 40, 0.95);
                    border: 1.5px solid rgba(56, 189, 248, 0.5);
                    box-shadow: 0 0 35px rgba(6, 182, 212, 0.35);
                }
                .dark .modal-heading {
                    color: #38BDF8;
                }
                .dark .modal-subtext {
                    color: #94A3B8;
                }
                .dark .modal-input {
                    background: rgba(12, 24, 45, 0.9);
                    border-color: rgba(56, 189, 248, 0.35);
                    color: #FFFFFF;
                }

                /* ── Floating Animations ── */
                @keyframes floatSlow {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-7px); }
                }
                @keyframes floatReverse {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(6px); }
                }
                .floating-slow {
                    animation: floatSlow 5s ease-in-out infinite;
                }
                .floating-reverse {
                    animation: floatReverse 6s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
