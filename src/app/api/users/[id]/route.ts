import { NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth-guards';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

const SAFE_USER_SELECT = {
    id: true,
    name: true,
    email: true,
    role: true,
    avatar: true,
    isActive: true,
    lastLoginAt: true,
    createdAt: true,
    updatedAt: true,
} as const;

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const guard = await requireSuperAdmin();
        if (!guard.ok) return guard.response;

        const callerRole = guard.user.role;

        // Verify target exists
        const userToDelete = await prisma.user.findUnique({ where: { id: params.id } });
        if (!userToDelete) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Only DEVELOPER can delete DEVELOPER accounts
        if (userToDelete.role === 'DEVELOPER' && callerRole !== 'DEVELOPER') {
            return NextResponse.json({ error: "Forbidden: Only developers can modify developer accounts" }, { status: 403 });
        }

        // Prevent deleting the last super admin
        const superAdminsCount = await prisma.user.count({ where: { role: 'SUPER_ADMIN' } });
        if (userToDelete.role === 'SUPER_ADMIN' && superAdminsCount <= 1) {
            return NextResponse.json({ error: "Cannot delete the last Super Admin" }, { status: 400 });
        }

        await prisma.user.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const guard = await requireSuperAdmin();
        if (!guard.ok) return guard.response;

        const callerRole = guard.user.role;

        const targetUser = await prisma.user.findUnique({ where: { id: params.id } });
        if (!targetUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Only DEVELOPER can modify DEVELOPER accounts
        if (targetUser.role === 'DEVELOPER' && callerRole !== 'DEVELOPER') {
            return NextResponse.json({ error: "Forbidden: Only developers can modify developer accounts" }, { status: 403 });
        }

        const body = await req.json();

        // Prevent non-developers from promoting anyone to DEVELOPER
        if (body.role === 'DEVELOPER' && callerRole !== 'DEVELOPER') {
            return NextResponse.json({ error: "Forbidden: Cannot assign DEVELOPER role" }, { status: 403 });
        }

        const updateData: any = {};
        if (body.name !== undefined) updateData.name = body.name;
        if (body.email !== undefined) updateData.email = body.email;
        if (body.role !== undefined) updateData.role = body.role;
        if (body.isActive !== undefined) updateData.isActive = body.isActive;

        if (body.password) {
            updateData.password = await bcrypt.hash(body.password, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id: params.id },
            data: updateData,
            select: SAFE_USER_SELECT
        });

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}
