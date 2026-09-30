'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    Settings,
    RefreshCw,
    Box,
    Database,
    Trash2,
    ShieldAlert,
    Cpu,
    CheckCircle2,
    Terminal,
    GitBranch,
    GitPullRequest,
    ExternalLink,
    Zap,
    DownloadCloud,
    Archive,
    FolderArchive,
    FileSpreadsheet,
    HardDrive,
    Upload,
    Wrench,
    FileJson,
    Layers,
    Users,
    Package
} from 'lucide-react';

export default function MaintenancePage() {
    const { data: session } = useSession();
    const userRole = (session?.user as any)?.role;
    const canManage = userRole === 'DEVELOPER' || userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';

    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [backupStats, setBackupStats] = useState<{
        productCount: number;
        userCount: number;
        rfqCount: number;
        inquiryCount: number;
        imageCount: number;
        mediaSizeBytes: number;
        dbSizeBytes: number;
        dbLastModified: string | null;
    } | null>(null);

    const [versionInfo, setVersionInfo] = useState<{
        currentVersion: string;
        latestVersion: string;
        currentCommit?: string;
        latestCommit?: string;
        latestCommitMessage?: string;
        latestCommitDate?: string;
        updateAvailable: boolean;
        changelog: string;
    } | null>(null);

    const loadBackupStats = async () => {
        try {
            const res = await fetch('/api/backup?type=stats');
            if (res.ok) {
                const data = await res.json();
                if (data.stats) setBackupStats(data.stats);
            }
        } catch { }
    };

    useEffect(() => {
        loadBackupStats();
    }, []);

    const runCategoryRepair = async () => {
        if (!confirm('Run Automated Category Taxonomy & Relation Repair? This will verify all 231 manufacturing categories and ensure all products are properly linked to their parent hierarchy.')) return;
        setLoading(true);
        setLogs(prev => [...prev, '🔄 Starting Automated Category & Taxonomy Relation Repair...']);
        try {
            const res = await fetch('/api/categories/repair', { method: 'POST' });
            const data = await res.json();
            if (res.ok && data.success) {
                setLogs(prev => [...prev, `✅ Category Repair Complete: ${data.message}`]);
                await loadBackupStats();
            } else {
                setLogs(prev => [...prev, `❌ Category Repair Failed: ${data.error || 'Unknown error'}`]);
            }
        } catch (e: any) {
            setLogs(prev => [...prev, `❌ Network Exception: ${String(e)}`]);
        }
        setLoading(false);
    };

    const handleRestoreDatabase = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!confirm(`⚠️ DANGER: Are you sure you want to restore database from "${file.name}"? A safety backup of the current database will be saved first.`)) {
            e.target.value = '';
            return;
        }

        setLoading(true);
        setLogs(prev => [...prev, `📦 Uploading and restoring database ledger from "${file.name}"...`]);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/backup', { method: 'POST', body: formData });
            const data = await res.json();
            if (res.ok && data.success) {
                setLogs(prev => [...prev, `✅ Database Restored Successfully: ${data.message}`]);
                await loadBackupStats();
            } else {
                setLogs(prev => [...prev, `❌ Restore Failed: ${data.error || 'Unknown error'}`]);
            }
        } catch (e: any) {
            setLogs(prev => [...prev, `❌ Network Exception: ${String(e)}`]);
        }
        setLoading(false);
        e.target.value = '';
    };

    const checkUpdates = async () => {
        setLoading(true);
        setLogs(prev => [...prev, '🔍 Querying GitHub repository (rmrecap/APPAREL-EMPORIUM)...']);
        try {
            const res = await fetch('/api/update'); // GET
            if (res.ok) {
                const data = await res.json();
                setVersionInfo(data);
                setLogs(prev => [
                    ...prev,
                    `📌 Current Local Version: ${data.currentVersion} (${data.currentCommit || 'local'})`,
                    `🌐 Latest GitHub Version: ${data.latestVersion} (${data.latestCommit || 'main'})`,
                ]);

                if (data.latestCommitMessage) {
                    setLogs(prev => [...prev, `📝 Latest Remote Commit: "${data.latestCommitMessage}"`]);
                }

                if (data.updateAvailable) {
                    setLogs(prev => [
                        ...prev,
                        '✨ New update is available on GitHub! Click "Update Now (Auto-Deploy)" to apply changes.',
                    ]);
                } else {
                    setLogs(prev => [
                        ...prev,
                        '✅ System is completely synchronized with GitHub main branch.',
                    ]);
                }
            } else {
                setLogs(prev => [...prev, `❌ Failed to fetch updates from server.`]);
            }
        } catch (error) {
            setLogs(prev => [...prev, `❌ Error checking updates: ${String(error)}`]);
        }
        setLoading(false);
    };

    const runCommand = async (action: string) => {
        const confirmMsg =
            action === 'full' || action === 'auto-deploy'
                ? 'Are you sure you want to trigger Auto-Deploy? This will pull latest code from GitHub, install dependencies, sync database schema, build Next.js, and reload PM2.'
                : `Are you sure you want to run [${action}]? This might disrupt active user connections momentarily.`;

        if (!confirm(confirmMsg)) return;

        setLoading(true);
        setLogs(prev => [
            ...prev,
            `🚀 Starting command pipeline [${action}]... Please wait, this may take 15-45 seconds.`,
        ]);

        try {
            const res = await fetch(`/api/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });
            const data = await res.json();

            if (res.ok) {
                setLogs(prev => [
                    ...prev,
                    '✅ Success:',
                    data.message || 'Action completed successfully',
                    data.details ? `Output:\n${data.details}` : '',
                ]);
                // Refresh update info after deployment
                if (action === 'full' || action === 'auto-deploy' || action === 'pull-only') {
                    await checkUpdates();
                }
            } else {
                setLogs(prev => [
                    ...prev,
                    '❌ Execution Error:',
                    data.error || data.message || 'Command failed',
                    data.details ? `Details:\n${data.details}` : '',
                ]);
            }
        } catch (error) {
            setLogs(prev => [...prev, `❌ Network Exception: ${String(error)}`]);
        }
        setLoading(false);
    };

    if (session && !canManage) {
        return (
            <div className="p-6">
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center">
                    <ShieldAlert className="w-5 h-5 mr-2" />
                    <h1 className="text-xl font-bold">Access Denied: DEVELOPER or SUPER_ADMIN role required.</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black flex items-center gap-3 text-slate-900 dark:text-white">
                        <Settings className="w-8 h-8 text-amber-500" />
                        System Maintenance & Auto-Deploy
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Automated GitHub CI/CD sync, database maintenance, cache purge, and server management for Hostinger VPS.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Update System */}
                <div className="bg-white dark:bg-[#151D2C] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3 mb-4">
                            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                                <RefreshCw className="w-5 h-5 text-blue-500" />
                                Hostinger Auto-Deploy Engine
                            </h2>
                            <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-md flex items-center gap-1">
                                <GitBranch className="w-3.5 h-3.5 text-amber-500" />
                                origin/main
                            </span>
                        </div>

                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5">
                                    <span className="text-[11px] font-bold text-slate-500 uppercase block tracking-wider">
                                        Current Version
                                    </span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                                            {versionInfo?.currentVersion || 'v1.0.0'}
                                        </span>
                                        {versionInfo?.currentCommit && (
                                            <span className="text-[10px] font-mono bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-semibold">
                                                {versionInfo.currentCommit}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="p-3 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5">
                                    <span className="text-[11px] font-bold text-slate-500 uppercase block tracking-wider">
                                        GitHub Main
                                    </span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                                            {versionInfo?.latestVersion || 'Checking...'}
                                        </span>
                                        {versionInfo?.latestCommit && (
                                            <span className="text-[10px] font-mono bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded font-semibold">
                                                {versionInfo.latestCommit}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={checkUpdates}
                                disabled={loading}
                                className="w-full bg-slate-900 dark:bg-white/10 hover:bg-slate-800 dark:hover:bg-white/15 text-white p-3 rounded-xl transition font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:bg-slate-400 active:scale-[0.99]"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                Check for Updates from GitHub
                            </button>

                            {versionInfo?.updateAvailable && (
                                <div className="mt-4 p-4 border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/80 dark:bg-emerald-950/20 rounded-xl space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-emerald-800 dark:text-emerald-300 font-black text-sm flex items-center gap-2">
                                            <span className="flex h-2.5 w-2.5 relative">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                            </span>
                                            Update Available ({versionInfo.latestCommit || 'New Commits'})
                                        </h3>
                                        <span className="text-[10px] font-bold bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-200 px-2 py-0.5 rounded-full">
                                            Ready to Deploy
                                        </span>
                                    </div>

                                    {versionInfo.latestCommitMessage && (
                                        <p className="text-xs text-emerald-900 dark:text-emerald-200 font-mono bg-white dark:bg-black/30 p-2.5 rounded-lg border border-emerald-100 dark:border-white/5 line-clamp-2">
                                            {versionInfo.latestCommitMessage}
                                        </p>
                                    )}

                                    <div className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-[#101726] p-3 rounded-lg border border-slate-200 dark:border-white/10 max-h-28 overflow-y-auto font-mono whitespace-pre-wrap">
                                        {versionInfo.changelog}
                                    </div>

                                    <button
                                        onClick={() => runCommand('full')}
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white p-3 rounded-xl transition font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-98"
                                    >
                                        <Zap className="w-4 h-4 fill-white" />
                                        Update Now (Auto-Deploy to Hostinger)
                                    </button>
                                </div>
                            )}

                            {/* Direct Force Sync Button */}
                            <div className="pt-2">
                                <button
                                    onClick={() => runCommand('full')}
                                    disabled={loading}
                                    className="w-full text-left p-2.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-950/10 transition flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 group"
                                >
                                    <span className="flex items-center gap-2 font-semibold group-hover:text-amber-600 dark:group-hover:text-amber-400">
                                        <DownloadCloud className="w-4 h-4" />
                                        Force Sync & Rebuild from GitHub
                                    </span>
                                    <span className="text-[10px] font-mono text-slate-400">git pull & build</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-white/5 mt-4">
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            GitHub CI/CD Action is also configured to auto-deploy on every push to main.
                        </p>
                    </div>
                </div>

                {/* Quick Fix Actions */}
                <div className="bg-white dark:bg-[#151D2C] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 border-b dark:border-white/10 pb-3 text-slate-900 dark:text-white">
                        <Cpu className="w-5 h-5 text-indigo-500" />
                        Quick Server Utilities <span className="text-[11px] text-amber-500 ml-2 font-normal font-mono">(Admin Tools)</span>
                    </h2>

                    <div className="space-y-2.5">
                        <button
                            onClick={() => runCommand('pull-only')}
                            disabled={loading}
                            className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl transition flex items-center justify-between group disabled:opacity-50"
                        >
                            <span className="flex items-center gap-3 font-semibold text-xs text-slate-700 dark:text-slate-300 group-hover:text-indigo-600">
                                <GitPullRequest className="w-4 h-4" /> Quick Git Fetch & Reset
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">git reset --hard</span>
                        </button>

                        <button
                            onClick={() => runCommand('rebuild')}
                            disabled={loading}
                            className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl transition flex items-center justify-between group disabled:opacity-50"
                        >
                            <span className="flex items-center gap-3 font-semibold text-xs text-slate-700 dark:text-slate-300 group-hover:text-indigo-600">
                                <Box className="w-4 h-4" /> Rebuild Application
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">npm run build</span>
                        </button>

                        <button
                            onClick={() => runCommand('restart')}
                            disabled={loading}
                            className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl transition flex items-center justify-between group disabled:opacity-50"
                        >
                            <span className="flex items-center gap-3 font-semibold text-xs text-slate-700 dark:text-slate-300 group-hover:text-amber-600">
                                <RefreshCw className="w-4 h-4" /> Restart PM2 Process
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">pm2 reload</span>
                        </button>

                        <button
                            onClick={() => runCommand('db')}
                            disabled={loading}
                            className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl transition flex items-center justify-between group disabled:opacity-50"
                        >
                            <span className="flex items-center gap-3 font-semibold text-xs text-slate-700 dark:text-slate-300 group-hover:text-blue-600">
                                <Database className="w-4 h-4" /> Update Database Schema
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">prisma db push</span>
                        </button>

                        <button
                            onClick={() => runCommand('clear-cache')}
                            disabled={loading}
                            className="w-full text-left p-3 hover:bg-red-50 dark:hover:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl transition flex items-center justify-between group disabled:opacity-50"
                        >
                            <span className="flex items-center gap-3 font-semibold text-xs text-red-600 group-hover:text-red-700">
                                <Trash2 className="w-4 h-4" /> Clear Next.js Build Cache
                            </span>
                            <span className="text-[11px] font-mono text-red-400">rm -rf .next/cache</span>
                        </button>
                    </div>
                </div>

                {/* Performance & Optimization System */}
                <div className="md:col-span-2 bg-gradient-to-br from-slate-900 via-stone-900 to-indigo-950 p-6 sm:p-8 rounded-2xl shadow-xl border border-white/10 overflow-hidden relative">
                    <div className="relative z-10">
                        <div className="mb-6">
                            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                <span className="p-2 bg-amber-500/20 rounded-xl">
                                    <Zap className="w-5 h-5 text-amber-400" />
                                </span>
                                Hostinger Production Optimization Suite
                            </h2>
                            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl font-medium">
                                Trigger instant cache flushes, media optimization, and database tuning directly without needing SSH terminal access.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 hover:border-amber-400/40 transition-all flex flex-col justify-between">
                                <div>
                                    <h3 className="text-white text-sm font-bold mb-1 flex items-center gap-2">
                                        <Database className="w-4 h-4 text-blue-400" /> Database Tuning
                                    </h3>
                                    <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
                                        Sync schema without regenerating client to keep database fast and responsive.
                                    </p>
                                </div>
                                <button
                                    onClick={() => runCommand('db-optimize')}
                                    disabled={loading}
                                    className="w-full py-2 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white rounded-lg border border-blue-500/30 font-bold text-xs uppercase transition-all disabled:opacity-50"
                                >
                                    Run DB Sync
                                </button>
                            </div>

                            <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 hover:border-emerald-400/40 transition-all flex flex-col justify-between">
                                <div>
                                    <h3 className="text-white text-sm font-bold mb-1 flex items-center gap-2">
                                        <Box className="w-4 h-4 text-emerald-400" /> Media & Images
                                    </h3>
                                    <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
                                        Purge Next.js image cache to force re-render fresh product images and banners.
                                    </p>
                                </div>
                                <button
                                    onClick={() => runCommand('media-optimize')}
                                    disabled={loading}
                                    className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded-lg border border-emerald-500/30 font-bold text-xs uppercase transition-all disabled:opacity-50"
                                >
                                    Purge Image Cache
                                </button>
                            </div>

                            <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 hover:border-amber-400/40 transition-all flex flex-col justify-between">
                                <div>
                                    <h3 className="text-white text-sm font-bold mb-1 flex items-center gap-2">
                                        <RefreshCw className="w-4 h-4 text-amber-400" /> Global Revalidate
                                    </h3>
                                    <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
                                        Invalidate all static ISR paths and reload PM2 process for immediate updates.
                                    </p>
                                </div>
                                <button
                                    onClick={() => runCommand('revalidate-full')}
                                    disabled={loading}
                                    className="w-full py-2 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-white rounded-lg border border-amber-500/30 font-bold text-xs uppercase transition-all disabled:opacity-50"
                                >
                                    Force Revalidate
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Database & Media Backup Vault */}
            <div className="bg-white dark:bg-[#151D2C] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-white/10 pb-5">
                    <div>
                        <h2 className="text-xl font-black flex items-center gap-3 text-slate-900 dark:text-white">
                            <span className="p-2 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                                <Archive className="w-6 h-6" />
                            </span>
                            Database & Media Backup Vault
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
                            Disaster Recovery & Offline Backup: Export live products, registered users, RFQs, SQLite database, and product media photos.
                        </p>
                    </div>
                    <button
                        onClick={loadBackupStats}
                        className="self-start sm:self-auto text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 px-3 py-1.5 rounded-lg transition flex items-center gap-2"
                    >
                        <RefreshCw className="w-3.5 h-3.5" /> Refresh Stats
                    </button>
                </div>

                {/* Live Vault Telemetry */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className="p-3.5 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Package className="w-3.5 h-3.5 text-blue-500" /> Products
                        </span>
                        <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                            {backupStats ? backupStats.productCount : '...'}
                        </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-indigo-500" /> Users
                        </span>
                        <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                            {backupStats ? backupStats.userCount : '...'}
                        </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-amber-500" /> RFQs & Leads
                        </span>
                        <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                            {backupStats ? (backupStats.rfqCount + backupStats.inquiryCount) : '...'}
                        </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <FolderArchive className="w-3.5 h-3.5 text-teal-500" /> Images
                        </span>
                        <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                            {backupStats ? `${backupStats.imageCount} files` : '...'}
                        </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <HardDrive className="w-3.5 h-3.5 text-purple-500" /> Media Size
                        </span>
                        <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                            {backupStats ? `${(backupStats.mediaSizeBytes / (1024 * 1024)).toFixed(1)} MB` : '...'}
                        </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Database className="w-3.5 h-3.5 text-rose-500" /> DB Ledger
                        </span>
                        <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                            {backupStats ? `${(backupStats.dbSizeBytes / 1024).toFixed(0)} KB` : '...'}
                        </div>
                    </div>
                </div>

                {/* Primary Download Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Full Backup ZIP */}
                    <a
                        href="/api/backup?type=full"
                        download
                        className="p-4 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white shadow-lg transition-all flex flex-col justify-between group active:scale-[0.99]"
                    >
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="p-2 bg-white/20 rounded-lg">
                                    <Archive className="w-5 h-5 text-white" />
                                </span>
                                <span className="text-[10px] font-extrabold uppercase bg-white/20 px-2 py-0.5 rounded-full">
                                    Recommended
                                </span>
                            </div>
                            <h3 className="font-extrabold text-sm mb-1">Full Vault Snapshot (.ZIP)</h3>
                            <p className="text-emerald-100 text-xs leading-relaxed">
                                Complete package: SQLite Database + all uploaded product photos + JSON catalogs.
                            </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs font-bold text-white group-hover:underline">
                            <span>Download Full Backup</span>
                            <DownloadCloud className="w-4 h-4" />
                        </div>
                    </a>

                    {/* Database Only */}
                    <a
                        href="/api/backup?type=db"
                        download
                        className="p-4 rounded-xl border border-slate-200 dark:border-white/10 hover:border-blue-500 dark:hover:border-blue-400 bg-white dark:bg-white/[0.02] hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all flex flex-col justify-between group"
                    >
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
                                    <Database className="w-5 h-5" />
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">dev.db</span>
                            </div>
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Database Ledger Only</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                                Raw SQLite production file with all accounts, relations, orders, and products.
                            </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:underline">
                            <span>Download DB (.db)</span>
                            <DownloadCloud className="w-4 h-4" />
                        </div>
                    </a>

                    {/* Media Only */}
                    <a
                        href="/api/backup?type=media"
                        download
                        className="p-4 rounded-xl border border-slate-200 dark:border-white/10 hover:border-amber-500 dark:hover:border-amber-400 bg-white dark:bg-white/[0.02] hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition-all flex flex-col justify-between group"
                    >
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="p-2 bg-amber-500/10 text-amber-600 rounded-lg">
                                    <FolderArchive className="w-5 h-5" />
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">/uploads</span>
                            </div>
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Uploaded Media (.ZIP)</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                                All uploaded product gallery images, factory certificates, and brand assets.
                            </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:underline">
                            <span>Download Images (.zip)</span>
                            <DownloadCloud className="w-4 h-4" />
                        </div>
                    </a>

                    {/* JSON Catalogs */}
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="p-2 bg-purple-500/10 text-purple-600 rounded-lg">
                                    <FileJson className="w-5 h-5" />
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">Portable</span>
                            </div>
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">JSON Data Exports</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-3">
                                Machine-readable exports ready for Excel import or migration.
                            </p>
                        </div>
                        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/5">
                            <a
                                href="/api/backup?type=products"
                                download="aelbd-products.json"
                                className="w-full text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 py-1.5 px-2.5 rounded-lg flex items-center justify-between transition"
                            >
                                <span>Export Products (.json)</span>
                                <DownloadCloud className="w-3.5 h-3.5" />
                            </a>
                            <a
                                href="/api/backup?type=users"
                                download="aelbd-users.json"
                                className="w-full text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 py-1.5 px-2.5 rounded-lg flex items-center justify-between transition"
                            >
                                <span>Export Users (.json)</span>
                                <DownloadCloud className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Operations & Integrity Toolbar: Category Repair + Restore */}
                <div className="pt-4 border-t border-slate-100 dark:border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Category Taxonomy Repair */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm mb-1">
                                <Wrench className="w-4 h-4 text-amber-500" />
                                Category & Taxonomy Relation Repair
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-3">
                                Re-links orphan imported products into the 231 manufacturing category hierarchy (Fashion, Sweatshirts, Hoodies, T-Shirts) so all products appear instantly when filtered.
                            </p>
                        </div>
                        <button
                            onClick={runCategoryRepair}
                            disabled={loading}
                            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition disabled:opacity-50 active:scale-98 shadow-sm"
                        >
                            <Wrench className="w-4 h-4" />
                            Repair Category Hierarchy Now
                        </button>
                    </div>

                    {/* Restore Database */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm mb-1">
                                <Upload className="w-4 h-4 text-rose-500" />
                                Restore Database Snapshot (.db)
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-3">
                                Upload a previous <code className="text-slate-800 dark:text-slate-200 font-mono">dev.db</code> snapshot to restore immediately. A safety backup of the active database is created automatically.
                            </p>
                        </div>
                        <label className="w-full bg-slate-900 dark:bg-white/10 hover:bg-slate-800 dark:hover:bg-white/15 text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer text-center">
                            <Upload className="w-4 h-4" />
                            Choose .db File to Restore
                            <input
                                type="file"
                                accept=".db,.sqlite,.sqlite3"
                                onChange={handleRestoreDatabase}
                                disabled={loading}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>
            </div>

            {/* Terminal Live Output Log */}
            <div className="bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col h-80">
                <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-slate-400">
                    <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-mono font-bold text-slate-300">Live Server Console Log</span>
                    </div>
                    {logs.length > 0 && (
                        <button
                            onClick={() => setLogs([])}
                            className="text-[10px] text-slate-400 hover:text-white uppercase font-mono px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            Clear Log
                        </button>
                    )}
                </div>
                <div className="p-4 overflow-y-auto space-y-1.5 font-mono text-xs flex-1 custom-scrollbar">
                    {logs.length === 0 ? (
                        <div className="text-slate-600 italic">
                            No output yet. Click &quot;Check for Updates&quot; or execute an action above to see server logs.
                        </div>
                    ) : (
                        logs.map((log, i) => {
                            const logEntry = String(log || '');
                            const isError = logEntry.includes('❌') || logEntry.toLowerCase().includes('error');
                            const isSuccess = logEntry.includes('✅') || logEntry.toLowerCase().includes('success');
                            const isNotice = logEntry.includes('🔍') || logEntry.includes('🚀') || logEntry.includes('📌') || logEntry.includes('🌐') || logEntry.includes('✨');

                            return (
                                <div
                                    key={i}
                                    className={
                                        isError
                                            ? 'text-red-400 bg-red-950/20 p-1.5 rounded'
                                            : isSuccess
                                            ? 'text-emerald-400 bg-emerald-950/20 p-1.5 rounded'
                                            : isNotice
                                            ? 'text-amber-300'
                                            : 'text-slate-300'
                                    }
                                >
                                    <span className="text-slate-600 mr-2 text-[10px]">[{new Date().toLocaleTimeString()}]</span>
                                    <span className="whitespace-pre-wrap">{logEntry}</span>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
