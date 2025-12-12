"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and, like, or, count, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";
import type { NewUser, User } from "@/db/schema";

// ============================================
// GET USERS (Staff/Teachers)
// ============================================
export async function getUsers(options?: {
    role?: string;
    search?: string;
    limit?: number;
    offset?: number;
    isActive?: boolean;
    includeAll?: boolean; // Set to true to include both active and inactive
}) {
    const { role, search, limit = 50, offset = 0, isActive, includeAll = false } = options || {};

    const conditions = [];

    if (role) {
        conditions.push(eq(users.role, role as "super_admin" | "admin" | "office_staff" | "teacher" | "student"));
    }
    if (search) {
        conditions.push(
            or(
                like(users.name, `%${search}%`),
                like(users.email, `%${search}%`)
            )
        );
    }
    // Only filter by isActive if includeAll is false and isActive is explicitly set
    if (!includeAll && isActive !== undefined) {
        conditions.push(eq(users.isActive, isActive));
    }

    const result = await db
        .select({
            id: users.id,
            email: users.email,
            name: users.name,
            role: users.role,
            phone: users.phone,
            avatar: users.avatar,
            isActive: users.isActive,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
        })
        .from(users)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset);

    return result;
}

// ============================================
// GET USER BY ID
// ============================================
export async function getUserById(id: string) {
    const result = await db
        .select({
            id: users.id,
            email: users.email,
            name: users.name,
            role: users.role,
            phone: users.phone,
            avatar: users.avatar,
            isActive: users.isActive,
            createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

    return result[0] || null;
}

// ============================================
// CREATE USER
// ============================================
export async function createUser(data: {
    email: string;
    password: string;
    name: string;
    role: "super_admin" | "admin" | "office_staff" | "teacher" | "student";
    phone?: string;
}) {
    // Check if email already exists
    const existing = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, data.email))
        .limit(1);

    if (existing.length > 0) {
        return { success: false, error: "Email already exists" };
    }

    const hashedPassword = await hash(data.password, 12);

    const result = await db
        .insert(users)
        .values({
            ...data,
            password: hashedPassword,
        })
        .returning({
            id: users.id,
            email: users.email,
            name: users.name,
            role: users.role,
        });

    revalidatePath("/admin/users");
    return { success: true, user: result[0] };
}

// ============================================
// UPDATE USER
// ============================================
export async function updateUser(
    id: string,
    data: Partial<{
        email: string;
        name: string;
        role: "super_admin" | "admin" | "office_staff" | "teacher" | "student";
        phone: string;
        avatar: string;
        isActive: boolean;
    }>
) {
    const result = await db
        .update(users)
        .set({
            ...data,
            updatedAt: new Date(),
        })
        .where(eq(users.id, id))
        .returning({
            id: users.id,
            email: users.email,
            name: users.name,
            role: users.role,
        });

    revalidatePath("/admin/users");
    return { success: true, user: result[0] };
}

// ============================================
// UPDATE PASSWORD
// ============================================
export async function updatePassword(id: string, newPassword: string) {
    const hashedPassword = await hash(newPassword, 12);

    await db
        .update(users)
        .set({
            password: hashedPassword,
            updatedAt: new Date(),
        })
        .where(eq(users.id, id));

    return { success: true };
}

// ============================================
// DELETE USER (Soft delete - deactivate)
// ============================================
export async function deleteUser(id: string) {
    await db
        .update(users)
        .set({
            isActive: false,
            updatedAt: new Date(),
        })
        .where(eq(users.id, id));

    revalidatePath("/admin/users");
    return { success: true };
}

// ============================================
// PERMANENTLY DELETE USER (Hard delete)
// ============================================
export async function permanentlyDeleteUser(id: string) {
    await db
        .delete(users)
        .where(eq(users.id, id));

    revalidatePath("/admin/users");
    return { success: true };
}

// ============================================
// REACTIVATE USER
// ============================================
export async function reactivateUser(id: string) {
    await db
        .update(users)
        .set({
            isActive: true,
            updatedAt: new Date(),
        })
        .where(eq(users.id, id));

    revalidatePath("/admin/users");
    return { success: true };
}

// ============================================
// GET USERS COUNT
// ============================================
export async function getUsersCount(role?: string) {
    const conditions = [eq(users.isActive, true)];

    if (role) {
        conditions.push(eq(users.role, role as any));
    }

    const result = await db
        .select({ count: count() })
        .from(users)
        .where(and(...conditions));

    return result[0]?.count || 0;
}

// ============================================
// GET TEACHERS COUNT
// ============================================
export async function getTeachersCount() {
    return getUsersCount("teacher");
}
