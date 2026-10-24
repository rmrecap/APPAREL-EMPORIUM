import { prisma } from '@/lib/prisma';
import { Mail, CheckCircle, Clock, FileCheck, Globe, Building2, Phone, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminInquiriesPage() {
    const inquiries = await prisma.contactInquiry.findMany({
        orderBy: { createdAt: 'desc' }
    });

    const leadMagnetCount = inquiries.filter(i => (i.productInterest || '').includes('[Line Sheet Request]')).length;
    const newCount = inquiries.filter(i => i.status === 'NEW').length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-heading">
                        Buyer Inquiries &amp; Lead Magnet Requests
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        Manage incoming inquiries, RFQs, and 2026 Factory Compliance Profile &amp; Line Sheet downloads.
                    </p>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-dark-surface p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Total Inquiries</span>
                    <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{inquiries.length}</p>
                </div>

                <div className="bg-white dark:bg-dark-surface p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <span className="text-xs font-bold uppercase text-emerald-500 tracking-wider flex items-center gap-1.5">
                        <FileCheck className="w-3.5 h-3.5" /> High-Intent Line Sheet Leads
                    </span>
                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{leadMagnetCount}</p>
                </div>

                <div className="bg-white dark:bg-dark-surface p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <span className="text-xs font-bold uppercase text-blue-500 tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> Unhandled / New
                    </span>
                    <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{newCount}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                {inquiries.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">No inquiries found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-semibold">
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Buyer &amp; Company</th>
                                    <th className="p-4">Country / Region</th>
                                    <th className="p-4">Request Type &amp; Category</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Message / Specs</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                                {inquiries.map((inquiry) => {
                                    const isLeadMagnet = (inquiry.productInterest || '').includes('[Line Sheet Request]');

                                    return (
                                        <tr key={inquiry.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="p-4 whitespace-nowrap text-xs text-gray-500 font-mono">
                                                {new Date(inquiry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                <span className="block text-[10px] text-gray-400">
                                                    {new Date(inquiry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </td>

                                            <td className="p-4">
                                                <span className="font-bold text-gray-900 dark:text-white block">
                                                    {inquiry.name}
                                                </span>
                                                <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                    <Building2 className="w-3 h-3 text-gray-400" />
                                                    {inquiry.company || 'Direct Buyer'}
                                                </span>
                                                {inquiry.phone && (
                                                    <span className="text-[11px] text-gray-400 flex items-center gap-1 font-mono mt-0.5">
                                                        <Phone className="w-3 h-3 text-gray-400" />
                                                        {inquiry.phone}
                                                    </span>
                                                )}
                                            </td>

                                            <td className="p-4 whitespace-nowrap text-xs text-gray-700 dark:text-gray-300">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 font-medium">
                                                    <Globe className="w-3 h-3 text-primary" />
                                                    {inquiry.country || 'International'}
                                                </span>
                                            </td>

                                            <td className="p-4">
                                                {isLeadMagnet ? (
                                                    <div className="space-y-1">
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                                                            <Sparkles className="w-3 h-3" /> Line Sheet &amp; Audit Profile
                                                        </span>
                                                        <span className="block text-xs text-gray-500 font-medium">
                                                            {inquiry.productInterest?.replace('[Line Sheet Request]', '').trim()}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                        {inquiry.productInterest || 'General Sourcing Inquiry'}
                                                    </span>
                                                )}
                                            </td>

                                            <td className="p-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                                    inquiry.status === 'NEW'
                                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                        : inquiry.status === 'READ'
                                                            ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                                            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                }`}>
                                                    {inquiry.status === 'NEW' && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>}
                                                    {inquiry.status}
                                                </span>
                                            </td>

                                            <td className="p-4 max-w-xs text-xs text-gray-600 dark:text-gray-400 whitespace-pre-line line-clamp-3" title={inquiry.message}>
                                                {inquiry.message}
                                            </td>

                                            <td className="p-4 text-right whitespace-nowrap">
                                                <a
                                                    href={`mailto:${inquiry.email}?subject=Apparel%20Emporium%202026%20Factory%20Compliance%20Profile%20%26%20Line%20Sheet&body=Hi%20${encodeURIComponent(inquiry.name)},%0D%0A%0D%0AThank%20you%20for%20contacting%20Apparel%20Emporium.%20Attached%20is%20our%202026%20Factory%20Compliance%20Dossier%20and%20Product%20Line%20Sheet.`}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors text-xs font-bold"
                                                >
                                                    <Mail className="w-3.5 h-3.5" /> Send Dossier
                                                </a>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
