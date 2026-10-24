'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { 
    Activity, 
    Globe, 
    Users, 
    Eye, 
    MousePointerClick, 
    Smartphone, 
    Laptop, 
    Tablet, 
    RefreshCw, 
    Calendar, 
    ExternalLink, 
    TrendingUp, 
    Clock, 
    Share2, 
    ArrowUpRight, 
    ShieldCheck, 
    Zap,
    MapPin,
    Layers,
    FileText,
    Percent,
    Search,
    Send,
    CheckCircle2,
    AlertCircle,
    AlertTriangle,
    ArrowUpDown,
    BarChart3,
    Sparkles,
    Filter
} from 'lucide-react';
import Link from 'next/link';

// ── In-House Telemetry Interfaces ──────────────────────────────────────────
interface RealtimeData {
    activeUsers5m: number;
    activeUsers15m: number;
    recentEvents: Array<{
        id: string;
        eventType: string;
        pagePath: string;
        country: string;
        countryCode: string;
        city: string;
        browser: string;
        deviceType: string;
        sourcePlatform: string;
        createdAt: string;
    }>;
}

interface OverviewData {
    pageviews: number;
    uniqueVisitors: number;
    totalSessions: number;
    totalClicks: number;
    bounceRate: number;
    pagesPerSession: number;
}

interface CountryData {
    country: string;
    code: string;
    views: number;
    visitors: number;
    percentage: number;
}

interface CityData {
    city: string;
    country: string;
    code: string;
    count: number;
}

interface TrafficSourceCategory {
    name: string;
    key: string;
    count: number;
    percentage: number;
    color: string;
}

interface PlatformData {
    platform: string;
    count: number;
    percentage: number;
}

interface PageData {
    path: string;
    title: string;
    views: number;
    uniqueVisitors: number;
}

interface JourneyData {
    event: string;
    count: number;
    percentage: number;
}

interface DeviceData {
    name: string;
    count: number;
    percentage: number;
}

interface TechData {
    browser: string;
    count: number;
    percentage: number;
}

interface OsData {
    os: string;
    count: number;
    percentage: number;
}

interface AnalyticsStats {
    range: string;
    totalDatabaseRecords: number;
    realtime: RealtimeData;
    overview: OverviewData;
    geography: {
        topCountries: CountryData[];
        topCities: CityData[];
    };
    sources: {
        categories: TrafficSourceCategory[];
        topPlatforms: PlatformData[];
    };
    topPages: PageData[];
    userJourney: JourneyData[];
    technology: {
        devices: DeviceData[];
        browsers: TechData[];
        os: OsData[];
    };
    timeline: Array<{
        label: string;
        views: number;
        visitors: number;
    }>;
}

// ── Google Search Console & SEO Interfaces ─────────────────────────────────
interface GscReportData {
    success: boolean;
    siteUrl: string;
    clientEmail: string;
    dateRange: {
        days: number;
        startDate: string;
        endDate: string;
    };
    overview: {
        totalClicks: number;
        totalImpressions: number;
        overallCtr: number;
        averagePosition: number;
    };
    trends: Array<{
        date: string;
        clicks: number;
        impressions: number;
        ctr: number;
        position: number;
    }>;
    topQueries: Array<{
        query: string;
        clicks: number;
        impressions: number;
        ctr: number;
        position: number;
    }>;
    topPages: Array<{
        page: string;
        clicks: number;
        impressions: number;
        ctr: number;
        position: number;
    }>;
    topCountries: Array<{
        countryCode: string;
        clicks: number;
        impressions: number;
        ctr: number;
        position: number;
    }>;
    devices: Array<{
        device: string;
        clicks: number;
        impressions: number;
        ctr: number;
        position: number;
    }>;
    sitemap: {
        path: string;
        lastSubmitted?: string;
        isPending?: boolean;
        errors?: number;
        warnings?: number;
    } | null;
}

