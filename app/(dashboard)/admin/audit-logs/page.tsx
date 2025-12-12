import { requireSuperAdmin } from "@/lib/dal";
import { getAuditLogs, getAuditLogStats } from "@/lib/actions/audit-logs";
import AuditLogsClient from "./client";

export const metadata = {
    title: "Audit Logs | Ptbs School",
    description: "Track all system activities and changes",
};

export default async function AuditLogsPage() {
    await requireSuperAdmin();

    // Fetch real data from database
    const [logs, stats] = await Promise.all([
        getAuditLogs({ limit: 100 }),
        getAuditLogStats(),
    ]);

    // Transform logs for client
    const transformedLogs = logs.map(log => ({
        id: log.id,
        userId: log.userId,
        userName: log.userName || "System",
        userEmail: log.userEmail || "",
        userRole: log.userRole || "",
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        description: log.description,
        oldValue: log.oldValue,
        newValue: log.newValue,
        ipAddress: log.ipAddress || "N/A",
        createdAt: log.createdAt.toISOString(),
    }));

    return (
        <AuditLogsClient
            initialLogs={transformedLogs}
            stats={stats}
        />
    );
}
