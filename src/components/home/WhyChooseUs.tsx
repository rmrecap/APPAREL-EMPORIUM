'use client';

import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { ArrowRight } from 'lucide-react';

interface FeatureCard {
    id: string;
    icon: string;
    title: string;
    description: string;
}

interface WhyChooseUsProps {
    data: any;
    headings?: {
        why_choose_us_eyebrow?: string;
        why_choose_us_heading?: string;
        why_choose_us_subheading?: string;
    };
    showIcons?: boolean;
}

export default function WhyChooseUs({ data, headings, showIcons = false }: WhyChooseUsProps) {
    const [features, setFeatures] = useState<FeatureCard[]>(() => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        try {
            return JSON.parse(data);
        } catch {
            return [];
        }
    });

    useEffect(() => {
        if (data && typeof data === 'string') {
            try {
                setFeatures(JSON.parse(data));
            } catch (e) {
                console.error("WhyChooseUs data parse error");
            }
        } else if (Array.isArray(data)) {
            setFeatures(data);
        }
    }, [data]);

    if (!features || features.length === 0) return null;

    return (
        <section className="py-24 bg-[#DDD8CF] dark:bg-[#080D1A] border-y border-slate-300/40 dark:border-white/5 transition-colors duration-500 relative overflow-hidden">

            {/* Decorative Blobs */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl mix-blend-multiply pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl mix-blend-multiply pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">

                <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <span className="text-cyan-700 dark:text-cyan-400 font-extrabold tracking-widest uppercase text-xs md:text-sm mb-3 block">
                        {headings?.why_choose_us_eyebrow || 'Corporate Advantage'}
                    </span>
                    <h2 className="text-3xl md:text-5xl font-black text-[#1A1D20] dark:text-white font-heading">
                        {headings?.why_choose_us_heading || 'Why Partner With Us'}
                    </h2>
                    <p className="mt-4 text-[#4B5563] dark:text-slate-300 max-w-2xl mx-auto text-base sm:text-lg font-medium">
                        {headings?.why_choose_us_subheading || 'Leading global sourcing and manufacturing excellence with a commitment to quality, sustainability, and transparency.'}
                    </p>
                    <div className="w-24 h-1 bg-gradient-to-r from-cyan-600 to-blue-600 mx-auto mt-8 rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {features.map((feature, idx) => {
                        const IconComponent = (Icons as any)[feature.icon] || Icons.CheckCircle;

                        return (
                            <div
                                key={feature.id || idx}
                                className="group bg-[#EDE9E1] dark:bg-[#0C1628] p-8 rounded-[28px] shadow-[10px_10px_22px_rgba(160,155,145,0.4),-8px_-8px_18px_rgba(255,255,255,0.9)] dark:shadow-[0_15px_30px_rgba(0,0,0,0.6)] border border-white/70 dark:border-white/10 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                {/* Hover Gradient border */}
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                <div className="relative z-10">
                                    {showIcons && (
                                        <div className="w-16 h-16 rounded-2xl bg-[#E2DDD4] dark:bg-[#121E36] text-cyan-700 dark:text-cyan-400 flex items-center justify-center mb-6 border border-white/60 dark:border-white/10 shadow-[inset_1px_1px_3px_rgba(160,155,145,0.4)] group-hover:bg-cyan-600 group-hover:text-white transition-all duration-500 transform group-hover:rotate-12 group-hover:scale-110">
                                            <IconComponent size={32} strokeWidth={1.5} />
                                        </div>
                                    )}

                                    <h3 className="text-xl md:text-2xl font-bold text-[#1A1D20] dark:text-white mb-4 font-heading group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                        {feature.title}
                                    </h3>

                                    <p className="text-[#4B5563] dark:text-slate-300 leading-relaxed text-[15px] font-medium">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
}

