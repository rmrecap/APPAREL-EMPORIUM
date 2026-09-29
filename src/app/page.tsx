// Production deployment: sections updated for aelbd.net
import React from 'react';
import nextDynamic from 'next/dynamic';
import { prisma } from '@/lib/prisma';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import Category3DStage from '@/components/home/Category3DStage';
import ProductionProcess3D from '@/components/home/ProductionProcess3D';
import OurProducts3D from '@/components/home/OurProducts3D';
import CoreValues3D from '@/components/home/CoreValues3D';
import TelegramVideoGallery from '@/components/home/TelegramVideoGallery';

const HeroSlider = nextDynamic(() => import('@/components/home/HeroSlider'), { ssr: false });
const StatsCounter = nextDynamic(() => import('@/components/home/StatsCounter'), { ssr: false });
const CategoryGrid = nextDynamic(() => import('@/components/home/CategoryGrid'));
const WhyChooseUs = nextDynamic(() => import('@/components/home/WhyChooseUs'));
const Certifications = nextDynamic(() => import('@/components/home/Certifications'));
const Testimonials = nextDynamic(() => import('@/components/home/Testimonials'), { ssr: false });
const DeliveryFeed = nextDynamic(() => import('@/components/home/DeliveryFeed'), { ssr: false });
const CTASection = nextDynamic(() => import('@/components/home/CTASection'));

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Apparel Emporium | Trusted Garments Sourcing Partner in Bangladesh',
    description: 'Apparel Emporium is a leading Bangladeshi garments buying house. Providing high-standard quality assurance tailored to buyer requirements, transparent merchandising, and 100% compliant export sourcing.',
};

