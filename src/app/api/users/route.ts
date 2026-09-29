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
} as const;

export async function GET(req: Request) {
    try {
        const guard = await requireSuperAdmin();
        if (!guard.ok) return guard.response;

        const currentUserRole = guard.user.role;
        const { searchParams } = new URL(req.url);
        const roleFilter = searchParams.get('role');

        const whereClause: any = {};
        if (roleFilter) whereClause.role = roleFilter;

        // SUPER_ADMIN cannot see DEVELOPER accounts
        if (currentUserRole !== 'DEVELOPER') {
            whereClause.role = { not: 'DEVELOPER' };
            if (roleFilter === 'DEVELOPER') return NextResponse.json({ success: true, users: [] });
        }

        const users = await prisma.user.findMany({
            where: whereClause,
            select: SAFE_USER_SELECT,
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, users });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const guard = await requireSuperAdmin();
        if (!guard.ok) return guard.response;

        const currentUserRole = guard.user.role;
        const data = await req.json();
        const { name, email, password, role, isActive } = data;

        if (!name || !email || !password || !role) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        // Role Escalation Prevention
        if (currentUserRole === 'SUPER_ADMIN' && ['SUPER_ADMIN', 'DEVELOPER'].includes(role)) {
            return NextResponse.json({ error: "Cannot create user with equal or higher administrative role" }, { status: 403 });
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: "Email already exists" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                isActive: isActive ?? true
            },
            select: SAFE_USER_SELECT
        });

        return NextResponse.json({ success: true, user });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }
}

