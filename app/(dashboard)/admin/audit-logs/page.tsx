import { Shield, Search, Filter, Download } from "lucide-react";
import { requireAdmin } from "@/lib/dal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { getAuditLogs, getAuditLogCount } from "@/lib/actions/audit-logs";
import { format } from "date-fns";

export default async function AuditLogsPage() {
    await requireAdmin();

    // Fetch real data from database
    const [logs, totalCount] = await Promise.all([
        getAuditLogs({ limit: 50 }),
        getAuditLogCount(),
    ]);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl md:text-2xl font-semibold tracking-tight flex items-center gap-2">
                        <Shield className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                        Audit Logs
                    </h1>
                    <p className="text-muted-foreground">
                        Track all system activities and changes
                    </p>
                </div>
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </div>

            {/* Stats */}
            <Card>
                <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{totalCount}</div>
                    <p className="text-xs text-muted-foreground">Total Logs Recorded</p>
                </CardContent>
            </Card>

            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search logs..." className="pl-9" />
                </div>
                <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                </Button>
            </div>

            {/* Logs Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b text-left text-sm text-muted-foreground">
                                    <th className="pb-3 font-medium">Time</th>
                                    <th className="pb-3 font-medium">User</th>
                                    <th className="pb-3 font-medium">Action</th>
                                    <th className="pb-3 font-medium">Description</th>
                                    <th className="pb-3 font-medium">IP Address</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-muted-foreground">
                                            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p>No activity logs yet</p>
                                            <p className="text-sm mt-1">System activities will be recorded here</p>
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log.id} className="border-b last:border-0">
                                            <td className="py-4 text-sm">
                                                {format(new Date(log.createdAt), "MMM dd, yyyy HH:mm")}
                                            </td>
                                            <td className="py-4 text-sm font-medium">
                                                {log.userName || "System"}
                                            </td>
                                            <td className="py-4">
                                                <StatusBadge
                                                    status={
                                                        log.action === "CREATE" ? "success" :
                                                            log.action === "UPDATE" ? "warning" :
                                                                log.action === "DELETE" ? "destructive" : "default"
                                                    }
                                                >
                                                    {log.action}
                                                </StatusBadge>
                                            </td>
                                            <td className="py-4 text-sm">{log.description}</td>
                                            <td className="py-4 text-sm text-muted-foreground font-mono">
                                                {log.ipAddress || "N/A"}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
