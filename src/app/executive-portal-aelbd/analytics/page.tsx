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
    Percent
} from 'lucide-react';
import Link from 'next/link';

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

export default function AnalyticsDashboardPage() {
    const { role, hasPermission, isLoading: authLoading } = usePermission();
    const [range, setRange] = useState<'today' | '7d' | '30d' | 'all'>('7d');
    const [data, setData] = useState<AnalyticsStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

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

    // Live auto-refresh interval (every 15 seconds)
    useEffect(() => {
        if (!autoRefresh) return;
        const interval = setInterval(() => {
            fetchAnalytics(true);
        }, 15000);
        return () => clearInterval(interval);
    }, [autoRefresh, fetchAnalytics]);

    if (authLoading || (loading && !data)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[450px] gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading in-house analytics & real-time telemetry...</p>
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

    const formatTimeAgo = (dateStr: string) => {
        const diffMs = Date.now() - new Date(dateStr).getTime();
        const diffSec = Math.floor(diffMs / 1000);
        if (diffSec < 60) return `${diffSec}s ago`;
        const diffMin = Math.floor(diffSec / 60);
        if (diffMin < 60) return `${diffMin}m ago`;
        const diffHr = Math.floor(diffMin / 60);
        if (diffHr < 24) return `${diffHr}h ago`;
        return `${Math.floor(diffHr / 24)}d ago`;
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Top Header & Range Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">In-House Analytics & Traffic</h1>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Live Telemetry Active
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        High-performance first-party traffic logging with IP geolocation, real-time sessions, and buyer journeys.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Date Range Selector */}
                    <div className="flex items-center bg-gray-100 dark:bg-gray-800/70 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
                        {[
                            { id: 'today', label: 'Today' },
                            { id: '7d', label: 'Last 7 Days' },
                            { id: '30d', label: '30 Days' },
                            { id: 'all', label: 'All Time' },
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setRange(t.id as any)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                    range === t.id
                                        ? 'bg-white dark:bg-dark-card text-primary shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Auto-refresh toggle */}
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

                    {/* Manual Refresh Button */}
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
                            Integration Settings <ArrowUpRight className="w-3.5 h-3.5" />
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
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
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
                            RFQ, Catalog & WhatsApp clicks
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
                        <span className="text-xs text-gray-400">Showing latest events</span>
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

                                    <div className="text-right min-w-[80px]">
                                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                            {event.eventType}
                                        </span>
                                        <div className="text-[10px] text-gray-400 mt-1">
                                            {formatTimeAgo(event.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center text-gray-500 text-xs">
                                No recent activity yet. Telemetry will update as visitors explore the site.
                            </div>
                        )}
                    </div>
                </div>

                {/* Traffic Sources Breakdown (1 Col) */}
                <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                            <Share2 className="w-5 h-5 text-blue-500" />
                            Traffic Sources
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                            Channels driving buyer traffic to Apparel Emporium
                        </p>

                        <div className="space-y-4">
                            {data?.sources?.categories?.map(src => (
                                <div key={src.key}>
                                    <div className="flex justify-between text-xs font-semibold mb-1">
                                        <span className="text-gray-800 dark:text-gray-200">{src.name}</span>
                                        <span className="text-gray-500 dark:text-gray-400">{src.percentage}% ({src.count})</span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{ width: `${Math.max(src.percentage, 3)}%`, backgroundColor: src.color }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Top Referral Platforms</h3>
                        <div className="space-y-2">
                            {data?.sources?.topPlatforms?.slice(0, 5).map(plat => (
                                <div key={plat.platform} className="flex items-center justify-between text-xs text-gray-700 dark:text-gray-300">
                                    <span className="font-medium truncate max-w-[160px]">{plat.platform}</span>
                                    <span className="text-gray-400">{plat.count} hits ({plat.percentage}%)</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Geographical Distribution: Countries & Cities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Countries */}
                <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Globe className="w-5 h-5 text-indigo-500" />
                                Geographical Distribution (Countries)
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Visitor origin resolved via GeoIP and Edge headers
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3.5">
                        {data?.geography?.topCountries && data.geography.topCountries.length > 0 ? (
                            data.geography.topCountries.map(c => (
                                <div key={c.code} className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="text-base">{getCountryFlag(c.code)}</span>
                                            <span className="font-semibold text-gray-800 dark:text-gray-200">{c.country}</span>
                                        </div>
                                        <span className="text-gray-500 dark:text-gray-400">
                                            <strong>{c.views}</strong> views • {c.visitors} visitors ({c.percentage}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full"
                                            style={{ width: `${Math.max(c.percentage, 4)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-6 text-center text-gray-500 text-xs">
                                No geographical data logged yet for this time range.
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Cities */}
                <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-rose-500" />
                                Top Cities
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Specific urban hubs engaging with your apparel export catalog
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {data?.geography?.topCities && data.geography.topCities.length > 0 ? (
                            data.geography.topCities.map(city => (
                                <div
                                    key={`${city.city}-${city.code}`}
                                    className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 flex items-center justify-between text-xs"
                                >
                                    <div className="flex items-center gap-2">
                                        <span>{getCountryFlag(city.code)}</span>
                                        <div>
                                            <div className="font-semibold text-gray-800 dark:text-gray-200">{city.city}</div>
                                            <div className="text-[10px] text-gray-400">{city.country}</div>
                                        </div>
                                    </div>
                                    <span className="font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700">
                                        {city.count} hits
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-2 py-6 text-center text-gray-500 text-xs">
                                City data will populate as visitors browse from diverse regional locations.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Grid: Most Visited Pages + User Journey Intent + Technology Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Most Visited Pages (1.5 col equivalent) */}
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

                {/* Technology: Device, Browser & OS (1 col) */}
                <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                            <Laptop className="w-5 h-5 text-cyan-500" />
                            Device & Browser Insights
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                            Client hardware & software telemetry
                        </p>

                        {/* Device Types */}
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

                        {/* Top Browsers */}
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

                        {/* Top Operating Systems */}
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Operating Systems</h3>
                            <div className="space-y-2">
                                {data?.technology?.os?.slice(0, 4).map(o => (
                                    <div key={o.os} className="flex items-center justify-between text-xs">
                                        <span className="text-gray-800 dark:text-gray-200 font-medium">{o.os}</span>
                                        <span className="text-gray-500 dark:text-gray-400">{o.percentage}% ({o.count})</span>
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
    );
}
