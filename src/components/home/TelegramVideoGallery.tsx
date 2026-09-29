'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, X, Clock, Film } from 'lucide-react';

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
    const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const fetchVideos = async () => {
        try {
            const res = await fetch('/api/videos');
            const json = await res.json();
            if (json.success && Array.isArray(json.videos)) {
                setVideos(json.videos);
            }
        } catch (err) {
            console.error('Failed to fetch videos:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVideos();
    }, []);

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

    if (!loading && videos.length === 0) {
        return null;
    }

    return (
        <section 
            id="sample-video-gallery"
            aria-label="Video Gallery"
            className="relative py-8 sm:py-12 bg-[#F6F2EC] dark:bg-[#080D1A] transition-colors duration-500 overflow-hidden"
        >
            {/* Ambient subtle glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                {/* ── PURE VIDEO GALLERY GRID (NO HEADINGS, NO POST #, NO HASHTAGS, NO VIEWS COUNT, NO WATCH VIDEO TEXT) ── */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                            <div 
                                key={n} 
                                className="w-full aspect-video rounded-2xl bg-slate-200/80 dark:bg-slate-800/60 animate-pulse border border-slate-300/40 dark:border-white/5" 
                            />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {videos.map((video, idx) => (
                            <div
                                key={`${video.id || video.messageId}-${idx}`}
                                onClick={() => setActiveVideo(video)}
                                className="group relative w-full aspect-video rounded-2xl overflow-hidden cursor-pointer
                                bg-slate-900 border border-slate-200/80 dark:border-white/10
                                shadow-sm hover:shadow-xl dark:hover:shadow-[0_15px_35px_rgba(6,182,212,0.2)]
                                transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/50"
                            >
                                {/* Thumbnail */}
                                {video.thumbnailUrl ? (
                                    <img 
                                        src={video.thumbnailUrl} 
                                        alt={video.title || 'Video preview'} 
                                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100" 
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950">
                                        <Film size={36} className="text-cyan-400/60" />
                                    </div>
                                )}

                                {/* Subtle Dark Vignette on hover */}
                                <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors duration-300" />

                                {/* Modern Centered Play Button */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-cyan-500/90 text-white flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.6)] group-hover:bg-cyan-400 group-hover:scale-110 transition-all duration-300">
                                        <Play size={20} className="fill-white translate-x-0.5" />
                                    </div>
                                </div>

                                {/* Minimal Duration Badge (Optional subtle duration in corner) */}
                                {video.formattedDuration && (
                                    <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-black/75 text-white/90 backdrop-blur-xs flex items-center gap-1">
                                        <Clock size={10} className="text-cyan-400" />
                                        {video.formattedDuration}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── MODAL HTML5 VIDEO PLAYER LIGHTBOX (PURE PLAYER, NO HEADERS/CAPTIONS) ── */}
            {activeVideo && (
                <div 
                    role="dialog"
                    aria-modal="true"
                    className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn"
                    onClick={() => setActiveVideo(null)}
                >
                    <div 
                        className="relative w-full max-w-4xl bg-black rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/15"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button 
                            onClick={() => setActiveVideo(null)}
                            aria-label="Close video player"
                            className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/70 hover:bg-black text-white/80 hover:text-white transition-colors border border-white/20"
                        >
                            <X size={20} />
                        </button>

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
                    </div>
                </div>
            )}
        </section>
    );
}
