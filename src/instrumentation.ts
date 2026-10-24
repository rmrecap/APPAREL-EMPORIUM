import * as fs from 'fs';
import * as path from 'path';

export async function onRequestError(err: any, request: any) {
    try {
        const logPath = path.join(process.cwd(), 'crash.log');
        const timestamp = new Date().toISOString();
        const url = request?.path || request?.url || 'unknown';
        const digest = err?.digest || 'no-digest';
        const msg = err?.message || String(err);
        const stack = err?.stack || 'no-stack';

        const entry = `[${timestamp}] [URL: ${url}] [Digest: ${digest}]\n${err?.name || 'Error'}: ${msg}\n${stack}\n----------------------------------------\n\n`;
        fs.appendFileSync(logPath, entry);
        console.error('[NEXT_ON_REQUEST_ERROR]', entry);
    } catch (e) {
        console.error('[INSTRUMENTATION_FAIL]', e);
    }
}
