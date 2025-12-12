"use server";

import { db } from "@/db";
import { auditLogs, users } from "@/db/schema";
import { eq, and, like, or, count, desc, sql } from "drizzle-orm";

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
    const { userId, action, entityType, search, limit = 50, offset = 0 } = options || {};
    const conditions = [];

    if (userId) {
        conditions.push(eq(auditLogs.userId, userId));
    }
    if (action) {
        conditions.push(eq(auditLogs.action, action));
    }
    if (entityType) {
        conditions.push(eq(auditLogs.entityType, entityType));
    }
    if (search) {
        conditions.push(like(auditLogs.description, `%${search}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await db
        .select({
            id: auditLogs.id,
            userId: auditLogs.userId,
            userName: users.name,
            action: auditLogs.action,
            entityType: auditLogs.entityType,
            entityId: auditLogs.entityId,
            description: auditLogs.description,
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
// CREATE AUDIT LOG
// ============================================
export async function createAuditLog(data: {
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    description: string;
    ipAddress?: string | null;
}) {
    const result = await db
        .insert(auditLogs)
        .values(data)
        .returning();

    return { success: true, log: result[0] };
}

// ============================================
// GET AUDIT LOG COUNT
// ============================================
export async function getAuditLogCount() {
    const result = await db
        .select({ count: count() })
        .from(auditLogs);

    return result[0]?.count || 0;
}

// ============================================
// GET RECENT ACTIVITY SUMMARY
// ============================================
export async function getRecentActivitySummary(limit: number = 10) {
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
