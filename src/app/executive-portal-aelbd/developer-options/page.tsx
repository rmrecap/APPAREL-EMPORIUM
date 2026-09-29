'use client';

import React, { useState, useEffect } from 'react';
import {
    Sliders,
    Power,
    CheckCircle2,
    AlertCircle,
    HelpCircle,
    Mail,
    Package,
    Sparkles,
    Shield,
    Save,
    RotateCcw,
    Check,
    Eye,
    EyeOff
} from 'lucide-react';

interface SettingToggle {
    key: string;
    label: string;
    description: string;
    category: 'support' | 'contact' | 'homepage_sections' | 'homepage_icons' | 'product_display';
    isHomepageVisibility?: boolean;
    defaultValue: boolean;
}

const TOGGLES: SettingToggle[] = [
    // ── Product Catalog Cards & Display (Clean E-Commerce Style) ──
    {
        key: 'product_card_show_sku',
        label: 'Product Card SKU Code (কার্ডে SKU কোড প্রদর্শন)',
        description: 'Displays or hides the SKU code (e.g. SKU : LEATHER, SKU : DENIM, SKU : T-SHIRT) on product catalog cards. Disabled by default for clean look.',
        category: 'product_display',
        defaultValue: false
    },
    {
        key: 'product_card_show_b2b_tag',
        label: 'Product Card B2B & Tech-Pack Badges (B2B Sourcing ও Tech-Pack ব্যাজ)',
        description: 'Displays or hides the "B2B Sourcing & Ex" and "Custom Tech-Pack" pill badges on catalog cards. Disabled by default for clean look.',
        category: 'product_display',
        defaultValue: false
    },
    {
        key: 'product_card_show_description',
        label: 'Product Card Description Snippet (কার্ডে টেকনিক্যাল বিবরণ টেক্সট)',
        description: 'Displays or hides the 2-line description snippet on catalog product cards. Disabled for minimalist e-commerce look.',
        category: 'product_display',
        defaultValue: false
    },
    {
        key: 'product_card_show_min_order',
        label: 'Product Card Min. Order & Fabric Boxes (মিনিমাম অর্ডার ও ফেব্রিক স্পেক বক্স)',
        description: 'Displays or hides the "Min. Order: 300 pcs" and "Fabric" boxes on catalog cards. Disabled for universal buyer flexibility.',
        category: 'product_display',
        defaultValue: false
    },
    // ── 3D Product Detail Page Display ──
    {
        key: 'product_detail_show_b2b_banner',
        label: '3D Detail Page: Custom Sourcing Plaque (কাস্টম ম্যানুফ্যাকচারিং প্ল্যাক)',
        description: 'Displays or hides the "CUSTOM MANUFACTURING & OEM SOURCING" plaque on the 3D product detail page.',
        category: 'product_display',
        defaultValue: true
    },
    {
        key: 'product_detail_show_metrics',
        label: '3D Detail Page: 3 Key Metric Pills (৩টি মেট্রিক পিল)',
        description: 'Displays or hides the Batch Size, Timeline, and Quality Tier metric pills on the 3D product detail page.',
        category: 'product_display',
        defaultValue: true
    },
    {
        key: 'product_detail_show_specs',
        label: '3D Detail Page: Specifications Table (প্রোডাক্ট স্পেসিফিকেশন টেবিল)',
        description: 'Displays or hides the Product Specifications table (Order Volume, Fabric, Weight GSM, Dyeing, Fit).',
        category: 'product_display',
        defaultValue: true
    },
    {
        key: 'product_detail_show_globe',
        label: '3D Detail Page: 3D Holographic Globe (৩ডি রোটেটিং গ্লোব)',
        description: 'Displays or hides the 100% coded interactive 3D rotating network globe under the product stage.',
        category: 'product_display',
        defaultValue: true
    },
    {
        key: 'product_detail_show_flowchart',
        label: '3D Detail Page: 3D Manufacturing Flowchart (ম্যানুফ্যাকচারিং ৩ডি ফ্লোচার্ট)',
        description: 'Displays or hides the 3D branching process flowchart under Product Overview.',
        category: 'product_display',
        defaultValue: true
    },
    // Support Page
    {
        key: 'support_buyer_faqs_protocols_enabled',
        label: 'Comprehensive Service Protocols & Buyer FAQs',
        description: 'Enables or disables the entire Comprehensive Service Protocols & Buyer FAQs accordion section on the /support page.',
        category: 'support',
        defaultValue: false
    },
    // Contact Page
    {
        key: 'contact_send_sourcing_rfq_enabled',
        label: 'Send Sourcing RFQ (Contact Form)',
        description: 'Controls visibility of the "Send Sourcing RFQ" form on the /contact page. When disabled, contact channels and offices span full width cleanly.',
        category: 'contact',
        defaultValue: false
    },
    {
        key: 'contact_24h_rfq_guarantee_enabled',
        label: '24-Hour RFQ Guarantee',
        description: 'Controls visibility of the 24-Hour RFQ Guarantee card badge on the /contact page.',
        category: 'contact',
        defaultValue: false
    },
    // Homepage Showcases
    {
        key: 'our_products_3d',
        label: 'Our Products 3D Showroom (আওয়ার প্রোডাক্টস ৩ডি শোকেস)',
        description: 'Displays or hides the "Our Products" 3D interactive stage on the homepage.',
        category: 'homepage_sections',
        isHomepageVisibility: true,
        defaultValue: false
    },
    {
        key: 'featured_products',
        label: 'Featured Products Showcase (ফিচার্ড প্রোডাক্টস শোকেস)',
        description: 'Displays or hides the "Featured Products" section grid on the homepage.',
        category: 'homepage_sections',
        isHomepageVisibility: true,
        defaultValue: false
    },
    {
        key: 'telegram_video_gallery',
        label: 'Telegram Video Gallery (টেলিগ্রাম ভিডিও গ্যালারি)',
        description: 'Displays or hides the Telegram video gallery showcase on the homepage.',
        category: 'homepage_sections',
        isHomepageVisibility: true,
        defaultValue: false
    },
    // Homepage Icons & Decorative Elements
    {
        key: 'homepage_floating_icons_enabled',
        label: 'Floating 3D Craft Icons & Elements (হোমপেজ ৩ডি ফ্লোটিং আইকন)',
        description: 'Controls floating 3D decorative craft elements (Scissors, Thread Spool, Measuring Tape, Golden Needles, Sparkles) across homepage sections.',
        category: 'homepage_icons',
        defaultValue: false
    },
    {
        key: 'homepage_section_icons_enabled',
        label: 'Section Feature Icons & Badges (সেকশন ফিচার আইকন ও ব্যাজ)',
        description: 'Controls icons inside stat cards, why choose us features, compliance pillars, and section badges on the homepage.',
        category: 'homepage_icons',
        defaultValue: false
    },
    {
        key: 'homepage_quick_actions_enabled',
        label: 'Floating Quick Actions (কুইক অ্যাকশন বাটন)',
        description: 'Controls floating quick actions and assistance buttons on the homepage.',
        category: 'homepage_icons',
        defaultValue: false
    }
];

