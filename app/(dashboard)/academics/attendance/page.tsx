import { ClipboardCheck, Calendar, Users } from "lucide-react";
import { requireAcademics } from "@/lib/dal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getTodayAttendanceStats } from "@/lib/actions/attendance";
import { getStudentsCount, getDashboardStatistics } from "@/lib/actions/students";
import Link from "next/link";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { HeaderUpdater } from "@/components/dashboard/header-context";

const classes = [
    "Nursery", "LKG", "UKG",
    "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
    "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
    "Class 11", "Class 12"
];
const sections = ["A", "B", "C"];

export default async function AttendancePage() {
    await requireAcademics();

    // Fetch real data from database
    const [todayStats, dashboardStats] = await Promise.all([
        getTodayAttendanceStats(),
        getDashboardStatistics(),
    ]);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <HeaderUpdater
                title="Attendance"
                description="Mark and track daily attendance"
            />
            <div className="flex justify-end">
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-md">
                    <Calendar className="h-4 w-4" />
                    {new Date().toLocaleDateString("en-IN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}
                </div>
            </div>

            {/* Today's Stats */}
            <div className="grid gap-4 md:grid-cols-5">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{dashboardStats.totalStudents}</div>
                        <p className="text-xs text-muted-foreground">Total Students</p>
                    </CardContent>
                </Card>
                <Card className="bg-green-500/5">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-green-600">{todayStats.present}</div>
                        <p className="text-xs text-muted-foreground">Present Today</p>
                    </CardContent>
                </Card>
                <Card className="bg-red-500/5">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-red-600">{todayStats.absent}</div>
                        <p className="text-xs text-muted-foreground">Absent Today</p>
                    </CardContent>
                </Card>
                <Card className="bg-yellow-500/5">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-yellow-600">{todayStats.late}</div>
                        <p className="text-xs text-muted-foreground">Late Today</p>
                    </CardContent>
                </Card>
                <Card className="bg-blue-500/5">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-blue-600">{todayStats.percentage}%</div>
                        <p className="text-xs text-muted-foreground">Attendance Rate</p>
                    </CardContent>
                </Card>
            </div>

            {/* Class Selector */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Select Class to Mark Attendance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        {classes.map((cls) => (
                            <Card key={cls} className="hover:bg-muted/50 transition-colors cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="font-medium">{cls}</div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {sections.map((section) => (
                                            <Button
                                                key={`${cls}-${section}`}
                                                variant="outline"
                                                size="sm"
                                                asChild
                                            >
                                                <Link href={`/academics/attendance/mark?class=${encodeURIComponent(cls)}&section=${section}`}>
                                                    Section {section}
                                                </Link>
                                            </Button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Empty State if no attendance marked today */}
            {todayStats.total === 0 && (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <ClipboardCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">No attendance marked today</p>
                        <p className="text-sm mt-1">Select a class above to start marking attendance</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
