import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Role, hasPermission } from '@/lib/permissions';

import { prisma } from '@/lib/prisma';

export interface AuthenticatedUser {
    id: string;
    email: string;
    name?: string | null;
    role: Role;
}

export interface AuthenticatedSession {
    user: AuthenticatedUser;
    expires: string;
}

export type AuthGuardResult =
    | {
          ok: true;
          session: AuthenticatedSession;
          user: AuthenticatedUser;
          error?: never;
          status?: never;
          response?: never;
      }
    | {
          ok: false;
          session?: never;
          user?: never;
          error: string;
          status: number;
          response: NextResponse;
      };

/**
 * Ensures the incoming request has a valid, authenticated NextAuth session.
 * Returns 401 Unauthorized if no session exists or user ID is missing.
 */
export async function requireAuth(): Promise<AuthGuardResult> {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return {
                ok: false,
                error: 'Unauthorized: Authentication required',
                status: 401,
                response: NextResponse.json(
                    { success: false, error: 'Unauthorized: Authentication required' },
                    { status: 401 }
                ),
            };
        }

        let user = session.user as any as AuthenticatedUser;

        // If ID is missing from JWT token, resolve from DB via email
        if (!user.id && user.email) {
            try {
                const dbUser = await prisma.user.findUnique({
                    where: { email: user.email },
                    select: { id: true, email: true, name: true, role: true }
                });
                if (dbUser) {
                    user = {
                        id: dbUser.id,
                        email: dbUser.email,
                        name: dbUser.name,
                        role: dbUser.role as Role
                    };
                    (session.user as any).id = dbUser.id;
                    (session.user as any).role = dbUser.role;
                }
            } catch (dbErr) {
                console.error('[AUTH_GUARD_DB_LOOKUP_ERROR]', dbErr);
            }
        }

        if (!user.id) {
            return {
                ok: false,
                error: 'Unauthorized: Valid user identifier missing',
                status: 401,
                response: NextResponse.json(
                    { success: false, error: 'Unauthorized: Valid user identifier missing' },
                    { status: 401 }
                ),
            };
        }

        return {
            ok: true,
            session: session as any as AuthenticatedSession,
            user,
        };
    } catch (err: any) {
        console.error('[AUTH_GUARD_ERROR] Failed during session verification:', err);
        return {
            ok: false,
            error: 'Authentication verification failure',
            status: 500,
            response: NextResponse.json(
                { success: false, error: 'Authentication verification failure' },
                { status: 500 }
            ),
        };
    }
}

/**
 * Ensures the authenticated user possesses one of the allowed roles.
 * Returns 401 if unauthenticated, 403 if role is not permitted.
 */
export async function requireRole(allowedRoles: Role[]): Promise<AuthGuardResult> {
    const auth = await requireAuth();
    if (!auth.ok) {
        return auth;
    }

    if (!allowedRoles.includes(auth.user.role)) {
        return {
            ok: false,
            error: 'Forbidden: Insufficient role permissions',
            status: 403,
            response: NextResponse.json(
                { success: false, error: 'Forbidden: Insufficient permissions' },
                { status: 403 }
            ),
        };
    }

    return auth;
}

/**
 * Ensures the authenticated user possesses a specific RBAC permission string.
 * Returns 401 if unauthenticated, 403 if permission is lacking.
 */
export async function requirePermission(permission: string): Promise<AuthGuardResult> {
    const auth = await requireAuth();
    if (!auth.ok) {
        return auth;
    }

    if (!hasPermission(auth.user.role, permission)) {
        return {
            ok: false,
            error: `Forbidden: Missing required permission [${permission}]`,
            status: 403,
            response: NextResponse.json(
                { success: false, error: 'Forbidden: Insufficient permissions' },
                { status: 403 }
            ),
        };
    }

    return auth;
}

/**
 * Guard for administrative actions (DEVELOPER, SUPER_ADMIN, ADMIN).
 */
export async function requireAdmin(): Promise<AuthGuardResult> {
    return requireRole(['DEVELOPER', 'SUPER_ADMIN', 'ADMIN']);
}

/**
 * Guard for super-administrative actions (DEVELOPER, SUPER_ADMIN).
 */
export async function requireSuperAdmin(): Promise<AuthGuardResult> {
    return requireRole(['DEVELOPER', 'SUPER_ADMIN']);
}

/**
 * Guard for developer-only operations (DEVELOPER).
 */
export async function requireDeveloper(): Promise<AuthGuardResult> {
    return requireRole(['DEVELOPER']);
}
