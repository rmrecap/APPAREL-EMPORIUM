import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTelegramFilePath, TELEGRAM_CONFIG } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

interface RouteParams {
    params: {
        messageId: string;
    };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const { messageId } = params;
        const numId = parseInt(messageId, 10);

        const video = await (prisma as any).telegramVideo.findFirst({
            where: {
                OR: [
                    { id: messageId },
                    ...(isNaN(numId) ? [] : [{ messageId: numId }])
                ]
            }
        });

        if (!video) {
            return new NextResponse('Video not found', { status: 404 });
        }

        let downloadUrl = '';

        // Check if fileId is an external URL (for fallback or external video links)
        if (video.fileId.startsWith('http://') || video.fileId.startsWith('https://')) {
            downloadUrl = video.fileId;
        } else {
            const filePath = await getTelegramFilePath(video.fileId);
            if (!filePath) {
                return new NextResponse('Failed to resolve Telegram video file', { status: 502 });
            }
            downloadUrl = `https://api.telegram.org/file/bot${TELEGRAM_CONFIG.botToken}/${filePath}`;
        }

        // Forward Range header from browser to Telegram / Source server
        const rangeHeader = req.headers.get('range');
        const fetchHeaders: HeadersInit = {};
        if (rangeHeader) {
            fetchHeaders['Range'] = rangeHeader;
        }

        const sourceRes = await fetch(downloadUrl, {
            headers: fetchHeaders,
            cache: 'no-store'
        });

        if (!sourceRes.ok && sourceRes.status !== 206) {
            return new NextResponse('Failed to stream video from Telegram', { status: sourceRes.status });
        }

        const contentType = video.mimeType || sourceRes.headers.get('content-type') || 'video/mp4';
        const contentLength = sourceRes.headers.get('content-length');
        const contentRange = sourceRes.headers.get('content-range');
        const acceptRanges = sourceRes.headers.get('accept-ranges') || 'bytes';

        const responseHeaders = new Headers();
        responseHeaders.set('Content-Type', contentType);
        responseHeaders.set('Accept-Ranges', acceptRanges);
        responseHeaders.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');

        if (contentLength) {
            responseHeaders.set('Content-Length', contentLength);
        }
        if (contentRange) {
            responseHeaders.set('Content-Range', contentRange);
        }

        const status = sourceRes.status === 206 || rangeHeader ? 206 : 200;

        return new NextResponse(sourceRes.body as any, {
            status,
            headers: responseHeaders,
        });
    } catch (error: any) {
        console.error('[Video Stream Error]', error);
        return new NextResponse(`Streaming error: ${error?.message || 'Unknown error'}`, { status: 500 });
    }
}