export default async function HomePage() {

    let settingsRecords: any[] = [];
    try {
        settingsRecords = await prisma.siteSetting.findMany({
            where: { key: { startsWith: 'homepage_' } }
        });
    } catch (err) {
        console.error('Failed to load homepage settings from database:', err);
    }

    const settingsMap = settingsRecords.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
    }, {} as Record<string, string>);

    // Section order
    let sectionOrder: string[] = [];
    try { sectionOrder = JSON.parse(settingsMap['homepage_sections_order'] || '[]'); } catch (e) { }
    if (sectionOrder.length === 0) {
        sectionOrder = ['category_3d_stage', 'featured_products', 'production_process', 'our_products_3d', 'core_values_3d', 'telegram_video_gallery', 'delivery_feed', 'why_choose_us', 'certifications', 'testimonials', 'cta_section'];
    } else {
        if (!sectionOrder.includes('category_3d_stage')) {
            sectionOrder.unshift('category_3d_stage');
        }
        if (!sectionOrder.includes('production_process')) {
            const featIdx = sectionOrder.indexOf('featured_products');
            if (featIdx !== -1) sectionOrder.splice(featIdx + 1, 0, 'production_process');
            else sectionOrder.push('production_process');
        }
        if (!sectionOrder.includes('our_products_3d')) {
            const procIdx = sectionOrder.indexOf('production_process');
            if (procIdx !== -1) sectionOrder.splice(procIdx + 1, 0, 'our_products_3d');
            else sectionOrder.push('our_products_3d');
        }
        if (!sectionOrder.includes('core_values_3d')) {
            const prodIdx = sectionOrder.indexOf('our_products_3d');
            if (prodIdx !== -1) sectionOrder.splice(prodIdx + 1, 0, 'core_values_3d');
            else sectionOrder.push('core_values_3d');
        }
        if (!sectionOrder.includes('telegram_video_gallery')) {
            const valIdx = sectionOrder.indexOf('core_values_3d');
            if (valIdx !== -1) sectionOrder.splice(valIdx + 1, 0, 'telegram_video_gallery');
            else sectionOrder.push('telegram_video_gallery');
        }
        if (!sectionOrder.includes('delivery_feed')) {
            const idx = sectionOrder.indexOf('telegram_video_gallery');
            if (idx !== -1) sectionOrder.splice(idx + 1, 0, 'delivery_feed');
            else sectionOrder.push('delivery_feed');
        }
    }

    // Section visibility
    let visibility: Record<string, boolean> = {};
    try { visibility = JSON.parse(settingsMap['homepage_sections_visibility'] || '{}'); } catch (e) { }
    // Default 3D Stages visibility
    if (visibility['category_3d_stage'] === undefined) {
        visibility['category_3d_stage'] = true;
    }
    if (visibility['production_process'] === undefined) {
        visibility['production_process'] = true;
    }
    // Our Products sections disabled by default as per requirement
    if (visibility['our_products_3d'] === undefined) {
        visibility['our_products_3d'] = false;
    }
    if (visibility['featured_products'] === undefined) {
        visibility['featured_products'] = false;
    }
    if (visibility['core_values_3d'] === undefined) {
        visibility['core_values_3d'] = true;
    }
    if (visibility['telegram_video_gallery'] === undefined) {
        visibility['telegram_video_gallery'] = false;
    }

    // Developer / Admin Icon & Decor controls (defaults to false / disabled as requested)
    const showFloatingIcons = settingsMap['homepage_floating_icons_enabled'] === 'true';
    const showSectionIcons = settingsMap['homepage_section_icons_enabled'] === 'true';

    // Section headings — ALL editable labels from the admin dashboard
    let headings: Record<string, string> = {};
    try { headings = JSON.parse(settingsMap['homepage_section_headings'] || '{}'); } catch (e) { }

    const safeParse = (str: string | undefined, fallback: any = {}) => {
        if (!str) return fallback;
        try { return JSON.parse(str); } catch { return fallback; }
    };

    const announcementSettings = safeParse(settingsMap['homepage_announcement_bar'], null);

    // Section component map — headings, showDecor and showIcons props injected into each relevant component
    const sectionComponentMap: Record<string, JSX.Element | null> = {
        'category_3d_stage': <Category3DStage showDecor={showFloatingIcons} showIcons={showSectionIcons} key="category_3d_stage" />,
        'hero_slider': <HeroSlider data={settingsMap['homepage_hero_slider'] || '[]'} key="hero_slider" />,
        'stats_counter': <StatsCounter data={settingsMap['homepage_stats_counter'] || '[]'} showIcons={showSectionIcons} key="stats_counter" />,
        'category_grid': <CategoryGrid headings={headings} key="category_grid" />,
        'featured_products': <FeaturedProducts headings={headings} showDecor={showFloatingIcons} showIcons={showSectionIcons} key="featured_products" />,
        'production_process': <ProductionProcess3D headings={headings} data={settingsMap['homepage_production_process']} showDecor={showFloatingIcons} showIcons={showSectionIcons} key="production_process" />,
        'our_products_3d': <OurProducts3D headings={headings} data={settingsMap['homepage_our_products_3d']} showDecor={showFloatingIcons} showIcons={showSectionIcons} key="our_products_3d" />,
        'core_values_3d': <CoreValues3D headings={headings} data={settingsMap['homepage_core_values_3d']} showDecor={showFloatingIcons} showIcons={showSectionIcons} key="core_values_3d" />,
        'telegram_video_gallery': <TelegramVideoGallery headings={headings} key="telegram_video_gallery" />,
        'why_choose_us': <WhyChooseUs data={settingsMap['homepage_why_choose_us'] || '[]'} headings={headings} showIcons={showSectionIcons} key="why_choose_us" />,
        'certifications': <Certifications data={settingsMap['homepage_certifications'] || '[]'} headings={headings} showIcons={showSectionIcons} key="certifications" />,
        'testimonials': <Testimonials key="testimonials" />,
        'delivery_feed': <DeliveryFeed key="delivery_feed" />,
        'cta_section': <CTASection data={settingsMap['homepage_cta_section'] || '{}'} key="cta_section" />,
    };

    return (
        <main className="min-h-screen bg-[#DDD8CF] dark:bg-[#080D1A] transition-colors duration-500">
            {visibility['announcement_bar'] !== false && announcementSettings?.text && (
                <div className="w-full text-center py-2 px-4 shadow-sm relative z-50 text-sm font-bold tracking-wide"
                    style={{ backgroundColor: announcementSettings.bgColor || '#1B365D', color: announcementSettings.textColor || '#FFF' }}>
                    <a href={announcementSettings.link || '#'} className="hover:underline">
                        {announcementSettings.text}
                    </a>
                </div>
            )}
            {sectionOrder.map((sectionKey) => {
                if (visibility[sectionKey] === false) return null;
                return sectionComponentMap[sectionKey] || null;
            })}
        </main>
    );
}
