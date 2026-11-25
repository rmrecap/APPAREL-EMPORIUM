'use client';

import React, { useState, useEffect } from 'react';
import { Search, Folder, X, CheckCircle, Image as ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';
import FileUpload from '@/components/ui/FileUpload';

interface MediaFile {
    id: string;
    filePath: string;
    originalName: string;
    folder: string;
    alt?: string | null;
}

interface MediaLibraryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (filePath: string) => void;
    folder?: string;
    selectedValue?: string;
}

export default function MediaLibraryModal({
    isOpen,
    onClose,
    onSelect,
    folder = 'all',
    selectedValue
}: MediaLibraryModalProps) {
    const [media, setMedia] = useState<MediaFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedFolder, setSelectedFolder] = useState(folder);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');

    useEffect(() => {
        if (isOpen) {
            setSelectedFolder(folder);
            setPage(1);
        }
    }, [isOpen, folder]);

    const fetchMedia = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: page.toString(),
                limit: '48',
                ...(selectedFolder !== 'all' && { folder: selectedFolder }),
                ...(search && { search })
            });
            const res = await fetch(`/api/media?${query.toString()}`);
            const data = await res.json();
            if (data.files) {
                setMedia(data.files);
                setTotalPages(data.pagination?.totalPages || 1);
                setTotal(data.pagination?.total ?? data.total ?? data.files.length);
            }
        } catch (error) {
            console.error('Failed to fetch library', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && activeTab === 'library') {
            const debounce = setTimeout(() => {
                fetchMedia();
            }, search ? 350 : 0);
            return () => clearTimeout(debounce);
        }
    }, [isOpen, search, activeTab, selectedFolder, page]);

    const handleSelect = (filePath: string) => {
        onSelect(filePath);
        onClose();
    };

    const handleUploadComplete = (files: any[]) => {
        if (files && files.length > 0) {
            onSelect(files[0].filePath);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark-surface w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">

                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Folder className="text-primary w-5 h-5" /> Select Media
                        {total > 0 && (
                            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                {total.toLocaleString()}
                            </span>
                        )}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition">
                        <X size={20} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-dark-surface p-6">

                    {/* Tabs */}
                    <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-800">
                        <button
                            className={`pb-3 font-semibold text-sm transition-colors border-b-2 px-1 ${activeTab === 'library' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'}`}
                            onClick={() => setActiveTab('library')}
                        >
                            Media Library
                        </button>
                        <button
                            className={`pb-3 font-semibold text-sm transition-colors border-b-2 px-1 ${activeTab === 'upload' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'}`}
                            onClick={() => setActiveTab('upload')}
                        >
                            Upload New
                        </button>
                    </div>

                    {activeTab === 'library' ? (
                        <div className="flex-1 flex flex-col min-h-0">
                            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search by product name or filename..."
                                        value={search}
                                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-primary text-sm shadow-sm"
                                    />
                                </div>
                                <select
                                    value={selectedFolder}
                                    onChange={(e) => { setSelectedFolder(e.target.value); setPage(1); }}
                                    className="px-3 py-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200"
                                >
                                    <option value="all">All Folders</option>
                                    <option value="products">Products</option>
                                    <option value="logos">Logos &amp; Icons</option>
                                    <option value="demo">Demo</option>
                                    <option value="blog">Blog</option>
                                    <option value="general">General</option>
                                </select>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                {loading ? (
                                    <div className="flex flex-col justify-center items-center h-40 gap-3">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                        <p className="text-sm text-gray-400">Loading library...</p>
                                    </div>
                                ) : media.length === 0 ? (
                                    <div className="text-center py-20 bg-gray-50 dark:bg-dark-bg rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                                        <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 text-sm">No images found matching your search.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 pb-4">
                                        {media.map(file => (
                                            <div
                                                key={file.id}
                                                onClick={() => handleSelect(file.filePath)}
                                                className={`relative aspect-square rounded-lg border-2 overflow-hidden cursor-pointer group bg-gray-100 dark:bg-gray-900 ${selectedValue === file.filePath ? 'border-primary shadow-[0_0_0_2px_rgba(var(--color-primary),0.2)]' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`}
                                            >
                                                <Image src={file.filePath} alt={file.alt || file.originalName} fill className="object-cover" unoptimized />
                                                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/55 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <p className="text-[10px] text-white truncate px-1">{file.alt || file.originalName}</p>
                                                </div>
                                                {selectedValue === file.filePath && (
                                                    <div className="absolute top-1 right-1 bg-primary text-white p-0.5 rounded-full shadow-md z-10 w-5 h-5 flex items-center justify-center">
                                                        <CheckCircle size={14} />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {totalPages > 1 && (
                                <div className="pt-3 mt-2 border-t border-gray-100 dark:border-gray-800 flex justify-center items-center gap-3 text-xs">
                                    <button
                                        type="button"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="px-3 py-1.5 rounded border border-gray-200 dark:border-gray-700 disabled:opacity-40 font-semibold"
                                    >
                                        Prev
                                    </button>
                                    <span className="font-mono text-gray-500">Page {page} / {totalPages}</span>
                                    <button
                                        type="button"
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="px-3 py-1.5 rounded border border-gray-200 dark:border-gray-700 disabled:opacity-40 font-semibold"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto">
                            <FileUpload onUploadComplete={handleUploadComplete} folder={selectedFolder === 'all' ? 'products' : selectedFolder} multiple={false} />
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
