'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
    Play, 
    Pause, 
    Volume2, 
    VolumeX, 
    Maximize, 
    X, 
    RefreshCw, 
    Send, 
    Sparkles, 
    Film, 
    Eye, 
    Clock, 
    ExternalLink,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    PlayCircle
} from 'lucide-react';
import { 
    GarmentButton3D, 
    NeedleWithThread3D, 
    Hanger3D, 
    ThreadSpool3D, 
    Scissors3D 
} from './Garment3DElements';

interface VideoItem {
    id: string;
    messageId: number;
    title: string;
    caption: string;
    duration: number;
    formattedDuration: string;
    streamUrl: string;
    thumbnailUrl: string | null;
    width: number;
    height: number;
    viewsCount: number;
    publishedAt: string;
    channelLink: string;
}

interface TelegramVideoGalleryProps {
    headings?: Record<string, string>;
    data?: any;
}

export default function TelegramVideoGallery({ headings, data }: TelegramVideoGalleryProps) {
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const animationFrameRef = useRef<number | null>(null);

    const sectionHeading = headings?.telegram_gallery_heading || 'Sample & Production Video Gallery';
    const sectionSubheading = headings?.telegram_gallery_subheading || 'Continuous live broadcast of our apparel sampling, precision laser cutting, circular knitting, and sewing lines directly from our official Telegram channel.';
    const channelHandle = '@Apparel_Emporium_bd_bot';

    const fetchVideos = async (sync = false) => {
        if (sync) setIsSyncing(true);
        try {
            const res = await fetch(`/api/videos${sync ? '?sync=true' : ''}`);
            const json = await res.json();
            if (json.success && Array.isArray(json.videos)) {
                setVideos(json.videos);
                if (sync) {
                    setSyncSuccessMessage('Telegram channel feed synced successfully!');
                    setTimeout(() => setSyncSuccessMessage(null), 4000);
                }
            }
        } catch (err) {
            console.error('Failed to fetch videos:', err);
        } finally {
            setLoading(false);
            if (sync) setIsSyncing(false);
        }
    };

    useEffect(() => {
        fetchVideos();
    }, []);

    // ── Continuous Smooth Auto-Scrolling from Right to Left ──
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container || loading || videos.length === 0) return;

        let scrollSpeed = 0.8; // px per frame
        let isUserInteracting = false;

        const handleScroll = () => {
            if (isHovered || isUserInteracting) return;

            // When scrolled half-way through duplicated items, reset smoothly to top
            if (container.scrollLeft >= container.scrollWidth / 2) {
                container.scrollLeft = 0;
            } else {
                container.scrollLeft += scrollSpeed;
            }

            animationFrameRef.current = requestAnimationFrame(handleScroll);
        };

        animationFrameRef.current = requestAnimationFrame(handleScroll);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isHovered, loading, videos]);

    // Manual navigation buttons
    const scrollByAmount = (amount: number) => {
        if (!scrollContainerRef.current) return;
        scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    };

    // Close modal on Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setActiveVideo(null);
        };
        if (activeVideo) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [activeVideo]);

    // Duplicate video list for seamless continuous infinite marquee scrolling
    const displayList = videos.length > 0 ? [...videos, ...videos, ...videos] : [];

    return (
        <section 
            id="sample-video-gallery"
            aria-labelledby="sample-gallery-heading"
            className="relative py-20 sm:py-28 bg-[#F6F2EC] dark:bg-[#080D1A] transition-colors duration-500 overflow-hidden border-t border-slate-300/40 dark:border-white/5"
        >
            {/* Ambient luxury radial glow */}
            <div className="absolute top-1/3 left-1/3 w-[600px] h-[600px] bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Subtle luxury grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000006_1px,transparent_1px),linear-gradient(to_bottom,#00000006_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

            {/* ── FLOATING 3D APPAREL ICONS ── */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden z-0 hidden lg:block">
                {/* Needle & Thread (Top Left) */}
                <div className="absolute top-12 left-[5%] animate-[bounce_8s_infinite_ease-in-out]">
                    <NeedleWithThread3D size={84} rotation={-35} />
                </div>

                {/* Garment Button (Top Right) */}
                <div className="absolute top-16 right-[6%] animate-[bounce_7.5s_infinite_ease-in-out_1s]">
                    <GarmentButton3D size={54} rotation={25} />
                </div>

                {/* Scissors (Bottom Left) */}
                <div className="absolute bottom-14 left-[6%] animate-[bounce_9.5s_infinite_ease-in-out_0.5s]">
                    <Scissors3D size={74} rotation={-20} />
                </div>

                {/* Thread Spool (Bottom Right) */}
                <div className="absolute bottom-12 right-[7%] animate-[bounce_8.5s_infinite_ease-in-out_1.5s]">
                    <ThreadSpool3D size={56} rotation={15} threadColor="#06B6D4" />
                </div>

                {/* Hanger (Center Left) */}
                <div className="absolute top-[48%] left-[2%] animate-[bounce_10s_infinite_ease-in-out_2s]">
                    <Hanger3D size={68} rotation={12} />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">

                {/* Header Title, Eyebrow & Controls */}
                <div className="flex flex-col items-center text-center mb-10 sm:mb-14">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 mb-3 shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                        <Sparkles size={12} className="text-cyan-500" />
                        Live Channel Video Stream
                    </div>

                    <h2 
                        id="sample-gallery-heading"
                        className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight font-heading max-w-3xl"
                    >
                        {sectionHeading}
                    </h2>

                    <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl font-medium leading-relaxed">
                        {sectionSubheading}
                    </p>

                    {/* Action Bar: Telegram Link + Live Sync + Manual Nav Arrows */}
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                        <a 
                            href={`https://t.me/${channelHandle.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-[#0088cc] hover:bg-[#0077b5] transition-all shadow-md active:scale-95"
                        >
                            <Send size={15} className="-rotate-12" />
                            <span>Join Channel {channelHandle}</span>
                            <ExternalLink size={13} className="opacity-70" />
                        </a>

                        <button
                            onClick={() => fetchVideos(true)}
                            disabled={isSyncing}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-200 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 border border-slate-300/70 dark:border-white/10 transition-all shadow-xs active:scale-95 disabled:opacity-50"
                        >
                            <RefreshCw size={14} className={isSyncing ? 'animate-spin text-cyan-500' : 'text-slate-500'} />
                            <span>{isSyncing ? 'Syncing...' : 'Sync Live Feed'}</span>
                        </button>

                        <div className="hidden sm:flex items-center gap-1.5 ml-2 border border-slate-300/70 dark:border-white/10 p-1 rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xs">
                            <button 
                                onClick={() => scrollByAmount(-380)}
                                aria-label="Scroll videos left"
                                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button 
                                onClick={() => scrollByAmount(380)}
                                aria-label="Scroll videos right"
                                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>

                    {syncSuccessMessage && (
                        <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-fadeIn">
                            <CheckCircle2 size={14} />
                            {syncSuccessMessage}
                        </div>
                    )}
                </div>

            </div>

            {/* ── CONTINUOUS AUTO-SCROLLING HORIZONTAL REEL (Right to Left) ── */}
            <div 
                className="w-full relative"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Left/Right Edge Gradient Fades */}
                <div className="absolute top-0 bottom-0 left-0 w-12 sm:w-24 bg-gradient-to-r from-[#F6F2EC] dark:from-[#080D1A] to-transparent z-20 pointer-events-none" />
                <div className="absolute top-0 bottom-0 right-0 w-12 sm:w-24 bg-gradient-to-l from-[#F6F2EC] dark:from-[#080D1A] to-transparent z-20 pointer-events-none" />

                {loading ? (
                    <div className="flex gap-6 overflow-hidden px-6 py-4">
                        {[1, 2, 3, 4, 5].map((n) => (
                            <div key={n} className="w-[320px] sm:w-[380px] h-[340px] shrink-0 rounded-3xl bg-slate-200 dark:bg-slate-800/60 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div 
                        ref={scrollContainerRef}
                        className="flex gap-6 sm:gap-8 overflow-x-auto no-scrollbar py-6 px-4 sm:px-8 cursor-grab active:cursor-grabbing select-none"
                        style={{ scrollBehavior: 'auto' }}
                    >
                        {displayList.map((video, idx) => (
                            <div
                                key={`${video.id || video.messageId}-${idx}`}
                                onClick={() => setActiveVideo(video)}
                                className="group relative w-[300px] sm:w-[370px] shrink-0 flex flex-col rounded-3xl overflow-hidden cursor-pointer transition-all duration-400
                                bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md
                                border border-[#EBE4D8] dark:border-white/10
                                shadow-md hover:shadow-[0_25px_50px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_25px_50px_rgba(6,182,212,0.25)]
                                hover:-translate-y-2 hover:border-cyan-500/50 dark:hover:border-cyan-400/50"
                            >
                                {/* Video Thumbnail / Aspect 16:9 Canvas */}
                                <div className="relative w-full aspect-video bg-black overflow-hidden flex items-center justify-center">
                                    {video.thumbnailUrl ? (
                                        <img 
                                            src={video.thumbnailUrl} 
                                            alt={video.title} 
                                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108 opacity-90 group-hover:opacity-100" 
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950">
                                            <Film size={44} className="text-cyan-400/60" />
                                        </div>
                                    )}

                                    {/* Video Duration Badge */}
                                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-black/80 text-white backdrop-blur-md flex items-center gap-1.5 shadow-sm">
                                        <Clock size={11} className="text-amber-400" />
                                        {video.formattedDuration}
                                    </div>

                                    {/* Telegram Post Badge */}
                                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-black/75 text-cyan-400 backdrop-blur-md flex items-center gap-1 shadow-sm">
                                        <Send size={11} />
                                        Post #{video.messageId}
                                    </div>

                                    {/* Center 3D Play Button Glow */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/10 transition-colors">
                                        <div className="w-14 h-14 rounded-full bg-cyan-500 text-white flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.7)] transform group-hover:scale-115 transition-transform duration-300">
                                            <Play size={24} className="fill-white translate-x-0.5" />
                                        </div>
                                    </div>
                                </div>

                                {/* Content Details */}
                                <div className="p-5 flex-1 flex flex-col justify-between">
                                    <div>
                                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-600 dark:text-cyan-400 block mb-1">
                                            Production Sample #{video.messageId}
                                        </span>
                                        <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white line-clamp-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                            {video.title}
                                        </h3>
                                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">
                                            {video.caption || 'Live export garments inspection and quality audit video streaming from Apparel Emporium.'}
                                        </p>
                                    </div>

                                    <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-400">
                                        <span className="flex items-center gap-1.5 font-semibold">
                                            <Eye size={13} className="text-slate-400" />
                                            {video.viewsCount} views
                                        </span>
                                        <span className="font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                            Watch Video &rarr;
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── MODAL HTML5 VIDEO PLAYER LIGHTBOX ── */}
            {activeVideo && (
                <div 
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="video-modal-title"
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
                    onClick={() => setActiveVideo(null)}
                >
                    <div 
                        className="relative w-full max-w-4xl bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-white/15"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/90">
                            <div className="flex items-center gap-2.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                                <h3 id="video-modal-title" className="text-sm sm:text-base font-bold text-white line-clamp-1">
                                    {activeVideo.title}
                                </h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <a 
                                    href={activeVideo.channelLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                    title="Open in Telegram"
                                >
                                    <Send size={18} />
                                </a>
                                <button 
                                    onClick={() => setActiveVideo(null)}
                                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Pure HTML5 Video Player */}
                        <div className="relative bg-black aspect-video flex items-center justify-center">
                            <video 
                                ref={videoRef}
                                src={activeVideo.streamUrl}
                                poster={activeVideo.thumbnailUrl || undefined}
                                autoPlay
                                playsInline
                                controls
                                className="w-full h-full object-contain"
                            >
                                Your browser does not support HTML5 video streaming.
                            </video>
                        </div>

                        {/* Video Details & Caption Footer */}
                        <div className="p-6 bg-slate-900/95 border-t border-white/10 text-white">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                                        Telegram Broadcast Post #{activeVideo.messageId}
                                    </span>
                                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                                        {activeVideo.caption || 'Live factory inspection video streamed directly from Apparel Emporium production facilities.'}
                                    </p>
                                </div>
                                <div className="shrink-0 flex items-center gap-3">
                                    <a 
                                        href={`https://t.me/${channelHandle.replace('@', '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 transition-colors inline-flex items-center gap-2 shadow-md active:scale-95"
                                    >
                                        <Send size={14} />
                                        <span>View on Telegram</span>
                                    </a>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </section>
    );
}
