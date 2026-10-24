import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Calendar, User, Clock, ArrowLeft, Facebook, Twitter, Linkedin } from 'lucide-react';
import B2BLeadMagnetSection from '@/components/leads/B2BLeadMagnetSection';
import CopyLinkButton from '@/components/blog/CopyLinkButton';

export const dynamic = 'force-dynamic';

type PageProps = {
    params: Promise<{ slug: string }> | { slug: string };
};

// ── Dynamic SEO Metadata ────────────────────────────────────────────────────
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const resolvedParams = await Promise.resolve(params);
    const slug = resolvedParams?.slug;
    if (!slug) return { title: 'Post Not Found' };

    let decodedSlug = slug;
    try {
        decodedSlug = decodeURIComponent(slug);
    } catch { }

    const post = await prisma.blogPost.findFirst({
        where: {
            OR: [
                { slug },
                { slug: decodedSlug }
            ]
        }
    });
    if (!post) return { title: 'Post Not Found' };
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aelbd.net';

    const effectiveTitle = (slug === 'bsci-vs-sedex-compliance-standards-guide' || decodedSlug === 'bsci-vs-sedex-compliance-standards-guide')
        ? 'BSCI vs SEDEX (SMETA): Apparel Compliance Guide for Global Buyers [2026]'
        : (post.seoTitle || `${post.title} | Apparel Emporium Blog`);

    const effectiveDescription = (slug === 'bsci-vs-sedex-compliance-standards-guide' || decodedSlug === 'bsci-vs-sedex-compliance-standards-guide')
        ? 'Complete BSCI vs SEDEX (SMETA) compliance guide for global apparel buyers. Compare 4-pillar SMETA audit checklists, eliminate duplicate audits, and source from certified garment factories in Bangladesh.'
        : (post.seoDescription || post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 160));

    return {
        title: effectiveTitle,
        description: effectiveDescription,
        alternates: {
            canonical: `/blog/${post.slug}`,
        },
        openGraph: {
            title: effectiveTitle,
            description: effectiveDescription,
            url: `${baseUrl}/blog/${post.slug}`,
            images: post.coverImage ? [{ url: post.coverImage }] : [],
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: effectiveTitle,
            description: effectiveDescription,
            images: post.coverImage ? [post.coverImage] : [],
        },
    };
}

// ── Reading time estimate ───────────────────────────────────────────────────
function getReadingTime(html?: string | null): number {
    const plainText = (html || '').replace(/<[^>]*>/g, '');
    const words = plainText.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
}

