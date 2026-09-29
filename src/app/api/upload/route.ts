import { NextResponse } from 'next/server';
import { requirePermission, requireAuth } from '@/lib/auth-guards';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const ALLOWED_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'application/pdf',
]);

export async function POST(req: Request) {
    try {
        const guard = await requirePermission('media.upload');
        if (!guard.ok) {
            const adminGuard = await requireAuth();
            if (!adminGuard.ok || !['DEVELOPER', 'SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(adminGuard.user.role)) {
                return guard.response;
            }
        }

        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        let rawFolder = (formData.get('folder') as string) || 'general';

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Mime Type Validation
        if (!ALLOWED_MIME_TYPES.has(file.type)) {
            return NextResponse.json({ error: "Unsupported file format. Allowed types: JPEG, PNG, WebP, GIF, SVG, PDF" }, { status: 400 });
        }

        // Prevent Directory Traversal
        const safeFolder = rawFolder.replace(/[^a-zA-Z0-9_-]/g, '') || 'general';

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Sanitize filename & create unique name
        const originalName = file.name;
        const extension = path.extname(originalName).toLowerCase().replace(/[^a-z0-9.]/g, '');
        const baseName = path.basename(originalName, extension).replace(/[^a-zA-Z0-9-]/g, '-').substring(0, 50);
        const fileName = `${baseName}-${Date.now()}${extension}`;

        // Ensure directory exists inside public/uploads
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', safeFolder);
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, fileName);
        fs.writeFileSync(filePath, buffer);

        // Store in DB Media Log
        const dbPath = `/uploads/${safeFolder}/${fileName}`;
        const mediaFile = await prisma.mediaFile.create({
            data: {
                fileName,
                originalName,
                filePath: dbPath,
                fileSize: buffer.length,
                mimeType: file.type,
                folder: safeFolder,
                uploadedBy: guard.ok ? guard.user.id : undefined,
            }
        });

        return NextResponse.json({ success: true, file: mediaFile });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }
}

