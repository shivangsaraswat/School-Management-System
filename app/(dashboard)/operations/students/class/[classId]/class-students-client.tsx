"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
    ChevronLeft,
    UserPlus,
    Search,
    Filter,
    Download,
    Eye,
    Phone,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { Student } from "@/db/schema";
import { formatClassSection } from "@/lib/utils";

interface StudentWithFeeStatus extends Student {
    feeStatus: string;
}

interface ClassStudentsClientProps {
    className: string;
    section: string;
    academicYear: string;
    students: StudentWithFeeStatus[];
    boysCount: number;
    girlsCount: number;
    feePendingCount: number;
    allSections: string[];
}

export function ClassStudentsClient({
    className,
    section,
    academicYear,
    students,
    boysCount,
    girlsCount,
    feePendingCount,
    allSections,
}: ClassStudentsClientProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");

    const filteredStudents = students.filter(student =>
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getFeeStatusBadge = (status: string) => {
        switch (status) {
            case "paid":
                return <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">Paid</Badge>;
            case "pending":
                return <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100">Pending</Badge>;
            case "partial":
                return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">Partial</Badge>;
            case "overdue":
                return <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-100">Overdue</Badge>;
            default:
                return <Badge variant="secondary">N/A</Badge>;
        }
    };

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
                        <h1 className="text-2xl font-bold tracking-tight">
                            {formatClassSection(className, section, { allSections })}
                        </h1>
                        <p className="text-muted-foreground">
                            {students.length} students enrolled • {academicYear}
                        </p>
                    </div>
                    <Button className="gap-2" asChild>
                        <Link href={`/operations/students/add?class=${encodeURIComponent(className)}&section=${section}`}>
                            <UserPlus className="h-4 w-4" />
                            Add Student
                        </Link>
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
                                        {students.length === 0
                                            ? "No students enrolled in this class yet."
                                            : "No students found matching your search."}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredStudents.map((student, index) => (
                                    <TableRow key={student.id} className="hover:bg-muted/5">
                                        <TableCell className="font-medium">
                                            {student.rollNumber || index + 1}
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium">
                                                {student.firstName} {student.lastName}
                                            </span>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">
                                            {student.admissionNumber}
                                        </TableCell>
                                        <TableCell>{student.guardianName}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 text-sm">
                                                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>{student.guardianPhone}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className={`text-sm font-medium ${student.gender === 'Male' ? 'text-blue-600' : 'text-pink-600'
                                                }`}>
                                                {student.gender}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {getFeeStatusBadge(student.feeStatus)}
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
