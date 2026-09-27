import { prisma } from './prisma';

export const TELEGRAM_CONFIG = {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '8297878155:AAE42QpSN8xFdC3wHzF8x-79LCToHx_2TG0',
    apiId: parseInt(process.env.TELEGRAM_API_ID || '37160021', 10),
    apiHash: process.env.TELEGRAM_API_HASH || 'd4622a2a8a6d4a6351083caca13925e0',
    channelId: process.env.TELEGRAM_CHANNEL_ID || '@Apparel_Emporium_bd_bot',
};

const TELEGRAM_API_BASE = `https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}`;
const TELEGRAM_FILE_BASE = `https://api.telegram.org/file/bot${TELEGRAM_CONFIG.botToken}`;

export interface ParsedTelegramVideo {
    messageId: number;
    fileId: string;
    fileUniqueId?: string;
    caption?: string;
    title?: string;
    mimeType?: string;
    fileSize?: number;
    duration?: number;
    width?: number;
    height?: number;
    thumbnailUrl?: string;
    publishedAt: Date;
}

/**
 * Parses raw Telegram message/post to extract video info if present
 */
export function extractVideoFromMessage(message: any): ParsedTelegramVideo | null {
    if (!message) return null;

    const messageId = message.message_id;
    const video = message.video || message.animation || (message.document && message.document.mime_type?.startsWith('video/') ? message.document : null);

    if (!video) return null;

    const caption = message.caption || message.text || '';
    const firstLine = caption.split('\n')[0]?.trim();
    const title = firstLine && firstLine.length < 80 ? firstLine : (video.file_name || `Apparel Video #${messageId}`);

    let thumbnailUrl: string | undefined = undefined;
    if (video.thumb?.file_id || video.thumbnail?.file_id) {
        const thumbFileId = video.thumb?.file_id || video.thumbnail?.file_id;
        thumbnailUrl = `/api/telegram/thumb?file_id=${thumbFileId}`;
    }

    const publishedAt = message.date ? new Date(message.date * 1000) : new Date();

    return {
        messageId,
        fileId: video.file_id,
        fileUniqueId: video.file_unique_id,
        caption,
        title,
        mimeType: video.mime_type || 'video/mp4',
        fileSize: video.file_size || 0,
        duration: video.duration || 0,
        width: video.width || 1280,
        height: video.height || 720,
        thumbnailUrl,
        publishedAt,
    };
}

/**
 * Save or update a video record in SQLite database via Prisma
 */
export async function upsertTelegramVideo(videoData: ParsedTelegramVideo) {
    return await (prisma as any).telegramVideo.upsert({
        where: { messageId: videoData.messageId },
        update: {
            fileId: videoData.fileId,
            fileUniqueId: videoData.fileUniqueId,
            caption: videoData.caption,
            title: videoData.title,
            mimeType: videoData.mimeType,
            fileSize: videoData.fileSize,
            duration: videoData.duration,
            width: videoData.width,
            height: videoData.height,
            thumbnailUrl: videoData.thumbnailUrl,
            isActive: true,
            publishedAt: videoData.publishedAt,
        },
        create: {
            messageId: videoData.messageId,
            fileId: videoData.fileId,
            fileUniqueId: videoData.fileUniqueId,
            caption: videoData.caption,
            title: videoData.title,
            mimeType: videoData.mimeType,
            fileSize: videoData.fileSize,
            duration: videoData.duration,
            width: videoData.width,
            height: videoData.height,
            thumbnailUrl: videoData.thumbnailUrl,
            isActive: true,
            publishedAt: videoData.publishedAt,
        }
    });
}

/**
 * Get direct file path from Telegram Bot API
 */
export async function getTelegramFilePath(fileId: string): Promise<string | null> {
    try {
        const res = await fetch(`${TELEGRAM_API_BASE}/getFile?file_id=${encodeURIComponent(fileId)}`, {
            cache: 'no-store'
        });
        const data = await res.json();
        if (data.ok && data.result?.file_path) {
            return data.result.file_path;
        }
        console.error('Failed to getTelegramFilePath:', data);
        return null;
    } catch (err) {
        console.error('Error in getTelegramFilePath:', err);
        return null;
    }
}

/**
 * Fetch latest channel updates via getUpdates (useful for manual sync)
 */
export async function syncTelegramChannelVideos() {
    try {
        const res = await fetch(`${TELEGRAM_API_BASE}/getUpdates?offset=-100&limit=100`, {
            cache: 'no-store'
        });
        const data = await res.json();

        if (!data.ok || !Array.isArray(data.result)) {
            return { success: false, error: data.description || 'Failed to fetch updates', count: 0 };
        }

        let syncedCount = 0;
        for (const update of data.result) {
            const msg = update.channel_post || update.message || update.edited_channel_post;
            const videoData = extractVideoFromMessage(msg);
            if (videoData) {
                await upsertTelegramVideo(videoData);
                syncedCount++;
            }
        }

        return { success: true, count: syncedCount };
    } catch (err: any) {
        console.error('Error syncTelegramChannelVideos:', err);
        return { success: false, error: err.message, count: 0 };
    }
}
