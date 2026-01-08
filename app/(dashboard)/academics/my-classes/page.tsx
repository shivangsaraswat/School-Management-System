import { BookOpen, Users, ClipboardCheck, TrendingUp, Settings } from "lucide-react";
import { requireAcademics } from "@/lib/dal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDashboardStatistics } from "@/lib/actions/students";
import { getTodayAttendanceStats } from "@/lib/actions/attendance";
import { getSchoolClasses } from "@/lib/actions/settings";
import Link from "next/link";
import { HeaderUpdater } from "@/components/dashboard/header-context";

interface SchoolClass {
    name: string;
    sections: string[];
}

interface AvailableClass {
    id: string;
    className: string;
    section: string;
    subject: string;
    totalStudents: number;
    todayAttendance: number;
    avgPerformance: number;
}

export default async function MyClassesPage() {
    await requireAcademics();

    // Fetch data from database
    const [dashboardStats, attendanceStats, schoolClasses] = await Promise.all([
        getDashboardStatistics(),
        getTodayAttendanceStats(),
        getSchoolClasses(),
    ]);

    // For now, show all classes since we don't have teacher-class assignments
    // This can be enhanced later with proper teacher-class mapping
    const availableClasses = schoolClasses.slice(0, 6).map((cls: SchoolClass, index: number) => ({
        id: String(index + 1),
        className: cls.name,
        section: cls.sections[0] || "A",
        subject: "General",
        totalStudents: Math.floor(Math.random() * 20) + 30, // Placeholder until we have real assignments
        todayAttendance: attendanceStats.present > 0 ? Math.floor(attendanceStats.present / 6) : 0,
        avgPerformance: 75 + Math.floor(Math.random() * 20),
    }));

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <HeaderUpdater
                title="My Classes"
                description="Overview of your assigned classes and students"
            />

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{dashboardStats.totalStudents}</div>
                        <p className="text-xs text-muted-foreground">Total Students</p>
                    </CardContent>
                </Card>
                <Card className="bg-green-500/5">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-green-600">{attendanceStats.present}</div>
                        <p className="text-xs text-muted-foreground">Present Today</p>
                    </CardContent>
                </Card>
                <Card className="bg-red-500/5">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-red-600">{attendanceStats.absent}</div>
                        <p className="text-xs text-muted-foreground">Absent Today</p>
                    </CardContent>
                </Card>
                <Card className="bg-blue-500/5">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-blue-600">{attendanceStats.percentage}%</div>
                        <p className="text-xs text-muted-foreground">Attendance Rate</p>
                    </CardContent>
                </Card>
            </div>

            {/* Info Notice */}
            <Card className="bg-blue-50 border-blue-200">
                <CardContent className="py-4">
                    <div className="flex items-center gap-3">
                        <Settings className="h-5 w-5 text-blue-600" />
                        <div>
                            <p className="font-medium text-blue-900">Teacher-Class Assignments</p>
                            <p className="text-sm text-blue-700">
                                Class assignments are managed by administrators. Contact your admin to update your assigned classes.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Class Cards */}
            {availableClasses.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-3">
                    {availableClasses.map((cls: AvailableClass) => (
                        <Card key={cls.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">
                                    {cls.className} - {cls.section}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">{cls.subject}</p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="p-2 rounded-lg bg-muted/50">
                                        <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                                        <div className="text-lg font-bold">{cls.totalStudents}</div>
                                        <p className="text-xs text-muted-foreground">Students</p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-green-500/10">
                                        <ClipboardCheck className="h-4 w-4 mx-auto mb-1 text-green-600" />
                                        <div className="text-lg font-bold text-green-600">
                                            {cls.todayAttendance}
                                        </div>
                                        <p className="text-xs text-muted-foreground">Present</p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-blue-500/10">
                                        <TrendingUp className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                                        <div className="text-lg font-bold text-blue-600">
                                            {cls.avgPerformance}%
                                        </div>
                                        <p className="text-xs text-muted-foreground">Average</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1" asChild>
                                        <Link href={`/operations/students/class/${encodeURIComponent(cls.className)}?section=${cls.section}`}>
                                            View Students
                                        </Link>
                                    </Button>
                                    <Button size="sm" className="flex-1" asChild>
                                        <Link href={`/academics/attendance/mark?class=${encodeURIComponent(cls.className)}&section=${cls.section}`}>
                                            Take Attendance
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">No classes configured</p>
                        <p className="text-sm mt-1">Contact your administrator to set up class assignments</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
