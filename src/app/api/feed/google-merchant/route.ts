import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const xmlPath = path.join(process.cwd(), 'public', 'google-merchant-feed.xml');
        if (!fs.existsSync(xmlPath)) {
            return new NextResponse('Feed not found. Please run npm run feed:merchant to generate.', { status: 404 });
        }

        const xmlContent = fs.readFileSync(xmlPath, 'utf8');

        return new NextResponse(xmlContent, {
            status: 200,
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
            },
        });
    } catch (error: any) {
        return new NextResponse(`Error serving merchant feed: ${error.message}`, { status: 500 });
    }
}
