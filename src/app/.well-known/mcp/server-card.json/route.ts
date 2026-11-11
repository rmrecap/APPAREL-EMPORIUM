import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-static';

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'public', '.well-known', 'mcp', 'server-card.json');
        const content = fs.readFileSync(filePath, 'utf-8');
        return new NextResponse(content, {
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Cache-Control': 'public, max-age=86400',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
            },
        });
    } catch (e) {
        return NextResponse.json(
            { error: 'Server card not found' },
            { status: 404 }
        );
    }
}

