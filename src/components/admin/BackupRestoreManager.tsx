'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Cloud,
    CloudUpload,
    RefreshCw,
    CheckCircle2,
    AlertTriangle,
    ExternalLink,
    HardDrive,
    Trash2,
    Calendar,
    Clock,
    X,
    FileArchive,
    Info,
    ShieldCheck,
    ShieldAlert,
    RotateCcw,
    Search,
    DownloadCloud,
    Database,
    FolderArchive,
    Check,
    AlertCircle,
    Server,
    Sparkles,
    ArrowRight
} from 'lucide-react';

export interface DriveBackupItem {
    id: string;
    name: string;
    size: number;
    sizeFormatted: string;
    createdTime: string;
    modifiedTime?: string;
    webViewLink?: string | null;
}

interface ToastNotification {
    id: string;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
    timestamp: string;
    driveLink?: string | null;
}

export interface BackupRestoreManagerProps {
    className?: string;
    onBackupComplete?: (details: any) => void;
    onRestoreComplete?: (details: any) => void;
}

export default function BackupRestoreManager({
    className = '',
    onBackupComplete,
    onRestoreComplete,
}: BackupRestoreManagerProps) {
    // -------------------------------------------------------------
    // State
    // -------------------------------------------------------------
    const [backups, setBackups] = useState<DriveBackupItem[]>([]);
    const [loadingList, setLoadingList] = useState(false);
    const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
    const [missingKeys, setMissingKeys] = useState<string[]>([]);
    const [lastBackup, setLastBackup] = useState<any | null>(null);
    const [lastRestore, setLastRestore] = useState<any | null>(null);

    // Backup execution state
    const [backupLoading, setBackupLoading] = useState(false);
    const [backupStage, setBackupStage] = useState<string>('');

    // Restore execution state
    const [selectedBackupForRestore, setSelectedBackupForRestore] = useState<DriveBackupItem | null>(null);
    const [confirmInput, setConfirmInput] = useState('');
    const [restoreLoading, setRestoreLoading] = useState(false);
    const [restoreStep, setRestoreStep] = useState<number>(0);
    const [restoreStepText, setRestoreStepText] = useState<string>('');

    // UI helpers
    const [searchQuery, setSearchQuery] = useState('');
    const [showConfigModal, setShowConfigModal] = useState(false);
    const [toasts, setToasts] = useState<ToastNotification[]>([]);

    const addToast = (type: 'success' | 'error' | 'info', title: string, message: string, driveLink?: string | null) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast: ToastNotification = {
            id,
            type,
            title,
            message,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            driveLink,
        };
        setToasts((prev) => [newToast, ...prev.slice(0, 4)]);

        // Auto dismiss after 8 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 8000);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    // -------------------------------------------------------------
    // Fetch Backups List
    // -------------------------------------------------------------
    const fetchBackupsList = async () => {
        setLoadingList(true);
        try {
            const res = await fetch('/api/admin/backup/list');
            const data = await res.json();

            if (res.ok && data.success) {
                setIsConfigured(data.configured);
                setMissingKeys(data.missingKeys || []);
                setBackups(data.backups || []);
                if (data.lastBackup) setLastBackup(data.lastBackup);
                if (data.lastRestore) setLastRestore(data.lastRestore);
            } else {
                setIsConfigured(false);
                setMissingKeys(data.missingKeys || []);
            }
        } catch (err: any) {
            console.error('[FETCH_BACKUPS_ERROR]', err);
            addToast('error', 'Failed to connect to Google Drive', 'Could not fetch backups from Google Drive.');
        } finally {
            setLoadingList(false);
        }
    };

    useEffect(() => {
        fetchBackupsList();
    }, []);

    // -------------------------------------------------------------
    // 1. Backup Action
    // -------------------------------------------------------------
    const handleBackupNow = async () => {
        if (backupLoading) return;

        setBackupLoading(true);
        setBackupStage('Dumping PostgreSQL/SQLite Database to .SQL...');

        const t1 = setTimeout(() => {
            setBackupStage('Compressing /public/uploads + SQL dump into .ZIP archive...');
        }, 1500);

        const t2 = setTimeout(() => {
            setBackupStage('Streaming archive directly to Google Drive Vault...');
        }, 3200);

        const t3 = setTimeout(() => {
            setBackupStage('Executing 7-day auto-cleanup & pruning temporary files...');
        }, 5500);

        try {
            const res = await fetch('/api/admin/backup/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);

            const data = await res.json();

            if (res.ok && data.success) {
                const b = data.backup;
                const cleanup = data.cleanup;

                setLastBackup({
                    id: b.id,
                    name: b.name,
                    sizeFormatted: b.sizeFormatted,
                    sizeBytes: b.sizeBytes,
                    webViewLink: b.webViewLink,
                    createdTime: b.createdTime || new Date().toISOString(),
                });

                const cleanupMsg = cleanup?.deletedCount
                    ? ` (Auto-cleaned ${cleanup.deletedCount} backup${cleanup.deletedCount > 1 ? 's' : ''} older than 7 days)`
                    : '';

                addToast(
                    'success',
                    'Backup Created Successfully!',
                    `Archive "${b.name}" safely stored in Google Drive${cleanupMsg}.`,
                    b.webViewLink
                );

                await fetchBackupsList();

                if (onBackupComplete) {
                    onBackupComplete(data);
                }
            } else {
                addToast('error', 'Google Drive Backup Failed', data.error || 'Server error generating backup.');
            }
        } catch (err: any) {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            addToast('error', 'Network Connection Error', err.message || 'Failed to trigger backup API.');
        } finally {
            setBackupLoading(false);
            setBackupStage('');
        }
    };

    // -------------------------------------------------------------
    // 2. Restore Action
    // -------------------------------------------------------------
    const handleOpenRestoreModal = (backup: DriveBackupItem) => {
        setSelectedBackupForRestore(backup);
        setConfirmInput('');
        setRestoreStep(0);
        setRestoreStepText('');
    };

    const handleCloseRestoreModal = () => {
        if (restoreLoading) return; // Prevent closing while restore is in progress
        setSelectedBackupForRestore(null);
        setConfirmInput('');
        setRestoreStep(0);
        setRestoreStepText('');
    };

    const handleExecuteRestore = async () => {
        if (!selectedBackupForRestore || restoreLoading) return;

        setRestoreLoading(true);
        setRestoreStep(1);
        setRestoreStepText('Step 1/4: Downloading backup archive from Google Drive to server...');

        const t1 = setTimeout(() => {
            setRestoreStep(2);
            setRestoreStepText('Step 2/4: Unzipping archive payload & taking local safety snapshot...');
        }, 2200);

        const t2 = setTimeout(() => {
            setRestoreStep(3);
            setRestoreStepText('Step 3/4: Restoring database tables (SQL execution)...');
        }, 4500);

        const t3 = setTimeout(() => {
            setRestoreStep(4);
            setRestoreStepText('Step 4/4: Replacing media assets into /public/uploads...');
        }, 7000);

        try {
            const res = await fetch('/api/admin/backup/restore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileId: selectedBackupForRestore.id }),
            });

            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);

            const data = await res.json();

            if (res.ok && data.success) {
                setRestoreStep(5);
                setRestoreStepText('Completed! Database & Files Successfully Restored.');

                addToast(
                    'success',
                    'Disaster Recovery Completed!',
                    data.message || `System restored from "${selectedBackupForRestore.name}". Safety backup was saved.`
                );

                setLastRestore({
                    restoredFileName: selectedBackupForRestore.name,
                    timestamp: new Date().toISOString(),
                    safetyBackup: data.database?.safetyBackupPath,
                    mediaFilesRestored: data.media?.filesRestored,
                });

                if (onRestoreComplete) {
                    onRestoreComplete(data);
                }

                setTimeout(() => {
                    handleCloseRestoreModal();
                    fetchBackupsList();
                }, 2000);
            } else {
                addToast('error', 'Restoration Failed', data.error || 'Server error during restore.');
                setRestoreStep(0);
                setRestoreStepText('');
            }
        } catch (err: any) {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            addToast('error', 'Restoration Network Failure', err.message || 'Failed connecting to restore endpoint.');
            setRestoreStep(0);
            setRestoreStepText('');
        } finally {
            setRestoreLoading(false);
        }
    };

    // Filtered backups list
    const filteredBackups = useMemo(() => {
        if (!searchQuery.trim()) return backups;
        const q = searchQuery.toLowerCase();
        return backups.filter(
            (b) => b.name.toLowerCase().includes(q) || b.createdTime.toLowerCase().includes(q)
        );
    }, [backups, searchQuery]);

    const formatTimestamp = (iso?: string) => {
        if (!iso) return { date: 'N/A', time: '' };
        try {
            const d = new Date(iso);
            return {
                date: d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
                time: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
            };
        } catch {
            return { date: 'Invalid Date', time: '' };
        }
    };

    const lastBackupInfo = lastBackup ? formatTimestamp(lastBackup.createdTime || lastBackup.timestamp) : null;
    const lastRestoreInfo = lastRestore ? formatTimestamp(lastRestore.timestamp) : null;

    return (
        <div className={`space-y-6 ${className}`}>
            {/* ------------------------------------------------------------- */}
            {/* Toast Notifications Stack */}
            {/* ------------------------------------------------------------- */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        role="alert"
                        className={`pointer-events-auto p-4 rounded-2xl shadow-2xl border backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 duration-300 ${
                            t.type === 'success'
                                ? 'bg-emerald-950/95 text-emerald-100 border-emerald-500/40 shadow-emerald-950/50'
                                : t.type === 'error'
                                ? 'bg-rose-950/95 text-rose-100 border-rose-500/40 shadow-rose-950/50'
                                : 'bg-slate-900/95 text-slate-100 border-blue-500/40 shadow-slate-950/50'
                        }`}
                    >
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-xl bg-white/10 shrink-0">
                                {t.type === 'success' ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                ) : t.type === 'error' ? (
                                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                                ) : (
                                    <Info className="w-5 h-5 text-blue-400" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <h4 className="text-sm font-extrabold text-white truncate">{t.title}</h4>
                                    <span className="text-[10px] font-mono text-white/60 shrink-0">{t.timestamp}</span>
                                </div>
                                <p className="text-xs text-white/80 mt-1 leading-relaxed break-words">{t.message}</p>
                                {t.driveLink && (
                                    <div className="mt-2.5">
                                        <a
                                            href={t.driveLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 hover:text-white bg-emerald-500/20 hover:bg-emerald-500/30 px-3 py-1.5 rounded-lg border border-emerald-400/30 transition-all"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                            Open in Google Drive
                                        </a>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => removeToast(t.id)}
                                className="text-white/60 hover:text-white p-1 rounded-lg transition"
                                aria-label="Dismiss toast"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* ------------------------------------------------------------- */}
            {/* SECTION 1: Automated Google Drive Backup Action Card */}
            {/* ------------------------------------------------------------- */}
            <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 border border-blue-500/30 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden group">
                <div className="absolute -top-12 -right-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/20 transition-all duration-500"></div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                    {/* Left: Info */}
                    <div className="space-y-3 max-w-2xl">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-400/30">
                                <Cloud className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                                    One-Click Google Drive Automated Backup
                                    <span className="text-[10px] font-mono tracking-wider font-extrabold uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full">
                                        Automated 7-Day Purge
                                    </span>
                                </h3>
                                <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                                    Generates a full PostgreSQL/MySQL/SQLite database dump (.sql) + /public/uploads
                                    media archive (.zip) and uploads it securely to Google Drive.
                                </p>
                            </div>
                        </div>

                        {/* Status Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            {/* Last Successful Backup */}
                            <div className="p-3 bg-white/[0.04] border border-white/10 rounded-xl flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                                        Last Successful Backup
                                    </span>
                                    <div className="text-xs font-extrabold text-slate-100 truncate mt-0.5">
                                        {lastBackupInfo ? (
                                            <span>
                                                {lastBackupInfo.date} at {lastBackupInfo.time}
                                            </span>
                                        ) : (
                                            <span className="text-slate-500 italic">No backup recorded yet</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Payload Size & Drive Link */}
                            <div className="p-3 bg-white/[0.04] border border-white/10 rounded-xl flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                                    <HardDrive className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                                        Archive Size & Google Drive
                                    </span>
                                    <div className="text-xs font-extrabold text-slate-100 truncate mt-0.5 flex items-center gap-2">
                                        <span>
                                            {lastBackup?.sizeFormatted ||
                                                (lastBackup?.sizeBytes
                                                    ? `${(lastBackup.sizeBytes / (1024 * 1024)).toFixed(1)} MB`
                                                    : 'Timestamped .ZIP')}
                                        </span>
                                        {lastBackup?.webViewLink && (
                                            <a
                                                href={lastBackup.webViewLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[10px] text-blue-400 hover:text-blue-300 underline flex items-center gap-0.5"
                                            >
                                                View in Drive <ExternalLink className="w-2.5 h-2.5 inline" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Retention Notice */}
                        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                            <span className="flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                7-Day Space Optimization: Backups older than 7 days automatically purged.
                            </span>
                            {lastRestoreInfo && (
                                <span className="flex items-center gap-1 text-amber-300/80">
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    Last restored: {lastRestoreInfo.date} {lastRestoreInfo.time}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[240px]">
                        {isConfigured === false && (
                            <button
                                onClick={() => setShowConfigModal(true)}
                                className="w-full py-2 px-3 text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xl flex items-center justify-center gap-2 hover:bg-amber-500/30 transition"
                            >
                                <AlertTriangle className="w-4 h-4 text-amber-400" />
                                Configure Drive Credentials
                            </button>
                        )}

                        {backupLoading && backupStage && (
                            <div className="flex items-center gap-2 text-xs font-medium text-blue-300 animate-pulse bg-blue-950/70 p-2.5 rounded-xl border border-blue-500/30">
                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400 shrink-0" />
                                <span className="truncate">{backupStage}</span>
                            </div>
                        )}

                        <button
                            onClick={handleBackupNow}
                            disabled={backupLoading}
                            className={`w-full py-3.5 px-6 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl transition-all active:scale-[0.99] ${
                                backupLoading
                                    ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-white/10'
                                    : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 hover:from-blue-500 hover:via-indigo-500 hover:to-teal-500 text-white shadow-blue-900/40 hover:shadow-blue-900/60'
                            }`}
                        >
                            {backupLoading ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                                    <span>Generating Backup...</span>
                                </>
                            ) : (
                                <>
                                    <CloudUpload className="w-4 h-4" />
                                    <span>Backup Now to Drive</span>
                                </>
                            )}
                        </button>

                        <button
                            onClick={fetchBackupsList}
                            disabled={loadingList || backupLoading}
                            className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition flex items-center justify-center gap-2"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${loadingList ? 'animate-spin' : ''}`} />
                            <span>Refresh Backups List</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* SECTION 2: Restore Manager (Disaster Recovery) */}
            {/* ------------------------------------------------------------- */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
                {/* Header */}
                <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg">
                                <RotateCcw className="w-5 h-5" />
                            </div>
                            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                                Restore Manager (Disaster Recovery)
                            </h3>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                            Select any Google Drive archive snapshot to restore both database tables and media images.
                            A local safety snapshot is automatically created before any overwrite.
                        </p>
                    </div>

                    {/* Search & Counter */}
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search backups..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white w-48 sm:w-60"
                            />
                        </div>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10">
                            {filteredBackups.length} file{filteredBackups.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                {/* Backups List / Table */}
                <div className="overflow-x-auto">
                    {loadingList && backups.length === 0 ? (
                        <div className="p-12 text-center space-y-3">
                            <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
                            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                                Querying Google Drive backup folder...
                            </p>
                            <p className="text-xs text-slate-400">Fetching available timestamped .zip archives.</p>
                        </div>
                    ) : filteredBackups.length === 0 ? (
                        <div className="p-12 text-center space-y-3">
                            <FileArchive className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                {searchQuery ? 'No matching backups found' : 'No backups found in Google Drive'}
                            </h4>
                            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                                {isConfigured === false
                                    ? 'Google Drive is not yet configured. Set your credentials in .env.local to enable cloud backups.'
                                    : 'Click "Backup Now to Drive" above to create your first cloud disaster recovery snapshot.'}
                            </p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                                    <th className="py-3 px-4 sm:px-6">Backup Archive</th>
                                    <th className="py-3 px-4">Created Date</th>
                                    <th className="py-3 px-4">Payload Size</th>
                                    <th className="py-3 px-4">Google Drive</th>
                                    <th className="py-3 px-4 sm:px-6 text-right">Disaster Recovery</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
                                {filteredBackups.map((item, index) => {
                                    const time = formatTimestamp(item.createdTime);
                                    const isLatest = index === 0;

                                    return (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors group"
                                        >
                                            {/* File Name */}
                                            <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-800 dark:text-slate-200">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
                                                        <FileArchive className="w-4 h-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono text-xs font-bold truncate max-w-[200px] sm:max-w-xs block">
                                                                {item.name}
                                                            </span>
                                                            {isLatest && (
                                                                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full shrink-0">
                                                                    Latest
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-[10px] text-slate-400 font-mono block">
                                                            ID: {item.id.substring(0, 16)}...
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Date */}
                                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                                                <div>{time.date}</div>
                                                <div className="text-[10px] text-slate-400">{time.time}</div>
                                            </td>

                                            {/* Size */}
                                            <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                                                {item.sizeFormatted}
                                            </td>

                                            {/* External Link */}
                                            <td className="py-3.5 px-4">
                                                {item.webViewLink ? (
                                                    <a
                                                        href={item.webViewLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                                                    >
                                                        <span>Preview</span>
                                                        <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </td>

                                            {/* Restore Button */}
                                            <td className="py-3.5 px-4 sm:px-6 text-right">
                                                <button
                                                    onClick={() => handleOpenRestoreModal(item)}
                                                    className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all hover:shadow active:scale-95"
                                                >
                                                    <RotateCcw className="w-3.5 h-3.5" />
                                                    <span>Restore This Backup</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* SAFETY CONFIRMATION MODAL */}
            {/* ------------------------------------------------------------- */}
            {selectedBackupForRestore && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-rose-500/40 text-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative overflow-hidden">
                        {/* Red warning gradient background */}
                        <div className="absolute -top-16 -right-16 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none"></div>

                        {/* Modal Header */}
                        <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/40">
                                    <ShieldAlert className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg text-white">Disaster Recovery Restore</h3>
                                    <p className="text-xs text-rose-300/90 font-medium">Critical system overwrite operation</p>
                                </div>
                            </div>
                            {!restoreLoading && (
                                <button
                                    onClick={handleCloseRestoreModal}
                                    className="text-slate-400 hover:text-white p-1 rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        {/* Warning Box */}
                        <div className="p-3.5 bg-rose-950/60 border border-rose-500/40 rounded-xl space-y-2 text-xs text-rose-200">
                            <div className="font-extrabold text-sm text-rose-100 flex items-center gap-1.5">
                                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                                Are you sure you want to restore this version?
                            </div>
                            <p className="leading-relaxed">
                                This will <strong>overwrite your current database tables</strong> (Users, Orders, Products, RFQs)
                                and <strong>merge/replace /public/uploads media files</strong> with the contents of this archive!
                            </p>
                            <p className="text-[11px] text-rose-300/80">
                                🛡️ A safety backup of the active database will be saved to <code className="bg-black/40 px-1 py-0.5 rounded font-mono">prisma/backups</code> automatically before restoration starts.
                            </p>
                        </div>

                        {/* Selected Backup Metadata */}
                        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-white/10 space-y-1.5 text-xs font-mono text-slate-300">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Target Archive:</span>
                                <span className="font-bold text-white truncate max-w-[240px]">{selectedBackupForRestore.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Backup Date:</span>
                                <span>{formatTimestamp(selectedBackupForRestore.createdTime).date} at {formatTimestamp(selectedBackupForRestore.createdTime).time}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Payload Size:</span>
                                <span className="text-emerald-400">{selectedBackupForRestore.sizeFormatted}</span>
                            </div>
                        </div>

                        {/* Progress Stepper (Visible during restoration) */}
                        {restoreLoading ? (
                            <div className="space-y-3 p-4 bg-blue-950/60 border border-blue-500/40 rounded-xl text-center">
                                <RefreshCw className="w-8 h-8 animate-spin text-blue-400 mx-auto" />
                                <div className="space-y-1">
                                    <h4 className="text-sm font-extrabold text-white">Restoring System...</h4>
                                    <p className="text-xs text-blue-300 animate-pulse font-mono">{restoreStepText}</p>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full transition-all duration-500"
                                        style={{ width: `${(restoreStep / 5) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ) : (
                            /* Confirmation Input Step */
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-300">
                                    Type <span className="text-rose-400 font-mono font-black">RESTORE</span> below to confirm overwrite:
                                </label>
                                <input
                                    type="text"
                                    value={confirmInput}
                                    onChange={(e) => setConfirmInput(e.target.value)}
                                    placeholder="Type RESTORE to unlock"
                                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                                    autoFocus
                                />
                            </div>
                        )}

                        {/* Modal Action Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
                            <button
                                onClick={handleCloseRestoreModal}
                                disabled={restoreLoading}
                                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleExecuteRestore}
                                disabled={restoreLoading || confirmInput.trim().toUpperCase() !== 'RESTORE'}
                                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition shadow-lg ${
                                    confirmInput.trim().toUpperCase() === 'RESTORE' && !restoreLoading
                                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/60 active:scale-95'
                                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                                }`}
                            >
                                {restoreLoading ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        <span>Restoring...</span>
                                    </>
                                ) : (
                                    <>
                                        <RotateCcw className="w-4 h-4" />
                                        <span>Overwrite & Restore Now</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* GOOGLE DRIVE CONFIGURATION MODAL */}
            {/* ------------------------------------------------------------- */}
            {showConfigModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-slate-700 text-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <div className="flex items-center gap-2">
                                <Info className="w-5 h-5 text-blue-400" />
                                <h3 className="font-bold text-base">Google Drive Credentials Setup</h3>
                            </div>
                            <button
                                onClick={() => setShowConfigModal(false)}
                                className="text-slate-400 hover:text-white p-1 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                            To enable one-click backup and restore, provide either OAuth 2.0 or Service Account credentials in your <code className="text-amber-400 font-mono">.env.local</code>:
                        </p>

                        <div className="bg-slate-950 p-3.5 rounded-xl border border-white/10 font-mono text-[11px] space-y-1.5 text-slate-300 overflow-x-auto">
                            <div className="text-slate-500 font-bold mb-1"># Option 1: Google OAuth2 (Recommended)</div>
                            <div>GOOGLE_CLIENT_ID=&quot;...apps.googleusercontent.com&quot;</div>
                            <div>GOOGLE_CLIENT_SECRET=&quot;GOCSPX-...&quot;</div>
                            <div>GOOGLE_DRIVE_REFRESH_TOKEN=&quot;1//04...&quot;</div>
                            <div>GOOGLE_DRIVE_FOLDER_ID=&quot;1abcXYZ...&quot;</div>
                            <div className="text-slate-500 font-bold mt-2"># Option 2: Service Account</div>
                            <div>GOOGLE_SERVICE_ACCOUNT_KEY_JSON=&apos;&#123;&quot;type&quot;: &quot;service_account&quot;, ...&#125;&apos;</div>
                        </div>

                        {missingKeys.length > 0 && (
                            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200">
                                <span className="font-bold">Missing Keys:</span> {missingKeys.join(', ')}
                            </div>
                        )}

                        <div className="flex justify-end pt-2">
                            <button
                                onClick={() => setShowConfigModal(false)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