export default function DeveloperOptionsPage() {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [visibility, setVisibility] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savedNotice, setSavedNotice] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'product_display' | 'support' | 'contact' | 'homepage_sections' | 'homepage_icons'>('all');

    const fetchAllSettings = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            if (data.settings) {
                setSettings(data.settings);
                if (data.settings.homepage_sections_visibility) {
                    try {
                        setVisibility(JSON.parse(data.settings.homepage_sections_visibility));
                    } catch (e) {
                        setVisibility({});
                    }
                }
            }
        } catch (e) {
            console.error('Failed to fetch settings:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllSettings();
    }, []);

    const isToggleActive = (toggle: SettingToggle): boolean => {
        if (toggle.isHomepageVisibility) {
            if (visibility[toggle.key] !== undefined) {
                return visibility[toggle.key] === true;
            }
            return toggle.defaultValue;
        }

        if (settings[toggle.key] !== undefined) {
            return settings[toggle.key] === 'true';
        }
        return toggle.defaultValue;
    };

    const handleToggle = (toggle: SettingToggle) => {
        const currentVal = isToggleActive(toggle);
        const newVal = !currentVal;

        if (toggle.isHomepageVisibility) {
            setVisibility(prev => ({ ...prev, [toggle.key]: newVal }));
        } else {
            setSettings(prev => ({ ...prev, [toggle.key]: newVal ? 'true' : 'false' }));
        }
    };

    const handleSaveAll = async () => {
        setSaving(true);
        try {
            // Save standard key-value settings
            const settingsPayload: Record<string, string> = {};
            TOGGLES.forEach(t => {
                if (!t.isHomepageVisibility) {
                    const active = isToggleActive(t);
                    settingsPayload[t.key] = active ? 'true' : 'false';
                }
            });

            // Save updated homepage_sections_visibility
            settingsPayload['homepage_sections_visibility'] = JSON.stringify(visibility);

            // POST to API
            await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settingsPayload)
            });

            // Trigger revalidation for homepage and updated pages
            await Promise.allSettled([
                fetch('/api/revalidate?path=/'),
                fetch('/api/revalidate?path=/products'),
                fetch('/api/revalidate?path=/support'),
                fetch('/api/revalidate?path=/contact')
            ]);

            setSavedNotice(true);
            setTimeout(() => setSavedNotice(false), 3000);
        } catch (e) {
            console.error('Save failed:', e);
            alert('Failed to save settings. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDisableAll = () => {
        const newSettings = { ...settings };
        const newVis = { ...visibility };

        TOGGLES.forEach(t => {
            if (t.isHomepageVisibility) {
                newVis[t.key] = false;
            } else {
                newSettings[t.key] = 'false';
            }
        });

        setSettings(newSettings);
        setVisibility(newVis);
    };

    const handleEnableAll = () => {
        const newSettings = { ...settings };
        const newVis = { ...visibility };

        TOGGLES.forEach(t => {
            if (t.isHomepageVisibility) {
                newVis[t.key] = true;
            } else {
                newSettings[t.key] = 'true';
            }
        });

        setSettings(newSettings);
        setVisibility(newVis);
    };

    const filteredToggles = activeTab === 'all'
        ? TOGGLES
        : TOGGLES.filter(t => t.category === activeTab);

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary dark:bg-blue-900/30 dark:text-blue-400">
                            Developer & Admin Switchboard
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
                            LIVE SYSTEM CONTROL
                        </span>
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white font-heading tracking-tight flex items-center gap-2">
                        <Sliders className="text-primary" size={26} />
                        Developer Options & System Toggles
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        সিস্টেমের বিভিন্ন ফিচার, আইকন, ৩ডি ক্রাফট এলিমেন্ট এবং পেজ সেকশন সহজে চালু বা বন্ধ করার কন্ট্রোল প্যানেল।
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchAllSettings}
                        disabled={loading}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-xs flex items-center gap-2 transition"
                    >
                        <RotateCcw size={14} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>

                    <button
                        onClick={handleSaveAll}
                        disabled={saving}
                        className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-primary/20 transition hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {savedNotice ? (
                            <>
                                <Check size={16} className="text-emerald-300" />
                                Changes Applied!
                            </>
                        ) : saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={15} />
                                Save & Apply Controls
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-slate-900 to-primary text-white shadow-md">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg">
                        <Power size={20} className="text-emerald-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm">Quick Bulk Action</h4>
                        <p className="text-xs text-slate-300">একটি ক্লিকে সব ফিচার চালু বা বন্ধ করুন</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleDisableAll}
                        className="px-3.5 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                    >
                        <EyeOff size={14} />
                        Turn All OFF (সব বন্ধ করুন)
                    </button>
                    <button
                        onClick={handleEnableAll}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                    >
                        <Eye size={14} />
                        Turn All ON (সব চালু করুন)
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-800 gap-2 pb-1 overflow-x-auto">
                {[
                    { id: 'all', label: 'All Controls (সকল কন্ট্রোল)', icon: Sliders },
                    { id: 'product_display', label: 'Product Display & Cards (প্রোডাক্ট কার্ড ও ৩ডি ভিউ)', icon: Package },
                    { id: 'support', label: 'Support Page (FAQs & Protocols)', icon: HelpCircle },
                    { id: 'contact', label: 'Contact Page (RFQ & Guarantee)', icon: Mail },
                    { id: 'homepage_sections', label: 'Homepage Showcases (Our Products)', icon: Shield },
                    { id: 'homepage_icons', label: 'Homepage Icons & Decor (আইকন ও ৩ডি এলিমেন্ট)', icon: Sparkles },
                ].map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs whitespace-nowrap transition-all ${
                                activeTab === tab.id
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Toggles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredToggles.map(toggle => {
                    const active = isToggleActive(toggle);

                    return (
                        <div
                            key={toggle.key}
                            onClick={() => handleToggle(toggle)}
                            className={`p-5 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                                active
                                    ? 'bg-white dark:bg-dark-surface border-emerald-500/50 shadow-sm hover:shadow-md'
                                    : 'bg-gray-50/70 dark:bg-dark-bg/60 border-gray-200 dark:border-gray-800/80 opacity-80 hover:opacity-100'
                            }`}
                        >
                            <div className="space-y-2">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-gray-200/60 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                            {toggle.category.replace('_', ' ')}
                                        </span>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-sm mt-1">
                                            {toggle.label}
                                        </h3>
                                    </div>

                                    {/* Toggle Switch */}
                                    <div
                                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 flex items-center shrink-0 ${
                                            active ? 'bg-emerald-500 justify-end' : 'bg-gray-300 dark:bg-gray-700 justify-start'
                                        }`}
                                    >
                                        <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                                    </div>
                                </div>

                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {toggle.description}
                                </p>
                            </div>

                            <div className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between text-[11px]">
                                <span className="font-mono text-gray-400">
                                    {toggle.key}
                                </span>
                                <span className={`font-bold flex items-center gap-1 ${active ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                    {active ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                                    {active ? 'ENABLED (সক্রিয়)' : 'DISABLED (বন্ধ)'}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom Status Help Card */}
            <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-blue-900 dark:text-blue-300 flex items-start gap-4 text-xs">
                <Shield className="text-primary shrink-0 mt-0.5" size={20} />
                <div className="space-y-1">
                    <h5 className="font-bold text-sm">System Persistence & Cache Sync</h5>
                    <p className="leading-relaxed text-gray-600 dark:text-gray-400">
                        যেকোনো টগল পরিবর্তন করার পর উপরে থাকা <span className="font-bold text-primary">"Save & Apply Controls"</span> বাটনে চাপ দিন। সিস্টেম তাৎক্ষণিকভাবে ডাটাবেসে সেভ করবে এবং হোমপেজ, সাপোর্ট পেজ ও কন্টাক্ট পেজের ক্যাশ স্বয়ংক্রিয়ভাবে আপডেট করে দিবে।
                    </p>
                </div>
            </div>
        </div>
    );
}
