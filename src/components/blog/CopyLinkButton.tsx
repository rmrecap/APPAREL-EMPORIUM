'use client';
import { useState } from 'react';
import { LinkIcon, Check } from 'lucide-react';

export default function CopyLinkButton({ url }: { url?: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            const targetUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
            if (targetUrl && navigator?.clipboard) {
                await navigator.clipboard.writeText(targetUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        } catch {}
    };

    return (
        <button
            onClick={handleCopy}
            title="Copy link"
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
        >
            {copied ? <Check size={16} className="text-emerald-500" /> : <LinkIcon size={16} />}
            {copied ? 'Link Copied!' : 'Copy Link'}
        </button>
    );
}