export default function AnalyticsDashboardPage() {
    const { role, hasPermission, isLoading: authLoading } = usePermission();
    
    // Main View Tab: 'telemetry' | 'gsc' | 'indexing'
    const [activeTab, setActiveTab] = useState<'telemetry' | 'gsc' | 'indexing'>('telemetry');

    // In-House Telemetry State
    const [range, setRange] = useState<'today' | '7d' | '30d' | 'all'>('7d');
    const [data, setData] = useState<AnalyticsStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    // Google Search Console State
    const [gscDays, setGscDays] = useState<number>(28);
    const [gscData, setGscData] = useState<GscReportData | null>(null);
    const [gscLoading, setGscLoading] = useState(false);
    const [gscError, setGscError] = useState<string | null>(null);

    // Instant Indexing State
    const [indexingUrl, setIndexingUrl] = useState('');
    const [indexingInProgress, setIndexingInProgress] = useState(false);
    const [indexingLogs, setIndexingLogs] = useState<Array<{ timestamp: string; message: string; type: 'info' | 'success' | 'error' }>>([]);

    // ── Fetch In-House Analytics ──────────────────────────────────────────
    const fetchAnalytics = useCallback(async (isSilent = false) => {
        if (!isSilent) setRefreshing(true);
        try {
            const res = await fetch(`/api/analytics/stats?range=${range}`);
            if (res.ok) {
                const json = await res.json();
                if (json.success) {
                    setData(json);
                    setLastUpdated(new Date());
                }
            }
        } catch (error) {
            console.error('Failed to fetch analytics statistics', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [range]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    // Live auto-refresh interval for in-house telemetry
    useEffect(() => {
        if (!autoRefresh || activeTab !== 'telemetry') return;
        const interval = setInterval(() => {
            fetchAnalytics(true);
        }, 15000);
        return () => clearInterval(interval);
    }, [autoRefresh, activeTab, fetchAnalytics]);

    // ── Fetch Google Search Console Report ─────────────────────────────────
    const fetchGscReport = useCallback(async (days: number) => {
        setGscLoading(true);
        setGscError(null);
        try {
            const res = await fetch(`/api/analytics/gsc/report?days=${days}`);
            const json = await res.json();
            if (!res.ok || !json.success) {
                throw new Error(json.error || 'Failed to fetch Search Console data');
            }
            setGscData(json);
        } catch (err: any) {
            console.error('GSC Fetch Error:', err);
            setGscError(err.message || 'Error communicating with Google Search Console');
        } finally {
            setGscLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'gsc' && !gscData && !gscLoading) {
            fetchGscReport(gscDays);
        }
    }, [activeTab, gscData, gscLoading, gscDays, fetchGscReport]);

    // ── Indexing Actions ──────────────────────────────────────────────────
    const addLog = (message: string, type: 'info' | 'success' | 'error') => {
        const timestamp = new Date().toLocaleTimeString();
        setIndexingLogs(prev => [{ timestamp, message, type }, ...prev]);
    };

    const handleInstantIndex = async (targetUrl: string) => {
        if (!targetUrl.trim()) return;
        setIndexingInProgress(true);
        addLog(`Submitting "${targetUrl}" to Google Search Indexing API v3...`, 'info');

        try {
            const res = await fetch('/api/analytics/gsc/index-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: targetUrl, action: 'index' }),
            });
            const resData = await res.json();
            if (!res.ok || !resData.success) {
                throw new Error(resData.error || 'Indexing request failed');
            }
            addLog(`✓ SUCCESS (HTTP ${resData.statusCode}): Published ${resData.url} at ${resData.timestamp}`, 'success');
        } catch (err: any) {
            addLog(`✕ ERROR: ${err.message}`, 'error');
        } finally {
            setIndexingInProgress(false);
        }
    };

    const handleBatchIndex = async (urls: string[], label: string) => {
        setIndexingInProgress(true);
        addLog(`Initiating batch indexing for ${label} (${urls.length} URLs)...`, 'info');

        try {
            const res = await fetch('/api/analytics/gsc/index-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'batch_index', urls }),
            });
            const resData = await res.json();
            if (!res.ok || !resData.success) {
                throw new Error(resData.error || 'Batch indexing request failed');
            }
            resData.results.forEach((r: any) => {
                if (r.status === 'SUCCESS') {
                    addLog(`✓ Published ${r.url} (HTTP ${r.statusCode})`, 'success');
                } else {
                    addLog(`✕ Failed ${r.url}: ${r.error}`, 'error');
                }
            });
            addLog(`Batch complete: Processed ${resData.total} URLs.`, 'info');
        } catch (err: any) {
            addLog(`✕ Batch Error: ${err.message}`, 'error');
        } finally {
            setIndexingInProgress(false);
        }
    };

    const handleSitemapResubmit = async () => {
        setIndexingInProgress(true);
        addLog('Submitting sitemap.xml to Google Search Console API...', 'info');

        try {
            const res = await fetch('/api/analytics/gsc/index-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'sitemap' }),
            });
            const resData = await res.json();
            if (!res.ok || !resData.success) {
                throw new Error(resData.error || 'Sitemap submission failed');
            }
            addLog(`✓ SUCCESS: ${resData.message} (${resData.feedpath})`, 'success');
            if (resData.sitemapStatus) {
                addLog(`✓ Sitemap status: isPending=${resData.sitemapStatus.isPending}, errors=${resData.sitemapStatus.errors || 0}`, 'info');
            }
        } catch (err: any) {
            addLog(`✕ Sitemap Error: ${err.message}`, 'error');
        } finally {
            setIndexingInProgress(false);
        }
    };

    if (authLoading || (loading && !data)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[450px] gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading Analytics & Search Console Command Center...</p>
            </div>
        );
    }

    const isPermitted = role === 'DEVELOPER' || role === 'SUPER_ADMIN' || role === 'ADMIN' || (hasPermission && hasPermission('analytics.view')) || (hasPermission && hasPermission('*'));

    if (!isPermitted) {
        return (
            <div className="p-8 text-center text-red-500 font-bold max-w-xl mx-auto bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900 mt-12">
                Access Denied: Requires Administrator or Developer privileges to view traffic analytics.
            </div>
        );
    }

    const ov = data?.overview || { pageviews: 0, uniqueVisitors: 0, totalSessions: 0, totalClicks: 0, bounceRate: 0, pagesPerSession: 0 };
    const rt = data?.realtime || { activeUsers5m: 0, activeUsers15m: 0, recentEvents: [] };

    const getCountryFlag = (code: string) => {
        if (!code || code === 'UN' || code.length !== 2) return '🌐';
        const codePoints = code
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt(0));
        return String.fromCodePoint(...codePoints);
    };

    return (
        <div className="space-y-6 pb-16">
            {/* Top Navigation & Mode Selector */}
            <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics & Search Console Command Center</h1>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                Live Sync Active
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Unified telemetry: Real-time buyer traffic, Google Search Console keyword queries, and instant indexing engine.
                        </p>
                    </div>

                    {/* Main Category Tabs */}
                    <div className="flex items-center bg-gray-100 dark:bg-gray-800/80 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setActiveTab('telemetry')}
                            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                                activeTab === 'telemetry'
                                    ? 'bg-white dark:bg-dark-card text-primary shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            <Activity className="w-4 h-4 text-emerald-500" />
                            Live Traffic & Real-Time
                        </button>
                        <button
                            onClick={() => setActiveTab('gsc')}
                            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                                activeTab === 'gsc'
                                    ? 'bg-white dark:bg-dark-card text-blue-600 dark:text-blue-400 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            <Search className="w-4 h-4 text-blue-500" />
                            Google Search Console
                        </button>
                        <button
                            onClick={() => setActiveTab('indexing')}
                            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                                activeTab === 'indexing'
                                    ? 'bg-white dark:bg-dark-card text-purple-600 dark:text-purple-400 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            <Send className="w-4 h-4 text-purple-500" />
                            Instant Indexing Suite
                        </button>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════════════
                TAB 1: IN-HOUSE TELEMETRY & LIVE TRAFFIC
               ══════════════════════════════════════════════════════════════════════════ */}
            {activeTab === 'telemetry' && (
                <div className="space-y-6">
                    {/* Range & Auto-refresh Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-xl px-5 py-3 shadow-sm">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Telemetry Range:</span>
                            <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                                {[
                                    { id: 'today', label: 'Today' },
                                    { id: '7d', label: 'Last 7 Days' },
                                    { id: '30d', label: '30 Days' },
                                    { id: 'all', label: 'All Time' },
                                ].map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setRange(t.id as any)}
                                        className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                                            range === t.id
                                                ? 'bg-white dark:bg-dark-card text-primary shadow-sm'
                                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setAutoRefresh(!autoRefresh)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors ${
                                    autoRefresh
                                        ? 'bg-primary/10 text-primary border-primary/30'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                                }`}
                                title="Auto-refresh every 15 seconds"
                            >
                                <Zap className={`w-3.5 h-3.5 ${autoRefresh ? 'text-primary fill-primary' : ''}`} />
                                Auto-live {autoRefresh ? 'On' : 'Off'}
                            </button>

                            <button
                                onClick={() => fetchAnalytics(false)}
                                disabled={refreshing}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 transition-colors"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* Real-time Hero Card + 5 Main KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                        {/* 1. Real-time Live Monitor Card */}
                        <div className="lg:col-span-2 bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800 text-white rounded-2xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between">
                            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 rounded-full bg-white/10 blur-xl"></div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-200">
                                        <span className="relative flex h-2.5 w-2.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-90"></span>
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-300"></span>
                                        </span>
                                        Real-Time Monitor
                                    </span>
                                    <span className="text-[10px] text-emerald-200 bg-white/10 px-2 py-0.5 rounded-full">
                                        Updated {lastUpdated.toLocaleTimeString()}
                                    </span>
                                </div>
                                <div className="mt-4">
                                    <div className="text-4xl font-extrabold tracking-tight">
                                        {rt.activeUsers5m}
                                    </div>
                                    <p className="text-xs text-emerald-100 mt-1 font-medium">
                                        Active visitors on site right now (last 5 min)
                                    </p>
                                </div>
                            </div>

                            <div className="relative z-10 pt-4 mt-4 border-t border-white/15 flex items-center justify-between text-xs text-emerald-100">
                                <span>Active in last 15 min: <strong className="text-white">{rt.activeUsers15m}</strong></span>
                                <Link href="/executive-portal-aelbd/tracking" className="inline-flex items-center gap-1 hover:underline text-white font-semibold">
                                    Tracking Settings <ArrowUpRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>

                        {/* 2. Total Page Views */}
                        <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                                <span className="text-xs font-semibold uppercase tracking-wider">Page Views</span>
                                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                                    <Eye className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="mt-3">
                                <div className="text-2xl font-bold text-gray-900 dark:white">
                                    {ov.pageviews.toLocaleString()}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {ov.pagesPerSession} views / session
                                </p>
                            </div>
                        </div>

                        {/* 3. Unique Visitors */}
                        <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                                <span className="text-xs font-semibold uppercase tracking-wider">Unique Visitors</span>
                                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                                    <Users className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="mt-3">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {ov.uniqueVisitors.toLocaleString()}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Distinct buyers & clients
                                </p>
                            </div>
                        </div>

                        {/* 4. Total Sessions */}
                        <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                                <span className="text-xs font-semibold uppercase tracking-wider">Sessions</span>
                                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                                    <Activity className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="mt-3">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {ov.totalSessions.toLocaleString()}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Bounce rate: {ov.bounceRate}%
                                </p>
                            </div>
                        </div>

                        {/* 5. Inquiries & Interaction Clicks */}
                        <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                                <span className="text-xs font-semibold uppercase tracking-wider">Buyer Actions</span>
                                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                                    <MousePointerClick className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="mt-3">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {ov.totalClicks.toLocaleString()}
                                </div>
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                                    RFQ, Line Sheet & WhatsApp clicks
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Middle Grid: Live Activity Stream + Traffic Sources */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Real-time Live Event Feed (2 Cols) */}
                        <div className="lg:col-span-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-emerald-500" />
                                        Real-Time Visitor Activity Stream
                                    </h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Live stream of recent buyer page visits, locations, and browser sources
                                    </p>
                                </div>
                                <span className="text-xs text-gray-400">Showing latest visits</span>
                            </div>

                            <div className="divide-y divide-gray-100 dark:divide-gray-800 overflow-x-auto">
                                {rt.recentEvents && rt.recentEvents.length > 0 ? (
                                    rt.recentEvents.map(event => (
                                        <div key={event.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                                            <div className="flex items-center gap-3 min-w-[200px]">
                                                <span className="text-xl" title={event.country}>
                                                    {getCountryFlag(event.countryCode)}
                                                </span>
                                                <div>
                                                    <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                                                        <span>{event.city || 'Unknown City'}</span>
                                                        <span className="text-gray-400 font-normal">({event.country})</span>
                                                    </div>
                                                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                                        {event.sourcePlatform || 'Direct'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-[180px]">
                                                <div className="font-mono text-gray-800 dark:text-gray-200 truncate max-w-xs" title={event.pagePath}>
                                                    {event.pagePath}
                                                </div>
                                                <div className="text-[10px] text-gray-400 flex items-center gap-2">
                                                    <span>{event.browser}</span>
                                                    <span>•</span>
                                                    <span className="capitalize">{event.deviceType}</span>
                                                </div>
                                            </div>

                                            <div className="text-right text-[11px] text-gray-400 flex-shrink-0">
                                                {new Date(event.createdAt).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-8 text-center text-gray-500 text-xs">
                                        No recent live visitor logs recorded in the last 15 minutes.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Traffic Sources Breakdown (1 Col) */}
                        <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                                <Share2 className="w-5 h-5 text-indigo-500" />
                                Traffic Channels
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                                Acquisition breakdown by channel
                            </p>

                            <div className="space-y-3">
                                {data?.sources?.categories?.map(cat => (
                                    <div key={cat.key} className="space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-medium text-gray-700 dark:text-gray-300">{cat.name}</span>
                                            <span className="font-bold text-gray-900 dark:text-white">{cat.percentage}% ({cat.count})</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                            <div 
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Top Referrer Platforms</h3>
                                <div className="space-y-2">
                                    {data?.sources?.topPlatforms?.slice(0, 4).map(p => (
                                        <div key={p.platform} className="flex items-center justify-between text-xs">
                                            <span className="text-gray-600 dark:text-gray-300 font-medium">{p.platform}</span>
                                            <span className="text-gray-500 dark:text-gray-400">{p.percentage}% ({p.count})</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Grid: Most Visited Pages + Device Telemetry */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Most Visited Pages */}
                        <div className="lg:col-span-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-amber-500" />
                                        Top Visited Pages & Products
                                    </h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Pages capturing the highest buyer interest
                                    </p>
                                </div>
                            </div>

                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {data?.topPages && data.topPages.length > 0 ? (
                                    data.topPages.map((page, idx) => (
                                        <div key={page.path} className="py-3 flex items-center justify-between gap-4 text-xs">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <span className="font-bold text-gray-400 text-xs w-5">{idx + 1}.</span>
                                                <div className="min-w-0">
                                                    <div className="font-semibold text-gray-900 dark:text-white truncate">
                                                        {page.title || page.path}
                                                    </div>
                                                    <div className="font-mono text-gray-400 text-[11px] truncate">
                                                        {page.path}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right flex items-center gap-4 flex-shrink-0">
                                                <div className="text-right">
                                                    <span className="font-bold text-gray-900 dark:text-white">{page.views}</span>
                                                    <span className="text-[10px] text-gray-400 ml-1">views</span>
                                                </div>
                                                <div className="text-right text-gray-400 text-[11px] hidden sm:block">
                                                    <span>{page.uniqueVisitors} visitors</span>
                                                </div>
                                                <Link href={page.path} target="_blank" className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600">
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-6 text-center text-gray-500 text-xs">No pageview logs available for this period.</div>
                                )}
                            </div>
                        </div>

                        {/* Technology Telemetry */}
                        <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                                    <Laptop className="w-5 h-5 text-cyan-500" />
                                    Device & Technology Insights
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                                    Client hardware & software telemetry
                                </p>

                                <div className="grid grid-cols-3 gap-2 mb-6">
                                    {data?.technology?.devices?.map(d => (
                                        <div key={d.name} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 text-center">
                                            <div className="text-gray-500 dark:text-gray-400 mb-1 flex justify-center">
                                                {d.name === 'Desktop' && <Laptop className="w-4 h-4" />}
                                                {d.name === 'Mobile' && <Smartphone className="w-4 h-4" />}
                                                {d.name === 'Tablet' && <Tablet className="w-4 h-4" />}
                                            </div>
                                            <div className="text-sm font-bold text-gray-900 dark:text-white">{d.percentage}%</div>
                                            <div className="text-[10px] text-gray-400">{d.name}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mb-4">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Browsers</h3>
                                    <div className="space-y-2">
                                        {data?.technology?.browsers?.slice(0, 4).map(b => (
                                            <div key={b.browser} className="flex items-center justify-between text-xs">
                                                <span className="text-gray-800 dark:text-gray-200 font-medium">{b.browser}</span>
                                                <span className="text-gray-500 dark:text-gray-400">{b.percentage}% ({b.count})</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-400">
                                <span>Total DB Records: <strong>{data?.totalDatabaseRecords || 0}</strong></span>
                                <span className="text-emerald-500 font-semibold flex items-center gap-1">
                                    <ShieldCheck className="w-3.5 h-3.5" /> 100% GDPR Compliant
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════════════
                TAB 2: GOOGLE SEARCH CONSOLE & ORGANIC SEO PERFORMANCE
               ══════════════════════════════════════════════════════════════════════════ */}
            {activeTab === 'gsc' && (
                <div className="space-y-6">
                    {/* GSC Controls Header */}
                    <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                                <Search className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-base font-bold text-gray-900 dark:text-white">Google Search Console Analytics</h2>
                                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold">
                                        sc-domain:aelbd.net
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Live organic search telemetry, search query rankings, and impressions directly from Google API
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Date Range Selector */}
                            <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                                {[
                                    { days: 7, label: '7 Days' },
                                    { days: 28, label: '28 Days' },
                                    { days: 90, label: '90 Days' },
                                ].map(btn => (
                                    <button
                                        key={btn.days}
                                        onClick={() => {
                                            setGscDays(btn.days);
                                            fetchGscReport(btn.days);
                                        }}
                                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                            gscDays === btn.days
                                                ? 'bg-white dark:bg-dark-card text-blue-600 dark:text-blue-400 shadow-sm'
                                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                    >
                                        {btn.label}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => fetchGscReport(gscDays)}
                                disabled={gscLoading}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${gscLoading ? 'animate-spin' : ''}`} />
                                Sync GSC Data
                            </button>
                        </div>
                    </div>

                    {/* Error Banner if any */}
                    {gscError && (
                        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300">Search Console Notice</h3>
                                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">{gscError}</p>
                            </div>
                        </div>
                    )}

                    {/* GSC 4 Hero KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center justify-between text-gray-500">
                                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Total Organic Clicks</span>
                                <MousePointerClick className="w-4 h-4 text-blue-500" />
                            </div>
                            <div className="text-3xl font-extrabold text-gray-900 dark:text-white mt-3">
                                {gscData ? gscData.overview.totalClicks.toLocaleString() : (gscLoading ? '...' : '0')}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Direct search visits from Google</p>
                        </div>

                        <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center justify-between text-gray-500">
                                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Search Impressions</span>
                                <Eye className="w-4 h-4 text-purple-500" />
                            </div>
                            <div className="text-3xl font-extrabold text-gray-900 dark:text-white mt-3">
                                {gscData ? gscData.overview.totalImpressions.toLocaleString() : (gscLoading ? '...' : '0')}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Times AEL appeared in Google SERP</p>
                        </div>

                        <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center justify-between text-gray-500">
                                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Average CTR</span>
                                <Percent className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div className="text-3xl font-extrabold text-gray-900 dark:text-white mt-3">
                                {gscData ? `${gscData.overview.overallCtr}%` : (gscLoading ? '...' : '0%')}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Organic Click-Through Rate</p>
                        </div>

                        <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center justify-between text-gray-500">
                                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Average Ranking</span>
                                <TrendingUp className="w-4 h-4 text-amber-500" />
                            </div>
                            <div className="text-3xl font-extrabold text-gray-900 dark:text-white mt-3">
                                {gscData ? `#${gscData.overview.averagePosition}` : (gscLoading ? '...' : '#0.0')}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Average position across queries</p>
                        </div>
                    </div>

                    {/* Top Queries Table & Top Landing Pages Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Google Search Queries (Keywords) */}
                        <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-amber-500" />
                                        Top Google Search Queries
                                    </h3>
                                    <p className="text-xs text-gray-500">Search keywords driving buyers to AEL</p>
                                </div>
                                <span className="text-xs text-gray-400">Last {gscDays} Days</span>
                            </div>

                            <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[460px] overflow-y-auto">
                                {gscData?.topQueries && gscData.topQueries.length > 0 ? (
                                    gscData.topQueries.map((q, idx) => (
                                        <div key={q.query} className="py-3 flex items-center justify-between gap-3 text-xs">
                                            <div className="min-w-0 flex-1">
                                                <div className="font-semibold text-gray-900 dark:text-white truncate">
                                                    {q.query}
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-400">
                                                    <span>{q.impressions.toLocaleString()} views</span>
                                                    <span>•</span>
                                                    <span>{q.ctr}% CTR</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 flex-shrink-0">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                    q.position <= 3
                                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                                                        : q.position <= 10
                                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400'
                                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                                }`}>
                                                    Pos #{q.position}
                                                </span>
                                                <div className="text-right min-w-[50px]">
                                                    <span className="font-bold text-gray-900 dark:text-white">{q.clicks}</span>
                                                    <span className="text-[10px] text-gray-400 ml-1">clicks</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center text-gray-400 text-xs">
                                        {gscLoading ? 'Fetching Search Console queries...' : 'No keyword query data available for this range.'}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Top Search Landing Pages */}
                        <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-blue-500" />
                                        Top Search Landing Pages
                                    </h3>
                                    <p className="text-xs text-gray-500">Most clicked pages in Google Search</p>
                                </div>
                                <span className="text-xs text-gray-400">Click to Re-Index</span>
                            </div>

                            <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[460px] overflow-y-auto">
                                {gscData?.topPages && gscData.topPages.length > 0 ? (
                                    gscData.topPages.map(p => (
                                        <div key={p.page} className="py-3 flex items-center justify-between gap-3 text-xs">
                                            <div className="min-w-0 flex-1">
                                                <div className="font-mono text-gray-800 dark:text-gray-200 truncate" title={p.page}>
                                                    {p.page.replace('https://aelbd.net', '') || '/'}
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-400">
                                                    <span>{p.impressions.toLocaleString()} views</span>
                                                    <span>•</span>
                                                    <span>Pos #{p.position}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 flex-shrink-0">
                                                <div className="text-right">
                                                    <span className="font-bold text-gray-900 dark:text-white">{p.clicks}</span>
                                                    <span className="text-[10px] text-gray-400 ml-1">clicks</span>
                                                </div>
                                                <button
                                                    onClick={() => handleInstantIndex(p.page)}
                                                    disabled={indexingInProgress}
                                                    className="px-2 py-1 text-[11px] font-semibold rounded bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 hover:bg-purple-100 border border-purple-200 dark:border-purple-800 transition-colors"
                                                    title="Push instant update notification to Google Indexing API"
                                                >
                                                    Index
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center text-gray-400 text-xs">
                                        {gscLoading ? 'Fetching Search Console landing pages...' : 'No landing page data available for this range.'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Geography & Devices Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Organic Countries */}
                        <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                                <MapPin className="w-4 h-4 text-rose-500" />
                                Top Search Countries
                            </h3>
                            <div className="space-y-2">
                                {gscData?.topCountries?.slice(0, 5).map(c => (
                                    <div key={c.countryCode} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <span>{getCountryFlag(c.countryCode)}</span>
                                            <span className="font-semibold text-gray-800 dark:text-gray-200">{c.countryCode}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-500">
                                            <span>{c.impressions} impr</span>
                                            <span className="font-bold text-gray-900 dark:text-white">{c.clicks} clicks</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Search Devices */}
                        <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                                <Laptop className="w-4 h-4 text-cyan-500" />
                                Search Devices
                            </h3>
                            <div className="space-y-3">
                                {gscData?.devices?.map(d => (
                                    <div key={d.device} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            {d.device === 'DESKTOP' && <Laptop className="w-4 h-4 text-gray-400" />}
                                            {d.device === 'MOBILE' && <Smartphone className="w-4 h-4 text-gray-400" />}
                                            {d.device === 'TABLET' && <Tablet className="w-4 h-4 text-gray-400" />}
                                            <span className="font-medium text-gray-800 dark:text-gray-200 capitalize">{d.device.toLowerCase()}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-500">
                                            <span>{d.ctr}% CTR</span>
                                            <span className="font-bold text-gray-900 dark:text-white">{d.clicks} clicks</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Sitemap Status */}
                        <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                                    <FileText className="w-4 h-4 text-emerald-500" />
                                    Google Sitemap Status
                                </h3>
                                <p className="text-xs text-gray-500 mb-3 font-mono">https://aelbd.net/sitemap.xml</p>

                                <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                                    <div className="flex justify-between">
                                        <span>Status:</span>
                                        <span className="text-emerald-500 font-semibold flex items-center gap-1">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Success
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Errors:</span>
                                        <strong className="text-gray-900 dark:text-white">{gscData?.sitemap?.errors || 0}</strong>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Warnings:</span>
                                        <strong className="text-gray-900 dark:text-white">{gscData?.sitemap?.warnings || 0}</strong>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleSitemapResubmit}
                                disabled={indexingInProgress}
                                className="mt-4 w-full py-2 text-xs font-bold rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors"
                            >
                                Resubmit Sitemap to Google
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════════════
                TAB 3: GOOGLE INSTANT INDEXING ENGINE
               ══════════════════════════════════════════════════════════════════════════ */}
            {activeTab === 'indexing' && (
                <div className="space-y-6">
                    {/* Instant Indexing Hero Input Card */}
                    <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                                <Send className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Google Web Search Indexing API v3</h2>
                                <p className="text-xs text-gray-500">
                                    Notify Googlebot instantly to crawl and re-index updated pages within minutes (Bypasses regular weekly crawler delays).
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-col sm:flex-row gap-3">
                            <input
                                type="text"
                                placeholder="Enter page path or full URL (e.g. /products/woven or https://aelbd.net/global-sourcing)"
                                value={indexingUrl}
                                onChange={e => setIndexingUrl(e.target.value)}
                                className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <button
                                onClick={() => handleInstantIndex(indexingUrl)}
                                disabled={indexingInProgress || !indexingUrl.trim()}
                                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white shadow-sm transition-colors flex items-center justify-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                Publish URL to Google
                            </button>
                        </div>
                    </div>

                    {/* Quick One-Click Batch Indexing Hubs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* 1. Category Hubs */}
                        <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Core Category Pillars</h3>
                                <p className="text-xs text-gray-500 mt-1">3 Manufacturing Hubs</p>
                                <ul className="text-[11px] text-gray-400 mt-2 space-y-1">
                                    <li>• /products/woven</li>
                                    <li>• /products/knitwear</li>
                                    <li>• /products/sweater</li>
                                </ul>
                            </div>
                            <button
                                onClick={() => handleBatchIndex([
                                    'https://aelbd.net/products/woven',
                                    'https://aelbd.net/products/knitwear',
                                    'https://aelbd.net/products/sweater',
                                ], 'Category Hubs')}
                                disabled={indexingInProgress}
                                className="mt-4 w-full py-2 text-xs font-bold rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors"
                            >
                                Index 3 Categories
                            </button>
                        </div>

                        {/* 2. Global Sourcing & Conversion Hubs */}
                        <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Conversion Hubs</h3>
                                <p className="text-xs text-gray-500 mt-1">4 Lead Capture Pages</p>
                                <ul className="text-[11px] text-gray-400 mt-2 space-y-1">
                                    <li>• /global-sourcing</li>
                                    <li>• /request-quote</li>
                                    <li>• /contact</li>
                                    <li>• /about</li>
                                </ul>
                            </div>
                            <button
                                onClick={() => handleBatchIndex([
                                    'https://aelbd.net/global-sourcing',
                                    'https://aelbd.net/request-quote',
                                    'https://aelbd.net/contact',
                                    'https://aelbd.net/about',
                                ], 'Conversion Hubs')}
                                disabled={indexingInProgress}
                                className="mt-4 w-full py-2 text-xs font-bold rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-colors"
                            >
                                Index 4 Hubs
                            </button>
                        </div>

                        {/* 3. B2B Compliance & Sourcing Guides */}
                        <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Compliance Guides</h3>
                                <p className="text-xs text-gray-500 mt-1">4 GSC-Targeted Articles</p>
                                <ul className="text-[11px] text-gray-400 mt-2 space-y-1">
                                    <li>• BSCI vs SEDEX</li>
                                    <li>• HIGG vs SMETA</li>
                                    <li>• Sedex Audit Duplication</li>
                                    <li>• Sourcing Buyer Guide</li>
                                </ul>
                            </div>
                            <button
                                onClick={() => handleBatchIndex([
                                    'https://aelbd.net/blog/bsci-vs-sedex-compliance-standards-guide',
                                    'https://aelbd.net/blog/higg-vs-smeta-social-audit-standard-fashion-supply-chain',
                                    'https://aelbd.net/blog/how-sedex-membership-reduces-supplier-audit-duplication',
                                    'https://aelbd.net/blog/apparel-sourcing-company-bangladesh-buyer-guide',
                                ], 'B2B Blog Guides')}
                                disabled={indexingInProgress}
                                className="mt-4 w-full py-2 text-xs font-bold rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-100 transition-colors"
                            >
                                Index 4 Guides
                            </button>
                        </div>

                        {/* 4. Complete Priority Suite (13 URLs) */}
                        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-white">Full SEO Suite</h3>
                                <p className="text-xs text-purple-200 mt-1">All 13 High-Intent Pages</p>
                                <p className="text-[11px] text-purple-100 mt-2">
                                    Submits Home, Catalog, 3 Category Hubs, Global Sourcing, and 4 Guides simultaneously.
                                </p>
                            </div>
                            <button
                                onClick={() => handleBatchIndex([
                                    'https://aelbd.net/',
                                    'https://aelbd.net/products',
                                    'https://aelbd.net/global-sourcing',
                                    'https://aelbd.net/about',
                                    'https://aelbd.net/contact',
                                    'https://aelbd.net/request-quote',
                                    'https://aelbd.net/products/woven',
                                    'https://aelbd.net/products/knitwear',
                                    'https://aelbd.net/products/sweater',
                                    'https://aelbd.net/blog/bsci-vs-sedex-compliance-standards-guide',
                                    'https://aelbd.net/blog/higg-vs-smeta-social-audit-standard-fashion-supply-chain',
                                    'https://aelbd.net/blog/how-sedex-membership-reduces-supplier-audit-duplication',
                                    'https://aelbd.net/blog/apparel-sourcing-company-bangladesh-buyer-guide',
                                ], 'Full SEO Suite')}
                                disabled={indexingInProgress}
                                className="mt-4 w-full py-2 text-xs font-bold rounded-xl bg-white text-purple-700 hover:bg-purple-50 transition-colors"
                            >
                                Index All 13 Pages
                            </button>
                        </div>
                    </div>

                    {/* Live Indexing Activity Console */}
                    <div className="bg-gray-900 rounded-2xl p-6 text-white border border-gray-800 shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                                <h3 className="text-sm font-bold font-mono">Indexing API Live Activity Console</h3>
                            </div>
                            <button
                                onClick={() => setIndexingLogs([])}
                                className="text-[11px] text-gray-400 hover:text-white transition-colors"
                            >
                                Clear Console
                            </button>
                        </div>

                        <div className="bg-gray-950 rounded-xl p-4 font-mono text-xs max-h-60 overflow-y-auto space-y-1.5 border border-gray-800">
                            {indexingLogs.length === 0 ? (
                                <p className="text-gray-500 italic">No indexing calls made in this session. Click any action above to dispatch Google Indexing requests.</p>
                            ) : (
                                indexingLogs.map((log, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <span className="text-gray-500 text-[10px] min-w-[70px]">{log.timestamp}</span>
                                        <span className={
                                            log.type === 'success' ? 'text-emerald-400' :
                                            log.type === 'error' ? 'text-rose-400 font-bold' :
                                            'text-blue-300'
                                        }>
                                            {log.message}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
