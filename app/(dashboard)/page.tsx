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

export default async function DashboardPage() {
    const user = await requireAuth();

    if (user.role === ROLES.TEACHER) {
        redirect("/academics/my-classes");
    }

    if (user.role === ROLES.STUDENT) {
        redirect("/student/results");
    }

    const stats = [
        {
            title: "Total Students",
            value: "2,847",
            change: "+12%",
            trend: "up",
            icon: Users,
            visible: true,
        },
        {
            title: "Teachers",
            value: "94",
            change: "+3",
            trend: "up",
            icon: GraduationCap,
            visible: true,
        },
        {
            title: "Fee Collection",
            value: "₹24.5L",
            change: "+18%",
            trend: "up",
            icon: Receipt,
            visible: canViewRevenue(user.role),
        },
        {
            title: "Attendance Today",
            value: "94.2%",
            change: "-2.1%",
            trend: "down",
            icon: ClipboardCheck,
            visible: true,
        },
    ];

    const visibleStats = stats.filter(stat => stat.visible);

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
        <div className="space-y-4 md:space-y-6 animate-fade-in">
            {/* Welcome Header */}
            <div>
                <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
                    Welcome back, {user.name.split(" ")[0]}!
                </h1>
                <p className="text-muted-foreground text-sm md:text-base">
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
                        <div className="text-2xl md:text-3xl font-bold mt-3">2,847</div>
                        <div className="flex items-center gap-1 text-xs md:text-sm mt-1 text-orange-50">
                            <TrendingUp className="h-4 w-4" />
                            <span className="font-medium">+12% from last month</span>
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
                        <div className="text-2xl md:text-3xl font-bold mt-3 text-emerald-600">94</div>
                        <div className="flex items-center gap-1 text-xs md:text-sm mt-1 text-emerald-600 font-medium">
                            <TrendingUp className="h-4 w-4" />
                            <span>+3 new recruited</span>
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
                            <div className="text-2xl md:text-3xl font-bold mt-3 text-violet-600">₹24.5L</div>
                            <div className="flex items-center gap-1 text-xs md:text-sm mt-1 text-violet-600 font-medium">
                                <TrendingUp className="h-4 w-4" />
                                <span>+18% from last month</span>
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
                        <div className="text-2xl md:text-3xl font-bold mt-3 text-rose-600">94.2%</div>
                        <div className="flex items-center gap-1 text-xs md:text-sm mt-1 text-rose-600 font-medium">
                            <TrendingDown className="h-4 w-4" />
                            <span>-2.1% from last month</span>
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
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 md:px-5 pb-4 md:pb-5 pt-0">
                        <div className="space-y-3">
                            {[
                                { text: "New student admission: Rahul Sharma", time: "5 min ago" },
                                { text: "Fee collected from Class 10A", time: "15 min ago" },
                                { text: "Attendance marked for Class 8B", time: "1 hour ago" },
                            ].map((activity, i) => (
                                <div key={i} className="flex items-center justify-between text-xs md:text-sm">
                                    <span className="text-foreground truncate mr-2">{activity.text}</span>
                                    <span className="text-muted-foreground whitespace-nowrap">{activity.time}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="py-3 md:py-4 px-4 md:px-5">
                        <CardTitle className="text-sm md:text-base font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                            Upcoming Events
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 md:px-5 pb-4 md:pb-5 pt-0">
                        <div className="space-y-3">
                            {[
                                { event: "Parent-Teacher Meeting", date: "Dec 15, 2024" },
                                { event: "Annual Sports Day", date: "Dec 20, 2024" },
                                { event: "Term Exams Begin", date: "Jan 5, 2025" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between text-xs md:text-sm">
                                    <span className="text-foreground truncate mr-2">{item.event}</span>
                                    <span className="text-muted-foreground whitespace-nowrap">{item.date}</span>
                                </div>
                            ))}
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
                                    <span className="font-semibold text-green-600">₹18.2L</span>
                                </div>
                                <div className="flex items-center justify-between text-xs md:text-sm">
                                    <span>Pending</span>
                                    <span className="font-semibold text-orange-500">₹4.8L</span>
                                </div>
                                <div className="flex items-center justify-between text-xs md:text-sm">
                                    <span>Overdue</span>
                                    <span className="font-semibold text-red-500">₹1.5L</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="md:col-span-2 lg:col-span-1">
                        <CardHeader className="py-3 md:py-4 px-4 md:px-5">
                            <CardTitle className="text-sm md:text-base font-medium flex items-center gap-2">
                                <UserPlus className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                                Quick Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 md:px-5 pb-4 md:pb-5 pt-0">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs md:text-sm">
                                    <span>New Admission Inquiries</span>
                                    <span className="font-semibold text-primary">12 pending</span>
                                </div>
                                <div className="flex items-center justify-between text-xs md:text-sm">
                                    <span>Fee Collection Today</span>
                                    <span className="font-semibold text-green-600">₹45,000</span>
                                </div>
                                <div className="flex items-center justify-between text-xs md:text-sm">
                                    <span>Students Active</span>
                                    <span className="font-semibold">2,847</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
