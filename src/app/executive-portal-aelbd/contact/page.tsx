'use client';

import React, { useState, useEffect } from 'react';
import { usePermission } from '@/hooks/usePermission';
import {
    PhoneCall, Save, RefreshCw, CheckCircle, AlertCircle,
    ChevronDown, ChevronRight, Image as ImageIcon, MessageSquare,
    Eye, MapPin, Mail, Phone, Sparkles, Building2
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

const GOAL_FIELDS: FieldDef[] = [
    { key: 'contact_goal_heading', label: 'Goal Banner — Heading', placeholder: 'OUR GOAL OF SERVICE' },
    {
        key: 'contact_goal_subtitle',
        label: 'Goal Banner — Subtitle / Inspection Statement',
        type: 'textarea',
        placeholder: 'Quality products are our main goal of services. Our efficient and highly quality assurance team involved in method of level wise inspection.',
        hint: 'Displays inside the embossed 3D plaque at the top of the contact page.'
    },
];

const CONTACT_CARD_FIELDS: FieldDef[] = [
    { key: 'contact_heading', label: 'Contact Us — Heading', placeholder: 'CONTACT US' },
    {
        key: 'contact_subtitle',
        label: 'Contact Us — Description',
        type: 'textarea',
        placeholder: 'Feel free to talk to our representative at any time through our website or by using one of our contact numbers. Let us build your future together.',
        hint: 'Main introductory text inside the glassmorphic contact panel.'
    },
];

const CONTACT_CHANNELS_FIELDS: FieldDef[] = [
    { key: 'proprietor_name', label: 'Proprietor / Executive Name', placeholder: 'Md. Kamal Hossain', hint: 'Displayed in corporate leadership cards, signatures and footer.' },
    { key: 'proprietor_title', label: 'Proprietor Designation / Role', placeholder: 'Proprietor', hint: 'Official leadership title.' },
    { key: 'contact_address_label', label: 'Address Pill — Label', placeholder: 'Address Icon' },
    {
        key: 'contact_address',
        label: 'Corporate Address',
        type: 'textarea',
        placeholder: 'House # 03 (2nd Floor), Road # 12, Sector # 13, Uttara Model Town, Dhaka- 1230, Bangladesh',
        hint: 'Full physical office / buying house address.'
    },
    { key: 'contact_email_label', label: 'Email Pill — Label', placeholder: 'Email Icon' },
    {
        key: 'contact_email',
        label: 'Corporate Email Address',
        placeholder: 'kamal@aelbd.net',
        hint: 'Primary inbox for buyer RFQs and sourcing communications.'
    },
    { key: 'contact_phone_label', label: 'Phone Pill — Label', placeholder: 'Phone Icon' },
    {
        key: 'contact_phone',
        label: 'Corporate Phone / Hotline',
        placeholder: '+88 02 4895 5519, 096 6691 2038',
        hint: 'Primary corporate telephone hotline.'
    },
    { key: 'contact_whatsapp_label', label: 'WhatsApp Pill — Label', placeholder: 'WhatsApp Icon' },
    {
        key: 'contact_whatsapp',
        label: 'Official WhatsApp Number (Click-to-Chat)',
        placeholder: '+88 018 1142 2225',
        hint: 'Direct WhatsApp hotline for buyer & customer inquiries (e.g. +88 018 1142 2225).'
    },
];

const SHOWROOM_FIELDS: FieldDef[] = [
    {
        key: 'contact_showroom_light',
        label: 'Showroom Interior Image (Light Mode)',
        type: 'image',
        hint: '3D beveled framed photo of the showroom atelier for light mode.'
    },
    {
        key: 'contact_showroom_dark',
        label: 'Showroom Interior Image (Dark Mode)',
        type: 'image',
        hint: 'Dark mode showroom interior with ambient cyan illumination.'
    },
];

const FLOATING_3D_FIELDS: FieldDef[] = [
    {
        key: 'contact_globe_light',
        label: '3D Network Globe Graphic (Light Mode)',
        type: 'image',
        hint: '3D globe with network nodes for light mode floating decoration.'
    },
    {
        key: 'contact_globe_dark',
        label: '3D Network Globe Graphic (Dark Mode)',
        type: 'image',
        hint: 'Glowing cyan 3D cyber globe for dark mode floating decoration.'
    },
    {
        key: 'contact_blazer_light',
        label: '3D Tailored Blazer Asset (Light Mode)',
        type: 'image',
        hint: 'Ivory white tailored blazer on seamless background.'
    },
    {
        key: 'contact_blazer_dark',
        label: '3D Tailored Blazer Asset (Dark Mode)',
        type: 'image',
        hint: 'Dark charcoal tailored blazer with cyan rim glow.'
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
                type="button"
                onClick={onToggle}
                className="w-full flex items-center justify-between px-8 py-5 text-left hover:bg-gray-50/60 dark:hover:bg-white/5 transition-colors cursor-pointer"
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
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-700 text-sm font-medium focus:outline-none focus:border-primary resize-vertical min-h-[90px]"
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
    ...GOAL_FIELDS,
    ...CONTACT_CARD_FIELDS,
    ...CONTACT_CHANNELS_FIELDS,
    ...SHOWROOM_FIELDS,
    ...FLOATING_3D_FIELDS,
].map(f => f.key);

/* ─────────────────────── MAIN PAGE BUILDER ─────────────────────── */
export default function ContactPageBuilder() {
    const { role } = usePermission();
    const [values, setValues] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [openSection, setOpenSection] = useState<string>('goal');

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
            // Revalidate contact page cache
            await fetch('/api/revalidate?path=/contact').catch(() => {});
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
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <PhoneCall size={22} />
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white font-heading">
                            Contact Page Builder (3D Clay & Glass)
                        </h1>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Manage all dynamic text, contact channels, 3D showroom visuals, and 3D floating assets for the{' '}
                        <span className="text-primary font-bold">/contact</span> page.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <a
                        href="/contact"
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-all flex items-center gap-2"
                    >
                        <Eye size={15} />
                        <span>Preview Live Page</span>
                    </a>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                        {saving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
                        <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                </div>
            </div>

            {/* Status alerts */}
            {status === 'success' && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-sm font-bold animate-in fade-in">
                    <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                    <span>Contact page updated successfully! Live page cache revalidated.</span>
                </div>
            )}
            {status === 'error' && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 flex items-center gap-3 text-rose-800 dark:text-rose-300 text-sm font-bold animate-in fade-in">
                    <AlertCircle size={18} className="text-rose-500 shrink-0" />
                    <span>Failed to save changes. Please verify database connection and try again.</span>
                </div>
            )}

            {/* Accordion Sections */}
            <div className="space-y-4">
                <AccordionSection
                    title="1. Our Goal of Service (3D Top Plaque)"
                    icon={<Building2 size={20} />}
                    fields={GOAL_FIELDS}
                    values={values}
                    onChange={handleChange}
                    open={openSection === 'goal'}
                    onToggle={() => toggle('goal')}
                />

                <AccordionSection
                    title="2. Contact Us Main Card Content"
                    icon={<MessageSquare size={20} />}
                    fields={CONTACT_CARD_FIELDS}
                    values={values}
                    onChange={handleChange}
                    open={openSection === 'contact'}
                    onToggle={() => toggle('contact')}
                />

                <AccordionSection
                    title="3. Contact Channels (Address, Email, Phone)"
                    icon={<MapPin size={20} />}
                    fields={CONTACT_CHANNELS_FIELDS}
                    values={values}
                    onChange={handleChange}
                    open={openSection === 'channels'}
                    onToggle={() => toggle('channels')}
                />

                <AccordionSection
                    title="4. 3D Showroom Window Visuals (Light & Dark Mode)"
                    icon={<ImageIcon size={20} />}
                    fields={SHOWROOM_FIELDS}
                    values={values}
                    onChange={handleChange}
                    open={openSection === 'showroom'}
                    onToggle={() => toggle('showroom')}
                />

                <AccordionSection
                    title="5. 3D Floating Assets (Globe & Tailored Blazer)"
                    icon={<Sparkles size={20} />}
                    fields={FLOATING_3D_FIELDS}
                    values={values}
                    onChange={handleChange}
                    open={openSection === 'floating'}
                    onToggle={() => toggle('floating')}
                />
            </div>

            {/* Bottom floating save bar */}
            <div className="sticky bottom-6 bg-white/95 dark:bg-dark-surface/95 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl p-4 flex items-center justify-between">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    All edits are saved to the central settings engine and take effect instantly on{' '}
                    <code className="text-primary font-bold">/contact</code>.
                </p>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                    {saving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
            </div>

        </div>
    );
}
