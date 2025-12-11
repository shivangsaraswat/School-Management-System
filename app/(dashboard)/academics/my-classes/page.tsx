import { BookOpen, Users, ClipboardCheck, TrendingUp } from "lucide-react";
import { requireAcademics } from "@/lib/dal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

// Mock class data
const myClasses = [
    {
        id: "1",
        className: "Class 10",
        section: "A",
        subject: "Mathematics",
        totalStudents: 45,
        todayAttendance: 42,
        avgPerformance: 78,
    },
    {
        id: "2",
        className: "Class 9",
        section: "B",
        subject: "Mathematics",
        totalStudents: 48,
        todayAttendance: 45,
        avgPerformance: 72,
    },
    {
        id: "3",
        className: "Class 8",
        section: "A",
        subject: "Mathematics",
        totalStudents: 42,
        todayAttendance: 40,
        avgPerformance: 81,
    },
];

const topStudents = [
    { name: "Priya Singh", class: "10A", score: 98 },
    { name: "Rahul Sharma", class: "10A", score: 95 },
    { name: "Amit Kumar", class: "9B", score: 94 },
    { name: "Neha Gupta", class: "9B", score: 92 },
    { name: "Vikram Patel", class: "8A", score: 90 },
];

export default async function MyClassesPage() {
    await requireAcademics();

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-xl md:text-2xl font-semibold tracking-tight flex items-center gap-2">
                    <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                    My Classes
                </h1>
                <p className="text-muted-foreground">
                    Overview of your assigned classes and students
                </p>
            </div>

            {/* Class Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                {myClasses.map((cls) => (
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
                                <Button variant="outline" size="sm" className="flex-1">
                                    View Students
                                </Button>
                                <Button size="sm" className="flex-1">
                                    Take Attendance
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Top Performers */}
            <Card>
                <CardHeader>
                    <CardTitle>Top Performers (Last Exam)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {topStudents.map((student, index) => (
                            <div
                                key={student.name}
                                className="flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm ${index === 0
                                            ? "bg-yellow-500 text-white"
                                            : index === 1
                                                ? "bg-gray-400 text-white"
                                                : index === 2
                                                    ? "bg-amber-700 text-white"
                                                    : "bg-muted text-muted-foreground"
                                            }`}
                                    >
                                        {index + 1}
                                    </div>
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-primary/10 text-primary">
                                            {getInitials(student.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{student.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Class {student.class}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-lg font-bold text-primary">
                                    {student.score}%
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
