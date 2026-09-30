'use client';

import React, { useState, useEffect } from 'react';
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
    ShieldCheck
} from 'lucide-react';

interface BackupDetails {
    id?: string;
    fileName?: string;
    name?: string;
    sizeFormatted?: string;
    sizeBytes?: number;
    webViewLink?: string | null;
    timestamp?: string;
    createdTime?: string;
    cleanupCount?: number;
    dbDumpMethod?: string;
}

interface ToastState {
    type: 'success' | 'error';
    title: string;
    message: string;
    timestamp: string;
    driveLink?: string | null;
}

export default function BackupButton({
    className = '',
    onBackupComplete,
}: {
    className?: string;
    onBackupComplete?: (details: any) => void;
}) {
    const [loading, setLoading] = useState(false);
    const [progressStage, setProgressStage] = useState<string>('');
    const [lastBackup, setLastBackup] = useState<BackupDetails | null>(null);
    const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
    const [missingKeys, setMissingKeys] = useState<string[]>([]);
    const [toast, setToast] = useState<ToastState | null>(null);
    const [showConfigModal, setShowConfigModal] = useState(false);

    // Fetch initial backup status from server
    const fetchBackupStatus = async () => {
        try {
            const res = await fetch('/api/admin/backup/gdrive');
            if (res.ok) {
                const data = await res.json();
                if (data.status) {
                    setIsConfigured(data.status.isConfigured);
                    setMissingKeys(data.status.missingKeys || []);
                    if (data.status.lastBackup) {
                        setLastBackup(data.status.lastBackup);
                    }
                }
            }
        } catch (err) {
            console.warn('[BACKUP_BUTTON] Failed to check status:', err);
        }
    };

    useEffect(() => {
        fetchBackupStatus();
    }, []);

    // Auto-dismiss toast after 7 seconds
    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => {
            setToast(null);
        }, 7000);
        return () => clearTimeout(timer);
    }, [toast]);

    const handleBackupNow = async () => {
        if (loading) return;

        setLoading(true);
        setProgressStage('Dumping Database (PostgreSQL/SQLite)...');

        // Dynamic status animation
        const timer1 = setTimeout(() => {
            setProgressStage('Compressing /public/uploads into .ZIP...');
        }, 1500);

        const timer2 = setTimeout(() => {
            setProgressStage('Streaming Upload to Google Drive Vault...');
        }, 3200);

        const timer3 = setTimeout(() => {
            setProgressStage('Executing 7-day auto-cleanup on Google Drive...');
        }, 5500);

        try {
            const response = await fetch('/api/admin/backup/gdrive', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);

            const result = await response.json();

            if (response.ok && result.success) {
                const backupData = result.backup;
                const cleanupData = result.cleanup;

                const updatedBackup: BackupDetails = {
                    id: backupData.id,
                    fileName: backupData.name,
                    sizeFormatted: backupData.sizeFormatted,
                    sizeBytes: backupData.sizeBytes,
                    webViewLink: backupData.webViewLink,
                    timestamp: new Date().toISOString(),
                    cleanupCount: cleanupData?.deletedCount ?? 0,
                    dbDumpMethod: result.database?.dumpMethod,
                };

                setLastBackup(updatedBackup);

                const cleanupNote = cleanupData?.deletedCount
                    ? ` (Auto-cleaned ${cleanupData.deletedCount} old backup${cleanupData.deletedCount > 1 ? 's' : ''})`
                    : '';

                setToast({
                    type: 'success',
                    title: 'Backup Completed Successfully!',
                    message: `Full vault archived and safely stored on Google Drive as "${backupData.name}"${cleanupNote}.`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    driveLink: backupData.webViewLink,
                });

                if (onBackupComplete) {
                    onBackupComplete(result);
                }
            } else {
                setToast({
                    type: 'error',
                    title: 'Google Drive Backup Failed',
                    message: result.error || 'Server error occurred during backup generation.',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                });
            }
        } catch (error: any) {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
            setToast({
                type: 'error',
                title: 'Network Communication Error',
                message: error.message || 'Failed to communicate with backup API endpoint.',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            });
        } finally {
            setLoading(false);
            setProgressStage('');
        }
    };

    const formatBackupDate = (isoString?: string) => {
        if (!isoString) return null;
        try {
            const date = new Date(isoString);
            return {
                date: date.toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                }),
                time: date.toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
            };
        } catch {
            return null;
        }
    };

    const lastBackupFormatted = formatBackupDate(lastBackup?.timestamp || lastBackup?.createdTime);

    return (
        <div className={`relative ${className}`}>
            {/* Toast Notification */}
            {toast && (
                <div
                    role="alert"
                    className={`fixed bottom-6 right-6 z-50 max-w-md w-full p-4 rounded-2xl shadow-2xl border backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 duration-300 ${
                        toast.type === 'success'
                            ? 'bg-emerald-950/90 text-emerald-100 border-emerald-500/40 shadow-emerald-950/50'
                            : 'bg-rose-950/90 text-rose-100 border-rose-500/40 shadow-rose-950/50'
                    }`}
                >
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-white/10 shrink-0">
                            {toast.type === 'success' ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            ) : (
                                <AlertTriangle className="w-5 h-5 text-rose-400" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                <h4 className="text-sm font-extrabold text-white truncate">
                                    {toast.title}
                                </h4>
                                <span className="text-[10px] font-mono text-white/60 shrink-0">
                                    {toast.timestamp}
                                </span>
                            </div>
                            <p className="text-xs text-white/80 mt-1 leading-relaxed break-words">
                                {toast.message}
                            </p>
                            {toast.driveLink && (
                                <div className="mt-2.5">
                                    <a
                                        href={toast.driveLink}
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
                            onClick={() => setToast(null)}
                            className="text-white/60 hover:text-white p-1 rounded-lg transition"
                            aria-label="Close notification"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Main Action Card */}
            <div className="bg-gradient-to-br from-indigo-900/90 via-slate-900 to-blue-950 border border-blue-500/30 p-5 sm:p-6 rounded-2xl shadow-xl flex flex-col justify-between relative overflow-hidden text-white group">
                {/* Background Glow */}
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/20 transition-all duration-500"></div>

                <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-400/30">
                                <Cloud className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-2">
                                    Google Drive Cloud Vault
                                    <span className="text-[10px] font-mono tracking-wider font-extrabold uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full">
                                        Automated
                                    </span>
                                </h3>
                                <p className="text-slate-400 text-xs mt-0.5">
                                    Direct off-site snapshot (Database SQL Dump + /public/uploads + 7-Day Auto-Cleanup)
                                </p>
                            </div>
                        </div>

                        {/* Config warning indicator if missing */}
                        {isConfigured === false && (
                            <button
                                onClick={() => setShowConfigModal(true)}
                                className="text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-lg flex items-center gap-1.5 hover:bg-amber-500/30 transition shrink-0"
                                title="Click to view setup instructions"
                            >
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                                Setup Required
                            </button>
                        )}
                    </div>

                    {/* Status & Last Backup Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                        {/* Last Backup Date */}
                        <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                                <Calendar className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                                    Last Successful Backup
                                </span>
                                <div className="text-xs font-extrabold text-slate-100 truncate mt-0.5">
                                    {lastBackupFormatted ? (
                                        <span>
                                            {lastBackupFormatted.date} at {lastBackupFormatted.time}
                                        </span>
                                    ) : (
                                        <span className="text-slate-500 italic">No backup recorded yet</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Snapshot Size & Method */}
                        <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                                <HardDrive className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                                    Vault Payload Size
                                </span>
                                <div className="text-xs font-extrabold text-slate-100 truncate mt-0.5 flex items-center gap-2">
                                    <span>
                                        {lastBackup?.sizeFormatted || (lastBackup?.sizeBytes ? `${(lastBackup.sizeBytes / (1024 * 1024)).toFixed(1)} MB` : 'Dynamic ZIP')}
                                    </span>
                                    {lastBackup?.webViewLink && (
                                        <a
                                            href={lastBackup.webViewLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[10px] text-blue-400 hover:text-blue-300 underline flex items-center gap-0.5"
                                        >
                                            View <ExternalLink className="w-2.5 h-2.5 inline" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Primary Button & Live Progress */}
                <div className="space-y-3 pt-2">
                    {loading && progressStage && (
                        <div className="flex items-center gap-2 text-xs font-medium text-blue-300 animate-pulse bg-blue-950/50 p-2 rounded-lg border border-blue-500/20">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                            <span>{progressStage}</span>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <button
                            onClick={handleBackupNow}
                            disabled={loading}
                            className={`flex-1 py-3 px-5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-lg transition-all active:scale-[0.99] ${
                                loading
                                    ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-white/5'
                                    : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 hover:from-blue-500 hover:via-indigo-500 hover:to-teal-500 text-white shadow-blue-900/30'
                            }`}
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                                    <span>Archiving & Uploading to Drive...</span>
                                </>
                            ) : (
                                <>
                                    <CloudUpload className="w-4 h-4" />
                                    <span>Backup Now to Google Drive</span>
                                </>
                            )}
                        </button>

                        <button
                            onClick={fetchBackupStatus}
                            disabled={loading}
                            title="Refresh status from Google Drive"
                            className="p-3 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-slate-300 hover:text-white transition flex items-center justify-center disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    {/* Auto-Cleanup Info Note */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            7-Day Retention: Backups older than 7 days auto-purged from Drive
                        </span>
                        <span className="font-mono text-[10px] text-slate-500">
                            Cron: 12:00 AM Daily
                        </span>
                    </div>
                </div>
            </div>

            {/* Google Drive Configuration Modal */}
            {showConfigModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-slate-700 text-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <div className="flex items-center gap-2">
                                <Info className="w-5 h-5 text-blue-400" />
                                <h3 className="font-bold text-base">Google Drive API Configuration</h3>
                            </div>
                            <button
                                onClick={() => setShowConfigModal(false)}
                                className="text-slate-400 hover:text-white p-1 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                            To enable direct backups to Google Drive, configure either an OAuth2 refresh token or a Google Service Account key in your <code className="text-amber-400 font-mono">.env.local</code>:
                        </p>

                        <div className="bg-slate-950 p-3.5 rounded-xl border border-white/10 font-mono text-[11px] space-y-1.5 text-slate-300 overflow-x-auto">
                            <div className="text-slate-500 font-bold mb-1"># Option A: Google OAuth2 (Recommended)</div>
                            <div>GOOGLE_CLIENT_ID=&quot;your_google_client_id.apps.googleusercontent.com&quot;</div>
                            <div>GOOGLE_CLIENT_SECRET=&quot;GOCSPX-your_secret&quot;</div>
                            <div>GOOGLE_DRIVE_REFRESH_TOKEN=&quot;1//04your_refresh_token&quot;</div>
                            <div>GOOGLE_DRIVE_FOLDER_ID=&quot;1abcXYZ_folder_id&quot;</div>
                            <div className="text-slate-500 font-bold mt-2"># Option B: Service Account</div>
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
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
