"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and, like, or, count, desc } from "drizzle-orm";
import { requireAuth, requireAdmin, requireSuperAdmin } from "@/lib/dal";
import { createAuditLog } from "@/lib/internal/audit";
import { revalidatePath } from "next/cache";
import { hash, compare } from "bcryptjs";
import type { Role } from "@/lib/constants";

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
    const currentUser = await requireAdmin();

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

    // Log the action
    await createAuditLog({
        userId: currentUser.id,
        action: "CREATE",
        entityType: "user",
        entityId: result[0].id,
        description: `Created new user ${data.name} (${data.email}) with role ${data.role}`,
        newValue: JSON.stringify({
            name: data.name,
            email: data.email,
            role: data.role
        }),
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
    const currentUser = await requireAdmin();

    // Get old user data for audit log
    const oldUser = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

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

    // Log the action
    if (oldUser.length > 0) {
        // Determine what changed for description
        const changes = [];
        if (data.name && data.name !== oldUser[0].name) changes.push("name");
        if (data.email && data.email !== oldUser[0].email) changes.push("email");
        if (data.role && data.role !== oldUser[0].role) changes.push("role");
        if (data.phone !== undefined && data.phone !== oldUser[0].phone) changes.push("phone");
        if (data.isActive !== undefined && data.isActive !== oldUser[0].isActive) changes.push("status");

        if (changes.length > 0) {
            await createAuditLog({
                userId: currentUser.id,
                action: "UPDATE",
                entityType: "user",
                entityId: id,
                description: `Updated user ${result[0].name}: changed ${changes.join(", ")}`,
                oldValue: JSON.stringify({
                    name: oldUser[0].name,
                    email: oldUser[0].email,
                    role: oldUser[0].role,
                    phone: oldUser[0].phone,
                    isActive: oldUser[0].isActive
                }),
                newValue: JSON.stringify(data),
            });
        }
    }

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
// ============================================
// DELETE USER (Soft delete - deactivate)
// ============================================
export async function deleteUser(id: string) {
    const currentUser = await requireAdmin();

    // Get user info for log
    const user = await db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, id)).limit(1);

    await db
        .update(users)
        .set({
            isActive: false,
            updatedAt: new Date(),
        })
        .where(eq(users.id, id));

    // Log action
    if (user.length > 0) {
        await createAuditLog({
            userId: currentUser.id,
            action: "DEACTIVATE",
            entityType: "user",
            entityId: id,
            description: `Deactivated user ${user[0].name} (${user[0].email})`,
        });
    }

    revalidatePath("/admin/users");
    return { success: true };
}

// ============================================
// PERMANENTLY DELETE USER (Hard delete)
// ============================================
export async function permanentlyDeleteUser(id: string) {
    const currentUser = await requireSuperAdmin();

    // Get user info for log
    const user = await db.select({ name: users.name, email: users.email, role: users.role }).from(users).where(eq(users.id, id)).limit(1);

    await db
        .delete(users)
        .where(eq(users.id, id));

    // Log action
    if (user.length > 0) {
        await createAuditLog({
            userId: currentUser.id,
            action: "DELETE",
            entityType: "user",
            entityId: id,
            description: `Permanently deleted user ${user[0].name} (${user[0].email})`,
            oldValue: JSON.stringify(user[0]),
        });
    }

    revalidatePath("/admin/users");
    return { success: true };
}

// ============================================
// REACTIVATE USER
// ============================================
// REACTIVATE USER
// ============================================
export async function reactivateUser(id: string) {
    const currentUser = await requireAdmin();

    // Get user info for log
    const user = await db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, id)).limit(1);

    await db
        .update(users)
        .set({
            isActive: true,
            updatedAt: new Date(),
        })
        .where(eq(users.id, id));

    // Log action
    if (user.length > 0) {
        await createAuditLog({
            userId: currentUser.id,
            action: "REACTIVATE",
            entityType: "user",
            entityId: id,
            description: `Reactivated user ${user[0].name} (${user[0].email})`,
        });
    }

    revalidatePath("/admin/users");
    return { success: true };
}

