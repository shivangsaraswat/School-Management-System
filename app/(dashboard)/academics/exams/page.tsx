import Link from "next/link";
import { FileText, Plus, Calendar, Clock, BookOpen } from "lucide-react";
import { requireAcademics } from "@/lib/dal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { getExams, getExamStatistics } from "@/lib/actions/exams";
import { format } from "date-fns";
import { HeaderUpdater } from "@/components/dashboard/header-context";

export default async function ExamsPage() {
    await requireAcademics();

    // Fetch real data from database
    const [exams, stats] = await Promise.all([
        getExams({ limit: 20 }),
        getExamStatistics(),
    ]);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <HeaderUpdater
                title="Examinations"
                description="Manage exam schedules and enter marks"
            />
            <div className="flex justify-end">
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Schedule Exam
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{stats.upcoming}</div>
                        <p className="text-xs text-muted-foreground">Upcoming Exams</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{stats.completed}</div>
                        <p className="text-xs text-muted-foreground">Completed This Month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{stats.pendingMarksEntry}</div>
                        <p className="text-xs text-muted-foreground">Pending Marks Entry</p>
                    </CardContent>
                </Card>
            </div>

            {/* Exams Grid */}
            <div className="grid gap-4 md:grid-cols-2">
                {exams.length === 0 ? (
                    <Card className="md:col-span-2">
                        <CardContent className="py-12 text-center text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">No exams scheduled</p>
                            <p className="text-sm mt-1">Schedule an exam to get started</p>
                            <Button className="mt-4">
                                <Plus className="mr-2 h-4 w-4" />
                                Schedule Exam
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    exams.map((exam) => (
                        <Card key={exam.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">{exam.name}</CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            {exam.className} {exam.section ? `- ${exam.section}` : ""} • {exam.subject}
                                        </p>
                                    </div>
                                    <StatusBadge status={exam.status} />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        {format(new Date(exam.date), "MMM dd, yyyy")}
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
                    ))
                )}
            </div>
        </div>
    );
}
