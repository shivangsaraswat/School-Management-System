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
export async function requireAuth() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    return user;
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
