import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const logPath = path.join(process.cwd(), 'crash.log');
        if (!fs.existsSync(logPath)) {
            return new NextResponse('crash.log not found yet.', { headers: { 'Content-Type': 'text/plain' } });
        }
        const content = fs.readFileSync(logPath, 'utf8');
        return new NextResponse(content, { headers: { 'Content-Type': 'text/plain' } });
    } catch (e: any) {
        return new NextResponse('Error reading crash.log: ' + e.message, { status: 500, headers: { 'Content-Type': 'text/plain' } });
    }
}
