import { redirect } from "next/navigation";
import {
    Users,
    GraduationCap,
    Receipt,
    ClipboardCheck,
    TrendingUp,
    TrendingDown,
    Activity,
    Calendar,
    BarChart3,
    UserPlus,
} from "lucide-react";
import { requireAuth } from "@/lib/dal";
import { ROLES } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { canViewRevenue } from "@/lib/permissions";
import { getDashboardStatistics, getRecentStudents } from "@/lib/actions/students";
import { getTeachersCount } from "@/lib/actions/users";
import { getFeeStatistics } from "@/lib/actions/fees";
import { getTodayAttendanceStats } from "@/lib/actions/attendance";
import { formatDistanceToNow } from "date-fns";

// Helper to format currency in lakhs
function formatCurrency(amount: number): string {
    if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(1)}L`;
    }
    if (amount >= 1000) {
        return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount.toFixed(0)}`;
}

export default async function DashboardPage() {
    const user = await requireAuth();

    if (user.role === ROLES.TEACHER) {
        redirect("/academics/my-classes");
    }

    if (user.role === ROLES.STUDENT) {
        redirect("/student/results");
    }

    // Check if user can access academics (for attendance stats)
    const canAccessAttendance = user.role !== ROLES.OFFICE_STAFF;

    // Fetch real data from database
    const [dashboardStats, teachersCount, feeStats, attendanceStats, recentStudents] = await Promise.all([
        getDashboardStatistics(),
        getTeachersCount(),
        getFeeStatistics(),
        canAccessAttendance
            ? getTodayAttendanceStats()
            : Promise.resolve({ present: 0, absent: 0, late: 0, leave: 0, total: 0, percentage: "0" }),
        getRecentStudents(3),
    ]);

    const totalCollected = feeStats.collected + feeStats.pending + feeStats.overdue;
    const collectionPercentage = totalCollected > 0
        ? Math.round((feeStats.collected / totalCollected) * 100)
        : 0;

    const getRoleMessage = () => {
        switch (user.role) {
            case ROLES.SUPER_ADMIN:
                return "You have full access to all system features and settings.";
            case ROLES.ADMIN:
                return "Manage school operations and academic activities.";
            case ROLES.OFFICE_STAFF:
                return "Manage student admissions, fees, and records.";
            default:
                return "Here's what's happening at your school today.";
        }
    };

    return (
        <div className="space-y-4 md:space-y-6 animate-fade-in pt-2 md:pt-4">
            {/* Welcome Header - In Main Content Area */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    Welcome back, {user.name.split(" ")[0]}!
                </h1>
                <p className="text-muted-foreground mt-1">
                    {getRoleMessage()}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
                {/* Total Students - Hero Card (Gradient from Image) */}
                <Card className="relative overflow-hidden border-none bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-lg transition-all hover:-translate-y-1">
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
                    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/20 blur-3xl" />
                    <CardContent className="p-4 md:p-5 relative z-10">
                        <div className="flex items-center justify-between">
                            <span className="text-xs md:text-sm font-medium text-orange-50">Total Students</span>
                            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                <Users className="h-4 w-4 text-white" />
                            </div>
                        </div>
                        <div className="text-2xl md:text-3xl font-bold mt-3">
                            {dashboardStats.totalStudents.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1 text-xs md:text-sm mt-1 text-orange-50">
                            <TrendingUp className="h-4 w-4" />
                            <span className="font-medium">+{dashboardStats.recentAdmissions} this month</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Teachers - White Card with Emerald Accents */}
                <Card className="relative overflow-hidden border border-slate-100 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                    <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50" />
                    <CardContent className="p-4 md:p-5 relative z-10">
                        <div className="flex items-center justify-between">
                            <span className="text-xs md:text-sm font-medium text-muted-foreground">Total Teachers</span>
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <GraduationCap className="h-4 w-4 text-emerald-600" />
                            </div>
                        </div>
                        <div className="text-2xl md:text-3xl font-bold mt-3 text-emerald-600">
                            {teachersCount}
                        </div>
                        <div className="flex items-center gap-1 text-xs md:text-sm mt-1 text-emerald-600 font-medium">
                            <Users className="h-4 w-4" />
                            <span>Active staff</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Fee Collection - White Card with Violet Accents */}
                {canViewRevenue(user.role) && (
                    <Card className="relative overflow-hidden border border-slate-100 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50" />
                        <CardContent className="p-4 md:p-5 relative z-10">
                            <div className="flex items-center justify-between">
                                <span className="text-xs md:text-sm font-medium text-muted-foreground">Fee Collection</span>
                                <div className="p-2 bg-violet-100 rounded-lg">
                                    <Receipt className="h-4 w-4 text-violet-600" />
                                </div>
                            </div>
                            <div className="text-2xl md:text-3xl font-bold mt-3 text-violet-600">
                                {formatCurrency(feeStats.collected)}
                            </div>
                            <div className="flex items-center gap-1 text-xs md:text-sm mt-1 text-violet-600 font-medium">
                                <TrendingUp className="h-4 w-4" />
                                <span>{collectionPercentage}% collected</span>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Attendance - White Card with Rose Accents */}
                <Card className="relative overflow-hidden border border-slate-100 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                    <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50" />
                    <CardContent className="p-4 md:p-5 relative z-10">
                        <div className="flex items-center justify-between">
                            <span className="text-xs md:text-sm font-medium text-muted-foreground">Attendance Today</span>
                            <div className="p-2 bg-rose-100 rounded-lg">
                                <ClipboardCheck className="h-4 w-4 text-rose-600" />
                            </div>
                        </div>
                        <div className="text-2xl md:text-3xl font-bold mt-3 text-rose-600">
                            {attendanceStats.percentage}%
                        </div>
                        <div className="flex items-center gap-1 text-xs md:text-sm mt-1 text-rose-600 font-medium">
                            {parseFloat(attendanceStats.percentage) >= 90 ? (
                                <TrendingUp className="h-4 w-4" />
                            ) : (
                                <TrendingDown className="h-4 w-4" />
                            )}
                            <span>{attendanceStats.present} present today</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="py-3 md:py-4 px-4 md:px-5">
                        <CardTitle className="text-sm md:text-base font-medium flex items-center gap-2">
                            <Activity className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                            Recent Admissions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 md:px-5 pb-4 md:pb-5 pt-0">
                        <div className="space-y-3">
                            {recentStudents.length > 0 ? (
                                recentStudents.map((student) => (
                                    <div key={student.id} className="flex items-center justify-between text-xs md:text-sm">
                                        <span className="text-foreground truncate mr-2">
                                            {student.firstName} {student.lastName} - {student.className} {student.section}
                                        </span>
                                        <span className="text-muted-foreground whitespace-nowrap">
                                            {formatDistanceToNow(new Date(student.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted-foreground text-sm">No recent admissions</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="py-3 md:py-4 px-4 md:px-5">
                        <CardTitle className="text-sm md:text-base font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                            Class Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 md:px-5 pb-4 md:pb-5 pt-0">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs md:text-sm">
                                <span>Total Classes</span>
                                <span className="font-semibold">{dashboardStats.totalClasses}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs md:text-sm">
                                <span>Total Sections</span>
                                <span className="font-semibold">{dashboardStats.totalSections}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs md:text-sm">
                                <span>Avg. per Section</span>
                                <span className="font-semibold">
                                    {dashboardStats.totalSections > 0
                                        ? Math.round(dashboardStats.totalStudents / dashboardStats.totalSections)
                                        : 0}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {canViewRevenue(user.role) ? (
                    <Card>
                        <CardHeader className="py-3 md:py-4 px-4 md:px-5">
                            <CardTitle className="text-sm md:text-base font-medium flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                                Revenue Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 md:px-5 pb-4 md:pb-5 pt-0">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs md:text-sm">
                                    <span>Total Collected</span>
                                    <span className="font-semibold text-green-600">
                                        {formatCurrency(feeStats.collected)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs md:text-sm">
                                    <span>Pending</span>
                                    <span className="font-semibold text-orange-500">
                                        {formatCurrency(feeStats.pending)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs md:text-sm">
                                    <span>Overdue</span>
                                    <span className="font-semibold text-red-500">
                                        {formatCurrency(feeStats.overdue)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="md:col-span-2 lg:col-span-1">
                        <CardHeader className="py-3 md:py-4 px-4 md:px-5">
                            <CardTitle className="text-sm md:text-base font-medium flex items-center gap-2">
                                <UserPlus className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                                Quick Stats
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 md:px-5 pb-4 md:pb-5 pt-0">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs md:text-sm">
                                    <span>Boys</span>
                                    <span className="font-semibold text-blue-600">
                                        {dashboardStats.genderBreakdown["Male"] || 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs md:text-sm">
                                    <span>Girls</span>
                                    <span className="font-semibold text-pink-600">
                                        {dashboardStats.genderBreakdown["Female"] || 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs md:text-sm">
                                    <span>New This Month</span>
                                    <span className="font-semibold">{dashboardStats.recentAdmissions}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
