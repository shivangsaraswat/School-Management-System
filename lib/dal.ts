import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cache } from "react";
import { ROLES, type Role } from "@/lib/constants";
import {
    canAccessAdmin,
    canAccessOperations,
    canAccessAcademics,
    canAccessSuperAdmin,
    canAccessStudentPortal,
    canViewRevenue
} from "@/lib/permissions";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// Verify user still exists in database and is active
async function verifyUserInDatabase(userId: string): Promise<{ exists: boolean; isActive: boolean; role?: string }> {
    try {
        const user = await db
            .select({ id: users.id, isActive: users.isActive, role: users.role })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        if (user.length === 0) {
            return { exists: false, isActive: false };
        }

        return { exists: true, isActive: user[0].isActive, role: user[0].role };
    } catch {
        // If database check fails, assume user doesn't exist for security
        return { exists: false, isActive: false };
    }
}

// Get current user (cached per request)
export const getCurrentUser = cache(async () => {
    const session = await auth();

    if (!session?.user) {
        return null;
    }

    return {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role as Role,
    };
});

// Require authentication - throws redirect if not authenticated
// Also validates user still exists in database and is active
export async function requireAuth() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    // CRITICAL: Verify user still exists in database and is active
    const dbStatus = await verifyUserInDatabase(session.user.id);

    if (!dbStatus.exists) {
        // User was deleted from database - redirect to login with error
        // Session will be invalid, user needs to re-authenticate
        redirect("/login?error=account_deleted");
    }

    if (!dbStatus.isActive) {
        // User was deactivated - redirect to login with error
        redirect("/login?error=account_deactivated");
    }

    return {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: (dbStatus.role || session.user.role) as Role, // Use database role as source of truth
    };
}

// Require specific role - throws redirect if not authorized
export async function requireRole(allowedRoles: Role[]) {
    const user = await requireAuth();

    if (!allowedRoles.includes(user.role)) {
        redirect("/");
    }

    return user;
}

// ============================================
// SUPER ADMIN ONLY - Full system access
// ============================================
export async function requireSuperAdmin() {
    const user = await requireAuth();

    if (!canAccessSuperAdmin(user.role)) {
        redirect("/");
    }

    return user;
}

// ============================================
// ADMIN ACCESS - Super Admin + Admin
// ============================================
export async function requireAdmin() {
    const user = await requireAuth();

    if (!canAccessAdmin(user.role)) {
        redirect("/");
    }

    return user;
}

// ============================================
// OPERATIONS ACCESS - Super Admin, Admin, Office Staff
// ============================================
export async function requireOperations() {
    const user = await requireAuth();

    if (!canAccessOperations(user.role)) {
        redirect("/");
    }

    return user;
}

// ============================================
// ACADEMICS ACCESS - Super Admin, Admin, Teacher
// ============================================
export async function requireAcademics() {
    const user = await requireAuth();

    if (!canAccessAcademics(user.role)) {
        redirect("/");
    }

    return user;
}

// ============================================
// STUDENT PORTAL ACCESS - Students only
// ============================================
export async function requireStudent() {
    const user = await requireAuth();

    if (!canAccessStudentPortal(user.role)) {
        redirect("/");
    }

    return user;
}

// ============================================
// REVENUE ACCESS - Super Admin only
// Office Staff CANNOT access this
// ============================================
export async function requireRevenueAccess() {
    const user = await requireAuth();

    if (!canViewRevenue(user.role)) {
        redirect("/");
    }

    return user;
}

// ============================================
// HELPER: Check if user is a teacher
// ============================================
export async function requireTeacher() {
    const user = await requireAuth();

    if (user.role !== ROLES.TEACHER) {
        redirect("/");
    }

    return user;
}
