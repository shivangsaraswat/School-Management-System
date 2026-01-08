"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Shield,
    Search,
    Filter,
    Download,
    Trash2,
    MoreHorizontal,
    Calendar,
    Activity,
    Plus,
    Edit,
    Eye,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Clock,
    User,
    ChevronDown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { deleteAuditLog, deleteMultipleAuditLogs } from "@/lib/actions/audit-logs";
import { format } from "date-fns";
import { HeaderUpdater } from "@/components/dashboard/header-context";

interface AuditLog {
    id: string;
    userId: string | null;
    userName: string;
    userEmail: string;
    userRole: string;
    action: string;
    entityType: string;
    entityId: string;
    description: string;
    oldValue: string | null;
    newValue: string | null;
    ipAddress: string;
    createdAt: string;
}

interface AuditStats {
    total: number;
    today: number;
    thisWeek: number;
    creates: number;
    updates: number;
    deletes: number;
}

interface AuditLogsClientProps {
    initialLogs: AuditLog[];
    stats: AuditStats;
}

export default function AuditLogsClient({ initialLogs, stats }: AuditLogsClientProps) {
    const router = useRouter();
    const [logs, setLogs] = useState(initialLogs);
    const [searchQuery, setSearchQuery] = useState("");
    const [actionFilter, setActionFilter] = useState("all");
    const [entityFilter, setEntityFilter] = useState("all");

    // Delete state
    const [deleteLog, setDeleteLog] = useState<AuditLog | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // View details state
    const [viewLog, setViewLog] = useState<AuditLog | null>(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

    // Filter logs
    const filteredLogs = logs.filter(log => {
        const matchesSearch = searchQuery === "" ||
            log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.entityId.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesAction = actionFilter === "all" || log.action === actionFilter;
        const matchesEntity = entityFilter === "all" || log.entityType === entityFilter;

        return matchesSearch && matchesAction && matchesEntity;
    });

    // Get action badge color
    const getActionBadge = (action: string) => {
        switch (action) {
            case "CREATE":
                return { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: Plus };
            case "UPDATE":
                return { bg: "bg-amber-50 text-amber-700 border-amber-200", icon: Edit };
            case "DELETE":
                return { bg: "bg-red-50 text-red-700 border-red-200", icon: Trash2 };
            case "DEACTIVATE":
                return { bg: "bg-gray-50 text-gray-700 border-gray-200", icon: XCircle };
            case "REACTIVATE":
                return { bg: "bg-blue-50 text-blue-700 border-blue-200", icon: CheckCircle2 };
            case "LOGIN":
                return { bg: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: User };
            case "PASSWORD_CHANGE":
            case "PASSWORD_RESET":
                return { bg: "bg-purple-50 text-purple-700 border-purple-200", icon: Shield };
            default:
                return { bg: "bg-gray-50 text-gray-700 border-gray-200", icon: Activity };
        }
    };

    // Get entity type badge
    const getEntityBadge = (entityType: string) => {
        switch (entityType) {
            case "user":
                return "bg-blue-100 text-blue-700";
            case "student":
                return "bg-emerald-100 text-emerald-700";
            case "fee":
                return "bg-amber-100 text-amber-700";
            case "class":
                return "bg-purple-100 text-purple-700";
            case "attendance":
                return "bg-cyan-100 text-cyan-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    // Format role
    const formatRole = (role: string) => {
        return role.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    };

    // Handle delete
    const handleDelete = async () => {
        if (!deleteLog) return;

        setIsDeleting(true);
        try {
            const result = await deleteAuditLog(deleteLog.id);
            if (result.success) {
                setLogs(prev => prev.filter(l => l.id !== deleteLog.id));
                toast.success("Audit log deleted");
                setIsDeleteDialogOpen(false);
                setDeleteLog(null);
            } else {
                toast.error(result.error || "Failed to delete log");
            }
        } catch {
            toast.error("Failed to delete log");
        } finally {
            setIsDeleting(false);
        }
    };

    // Open view dialog
    const openViewDialog = (log: AuditLog) => {
        setViewLog(log);
        setIsViewDialogOpen(true);
    };

    // Open delete dialog
    const openDeleteDialog = (log: AuditLog) => {
        setDeleteLog(log);
        setIsDeleteDialogOpen(true);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <HeaderUpdater
                title="Audit Logs"
                description="Track all system activities and changes"
            />
            <div className="flex items-center justify-end">
                <Button variant="outline" onClick={() => toast.info("Export feature coming soon")}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Activity className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stats.total}</div>
                                <p className="text-xs text-muted-foreground">Total Logs</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Clock className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stats.today}</div>
                                <p className="text-xs text-muted-foreground">Today</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                <Plus className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stats.creates}</div>
                                <p className="text-xs text-muted-foreground">Creates</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                <Trash2 className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stats.deletes}</div>
                                <p className="text-xs text-muted-foreground">Deletes</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search logs by description, user, or ID..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Select value={actionFilter} onValueChange={setActionFilter}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Action" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Actions</SelectItem>
                            <SelectItem value="CREATE">Create</SelectItem>
                            <SelectItem value="UPDATE">Update</SelectItem>
                            <SelectItem value="DELETE">Delete</SelectItem>
                            <SelectItem value="DEACTIVATE">Deactivate</SelectItem>
                            <SelectItem value="REACTIVATE">Reactivate</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={entityFilter} onValueChange={setEntityFilter}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Entity" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Entities</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="fee">Fee</SelectItem>
                            <SelectItem value="class">Class</SelectItem>
                            <SelectItem value="attendance">Attendance</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Logs Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                        {filteredLogs.length} {filteredLogs.length === 1 ? 'log' : 'logs'} found
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b text-left text-sm text-muted-foreground">
                                    <th className="pb-3 font-medium">Time</th>
                                    <th className="pb-3 font-medium">User</th>
                                    <th className="pb-3 font-medium">Action</th>
                                    <th className="pb-3 font-medium">Entity</th>
                                    <th className="pb-3 font-medium">Description</th>
                                    <th className="pb-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-muted-foreground">
                                            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p>No activity logs found</p>
                                            <p className="text-sm mt-1">System activities will be recorded here</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log) => {
                                        const actionBadge = getActionBadge(log.action);
                                        const ActionIcon = actionBadge.icon;
                                        return (
                                            <tr key={log.id} className="border-b last:border-0 hover:bg-muted/5">
                                                <td className="py-4">
                                                    <div className="text-sm font-medium">
                                                        {format(new Date(log.createdAt), "MMM dd, yyyy")}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {format(new Date(log.createdAt), "HH:mm:ss")}
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${log.userName}`} />
                                                            <AvatarFallback className="text-xs">
                                                                {log.userName.split(" ").map(n => n[0]).join("").substring(0, 2)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="text-sm font-medium">{log.userName}</div>
                                                            {log.userRole && (
                                                                <div className="text-xs text-muted-foreground">
                                                                    {formatRole(log.userRole)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${actionBadge.bg}`}>
                                                        <ActionIcon className="h-3 w-3" />
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getEntityBadge(log.entityType)}`}>
                                                        {log.entityType}
                                                    </span>
                                                </td>
                                                <td className="py-4">
                                                    <div className="text-sm max-w-[300px] truncate">
                                                        {log.description}
                                                    </div>
                                                </td>
                                                <td className="py-4 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => openViewDialog(log)}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="text-red-600"
                                                                onClick={() => openDeleteDialog(log)}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete Log
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* View Details Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Eye className="h-5 w-5" />
                            Log Details
                        </DialogTitle>
                        <DialogDescription>
                            Complete information about this audit log entry
                        </DialogDescription>
                    </DialogHeader>
                    {viewLog && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Timestamp</p>
                                    <p className="text-sm font-medium">
                                        {format(new Date(viewLog.createdAt), "PPpp")}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">User</p>
                                    <p className="text-sm font-medium">{viewLog.userName}</p>
                                    <p className="text-xs text-muted-foreground">{viewLog.userEmail}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Action</p>
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getActionBadge(viewLog.action).bg}`}>
                                        {viewLog.action}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Entity Type</p>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getEntityBadge(viewLog.entityType)}`}>
                                        {viewLog.entityType}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Entity ID</p>
                                <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                                    {viewLog.entityId}
                                </code>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Description</p>
                                <p className="text-sm">{viewLog.description}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">IP Address</p>
                                <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                                    {viewLog.ipAddress}
                                </code>
                            </div>
                            {(viewLog.oldValue || viewLog.newValue) && (
                                <div className="space-y-2">
                                    {viewLog.oldValue && (
                                        <div className="space-y-1">
                                            <p className="text-xs text-muted-foreground">Old Value</p>
                                            <pre className="text-xs bg-red-50 p-2 rounded overflow-auto max-h-32">
                                                {viewLog.oldValue}
                                            </pre>
                                        </div>
                                    )}
                                    {viewLog.newValue && (
                                        <div className="space-y-1">
                                            <p className="text-xs text-muted-foreground">New Value</p>
                                            <pre className="text-xs bg-green-50 p-2 rounded overflow-auto max-h-32">
                                                {viewLog.newValue}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            Delete Audit Log
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this log entry? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {deleteLog && (
                        <div className="py-4">
                            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm">
                                <p className="font-medium text-red-800">{deleteLog.action} - {deleteLog.entityType}</p>
                                <p className="text-red-600 text-xs mt-1">{deleteLog.description}</p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete Log"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
