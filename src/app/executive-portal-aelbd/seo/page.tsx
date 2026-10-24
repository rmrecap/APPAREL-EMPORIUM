'use client';

import React, { useState, useEffect } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { 
    Globe, 
    FileText, 
    CornerDownRight, 
    Save, 
    Link as LinkIcon, 
    Lock, 
    Activity, 
    Eye, 
    Trash2, 
    Plus, 
    Search, 
    Send, 
    RefreshCw, 
    CheckCircle2, 
    AlertCircle, 
    BarChart3, 
    ArrowUpRight, 
    Smartphone, 
    Laptop, 
    Layers, 
    ExternalLink, 
    Zap, 
    ShieldCheck, 
    Sliders,
    Building2,
    Calendar,
    Loader2
} from 'lucide-react';
import ImagePicker from '@/components/admin/ImagePicker';
import Link from 'next/link';

interface GscData {
    siteUrl: string;
    clientEmail: string;
    dateRange: { days: number; startDate: string; endDate: string };
    overview: {
        totalClicks: number;
        totalImpressions: number;
        overallCtr: number;
        averagePosition: number;
    };
    trends: Array<{ date: string; clicks: number; impressions: number; ctr: number; position: number }>;
    topQueries: Array<{ query: string; clicks: number; impressions: number; ctr: number; position: number }>;
    topPages: Array<{ page: string; clicks: number; impressions: number; ctr: number; position: number }>;
    topCountries: Array<{ countryCode: string; clicks: number; impressions: number; ctr: number; position: number }>;
    devices: Array<{ device: string; clicks: number; impressions: number; ctr: number; position: number }>;
    sitemap: any;
}

