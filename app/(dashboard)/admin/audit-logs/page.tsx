import { Shield, Search, Filter, Download } from "lucide-react";
import { requireAdmin } from "@/lib/dal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";

// Mock audit log data
const auditLogs = [
    {
        id: "1",
        user: "Admin User",
        action: "CREATE",
        entityType: "Student",
        entityId: "STU001",
        description: "Added new student: Rahul Sharma",
        ipAddress: "192.168.1.100",
        createdAt: "2024-12-11T10:30:00Z",
    },
    {
        id: "2",
        user: "Office Staff",
        action: "UPDATE",
        entityType: "Fee",
        entityId: "FEE001",
        description: "Collected fee payment of ₹5,000",
        ipAddress: "192.168.1.101",
        createdAt: "2024-12-11T09:15:00Z",
    },
    {
        id: "3",
        user: "Teacher",
        action: "UPDATE",
        entityType: "Attendance",
        entityId: "ATT001",
        description: "Marked attendance for Class 10A",
        ipAddress: "192.168.1.102",
        createdAt: "2024-12-11T08:00:00Z",
    },
    {
        id: "4",
        user: "Admin User",
        action: "DELETE",
        entityType: "Student",
        entityId: "STU099",
        description: "Removed student: Old Record",
        ipAddress: "192.168.1.100",
        createdAt: "2024-12-10T16:45:00Z",
    },
];

const actionColors: Record<string, string> = {
    CREATE: "success",
    UPDATE: "warning",
    DELETE: "destructive",
};

export default async function AuditLogsPage() {
    await requireAdmin();

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Shield className="h-8 w-8 text-primary" />
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
                                {auditLogs.map((log) => (
                                    <tr key={log.id} className="border-b last:border-0">
                                        <td className="py-4 text-sm">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                        <td className="py-4 text-sm font-medium">{log.user}</td>
                                        <td className="py-4">
                                            <StatusBadge status={log.action.toLowerCase()}>
                                                {log.action}
                                            </StatusBadge>
                                        </td>
                                        <td className="py-4 text-sm">{log.description}</td>
                                        <td className="py-4 text-sm text-muted-foreground font-mono">
                                            {log.ipAddress}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
