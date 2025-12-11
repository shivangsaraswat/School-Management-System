import Link from "next/link";
import { FileText, Plus, Calendar, Clock, BookOpen } from "lucide-react";
import { requireAcademics } from "@/lib/dal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";

// Mock exam data
const exams = [
    {
        id: "1",
        name: "Half Yearly Examination",
        className: "Class 10",
        subject: "Mathematics",
        date: "2024-12-20",
        startTime: "09:00 AM",
        endTime: "12:00 PM",
        maxMarks: 100,
        status: "upcoming",
    },
    {
        id: "2",
        name: "Half Yearly Examination",
        className: "Class 10",
        subject: "Science",
        date: "2024-12-22",
        startTime: "09:00 AM",
        endTime: "12:00 PM",
        maxMarks: 100,
        status: "upcoming",
    },
    {
        id: "3",
        name: "Unit Test 3",
        className: "Class 9",
        subject: "English",
        date: "2024-12-15",
        startTime: "10:00 AM",
        endTime: "11:30 AM",
        maxMarks: 50,
        status: "scheduled",
    },
    {
        id: "4",
        name: "Unit Test 2",
        className: "Class 10",
        subject: "Hindi",
        date: "2024-11-25",
        startTime: "10:00 AM",
        endTime: "11:30 AM",
        maxMarks: 50,
        status: "completed",
    },
];

export default async function ExamsPage() {
    await requireAcademics();

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl md:text-2xl font-semibold tracking-tight flex items-center gap-2">
                        <FileText className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                        Examinations
                    </h1>
                    <p className="text-muted-foreground">
                        Manage exam schedules and enter marks
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Schedule Exam
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">4</div>
                        <p className="text-xs text-muted-foreground">Upcoming Exams</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">Completed This Month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground">Pending Marks Entry</p>
                    </CardContent>
                </Card>
            </div>

            {/* Exams Grid */}
            <div className="grid gap-4 md:grid-cols-2">
                {exams.map((exam) => (
                    <Card key={exam.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-lg">{exam.name}</CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        {exam.className} • {exam.subject}
                                    </p>
                                </div>
                                <StatusBadge status={exam.status} />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    {exam.date}
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    {exam.startTime} - {exam.endTime}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                                <span>Max Marks: {exam.maxMarks}</span>
                            </div>
                            <div className="pt-2 flex gap-2">
                                {exam.status === "completed" ? (
                                    <Button variant="outline" size="sm" className="flex-1" asChild>
                                        <Link href={`/academics/exams/${exam.id}`}>Enter Marks</Link>
                                    </Button>
                                ) : (
                                    <Button variant="outline" size="sm" className="flex-1">
                                        View Details
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
