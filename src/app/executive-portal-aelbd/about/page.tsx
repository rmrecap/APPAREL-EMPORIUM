'use client';

import React, { useState, useEffect } from 'react';
import { usePermission } from '@/hooks/usePermission';
import {
    Info, Save, RefreshCw, CheckCircle, AlertCircle,
    ChevronDown, ChevronRight, Image as ImageIcon, FileText, MessageSquare,
    Eye, Layers
} from 'lucide-react';
import ImagePicker from '@/components/admin/ImagePicker';

/* ─────────────────────── Field definitions ─────────────────────── */
interface FieldDef {
    key: string;
    label: string;
    placeholder?: string;
    hint?: string;
    type?: 'text' | 'textarea' | 'image';
}

const ABOUT_FIELDS: FieldDef[] = [
    /* Section 1 — About Us */
    { key: 'about_heading', label: 'About Us — Heading', placeholder: 'ABOUT US' },
    {
        key: 'about_paragraph', label: 'About Us — Paragraph', type: 'textarea',
        placeholder: 'Apparel Emporium is a premier Buying House based in Bangladesh...',
        hint: 'Main descriptive paragraph shown in the left card.'
    },
    {
        key: 'about_image_light', label: 'About Us — Image (Light Mode)', type: 'image',
        hint: 'Mannequin / garment showcase image for the right card (light theme).'
    },
    {
        key: 'about_image_dark', label: 'About Us — Image (Dark Mode)', type: 'image',
        hint: 'Same image for dark theme variant.'
    },
];

const CEO_FIELDS: FieldDef[] = [
    { key: 'ceo_heading', label: 'CEO Message — Heading', placeholder: 'CEO MESSAGE' },
    { key: 'ceo_p1', label: 'CEO Message — Paragraph 1', type: 'textarea', placeholder: 'Our dedication is delivering apparel sourcing strictly tailored to buyer requirements and specifications.' },
    { key: 'ceo_p2', label: 'CEO Message — Paragraph 2', type: 'textarea', placeholder: 'With rigorous multi-stage quality assurance, our team ensures total production transparency and timely deliveries.' },
    { key: 'ceo_p3', label: 'CEO Message — Paragraph 3', type: 'textarea', placeholder: 'We partner with audited manufacturing facilities adhering to global ethical, social, and environmental standards.' },
    { key: 'ceo_signoff', label: 'CEO Message — Sign-off Text', placeholder: 'Managing Director & CEO, Apparel Emporium' },
    { key: 'ceo_image', label: 'CEO Message — CEO Photo', type: 'image', hint: 'Portrait photo of the CEO displayed in the right side of the CEO message card.' },
    { key: 'globe_image_light', label: 'Global Network 3D Globe (Light Mode)', type: 'image', hint: '3D Globe graphic with connected network nodes for light mode.' },
    { key: 'globe_image_dark', label: 'Global Network 3D Globe (Dark Mode)', type: 'image', hint: '3D Globe graphic with neon cyan nodes and lines for dark mode.' },
];

const VMV_FIELDS: FieldDef[] = [
    { key: 'vision_heading', label: 'Vision — Heading', placeholder: 'OUR VISION' },
    { key: 'vision_text', label: 'Vision — Description', type: 'textarea', placeholder: 'Our vision is to be a premier Buying House...' },
    { key: 'mission_heading', label: 'Mission — Heading', placeholder: 'OUR MISSION' },
    { key: 'mission_text', label: 'Mission — Description', type: 'textarea', placeholder: 'Our mission is to source locally leading manufacturers...' },
    { key: 'value_heading', label: 'Value — Heading', placeholder: 'OUR VALUE' },
    { key: 'value_text', label: 'Value — Description', type: 'textarea', placeholder: 'We, Apparel Emporium value our professionals...' },
];

const PROFILE_FIELDS: FieldDef[] = [
    { key: 'profile_btn_text', label: 'Download Button — Label', placeholder: 'DOWNLOAD OUR COMPANY PROFILE' },
    {
        key: 'profile_btn_url', label: 'Download Button — File URL / Link', placeholder: '/company-profile.pdf',
        hint: 'Upload your PDF to Media Library and paste the URL here, or use an external link.'
    },
];

/* ─────────────────────── Accordion section ─────────────────────── */
interface SectionProps {
    title: string;
    icon: React.ReactNode;
    fields: FieldDef[];
    values: Record<string, string>;
    onChange: (key: string, val: string) => void;
    open: boolean;
    onToggle: () => void;
}
function AccordionSection({ title, icon, fields, values, onChange, open, onToggle }: SectionProps) {
    return (
        <div className="bg-white dark:bg-dark-surface rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between px-8 py-5 text-left hover:bg-gray-50/60 dark:hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        {icon}
                    </div>
                    <span className="font-black text-lg text-gray-900 dark:text-white">{title}</span>
                </div>
                {open
                    ? <ChevronDown className="text-gray-400" size={20} />
                    : <ChevronRight className="text-gray-400" size={20} />}
            </button>

            {open && (
                <div className="px-8 pb-8 space-y-6 border-t border-gray-100 dark:border-gray-800 pt-6">
                    {fields.map(f => (
                        <FieldEditor key={f.key} field={f} value={values[f.key] || ''} onChange={v => onChange(f.key, v)} />
                    ))}
                </div>
            )}
        </div>
    );
}

