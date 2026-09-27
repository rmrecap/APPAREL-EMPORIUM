import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { syncTelegramChannelVideos, TELEGRAM_CONFIG } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

// Curated demo/seed videos of real apparel production lines to showcase immediately if the database is newly initialized
const DEMO_GARMENT_VIDEOS = [
    {
        messageId: 101,
        fileId: 'https://assets.mixkit.co/videos/preview/mixkit-sewing-machine-working-on-a-garment-41589-large.mp4',
        title: 'Automated Precision Stitching & Rib Hemming',
        caption: 'High-speed Juki sewing assembly line ensuring seamless dimensional stability and 4-stitch overlock finish at Apparel Emporium Bangladesh.',
        duration: 28,
        thumbnailUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80',
        width: 1920,
        height: 1080,
        viewsCount: 1420
    },
    {
        messageId: 102,
        fileId: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-a-tailor-working-with-fabric-41586-large.mp4',
        title: 'Master Pattern Grading & Precision Cutting',
        caption: 'Computerized Gerber laser cutting with tight-tolerance fabric alignment for premium export-grade woven and knit apparel sourcing.',
        duration: 34,
        thumbnailUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80',
        width: 1920,
        height: 1080,
        viewsCount: 2180
    },
    {
        messageId: 103,
        fileId: 'https://assets.mixkit.co/videos/preview/mixkit-spinning-yarn-on-a-textile-factory-loom-41584-large.mp4',
        title: 'OEKO-TEX Certified Circular Knitting & Yarn Spinning',
        caption: 'BCI combed cotton yarn spinning and automated jacquard circular knitting operations adhering to strict eco-friendly chemical compliance.',
        duration: 42,
        thumbnailUrl: 'https://images.unsplash.com/photo-1574634534894-89d7576c8259?w=800&auto=format&fit=crop&q=80',
        width: 1920,
        height: 1080,
        viewsCount: 3450
    },
    {
        messageId: 104,
        fileId: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-tailor-working-with-a-needle-and-thread-41587-large.mp4',
        title: 'Final In-line QA Inspection & Needle Detection',
        caption: 'Rigorous AQL 1.5/2.5 multi-stage quality assurance check, computerized needle detection, and barcode poly packaging for global dispatch.',
        duration: 25,
        thumbnailUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop&q=80',
        width: 1920,
        height: 1080,
        viewsCount: 1890
    }
];

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const shouldSync = searchParams.get('sync') === 'true';

        if (shouldSync) {
            await syncTelegramChannelVideos();
        }

        let videos: any[] = await (prisma as any).telegramVideo.findMany({
            where: { isActive: true },
            orderBy: { publishedAt: 'desc' },
            take: 20,
        });

        // If no videos exist yet in DB, seed with initial demo videos so user gets an immediate WOW experience
        if (videos.length === 0) {
            for (const v of DEMO_GARMENT_VIDEOS) {
                await (prisma as any).telegramVideo.create({
                    data: {
                        messageId: v.messageId,
                        fileId: v.fileId,
                        title: v.title,
                        caption: v.caption,
                        duration: v.duration,
                        thumbnailUrl: v.thumbnailUrl,
                        width: v.width,
                        height: v.height,
                        viewsCount: v.viewsCount,
                        isActive: true,
                    }
                }).catch(() => {});
            }
            videos = await (prisma as any).telegramVideo.findMany({
                where: { isActive: true },
                orderBy: { publishedAt: 'desc' },
            });
        }

        const formattedVideos = videos.map((video: any) => ({
            id: video.id,
            messageId: video.messageId,
            title: video.title || `Apparel Video #${video.messageId}`,
            caption: video.caption || '',
            duration: video.duration || 0,
            formattedDuration: video.duration ? `${Math.floor(video.duration / 60)}:${String(video.duration % 60).padStart(2, '0')}` : '0:30',
            streamUrl: `/api/videos/stream/${video.messageId}`,
            thumbnailUrl: video.thumbnailUrl || (video.fileId?.startsWith('http') ? video.fileId : null),
            width: video.width || 1280,
            height: video.height || 720,
            viewsCount: video.viewsCount,
            publishedAt: video.publishedAt,
            channelLink: `https://t.me/${TELEGRAM_CONFIG.channelId.replace('@', '')}/${video.messageId}`,
        }));

        return NextResponse.json({
            success: true,
            total: formattedVideos.length,
            channel: TELEGRAM_CONFIG.channelId,
            videos: formattedVideos,
        });
    } catch (error: any) {
        console.error('[Get Videos Error]', error);
        return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        if (body.action === 'sync') {
            const syncResult = await syncTelegramChannelVideos();
            return NextResponse.json(syncResult);
        }

        if (body.action === 'add' && body.messageId) {
            const newVideo = await (prisma as any).telegramVideo.create({
                data: {
                    messageId: parseInt(body.messageId, 10),
                    fileId: body.fileId || '',
                    title: body.title || `Telegram Video #${body.messageId}`,
                    caption: body.caption || '',
                    duration: body.duration || 0,
                    thumbnailUrl: body.thumbnailUrl || null,
                    isActive: true,
                }
            });
            return NextResponse.json({ success: true, video: newVideo });
        }

        return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
    }
}
