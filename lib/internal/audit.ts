import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { revalidatePath } from "next/cache";

export async function createAuditLog(data: {
    userId?: string | null;
    action: string;
    entityType: string;
    entityId: string;
    description: string;
    oldValue?: string | null;
    newValue?: string | null;
    ipAddress?: string | null;
}) {
    try {
        const result = await db
            .insert(auditLogs)
            .values({
                userId: data.userId || null,
                action: data.action,
                entityType: data.entityType,
                entityId: data.entityId,
                description: data.description,
                oldValue: data.oldValue || null,
                newValue: data.newValue || null,
                ipAddress: data.ipAddress || null,
            })
            .returning();

        revalidatePath("/admin/audit-logs");
        return { success: true, log: result[0] };
    } catch (error) {
        console.error("Failed to create audit log:", error);
        return { success: false, error: "Failed to create audit log" };
    }
}
