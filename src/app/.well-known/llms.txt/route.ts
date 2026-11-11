import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-static';

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'public', 'llms.txt');
        const content = fs.readFileSync(filePath, 'utf-8');
        return new NextResponse(content, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'public, max-age=86400',
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (e) {
        return new NextResponse('# Apparel Emporium Ltd. (AELBD)\nhttps://aelbd.net', {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
    }
}

