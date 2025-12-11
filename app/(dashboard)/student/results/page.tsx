import { requireStudent } from "@/lib/dal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Award, TrendingUp, BookOpen, Calendar } from "lucide-react";

// Mock results data - would come from DB in production
const mockResults = {
    student: {
        name: "Rahul Sharma",
        class: "10-A",
        rollNumber: 15,
        academicYear: "2024-2025",
    },
    exams: [
        {
            name: "Mid-Term Examination",
            date: "November 2024",
            subjects: [
                { name: "Mathematics", marksObtained: 85, maxMarks: 100, grade: "A" },
                { name: "Science", marksObtained: 78, maxMarks: 100, grade: "B+" },
                { name: "English", marksObtained: 92, maxMarks: 100, grade: "A+" },
                { name: "Hindi", marksObtained: 88, maxMarks: 100, grade: "A" },
                { name: "Social Science", marksObtained: 75, maxMarks: 100, grade: "B+" },
            ],
            totalMarks: 418,
            maxTotal: 500,
            percentage: 83.6,
            rank: 5,
        },
        {
            name: "Unit Test 2",
            date: "October 2024",
            subjects: [
                { name: "Mathematics", marksObtained: 42, maxMarks: 50, grade: "A" },
                { name: "Science", marksObtained: 38, maxMarks: 50, grade: "B+" },
                { name: "English", marksObtained: 45, maxMarks: 50, grade: "A+" },
            ],
            totalMarks: 125,
            maxTotal: 150,
            percentage: 83.3,
            rank: 7,
        },
    ],
};

export default async function StudentResultsPage() {
    await requireStudent();

    const { student, exams } = mockResults;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Student Info Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-semibold tracking-tight flex items-center gap-2">
                        <Award className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                        My Results
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        View your examination results and academic performance
                    </p>
                </div>
                <Card className="md:min-w-[300px]">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">Name:</span>
                                <p className="font-medium">{student.name}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Class:</span>
                                <p className="font-medium">{student.class}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Roll No:</span>
                                <p className="font-medium">{student.rollNumber}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Year:</span>
                                <p className="font-medium">{student.academicYear}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Latest Percentage
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {exams[0].percentage}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {exams[0].name}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Class Rank
                        </CardTitle>
                        <Award className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">#{exams[0].rank}</div>
                        <p className="text-xs text-muted-foreground">
                            Out of 45 students
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Exams Taken
                        </CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{exams.length}</div>
                        <p className="text-xs text-muted-foreground">
                            This academic year
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Exam Results */}
            {exams.map((exam, examIndex) => (
                <Card key={examIndex}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    {exam.name}
                                </CardTitle>
                                <CardDescription>{exam.date}</CardDescription>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-primary">
                                    {exam.percentage}%
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Rank #{exam.rank}
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-2 font-medium">Subject</th>
                                        <th className="text-center py-3 px-2 font-medium">Marks Obtained</th>
                                        <th className="text-center py-3 px-2 font-medium">Max Marks</th>
                                        <th className="text-center py-3 px-2 font-medium">Percentage</th>
                                        <th className="text-center py-3 px-2 font-medium">Grade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {exam.subjects.map((subject, subIndex) => (
                                        <tr key={subIndex} className="border-b last:border-0">
                                            <td className="py-3 px-2 font-medium">{subject.name}</td>
                                            <td className="text-center py-3 px-2">{subject.marksObtained}</td>
                                            <td className="text-center py-3 px-2">{subject.maxMarks}</td>
                                            <td className="text-center py-3 px-2">
                                                {((subject.marksObtained / subject.maxMarks) * 100).toFixed(1)}%
                                            </td>
                                            <td className="text-center py-3 px-2">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${subject.grade.startsWith("A")
                                                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                                    : subject.grade.startsWith("B")
                                                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                                                    }`}>
                                                    {subject.grade}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-muted/50">
                                        <td className="py-3 px-2 font-bold">Total</td>
                                        <td className="text-center py-3 px-2 font-bold">{exam.totalMarks}</td>
                                        <td className="text-center py-3 px-2 font-bold">{exam.maxTotal}</td>
                                        <td className="text-center py-3 px-2 font-bold">{exam.percentage}%</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