export default function SeoManagerPage() {
    const { role } = usePermission();
    const [activeTab, setActiveTab] = useState<'gsc' | 'indexing' | 'global-hubs' | 'analytics' | 'global' | 'pages' | 'robots' | 'redirects' | 'sitemap'>('gsc');
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    // GSC State
    const [gscDays, setGscDays] = useState<number>(28);
    const [gscData, setGscData] = useState<GscData | null>(null);
    const [gscLoading, setGscLoading] = useState(false);
    const [gscError, setGscError] = useState<string | null>(null);
    const [activeGscSubTab, setActiveGscSubTab] = useState<'queries' | 'pages' | 'countries' | 'devices'>('queries');

    // Indexing State
    const [indexUrl, setIndexUrl] = useState('https://aelbd.net/');
    const [indexingLogs, setIndexingLogs] = useState<Array<{ timestamp: string; message: string; type: 'info' | 'success' | 'error' }>>([]);
    const [indexingInProgress, setIndexingInProgress] = useState(false);

    // Redirects
    const [redirects, setRedirects] = useState<any[]>([]);
    const [newRedirect, setNewRedirect] = useState({ source: '', target: '', code: 301 });

    const PAGES = ['home', 'products', 'global-sourcing', 'about', 'contact', 'blog'];

    useEffect(() => {
        fetchSettings();
        if (activeTab === 'redirects') fetchRedirects();
        if (activeTab === 'gsc') fetchGscReport(gscDays);
    }, [activeTab]);

    const fetchGscReport = async (days: number) => {
        setGscLoading(true);
        setGscError(null);
        try {
            const res = await fetch(`/api/admin/gsc/report?days=${days}`);
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Failed to fetch Search Console data');
            }
            setGscData(data);
        } catch (err: any) {
            setGscError(err.message || 'Error communicating with Google Search Console');
        } finally {
            setGscLoading(false);
        }
    };

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings?group=seo');
            const data = await res.json();
            if (data.settings) {
                if (Array.isArray(data.settings)) {
                    const map: Record<string, string> = {};
                    data.settings.forEach((s: any) => map[s.key] = s.value);
                    setSettings(map);
                } else if (typeof data.settings === 'object') {
                    setSettings(data.settings);
                }
            }
        } catch (e) {
            console.error('Failed to load SEO settings:', e);
        }
    };

    const fetchRedirects = async () => {
        try {
            const res = await fetch('/api/settings?group=redirects');
            const data = await res.json();
            let raw = '[]';
            if (Array.isArray(data.settings)) {
                raw = data.settings.find((s: any) => s.key === 'seo_redirects')?.value || '[]';
            } else if (data.settings && typeof data.settings === 'object') {
                raw = data.settings['seo_redirects'] || '[]';
            }
            setRedirects(JSON.parse(raw));
        } catch { setRedirects([]); }
    };

    const updateSetting = (key: string, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            await Promise.all(
                Object.entries(settings).map(([k, v]) =>
                    fetch('/api/settings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ key: k, value: v, group: 'seo' })
                    })
                )
            );
            alert("SEO settings saved successfully.");
        } catch (e) {
            console.error(e);
            alert("Error saving SEO settings.");
        } finally {
            setSaving(false);
        }
    };

    const saveRedirects = async (arr: any[]) => {
        setRedirects(arr);
        await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'seo_redirects', value: JSON.stringify(arr), group: 'redirects' })
        });
    };

    const addRedirect = async () => {
        if (!newRedirect.source || !newRedirect.target) return;
        const arr = [...redirects, { id: Date.now().toString(), ...newRedirect, hits: 0, active: true }];
        await saveRedirects(arr);
        setNewRedirect({ source: '', target: '', code: 301 });
    };

    // Instant Indexing Action
    const handleInstantIndex = async (targetUrl: string) => {
        setIndexingInProgress(true);
        addLog(`Submitting "${targetUrl}" to Google Search Indexing API...`, 'info');

        try {
            const res = await fetch('/api/admin/gsc/index-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: targetUrl, action: 'index' }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Indexing request failed');
            }
            addLog(`✓ SUCCESS (200): Notification recorded for ${targetUrl} at ${data.timestamp}`, 'success');
        } catch (err: any) {
            addLog(`✕ ERROR: ${err.message}`, 'error');
        } finally {
            setIndexingInProgress(false);
        }
    };

    // Batch Index Action
    const handleBatchIndex = async (urls: string[], label: string) => {
        setIndexingInProgress(true);
        addLog(`Initiating batch indexing for ${label} (${urls.length} URLs)...`, 'info');

        try {
            const res = await fetch('/api/admin/gsc/index-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'batch_index', urls }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Batch indexing request failed');
            }
            data.results.forEach((r: any) => {
                if (r.status === 'SUCCESS') {
                    addLog(`✓ Published ${r.url} (HTTP ${r.statusCode})`, 'success');
                } else {
                    addLog(`✕ Failed ${r.url}: ${r.error}`, 'error');
                }
            });
            addLog(`Batch complete: Processed ${data.total} URLs.`, 'info');
        } catch (err: any) {
            addLog(`✕ Batch Error: ${err.message}`, 'error');
        } finally {
            setIndexingInProgress(false);
        }
    };

    // Sitemap Resubmit Action
    const handleSitemapResubmit = async () => {
        setIndexingInProgress(true);
        addLog('Submitting sitemap.xml to Google Search Console API...', 'info');

        try {
            const res = await fetch('/api/admin/gsc/index-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'sitemap' }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Sitemap submission failed');
            }
            addLog(`✓ SUCCESS: ${data.message} (${data.feedpath})`, 'success');
            if (data.sitemapStatus) {
                addLog(`✓ Sitemap status: isPending=${data.sitemapStatus.isPending}, errors=${data.sitemapStatus.errors || 0}`, 'info');
            }
        } catch (err: any) {
            addLog(`✕ Sitemap Error: ${err.message}`, 'error');
        } finally {
            setIndexingInProgress(false);
        }
    };

    const addLog = (message: string, type: 'info' | 'success' | 'error') => {
        const timestamp = new Date().toLocaleTimeString();
        setIndexingLogs(prev => [{ timestamp, message, type }, ...prev]);
    };

    if (role !== 'DEVELOPER' && role !== 'SUPER_ADMIN') {
        return <div className="p-8 text-center text-red-500 font-bold">Access Denied</div>;
    }

    return (
        <div className="max-w-7xl mx-auto pb-20 px-4">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-200 dark:border-gray-800 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold mb-1.5 flex items-center gap-3 font-heading text-gray-900 dark:text-white">
                        <Globe className="text-primary w-8 h-8" /> SEO &amp; Search Console Suite
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Live Google Search Console telemetry, instant web search indexing, B2B market authority hubs, and edge metadata.
                    </p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center gap-3">
                    <button
                        onClick={saveSettings}
                        disabled={saving}
                        className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary/90 transition flex items-center gap-2 text-sm disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                        Save All SEO Changes
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex overflow-x-auto gap-2 bg-gray-100 dark:bg-gray-800/50 p-1.5 rounded-2xl mb-8 border border-gray-200 dark:border-gray-800">
                {[
                    { id: 'gsc', icon: BarChart3, label: 'Search Console Analytics' },
                    { id: 'indexing', icon: Zap, label: '1-Click Instant Indexing' },
                    { id: 'global-hubs', icon: Globe, label: 'Global Sourcing & Category Hubs' },
                    { id: 'analytics', icon: Activity, label: 'Google Analytics & Tracking' },
                    { id: 'global', icon: Sliders, label: 'Global Defaults' },
                    { id: 'pages', icon: FileText, label: 'Per-Page Meta' },
                    { id: 'robots', icon: Lock, label: 'Robots.txt' },
                    { id: 'redirects', icon: CornerDownRight, label: '301 Redirects' },
                    { id: 'sitemap', icon: LinkIcon, label: 'Sitemap XML' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap
                        ${activeTab === tab.id
                                ? 'bg-white dark:bg-dark-surface shadow-sm text-primary'
                                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
                    >
                        <tab.icon size={16} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* TAB CONTENTS */}
            <div className="bg-white dark:bg-dark-surface rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 sm:p-8">

                {/* ── 1. GOOGLE SEARCH CONSOLE ANALYTICS ──────────────── */}
                {activeTab === 'gsc' && (
                    <div className="space-y-8">
                        {/* Control Bar */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 dark:bg-dark-bg p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Property:</span>
                                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20">
                                    sc-domain:aelbd.net
                                </span>
                                {gscData && (
                                    <span className="hidden sm:inline-block text-xs text-gray-400">
                                        • Service Account: {gscData.clientEmail}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                                <div className="flex bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-gray-700 p-1 text-xs font-bold">
                                    {[7, 28, 90].map((d) => (
                                        <button
                                            key={d}
                                            onClick={() => {
                                                setGscDays(d);
                                                fetchGscReport(d);
                                            }}
                                            className={`px-3 py-1.5 rounded-lg transition ${gscDays === d ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                                        >
                                            {d} Days
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => fetchGscReport(gscDays)}
                                    disabled={gscLoading}
                                    className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition"
                                    title="Refresh GSC Data"
                                >
                                    <RefreshCw className={`w-4 h-4 ${gscLoading ? 'animate-spin text-primary' : ''}`} />
                                </button>
                            </div>
                        </div>

                        {gscError && (
                            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <div>
                                    <p className="font-bold">Google Search Console API Notice</p>
                                    <p className="text-xs">{gscError}</p>
                                </div>
                            </div>
                        )}

                        {/* KPI Overview Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border border-blue-500/20">
                                <span className="text-xs font-bold uppercase text-blue-600 dark:text-blue-400 tracking-wider">Total Clicks</span>
                                <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">
                                    {gscLoading ? <Loader2 className="w-6 h-6 animate-spin text-blue-500" /> : gscData?.overview.totalClicks ?? '—'}
                                </p>
                                <span className="text-[11px] text-gray-400 mt-1 block">Organic search visits to aelbd.net</span>
                            </div>

                            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/20">
                                <span className="text-xs font-bold uppercase text-purple-600 dark:text-purple-400 tracking-wider">Total Impressions</span>
                                <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">
                                    {gscLoading ? <Loader2 className="w-6 h-6 animate-spin text-purple-500" /> : gscData?.overview.totalImpressions ?? '—'}
                                </p>
                                <span className="text-[11px] text-gray-400 mt-1 block">Times URLs appeared in search results</span>
                            </div>

                            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20">
                                <span className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">Average CTR</span>
                                <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">
                                    {gscLoading ? <Loader2 className="w-6 h-6 animate-spin text-emerald-500" /> : `${gscData?.overview.overallCtr ?? 0}%`}
                                </p>
                                <span className="text-[11px] text-gray-400 mt-1 block">Click-Through Rate across queries</span>
                            </div>

                            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20">
                                <span className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400 tracking-wider">Average Position</span>
                                <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">
                                    {gscLoading ? <Loader2 className="w-6 h-6 animate-spin text-amber-500" /> : (gscData?.overview.averagePosition ? gscData.overview.averagePosition.toFixed(1) : '—')}
                                </p>
                                <span className="text-[11px] text-gray-400 mt-1 block">Google Search rank across rankings</span>
                            </div>
                        </div>

                        {/* Interactive Data Sub-Tabs */}
                        <div>
                            <div className="flex border-b border-gray-200 dark:border-gray-800 gap-4 mb-6">
                                {[
                                    { id: 'queries', label: `Top Queries (${gscData?.topQueries.length || 0})` },
                                    { id: 'pages', label: `Top Performing Pages (${gscData?.topPages.length || 0})` },
                                    { id: 'countries', label: `Buyer Countries (${gscData?.topCountries.length || 0})` },
                                    { id: 'devices', label: 'Device Breakdown' }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveGscSubTab(tab.id as any)}
                                        className={`pb-3 font-bold text-sm transition relative ${activeGscSubTab === tab.id ? 'text-primary' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                                    >
                                        {tab.label}
                                        {activeGscSubTab === tab.id && (
                                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Queries Table */}
                            {activeGscSubTab === 'queries' && (
                                <div className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 dark:bg-dark-bg text-xs uppercase text-gray-500 font-semibold border-b border-gray-200 dark:border-gray-800">
                                            <tr>
                                                <th className="p-4">Search Query</th>
                                                <th className="p-4 text-right">Clicks</th>
                                                <th className="p-4 text-right">Impressions</th>
                                                <th className="p-4 text-right">CTR</th>
                                                <th className="p-4 text-right">Avg Position</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {gscData?.topQueries.map((q, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                                                    <td className="p-4 font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                                        <Search className="w-3.5 h-3.5 text-gray-400" />
                                                        {q.query}
                                                    </td>
                                                    <td className="p-4 text-right font-mono font-bold text-blue-600 dark:text-blue-400">{q.clicks}</td>
                                                    <td className="p-4 text-right font-mono text-gray-600 dark:text-gray-300">{q.impressions}</td>
                                                    <td className="p-4 text-right font-mono text-gray-600 dark:text-gray-300">{q.ctr}%</td>
                                                    <td className="p-4 text-right font-mono font-bold text-gray-700 dark:text-gray-300">{q.position}</td>
                                                </tr>
                                            ))}
                                            {(!gscData?.topQueries || gscData.topQueries.length === 0) && (
                                                <tr>
                                                    <td colSpan={5} className="p-8 text-center text-gray-400">
                                                        No query records found for this date range.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Pages Table */}
                            {activeGscSubTab === 'pages' && (
                                <div className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 dark:bg-dark-bg text-xs uppercase text-gray-500 font-semibold border-b border-gray-200 dark:border-gray-800">
                                            <tr>
                                                <th className="p-4">Page Route</th>
                                                <th className="p-4 text-right">Clicks</th>
                                                <th className="p-4 text-right">Impressions</th>
                                                <th className="p-4 text-right">CTR</th>
                                                <th className="p-4 text-right">Position</th>
                                                <th className="p-4 text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {gscData?.topPages.map((p, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                                                    <td className="p-4 font-mono text-xs text-gray-900 dark:text-white truncate max-w-md">
                                                        <a href={p.page} target="_blank" rel="noopener noreferrer" className="hover:text-primary flex items-center gap-1.5">
                                                            {p.page} <ExternalLink className="w-3 h-3 text-gray-400" />
                                                        </a>
                                                    </td>
                                                    <td className="p-4 text-right font-mono font-bold text-blue-600 dark:text-blue-400">{p.clicks}</td>
                                                    <td className="p-4 text-right font-mono text-gray-600 dark:text-gray-300">{p.impressions}</td>
                                                    <td className="p-4 text-right font-mono text-gray-600 dark:text-gray-300">{p.ctr}%</td>
                                                    <td className="p-4 text-right font-mono text-gray-700 dark:text-gray-300">{p.position}</td>
                                                    <td className="p-4 text-center">
                                                        <button
                                                            onClick={() => handleInstantIndex(p.page)}
                                                            disabled={indexingInProgress}
                                                            className="text-xs px-2.5 py-1 rounded bg-primary/10 text-primary hover:bg-primary hover:text-white transition font-bold"
                                                        >
                                                            Index URL
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!gscData?.topPages || gscData.topPages.length === 0) && (
                                                <tr>
                                                    <td colSpan={6} className="p-8 text-center text-gray-400">
                                                        No indexed pages performance logged yet for this range.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Countries Table */}
                            {activeGscSubTab === 'countries' && (
                                <div className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 dark:bg-dark-bg text-xs uppercase text-gray-500 font-semibold border-b border-gray-200 dark:border-gray-800">
                                            <tr>
                                                <th className="p-4">Buyer Country Code</th>
                                                <th className="p-4 text-right">Clicks</th>
                                                <th className="p-4 text-right">Impressions</th>
                                                <th className="p-4 text-right">CTR</th>
                                                <th className="p-4 text-right">Position</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {gscData?.topCountries.map((c, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                                                    <td className="p-4 font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                        <Globe className="w-4 h-4 text-primary" />
                                                        {c.countryCode}
                                                    </td>
                                                    <td className="p-4 text-right font-mono font-bold text-blue-600 dark:text-blue-400">{c.clicks}</td>
                                                    <td className="p-4 text-right font-mono text-gray-600 dark:text-gray-300">{c.impressions}</td>
                                                    <td className="p-4 text-right font-mono text-gray-600 dark:text-gray-300">{c.ctr}%</td>
                                                    <td className="p-4 text-right font-mono text-gray-700 dark:text-gray-300">{c.position}</td>
                                                </tr>
                                            ))}
                                            {(!gscData?.topCountries || gscData.topCountries.length === 0) && (
                                                <tr>
                                                    <td colSpan={5} className="p-8 text-center text-gray-400">
                                                        No geographical impressions logged yet.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Devices Breakdown */}
                            {activeGscSubTab === 'devices' && (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    {gscData?.devices.map((d, idx) => (
                                        <div key={idx} className="p-6 rounded-2xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800">
                                            <div className="flex items-center gap-3 mb-4">
                                                {d.device === 'MOBILE' ? (
                                                    <Smartphone className="w-6 h-6 text-primary" />
                                                ) : (
                                                    <Laptop className="w-6 h-6 text-primary" />
                                                )}
                                                <div>
                                                    <h4 className="font-bold text-gray-900 dark:text-white">{d.device}</h4>
                                                    <span className="text-xs text-gray-400">Target Platform</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Clicks:</span>
                                                    <span className="font-mono font-bold">{d.clicks}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Impressions:</span>
                                                    <span className="font-mono font-bold">{d.impressions}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">CTR:</span>
                                                    <span className="font-mono font-bold">{d.ctr}%</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Avg Pos:</span>
                                                    <span className="font-mono font-bold">{d.position}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {(!gscData?.devices || gscData.devices.length === 0) && (
                                        <p className="text-sm text-gray-400 col-span-3 text-center py-8">No device telemetry logged yet.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── 2. INSTANT INDEXING & SITEMAP TOOL ──────────────── */}
                {activeTab === 'indexing' && (
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                Google Search Indexing API (URL_UPDATED Engine)
                            </h3>
                            <p className="text-sm text-gray-500">
                                Send direct API notifications to Googlebot to recrawl or index updated pages within minutes.
                            </p>
                        </div>

                        {/* URL Submission Box */}
                        <div className="p-6 rounded-2xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 space-y-4">
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                                Target Web Page URL
                            </label>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="text"
                                    value={indexUrl}
                                    onChange={(e) => setIndexUrl(e.target.value)}
                                    placeholder="https://aelbd.net/products/woven"
                                    className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-surface font-mono text-sm focus:border-primary outline-none"
                                />
                                <button
                                    onClick={() => handleInstantIndex(indexUrl)}
                                    disabled={indexingInProgress || !indexUrl}
                                    className="px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
                                >
                                    {indexingInProgress ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    Publish to Google Index
                                </button>
                            </div>
                        </div>

                        {/* Batch Action Presets */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Quick Batch Indexing Actions</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <button
                                    onClick={() => handleBatchIndex([
                                        'https://aelbd.net/products/woven',
                                        'https://aelbd.net/products/knitwear',
                                        'https://aelbd.net/products/sweater'
                                    ], 'Core B2B Categories')}
                                    disabled={indexingInProgress}
                                    className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-primary text-left bg-gray-50/50 dark:bg-dark-bg/50 transition group"
                                >
                                    <span className="text-xs font-bold text-primary group-hover:underline block">⚡ Index 3 Category Hubs</span>
                                    <span className="text-[11px] text-gray-400">Woven, Knitwear &amp; Sweaters</span>
                                </button>

                                <button
                                    onClick={() => handleInstantIndex('https://aelbd.net/global-sourcing')}
                                    disabled={indexingInProgress}
                                    className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-primary text-left bg-gray-50/50 dark:bg-dark-bg/50 transition group"
                                >
                                    <span className="text-xs font-bold text-primary group-hover:underline block">🌐 Index Global Sourcing</span>
                                    <span className="text-[11px] text-gray-400">/global-sourcing corridor</span>
                                </button>

                                <button
                                    onClick={() => handleBatchIndex([
                                        'https://aelbd.net/blog/bsci-vs-sedex-compliance-standards-guide',
                                        'https://aelbd.net/blog/higg-vs-smeta-social-audit-standard-fashion-supply-chain',
                                        'https://aelbd.net/blog/how-sedex-membership-reduces-supplier-audit-duplication',
                                        'https://aelbd.net/blog/apparel-sourcing-company-bangladesh-buyer-guide'
                                    ], '4 Compliance & Sourcing Guides')}
                                    disabled={indexingInProgress}
                                    className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-primary text-left bg-gray-50/50 dark:bg-dark-bg/50 transition group"
                                >
                                    <span className="text-xs font-bold text-primary group-hover:underline block">📑 Index 4 Guides</span>
                                    <span className="text-[11px] text-gray-400">BSCI, Higg, Sedex &amp; Buyer Guides</span>
                                </button>

                                <button
                                    onClick={handleSitemapResubmit}
                                    disabled={indexingInProgress}
                                    className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-emerald-500 text-left bg-gray-50/50 dark:bg-dark-bg/50 transition group"
                                >
                                    <span className="text-xs font-bold text-emerald-500 group-hover:underline block">🔄 Re-Submit sitemap.xml</span>
                                    <span className="text-[11px] text-gray-400">Trigger GSC Crawl</span>
                                </button>
                            </div>
                        </div>

                        {/* Real-Time Execution Console */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Live API Response Terminal</h4>
                                {indexingLogs.length > 0 && (
                                    <button
                                        onClick={() => setIndexingLogs([])}
                                        className="text-xs text-gray-400 hover:text-red-500 transition"
                                    >
                                        Clear Logs
                                    </button>
                                )}
                            </div>
                            <div className="bg-gray-950 text-gray-300 p-4 rounded-2xl font-mono text-xs h-64 overflow-y-auto space-y-1.5 border border-gray-800 shadow-inner">
                                {indexingLogs.length === 0 ? (
                                    <p className="text-gray-600 italic">No indexing calls initiated in this session. Click any action above to test.</p>
                                ) : (
                                    indexingLogs.map((log, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <span className="text-gray-600 shrink-0">[{log.timestamp}]</span>
                                            <span className={log.type === 'success' ? 'text-emerald-400' : log.type === 'error' ? 'text-red-400' : 'text-blue-300'}>
                                                {log.message}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── 3. GLOBAL SOURCING & CATEGORY HUBS ──────────────── */}
                {activeTab === 'global-hubs' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                High-Intent B2B Sourcing Hubs &amp; Authority Architecture
                            </h3>
                            <p className="text-sm text-gray-500">
                                Monitored category corridors targeting verified Google Search queries from USA, UK, Europe, UAE, and Australia.
                            </p>
                        </div>

                        <div className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 dark:bg-dark-bg text-xs uppercase text-gray-500 font-semibold border-b border-gray-200 dark:border-gray-800">
                                    <tr>
                                        <th className="p-4">Hub Route</th>
                                        <th className="p-4">Division / Target Region</th>
                                        <th className="p-4">Target Keyword Clusters</th>
                                        <th className="p-4">Structured Schemas</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                                    {[
                                        {
                                            route: '/products/woven',
                                            title: 'Woven Garments Division',
                                            keywords: 'denim pants, poplin shirts, twill trousers, woven manufacturing bangladesh',
                                            schemas: 'CollectionPage, FAQPage, BreadcrumbList',
                                            url: 'https://aelbd.net/products/woven'
                                        },
                                        {
                                            route: '/products/knitwear',
                                            title: 'Circular Knitwear Division',
                                            keywords: 'cotton t-shirts, french terry hoodies, pique polo, circular knits bangladesh',
                                            schemas: 'CollectionPage, FAQPage, BreadcrumbList',
                                            url: 'https://aelbd.net/products/knitwear'
                                        },
                                        {
                                            route: '/products/sweater',
                                            title: 'Flat-Knit Sweater Division',
                                            keywords: '3GG-14GG sweaters, jacquard knitwear, stoll knitting, sweater factory bangladesh',
                                            schemas: 'CollectionPage, FAQPage, BreadcrumbList',
                                            url: 'https://aelbd.net/products/sweater'
                                        },
                                        {
                                            route: '/global-sourcing',
                                            title: 'Global Markets Corridor (USA, UK, EU, UAE)',
                                            keywords: 'duty free apparel sourcing uk eu, garments manufacturing gcc uae, bangladesh clothing export',
                                            schemas: 'Service, FAQPage, BreadcrumbList',
                                            url: 'https://aelbd.net/global-sourcing'
                                        },
                                        {
                                            route: '/blog/bsci-vs-sedex-compliance-standards-guide',
                                            title: 'Compliance: BSCI vs SEDEX (SMETA)',
                                            keywords: 'bsci certification, bsci certified wholesaler, smeta 4-pillar audit',
                                            schemas: 'Article, FAQPage, BreadcrumbList',
                                            url: 'https://aelbd.net/blog/bsci-vs-sedex-compliance-standards-guide'
                                        },
                                        {
                                            route: '/blog/higg-vs-smeta-social-audit-standard-fashion-supply-chain',
                                            title: 'Compliance: Higg vs SMETA',
                                            keywords: 'higg index fem fslm, smeta social audit, sustainable fashion supply chain',
                                            schemas: 'Article, FAQPage, BreadcrumbList',
                                            url: 'https://aelbd.net/blog/higg-vs-smeta-social-audit-standard-fashion-supply-chain'
                                        },
                                        {
                                            route: '/blog/how-sedex-membership-reduces-supplier-audit-duplication',
                                            title: 'Cost Savings: SEDEX Audit Duplication',
                                            keywords: 'sedex membership, reduce supplier audit duplication, smeta audit registry',
                                            schemas: 'Article, FAQPage, BreadcrumbList',
                                            url: 'https://aelbd.net/blog/how-sedex-membership-reduces-supplier-audit-duplication'
                                        },
                                        {
                                            route: '/blog/apparel-sourcing-company-bangladesh-buyer-guide',
                                            title: 'Playbook: Bangladesh Sourcing Guide [2026]',
                                            keywords: 'apparel sourcing company in bangladesh, buying house bangladesh, moq negotiation',
                                            schemas: 'Article, FAQPage, BreadcrumbList',
                                            url: 'https://aelbd.net/blog/apparel-sourcing-company-bangladesh-buyer-guide'
                                        }
                                    ].map((hub, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                                            <td className="p-4 font-mono font-bold text-gray-900 dark:text-white">
                                                {hub.route}
                                            </td>
                                            <td className="p-4 font-medium text-gray-800 dark:text-gray-200">
                                                {hub.title}
                                            </td>
                                            <td className="p-4 text-gray-500 dark:text-gray-400 italic max-w-xs">
                                                {hub.keywords}
                                            </td>
                                            <td className="p-4 font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                                                {hub.schemas}
                                            </td>
                                            <td className="p-4 text-right space-x-2">
                                                <button
                                                    onClick={() => handleInstantIndex(hub.url)}
                                                    disabled={indexingInProgress}
                                                    className="px-2.5 py-1 rounded bg-primary/10 text-primary hover:bg-primary hover:text-white transition font-bold"
                                                >
                                                    Index
                                                </button>
                                                <a
                                                    href={hub.route}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                                                >
                                                    <ExternalLink className="w-3 h-3" /> Visit
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── 4. GOOGLE ANALYTICS & INTEGRATIONS ─────────────── */}
                {activeTab === 'analytics' && (
                    <div className="space-y-6 max-w-4xl">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                Google Analytics &amp; Tracking Configuration
                            </h3>
                            <p className="text-sm text-gray-500">
                                Connect measurement IDs and web analytics containers alongside your Google Search Console telemetry.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                                        GA4
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">Google Analytics 4</h4>
                                        <span className="text-xs text-amber-700 dark:text-amber-300 font-semibold">Active Tag</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Integrated via gtag.js. Captures buyer pageviews, geo-location, scroll depth, and RFQ form completions.
                                </p>
                                <div className="pt-2">
                                    <Link
                                        href="/executive-portal-aelbd/tracking"
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                                    >
                                        Manage GA4 Measurement ID in Tracking &rarr;
                                    </Link>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                                        GTM
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">Google Tag Manager</h4>
                                        <span className="text-xs text-blue-700 dark:text-blue-300 font-semibold">Container Tag</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Enables central injection of custom marketing pixels, conversion goals, and third-party event listeners.
                                </p>
                                <div className="pt-2">
                                    <Link
                                        href="/executive-portal-aelbd/tracking"
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                                    >
                                        Configure GTM Container in Tracking &rarr;
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-sm text-gray-900 dark:text-white">In-House Real-Time Visitor Telemetry</h4>
                                <p className="text-xs text-gray-500">View real-time buyer sessions, active live IPs, and page journeys.</p>
                            </div>
                            <Link
                                href="/executive-portal-aelbd/analytics"
                                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition shadow-sm"
                            >
                                Open Analytics &amp; Traffic Hub
                            </Link>
                        </div>
                    </div>
                )}

                {/* ── 5. GLOBAL DEFAULTS ─────────────────────────────── */}
                {activeTab === 'global' && (
                    <div className="max-w-3xl space-y-6">
                        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 text-sm text-blue-800 dark:text-blue-300 mb-8">
                            These settings act as the ultimate fallback. If a specific page does not have custom SEO metadata, Next.js will inject these default params.
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Default Meta Title Template</label>
                            <input
                                type="text"
                                value={settings['seo_default_title'] || ''}
                                onChange={e => updateSetting('seo_default_title', e.target.value)}
                                className="w-full px-4 py-3 border rounded-xl bg-gray-50 dark:bg-dark-bg focus:ring-primary focus:border-primary outline-none"
                                placeholder="%s | Premium Garments Production"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Default Meta Description</label>
                            <textarea
                                value={settings['seo_default_description'] || ''}
                                onChange={e => updateSetting('seo_default_description', e.target.value)}
                                className="w-full px-4 py-3 border rounded-xl bg-gray-50 dark:bg-dark-bg focus:ring-primary focus:border-primary outline-none"
                                rows={3}
                            ></textarea>
                            <span className="text-xs text-gray-400 mt-1 block">Optimal length: 150-160 characters.</span>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Default OpenGraph Schema Banner (OG:Image)</label>
                            <ImagePicker value={settings['seo_default_og_image'] || ''} onChange={url => updateSetting('seo_default_og_image', url)} />
                        </div>

                        <div className="pt-8 border-t border-gray-100 dark:border-gray-800 mt-8 space-y-6">
                            <h3 className="font-bold text-lg font-heading">Webmaster Verification</h3>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Google Site Verification Content Code</label>
                                <input type="text" value={settings['seo_google_verify'] || ''} onChange={e => updateSetting('seo_google_verify', e.target.value)} className="w-full px-4 py-2 border rounded-xl font-mono bg-gray-50 dark:bg-dark-bg text-sm focus:ring-primary focus:border-primary outline-none" placeholder="e.g. dBw5CvX_w..." />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Bing Webmaster Content Code</label>
                                <input type="text" value={settings['seo_bing_verify'] || ''} onChange={e => updateSetting('seo_bing_verify', e.target.value)} className="w-full px-4 py-2 border rounded-xl font-mono bg-gray-50 dark:bg-dark-bg text-sm focus:ring-primary focus:border-primary outline-none" placeholder="e.g. 5A1C..." />
                            </div>
                        </div>
                    </div>
                )}

                {/* ── 6. PAGES SEO TAB ──────────────────────────────── */}
                {activeTab === 'pages' && (
                    <div className="space-y-4">
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-xl mb-6 text-sm text-yellow-800 dark:text-yellow-600 font-medium">
                            Override index definitions for statically routed structural pages. Product and Blog SEO are driven via their respective CMS builders.
                        </div>

                        {PAGES.map(page => (
                            <details key={page} className="group border border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50 dark:bg-dark-bg overflow-hidden cursor-pointer">
                                <summary className="px-6 py-4 font-bold uppercase tracking-wider text-sm hover:bg-gray-100 dark:hover:bg-gray-800 outline-none list-none flex justify-between items-center group-open:border-b border-gray-200 dark:border-gray-800">
                                    <span>/{page === 'home' ? '' : page} Route</span>
                                    <div className="text-gray-400 group-open:rotate-180 transition-transform"><CornerDownRight size={18} /></div>
                                </summary>
                                <div className="p-6 bg-white dark:bg-dark-surface grid grid-cols-1 md:grid-cols-2 gap-6 cursor-default">
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-bold text-gray-500 block mb-1">Meta Title</label>
                                        <input type="text" value={settings[`seo_page_${page}_title`] || ''} onChange={e => updateSetting(`seo_page_${page}_title`, e.target.value)} className="w-full border rounded-lg p-2 text-sm focus:ring-primary focus:border-primary outline-none" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-bold text-gray-500 block mb-1">Meta Description</label>
                                        <textarea value={settings[`seo_page_${page}_desc`] || ''} onChange={e => updateSetting(`seo_page_${page}_desc`, e.target.value)} className="w-full border rounded-lg p-2 text-sm focus:ring-primary focus:border-primary outline-none" rows={2}></textarea>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 block mb-1">Canonical URL override</label>
                                        <input type="text" value={settings[`seo_page_${page}_canonical`] || ''} onChange={e => updateSetting(`seo_page_${page}_canonical`, e.target.value)} className="w-full border rounded-lg p-2 text-sm font-mono focus:ring-primary focus:border-primary outline-none" placeholder={`https://aelbd.net/${page === 'home' ? '' : page}`} />
                                    </div>
                                    <div className="flex gap-6 items-center pt-5">
                                        <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                                            <input type="checkbox" checked={settings[`seo_page_${page}_noindex`] === 'true'} onChange={e => updateSetting(`seo_page_${page}_noindex`, e.target.checked.toString())} className="w-4 h-4 rounded text-primary border-gray-300 focus:ring-primary" />
                                            No-Index
                                        </label>
                                        <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                                            <input type="checkbox" checked={settings[`seo_page_${page}_nofollow`] === 'true'} onChange={e => updateSetting(`seo_page_${page}_nofollow`, e.target.checked.toString())} className="w-4 h-4 rounded text-primary border-gray-300 focus:ring-primary" />
                                            No-Follow
                                        </label>
                                    </div>
                                </div>
                            </details>
                        ))}
                    </div>
                )}

                {/* ── 7. ROBOTS.TXT ─────────────────────────────────── */}
                {activeTab === 'robots' && (
                    <div className="max-w-3xl">
                        <h3 className="font-bold mb-2">Custom Robots.txt rules</h3>
                        <p className="text-sm text-gray-500 mb-4">Leave entirely blank to use Next.js's standard safe auto-generation.</p>
                        <textarea
                            value={settings['seo_custom_robots'] || ''}
                            onChange={e => updateSetting('seo_custom_robots', e.target.value)}
                            className="w-full h-64 p-4 font-mono text-sm bg-gray-900 text-green-400 rounded-2xl focus:ring-2 focus:ring-primary border-transparent outline-none"
                            placeholder="User-agent: *&#10;Allow: /&#10;Disallow: /executive-portal-aelbd/"
                        ></textarea>
                    </div>
                )}

                {/* ── 8. 301 REDIRECTS ──────────────────────────────── */}
                {activeTab === 'redirects' && (
                    <div>
                        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl mb-8">
                            <h3 className="font-bold text-sm mb-4">Bind New Intercept Map</h3>
                            <div className="flex flex-wrap md:flex-nowrap gap-4 items-end">
                                <div className="flex-1 min-w-[200px]">
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">Old Source URL Path</label>
                                    <input type="text" value={newRedirect.source} onChange={e => setNewRedirect({ ...newRedirect, source: e.target.value })} className="w-full border rounded-lg p-2 text-sm font-mono focus:ring-primary outline-none" placeholder="/old-products.php" />
                                </div>
                                <div className="flex-1 min-w-[200px]">
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">New Target URL</label>
                                    <input type="text" value={newRedirect.target} onChange={e => setNewRedirect({ ...newRedirect, target: e.target.value })} className="w-full border rounded-lg p-2 text-sm font-mono focus:ring-primary outline-none" placeholder="/products" />
                                </div>
                                <div className="w-28">
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">Code</label>
                                    <select value={newRedirect.code} onChange={e => setNewRedirect({ ...newRedirect, code: Number(e.target.value) })} className="w-full border rounded-lg p-2 text-sm outline-none">
                                        <option value={301}>301 Perm</option>
                                        <option value={302}>302 Temp</option>
                                    </select>
                                </div>
                                <button onClick={addRedirect} className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-lg hover:bg-primary transition h-[38px]"><Plus size={18} /></button>
                            </div>
                        </div>

                        <div className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
                            <table className="w-full text-left font-mono text-sm">
                                <thead className="bg-gray-50 dark:bg-dark-bg text-xs tracking-wider uppercase text-gray-500 font-sans">
                                    <tr>
                                        <th className="p-4 border-b border-gray-200 dark:border-gray-800">Map Route</th>
                                        <th className="p-4 border-b border-gray-200 dark:border-gray-800">Code</th>
                                        <th className="p-4 border-b border-gray-200 dark:border-gray-800">Traffic</th>
                                        <th className="p-4 border-b border-gray-200 dark:border-gray-800 text-right">Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {redirects.map((r, idx) => (
                                        <tr key={r.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="p-4 break-all block"><span className="text-red-500">{r.source}</span> <ArrowIcon /> <span className="text-green-500">{r.target}</span></td>
                                            <td className="p-4">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold font-sans ${r.code === 301 ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{r.code}</span>
                                            </td>
                                            <td className="p-4"><div className="flex items-center gap-1 text-gray-400 capitalize font-sans"><Activity size={12} /> {r.hits || 0} hits</div></td>
                                            <td className="p-4 text-right">
                                                <button onClick={() => saveRedirects(redirects.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                    {redirects.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-400 font-sans">No route intercepts defined.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── 9. DYNAMIC SITEMAP XML TAB ─────────────────────── */}
                {activeTab === 'sitemap' && (
                    <div className="text-center py-10 max-w-lg mx-auto">
                        <div className="w-20 h-20 bg-green-100/50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><LinkIcon size={40} /></div>
                        <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Dynamic XML Sitemap Active</h3>
                        <p className="text-gray-500 mb-8 leading-relaxed text-sm">
                            Your Next.js sitemap.xml is automatically wired to the Prisma database. It serves all published products, live categories, active blog posts, and dynamic layouts without any manual rebuilds.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <a href="/sitemap.xml" target="_blank" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl shadow-lg hover:scale-105 transition-transform text-sm">
                                <Eye size={16} /> View Live sitemap.xml
                            </a>
                            <button
                                onClick={handleSitemapResubmit}
                                disabled={indexingInProgress}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-transform text-sm disabled:opacity-50"
                            >
                                <Zap size={16} /> Submit to GSC
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

const ArrowIcon = () => <span className="text-gray-300 mx-2">→</span>;
