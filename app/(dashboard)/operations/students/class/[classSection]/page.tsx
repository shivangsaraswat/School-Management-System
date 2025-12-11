import Link from "next/link";
import { requireOperations } from "@/lib/dal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Users,
    UserPlus,
    ArrowLeft,
    Search,
    Download,
    Filter,
    Phone,
    Eye,
    Edit,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Class name mapping
const classNames: Record<string, string> = {
    nursery: "Nursery",
    lkg: "LKG",
    ukg: "UKG",
    "1": "Class 1", "2": "Class 2", "3": "Class 3", "4": "Class 4", "5": "Class 5",
    "6": "Class 6", "7": "Class 7", "8": "Class 8", "9": "Class 9", "10": "Class 10",
    "11": "Class 11", "12": "Class 12",
};

// Mock student data generator
function generateStudents(classId: string, section: string) {
    const firstNames = ["Rahul", "Priya", "Amit", "Neha", "Vikram", "Anjali", "Rohan", "Pooja", "Arjun", "Divya",
        "Karan", "Shreya", "Aditya", "Kavya", "Yash", "Ananya", "Rishabh", "Meera", "Akash", "Ishita"];
    const lastNames = ["Sharma", "Singh", "Kumar", "Gupta", "Patel", "Verma", "Joshi", "Mishra", "Yadav", "Reddy",
        "Nair", "Kapoor", "Malhotra", "Saxena", "Mehta", "Bhatia", "Chauhan", "Thakur", "Roy", "Das"];
    const statuses = ["Paid", "Pending", "Partial", "Overdue"] as const;

    const count = classId === "nursery" ? 28 : classId === "lkg" || classId === "ukg" ? 30 :
        parseInt(classId) <= 5 ? 40 : 45;

    return Array.from({ length: count }, (_, i) => ({
        id: `STU${classId.toUpperCase()}${section}${String(i + 1).padStart(3, '0')}`,
        admissionNumber: `ADM2024${String(i + 100).padStart(4, '0')}`,
        firstName: firstNames[i % 20],
        lastName: lastNames[i % 20],
        rollNumber: i + 1,
        gender: i % 3 === 0 ? "Female" : "Male",
        phone: `+91 98765${String(43210 + i).slice(-5)}`,
        guardianName: `Mr. ${lastNames[(i + 1) % 20]}`,
        guardianPhone: `+91 98765${String(43210 + i + 100).slice(-5)}`,
        feeStatus: statuses[i % 4],
        attendance: Math.floor(Math.random() * 15) + 85,
    }));
}

export default async function ClassStudentsPage({
    params,
}: {
    params: Promise<{ classSection: string }>;
}) {
    await requireOperations();

    const { classSection } = await params;
    const [classId, section] = classSection.split("-");
    const className = classNames[classId] || `Class ${classId}`;
    const students = generateStudents(classId, section);

    const getFeeStatusColor = (status: string) => {
        switch (status) {
            case "Paid": return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
            case "Pending": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
            case "Partial": return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
            case "Overdue": return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="space-y-4 md:space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col gap-3 md:gap-4">
                <Link
                    href="/operations/students"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit text-sm"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Classes
                </Link>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h1 className="text-xl md:text-2xl font-semibold tracking-tight flex items-center gap-2">
                            <Users className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                            {className} {section && `- Section ${section}`}
                        </h1>
                        <p className="text-muted-foreground text-sm md:text-base">
                            {students.length} students enrolled
                        </p>
                    </div>
                    <Button asChild size="sm" className="gap-1.5 h-9 text-sm">
                        <Link href={`/operations/students/add?class=${classId}&section=${section}`}>
                            <UserPlus className="h-4 w-4" />
                            Add Student
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-4 md:p-5">
                        <div className="text-xs md:text-sm font-medium text-muted-foreground">Total Students</div>
                        <div className="text-xl md:text-2xl font-bold mt-1">{students.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 md:p-5">
                        <div className="text-xs md:text-sm font-medium text-muted-foreground">Boys</div>
                        <div className="text-xl md:text-2xl font-bold text-blue-600 mt-1">
                            {students.filter(s => s.gender === "Male").length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 md:p-5">
                        <div className="text-xs md:text-sm font-medium text-muted-foreground">Girls</div>
                        <div className="text-xl md:text-2xl font-bold text-pink-600 mt-1">
                            {students.filter(s => s.gender === "Female").length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 md:p-5">
                        <div className="text-xs md:text-sm font-medium text-muted-foreground">Fee Pending</div>
                        <div className="text-xl md:text-2xl font-bold text-orange-500 mt-1">
                            {students.filter(s => s.feeStatus !== "Paid").length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or admission number..."
                        className="pl-10 h-9 md:h-10 text-sm"
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1.5 h-9 md:h-10 text-sm">
                        <Filter className="h-4 w-4" />
                        <span className="hidden sm:inline">Filter</span>
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5 h-9 md:h-10 text-sm">
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Export</span>
                    </Button>
                </div>
            </div>

            {/* Students Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="text-left py-3 px-4 font-medium text-xs md:text-sm text-muted-foreground">Roll</th>
                                    <th className="text-left py-3 px-4 font-medium text-xs md:text-sm text-muted-foreground">Student</th>
                                    <th className="text-left py-3 px-4 font-medium text-xs md:text-sm text-muted-foreground hidden md:table-cell">Admission No.</th>
                                    <th className="text-left py-3 px-4 font-medium text-xs md:text-sm text-muted-foreground hidden lg:table-cell">Guardian</th>
                                    <th className="text-left py-3 px-4 font-medium text-xs md:text-sm text-muted-foreground hidden lg:table-cell">Contact</th>
                                    <th className="text-center py-3 px-4 font-medium text-xs md:text-sm text-muted-foreground hidden sm:table-cell">Attendance</th>
                                    <th className="text-center py-3 px-4 font-medium text-xs md:text-sm text-muted-foreground">Fee Status</th>
                                    <th className="text-center py-3 px-4 font-medium text-xs md:text-sm text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student) => (
                                    <tr
                                        key={student.id}
                                        className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                                    >
                                        <td className="py-3 px-4">
                                            <span className="font-medium text-sm">{student.rollNumber}</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2 md:gap-3">
                                                <Avatar className="h-8 w-8 md:h-9 md:w-9">
                                                    <AvatarFallback className={`text-xs ${student.gender === "Female" ? "bg-pink-100 text-pink-700" : "bg-blue-100 text-blue-700"}`}>
                                                        {student.firstName[0]}{student.lastName[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium text-sm">{student.firstName} {student.lastName}</div>
                                                    <div className="text-xs text-muted-foreground">{student.gender}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 hidden md:table-cell">
                                            <span className="font-mono text-xs md:text-sm">{student.admissionNumber}</span>
                                        </td>
                                        <td className="py-3 px-4 hidden lg:table-cell">
                                            <div className="text-sm">{student.guardianName}</div>
                                        </td>
                                        <td className="py-3 px-4 hidden lg:table-cell">
                                            <div className="flex items-center gap-1 text-sm">
                                                <Phone className="h-3.5 w-3.5" />
                                                {student.guardianPhone}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-center hidden sm:table-cell">
                                            <span className={`text-sm font-medium ${student.attendance >= 90 ? "text-green-600" :
                                                    student.attendance >= 75 ? "text-yellow-600" : "text-red-600"
                                                }`}>
                                                {student.attendance}%
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getFeeStatusColor(student.feeStatus)}`}>
                                                {student.feeStatus}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-center gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:inline-flex">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </div>
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
