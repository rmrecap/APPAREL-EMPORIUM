import { NextRequest, NextResponse } from 'next/server';
import { extractVideoFromMessage, upsertTelegramVideo, syncTelegramChannelVideos, TELEGRAM_CONFIG } from '@/lib/telegram';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * POST /api/telegram/webhook
 * Handles incoming webhook updates from Telegram Bot
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // 1. Channel post / message detection
        const message = body.channel_post || body.message || body.edited_channel_post || body.edited_message;

        if (message) {
            const videoData = extractVideoFromMessage(message);

            if (videoData) {
                const saved = await upsertTelegramVideo(videoData);
                console.log(`[Telegram Webhook] Successfully processed and stored video for message ID ${videoData.messageId}: ${videoData.title}`);
                return NextResponse.json({ ok: true, videoId: saved.id, messageId: saved.messageId });
            }
        }

        return NextResponse.json({ ok: true, received: true });
    } catch (error: any) {
        console.error('[Telegram Webhook Error]', error);
        return NextResponse.json({ ok: false, error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * GET /api/telegram/webhook
 * Helper endpoint for testing, viewing webhook status, or running manual sync
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const action = searchParams.get('action');

        if (action === 'sync') {
            const result = await syncTelegramChannelVideos();
            return NextResponse.json(result);
        }

        if (action === 'setWebhook') {
            const domain = searchParams.get('url') || req.nextUrl.origin;
            const webhookUrl = `${domain}/api/telegram/webhook`;
            
            const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/setWebhook?url=${encodeURIComponent(webhookUrl)}&allowed_updates=["message","channel_post","edited_channel_post"]`);
            const data = await res.json();
            return NextResponse.json({ targetUrl: webhookUrl, telegramResponse: data });
        }

        // Default: Get Webhook Info & Statistics
        const infoRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/getWebhookInfo`);
        const info = await infoRes.json();
        const totalVideos = await (prisma as any).telegramVideo.count();

        return NextResponse.json({
            ok: true,
            channel: TELEGRAM_CONFIG.channelId,
            botConnected: true,
            totalVideosInDb: totalVideos,
            telegramWebhookInfo: info.result || info,
        });
    } catch (error: any) {
        return NextResponse.json({ ok: false, error: error?.message }, { status: 500 });
    }
}