export default async function BlogPostPage({ params }: PageProps) {
    const resolvedParams = await Promise.resolve(params);
    const slug = resolvedParams?.slug;
    if (!slug) notFound();

    let decodedSlug = slug;
    try {
        decodedSlug = decodeURIComponent(slug);
    } catch { }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aelbd.net';
    const [post, recentPosts] = await Promise.all([
        prisma.blogPost.findFirst({
            where: {
                OR: [
                    { slug },
                    { slug: decodedSlug }
                ]
            },
            include: { author: { select: { name: true, avatar: true, email: true } } }
        }),
        prisma.blogPost.findMany({
            where: {
                isPublished: true,
                slug: { notIn: [slug, decodedSlug] }
            },
            orderBy: { publishedAt: 'desc' },
            take: 4,
            select: { id: true, slug: true, title: true, excerpt: true, coverImage: true, publishedAt: true }
        }),
    ]);

    if (!post || !post.isPublished) notFound();

    const readingTime = getReadingTime(post.content);
    const publishedDate = post.publishedAt
        ? new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : '';

    // Social share URLs (populated server-side with the post title + slug)
    const postUrl = `${baseUrl}/blog/${post.slug}`;
    const encodedUrl = encodeURIComponent(postUrl);
    const encodedTitle = encodeURIComponent(post.title);

    const socialLinks = [
        {
            label: 'Facebook',
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            Icon: Facebook,
            color: 'hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]',
        },
        {
            label: 'Twitter / X',
            href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
            Icon: Twitter,
            color: 'hover:bg-[#1DA1F2] hover:text-white hover:border-[#1DA1F2]',
        },
        {
            label: 'LinkedIn',
            href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
            Icon: Linkedin,
            color: 'hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2]',
        },
    ];

    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        'headline': post.title,
        'description': post.excerpt || '',
        'image': post.coverImage ? [post.coverImage] : [],
        'datePublished': post.publishedAt ? new Date(post.publishedAt).toISOString() : new Date().toISOString(),
        'dateModified': post.updatedAt ? new Date(post.updatedAt).toISOString() : new Date().toISOString(),
        'author': {
            '@type': 'Person',
            'name': post.author?.name || 'Apparel Emporium Editorial Team',
        },
        'publisher': {
            '@type': 'Organization',
            'name': 'Apparel Emporium',
            'logo': {
                '@type': 'ImageObject',
                'url': `${baseUrl}/logo.jpg`,
            },
        },
        'mainEntityOfPage': {
            '@type': 'WebPage',
            '@id': `${baseUrl}/blog/${post.slug}`,
        },
    };

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            {
                '@type': 'ListItem',
                'position': 1,
                'name': 'Home',
                'item': baseUrl,
            },
            {
                '@type': 'ListItem',
                'position': 2,
                'name': 'Blog',
                'item': `${baseUrl}/blog`,
            },
            {
                '@type': 'ListItem',
                'position': 3,
                'name': post.title,
                'item': `${baseUrl}/blog/${post.slug}`,
            },
        ],
    };

    const blogFaqsBySlug: Record<string, Array<{ question: string; answer: string }>> = {
        'bsci-vs-sedex-compliance-standards-guide': [
            {
                question: 'What is the main difference between BSCI and SEDEX (SMETA)?',
                answer: 'BSCI is a brand-driven auditing framework governed by amfori with letter grades (A-E) across 13 performance areas, popular among European retailers. SEDEX is an online collaborative data-sharing platform utilizing SMETA audits (2-Pillar or 4-Pillar), allowing manufacturers to share audit results with unlimited global buyers without duplicate audits.'
            },
            {
                question: 'Do garment factories in Bangladesh hold both BSCI and SEDEX audits?',
                answer: 'Yes. Leading export garment manufacturing factories in Bangladesh maintain dual certifications for both BSCI and SEDEX SMETA, alongside OEKO-TEX Standard 100, RSC building safety, and ISO 9001 quality management.'
            },
            {
                question: 'How does SEDEX eliminate duplicate audits for overseas buyers?',
                answer: 'Under SEDEX, suppliers upload their third-party SMETA audit reports and Corrective Action Plans (CAPR) directly to the SEDEX platform. Any registered buyer globally can access and verify the audit, avoiding redundant thousands-of-dollars audit inspection fees.'
            },
            {
                question: 'How does Apparel Emporium ensure social compliance for buyers?',
                answer: 'Apparel Emporium partners exclusively with pre-screened BSCI and SEDEX compliant factories in Bangladesh. Our in-house technical compliance officers conduct preliminary factory floor inspections, review wage disbursements, and ensure full adherence to international labour and safety standards.'
            }
        ],
        'higg-vs-smeta-social-audit-standard-fashion-supply-chain': [
            {
                question: 'What is the primary difference between Higg Index and SEDEX SMETA?',
                answer: 'The Higg Index (Higg FEM) evaluates environmental sustainability metrics like carbon emissions, water consumption, and chemical usage. SEDEX SMETA focuses on human rights, labor laws, occupational health and safety, and business ethics. Leading fashion brands utilize both frameworks to achieve comprehensive ESG compliance.'
            },
            {
                question: 'Can a factory replace a SMETA audit with Higg FEM?',
                answer: 'No. Higg FEM does not assess labor standards or wage disclosures. To cover social compliance, brands either use SMETA or the Higg Facility Social & Labor Module (Higg FSLM/SLCP). SMETA 4-Pillar remains the most widely recognized third-party social audit for retail compliance globally.'
            },
            {
                question: 'Do Bangladesh garment factories have verified Higg FEM scores?',
                answer: 'Yes. Bangladesh is home to over 200 LEED-certified green garment factories and hundreds of export facilities that undergo annual Higg FEM verification, demonstrating exceptional water recycling and energy efficiency.'
            },
            {
                question: 'How does Apparel Emporium assist buyers with Higg and SMETA verification?',
                answer: 'Apparel Emporium connects overseas buyers directly with verified suppliers in Bangladesh that maintain active SEDEX memberships and verified Higg Index profiles, providing transparent documentation before orders begin.'
            }
        ],
        'how-sedex-membership-reduces-supplier-audit-duplication': [
            {
                question: 'What is audit duplication in apparel manufacturing?',
                answer: 'Audit duplication occurs when multiple global buyers independently commission separate third-party audits on the same factory within weeks of each other, testing identical labor and safety standards and costing thousands of dollars in redundant fees.'
            },
            {
                question: 'How does the SEDEX collaborative platform prevent redundant audits?',
                answer: 'A supplier conducts one standardized SMETA audit and uploads the report and Corrective Action Plan Report (CAPR) to the SEDEX platform. Any registered global buyer can view and verify this audit with supplier permission, eliminating the need to commission a separate inspection.'
            },
            {
                question: 'How much money and time does SEDEX save global fashion brands?',
                answer: 'Brands typically save $1,500 to $2,500 per supplier audit and accelerate production onboarding from 4-8 weeks down to 24-48 hours, allowing orders to proceed straight to sampling and manufacturing.'
            },
            {
                question: 'Do Apparel Emporium partner factories share existing SEDEX audits?',
                answer: 'Yes. All our manufacturing partners in Bangladesh maintain active SEDEX profiles with current SMETA 4-Pillar audits that can be linked directly with your buyer account on the SEDEX Advance platform.'
            }
        ],
        'apparel-sourcing-company-bangladesh-buyer-guide': [
            {
                question: 'Why source knitwear, woven, and sweaters from Bangladesh?',
                answer: 'Bangladesh offers unrivaled vertical supply chain integration, duty-free market access to major global markets, advanced Shima Seiki computerized knitting, state-of-the-art sustainable denim laundries, and highly competitive FOB pricing.'
            },
            {
                question: 'What is the standard production lead time for garment orders in Bangladesh?',
                answer: 'Standard bulk production lead time is 45 to 60 days from final sample and trim approval. Initial proto samples and tech-pack mockups are turned around within 5 to 7 days.'
            },
            {
                question: 'What are typical MOQs when working with a Bangladesh buying house?',
                answer: 'Apparel Emporium accommodates MOQs starting from 1,000 pieces per style for circular knitwear and woven items, and 1,200 pieces for sweaters, with flexible color and size breakdowns.'
            },
            {
                question: 'What quality assurance standards are maintained prior to export?',
                answer: 'Every order is inspected to strict AQL 1.5 Major / 2.5 Minor benchmarks under MIL-STD-105E. Quality control covers 4-point fabric inspection, in-line process monitoring, needle detection, and final container loading inspection at Chittagong Port.'
            }
        ]
    };

    const currentFaqs = blogFaqsBySlug[post.slug] || null;

    const faqSchema = currentFaqs ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': currentFaqs.map((item) => ({
            '@type': 'Question',
            'name': item.question,
            'acceptedAnswer': {
                '@type': 'Answer',
                'text': item.answer
            }
        }))
    } : null;

    return (
        <div className="bg-light-bg dark:bg-dark-bg min-h-screen pt-28 pb-16">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            {faqSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
                />
            )}
            <div className="container mx-auto px-4 max-w-7xl">

                {/* Breadcrumb */}
                <nav className="flex gap-2 items-center text-sm mb-10 text-gray-500 dark:text-gray-400">
                    <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
                    <span>/</span>
                    <span className="text-primary font-medium truncate max-w-xs">{post.title}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* ── MAIN ARTICLE ──────────────────────────── */}
                    <article className="lg:col-span-8">
                        <div className="bg-white dark:bg-dark-surface rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">

                            {/* Cover Image */}
                            {post.coverImage && (
                                <div className="aspect-[16/7] relative overflow-hidden">
                                    <img
                                        src={post.coverImage}
                                        alt={post.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            <div className="p-8 md:p-12">
                                {/* Category badge */}
                                <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-6">
                                    Garments Industry
                                </span>

                                {/* Title */}
                                <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
                                    {post.title}
                                </h1>

                                {/* Meta row */}
                                <div className="flex flex-wrap items-center gap-5 mb-8 pb-8 border-b border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                                            {post.author?.name?.charAt(0)?.toUpperCase() || 'A'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white text-sm">{post.author?.name || 'Editorial Team'}</p>
                                            <p className="text-xs text-gray-500">Author</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                        <Calendar size={14} className="text-primary" />
                                        {publishedDate}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                        <Clock size={14} className="text-primary" />
                                        {readingTime} min read
                                    </div>
                                </div>

                                {/* Article Content — renders HTML safely */}
                                <div
                                    className={[
                                        'prose prose-lg dark:prose-invert max-w-none',
                                        'text-gray-700 dark:text-gray-300 leading-relaxed',
                                        'prose-headings:text-gray-900 dark:prose-headings:text-white prose-headings:font-bold',
                                        'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
                                        'prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-lg prose-blockquote:py-1',
                                        'prose-img:rounded-xl prose-img:shadow-md',
                                    ].join(' ')}
                                    dangerouslySetInnerHTML={{ __html: post.content }}
                                />

                                {/* ── HIGH VISIBILITY B2B SOURCING CTA ── */}
                                <div className="my-10 p-7 sm:p-9 rounded-3xl bg-gradient-to-br from-[#142338] to-[#1E3A5F] text-white shadow-2xl relative overflow-hidden border border-blue-400/20">
                                    <div className="relative z-10 max-w-2xl">
                                        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-4">
                                            Audited &amp; Compliant Sourcing in Bangladesh
                                        </span>
                                        <h3 className="text-2xl sm:text-3xl font-black font-heading mb-3 text-white">
                                            Source with 100% BSCI &amp; SEDEX Compliance
                                        </h3>
                                        <p className="text-blue-100/90 text-sm sm:text-base leading-relaxed mb-6 font-medium">
                                            Looking for zero-audit-duplication manufacturing in Bangladesh? Apparel Emporium connects global buyers directly with ethically vetted partner factories across Woven, Knitwear, and Sweaters with transparent pricing and AQL 1.5 quality assurance.
                                        </p>

                                        {/* Action Buttons */}
                                        <div className="flex flex-wrap items-center gap-3 mb-6">
                                            <Link
                                                href="/request-quote"
                                                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/25 inline-flex items-center gap-2"
                                            >
                                                Request Sourcing Quote &rarr;
                                            </Link>
                                            <Link
                                                href="/contact"
                                                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-colors inline-flex items-center gap-2"
                                            >
                                                Speak to Sourcing Team
                                            </Link>
                                        </div>

                                        {/* Core Product Categories Quick Links */}
                                        <div className="border-t border-white/10 pt-5">
                                            <p className="text-xs uppercase tracking-wider text-blue-200/70 font-semibold mb-3">
                                                Explore Core Export Product Categories:
                                            </p>
                                            <div className="flex flex-wrap gap-2.5">
                                                <Link
                                                    href="/products/woven"
                                                    className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-xs font-semibold text-white border border-white/10 transition-colors"
                                                >
                                                    Woven Garments &rarr;
                                                </Link>
                                                <Link
                                                    href="/products/knitwear"
                                                    className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-xs font-semibold text-white border border-white/10 transition-colors"
                                                >
                                                    Knitwear &amp; Jersey &rarr;
                                                </Link>
                                                <Link
                                                    href="/products/sweater"
                                                    className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-xs font-semibold text-white border border-white/10 transition-colors"
                                                >
                                                    Export Sweaters &rarr;
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ── B2B FACTORY COMPLIANCE & LINE SHEET LEAD MAGNET ── */}
                                <B2BLeadMagnetSection
                                    sourcePage={`/blog/${post.slug}`}
                                    title="Request 2026 Factory Compliance Profile & Line Sheet"
                                    subtitle="Direct access to verified BSCI & SMETA audit certificates, manufacturing capacity schedules, and FOB export price matrices."
                                />

                                {/* Tags display */}
                                {(post as any).tags && (
                                    <div className="mt-10 pt-8 border-t border-gray-100 dark:border-gray-800">
                                        <div className="flex flex-wrap gap-2">
                                            {String((post as any).tags).split(',').map((tag: string) => (
                                                <span
                                                    key={tag.trim()}
                                                    className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm rounded-full font-medium"
                                                >
                                                    #{tag.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ── SOCIAL SHARING ─────────────────────── */}
                                <div className="mt-10 pt-8 border-t border-gray-100 dark:border-gray-800">
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                                        Share this article
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        {socialLinks.map(({ label, href, Icon, color }) => (
                                            <a
                                                key={label}
                                                href={href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title={`Share on ${label}`}
                                                className={`inline-flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 transition-all ${color}`}
                                            >
                                                <Icon size={16} />
                                                {label}
                                            </a>
                                        ))}
                                        {/* Copy link button */}
                                        <CopyLinkButton url={postUrl} />
                                    </div>
                                </div>

                                {/* ── AUTHOR BIO ─────────────────────────── */}
                                <div className="mt-12 p-6 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/20 flex items-center gap-5">
                                    <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center text-2xl font-black shrink-0">
                                        {post.author?.name?.charAt(0)?.toUpperCase() || 'A'}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Written by</p>
                                        <p className="font-bold text-gray-900 dark:text-white text-lg">{post.author?.name || 'Editorial Team'}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Content team at <strong>Apparel Emporium</strong> — covering garments sourcing, trade compliance, and sustainable manufacturing.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Back link */}
                        <div className="mt-8">
                            <Link href="/blog" className="inline-flex items-center gap-2 text-primary font-bold hover:underline group">
                                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                Back to All Articles
                            </Link>
                        </div>
                    </article>

                    {/* ── SIDEBAR: RECENT POSTS ─────────────────── */}
                    <aside className="lg:col-span-4 space-y-8">

                        {/* Sticky wrapper */}
                        <div className="lg:sticky lg:top-24 space-y-6">

                            {/* Recent Articles */}
                            <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
                                <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-5">
                                    Recent Articles
                                </h2>
                                <div className="space-y-5">
                                    {recentPosts.map((rp) => (
                                        <Link
                                            key={rp.id}
                                            href={`/blog/${rp.slug}`}
                                            className="flex gap-4 group"
                                        >
                                            {/* Thumbnail */}
                                            <div className="w-20 h-16 rounded-xl overflow-hidden bg-primary/10 shrink-0 relative">
                                                {rp.coverImage ? (
                                                    <img src={rp.coverImage} alt={rp.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center text-primary/30 text-2xl font-black">
                                                        {rp.title?.charAt(0) || 'A'}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 leading-tight mb-1">
                                                    {rp.title || 'Recent Article'}
                                                </p>
                                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                                    <Calendar size={10} />
                                                    {rp.publishedAt ? new Date(rp.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                    {recentPosts.length === 0 && (
                                        <p className="text-sm text-gray-400 italic">No other articles yet.</p>
                                    )}
                                </div>
                            </div>

                            {/* CTA Box */}
                            <div className="bg-primary text-white rounded-2xl p-6">
                                <h3 className="font-black text-lg mb-2">Need Garments Sourcing?</h3>
                                <p className="text-sm text-white/80 mb-5 leading-relaxed">
                                    Let our experts handle your entire sourcing process — from factory selection to quality control and shipment.
                                </p>
                                <Link
                                    href="/request-quote"
                                    className="block w-full text-center bg-secondary text-primary font-black py-3 rounded-xl hover:bg-secondary/90 transition-colors text-sm"
                                >
                                    Request a Free Quote →
                                </Link>
                            </div>

                            {/* Social share (sidebar duplicate for desktop visibility) */}
                            <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                                <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Share</h3>
                                <div className="flex gap-3">
                                    {socialLinks.map(({ label, href, Icon, color }) => (
                                        <a
                                            key={label}
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title={`Share on ${label}`}
                                            className={`flex-1 flex items-center justify-center p-3 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 transition-all ${color}`}
                                        >
                                            <Icon size={18} />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                </div>
            </div>
        </div>
    );
}
