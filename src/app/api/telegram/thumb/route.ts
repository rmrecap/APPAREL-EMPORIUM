import { NextRequest, NextResponse } from 'next/server';
import { getTelegramFilePath, TELEGRAM_CONFIG } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const fileId = searchParams.get('file_id');

        if (!fileId) {
            return new NextResponse('Missing file_id', { status: 400 });
        }

        const filePath = await getTelegramFilePath(fileId);
        if (!filePath) {
            return new NextResponse('Thumbnail not found on Telegram', { status: 404 });
        }

        const directUrl = `https://api.telegram.org/file/bot${TELEGRAM_CONFIG.botToken}/${filePath}`;
        const sourceRes = await fetch(directUrl);

        if (!sourceRes.ok) {
            return new NextResponse('Failed to fetch thumbnail', { status: sourceRes.status });
        }

        const contentType = sourceRes.headers.get('content-type') || 'image/jpeg';
        const headers = new Headers();
        headers.set('Content-Type', contentType);
        headers.set('Cache-Control', 'public, max-age=604800, stale-while-revalidate=2592000');

        return new NextResponse(sourceRes.body as any, {
            status: 200,
            headers,
        });
    } catch (err: any) {
        return new NextResponse(err?.message || 'Error', { status: 500 });
    }
}
