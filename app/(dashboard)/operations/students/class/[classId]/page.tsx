"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
    ChevronLeft,
    UserPlus,
    Search,
    Filter,
    Download,
    Eye,
    FileEdit,
    Phone,
    User,
    CheckCircle2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data generator for students in a specific class
const generateStudents = (classId: string) => {
    // Determine class details from ID (e.g. "nursery-A" -> Nursery, Section A)
    const [cls, section] = classId.split("-");

    return Array.from({ length: 15 }, (_, i) => ({
        id: `ST${2024001 + i}`,
        rollNo: i + 1,
        name: [
            "Rahul Sharma", "Priya Singh", "Amit Kumar", "Sneha Gupta",
            "Mohit Verma", "Anjali Das", "Vikram Malhotra", "Kavita Reddy",
            "Arjun Nair", "Meera Iyer", "Rohit Patel", "Zara Khan",
            "David Wilson", "Sarah Thomas", "Ishaan Joshi"
        ][i],
        admissionNo: `ADM${20240100 + i}`,
        guardian: [
            "Mr. Sharma", "Mr. Singh", "Mr. Kumar", "Mr. Gupta",
            "Mr. Verma", "Mr. Das", "Mr. Malhotra", "Mr. Reddy",
            "Mr. Nair", "Mr. Iyer", "Mr. Patel", "Mr. Khan",
            "Mr. Wilson", "Mr. Thomas", "Mr. Joshi"
        ][i],
        contact: `+91 98765${43310 + i}`,
        attendance: Math.floor(Math.random() * (100 - 80) + 80) + "%", // 80-100%
        gender: i % 2 === 0 ? "Male" : "Female",
        feeStatus: ["Paid", "Pending", "Partial"][i % 3], // Rotate statuses
        status: "Active"
    }));
};

export default function ClassStudentsPage() {
    const params = useParams();
    const router = useRouter();
    const classId = params.classId as string; // Format: "classId-section"

    const [cls, section] = classId ? classId.split("-") : ["Loading", ""];
    const displayClassName = cls.charAt(0).toUpperCase() + cls.slice(1); // Capitalize

    const students = generateStudents(classId);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.admissionNo.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const feePendingCount = students.filter(s => s.feeStatus !== "Paid").length;
    const boysCount = students.filter(s => s.gender === "Male").length;
    const girlsCount = students.filter(s => s.gender === "Female").length;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header with Back Button */}
            <div className="flex flex-col gap-4">
                <Button
                    variant="ghost"
                    className="w-fit p-0 hover:bg-transparent text-muted-foreground hover:text-foreground no-underline"
                    onClick={() => router.back()}
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back to Classes
                </Button>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight capitalize">
                            {displayClassName === "1" || displayClassName === "2" || displayClassName === "3" ? `Class ${displayClassName}` : displayClassName} - Section {section}
                        </h1>
                        <p className="text-muted-foreground">
                            {students.length} students enrolled
                        </p>
                    </div>
                    <Button className="gap-2">
                        <UserPlus className="h-4 w-4" />
                        Add Student
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold">{students.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Boys</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold text-blue-600">{boysCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Girls</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold text-pink-600">{girlsCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Fee Pending</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold text-orange-600">{feePendingCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or admission number..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" size="sm" className="gap-2 flex-1 sm:flex-none">
                        <Filter className="h-4 w-4" />
                        Filter
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 flex-1 sm:flex-none">
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Students List Table */}
            <Card>
                <div className="rounded-md">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[80px]">Roll</TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>Admission No.</TableHead>
                                <TableHead>Guardian</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead className="text-center">Gender</TableHead>
                                <TableHead className="text-center">Fee Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredStudents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                                        No students found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredStudents.map((student) => (
                                    <TableRow key={student.id} className="hover:bg-muted/5">
                                        <TableCell className="font-medium">{student.rollNo}</TableCell>
                                        <TableCell>
                                            <span className="font-medium">{student.name}</span>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">{student.admissionNo}</TableCell>
                                        <TableCell>{student.guardian}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 text-sm">
                                                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>{student.contact}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className={`text-sm font-medium ${student.gender === 'Male' ? 'text-blue-600' : 'text-pink-600'
                                                }`}>
                                                {student.gender}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary" className={`
                                                ${student.feeStatus === 'Paid' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                                                    student.feeStatus === 'Pending' ? 'bg-orange-100 text-orange-700 hover:bg-orange-100' :
                                                        'bg-blue-100 text-blue-700 hover:bg-blue-100'}
                                            `}>
                                                {student.feeStatus}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 gap-1.5 text-primary hover:text-primary hover:bg-primary/5"
                                                asChild
                                            >
                                                <Link href={`/operations/students/student/${student.id}`}>
                                                    <Eye className="h-3.5 w-3.5" />
                                                    View
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
}