/* ─────────────────────── Individual field ─────────────────────── */
function FieldEditor({ field, value, onChange }: { field: FieldDef; value: string; onChange: (v: string) => void }) {
    if (field.type === 'image') {
        return (
            <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{field.label}</label>
                {field.hint && <p className="text-xs text-gray-400 mb-3">{field.hint}</p>}
                <ImagePicker value={value} onChange={onChange} />
            </div>
        );
    }

    if (field.type === 'textarea') {
        return (
            <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{field.label}</label>
                {field.hint && <p className="text-xs text-gray-400 mb-2">{field.hint}</p>}
                <textarea
                    rows={4}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-700 text-sm font-medium focus:outline-none focus:border-primary resize-vertical min-h-[100px]"
                />
            </div>
        );
    }

    return (
        <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{field.label}</label>
            {field.hint && <p className="text-xs text-gray-400 mb-2">{field.hint}</p>}
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-700 text-sm font-medium focus:outline-none focus:border-primary"
            />
        </div>
    );
}

/* ─────────────────────── ALL FIELD KEYS ─────────────────────── */
const ALL_KEYS = [
    ...ABOUT_FIELDS,
    ...CEO_FIELDS,
    ...VMV_FIELDS,
    ...PROFILE_FIELDS,
].map(f => f.key);

/* ─────────────────────── MAIN PAGE ─────────────────────── */
export default function AboutPageBuilder() {
    const { role } = usePermission();
    const [values, setValues] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [openSection, setOpenSection] = useState<string>('about');

    /* Fetch existing settings on mount */
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings');
                const data = await res.json();
                if (data?.settings) {
                    const filtered: Record<string, string> = {};
                    ALL_KEYS.forEach(k => {
                        if (data.settings[k]) filtered[k] = data.settings[k];
                    });
                    setValues(filtered);
                }
            } catch (e) {
                console.error('Failed to load settings', e);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (key: string, val: string) => {
        setValues(prev => ({ ...prev, [key]: val }));
    };

    const handleSave = async () => {
        setSaving(true);
        setStatus('idle');
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });
            if (!res.ok) throw new Error('Save failed');
            setStatus('success');
            // Revalidate about page cache
            await fetch('/api/revalidate?path=/about').catch(() => {});
        } catch {
            setStatus('error');
        } finally {
            setSaving(false);
            setTimeout(() => setStatus('idle'), 4000);
        }
    };

    if (role !== 'DEVELOPER' && role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
        return <div className="p-12 text-center font-bold text-red-500">Access Denied</div>;
    }

    const toggle = (sec: string) => setOpenSection(prev => prev === sec ? '' : sec);

    return (
        <div className="max-w-4xl mx-auto space-y-8">

            {/* Header */}
            <div className="bg-white dark:bg-dark-surface rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black font-heading flex items-center gap-3">
                        <Info className="text-primary" />
                        About Page Builder
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">
                        Edit all content sections of the <span className="text-primary font-bold">/about</span> page.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <a
                        href="/about"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-primary transition-colors"
                        title="Preview About Page"
                    >
                        <Eye size={20} />
                    </a>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-primary text-white font-black px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all uppercase tracking-widest text-xs disabled:opacity-60"
                    >
                        {saving
                            ? <><RefreshCw size={16} className="animate-spin" /> Saving...</>
                            : <><Save size={16} /> Save Changes</>}
                    </button>
                </div>
            </div>

            {/* Status banner */}
            {status === 'success' && (
                <div className="flex items-center gap-3 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-2xl px-6 py-4 text-green-700 dark:text-green-400 font-bold text-sm">
                    <CheckCircle size={18} /> Changes saved and About page cache refreshed.
                </div>
            )}
            {status === 'error' && (
                <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl px-6 py-4 text-red-700 dark:text-red-400 font-bold text-sm">
                    <AlertCircle size={18} /> Save failed. Please try again.
                </div>
            )}

            {/* ── Section 1 — About Us ── */}
            <AccordionSection
                title="Section 1 — About Us"
                icon={<Info size={18} />}
                fields={ABOUT_FIELDS}
                values={values}
                onChange={handleChange}
                open={openSection === 'about'}
                onToggle={() => toggle('about')}
            />

            {/* ── Section 2 — CEO Message ── */}
            <AccordionSection
                title="Section 2 — CEO Message"
                icon={<MessageSquare size={18} />}
                fields={CEO_FIELDS}
                values={values}
                onChange={handleChange}
                open={openSection === 'ceo'}
                onToggle={() => toggle('ceo')}
            />

            {/* ── Section 3 — Vision / Mission / Value ── */}
            <AccordionSection
                title="Section 3 — Vision, Mission & Value"
                icon={<Layers size={18} />}
                fields={VMV_FIELDS}
                values={values}
                onChange={handleChange}
                open={openSection === 'vmv'}
                onToggle={() => toggle('vmv')}
            />

            {/* ── Download Profile Button ── */}
            <AccordionSection
                title="Download Company Profile Button"
                icon={<FileText size={18} />}
                fields={PROFILE_FIELDS}
                values={values}
                onChange={handleChange}
                open={openSection === 'profile'}
                onToggle={() => toggle('profile')}
            />

            {/* Bottom Save */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-primary text-white font-black px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all uppercase tracking-widest text-sm disabled:opacity-60"
                >
                    {saving
                        ? <><RefreshCw size={18} className="animate-spin" /> Saving...</>
                        : <><Save size={18} /> Save All Changes</>}
                </button>
            </div>
        </div>
    );
}
