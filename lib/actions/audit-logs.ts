"use server";

import { db } from "@/db";
import { auditLogs, users } from "@/db/schema";
import { eq, and, like, or, count, desc, gte, lte, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin, requireSuperAdmin } from "@/lib/dal";

// ============================================
// GET AUDIT LOGS
// ============================================
export async function getAuditLogs(options?: {
    userId?: string;
    action?: string;
    entityType?: string;
    search?: string;
    limit?: number;
    offset?: number;
}) {
    await requireAdmin();
    const { userId, action, entityType, search, limit = 50, offset = 0 } = options || {};
    const conditions = [];

    if (userId) {
        conditions.push(eq(auditLogs.userId, userId));
    }
    if (action && action !== "all") {
        conditions.push(eq(auditLogs.action, action));
    }
    if (entityType && entityType !== "all") {
        conditions.push(eq(auditLogs.entityType, entityType));
    }
    if (search) {
        conditions.push(
            or(
                like(auditLogs.description, `%${search}%`),
                like(auditLogs.entityId, `%${search}%`)
            )
        );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await db
        .select({
            id: auditLogs.id,
            userId: auditLogs.userId,
            userName: users.name,
            userEmail: users.email,
            userRole: users.role,
            action: auditLogs.action,
            entityType: auditLogs.entityType,
            entityId: auditLogs.entityId,
            description: auditLogs.description,
            oldValue: auditLogs.oldValue,
            newValue: auditLogs.newValue,
            ipAddress: auditLogs.ipAddress,
            createdAt: auditLogs.createdAt,
        })
        .from(auditLogs)
        .leftJoin(users, eq(auditLogs.userId, users.id))
        .where(whereClause)
        .orderBy(desc(auditLogs.createdAt))
        .limit(limit)
        .offset(offset);

    return result;
}



// ============================================
// GET AUDIT LOG COUNT
// ============================================
export async function getAuditLogCount(options?: {
    action?: string;
    entityType?: string;
}) {
    await requireAdmin();
    const { action, entityType } = options || {};
    const conditions = [];

    if (action && action !== "all") {
        conditions.push(eq(auditLogs.action, action));
    }
    if (entityType && entityType !== "all") {
        conditions.push(eq(auditLogs.entityType, entityType));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await db
        .select({ count: count() })
        .from(auditLogs)
        .where(whereClause);

    return result[0]?.count || 0;
}

// ============================================
// GET RECENT ACTIVITY SUMMARY
// ============================================
export async function getRecentActivitySummary(limit: number = 10) {
    await requireAdmin();
    const result = await db
        .select({
            id: auditLogs.id,
            userName: users.name,
            action: auditLogs.action,
            entityType: auditLogs.entityType,
            description: auditLogs.description,
            createdAt: auditLogs.createdAt,
        })
        .from(auditLogs)
        .leftJoin(users, eq(auditLogs.userId, users.id))
        .orderBy(desc(auditLogs.createdAt))
        .limit(limit);

    return result;
}

// ============================================
// DELETE AUDIT LOG (Super Admin only)
// ============================================
export async function deleteAuditLog(logId: string): Promise<{ success: boolean; error?: string }> {
    try {
        await requireSuperAdmin();
        await db.delete(auditLogs).where(eq(auditLogs.id, logId));
        revalidatePath("/admin/audit-logs");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete audit log:", error);
        return { success: false, error: "Failed to delete audit log" };
    }
}

// ============================================
// DELETE MULTIPLE AUDIT LOGS (Super Admin only)
// ============================================
export async function deleteMultipleAuditLogs(logIds: string[]): Promise<{ success: boolean; error?: string }> {
    try {
        await requireSuperAdmin();
        if (logIds.length === 0) return { success: true };
        await db.delete(auditLogs).where(inArray(auditLogs.id, logIds));
        revalidatePath("/admin/audit-logs");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete audit logs:", error);
        return { success: false, error: "Failed to delete audit logs" };
    }
}

// ============================================
// GET AUDIT LOG STATS
// ============================================
export async function getAuditLogStats() {
    try {
        await requireAdmin();
        const total = await db.select({ count: count() }).from(auditLogs);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayCount = await db
            .select({ count: count() })
            .from(auditLogs)
            .where(gte(auditLogs.createdAt, today));

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekCount = await db
            .select({ count: count() })
            .from(auditLogs)
            .where(gte(auditLogs.createdAt, weekAgo));

        // Count by action type
        const createCount = await db
            .select({ count: count() })
            .from(auditLogs)
            .where(eq(auditLogs.action, "CREATE"));

        const updateCount = await db
            .select({ count: count() })
            .from(auditLogs)
            .where(eq(auditLogs.action, "UPDATE"));

        const deleteCount = await db
            .select({ count: count() })
            .from(auditLogs)
            .where(eq(auditLogs.action, "DELETE"));

        return {
            total: total[0]?.count || 0,
            today: todayCount[0]?.count || 0,
            thisWeek: weekCount[0]?.count || 0,
            creates: createCount[0]?.count || 0,
            updates: updateCount[0]?.count || 0,
            deletes: deleteCount[0]?.count || 0,
        };
    } catch (error) {
        console.error("Failed to get audit log stats:", error);
        return { total: 0, today: 0, thisWeek: 0, creates: 0, updates: 0, deletes: 0 };
    }
}
