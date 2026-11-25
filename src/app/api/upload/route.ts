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
        let userId: string | undefined = guard.ok ? guard.user.id : undefined;

        if (!guard.ok) {
            const adminGuard = await requireAuth();
            if (!adminGuard.ok || !['DEVELOPER', 'SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(adminGuard.user.role)) {
                return guard.response;
            }
            userId = adminGuard.user.id;
        }

        const formData = await req.formData();
        const files = formData.getAll('file').filter((f): f is File => f instanceof File);
        const rawFolder = (formData.get('folder') as string) || 'general';

        if (files.length === 0) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const safeFolder = rawFolder.replace(/[^a-zA-Z0-9_-]/g, '') || 'general';
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', safeFolder);
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const createdFiles = [];

        for (const file of files) {
            if (!ALLOWED_MIME_TYPES.has(file.type)) {
                return NextResponse.json(
                    { error: `Unsupported file format (${file.name}). Allowed types: JPEG, PNG, WebP, GIF, SVG, PDF` },
                    { status: 400 }
                );
            }

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const originalName = file.name;
            const extension = path.extname(originalName).toLowerCase().replace(/[^a-z0-9.]/g, '') || '.jpg';
            const baseName = path.basename(originalName, extension).replace(/[^a-zA-Z0-9-]/g, '-').substring(0, 50) || 'asset';
            const fileName = `${baseName}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}${extension}`;

            const filePath = path.join(uploadDir, fileName);
            fs.writeFileSync(filePath, buffer);

            const dbPath = `/uploads/${safeFolder}/${fileName}`;
            const mediaFile = await prisma.mediaFile.create({
                data: {
                    fileName,
                    originalName,
                    filePath: dbPath,
                    fileSize: buffer.length,
                    mimeType: file.type,
                    folder: safeFolder,
                    uploadedBy: userId,
                },
            });
            createdFiles.push(mediaFile);
        }

        return NextResponse.json({
            success: true,
            file: createdFiles[0],
            files: createdFiles,
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }
}
