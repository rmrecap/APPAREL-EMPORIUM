'use client';

import { useState, useEffect } from 'react';
import { usePermission } from '@/hooks/usePermission';
import FileUpload from '@/components/ui/FileUpload';
import {
    Image as ImageIcon, Search, Filter, Trash2, X, Download, Copy,
    List, Grid, ImageOff, RefreshCw, CheckCircle2, AlertCircle
} from 'lucide-react';
import Image from 'next/image';

interface MediaFile {
    id: string;
    fileName: string;
    originalName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    folder: string;
    alt: string | null;
    createdAt: string;
    user?: { name: string | null; email: string } | null;
}

export default function MediaLibraryPage() {
    const { role } = usePermission();
    const canUpload = ['EDITOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(role || '');
    const canDelete = ['ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(role || '');

    const [media, setMedia] = useState<MediaFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [search, setSearch] = useState('');
    const [folder, setFolder] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [folderCounts, setFolderCounts] = useState<Record<string, number>>({});
    const [mediaAudit, setMediaAudit] = useState<{
        totalProducts: number;
        totalProductImageRefs: number;
        externalImageRefs: number;
        missingFromMediaRefs: number;
        isHealthy: boolean;
        flaggedProducts: Array<{ id: string; name: string; slug: string; issue: string }>;
    } | null>(null);

    // Sync state
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Modal
    const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [altText, setAltText] = useState('');
    const [isSavingAlt, setIsSavingAlt] = useState(false);

    const fetchMedia = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: page.toString(),
                limit: '36',
                ...(folder !== 'all' && { folder }),
                ...(search && { search }),
            });
            const res = await fetch(`/api/media?${query.toString()}`);
            const data = await res.json();

            if (data.files) {
                setMedia(data.files);
                setTotalPages(data.pagination?.totalPages || 1);
                setTotalCount(data.pagination?.total ?? data.total ?? data.files.length);
                if (data.folderCounts) {
                    setFolderCounts(data.folderCounts);
                }
                if (data.mediaAudit) {
                    setMediaAudit(data.mediaAudit);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchMedia();
        }, search ? 350 : 0);
        return () => clearTimeout(debounce);
    }, [page, folder, search]);

    const handleUploadComplete = () => {
        setPage(1);
        fetchMedia();
    };

    const handleSyncLibrary = async () => {
        setIsSyncing(true);
        setSyncMessage(null);
        try {
            const res = await fetch('/api/media', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'localize-all' }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Media sync failed');
            }
            setSyncMessage({
                type: 'success',
                text: `Synced ${data.mediaSync?.totalInDb ?? 0} total assets (${data.mediaSync?.createdRecords ?? 0} newly indexed, ${data.imagesLocalized ?? 0} remote images localized).`,
            });
            setPage(1);
            await fetchMedia();
        } catch (err: any) {
            setSyncMessage({
                type: 'error',
                text: err?.message || 'Failed to sync media library.',
            });
        } finally {
            setIsSyncing(false);
        }
    };

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === media.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(media.map(m => m.id)));
    };

    const deleteMedia = async (ids: string[]) => {
        if (!confirm(`Are you sure you want to delete ${ids.length} files? This cannot be undone.`)) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/media?ids=${ids.join(',')}`, { method: 'DELETE' });
            if (res.ok) {
                setSelectedIds(new Set());
                setSelectedFile(null);
                fetchMedia();
            } else {
                alert('Deletion failed');
            }
        } catch {
            alert('Deletion error');
        } finally {
            setIsDeleting(false);
        }
    };

    const saveAltText = async () => {
        if (!selectedFile) return;
        setIsSavingAlt(true);
        try {
            const res = await fetch('/api/media', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: selectedFile.id, alt: altText }),
            });
            if (res.ok) {
                setSelectedFile({ ...selectedFile, alt: altText });
                fetchMedia();
            }
        } finally {
            setIsSavingAlt(false);
        }
    };

    const copyUrl = (url: string) => {
        navigator.clipboard.writeText(window.location.origin + url);
        alert('URL copied to clipboard!');
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024, sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (!canUpload) {
        return <div className="p-8 text-center text-red-500 font-bold">Access Denied</div>;
    }

    return (
        <div className="max-w-7xl mx-auto pb-20 px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
                        <ImageIcon className="text-primary" /> Media Library
                        <span className="ml-2 text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                            {totalCount.toLocaleString()} {folder === 'all' ? 'assets' : 'in folder'}
                        </span>
                    </h1>
                    <p className="text-gray-500 text-sm">Upload, manage, localize, and inspect all website &amp; product image assets stored in your database.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <button
                        type="button"
                        onClick={handleSyncLibrary}
                        disabled={isSyncing}
                        className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 disabled:opacity-60"
                        title="Scan /public/uploads and localize any external product images into your database"
                    >
                        <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
                        {isSyncing ? 'Syncing & Localizing...' : 'Sync Product Media'}
                    </button>

                    {/* View Toggle */}
                    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        <button
                            onClick={() => setView('grid')}
                            className={`p-1.5 rounded transition ${view === 'grid' ? 'bg-white dark:bg-dark-surface shadow-sm text-primary' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                            <Grid size={18} />
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={`p-1.5 rounded transition ${view === 'list' ? 'bg-white dark:bg-dark-surface shadow-sm text-primary' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                            <List size={18} />
                        </button>
                    </div>

                    {canDelete && selectedIds.size > 0 && (
                        <button
                            onClick={() => deleteMedia(Array.from(selectedIds))}
                            disabled={isDeleting}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition flex items-center gap-2 shadow-sm"
                        >
                            <Trash2 size={16} /> Delete Selected ({selectedIds.size})
                        </button>
                    )}
                </div>
            </div>

            {syncMessage && (
                <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 text-sm font-medium ${syncMessage.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                    : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                    }`}>
                    {syncMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <span className="flex-1">{syncMessage.text}</span>
                    <button onClick={() => setSyncMessage(null)} className="opacity-70 hover:opacity-100"><X size={16} /></button>
                </div>
            )}

            {/* Product Media Hosting Audit Banner */}
            {mediaAudit && (
                <div className={`mb-6 p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm ${
                    mediaAudit.isHealthy
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300'
                        : 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                }`}>
                    <div className="flex items-start sm:items-center gap-2.5">
                        {mediaAudit.isHealthy ? <CheckCircle2 size={18} className="shrink-0 mt-0.5 sm:mt-0" /> : <AlertCircle size={18} className="shrink-0 mt-0.5 sm:mt-0" />}
                        <div>
                            <span className="font-bold">
                                {mediaAudit.isHealthy
                                    ? `100% Local Hosted & Indexed: All ${mediaAudit.totalProducts} products (${mediaAudit.totalProductImageRefs.toLocaleString()} images) are stored on this website & in Media Library.`
                                    : `Action Needed: ${mediaAudit.externalImageRefs} external image URL(s) and ${mediaAudit.missingFromMediaRefs} unindexed image(s) detected across products.`}
                            </span>
                            {!mediaAudit.isHealthy && mediaAudit.flaggedProducts.length > 0 && (
                                <p className="text-xs mt-1 opacity-90">
                                    Flagged: {mediaAudit.flaggedProducts.slice(0, 5).map(p => p.name).join(', ')}
                                    {mediaAudit.flaggedProducts.length > 5 ? ` +${mediaAudit.flaggedProducts.length - 5} more` : ''}
                                </p>
                            )}
                        </div>
                    </div>
                    {!mediaAudit.isHealthy && (
                        <button
                            type="button"
                            onClick={handleSyncLibrary}
                            disabled={isSyncing}
                            className="shrink-0 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition"
                        >
                            {isSyncing ? 'Fixing...' : 'Localize & Fix Now'}
                        </button>
                    )}
                </div>
            )}

            {/* Uploader UI */}
            <div className="mb-8">
                <FileUpload onUploadComplete={handleUploadComplete} folder={folder === 'all' ? 'products' : folder} multiple={true} />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-white dark:bg-dark-surface p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by product name, filename, or alt text..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-primary text-sm"
                    />
                </div>
                <div className="relative min-w-[220px]">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                        value={folder}
                        onChange={(e) => { setFolder(e.target.value); setPage(1); }}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-primary text-sm appearance-none font-medium text-gray-700 dark:text-gray-200"
                    >
                        <option value="all">All Folders ({folderCounts.all ?? totalCount})</option>
                        <option value="products">Products ({folderCounts.products ?? 0})</option>
                        <option value="logos">Logos &amp; Icons ({folderCounts.logos ?? 0})</option>
                        <option value="demo">Demo Assets ({folderCounts.demo ?? 0})</option>
                        <option value="blog">Blog ({folderCounts.blog ?? 0})</option>
                        <option value="general">General ({folderCounts.general ?? 0})</option>
                    </select>
                </div>
            </div>

            {/* Content Area */}
            {loading && media.length === 0 ? (
                <div className="py-20 flex justify-center border border-dashed rounded-xl"><div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-primary animate-spin"></div></div>
            ) : media.length === 0 ? (
                <div className="text-center py-24 bg-gray-50/50 dark:bg-gray-900/10 rounded-xl border border-dashed dark:border-gray-800">
                    <ImageOff className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">No media files found</h3>
                    <p className="text-gray-500 text-sm">Upload images, clear your search filters, or click &quot;Sync Product Media&quot;.</p>
                </div>
            ) : (
                <>
                    {view === 'grid' ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                            {media.map((file) => (
                                <div
                                    key={file.id}
                                    className={`relative group bg-gray-100 dark:bg-dark-surface rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer border-2
                                    ${selectedIds.has(file.id) ? 'border-primary' : 'border-transparent dark:border-gray-800'}`}
                                >
                                    <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(file.id)}
                                            onChange={() => toggleSelect(file.id)}
                                            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary !cursor-pointer bg-white shadow-sm"
                                        />
                                    </div>
                                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black/60 text-white z-10 opacity-0 group-hover:opacity-100 backdrop-blur-sm uppercase">
                                        {file.folder}
                                    </div>

                                    <div
                                        className="aspect-square relative bg-white dark:bg-black/20"
                                        onClick={() => { setSelectedFile(file); setAltText(file.alt || ''); }}
                                    >
                                        <Image
                                            src={file.filePath}
                                            alt={file.alt || file.originalName}
                                            fill
                                            sizes="(max-width: 768px) 50vw, 20vw"
                                            className="object-contain p-1"
                                            unoptimized
                                        />
                                    </div>
                                    <div
                                        className="p-3 bg-white dark:bg-dark-surface"
                                        onClick={() => { setSelectedFile(file); setAltText(file.alt || ''); }}
                                    >
                                        <p className="text-xs font-semibold text-gray-800 dark:text-white truncate" title={file.alt || file.originalName}>
                                            {file.alt || file.originalName}
                                        </p>
                                        <div className="flex justify-between items-center mt-1">
                                            <p className="text-[10px] text-gray-500">{formatSize(file.fileSize)}</p>
                                            <p className="text-[10px] tracking-tight text-gray-400 font-mono">
                                                {new Date(file.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-dark-surface shadow-sm rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden text-sm">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-dark-bg text-gray-600 dark:text-gray-400 font-medium">
                                    <tr>
                                        <th className="py-3 px-4 w-12 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.size === media.length && media.length > 0}
                                                onChange={toggleSelectAll}
                                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                        </th>
                                        <th className="py-3 px-4">Preview</th>
                                        <th className="py-3 px-4">Title / File Name</th>
                                        <th className="py-3 px-4">Folder</th>
                                        <th className="py-3 px-4">Size</th>
                                        <th className="py-3 px-4">Uploaded Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {media.map((file) => (
                                        <tr key={file.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                                            <td className="py-2 px-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.has(file.id)}
                                                    onChange={() => toggleSelect(file.id)}
                                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary !cursor-pointer"
                                                />
                                            </td>
                                            <td className="py-2 px-4 cursor-pointer" onClick={() => { setSelectedFile(file); setAltText(file.alt || ''); }}>
                                                <div className="w-12 h-12 relative bg-gray-100 dark:bg-gray-800 rounded overflow-hidden border dark:border-gray-700">
                                                    <Image src={file.filePath} alt={file.alt || file.originalName} fill className="object-cover" unoptimized />
                                                </div>
                                            </td>
                                            <td className="py-2 px-4 cursor-pointer" onClick={() => { setSelectedFile(file); setAltText(file.alt || ''); }}>
                                                <div className="font-semibold text-gray-800 dark:text-gray-200">{file.alt || file.originalName}</div>
                                                <div className="text-[11px] font-mono text-gray-400">{file.fileName}</div>
                                            </td>
                                            <td className="py-2 px-4"><span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono uppercase">{file.folder}</span></td>
                                            <td className="py-2 px-4 text-gray-500">{formatSize(file.fileSize)}</td>
                                            <td className="py-2 px-4 text-gray-500">{new Date(file.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex flex-wrap justify-center items-center mt-8 gap-2">
                            <button
                                onClick={() => setPage(1)}
                                disabled={page === 1}
                                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 text-xs font-semibold"
                            >
                                First
                            </button>
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 text-sm font-medium"
                            >
                                Prev
                            </button>
                            <span className="px-4 py-2 bg-gray-50 dark:bg-dark-bg font-medium text-sm border border-gray-200 dark:border-gray-700 rounded-lg">
                                Page {page} of {totalPages} ({totalCount.toLocaleString()} items)
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 text-sm font-medium"
                            >
                                Next
                            </button>
                            <button
                                onClick={() => setPage(totalPages)}
                                disabled={page === totalPages}
                                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 text-xs font-semibold"
                            >
                                Last
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* DETAIL MODAL */}
            {selectedFile && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
                    onClick={(e) => { if (e.target === e.currentTarget) setSelectedFile(null); }}
                >
                    <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95">

                        {/* Preview Area */}
                        <div className="w-full md:w-3/5 bg-gray-100 dark:bg-black p-6 flex flex-col relative h-[400px] md:h-auto min-h-[380px] items-center justify-center">
                            <Image
                                src={selectedFile.filePath}
                                alt={selectedFile.alt || selectedFile.originalName}
                                fill
                                className="object-contain p-4"
                                unoptimized
                            />
                            <a
                                href={selectedFile.filePath}
                                target="_blank"
                                className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition backdrop-blur-md"
                            >
                                <Download size={20} />
                            </a>
                        </div>

                        {/* Details Area */}
                        <div className="w-full md:w-2/5 p-6 flex flex-col h-full overflow-y-auto">
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-xl font-bold truncate pr-4 text-gray-900 dark:text-white" title={selectedFile.originalName}>
                                    File Details
                                </h3>
                                <button onClick={() => setSelectedFile(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-5 flex-1">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">File Name</label>
                                    <p className="text-sm font-medium break-all mt-1">{selectedFile.originalName}</p>
                                    <p className="text-[11px] font-mono text-gray-400 break-all mt-0.5">{selectedFile.fileName}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Size</label>
                                        <p className="text-sm font-mono mt-1">{formatSize(selectedFile.fileSize)}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Date</label>
                                        <p className="text-sm mt-1">{new Date(selectedFile.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">URL Path</label>
                                    <div className="flex mt-1">
                                        <input
                                            readOnly
                                            value={selectedFile.filePath}
                                            className="w-full text-xs font-mono px-3 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-300 dark:border-gray-700 rounded-l focus:outline-none"
                                        />
                                        <button onClick={() => copyUrl(selectedFile.filePath)} className="bg-gray-200 dark:bg-gray-700 px-3 border border-l-0 border-gray-300 dark:border-gray-700 rounded-r hover:bg-gray-300 transition text-gray-700 dark:text-gray-300">
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex justify-between">
                                        Alt Text / Title
                                        {isSavingAlt && <span className="text-primary normal-case text-[10px] animate-pulse">Saving...</span>}
                                    </label>
                                    <textarea
                                        rows={2}
                                        placeholder="Add SEO description..."
                                        value={altText}
                                        onChange={(e) => setAltText(e.target.value)}
                                        onBlur={saveAltText}
                                        className="w-full mt-1 text-sm px-3 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-300 dark:border-gray-700 rounded focus:border-primary focus:ring-1 focus:ring-primary"
                                    ></textarea>
                                </div>

                                <div className="pt-4 border-t dark:border-gray-800">
                                    <p className="text-xs text-gray-500">
                                        Uploaded by: <span className="font-semibold text-gray-800 dark:text-gray-300">{selectedFile.user?.name || 'System'}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            {canDelete && (
                                <div className="mt-6 pt-4 border-t dark:border-gray-800">
                                    <button
                                        onClick={() => deleteMedia([selectedFile.id])}
                                        disabled={isDeleting}
                                        className="w-full py-2.5 flex justify-center items-center gap-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-lg font-bold transition border border-red-200 hover:border-red-500"
                                    >
                                        <Trash2 size={18} /> {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
