'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Package, Truck, CheckCircle2, Clock, Globe, ChevronRight, Loader2 } from 'lucide-react';

interface DeliveryUpdate {
    id: string;
    title: string;
    description: string;
    category: string;
    buyer: string;
    buyerCountry: string;
    quantity: string;
    status: 'SHIPPED' | 'DELIVERED' | 'IN_PRODUCTION' | 'COMPLETED';
    imageUrl?: string;
    createdAt: string;
}

const statusConfig: Record<DeliveryUpdate['status'], { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    IN_PRODUCTION: {
        label: 'In Production',
        color: 'text-amber-400',
        bg: 'bg-amber-400/10 border-amber-400/30',
        icon: <Clock size={12} className="text-amber-400" />,
    },
    SHIPPED: {
        label: 'Shipped',
        color: 'text-blue-400',
        bg: 'bg-blue-400/10 border-blue-400/30',
        icon: <Truck size={12} className="text-blue-400" />,
    },
    DELIVERED: {
        label: 'Delivered',
        color: 'text-green-400',
        bg: 'bg-green-400/10 border-green-400/30',
        icon: <CheckCircle2 size={12} className="text-green-400" />,
    },
    COMPLETED: {
        label: 'Completed',
        color: 'text-primary',
        bg: 'bg-primary/10 border-primary/30',
        icon: <CheckCircle2 size={12} className="text-primary" />,
    },
};

function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function FeedCard({ item }: { item: DeliveryUpdate }) {
    const status = statusConfig[item.status] || statusConfig.COMPLETED;
    return (
        <div className="flex-none w-[320px] sm:w-[360px] bg-white/5 border border-white/10 hover:border-primary/40 rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300 hover:bg-white/10 group cursor-default backdrop-blur-sm">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <Package size={14} className="text-primary flex-shrink-0" />
                        <span className="text-[11px] font-bold text-primary uppercase tracking-widest truncate">
                            {item.category}
                        </span>
                    </div>
                    <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-primary/90 transition-colors">
                        {item.title}
                    </h3>
                </div>
                <span className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${status.bg} ${status.color}`}>
                    {status.icon}
                    {status.label}
                </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                {item.description}
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-slate-400">
                        <Globe size={11} />
                        <span className="text-[11px] font-medium">{item.buyerCountry}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                        <Package size={11} />
                        <span className="text-[11px] font-medium">{item.quantity}</span>
                    </div>
                </div>
                <span className="text-[10px] text-slate-600 font-medium">
                    {timeAgo(item.createdAt)}
                </span>
            </div>
        </div>
    );
}

export default function DeliveryFeed() {
    const [items, setItems] = useState<DeliveryUpdate[]>([]);
    const [loading, setLoading] = useState(true);
    const trackRef = useRef<HTMLDivElement>(null);
    const animRef = useRef<number | null>(null);
    const pausedRef = useRef(false);
    const posRef = useRef(0);

    useEffect(() => {
        fetch('/api/delivery-feed')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setItems(data);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (items.length === 0) return;
        const track = trackRef.current;
        if (!track) return;
        const speed = 0.5;
        const animate = () => {
            if (!pausedRef.current && track) {
                posRef.current -= speed;
                const halfWidth = track.scrollWidth / 2;
                if (Math.abs(posRef.current) >= halfWidth) {
                    posRef.current = 0;
                }
                track.style.transform = `translateX(${posRef.current}px)`;
            }
            animRef.current = requestAnimationFrame(animate);
        };
        animRef.current = requestAnimationFrame(animate);
        return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
    }, [items]);

    if (loading) {
        return (
            <section className="py-16 bg-slate-950 border-y border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                </div>
            </section>
        );
    }

    if (items.length === 0) return null;

    const doubled = [...items, ...items];

    return (
        <section className="py-14 bg-slate-950 border-y border-white/5 overflow-hidden relative" id="live-feed">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                            </span>
                            <span className="text-green-400 font-bold text-xs uppercase tracking-widest">Live Updates</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-white font-heading">
                            Recent Deliveries &amp; Production
                        </h2>
                        <p className="text-slate-500 text-xs mt-1 max-w-lg">
                            Real-time updates on active orders, recent shipments and completed deliveries to our global buyers.
                        </p>
                    </div>
                    <a
                        href="/contact"
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/30 rounded-xl text-xs font-bold transition-all"
                    >
                        Get Your Order Started
                        <ChevronRight size={14} />
                    </a>
                </div>
            </div>

            <div
                className="relative"
                onMouseEnter={() => { pausedRef.current = true; }}
                onMouseLeave={() => { pausedRef.current = false; }}
            >
                <div className="flex" ref={trackRef} style={{ willChange: 'transform' }}>
                    {doubled.map((item, idx) => (
                        <div key={`${item.id}-${idx}`} className="px-3">
                            <FeedCard item={item} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
