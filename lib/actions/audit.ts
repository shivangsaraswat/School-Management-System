"use server";

import { db } from "@/db";
import { auditLogs, users } from "@/db/schema";
import { eq, desc, and, like, or, count, gte, lte, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Action types for logging
export type AuditAction =
    | "CREATE"
    | "UPDATE"
    | "DELETE"
    | "DEACTIVATE"
    | "REACTIVATE"
    | "LOGIN"
    | "LOGOUT"
    | "PASSWORD_CHANGE"
    | "PASSWORD_RESET";

// Entity types that can be audited
export type AuditEntityType =
    | "user"
    | "student"
    | "class"
    | "section"
    | "fee"
    | "admission"
    | "attendance"
    | "result"
    | "settings"
    | "system";

// ============================================
// CREATE AUDIT LOG
// ============================================
export async function createAuditLog(data: {
    userId?: string;
    action: AuditAction;
    entityType: AuditEntityType;
    entityId: string;
    description: string;
    oldValue?: Record<string, unknown> | null;
    newValue?: Record<string, unknown> | null;
    ipAddress?: string;
}) {
    try {
        await db.insert(auditLogs).values({
            userId: data.userId || null,
            action: data.action,
            entityType: data.entityType,
            entityId: data.entityId,
            description: data.description,
            oldValue: data.oldValue ? JSON.stringify(data.oldValue) : null,
            newValue: data.newValue ? JSON.stringify(data.newValue) : null,
            ipAddress: data.ipAddress || null,
        });

        revalidatePath("/admin/audit-logs");
        return { success: true };
    } catch (error) {
        console.error("Failed to create audit log:", error);
        return { success: false, error: "Failed to create audit log" };
    }
}

// ============================================
// GET AUDIT LOGS (with filtering and pagination)
// ============================================
export async function getAuditLogs(options?: {
    search?: string;
    action?: string;
    entityType?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
}) {
    const { search, action, entityType, userId, startDate, endDate, limit = 50, offset = 0 } = options || {};

    try {
        // Build conditions
        const conditions = [];

        if (action && action !== "all") {
            conditions.push(eq(auditLogs.action, action));
        }

        if (entityType && entityType !== "all") {
            conditions.push(eq(auditLogs.entityType, entityType));
        }

        if (userId) {
            conditions.push(eq(auditLogs.userId, userId));
        }

        if (startDate) {
            conditions.push(gte(auditLogs.createdAt, startDate));
        }

        if (endDate) {
            conditions.push(lte(auditLogs.createdAt, endDate));
        }

        if (search) {
            conditions.push(
                or(
                    like(auditLogs.description, `%${search}%`),
                    like(auditLogs.entityId, `%${search}%`)
                )
            );
        }

        // Get logs with user info
        const logs = await db
            .select({
                id: auditLogs.id,
                userId: auditLogs.userId,
                action: auditLogs.action,
                entityType: auditLogs.entityType,
                entityId: auditLogs.entityId,
                description: auditLogs.description,
                oldValue: auditLogs.oldValue,
                newValue: auditLogs.newValue,
                ipAddress: auditLogs.ipAddress,
                createdAt: auditLogs.createdAt,
                userName: users.name,
                userEmail: users.email,
                userRole: users.role,
            })
            .from(auditLogs)
            .leftJoin(users, eq(auditLogs.userId, users.id))
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(auditLogs.createdAt))
            .limit(limit)
            .offset(offset);

        return logs;
    } catch (error) {
        console.error("Failed to get audit logs:", error);
        return [];
    }
}

// ============================================
// GET AUDIT LOGS COUNT
// ============================================
export async function getAuditLogsCount(options?: {
    action?: string;
    entityType?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
}) {
    const { action, entityType, userId, startDate, endDate } = options || {};

    try {
        const conditions = [];

        if (action && action !== "all") {
            conditions.push(eq(auditLogs.action, action));
        }

        if (entityType && entityType !== "all") {
            conditions.push(eq(auditLogs.entityType, entityType));
        }

        if (userId) {
            conditions.push(eq(auditLogs.userId, userId));
        }

        if (startDate) {
            conditions.push(gte(auditLogs.createdAt, startDate));
        }

        if (endDate) {
            conditions.push(lte(auditLogs.createdAt, endDate));
        }

        const result = await db
            .select({ count: count() })
            .from(auditLogs)
            .where(conditions.length > 0 ? and(...conditions) : undefined);

        return result[0]?.count || 0;
    } catch (error) {
        console.error("Failed to get audit logs count:", error);
        return 0;
    }
}

// ============================================
// DELETE AUDIT LOG (Super Admin only)
// ============================================
export async function deleteAuditLog(logId: string): Promise<{ success: boolean; error?: string }> {
    try {
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
        await db.delete(auditLogs).where(inArray(auditLogs.id, logIds));
        revalidatePath("/admin/audit-logs");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete audit logs:", error);
        return { success: false, error: "Failed to delete audit logs" };
    }
}

// ============================================
// CLEAR OLD AUDIT LOGS (Super Admin only)
// ============================================
export async function clearOldAuditLogs(daysOld: number = 90): Promise<{ success: boolean; deletedCount?: number; error?: string }> {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        // Get count first
        const countResult = await db
            .select({ count: count() })
            .from(auditLogs)
            .where(lte(auditLogs.createdAt, cutoffDate));

        const deletedCount = countResult[0]?.count || 0;

        // Delete old logs
        await db.delete(auditLogs).where(lte(auditLogs.createdAt, cutoffDate));

        revalidatePath("/admin/audit-logs");
        return { success: true, deletedCount };
    } catch (error) {
        console.error("Failed to clear old audit logs:", error);
        return { success: false, error: "Failed to clear old audit logs" };
    }
}

// ============================================
// GET AUDIT LOG STATS
// ============================================
export async function getAuditLogStats() {
    try {
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

        return {
            total: total[0]?.count || 0,
            today: todayCount[0]?.count || 0,
            thisWeek: weekCount[0]?.count || 0,
        };
    } catch (error) {
        console.error("Failed to get audit log stats:", error);
        return { total: 0, today: 0, thisWeek: 0 };
    }
}