// ============================================
// GET USERS COUNT
// ============================================
export async function getUsersCount(role?: string) {
    await requireAuth();
    const conditions = [eq(users.isActive, true)];

    if (role) {
        conditions.push(eq(users.role, role as Role));
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

// ============================================
// REGENERATE PASSWORD (Super Admin only)
// ============================================
export async function regeneratePassword(userId: string): Promise<{ success: boolean; newPassword?: string; error?: string }> {
    try {
        const currentUser = await requireSuperAdmin();

        // Generate a new random password
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
        let newPassword = "";
        for (let i = 0; i < 12; i++) {
            newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        // Hash the new password
        const hashedPassword = await hash(newPassword, 12);

        // Update the user's password in the database
        await db
            .update(users)
            .set({
                password: hashedPassword,
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId));

        // Log action
        const user = await db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, userId)).limit(1);
        if (user.length > 0) {
            await createAuditLog({
                userId: currentUser.id,
                action: "PASSWORD_RESET",
                entityType: "user",
                entityId: userId,
                description: `Regenerated password for user ${user[0].name} (${user[0].email})`,
            });
        }

        revalidatePath("/admin/users");

        return { success: true, newPassword };
    } catch (error) {
        console.error("Failed to regenerate password:", error);
        return { success: false, error: "Failed to regenerate password" };
    }
}

// ============================================
// UPDATE OWN PROFILE (User updating their own profile)
// Can update: name, phone
// Cannot update: email, role (those require admin)
// ============================================
export async function updateOwnProfile(
    userId: string,
    data: { name: string; phone?: string }
): Promise<{ success: boolean; error?: string }> {
    try {
        const currentUser = await requireAuth();
        if (currentUser.id !== userId) {
            return { success: false, error: "Unauthorized" };
        }

        // Get old user data for audit log
        const oldUser = await db
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        await db
            .update(users)
            .set({
                name: data.name,
                phone: data.phone || null,
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId));

        // Log action
        if (oldUser.length > 0) {
            const changes = [];
            if (data.name && data.name !== oldUser[0].name) changes.push("name");
            if (data.phone !== undefined && data.phone !== oldUser[0].phone) changes.push("phone");

            if (changes.length > 0) {
                await createAuditLog({
                    userId: userId,
                    action: "UPDATE",
                    entityType: "user",
                    entityId: userId,
                    description: `User updated their profile: changed ${changes.join(", ")}`,
                    oldValue: JSON.stringify({
                        name: oldUser[0].name,
                        phone: oldUser[0].phone
                    }),
                    newValue: JSON.stringify(data),
                });
            }
        }

        revalidatePath("/profile");
        return { success: true };
    } catch (error) {
        console.error("Failed to update profile:", error);
        return { success: false, error: "Failed to update profile" };
    }
}

// ============================================
// CHANGE PASSWORD (User changing their own password)
// ============================================

export async function changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const currentUser = await requireAuth();
        if (currentUser.id !== userId) {
            return { success: false, error: "Unauthorized" };
        }

        // Get user's current password hash
        const user = await db
            .select({ password: users.password })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);


        if (!user[0]) {
            return { success: false, error: "User not found" };
        }

        // Verify current password
        const isValidPassword = await compare(currentPassword, user[0].password);
        if (!isValidPassword) {
            return { success: false, error: "Current password is incorrect" };
        }

        // Validate new password
        if (newPassword.length < 6) {
            return { success: false, error: "New password must be at least 6 characters" };
        }

        // Hash and update new password
        const hashedPassword = await hash(newPassword, 12);
        await db
            .update(users)
            .set({
                password: hashedPassword,
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId));

        // Log action
        await createAuditLog({
            userId: userId,
            action: "PASSWORD_CHANGE",
            entityType: "user",
            entityId: userId,
            description: "User changed their password",
        });

        revalidatePath("/profile");
        return { success: true };
    } catch (error) {
        console.error("Failed to change password:", error);
        return { success: false, error: "Failed to change password" };
    }
}
